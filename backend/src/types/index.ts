import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { id: string; role: string; email: string };
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}
