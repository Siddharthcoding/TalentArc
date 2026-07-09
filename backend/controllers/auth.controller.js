import passport from "../config/passport.js";
import { signToken, resolveAvatarUrl } from "../services/token.service.js";
import pool from "../db/pool.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export function googleAuth(req, res, next) {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
}

export function googleCallback(req, res, next) {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/auth/callback?error=auth_failed`);
    }
    const token = signToken(user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
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
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function logout(req, res) {
  res.json({ success: true });
}
