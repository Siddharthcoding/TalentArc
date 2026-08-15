import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send booking confirmation with meet link to student
 */
export async function sendBookingConfirmation({ to, studentName, sessionTopic, mentor, date, duration, meetLink }) {
  if (!process.env.SMTP_USER) {
    console.log('[Email] SMTP not configured - skipping booking confirmation');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Kampus Ace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `✅ Slot Confirmed: ${sessionTopic}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#F6E9D2;padding:32px;border-radius:20px">
          <div style="background:#0FA34E;padding:20px 24px;border-radius:14px;margin-bottom:24px">
            <h1 style="color:#D7F27A;margin:0;font-size:24px;font-weight:900;font-family:serif">Kampus Ace</h1>
            <p style="color:#DFF5E6;margin:4px 0 0;font-size:13px">KIIT Campus Placement Hub</p>
          </div>
          <h2 style="color:#0B7C3C;font-size:22px;margin:0 0 8px">Your slot is confirmed! 🎉</h2>
          <p style="color:#0B7C3C;font-size:14px">Hi <strong>${studentName || 'there'}</strong>,</p>
          <p style="color:#0B7C3C;font-size:14px">You've successfully booked a doubt session. Here are your details:</p>
          <div style="background:#DFF5E6;border:2px solid #0FA34E33;border-radius:14px;padding:18px;margin:16px 0">
            <p style="margin:7px 0;font-size:14px;color:#0B7C3C"><strong>📚 Topic:</strong> ${sessionTopic}</p>
            <p style="margin:7px 0;font-size:14px;color:#0B7C3C"><strong>👨‍🏫 Mentor:</strong> ${mentor}</p>
            <p style="margin:7px 0;font-size:14px;color:#0B7C3C"><strong>📅 Date &amp; Time:</strong> ${date}</p>
            <p style="margin:7px 0;font-size:14px;color:#0B7C3C"><strong>⏱ Duration:</strong> ${duration}</p>
          </div>
          ${meetLink ? `
          <div style="background:#0FA34E;border-radius:14px;padding:18px;margin:16px 0;text-align:center">
            <p style="color:#D7F27A;margin:0 0 10px;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase">🔗 YOUR GOOGLE MEET LINK</p>
            <a href="${meetLink}" style="color:#C6FF3D;font-weight:900;font-size:16px;text-decoration:none;word-break:break-all">${meetLink}</a>
          </div>` : `
          <div style="background:#E8A33D22;border:2px solid #E8A33D44;border-radius:14px;padding:18px;margin:16px 0;text-align:center">
            <p style="color:#E8A33D;margin:0;font-size:13px;font-weight:700">⚡ Meet link will be shared closer to the session date via email.</p>
          </div>`}
          <p style="color:#0B7C3C;font-size:12px;margin-top:24px">Come prepared with your questions. Best of luck! 🌿</p>
          <hr style="border:none;border-top:1px solid #0FA34E22;margin:20px 0" />
          <p style="color:#0B7C3C66;font-size:11px">Kampus Ace — KIIT Placement Prep Hub</p>
        </div>
      `,
    });
    console.log(`[Email] Booking confirmation sent to ${to}`);
  } catch (err) {
    console.error('[Email] Failed to send booking email:', err.message);
  }
}

/**
 * Send cancellation notice to student
 */
