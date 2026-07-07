import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import jdRoutes from "./routes/jd.routes.js";
import jdMatchRoutes from "./routes/jdMatch.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/jd", jdMatchRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
