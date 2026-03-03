# FileVault — Subscription-Based File Management System

## Architecture

### Backend
- **Pattern**: Class-based Controllers → Services with Dependency Injection
- **Stack**: Node.js · Express.js · TypeScript · Prisma ORM · Neon PostgreSQL
- **Upload**: Busboy streaming (Client → Server → Cloudinary, zero buffer) + SSE progress
- **Auth**: JWT with bcrypt

```
src/
├── index.ts           ← DI bootstrap (instantiate services → inject → mount routes)
├── lib/               ← prisma, cloudinary (stream), mailer, container
├── services/          ← AuthService, SubscriptionService, FolderService, FileService, AdminService
├── controllers/       ← AuthController, FolderController, FileController, SubscriptionController, AdminController
├── routes/            ← Factory functions: createAuthRouter(controller), etc.
├── middleware/        ← auth.middleware, error.middleware
└── types/             ← AuthenticatedRequest, JwtPayload
```

### Frontend
- **Stack**: Next.js 14 · TypeScript · Zustand · Zod · Tailwind CSS
- **Upload UX**: Real-time SSE progress bars per file
- **Auth**: Persisted token with silent re-validation on mount (no logout on refresh)

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env        # fill in your credentials
npx prisma generate
npx prisma db push
npm run db:seed              # admin@filevault.com / admin123
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST/PORT/USER/PASS` | Email credentials |
| `CLIENT_URL` | Frontend URL for email links |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---


## Default Credentials
- **Admin**: admin@filevault.com / admin123
