import { Router } from "express";
import multer from "multer";
import { matchJD } from "../controllers/jdMatch.controller.js";

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post(
    "/match",
    upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "jdFile", maxCount: 1 },
    ]),
    matchJD
);

export default router;
