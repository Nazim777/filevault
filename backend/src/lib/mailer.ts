import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"FileVault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your FileVault email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e40af;margin-bottom:8px">Welcome to FileVault 📁</h2>
        <p style="color:#374151">Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#9ca3af;font-size:12px">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"FileVault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your FileVault password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e40af;margin-bottom:8px">Password Reset 🔑</h2>
        <p style="color:#374151">We received a request to reset your password.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#9ca3af;font-size:12px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`,
  });
}
