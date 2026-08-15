import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  listCompanyQuestions,
  addCompanyQuestion,
  updateCompanyQuestion,
  deleteCompanyQuestion,
  contributeQuestion,
} from "../controllers/companyBank.controller.js";

const router = Router();

// ─── Signed-in users ──────────────────────────────────────────────────────────
router.get("/companies", isAuthenticated, listCompanies);
router.get("/companies/:id", isAuthenticated, getCompany);
router.get("/companies/:id/questions", isAuthenticated, listCompanyQuestions);
router.post("/contribute", isAuthenticated, contributeQuestion);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.post("/companies", isAuthenticated, isAdmin, createCompany);
router.put("/companies/:id", isAuthenticated, isAdmin, updateCompany);
router.delete("/companies/:id", isAuthenticated, isAdmin, deleteCompany);

router.post("/companies/:id/questions", isAuthenticated, isAdmin, addCompanyQuestion);
router.put("/questions/:qid", isAuthenticated, isAdmin, updateCompanyQuestion);
router.delete("/questions/:qid", isAuthenticated, isAdmin, deleteCompanyQuestion);

export default router;
