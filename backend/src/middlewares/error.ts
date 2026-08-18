import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('🔥 API ERROR:', err);
  void _next;

  const status = err.status ?? 500;

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}

export function createError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export const asyncHandler = (
  fn: RequestHandler,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};