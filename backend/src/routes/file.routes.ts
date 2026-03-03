import { Router, Request, Response, NextFunction } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

export function createFileRouter(controller: FileController): Router {
  const router = Router();

  const auth = (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next);

  const wrap =
    (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    (req: Request, res: Response) =>
      fn(req as AuthenticatedRequest, res);

  router.use(auth);
  router.get('/', wrap(controller.getAllUserFiles));
  router.get('/folder/:folderId', wrap(controller.getFilesInFolder));
  router.get('/:id', wrap(controller.getFileById));
  router.post('/upload', wrap(controller.uploadFile));
  router.patch('/:id', wrap(controller.renameFile));
  router.delete('/:id', wrap(controller.deleteFile));

  return router;
}
