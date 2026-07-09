import * as reportDb from "../services/reportDb.service.js";

export async function claimReport(req, res) {
  try {
    const { tempUuid } = req.body;
    if (!tempUuid) {
      return res.status(400).json({ error: "tempUuid is required" });
    }

    const report = await reportDb.claimReport(tempUuid, req.user.id);

    res.json({
      success: true,
      data: {
        id: report.id,
        reportType: report.report_type,
        inputData: report.input_data,
        resultPayload: report.result_payload,
        createdAt: report.created_at,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
}

export async function getUserReports(req, res) {
  try {
    const reportType = req.query.type || null;
    const reports = await reportDb.getUserReports(req.user.id, reportType);

    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getReport(req, res) {
  try {
    const report = await reportDb.getReportById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: {
        id: report.id,
        reportType: report.report_type,
        inputData: report.input_data,
        resultPayload: report.result_payload,
        createdAt: report.created_at,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
}

export async function deleteReport(req, res) {
  try {
    await reportDb.deleteReport(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
}
