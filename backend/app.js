import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
