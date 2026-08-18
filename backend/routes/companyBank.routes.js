import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import requiresAccess from "../middleware/requiresAccess.js";
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

const proGate = requiresAccess("company_bank", { noFreeTrial: true });

// ─── Signed-in users (Pro or Admin) ──────────────────────────────────────────
router.get("/companies", isAuthenticated, proGate, listCompanies);
router.get("/companies/:id", isAuthenticated, proGate, getCompany);
router.get("/companies/:id/questions", isAuthenticated, proGate, listCompanyQuestions);
router.post("/contribute", isAuthenticated, contributeQuestion);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.post("/companies", isAuthenticated, isAdmin, createCompany);
router.put("/companies/:id", isAuthenticated, isAdmin, updateCompany);
router.delete("/companies/:id", isAuthenticated, isAdmin, deleteCompany);

router.post("/companies/:id/questions", isAuthenticated, isAdmin, addCompanyQuestion);
router.put("/questions/:qid", isAuthenticated, isAdmin, updateCompanyQuestion);
router.delete("/questions/:qid", isAuthenticated, isAdmin, deleteCompanyQuestion);

export default router;

