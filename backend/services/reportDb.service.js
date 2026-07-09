import crypto from "crypto";
import pool from "../db/pool.js";

export async function saveReport({ userId, reportType, inputData, resultPayload, tempUuid }) {
  const id = crypto.randomUUID();
  const hasTempUuid = !!tempUuid;
  const actualTempUuid = tempUuid || (userId ? null : crypto.randomUUID());

  const { rows } = await pool.query(
    `INSERT INTO reports (id, user_id, report_type, input_data, result_payload, temp_uuid)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, userId || null, reportType, JSON.stringify(inputData), JSON.stringify(resultPayload), actualTempUuid]
  );

  return rows[0];
}

export async function claimReport(tempUuid, userId) {
  const { rows } = await pool.query(
    `UPDATE reports
     SET user_id = $1, claimed_at = NOW(), temp_uuid = NULL
     WHERE temp_uuid = $2 AND user_id IS NULL
     RETURNING *`,
    [userId, tempUuid]
  );

  if (rows.length === 0) {
    const err = new Error("Report not found or already claimed");
    err.status = 404;
    throw err;
  }

  return rows[0];
}

export async function getUserReports(userId, reportType) {
  let query = `SELECT id, report_type, input_data, created_at
               FROM reports WHERE user_id = $1`;
  const params = [userId];

  if (reportType) {
    query += ` AND report_type = $2`;
    params.push(reportType);
  }

  query += ` ORDER BY created_at DESC`;

  const { rows } = await pool.query(query, params);

  return rows.map((r) => ({
    id: r.id,
    reportType: r.report_type,
    inputData: r.input_data,
    createdAt: r.created_at,
  }));
}

export async function getReportById(id, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM reports WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Report not found");
    err.status = 404;
    throw err;
  }

  return rows[0];
}

export async function deleteReport(id, userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM reports WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    const err = new Error("Report not found");
    err.status = 404;
    throw err;
  }
}
