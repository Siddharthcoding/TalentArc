import "dotenv/config";
import nodemailer from 'nodemailer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Returns a configured Nodemailer transporter
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'kampusace@gmail.com';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

/**
 * Helper to get formatted sender address
 */
function getSender(displayName = 'Kampus Ace') {
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'kampusace@gmail.com';
  return `"${displayName}" <${senderEmail}>`;
}

/**
 * Helper to get list of admin recipient emails
 */
function getAdminRecipients() {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return list.length > 0 ? list : ['kampusace@gmail.com'];
}

/**
 * Verify SMTP connection status
 */
export async function verifySmtpConnection() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return {
      connected: false,
      message: 'SMTP_USER or SMTP_PASS is missing in .env. Outgoing emails will be logged only.'
    };
  }
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { connected: true, message: 'SMTP transporter verified successfully.' };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

/**
 * Helper: Reusable Base Email Layout Wrapper
 */
function renderEmailWrapper({ headerTitle = 'Kampus Ace', headerSubtitle = 'KIIT Placement Prep Hub', contentHtml }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1E293B;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0A6C35 0%, #0FA34E 100%); padding: 24px 32px; border-bottom: 3px solid #D7F27A;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                          Kampus<span style="color: #D7F27A;">Ace</span>
                        </h1>
                        <p style="margin: 4px 0 0; color: #DFF5E6; font-size: 13px; font-weight: 500; letter-spacing: 0.2px;">
                          ${headerSubtitle}
                        </p>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background: rgba(215, 242, 122, 0.18); border: 1px solid rgba(215, 242, 122, 0.4); color: #D7F27A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 12px; border-radius: 20px;">
                          Verified Session
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body Content -->
              <tr>
                <td style="padding: 32px 28px;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Modern Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 28px; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="margin: 0 0 8px; color: #64748B; font-size: 12px; line-height: 1.5;">
                    Need help or want to reschedule? Visit <a href="${FRONTEND_URL}/doubts" style="color: #0FA34E; text-decoration: underline; font-weight: 600;">Doubt Sessions</a> on Kampus Ace.
                  </p>
                  <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                    © ${new Date().getFullYear()} Kampus Ace • KIIT University Placement Assistance
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Send booking confirmation with meet link to student (Mentor name replaced with role / company)
 */
export async function sendBookingConfirmation({ to, studentName, sessionTopic, mentor, mentorRole, batch, date, duration, meetLink }) {
  const pass = process.env.SMTP_PASS;
  if (!pass) {
    console.log(`[Email] SMTP_PASS not set — skipping real delivery of booking confirmation to ${to}.`);
    return;
  }

  // Use mentor role / company description instead of mentor name
  const mentorDisplay = mentorRole || (mentor && !mentor.includes('@') ? mentor : 'Verified Placement Mentor');
  const mentorBatchInfo = batch ? `<span style="display:inline-block; margin-left: 6px; color: #64748B; font-size: 12px; font-weight: 500;">(${batch})</span>` : '';

  const contentHtml = `
    <!-- Status Pill -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;">
        ✓ Booking Confirmed
      </span>
    </div>

    <h2 style="margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; line-height: 1.3;">
      Your Doubt Clearing Slot is Locked! 🎉
    </h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
      Hi <strong>${studentName || 'there'}</strong>, you're all set for your upcoming 1-on-1 / small-batch doubt session. Here is your session schedule:
    </p>

    <!-- Session Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px;">Topic / Focus Area</div>
          <div style="font-size: 15px; font-weight: 700; color: #0F172A;">${sessionTopic}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px;">Mentor Profile</div>
          <div style="font-size: 14px; font-weight: 600; color: #0FA34E;">
            👨‍💼 ${mentorDisplay} ${mentorBatchInfo}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px;">Date &amp; Time</div>
          <div style="font-size: 14px; font-weight: 600; color: #0F172A;">📅 ${date}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px;">Session Duration</div>
          <div style="font-size: 14px; font-weight: 600; color: #0F172A;">⏱ ${duration || '60 Mins'}</div>
        </td>
      </tr>
    </table>

    <!-- Meet Link Action Card -->
    ${meetLink ? `
      <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 1.5px solid #86EFAC; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 800; color: #15803D; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
          🔗 Official Google Meet Link
        </div>
        <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(15, 163, 78, 0.25); margin-bottom: 12px;">
          Join Google Meet &rarr;
        </a>
        <div style="font-size: 12px; color: #64748B; word-break: break-all;">
          Or copy URL: <a href="${meetLink}" style="color: #0FA34E; text-decoration: underline;">${meetLink}</a>
        </div>
      </div>
    ` : `
      <div style="background-color: #FEF3C7; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 18px 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400E; font-size: 13.5px; font-weight: 600; line-height: 1.5;">
          ⚡ The mentor is setting up the Google Meet link. It will be emailed to you before the session starts.
        </p>
      </div>
    `}

    <!-- Helpful Preparation Tips -->
    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
        💡 Quick Prep Checklist:
      </div>
      <ul style="margin: 0; padding-left: 20px; color: #64748B; font-size: 13px; line-height: 1.6;">
        <li>Keep your coding questions, tricky problems, or resume sections open.</li>
        <li>Check your microphone and video connection a few minutes before start.</li>
        <li>Join promptly at the scheduled time to maximize 1-on-1 interaction.</li>
      </ul>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Sessions'),
      to,
      subject: `✅ Slot Confirmed: ${sessionTopic}`,
      html: renderEmailWrapper({
        headerTitle: `Slot Confirmed - ${sessionTopic}`,
        contentHtml,
      }),
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
  const pass = process.env.SMTP_PASS;
  if (!pass) {
    console.log(`[Email] SMTP_PASS not set — skipping cancellation notice to ${to}`);
    return;
  }

  const contentHtml = `
    <!-- Status Pill -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;">
        ✕ Booking Cancelled
      </span>
    </div>

    <h2 style="margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; line-height: 1.3;">
      Your Session Booking Was Cancelled
    </h2>
    <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
      Hi <strong>${studentName || 'there'}</strong>, your booking for <strong>${sessionTopic}</strong> has been cancelled and your seat has been released for other students.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 16px; color: #64748B; font-size: 14px;">
        Looking for other upcoming sessions or different topics?
      </p>
      <a href="${FRONTEND_URL}/doubts" target="_blank" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
        Browse Doubt Sessions &rarr;
      </a>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Sessions'),
      to,
      subject: `❌ Booking Cancelled: ${sessionTopic}`,
      html: renderEmailWrapper({
        headerTitle: `Booking Cancelled - ${sessionTopic}`,
        contentHtml,
      }),
    });
    console.log(`[Email] Cancellation notice sent to ${to}`);
  } catch (err) {
    console.error('[Email] Failed to send cancellation email:', err.message);
  }
}

