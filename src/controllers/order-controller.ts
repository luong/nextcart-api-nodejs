import HttpCode from '@/config/http-code';
import HttpMessage from '@/config/http-message';
import { NextFunction, Request, Response } from 'express';
import AppError from '@/helpers/app-error';
import prisma from '@/services/prisma';
import Constants from '@/config/constant';
import { CartItem, CouponScope, CouponStatus, CouponValueType, OrderStatus, Product, ProductStatus } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

type OrderRequest = {
  cartItems: Array<CartItem>,
  addressId: number,
  couponCode?: string
};

export default class OrderController {

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const { productId, quantity }: CartItem = req.body;
      if (!customerId || !productId || !(quantity! > 0)) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      await prisma.customer.findUniqueOrThrow({
        where: { id: customerId }
      });
      const cartItem = await prisma.cartItem.findFirst({
        where: { customerId, productId }
      });
      let quantityAcc = quantity ?? 0;
      if (cartItem) {
        quantityAcc += cartItem.quantity;
      }
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: productId, status: ProductStatus.Active }
      });
      if (quantityAcc > product.quantity!) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.PRODUCT_OUT_STOCK);
      }
      const today = new Date();
      await prisma.cartItem.upsert({
        where: { id: cartItem?.id || 0 },
        create: { customerId, productId, quantity: quantityAcc, createdAt: today, updatedAt: today },
        update: { quantity: quantityAcc, updatedAt: today }
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

  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId } = req.params;
      let cartItems = await prisma.cartItem.findMany({
        where: { customerId },
        select: {
          productId: true,
          quantity: true,
          product: {
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
          }
        }
      });
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: cartItems
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId, cartItemId } = req.params;
      let { quantity } = req.body;
      quantity = parseInt(quantity);
      if (!(quantity > 0)) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const today = new Date();
      await prisma.cartItem.update({
        where: { id: parseInt(cartItemId), customerId },
        data: { quantity: parseInt(quantity), updatedAt: today }
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

  static async deleteCart(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId, cartItemId } = req.params;
      await prisma.cartItem.delete({
        where: { id: parseInt(cartItemId), customerId },
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

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId } = req.params;
      const { cartItems, addressId, couponCode }: OrderRequest = req.body;
      if (!cartItems || !addressId) {
        throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
      }
      const customer = await prisma.customer.findFirstOrThrow({
        where: { id: res.locals.auth?.sub }
      });
      if (customerId != customer.id) {
        throw new AppError(HttpCode.ERROR_UNAUTHORIZED, HttpMessage.UNAUTHORIZED);
      }

      const address = await prisma.address.findUniqueOrThrow({
        where: { id: addressId }
      });

      let originalSubtotal = 0;
      let originalShipping = Constants.SHIPPING_COST;
      let originalTotal = 0;
      let subtotal = 0;
      let coupon = 0;
      let shipping;
      let total = 0;
      let status = OrderStatus.Pending;
      const today = new Date();
      const productMap: Record<number, Product> = {}

      for (let cartItem of cartItems) {
        const product = await prisma.product.findFirstOrThrow({
          where: { id: cartItem.productId, status: ProductStatus.Active }
        });
        if (!(cartItem?.quantity > 0) || cartItem?.quantity > product?.quantity) {
          throw new AppError(HttpCode.ERROR_CLIENT, HttpMessage.VALIDATION_FAILED);
        }
        productMap[product.id] = product;
        originalSubtotal += (product.price * cartItem.quantity);
      }

      subtotal = originalSubtotal;
      shipping = originalShipping;

      let couponObj = null;
      if (couponCode) {
        couponObj = await prisma.coupon.findFirstOrThrow({
          where: { name: couponCode, status: CouponStatus.Active }
        });
        const couponValue = couponObj.value ?? 0;
        if (couponObj.scope == CouponScope.Subtotal) {
          if (couponObj.valueType = CouponValueType.Fixed) {
            coupon = Math.min(subtotal, couponValue);
          } else if (couponObj.valueType == CouponValueType.Percentage) {
            coupon = Math.min(subtotal, couponValue * subtotal);
          }
          subtotal = originalSubtotal - coupon;
        } else if (couponObj.scope == CouponScope.Shipping) {
          if (couponObj.valueType = CouponValueType.Fixed) {
            coupon = Math.min(shipping, couponValue);
          } else if (couponObj.valueType = CouponValueType.Percentage) {
            coupon = Math.min(shipping, couponValue * shipping);
          }
          shipping = originalShipping - coupon;
        }
      }

      originalTotal = originalSubtotal + originalShipping;
      total = subtotal + shipping;

      const promises = [];
      const orderId = createId();

      const order = prisma.order.create({
        data: { id: orderId, customerId: customer?.id, originalSubtotal, originalShipping, originalTotal, subtotal, coupon, shipping, total, status, shippingAddress: address, createdAt: today, updatedAt: today }
      });
      promises.push(order);

      for (let cartItem of cartItems) {
        const product = productMap[cartItem.productId];
        const price = product.price;
        const quantity = cartItem.quantity;
        const priceSet = price * quantity;
        const orderItem = prisma.orderItem.create({
          data: { orderId, productId: product.id, price, quantity, priceSet, createdAt: today, updatedAt: today }
        });
        promises.push(orderItem);

        // Update cart items
        const cartItemRef = await prisma.cartItem.findFirst({
          where: { productId: cartItem.productId }
        });
        if (cartItemRef) {
          const newQuantity = cartItemRef.quantity - quantity
          if (newQuantity > 0) {
            const updateCartItem = prisma.cartItem.update({
              where: { id: cartItemRef.id },
              data: { quantity: newQuantity }
            });
            promises.push(updateCartItem);
          } else {
            const deleteCartItem = prisma.cartItem.delete({
              where: { id: cartItemRef.id }
            });
            promises.push(deleteCartItem);
          }
        }

        // Update product inventory
        const newQuantity = product?.quantity - cartItem?.quantity;
        let productStatus = product.status;
        if (newQuantity <= 0) {
          productStatus = ProductStatus.Archieved;
        }
        const updateProduct = prisma.product.update({
          where: { id: product.id },
          data: { quantity: newQuantity, status: productStatus }
        });
        promises.push(updateProduct);
      }

      if (coupon > 0 && couponObj) {
        const addCoupon = prisma.orderCoupon.create({
          data: { orderId: orderId, couponId: couponObj.id, amount: coupon }
        });
        promises.push(addCoupon);
      }

      await prisma.$transaction(promises);
      const newOrder = await prisma.order.findFirstOrThrow({
        where: { id: orderId }
      });

      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: newOrder
      });

    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          orderItems: true
        }
      });
      
      res.status(HttpCode.OK).json({
        status: HttpCode.OK,
        message: HttpMessage.OK,
        data: order
      });
    } catch (err) {
      AppError.handleApiError(err, next);
    }
  }

  static async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      await prisma.order.update({
        where: { id: orderId },
        data: { status: status }
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