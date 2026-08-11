import jwt from "jsonwebtoken";
import crypto from "crypto";

const EXPIRY = "7d";
const DEV_SECRET = "talentarc-local-dev-secret";

function isAdminEmail(email) {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes((email || "").toLowerCase());
}

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  console.warn("[Auth] JWT_SECRET is not set. Using a local development fallback secret.");
  return DEV_SECRET;
}

export function resolveAvatarUrl(email, avatarUrl) {
  if (avatarUrl) return avatarUrl;
  if (!email) return null;
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
}

export function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: resolveAvatarUrl(user.email, user.avatar_url),
    isAdmin: isAdminEmail(user.email),
  };
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
