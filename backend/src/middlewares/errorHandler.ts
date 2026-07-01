import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: any[];
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err);

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let errors: any[] | undefined;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'CAST_ERROR';
  }

  // Handle duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0];
    message = `${field} already exists`;
    code = 'DUPLICATE_ERROR';
  }

  const response: ErrorResponse = {
    success: false,
    message,
    code,
    errors,
  };

  // Include stack trace in development
  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
};
