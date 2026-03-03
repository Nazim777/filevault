import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.json(result);
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query as { token: string };
    const result = await this.authService.verifyEmail(token);
    res.json(result);
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.forgotPassword(req.body.email);
    res.json(result);
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;
    const result = await this.authService.resetPassword(token, password);
    res.json(result);
  };

  getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.authService.getMe(req.user.id);
    res.json(result);
  };
}
