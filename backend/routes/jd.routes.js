import { Router } from "express";
import multer from "multer";
import {
    parseJDTextHandler,
    uploadJDHandler,
} from "../controllers/jd.controller.js";

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post("/parse", parseJDTextHandler);
router.post("/upload", upload.single("jdFile"), uploadJDHandler);

export default router;
