import "dotenv/config";
import Razorpay from "razorpay";
import crypto from "crypto";

function getKeyId() {
  return (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, "");
}

function getKeySecret() {
  return (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^["']|["']$/g, "");
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getKeyId(),
    key_secret: getKeySecret(),
  });
}

/**
 * Create a Razorpay order
 * @param {number} amountInPaise - amount in paise (e.g. 4900 for ₹49)
 * @param {string} receipt - short unique receipt string
 * @param {object} notes - optional metadata stored on the order
 */
export async function createOrder(amountInPaise, receipt, notes = {}) {
  const rzp = getRazorpayClient();
  return rzp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes,
  });
}

/**
 * Verify Razorpay payment signature (HMAC-SHA256)
 * @param {string} orderId - razorpay_order_id from checkout response
 * @param {string} paymentId - razorpay_payment_id from checkout response
 * @param {string} signature - razorpay_signature from checkout response
 * @returns {boolean}
 */
export function verifySignature(orderId, paymentId, signature) {
  const secret = getKeySecret();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export default getRazorpayClient();
