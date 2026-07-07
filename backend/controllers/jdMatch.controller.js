import fs from "fs";
import { processJDText, processJDFile } from "../services/jdParser.service.js";
import processResume from "../services/parser.service.js";
import { runJDMatching, runAsyncMatching } from "../services/jdMatching.service.js";
import aggregateMatchScores from "../services/jdAggregator.service.js";
import { generateJDReportLLM } from "../services/jdReport.service.js";

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

        const syncResults = runJDMatching(
            jdResult,
            resumeResult.structured,
            resumeResult.normalizedText
        );

        const asyncResults = await runAsyncMatching(
            jdResult,
            resumeResult.structured,
            resumeResult.normalizedText,
            syncResults
        );

        const allResults = { ...syncResults, ...asyncResults };

        const aggregated = aggregateMatchScores(allResults);
        const report = await generateJDReportLLM(
            jdResult,
            resumeResult.structured,
            allResults,
            aggregated
        );

        return res.status(200).json({
            success: true,
            data: {
                resume: {
                    fileName: resumeResult.fileName,
                    structured: resumeResult.structured,
                },
                jd: {
                    company: jdResult.company,
                    requiredSkills: jdResult.requiredSkills,
                    preferredSkills: jdResult.preferredSkills,
                    responsibilities: jdResult.responsibilities,
                    experience: jdResult.experience,
                    education: jdResult.education,
                },
                matching: allResults,
                aggregated,
                report,
            },
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
