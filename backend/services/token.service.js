import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET;
const EXPIRY = "7d";

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
  };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
