import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import AppError from '@/helpers/app-error';
import Logger from '@/config/logger';

export default class ErrorMiddleware {

  static async pageNotFound(req: Request, res: Response, next: NextFunction): Promise<void> {
    next(new AppError(HttpCode.ERROR_SERVER, HttpMessage.PAGE_NOT_FOUND));
  }

  static async catchErrors(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
    let status = HttpCode.ERROR_CLIENT;
    if (err instanceof AppError) {
      status = (err as AppError).status;
    }
    Logger.error(`${err.message}: ${req.url}`);
    res.status(status).json({
      status: status,
      message: err.message
    });
  }
}