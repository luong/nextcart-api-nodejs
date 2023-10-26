import AppError from '@/helpers/app-error';
import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import Cognito from '@/services/cognito';

export default class AuthController {

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const cognito = new Cognito();
      const result = await cognito.auth(email, password);
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: result
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

}