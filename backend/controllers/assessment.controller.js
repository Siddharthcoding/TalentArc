import * as assessmentService from "../services/assessment.service.js";

export async function createAssessment(req, res) {
  try {
    const { inputType, inputValue, difficulty, questionCount, durationSeconds } = req.body;

    if (!inputType) {
      return res.status(400).json({ error: "Missing required parameter: inputType" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to create assessments" });
    }

    const data = await assessmentService.createAssessment(req.user.id, {
      inputType,
      inputValue,
      difficulty: difficulty || "Medium",
      questionCount: questionCount || 10,
      durationSeconds: durationSeconds || 600,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("[Controller] createAssessment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function submitAssessment(req, res) {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing assessment ID parameter" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to submit assessments" });
    }

    const data = await assessmentService.submitAssessment(id, req.user.id, answers);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Controller] submitAssessment error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getAssessment(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing assessment ID parameter" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to retrieve assessment details" });
    }

    const data = await assessmentService.getAssessmentReport(id, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Controller] getAssessment error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getUserAssessments(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to view assessment history" });
    }

    const data = await assessmentService.getUserAssessments(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Controller] getUserAssessments error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateFullscreenViolations(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing assessment ID parameter" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to update violations" });
    }

    const data = await assessmentService.incrementFullscreenViolations(id, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[Controller] updateFullscreenViolations error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteAssessment(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing assessment ID parameter" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required to delete assessments" });
    }

    await assessmentService.deleteAssessment(id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Controller] deleteAssessment error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
