import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import Cognito from '@/services/cognito';
import { NextFunction, Request, Response } from 'express';
import AppError from '@/helpers/app-error';

export default class AuthMiddleware {

  static async authenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer')) {
        throw new AppError(HttpCode.ERROR_UNAUTHORIZED, HttpMessage.UNAUTHORIZED);
      }
      const split = authorization?.split(' ');
      if (split?.length !== 2) {
        throw new AppError(HttpCode.ERROR_UNAUTHORIZED, HttpMessage.UNAUTHORIZED);
      }
      const cognito = new Cognito();
      const auth = await cognito.verifyIdToken(split[1]);
      res.locals = { ...res.locals, auth }
      next();

    } catch (err) {
      res.status(HttpCode.ERROR_UNAUTHORIZED).json({
        status: HttpCode.ERROR_UNAUTHORIZED,
        message: HttpMessage.UNAUTHORIZED
      });
    }
  }

}