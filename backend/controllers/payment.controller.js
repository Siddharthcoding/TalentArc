import pool from "../db/pool.js";
import { createOrder, verifySignature } from "../services/razorpay.service.js";
import {
  sendSubscriptionConfirmationEmail,
  sendDoubtBookingPaymentConfirmationEmail,
} from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";

const PRO_AMOUNT_PAISE = 4900; // ₹49
const DOUBT_AMOUNT_PAISE = 2000; // ₹20

// ─── GET /api/payments/status ─────────────────────────────────────────────────
export async function getPaymentStatus(req, res) {
  try {
    const userId = req.user.id;

    // Active subscription check
    const subRes = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
       ORDER BY end_date DESC LIMIT 1`,
      [userId]
    );

    // Free trial usage per service
    const trialRes = await pool.query(
      `SELECT service FROM free_trial_usage WHERE user_id = $1`,
      [userId]
    );

    const subscription = subRes.rows[0] || null;
    const trialsUsed = trialRes.rows.map((r) => r.service);

    res.json({
      hasPro: !!subscription,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            startDate: subscription.start_date,
            endDate: subscription.end_date,
          }
        : null,
      trialsUsed, // e.g. ['ats', 'jd_match']
    });
  } catch (err) {
    console.error("getPaymentStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── POST /api/payments/create-subscription-order ────────────────────────────
export async function createSubscriptionOrder(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const receipt = `sub_${String(userId).slice(0, 8)}_${Date.now()}`;
    const order = await createOrder(PRO_AMOUNT_PAISE, receipt, {
      userId: String(userId),
      type: "subscription",
      plan: "pro_monthly",
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, ""),
    });
  } catch (err) {
    const errorMsg = err?.error?.description || err?.message || "Failed to create payment order";
    console.error("createSubscriptionOrder error:", err);
    res.status(500).json({ error: errorMsg });
  }
}

// ─── POST /api/payments/verify-subscription ──────────────────────────────────
export async function verifySubscription(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.user.id;

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Deactivate any existing subscription
    await pool.query(
      `UPDATE subscriptions SET status = 'expired' WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Insert new subscription
    await pool.query(
      `INSERT INTO subscriptions (id, user_id, plan, status, start_date, end_date, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        userId,
        "pro_monthly",
        "active",
        startDate.toISOString(),
        endDate.toISOString(),
        razorpay_order_id,
        razorpay_payment_id,
      ]
    );

    // Log payment
    await pool.query(
      `INSERT INTO payments (id, user_id, type, amount, razorpay_order_id, razorpay_payment_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        userId,
        "subscription",
        PRO_AMOUNT_PAISE / 100,
        razorpay_order_id,
        razorpay_payment_id,
        "captured",
      ]
    );

    // Send confirmation email asynchronously
    const userRes = await pool.query(`SELECT email, display_name FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      console.log(`[Payment] Dispatching Pro subscription receipt TO: ${user.email} (User: ${user.display_name})`);
      sendSubscriptionConfirmationEmail({
        email: user.email,
        name: user.display_name || user.email,
        planName: "Pro Monthly Pass",
        amount: PRO_AMOUNT_PAISE / 100,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        startDate,
        endDate,
      }).catch((e) => console.error("Error sending sub confirmation email:", e));
    }

    res.json({ success: true, message: "Pro subscription activated!" });
  } catch (err) {
    console.error("verifySubscription error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── POST /api/payments/create-doubt-order ───────────────────────────────────
export async function createDoubtOrder(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const userId = req.user.id;

    // Check session exists and has available seats
    const sessionRes = await pool.query(
      `SELECT * FROM doubt_sessions WHERE id = $1 AND is_active = true`,
      [sessionId]
    );
    if (sessionRes.rows.length === 0)
      return res.status(404).json({ error: "Session not found or inactive" });

    const session = sessionRes.rows[0];
    if (session.booked_seats >= session.total_seats)
      return res.status(409).json({ error: "Session is fully booked" });

    // Check already booked
    const existingBooking = await pool.query(
      `SELECT id FROM doubt_bookings WHERE session_id = $1 AND user_id = $2`,
      [sessionId, userId]
    );
    if (existingBooking.rows.length > 0)
      return res.status(409).json({ error: "Already booked this session" });

    const receipt = `dbt_${sessionId.slice(0, 8)}_${Date.now()}`;
    const order = await createOrder(DOUBT_AMOUNT_PAISE, receipt, {
      userId: String(userId),
      sessionId: String(sessionId),
      type: "doubt_session",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, ""),
      sessionInfo: {
        mentor: session.mentor,
        topic: session.topic,
        sessionDate: session.session_date,
      },
    });
  } catch (err) {
    const errorMsg = err?.error?.description || err?.message || "Failed to create payment order";
    console.error("createDoubtOrder error:", err);
    res.status(500).json({ error: errorMsg });
  }
}

// ─── POST /api/payments/verify-doubt ─────────────────────────────────────────
export async function verifyDoubtPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId,
    } = req.body;
    const userId = req.user.id;

    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Create booking and increment seat count atomically
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Lock the session row
      const sessionRes = await client.query(
        `SELECT * FROM doubt_sessions WHERE id = $1 AND is_active = true FOR UPDATE`,
        [sessionId]
      );
      if (sessionRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Session not found" });
      }
      const session = sessionRes.rows[0];
      if (session.booked_seats >= session.total_seats) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Session is fully booked" });
      }

      // Insert booking
      await client.query(
        `INSERT INTO doubt_bookings (id, session_id, user_id, payment_status, razorpay_order_id, razorpay_payment_id)
         VALUES ($1, $2, $3, 'paid', $4, $5)
         ON CONFLICT (session_id, user_id) DO NOTHING`,
        [uuidv4(), sessionId, userId, razorpay_order_id, razorpay_payment_id]
      );

      // Increment booked_seats
      await client.query(
        `UPDATE doubt_sessions SET booked_seats = booked_seats + 1 WHERE id = $1`,
        [sessionId]
      );

      // Log payment
      await client.query(
        `INSERT INTO payments (id, user_id, type, reference_id, amount, razorpay_order_id, razorpay_payment_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          userId,
          "doubt_session",
          sessionId,
          DOUBT_AMOUNT_PAISE / 100,
          razorpay_order_id,
          razorpay_payment_id,
          "captured",
        ]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // Send confirmation email asynchronously
    const [userRes, sessionRes] = await Promise.all([
      pool.query(`SELECT email, display_name FROM users WHERE id = $1`, [userId]),
      pool.query(`SELECT * FROM doubt_sessions WHERE id = $1`, [sessionId]),
    ]);

    if (userRes.rows.length > 0 && sessionRes.rows.length > 0) {
      const user = userRes.rows[0];
      const session = sessionRes.rows[0];
      console.log(`[Payment] Dispatching Doubt Session confirmation TO: ${user.email} (User: ${user.display_name})`);
      sendDoubtBookingPaymentConfirmationEmail({
        email: user.email,
        name: user.display_name || user.email,
        mentor: session.mentor,
        role: session.role,
        topic: session.topic,
        sessionDate: session.session_date,
        duration: session.duration,
        meetLink: session.meet_link,
        amount: DOUBT_AMOUNT_PAISE / 100,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }).catch((e) => console.error("Error sending doubt confirmation email:", e));
    }

    res.json({ success: true, message: "Session booked successfully!" });
  } catch (err) {
    console.error("verifyDoubtPayment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
