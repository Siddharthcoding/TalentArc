import { Router } from "express";
import multer from "multer";
import { uploadResume, analyzeResume } from "../controllers/resume.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import requiresAccess from "../middleware/requiresAccess.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post("/upload", upload.single("resume"), uploadResume);
// analyze requires auth + free-trial-or-pro gate
router.post("/analyze", upload.single("resume"), isAuthenticated, requiresAccess("ats"), analyzeResume);

export default router;
