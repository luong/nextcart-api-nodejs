import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction } from 'express';

export default class AppError extends Error {

  status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }

  static handleApiError(err: any, next: NextFunction) {
    console.error(err);
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError(HttpCode.ERROR_SERVER, HttpMessage.ACTION_FAILED));
    }
  }
}