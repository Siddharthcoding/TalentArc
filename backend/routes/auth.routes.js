import { Router } from "express";
import { googleAuth, googleCallback, getMe, logout } from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/me", isAuthenticated, getMe);
router.post("/logout", logout);

export default router;