export async function sendCancellationNotice({ to, studentName, sessionTopic }) {
  if (!process.env.SMTP_USER) return;
  try {
    await transporter.sendMail({
      from: `"Kampus Ace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `❌ Booking Cancelled: ${sessionTopic}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#F6E9D2;padding:32px;border-radius:20px">
          <div style="background:#0B7C3C;padding:20px 24px;border-radius:14px;margin-bottom:24px">
            <h1 style="color:#D7F27A;margin:0;font-size:24px;font-weight:900">Kampus Ace</h1>
          </div>
          <h2 style="color:#E1584A;font-size:20px;margin:0 0 8px">Booking Cancelled</h2>
          <p style="color:#0B7C3C;font-size:14px">Hi <strong>${studentName || 'there'}</strong>,</p>
          <p style="color:#0B7C3C;font-size:14px">Your booking for <strong>${sessionTopic}</strong> has been cancelled. Your seat has been released for others.</p>
          <p style="color:#0B7C3C;font-size:14px">You can re-book this or any other session anytime from the Doubt Sessions page on Kampus Ace.</p>
        </div>
      `,
    });
    console.log(`[Email] Cancellation notice sent to ${to}`);
  } catch (err) {
    console.error('[Email] Failed to send cancellation email:', err.message);
  }
}

/**
 * Notify admin when a new booking comes in
 */
export async function notifyAdminOfBooking({ sessionTopic, studentEmail, studentName, mentorName }) {
  const adminEmail = process.env.ADMIN_EMAILS;
  if (!process.env.SMTP_USER || !adminEmail) return;
  try {
    await transporter.sendMail({
      from: `"Kampus Ace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `📥 New Booking: ${sessionTopic}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;background:#F6E9D2;padding:24px;border-radius:16px">
          <h2 style="color:#0FA34E;margin:0 0 12px">New Session Booking</h2>
          <p style="color:#0B7C3C;font-size:14px"><strong>Session:</strong> ${sessionTopic}</p>
          <p style="color:#0B7C3C;font-size:14px"><strong>Mentor:</strong> ${mentorName}</p>
          <p style="color:#0B7C3C;font-size:14px"><strong>Student:</strong> ${studentName} (${studentEmail})</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Admin notification failed:', err.message);
  }
}

/**
 * Broadcast updated meet link to all enrolled students
 */
export async function broadcastMeetLink({ students, sessionTopic, mentor, date, meetLink }) {
  if (!process.env.SMTP_USER || !students?.length) return;
  try {
    for (const student of students) {
      await transporter.sendMail({
        from: `"Kampus Ace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: student.email,
        subject: `🔗 Meet Link Updated: ${sessionTopic}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#F6E9D2;padding:32px;border-radius:20px">
            <div style="background:#0FA34E;padding:18px 24px;border-radius:14px;margin-bottom:20px">
              <h1 style="color:#D7F27A;margin:0;font-size:22px;font-weight:900">Kampus Ace</h1>
            </div>
            <h2 style="color:#0B7C3C">Your Meet Link is Ready! 🚀</h2>
            <p style="color:#0B7C3C;font-size:14px">Hi <strong>${student.display_name || 'there'}</strong>, the Google Meet link for your upcoming session is confirmed:</p>
            <p style="color:#0B7C3C;font-size:14px"><strong>📚 Session:</strong> ${sessionTopic}<br/><strong>👨‍🏫 Mentor:</strong> ${mentor}<br/><strong>📅 Date:</strong> ${date}</p>
            <div style="background:#0FA34E;border-radius:14px;padding:18px;margin-top:16px;text-align:center">
              <p style="color:#D7F27A;margin:0 0 8px;font-size:12px;font-weight:900;text-transform:uppercase">🔗 Your Google Meet Link</p>
              <a href="${meetLink}" style="color:#C6FF3D;font-weight:900;font-size:15px;word-break:break-all">${meetLink}</a>
            </div>
          </div>
        `,
      });
    }
    console.log(`[Email] Meet link broadcast sent to ${students.length} students`);
  } catch (err) {
    console.error('[Email] Broadcast failed:', err.message);
  }
}

/**
 * Notify admin when a student contributes a new question to the company bank
 */
export async function sendQuestionContributionEmail({
  companyName,
  questionTitle,
  questionBody,
  roundType,
  questionType,
  difficulty,
  tags,
  options,
  correctOption,
  image_url,
  contributorName,
  contributorEmail,
  contributorBatch
}) {
  const adminEmail = process.env.ADMIN_EMAILS;
  if (!process.env.SMTP_USER || !adminEmail) {
    console.log(`[Email] SMTP or ADMIN_EMAILS not configured. Question contribution logged:`, {
      companyName,
      questionTitle,
      image_url,
      contributorEmail
    });
    return;
  }

  try {
    const formattedOptions = Array.isArray(options) && options.length
      ? `<div style="margin: 8px 0; background: #fff; padding: 10px; border-radius: 8px;"><strong>Options:</strong><ol>${options.map((o, idx) => `<li style="${idx === Number(correctOption) ? 'color:#0FA34E;font-weight:bold;' : ''}">${o} ${idx === Number(correctOption) ? '(Correct)' : ''}</li>`).join('')}</ol></div>`
      : '';

    const formattedImage = image_url
      ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #0FA34E22">
          <strong>Question Diagram / Image URL:</strong>
          <div style="margin: 8px 0; text-align: center; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #0FA34E22;">
            <img src="${image_url}" alt="Contributed Question Image" style="max-width: 100%; max-height: 350px; border-radius: 6px;" />
            <p style="font-size: 11px; margin-top: 6px;"><a href="${image_url}" target="_blank" style="color: #0FA34E; text-decoration: underline;">View Full Resolution Image Link</a></p>
          </div>
        </div>
      `
      : '';

    await transporter.sendMail({
      from: `"Kampus Ace Contributions" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `📝 New Question Contribution: [${companyName || 'General'}] ${questionTitle}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:640px;margin:0 auto;background:#F6E9D2;padding:32px;border-radius:20px;color:#0B7C3C">
          <div style="background:#0FA34E;padding:18px 24px;border-radius:14px;margin-bottom:20px">
            <h1 style="color:#D7F27A;margin:0;font-size:22px;font-weight:900">Kampus Ace</h1>
            <p style="color:#DFF5E6;margin:4px 0 0;font-size:12px">Company Question Bank Contribution</p>
          </div>

          <h2 style="color:#0FA34E;margin-top:0">New Question Submitted for Review ✍️</h2>
          <p style="font-size:14px">A student has submitted a new question from recent placement drive rounds:</p>

          <div style="background:#DFF5E6;border:1.5px solid #0FA34E44;border-radius:12px;padding:18px;margin:16px 0;font-size:13px;line-height:1.6">
            <p style="margin:4px 0"><strong>🏢 Recruiter / Company:</strong> ${companyName || 'Unspecified'}</p>
            <p style="margin:4px 0"><strong>🎯 Placement Round:</strong> ${roundType || 'General OA / Technical'}</p>
            <p style="margin:4px 0"><strong>📌 Title:</strong> ${questionTitle}</p>
            <p style="margin:4px 0"><strong>🏷️ Type & Difficulty:</strong> ${questionType?.toUpperCase() || 'TEXT'} | ${difficulty || 'Medium'}</p>
            ${tags ? `<p style="margin:4px 0"><strong>🏷️ Tags:</strong> ${tags}</p>` : ''}
            
            ${questionBody ? `
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #0FA34E22">
              <strong>Question Body / Code / Prompt:</strong>
              <pre style="background:#fff;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:monospace;font-size:12px;margin:8px 0;border:1px solid #0FA34E22">${questionBody}</pre>
            </div>
            ` : ''}

            ${formattedOptions}
            ${formattedImage}
          </div>

          <div style="background:#F6E9D2;border:1.5px dashed #0FA34E55;border-radius:12px;padding:14px;margin:16px 0;font-size:12px">
            <h3 style="margin:0 0 6px;color:#0FA34E">Contributor Details:</h3>
            <p style="margin:2px 0"><strong>Name:</strong> ${contributorName || 'Anonymous Student'}</p>
            <p style="margin:2px 0"><strong>Email:</strong> ${contributorEmail || 'Not specified'}</p>
            ${contributorBatch ? `<p style="margin:2px 0"><strong>Batch / Branch:</strong> ${contributorBatch}</p>` : ''}
          </div>

          <p style="font-size:12px;color:#0B7C3C88;margin-top:20px">
            You can verify and add this question to the company bank directly from the Kampus Ace Admin Panel (/admin/company-bank).
          </p>
        </div>
      `,
    });
    console.log(`[Email] Question contribution email sent to admin (${adminEmail}) for ${companyName}`);
  } catch (err) {
    console.error('[Email] Failed to send question contribution email:', err.message);
  }
}


