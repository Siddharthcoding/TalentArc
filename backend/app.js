import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import jdRoutes from "./routes/jd.routes.js";
import jdMatchRoutes from "./routes/jdMatch.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import companyBankRoutes from "./routes/companyBank.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import migrate from "./db/migrate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, "");

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/jd", jdMatchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/company-bank", companyBankRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/doubt", doubtRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);


migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
