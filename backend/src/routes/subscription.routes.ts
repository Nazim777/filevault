import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

export function createSubscriptionRouter(controller: SubscriptionController): Router {
  const router = Router();

  const auth = (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next);

  const wrap =
    (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    (req: Request, res: Response) =>
      fn(req as AuthenticatedRequest, res);

  router.use(auth);
  router.get('/packages', wrap(controller.getAllPackages));
  router.get('/active', wrap(controller.getActiveSub));
  router.get('/history', wrap(controller.getHistory));
  router.post('/select', wrap(controller.selectPackage));

  return router;
}
