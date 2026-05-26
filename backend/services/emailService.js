import nodemailer from "nodemailer";

let transporter = null;
// smtp conn
const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Email service is not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env",
    );
  }

  const info = await getTransporter().sendMail({
    from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`[EMAIL] Sent to ${to} | messageId: ${info.messageId}`);
  return info;
};

export const sendReminder = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"Super Admin" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
    };
    return getTransporter().sendMail(mailOptions);
};

export const sendOtpEmail = async (email, otp) => {
  const subject = "Your Smart Parking password reset code";

  const text = `Your verification code is: ${otp}\n\nThis code expires in 5 minutes. If you didn't request this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">Password reset code</h2>
      <p style="margin: 0 0 24px; line-height: 1.5; color: #555;">
        Use the code below to reset your Smart Parking password.
      </p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a1a1a;">
          ${otp}
        </div>
      </div>
      <p style="margin: 0 0 8px; font-size: 13px; color: #777;">
        This code expires in 5 minutes.
      </p>
      <p style="margin: 0; font-size: 13px; color: #777;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

export const sendSuspensionEmail = async (email, name) => {
  const subject = "Your Smart Parking account has been suspended";
  const supportAddress = process.env.EMAIL_USER;

  const greeting = name ? `Hi ${name},` : "Hi,";

  const text = `${greeting}
 
Your Smart Parking account has been suspended. You will not be able to log in until your account is reactivated.
 
If you believe this was a mistake or would like to request reactivation, please reply to this email and our team will get back to you.
 
Smart Parking Support`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">Account suspended</h2>
      <p style="margin: 0 0 16px; line-height: 1.5; color: #1a1a1a;">
        ${greeting}
      </p>
      <p style="margin: 0 0 16px; line-height: 1.5; color: #555;">
        Your Smart Parking account has been suspended. You will not be able to log in until your account is reactivated.
      </p>
      <div style="background: #fff4e5; border-left: 4px solid #f5a623; border-radius: 4px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1a1a1a;">
          <strong>Need help?</strong> Reply to this email and our team will review your case and respond as soon as possible.
        </p>
      </div>
      <p style="margin: 0; font-size: 13px; color: #777;">
        — Smart Parking Support<br/>
        <a href="mailto:${supportAddress}" style="color: #555; text-decoration: none;">${supportAddress}</a>
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Sent when a super admin reactivates a previously suspended account.
 * Closes the loop on the email conversation that led to reactivation.
 */
export const sendReactivationEmail = async (email, name) => {
  const subject = "Your Smart Parking account has been reactivated";

  const greeting = name ? `Hi ${name},` : "Hi,";

  const text = `${greeting}
 
Good news — your Smart Parking account has been reactivated. You can now log in and access your dashboard as usual.
 
If you have any questions, just reply to this email.
 
Smart Parking Support`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">Account reactivated</h2>
      <p style="margin: 0 0 16px; line-height: 1.5; color: #1a1a1a;">
        ${greeting}
      </p>
      <p style="margin: 0 0 16px; line-height: 1.5; color: #555;">
        Good news — your Smart Parking account has been reactivated. You can now log in and access your dashboard as usual.
      </p>
      <div style="background: #e8f5e9; border-left: 4px solid #2e7d32; border-radius: 4px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1a1a1a;">
          You're all set. Welcome back.
        </p>
      </div>
      <p style="margin: 0; font-size: 13px; color: #777;">
        — Smart Parking Support
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};
