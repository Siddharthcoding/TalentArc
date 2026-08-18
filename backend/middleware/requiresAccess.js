import pool from "../db/pool.js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

/**
 * Access gate middleware factory.
 *
 * @param {string} serviceName  One of: 'ats' | 'jd_match' | 'mock_test' | 'company_bank'
 * @param {object} [options]
 * @param {boolean} [options.noFreeTrial]  If true, no free trial allowed (Pro-only)
 *
 * Logic:
 *  1. Admins → always pass through
 *  2. Active Pro subscription → pass through
 *  3. If noFreeTrial → block with 402
 *  4. Free trial not yet used → pass through + mark as used
 *  5. Otherwise → 402 Payment Required
 */
export default function requiresAccess(serviceName, options = {}) {
  return async function (req, res, next) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Authentication required" });

      // Admins bypass everything
      if (isAdmin(user.email)) return next();

      const userId = user.id;

      // Check active Pro subscription
      const subRes = await pool.query(
        `SELECT id FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
         LIMIT 1`,
        [userId]
      );
      if (subRes.rows.length > 0) return next();

      // Pro-only service — no free trial
      if (options.noFreeTrial) {
        return res.status(402).json({
          error: "Pro subscription required",
          reason: "pro_required",
          service: serviceName,
        });
      }

      // Check free trial usage
      const trialRes = await pool.query(
        `SELECT id FROM free_trial_usage WHERE user_id = $1 AND service = $2`,
        [userId, serviceName]
      );

      if (trialRes.rows.length > 0) {
        // Trial already used — payment required
        return res.status(402).json({
          error: "Free trial already used. Upgrade to Pro for unlimited access.",
          reason: "trial_exhausted",
          service: serviceName,
        });
      }

      // First time — record trial usage then proceed
      await pool.query(
        `INSERT INTO free_trial_usage (user_id, service) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, serviceName]
      );

      // Tag the request so we can optionally inform the user it was their free trial
      req.usedFreeTrial = true;
      req.freeTrialService = serviceName;
      next();
    } catch (err) {
      console.error("requiresAccess middleware error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
