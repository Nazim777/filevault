import { Response } from "express";
import { SubscriptionService } from "../services/subscription.service";
import { AuthenticatedRequest } from "../types";

export class SubscriptionController {
  private readonly subscriptionService: SubscriptionService;
  constructor(
    subscriptionService: SubscriptionService = new SubscriptionService(),
  ) {
    this.subscriptionService = subscriptionService;
  }

  getAllPackages = async (
    _req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const packages = await this.subscriptionService.getAllPackages();
    res.json(packages);
  };

  getActiveSub = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const sub = await this.subscriptionService.getUserActiveSub(req.user.id);
    res.json(sub ?? null);
  };

  getHistory = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const history = await this.subscriptionService.getUserHistory(req.user.id);
    res.json(history);
  };

  selectPackage = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const sub = await this.subscriptionService.selectPackage(
      req.user.id,
      req.body.packageId,
    );
    res.status(201).json(sub);
  };
}
