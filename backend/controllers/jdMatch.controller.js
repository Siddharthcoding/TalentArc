import fs from "fs";
import { processJDText, processJDFile } from "../services/jdParser.service.js";
import processResume from "../services/parser.service.js";
import { runJDMatching, runAsyncMatching } from "../services/jdMatching.service.js";
import aggregateMatchScores from "../services/jdAggregator.service.js";
import { generateJDReportLLM } from "../services/jdReport.service.js";
import enhanceJD from "../services/jdEnhancer.service.js";
import * as reportDb from "../services/reportDb.service.js";

const matchJD = async (req, res) => {
    try {
        const resumeFile = req.files?.resume?.[0];
        if (!resumeFile) {
            return res.status(400).json({
                success: false,
                error: "Resume file is required (field: 'resume')",
            });
        }

        const resumeResult = await processResume(
            resumeFile.path,
            resumeFile.originalname,
            resumeFile.mimetype
        );

        const jdText = req.body?.jdText;
        const jdFile = req.files?.jdFile?.[0];

        let jdResult;
        if (jdText && typeof jdText === "string" && jdText.trim()) {
            jdResult = processJDText(jdText);
        } else if (jdFile) {
            jdResult = await processJDFile(jdFile.path, jdFile.originalname);
        } else {
            return res.status(400).json({
                success: false,
                error: "JD text (field: 'jdText') or JD file (field: 'jdFile') is required",
            });
        }

        const jdEnhanced = await enhanceJD(jdResult.rawText || "", jdResult);

        const syncResults = runJDMatching(
            jdEnhanced,
            resumeResult.structured,
            resumeResult.normalizedText
        );

        const asyncResults = await runAsyncMatching(
            jdEnhanced,
            resumeResult.structured,
            resumeResult.normalizedText,
            syncResults
        );

        const allResults = { ...syncResults, ...asyncResults };

        const aggregated = aggregateMatchScores(allResults);
        const report = await generateJDReportLLM(
            jdEnhanced,
            resumeResult.structured,
            allResults,
            aggregated
        );

        const responseData = {
            resume: {
                fileName: resumeResult.fileName,
                structured: resumeResult.structured,
            },
            jd: {
                company: jdEnhanced.company,
                requiredSkills: jdEnhanced.requiredSkills,
                preferredSkills: jdEnhanced.preferredSkills,
                responsibilities: jdEnhanced.responsibilities,
                experience: jdEnhanced.experience,
                education: jdEnhanced.education,
            },
            matching: allResults,
            aggregated,
            report,
        };

        if (req.user) {
            await reportDb.saveReport({
                userId: req.user.id,
                reportType: "jd_match",
                inputData: {
                    resumeFileName: resumeResult.fileName,
                    company: jdEnhanced.company,
                },
                resultPayload: responseData,
            });
        } else {
            const saved = await reportDb.saveReport({
                reportType: "jd_match",
                inputData: {
                    resumeFileName: resumeResult.fileName,
                    company: jdEnhanced.company,
                },
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
        const paths = [];
        if (req.files?.resume?.[0]?.path) paths.push(req.files.resume[0].path);
        if (req.files?.jdFile?.[0]?.path) paths.push(req.files.jdFile[0].path);
        for (const p of paths) {
            fs.unlink(p, () => {});
        }
    }
};

export { matchJD };
