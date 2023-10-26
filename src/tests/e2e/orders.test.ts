import app from '@/app';
import request from 'supertest';
import { expect } from 'vitest';
import HttpCode from '@/config/http-code';
import prisma from '@/services/prisma';
import Cognito from '@/services/cognito';
import { CouponScope, CouponStatus, CouponValueType, ProductStatus } from '@prisma/client';
import HttpMessage from '@/config/http-message';

const defaultCustomer = {
  id: 'c4a87428-3021-708b-d9b6-f70db430b78b',
  email: 'luongfox@gmail.com',
  firstName: 'Luong',
  lastName: 'Le'
};
const defaultCustomerAddress = {
  id: 1,
  customerId: defaultCustomer.id,
  firstName: 'Luong',
  lastName: 'Le',
  phone: '+12888334456',
  address1: '56 Sun Avenue',
  address2: '108 Sun Avenue',
  city: 'San Francisco',
  state: 'CA',
  country: 'US',
  isDefault: 1
};
const defaultBrand = {
  id: 1,
  name: 'Penguin'
};
const defaultProducts = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Ocean blue cotton shirt with a narrow collar and buttons down the front and long sleeves. Comfortable fit and tiled kalidoscope patterns.',
    price: 50,
    quantity: 100,
    brandId: 1,
    image: 'young-man-in-bright-fashion_925x.jpg',
    status: ProductStatus.Active
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Womens casual varsity top, This grey and black buttoned top is a sport-inspired piece complete with an embroidered letter.',
    price: 100,
    quantity: 100,
    brandId: 1,
    image: 'casual-fashion-woman_925x.jpg',
    status: ProductStatus.Active
  }
];
const defaultCoupon = { 
  name: 'HAPPY20', 
  value: 20, 
  valueType: CouponValueType.Fixed, 
  scope: CouponScope.Subtotal, 
  status: CouponStatus.Active
};

beforeEach(async () => {
  vi.mock('@/services/cognito');
  vi.mocked(Cognito.prototype.verifyIdToken).mockResolvedValue({
    email: defaultCustomer.email,
    token_use: 'id',
    aud: '',
    at_hash: '',
    'cognito:username': '',
    email_verified: false,
    phone_number_verified: false,
    identities: [],
    'cognito:roles': [],
    'cognito:preferred_role': '',
    sub: defaultCustomer.id,
    iss: '',
    exp: 0,
    iat: 0,
    auth_time: 0,
    jti: '',
    origin_jti: ''
  });

  await prisma.customer.create({ data: defaultCustomer });
  await prisma.address.create({ data: defaultCustomerAddress });
  await prisma.brand.create({ data: defaultBrand });
  await prisma.product.createMany({ data: defaultProducts });
  await prisma.coupon.create({ data: defaultCoupon });
});

describe('Add to cart', () => {
  test('Missing parameters', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
      .send({ quantity: 5 });
    expect(response.status).toBe(HttpCode.ERROR_CLIENT);
  });
  test('Invalid quantity', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
      .send({ quantity: -5 });
    expect(response.status).toBe(HttpCode.ERROR_CLIENT);
  });
  test('Excceed quantity', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
      .send({ quantity: 105 });
    expect(response.status).toBe(HttpCode.ERROR_CLIENT);
  });
  test('Successful case - new product', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
      .send({ productId: 1, quantity: 5 });
    expect(response.status).toBe(HttpCode.OK);
    const cartItemAdded = await prisma.cartItem.findFirst({ where: { productId: 1 }});
    expect(cartItemAdded).toContain({ productId: 1, quantity: 5 });
  });
  test('Successful case - existing product', async () => {
    await prisma.cartItem.create({ data:
      { customerId: defaultCustomer.id, productId: 1, quantity: 1 }
    });
    const response = await request(app).post(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
      .send({ productId: 1, quantity: 2 });
    expect(response.status).toBe(HttpCode.OK);
    const cartItemAdded = await prisma.cartItem.findFirst({ where: { productId: 1 }});
    expect(cartItemAdded).toContain({ productId: 1, quantity: 3 });
  });
});

describe('Get cart items', () => {
  test('Successful case', async () => {
    await prisma.cartItem.createMany({ data: [
      { customerId: defaultCustomer.id, productId: 1, quantity: 1 },
      { customerId: defaultCustomer.id, productId: 2, quantity: 2 },
    ]});
    const response = await request(app).get(`/customers/${defaultCustomer.id}/cart`).set('Authorization', 'Bearer 123')
    expect(response.status).toBe(HttpCode.OK);
    expect(response.body.data).toHaveLength(2);
  });
});

describe('Update cart items', () => {
  test('Successful case', async () => {
    const cartItem = await prisma.cartItem.create({ data:
      { customerId: defaultCustomer.id, productId: 1, quantity: 1 }
    });
    const response = await request(app).put(`/customers/${defaultCustomer.id}/cart/${cartItem.id}`).set('Authorization', 'Bearer 123')
      .send({ quantity: 3 });
    expect(response.status).toBe(HttpCode.OK);
    const cartItemUpdated = await prisma.cartItem.findUnique({ where: { id: cartItem.id }});
    expect(cartItemUpdated?.quantity).toBe(3);
  });
});

describe('Delete cart items', () => {
  test('Successful case', async () => {
    const cartItem = await prisma.cartItem.create({ data:
      { customerId: defaultCustomer.id, productId: 1, quantity: 1 }
    });
    expect(await prisma.cartItem.findUnique({ where: { id: cartItem.id }}))
      .toContain({ customerId: defaultCustomer.id, productId: 1, quantity: 1 });
    const response = await request(app).delete(`/customers/${defaultCustomer.id}/cart/${cartItem.id}`).set('Authorization', 'Bearer 123');
    expect(response.status).toBe(HttpCode.OK);
    expect(await prisma.cartItem.findUnique({ where: { id: cartItem.id }})).toBeNull();
  });
});

describe('Place an order', () => {
  test('Missing address', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: 1 }]
      });
    expect(response.status).toBe(HttpCode.ERROR_CLIENT);
    expect(response.body.message).toBe(HttpMessage.VALIDATION_FAILED);
  });
  test('Missing cart items', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.ERROR_CLIENT);
      expect(response.body.message).toBe(HttpMessage.VALIDATION_FAILED);
  });
  test('Product ID not found', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 3, quantity: 1 }],
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.ERROR_SERVER);
  });
  test('Product quantity is invalid', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: -1 }],
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.ERROR_CLIENT);
      expect(response.body.message).toBe(HttpMessage.VALIDATION_FAILED);
  });
  test('Product quantity is exceeded', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: 105 }],
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.ERROR_CLIENT);
      expect(response.body.message).toBe(HttpMessage.VALIDATION_FAILED);
  });
  test('Successful case - one product', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: 1 }],
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.OK);
      expect(response.body.data.shipping).toBe(5);
      expect(response.body.data.total).toBe(55);
  });
  test('Successful case - multiple products', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }],
        addressId: 1
      });
      expect(response.status).toBe(HttpCode.OK);
      expect(response.body.data.total).toBe(255);
  });
  test('Successful case - with a coupon', async () => {
    const response = await request(app).post(`/customers/${defaultCustomer.id}/orders`).set('Authorization', 'Bearer 123')
      .send({
        cartItems: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }],
        addressId: 1,
        couponCode: 'HAPPY20'
      });
      expect(response.status).toBe(HttpCode.OK);
      expect(response.body.data.total).toBe(235);
  });
});

