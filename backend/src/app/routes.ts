import 'express-async-errors';
import 'reflect-metadata';
import express,{Router} from 'express';


// ─── Controllers ──────────────────────────────────────────────
import { AuthController } from '../controllers/auth.controller';
import { FolderController } from '../controllers/folder.controller';
import { FileController } from '../controllers/file.controller';
import { SubscriptionController } from '../controllers/subscription.controller';
import { AdminController } from '../controllers/admin.controller';


// ─── Routes ───────────────────────────────────────────────────
import { createAuthRouter } from '../routes/auth.routes';
import { createFolderRouter } from '../routes/folder.routes';
import { createFileRouter } from '../routes/file.routes';
import { createSubscriptionRouter } from '../routes/subscription.routes';
import { createAdminRouter } from '../routes/admin.routes';


const router: Router = express.Router();

router.use('/api/auth',          createAuthRouter( new AuthController()));
router.use('/api/folders',       createFolderRouter(new FolderController()));
router.use('/api/files',         createFileRouter(new FileController ()));
router.use('/api/subscriptions', createSubscriptionRouter(new SubscriptionController()));
router.use('/api/admin',         createAdminRouter(new AdminController()));

router.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));


export default router;