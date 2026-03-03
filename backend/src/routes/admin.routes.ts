import { Router, Request, Response, NextFunction } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

export function createAdminRouter(controller: AdminController): Router {
  const router = Router();

  const auth = (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next);

  const admin = (req: Request, res: Response, next: NextFunction) =>
    requireAdmin(req as AuthenticatedRequest, res, next);

  router.use(auth, admin);
  router.get('/stats', controller.getDashboardStats);
  router.get('/users', controller.getAllUsers);
  router.post('/packages', controller.createPackage);
  router.put('/packages/:id', controller.updatePackage);
  router.delete('/packages/:id', controller.deletePackage);

  return router;
}
