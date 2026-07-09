import { Router } from "express";
import multer from "multer";
import { matchJD } from "../controllers/jdMatch.controller.js";
import optionalAuth from "../middleware/optionalAuth.js";

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
    optionalAuth,
    matchJD
);

export default router;
