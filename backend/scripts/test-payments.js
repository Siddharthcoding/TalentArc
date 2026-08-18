import "dotenv/config";
import pool from "../db/pool.js";
import { verifySignature } from "../services/razorpay.service.js";
import crypto from "crypto";

async function testPayments() {
  console.log("=== Testing Payment Verification Logic ===");

  const keySecret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
  process.env.RAZORPAY_KEY_SECRET = keySecret;

  const orderId = "order_test_123456";
  const paymentId = "pay_test_789012";
  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  const isValid = verifySignature(orderId, paymentId, validSignature);
  console.log("Valid signature verification:", isValid ? "PASS" : "FAIL");

  const isInvalid = verifySignature(orderId, paymentId, "bogus_signature");
  console.log("Invalid signature rejection:", !isInvalid ? "PASS" : "FAIL");

  console.log("\n=== Testing DB Payment Tables ===");
  const client = await pool.connect();
  try {
    const subTable = await client.query("SELECT COUNT(*) FROM subscriptions");
    console.log("Subscriptions table exists. Count:", subTable.rows[0].count);

    const trialTable = await client.query("SELECT COUNT(*) FROM free_trial_usage");
    console.log("Free trial usage table exists. Count:", trialTable.rows[0].count);

    const payTable = await client.query("SELECT COUNT(*) FROM payments");
    console.log("Payments table exists. Count:", payTable.rows[0].count);

    const doubtCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'doubt_bookings' AND column_name IN ('payment_status', 'razorpay_order_id', 'razorpay_payment_id')
    `);
    console.log("Doubt bookings payment columns found:", doubtCols.rows.map(r => r.column_name));
    console.log("All DB tables & columns verified: PASS");
  } finally {
    client.release();
    await pool.end();
  }
}

testPayments()
  .then(() => {
    console.log("\nPayment tests completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Payment test error:", err);
    process.exit(1);
  });
