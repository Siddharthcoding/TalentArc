import pool from "../db/pool.js";
import { sendQuestionContributionEmail } from "../services/email.service.js";

const QUESTION_TYPES = ["text", "mcq", "image"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function validateQuestionPayload(payload) {
  const { type, title, options, correct_option, image_url, difficulty } = payload;

  if (!QUESTION_TYPES.includes(type)) return "type must be text, mcq, or image";
  if (!title || !String(title).trim()) return "title is required";
  if (difficulty && !DIFFICULTIES.includes(difficulty)) return "difficulty must be Easy, Medium, or Hard";

  if (type === "mcq") {
    if (!Array.isArray(options) || options.length < 2) {
      return "MCQ questions must have at least 2 options";
    }

    const correctIndex = Number(correct_option);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      return "correct_option must point to one of the MCQ options";
    }
  }

  if (type === "image") {
    if (!image_url) return "image_url is required for image questions";
    try {
      const url = new URL(image_url);
      if (!["http:", "https:"].includes(url.protocol)) {
        return "image_url must be an http or https link";
      }
    } catch {
      return "image_url must be a valid URL";
    }
  }
  return null;
}

export const listCompanies = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.role, c.description, c.logo_url, c.website, c.created_at,
              COUNT(q.id)::int AS question_count
       FROM companies c
       LEFT JOIN company_questions q ON q.company_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC, c.role ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[CompanyBank] listCompanies error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch companies" });
  }
};

export const getCompany = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.role, c.description, c.logo_url, c.website, c.created_at,
              COUNT(q.id)::int AS question_count
       FROM companies c
       LEFT JOIN company_questions q ON q.company_id = c.id
       WHERE c.id=$1
       GROUP BY c.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Company not found" });

    // Fetch other roles for the same company
    const otherRolesRes = await pool.query(
      `SELECT c.id, c.name, c.role, c.description,
              (SELECT COUNT(*)::int FROM company_questions WHERE company_id = c.id) AS question_count
       FROM companies c
       WHERE LOWER(c.name) = LOWER($1) AND c.id != $2
       ORDER BY c.role ASC`,
      [rows[0].name, req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], other_roles: otherRolesRes.rows } });
  } catch (err) {
    console.error("[CompanyBank] getCompany error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch company" });
  }
};

export const createCompany = async (req, res) => {
  const { name, role, description, logo_url, website } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: "Company name is required" });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ success: false, error: "Role is required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO companies (name, role, description, logo_url, website, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, role, description, logo_url, website, created_at`,
      [name.trim(), role.trim(), description || null, logo_url || null, website || null, req.user?.id || null]
    );
    res.status(201).json({ success: true, data: { ...rows[0], question_count: 0 } });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, error: "A recruiter entry for this company and role already exists" });
    }
    console.error("[CompanyBank] createCompany error:", err);
    res.status(500).json({ success: false, error: "Failed to create company" });
  }
};

