import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  getPaymentStatus,
  createSubscriptionOrder,
  verifySubscription,
  createDoubtOrder,
  verifyDoubtPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes require authentication
router.use(isAuthenticated);

router.get("/status", getPaymentStatus);
router.post("/create-subscription-order", createSubscriptionOrder);
router.post("/verify-subscription", verifySubscription);
router.post("/create-doubt-order", createDoubtOrder);
router.post("/verify-doubt", verifyDoubtPayment);

export default router;
