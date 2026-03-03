import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import { Request, Response, NextFunction } from 'express';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  const auth = (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/verify-email', controller.verifyEmail);
  router.post('/forgot-password', controller.forgotPassword);
  router.post('/reset-password', controller.resetPassword);
  router.get('/me', auth, (req, res) =>
    controller.getMe(req as AuthenticatedRequest, res)
  );

  return router;
}
