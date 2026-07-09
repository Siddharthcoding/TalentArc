import fs from "fs";
import processResume from "../services/parser.service.js";
import runATSEvaluation from "../services/ats.service.js";
import computeWeightedScore from "../services/scoring.service.js";
import { generateLLMReport } from "../services/report.service.js";
import * as reportDb from "../services/reportDb.service.js";

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await processResume(req.file.path, req.file.originalname, req.file.mimetype);

        return res.status(200).json({
            success: true,
            data: {
                fileName: result.fileName,
                fileType: result.fileType,
                normalizedText: result.normalizedText,
                rawLength: result.rawText.length,
                normalizedLength: result.normalizedText.length,
                structured: result.structured,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    } finally {
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
    }
};

const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await processResume(req.file.path, req.file.originalname, req.file.mimetype);
        const atsResult = runATSEvaluation(
            result.rawText,
            result.normalizedText,
            result.structured
        );
        const scoring = computeWeightedScore(result.structured, atsResult);
        const report = await generateLLMReport(result.structured, atsResult, scoring);

        const responseData = {
            fileName: result.fileName,
            fileType: result.fileType,
            structured: result.structured,
            ats: atsResult,
            scoring,
            report,
        };

        if (req.user) {
            await reportDb.saveReport({
                userId: req.user.id,
                reportType: "ats",
                inputData: { fileName: result.fileName, fileType: result.fileType },
                resultPayload: responseData,
            });
        } else {
            const saved = await reportDb.saveReport({
                reportType: "ats",
                inputData: { fileName: result.fileName, fileType: result.fileType },
                resultPayload: responseData,
            });
            responseData.tempUuid = saved.temp_uuid;
        }

        return res.status(200).json({
            success: true,
            data: responseData,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    } finally {
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
    }
};

export { uploadResume, analyzeResume };
