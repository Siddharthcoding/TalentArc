import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import jdRoutes from "./routes/jd.routes.js";
import jdMatchRoutes from "./routes/jdMatch.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import migrate from "./db/migrate.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/jd", jdMatchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
