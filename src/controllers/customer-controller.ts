import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import AppError from '@/helpers/app-error';
import prisma from '@/services/prisma';

export default class CustomerController {

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName } = req.body;
      const id = res.locals.auth?.sub;
      const today = new Date();
      if (res.locals.auth?.email != email) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const customer = await prisma.customer.create({
        data: { id, email, firstName, lastName, createdAt: today, updatedAt: today }
      })
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: customer
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await prisma.customer.findUniqueOrThrow({
        where: { id }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: customer
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      let { email, firstName, lastName } = req.body;
      if (res.locals.auth?.sub != id) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.UNAUTHORIZED);
      }
      if (!id || !email || !firstName || !lastName) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const today = new Date();
      await prisma.customer.update({
        where: { id },
        data: { email, firstName, lastName, updatedAt: today }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId } = req.params;
      let { firstName, lastName, phone, address1, address2, city, state, country, isDefault } = req.body;
      if (!customerId || !firstName || !lastName || !phone || !address1 || !city || !state || !country) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const today = new Date();
      const address = await prisma.address.create({
        data: { customerId, firstName, lastName, phone, 
          address1, address2, city, state, country, isDefault, createdAt: today, updatedAt: today }
      })
      if (address.isDefault) {
        await prisma.address.updateMany({
          where: {
            customerId: address.customerId,
            id: { not: address.id }
          },
          data: {
            isDefault: 0
          }
        });
      }
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: address
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId } = req.params;
      const addresses = await prisma.address.findMany({
        where: { customerId }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: addresses
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId, addressId } = req.params;
      let { firstName, lastName, phone, address1, address2, city, state, country, isDefault } = req.body;
      if (!customerId || !firstName || !lastName || !phone || !address1 || !city || !state || !country) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      await prisma.address.update({
        where: {
          id: parseInt(addressId),
          customerId
        },
        data: { firstName, lastName, phone, address1, address2, city, state, country, isDefault }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: {}
      });
      if (isDefault) {
        await prisma.address.updateMany({
          where: {
            customerId,
            id: { not: parseInt(addressId) }
          },
          data: {
            isDefault: 0
          }
        });
      }
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId, addressId } = req.params;
      await prisma.address.delete({
        where: {
          id: parseInt(addressId),
          customerId
        }
      });
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