import { Router } from "express";
import multer from "multer";
import { uploadResume, analyzeResume } from "../controllers/resume.controller.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;
