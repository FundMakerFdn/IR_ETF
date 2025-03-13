import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  
  const status = (err as any).status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack
      })
    }
  });
}
