/**
 * isAdmin middleware
 * Checks if the authenticated user's email is in the ADMIN_EMAILS env variable.
 * Must be used after isAuthenticated middleware.
 */
export default function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) {
    return res.status(403).json({ error: "No admins configured" });
  }
  if (adminEmails.includes((req.user.email || "").toLowerCase())) {
    return next();
  }
  return res.status(403).json({ error: "Admin access required" });
}
