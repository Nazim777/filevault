import { Router, Request, Response, NextFunction } from 'express';
import { FolderController } from '../controllers/folder.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

export function createFolderRouter(controller: FolderController): Router {
  const router = Router();

  const auth = (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next);

  const wrap =
    (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    (req: Request, res: Response) =>
      fn(req as AuthenticatedRequest, res);

  router.use(auth);
  router.get('/', wrap(controller.getFolders));
  router.get('/:id/breadcrumb', wrap(controller.getBreadcrumb));
  router.get('/:id', wrap(controller.getFolderById));
  router.post('/', wrap(controller.createFolder));
  router.patch('/:id', wrap(controller.renameFolder));
  router.delete('/:id', wrap(controller.deleteFolder));

  return router;
}
