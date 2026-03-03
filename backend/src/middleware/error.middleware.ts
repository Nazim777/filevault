import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    res
      .status(422)
      .json({ message: "Validation error", errors: (err as any).errors });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
}
