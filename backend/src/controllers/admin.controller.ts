import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";

export class AdminController {
  private readonly adminService: AdminService;
  constructor(adminService: AdminService = new AdminService()) {
    this.adminService = adminService;
  }

  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.adminService.getDashboardStats();
    res.json(stats);
  };

  getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.adminService.getAllUsers();
    res.json(users);
  };

  createPackage = async (req: Request, res: Response): Promise<void> => {
    const pkg = await this.adminService.createPackage(req.body);
    res.status(201).json(pkg);
  };

  updatePackage = async (req: Request, res: Response): Promise<void> => {
    const pkg = await this.adminService.updatePackage(req.params.id, req.body);
    res.json(pkg);
  };

  deletePackage = async (req: Request, res: Response): Promise<void> => {
    const result = await this.adminService.deletePackage(req.params.id);
    res.json(result);
  };
}
