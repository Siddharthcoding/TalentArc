import express from "express";
import { sendContactSupportEmail } from "../services/email.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, error: "Email address is required." });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: "Message content cannot be empty." });
    }

    // Trigger non-blocking email to admins
    sendContactSupportEmail({
      name: name?.trim() || "Anonymous Student",
      email: email.trim(),
      subject: subject?.trim() || "General Support Inquiry",
      category: category || "General Support",
      message: message.trim(),
    }).catch((err) => {
      console.error("[ContactRoute] Email sending error:", err);
    });

    res.json({
      success: true,
      message: "Thank you! Your message has been received. Our team will get back to you shortly.",
    });
  } catch (err) {
    console.error("[ContactRoute] Error handling contact form:", err);
    res.status(500).json({ success: false, error: "Failed to send message. Please try again." });
  }
});

export default router;
