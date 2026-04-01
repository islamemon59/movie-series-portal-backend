import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function subscriptionConfirmationEmail(userName: string, plan: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Welcome to MovieHub Premium!</h1>
      <p>Hi ${userName},</p>
      <p>Your <strong>${plan}</strong> subscription has been activated successfully.</p>
      <p>You now have unlimited access to all premium content on MovieHub.</p>
      <p>Enjoy streaming!</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">MovieHub - Your Movie & Series Rating Portal</p>
    </div>
  `;
}

export function passwordResetEmail(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
}
