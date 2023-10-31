import AppError from '@/helpers/app-error';
import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import prisma from '@/services/prisma';

export default class ServerController {

  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: 'hello'
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async ping(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.$queryRaw`SELECT "ok"`;
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: {}
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

}