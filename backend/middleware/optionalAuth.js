import { verifyToken } from "../services/token.service.js";

export default function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const decoded = verifyToken(authHeader.split(" ")[1]);
      req.user = decoded;
    } catch {
    }
  }
  next();
}
