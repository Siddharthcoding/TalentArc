import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { claimReport, getUserReports, getReport, deleteReport } from "../controllers/reports.controller.js";

const router = Router();

router.post("/claim", isAuthenticated, claimReport);
router.get("/", isAuthenticated, getUserReports);
router.get("/:id", isAuthenticated, getReport);
router.delete("/:id", isAuthenticated, deleteReport);

export default router;
