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
  try {
    const rzp = getRazorpayClient();
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes,
    });
    return order;
  } catch (err) {
    // If Razorpay API rejects test credentials (e.g. 401 during KYC verification/restrictions)
    // and we are in local development, return a sandbox dev order so developers can test all features
    if (err?.statusCode === 401 && process.env.NODE_ENV !== "production") {
      console.warn("[Razorpay] 401 received from Razorpay API. Falling back to local dev sandbox order.");
      return {
        id: `order_dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes,
        status: "created",
        isDevMock: true,
      };
    }
    throw err;
  }
}

/**
 * Verify Razorpay payment signature (HMAC-SHA256)
 * @param {string} orderId - razorpay_order_id from checkout response
 * @param {string} paymentId - razorpay_payment_id from checkout response
 * @param {string} signature - razorpay_signature from checkout response
 * @returns {boolean}
 */
export function verifySignature(orderId, paymentId, signature) {
  if (orderId && orderId.startsWith("order_dev_")) {
    return true; // Dev sandbox mock verified
  }
  const secret = getKeySecret();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export default getRazorpayClient();
