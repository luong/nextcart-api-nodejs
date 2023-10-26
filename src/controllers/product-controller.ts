import AppError from '@/helpers/app-error';
import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import prisma from '@/services/prisma';
import Constant from '@/config/constant';
import { ProductStatus } from '@prisma/client';

export default class ProductController {

  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const searchParams: Record<string, any> = {};
      const { name, brandId, prices, page, itemsPerPage, sortBy, sortOrder } = req.query;

      searchParams.status = ProductStatus.Active;
      if (name) {
        searchParams.name = { contains: name };
      }
      if (brandId) {
        searchParams.brandId = parseInt(brandId as string);
      }
      if (prices) {
        const pricesTokens = (prices as string).split('-');
        searchParams.price = {};
        if (pricesTokens[0] !== '') {
          searchParams.price.gte = parseFloat(pricesTokens[0]);
        }
        if (pricesTokens[1] !== '') {
          searchParams.price.gte = parseFloat(pricesTokens[1]);
        }
      }
      
      const orderParams: Record<string, any> = {};
      orderParams[sortBy as string ?? 'id'] = sortOrder as string ?? 'desc';

      const pageValue = parseInt(page as string ?? 1);
      const itemsPerPageValue = parseInt(itemsPerPage as string ?? Constant.PAGINATION_MAX_LIMIT);
      const offset = (pageValue - 1) * itemsPerPageValue;
      const limit = Math.min(itemsPerPageValue, Constant.PAGINATION_MAX_LIMIT);
      
      const products = await prisma.product.findMany({
        where: searchParams,
        orderBy: orderParams,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          quantity: true,
          status: true,
          imageUrl: true,
          brand: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const totalProducts = await prisma.product.count({
        where: searchParams
      });

      let totalItems = totalProducts;
      let totalPages = Math.ceil(totalProducts / limit);
      let currentPage = pageValue;
      let nextPage = pageValue + 1 < totalPages ? pageValue + 1 : null;
      let prevPage = pageValue - 1 > 0 ? pageValue - 1 : null;

      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: {
          items: products,
          pagination: { totalItems, totalPages, currentPage, nextPage, prevPage }
        }
      });

    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Number.isNaN(id)) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const product = await prisma.product.findUnique({
        where: {
          id: parseInt(id)
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          quantity: true,
          status: true,
          imageUrl: true,
          brand: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      if (!product) {
        throw new AppError(HttpCode.ERROR_RESOURCE_NOT_FOUND, HttpMessage.ITEM_NOT_FOUND);
      }
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: product
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async getAllBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await prisma.brand.findMany({
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          name: true
        }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: brands
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

}