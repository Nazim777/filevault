import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/mailer";
import { RegisterDto } from "../utils/Dto/register.dto";
import { registerSchema } from "../utils/schema/register.schema";
import { LoginDto } from "../utils/Dto/login.dto";
import { loginSchema } from "../utils/schema/login.schema";


export class AuthService {
  private generateToken(id: string): string {
    //@ts-ignore
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  async register(dto: RegisterDto) {
    const body = registerSchema.parse(dto);

    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (exists) throw new AppError("Email already in use", 409);

    const hashed = await bcrypt.hash(body.password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashed,
        emailVerifyToken: verifyToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });

    sendVerificationEmail(body.email, verifyToken).catch(console.error);

    return {
      message: "Registration successful. Please verify your email.",
      user,
    };
  }

  async login(dto: LoginDto) {
    const body = loginSchema.parse(dto);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });
    if (!user) throw new AppError("Invalid or expired verification token", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    return { message: "Email verified successfully" };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpiry: expiry },
      });

      sendPasswordResetEmail(email, resetToken).catch(console.error);
    }

    return { message: "If that email exists, a reset link has been sent." };
  }

  async resetPassword(token: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new AppError("Invalid or expired reset token", 400);

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return { message: "Password reset successful" };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
}
