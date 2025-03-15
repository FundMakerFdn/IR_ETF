import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${err.message}`);
  res.status(statusCode).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
  });
};