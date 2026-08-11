import { Router } from "express";
import {
  createAssessment,
  getUserAssessments,
  getAssessment,
  submitAssessment,
  updateFullscreenViolations,
  deleteAssessment,
} from "../controllers/assessment.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.post("/", isAuthenticated, createAssessment);
router.get("/", isAuthenticated, getUserAssessments);
router.get("/:id", isAuthenticated, getAssessment);
router.post("/:id/submit", isAuthenticated, submitAssessment);
router.post("/:id/violations", isAuthenticated, updateFullscreenViolations);
router.delete("/:id", isAuthenticated, deleteAssessment);

export default router;
