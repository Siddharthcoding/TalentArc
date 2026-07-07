import fs from "fs";
import { processJDText, processJDFile } from "../services/jdParser.service.js";

const parseJDTextHandler = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                error: "Field 'text' is required and must be a non-empty string",
            });
        }

        const result = processJDText(text);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

const uploadJDHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded",
            });
        }

        const result = await processJDFile(
            req.file.path,
            req.file.originalname
        );

        return res.status(200).json({
            success: true,
            data: {
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                ...result,
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

export { parseJDTextHandler, uploadJDHandler };