/**
 * Broadcast updated meet link to all enrolled students
 */
export async function broadcastMeetLink({ students, sessionTopic, mentor, mentorRole, batch, date, meetLink }) {
  const pass = process.env.SMTP_PASS;
  if (!pass || !students?.length) return;

  const mentorDisplay = mentorRole || (mentor && !mentor.includes('@') ? mentor : 'Verified Placement Mentor');
  const mentorBatchInfo = batch ? `(${batch})` : '';

  try {
    const transporter = getTransporter();
    for (const student of students) {
      if (!student.email) continue;

      const contentHtml = `
        <!-- Status Pill -->
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background-color: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;">
            🔗 Meet Link Ready
          </span>
        </div>

        <h2 style="margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; line-height: 1.3;">
          Google Meet Link is Live! 🚀
        </h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
          Hi <strong>${student.display_name || 'there'}</strong>, the Google Meet link for your upcoming doubt session is ready.
        </p>

        <!-- Session Recap Box -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
          <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">📚 ${sessionTopic}</div>
          <div style="font-size: 13px; color: #0FA34E; font-weight: 600; margin-bottom: 4px;">👨‍💼 ${mentorDisplay} ${mentorBatchInfo}</div>
          <div style="font-size: 13px; color: #64748B;">📅 ${date}</div>
        </div>

        <!-- Meet Button -->
        <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 1.5px solid #86EFAC; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 20px;">
          <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(15, 163, 78, 0.25); margin-bottom: 12px;">
            Join Google Meet Room &rarr;
          </a>
          <div style="font-size: 12px; color: #64748B; word-break: break-all;">
            Link: <a href="${meetLink}" style="color: #0FA34E; text-decoration: underline;">${meetLink}</a>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: getSender('Kampus Ace Sessions'),
        to: student.email,
        subject: `🔗 Meet Link Ready: ${sessionTopic}`,
        html: renderEmailWrapper({
          headerTitle: `Meet Link Ready - ${sessionTopic}`,
          contentHtml,
        }),
      });
    }
    console.log(`[Email] Meet link broadcast sent to ${students.length} students`);
  } catch (err) {
    console.error('[Email] Broadcast failed:', err.message);
  }
}

/**
 * Notify admin when a new booking comes in
 */
export async function notifyAdminOfBooking({ sessionTopic, studentEmail, studentName, mentorName }) {
  const adminRecipients = getAdminRecipients();
  const pass = process.env.SMTP_PASS;
  if (!pass || adminRecipients.length === 0) return;

  const contentHtml = `
    <!-- Status Pill -->
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background-color: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
        Admin Alert • New Enrollment
      </span>
    </div>

    <h2 style="margin: 0 0 16px; color: #0F172A; font-size: 20px; font-weight: 800;">
      New Session Booking Received 📥
    </h2>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600; width: 120px;">Session:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700;">${sessionTopic}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Mentor:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0FA34E; font-weight: 600;">${mentorName || 'Assigned Mentor'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Student:</td>
        <td style="padding: 14px 18px; font-size: 14px; color: #0F172A; font-weight: 600;">${studentName || 'Student'} (${studentEmail})</td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/doubts" target="_blank" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 8px;">
        Manage Sessions in Admin Panel &rarr;
      </a>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Admin Alerts'),
      to: adminRecipients.join(', '),
      subject: `📥 New Booking: ${sessionTopic} (${studentName || studentEmail})`,
      html: renderEmailWrapper({
        headerTitle: `New Booking - ${sessionTopic}`,
        headerSubtitle: 'Admin Dashboard Notification',
        contentHtml,
      }),
    });
    console.log(`[Email] Booking notification sent to admin (${adminRecipients.join(', ')})`);
  } catch (err) {
    console.error('[Email] Admin notification failed:', err.message);
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
  const adminRecipients = getAdminRecipients();
  const pass = process.env.SMTP_PASS;

  if (!pass || adminRecipients.length === 0) {
    console.log(`[Email] Question contribution logged:`, { companyName, questionTitle, image_url, contributorEmail });
    return;
  }

  try {
    const formattedOptions = Array.isArray(options) && options.length
      ? `
        <div style="margin-top: 14px; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 14px; border-radius: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">MCQ Options:</div>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
            ${options.map((o, idx) => `<li style="${idx === Number(correctOption) ? 'color: #0FA34E; font-weight: 700;' : 'color: #334155;'}">${o} ${idx === Number(correctOption) ? '✓ (Correct Option)' : ''}</li>`).join('')}
          </ol>
        </div>
      `
      : '';

    const formattedImage = image_url
      ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">Question Diagram / Screenshot:</div>
          <div style="text-align: center; background: #FFFFFF; padding: 12px; border-radius: 10px; border: 1px solid #E2E8F0;">
            <img src="${image_url}" alt="Question Image" style="max-width: 100%; max-height: 350px; border-radius: 8px;" />
            <p style="font-size: 11px; margin: 8px 0 0;"><a href="${image_url}" target="_blank" style="color: #0FA34E; text-decoration: underline; font-weight: 600;">Open High-Res Image Link &rarr;</a></p>
          </div>
        </div>
      `
      : '';

    const contentHtml = `
      <!-- Status Pill -->
      <div style="margin-bottom: 16px;">
        <span style="display: inline-block; background-color: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
          Question Submission Review
        </span>
      </div>

      <h2 style="margin: 0 0 12px; color: #0F172A; font-size: 20px; font-weight: 800;">
        New Company Bank Question Submitted ✍️
      </h2>
      <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.5;">
        A student has submitted an interview / OA question from recent campus placement rounds:
      </p>

      <!-- Question Spec Card -->
      <div style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="margin-bottom: 10px;">
          <span style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; margin-right: 6px;">
            ${companyName || 'General'}
          </span>
          <span style="display: inline-block; background-color: #E2E8F0; color: #334155; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px; margin-right: 6px;">
            ${roundType || 'General Round'}
          </span>
          <span style="display: inline-block; background-color: #DBEAFE; color: #1E40AF; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px;">
            ${difficulty || 'Medium'}
          </span>
        </div>

        <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 12px 0 8px;">
          ${questionTitle}
        </div>

        ${questionBody ? `
          <div style="margin-top: 12px; background: #FFFFFF; padding: 14px; border-radius: 8px; border: 1px solid #E2E8F0; font-family: monospace; font-size: 12.5px; line-height: 1.5; color: #1E293B; white-space: pre-wrap;">${questionBody}</div>
        ` : ''}

        ${formattedOptions}
        ${formattedImage}
      </div>

      <!-- Contributor Details -->
      <div style="background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 12.5px; color: #166534;">
        <strong>Contributor:</strong> ${contributorName || 'Student'} (${contributorEmail || 'Anonymous'}) ${contributorBatch ? `• ${contributorBatch}` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/admin/company-bank" target="_blank" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          Review &amp; Approve in Admin Bank &rarr;
        </a>
      </div>
    `;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Review'),
      to: adminRecipients.join(', '),
      subject: `📝 New Question Submission: [${companyName || 'General'}] ${questionTitle}`,
      html: renderEmailWrapper({
        headerTitle: `Question Contribution - ${companyName}`,
        headerSubtitle: 'Company Question Bank Review',
        contentHtml,
      }),
    });
    console.log(`[Email] Question contribution email sent to admin (${adminRecipients.join(', ')})`);
  } catch (err) {
    console.error('[Email] Failed to send question contribution email:', err.message);
  }
}

/**
 * Send Contact / Help inquiry email to Admin
 */
export async function sendContactSupportEmail({ name, email, subject, category, message }) {
  const adminRecipients = getAdminRecipients();
  const pass = process.env.SMTP_PASS;

  if (!pass || adminRecipients.length === 0) {
    console.log(`[Email] Contact support message logged:`, { name, email, subject, category, message });
    return;
  }

  const contentHtml = `
    <!-- Status Pill -->
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background-color: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
        📬 Help &amp; Contact Inquiry
      </span>
    </div>

    <h2 style="margin: 0 0 12px; color: #0F172A; font-size: 20px; font-weight: 800;">
      New Student Support Message 💬
    </h2>
    <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.5;">
      A student has submitted a support inquiry / feedback through the Kampus Ace Help desk:
    </p>

    <!-- Inquiry Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600; width: 130px;">Sender Name:</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700;">${name || 'Anonymous Student'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Email Address:</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0FA34E; font-weight: 600;">
          <a href="mailto:${email}" style="color: #0FA34E; text-decoration: underline;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Category:</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; font-weight: 600;">${category || 'General Support'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Subject:</td>
        <td style="padding: 12px 18px; font-size: 14px; color: #0F172A; font-weight: 700;">${subject || 'No Subject'}</td>
      </tr>
    </table>

    <div style="background-color: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message Content:</div>
      <div style="font-size: 14px; line-height: 1.6; color: #1E293B; white-space: pre-wrap;">${message}</div>
    </div>

    <div style="text-align: center;">
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Kampus Ace Support Request')}" style="display: inline-block; background-color: #0FA34E; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
        Reply to Student &rarr;
      </a>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Support Desk'),
      replyTo: email,
      to: adminRecipients.join(', '),
      subject: `💬 [Support] ${subject || category || 'Student Inquiry'} (${name || email})`,
      html: renderEmailWrapper({
        headerTitle: `Support Message - ${subject || 'Inquiry'}`,
        headerSubtitle: 'Help Desk & Student Contact',
        contentHtml,
      }),
    });
    console.log(`[Email] Contact message delivered to admin (${adminRecipients.join(', ')})`);
  } catch (err) {
    console.error('[Email] Failed to send contact message:', err.message);
  }
}

/**
 * Send Pro Subscription Payment Confirmation Email to User
 */
export async function sendSubscriptionConfirmationEmail({
  email,
  name,
  planName = 'Pro Monthly Pass',
  amount = 49,
  orderId,
  paymentId,
  startDate,
  endDate,
}) {
  if (!email) return;

  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : '30 days from purchase';

  const contentHtml = `
    <div style="margin-bottom: 20px; text-align: center;">
      <span style="display: inline-block; background-color: #DFF5E6; color: #0FA34E; border: 1.5px solid #0FA34E; font-size: 12px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 6px 16px; border-radius: 9999px;">
        👑 Pro Membership Activated
      </span>
    </div>

    <h2 style="margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; text-align: center;">
      Welcome to Kampus Ace Pro, ${name ? name.split(' ')[0] : 'Student'}! 🎉
    </h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
      Your payment of <strong>₹${amount}</strong> was successful. You now have unlimited access to every placement tool for the next 30 days.
    </p>

    <!-- Subscription Summary Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600; width: 140px;">Plan:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0FA34E; font-weight: 800;">${planName}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Amount Paid:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700;">₹${amount}.00 (UPI / Razorpay)</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Valid Until:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0B7C3C; font-weight: 700;">${formattedEnd}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Payment ID:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-family: monospace; color: #64748B;">${paymentId || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Order ID:</td>
        <td style="padding: 14px 18px; font-size: 12px; font-family: monospace; color: #64748B;">${orderId || 'N/A'}</td>
      </tr>
    </table>

    <!-- Unlocked Features List -->
    <div style="background-color: #FFFFFF; border: 1.5px solid #DDF6E8; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0FA34E; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px;">Unlocked Benefits:</div>
      <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 13.5px; line-height: 1.8;">
        <li><strong>Unlimited ATS Resume Scans</strong> — optimize your resume for dream company shortlists.</li>
        <li><strong>Unlimited JD Matching</strong> — find exact skill gaps against any job description.</li>
        <li><strong>Full Company Question Bank Access</strong> — 40+ top recruiter question sets (Microsoft, Amazon, HighRadius, Deloitte).</li>
        <li><strong>Unlimited AI Mock Assessments</strong> — practice timed technical and aptitude tests.</li>
        <li><strong>ATS Resume Builder</strong> — unlimited single-page PDF exports.</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 28px;">
      <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0A6C35 0%, #0FA34E 100%); color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(15, 163, 78, 0.3);">
        Start Practicing on Kampus Ace &rarr;
      </a>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Pro'),
      to: email,
      replyTo: 'kampusace@gmail.com',
      subject: `👑 Pro Activated! Payment Confirmation & Receipt — Kampus Ace (₹${amount})`,
      text: `Welcome to Kampus Ace Pro!\n\nYour payment of ₹${amount}.00 for the Pro Monthly Pass was successful.\nValid Until: ${formattedEnd}\nPayment ID: ${paymentId || 'N/A'}\nOrder ID: ${orderId || 'N/A'}\n\nEnjoy unlimited ATS resume scans, JD matching, company question banks, and AI mock tests.\n\nAccess your dashboard: ${FRONTEND_URL}/dashboard`,
      html: renderEmailWrapper({
        headerTitle: 'Kampus Ace Pro Subscription Confirmation',
        headerSubtitle: 'Pro Membership Receipt & Access Details',
        contentHtml,
      }),
    });
    console.log(`[Email] Pro subscription confirmation email sent to ${email}`);
  } catch (err) {
    console.error('[Email] Failed to send subscription confirmation email:', err.message);
  }
}

/**
 * Send Doubt Session Booking Payment Confirmation Email to User
 */
export async function sendDoubtBookingPaymentConfirmationEmail({
  email,
  name,
  mentor,
  role,
  topic,
  sessionDate,
  duration = '60 Mins',
  meetLink,
  amount = 20,
  orderId,
  paymentId,
}) {
  if (!email) return;

  const contentHtml = `
    <div style="margin-bottom: 20px; text-align: center;">
      <span style="display: inline-block; background-color: #DFF5E6; color: #0FA34E; border: 1.5px solid #0FA34E; font-size: 12px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 6px 16px; border-radius: 9999px;">
        🎓 Slot Confirmed &amp; Paid
      </span>
    </div>

    <h2 style="margin: 0 0 10px; color: #0F172A; font-size: 22px; font-weight: 800; text-align: center;">
      Your Doubt Session is Booked, ${name ? name.split(' ')[0] : 'Student'}! 🚀
    </h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
      Your seat for the live mentor session has been confirmed. Details and Google Meet link are below:
    </p>

    <!-- Session Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600; width: 130px;">Mentor:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 800;">${mentor || 'Placed Alum'} <span style="font-size: 12px; color: #0FA34E; font-weight: 600;">(${role || ''})</span></td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Topic:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700;">${topic || 'Live Doubt Resolution'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Session Date:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0B7C3C; font-weight: 800;">${sessionDate || 'Scheduled Time'}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Duration:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; font-weight: 600;">${duration}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Amount Paid:</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700;">₹${amount}.00 (Paid via UPI)</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Payment Ref:</td>
        <td style="padding: 14px 18px; font-size: 12px; font-family: monospace; color: #64748B;">${paymentId || 'N/A'}</td>
      </tr>
    </table>

    <!-- Meet Link Card -->
    ${meetLink ? `
      <div style="background-color: #EBF8FF; border: 2px solid #3182CE; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; color: #2B6CB0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">🔗 Google Meet Joining Link:</div>
        <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #3182CE; color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-top: 6px;">
          Join Google Meet Call &rarr;
        </a>
        <p style="margin: 8px 0 0; font-size: 11.5px; color: #4A5568;">Link: <a href="${meetLink}" style="color: #3182CE;">${meetLink}</a></p>
      </div>
    ` : `
      <p style="font-size: 13px; color: #475569; text-align: center; margin-bottom: 20px;">
        The Google Meet link will be accessible directly on your Doubt Sessions page 15 minutes before the call.
      </p>
    `}

    <p style="font-size: 12px; color: #64748B; text-align: center; line-height: 1.5; margin: 0;">
      Please join 5 minutes before the session starts with your questions or code queries ready.
    </p>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getSender('Kampus Ace Doubt Sessions'),
      to: email,
      replyTo: 'kampusace@gmail.com',
      subject: `🎓 Slot Booked! Live Mentor Doubt Session with ${mentor || 'Placed Senior'} (₹${amount})`,
      text: `Your doubt session is booked!\n\nMentor: ${mentor || 'Placed Senior'} (${role || ''})\nTopic: ${topic || 'Live Doubt Resolution'}\nDate & Time: ${sessionDate || 'Scheduled Time'}\nDuration: ${duration}\nAmount Paid: ₹${amount}.00\nPayment Ref: ${paymentId || 'N/A'}\n${meetLink ? `Google Meet Link: ${meetLink}` : ''}\n\nPlease join 5 minutes prior to start.`,
      html: renderEmailWrapper({
        headerTitle: 'Doubt Session Booking Confirmation',
        headerSubtitle: 'Live 1-on-1 Placement Mentorship',
        contentHtml,
      }),
    });
    console.log(`[Email] Doubt session booking confirmation email sent to ${email}`);
  } catch (err) {
    console.error('[Email] Failed to send doubt session booking confirmation email:', err.message);
  }
}