export const updateCompany = async (req, res) => {
  const { name, role, description, logo_url, website } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: "Company name is required" });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ success: false, error: "Role is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE companies
       SET name=$1, role=$2, description=$3, logo_url=$4, website=$5
       WHERE id=$6
       RETURNING id, name, role, description, logo_url, website, created_at`,
      [name.trim(), role.trim(), description || null, logo_url || null, website || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Company not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, error: "A recruiter entry for this company and role already exists" });
    }
    console.error("[CompanyBank] updateCompany error:", err);
    res.status(500).json({ success: false, error: "Failed to update company" });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM companies WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: "Company not found" });
    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    console.error("[CompanyBank] deleteCompany error:", err);
    res.status(500).json({ success: false, error: "Failed to delete company" });
  }
};

export const listCompanyQuestions = async (req, res) => {
  const { id } = req.params;
  const { type, difficulty, tag, search } = req.query;
  const conditions = ["company_id = $1"];
  const values = [id];
  let idx = 2;

  if (type) {
    conditions.push(`type = $${idx++}`);
    values.push(type);
  }
  if (difficulty) {
    conditions.push(`difficulty = $${idx++}`);
    values.push(difficulty);
  }
  if (tag) {
    conditions.push(`$${idx++} = ANY(tags)`);
    values.push(tag);
  }
  if (search) {
    conditions.push(`(title ILIKE $${idx} OR body ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  try {
    const company = await pool.query("SELECT id FROM companies WHERE id=$1", [id]);
    if (!company.rows.length) return res.status(404).json({ success: false, error: "Company not found" });

    const { rows } = await pool.query(
      `SELECT id, type, title, body, options, correct_option, image_url, tags, difficulty, created_at
       FROM company_questions
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC`,
      values
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[CompanyBank] listCompanyQuestions error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch questions" });
  }
};

export const addCompanyQuestion = async (req, res) => {
  const { id } = req.params;
  const { type, title, body, options, correct_option, image_url, tags, difficulty } = req.body;
  const validationError = validateQuestionPayload(req.body);
  if (validationError) return res.status(400).json({ success: false, error: validationError });

  try {
    const company = await pool.query("SELECT id FROM companies WHERE id=$1", [id]);
    if (!company.rows.length) return res.status(404).json({ success: false, error: "Company not found" });

    const normalizedTags = normalizeTags(tags);
    const { rows } = await pool.query(
      `INSERT INTO company_questions
         (company_id, type, title, body, options, correct_option, image_url, tags, difficulty, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, type, title, body, options, correct_option, image_url, tags, difficulty, created_at`,
      [
        id,
        type,
        title.trim(),
        body || null,
        options ? JSON.stringify(options) : null,
        correct_option !== undefined ? Number(correct_option) : null,
        image_url || null,
        normalizedTags.length ? normalizedTags : null,
        difficulty || "Medium",
        req.user?.id || null,
      ]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("[CompanyBank] addCompanyQuestion error:", err);
    res.status(500).json({ success: false, error: "Failed to add question" });
  }
};

export const updateCompanyQuestion = async (req, res) => {
  const { qid } = req.params;
  const { type, title, body, options, correct_option, image_url, tags, difficulty } = req.body;
  const validationError = validateQuestionPayload(req.body);
  if (validationError) return res.status(400).json({ success: false, error: validationError });

  try {
    const normalizedTags = normalizeTags(tags);
    const { rows } = await pool.query(
      `UPDATE company_questions
       SET type=$1, title=$2, body=$3, options=$4, correct_option=$5,
           image_url=$6, tags=$7, difficulty=$8
       WHERE id=$9
       RETURNING id, type, title, body, options, correct_option, image_url, tags, difficulty, created_at`,
      [
        type,
        title.trim(),
        body || null,
        options ? JSON.stringify(options) : null,
        correct_option !== undefined ? Number(correct_option) : null,
        image_url || null,
        normalizedTags.length ? normalizedTags : null,
        difficulty || "Medium",
        qid,
      ]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Question not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("[CompanyBank] updateCompanyQuestion error:", err);
    res.status(500).json({ success: false, error: "Failed to update question" });
  }
};

export const deleteCompanyQuestion = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM company_questions WHERE id=$1", [req.params.qid]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: "Question not found" });
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    console.error("[CompanyBank] deleteCompanyQuestion error:", err);
    res.status(500).json({ success: false, error: "Failed to delete question" });
  }
};

/**
 * Handle student question contribution submission
 */
export const contributeQuestion = async (req, res) => {
  try {
    const {
      companyName,
      companyId,
      role,
      targetRole,
      roundType,
      questionTitle,
      questionType = "text",
      difficulty = "Medium",
      questionBody,
      options,
      correctOption,
      image_url,
      tags,
      contributorName,
      contributorEmail,
      contributorBatch,
    } = req.body;

    if (!questionTitle || !String(questionTitle).trim()) {
      return res.status(400).json({ success: false, error: "Question title is required." });
    }

    let resolvedCompanyName = companyName;
    let resolvedRole = role || targetRole || "";
    if (companyId) {
      const companyRes = await pool.query(`SELECT name, role FROM companies WHERE id = $1`, [companyId]);
      if (companyRes.rows.length) {
        resolvedCompanyName = companyRes.rows[0].name;
        resolvedRole = resolvedRole || companyRes.rows[0].role || "";
      }
    }

    const studentName = contributorName || req.user?.displayName || "Student Contributor";
    const studentEmail = contributorEmail || req.user?.email || "anonymous@kiit.ac.in";

    // Trigger non-blocking admin notification email
    sendQuestionContributionEmail({
      companyName: resolvedCompanyName,
      role: resolvedRole,
      questionTitle: questionTitle.trim(),
      questionBody: questionBody?.trim() || "",
      roundType: roundType || "Online Assessment / Technical Round",
      questionType,
      difficulty,
      tags: typeof tags === "string" ? tags : Array.isArray(tags) ? tags.join(", ") : "",
      options: Array.isArray(options) ? options : [],
      correctOption,
      image_url: image_url?.trim() || null,
      contributorName: studentName,
      contributorEmail: studentEmail,
      contributorBatch: contributorBatch || "KIIT Student",
    }).catch((err) => {
      console.error("[CompanyBank] Background email dispatch failed:", err);
    });

    res.json({
      success: true,
      message: "Thank you! Your question contribution has been submitted. The admin team will review and publish it to the company bank.",
    });
  } catch (err) {
    console.error("[CompanyBank] contributeQuestion error:", err);
    res.status(500).json({ success: false, error: "Failed to process question contribution." });
  }
};
