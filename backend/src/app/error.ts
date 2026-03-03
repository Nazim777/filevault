import { Response, Request, NextFunction } from 'express';

/**
 * ==== Not Found ====
 * @param {express.Request} _req 
 * @param {express.Response} _res 
 * @param {express.NextFunction} next 
 */
// region Not Found Handle
const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
    const error = new Error('Resource Not Found!');
    (error as any).status = 404;
    next(error);
};

/**
 * ==== Error Handler ====
 * @param {Error} error 
 * @param {express.Request} _req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next
 * @returns 
 */
// region Error Handle
const errorHandlerMiddleware = (error: any, _req: Request, res: Response | any, _next: NextFunction) => {
    console.log('I am here who is responsible for error handling');
    if (res.headersSent) {
    return _next(error); // 👈 prevents crash
  }
    const status = (error as any).status || 500;
    const message = error.message || "Something went wrong!";
    return res.status(status).json({ message });
};



export { notFoundMiddleware, errorHandlerMiddleware };