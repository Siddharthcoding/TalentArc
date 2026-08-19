import passport from "../config/passport.js";
import { signToken, resolveAvatarUrl } from "../services/token.service.js";
import pool from "../db/pool.js";

const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, "");
const ALLOWED_FRONTEND_ORIGINS = new Set(
  (process.env.ALLOWED_FRONTEND_ORIGINS || FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
);

function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(value) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

function safeFrontendUrl(origin) {
  if (!origin || typeof origin !== "string") return FRONTEND_URL;
  try {
    const url = new URL(origin);
    const normalized = url.origin;
    return ALLOWED_FRONTEND_ORIGINS.has(normalized) ? normalized : FRONTEND_URL;
  } catch {
    return FRONTEND_URL;
  }
}

function isAdminEmail(email) {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes((email || "").toLowerCase());
}

export function googleAuth(req, res, next) {
  const frontendUrl = safeFrontendUrl(req.query.frontendUrl);
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: encodeState({ frontendUrl }),
  })(req, res, next);
}

export function googleCallback(req, res, next) {
  passport.authenticate("google", { session: false }, (err, user) => {
    const state = decodeState(req.query.state);
    const frontendUrl = safeFrontendUrl(state.frontendUrl);
    if (err || !user) {
      return res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
    const token = signToken(user);
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  })(req, res, next);
}

export async function getMe(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, google_id, email, display_name, avatar_url, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: resolveAvatarUrl(user.email, user.avatar_url),
      createdAt: user.created_at,
      isAdmin: isAdminEmail(user.email),
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function logout(req, res) {
  res.json({ success: true });
}
