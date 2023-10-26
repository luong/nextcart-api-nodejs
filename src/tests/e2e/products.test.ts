import app from '@/app';
import request from 'supertest';
import { TestContext, expect } from 'vitest';
import HttpCode from '@/config/http-code';
import prisma from '@/services/prisma';
import { ProductStatus } from '@prisma/client';

describe('Get one product', async () => {
  test('Product not found', async (context: TestContext) => {
    const { status, body } = await request(app).get('/products/1000').send();
    expect(status).toBe(HttpCode.ERROR_RESOURCE_NOT_FOUND);
  });

  test('Product found', async (context: TestContext) => {
    const item = {
      name: 'iphone15',
      description: 'desc desc desc',
      price: 1500,
      quantity: 2,
      status: ProductStatus.Active
    };
    await prisma.product.create({ data: item });
    const { status, body } = await request(app).get('/products/1').send();
    expect(status).toBe(HttpCode.OK);
    expect(body.data).include(item);
  });
});

describe('Get many products', async () => {
  test('No products found', async () => {
    const { status, body } = await request(app).get('/products').send();
    expect(status).toBe(HttpCode.OK);
  });

  test('Found multiple products', async () => {
    await prisma.product.createMany({ data: [
      {
        name: 'iphone15',
        description: 'desc desc desc',
        price: 1500,
        quantity: 1,
        status: ProductStatus.Active
      },
      {
        name: 'iphone14',
        description: 'desc desc desc',
        price: 1200,
        quantity: 1,
        status: ProductStatus.Active
      }
    ]});
    const { status, body } = await request(app).get('/products').send();
    expect(status).toBe(HttpCode.OK);
    expect(body.data.pagination.totalItems).toBe(2);
  });
});

describe('Get all brands', async () => {
  test('No brands found', async () => {
    const { status, body } = await request(app).get('/brands').send();
    expect(status).toBe(HttpCode.OK);
    expect(body.data).toEqual([]);
  });

  test('With multiple brands', async() => {
    await prisma.brand.createMany({
      data: [
        { name: 'Apple' },
        { name: 'Samsung' }
      ]
    })
    const { status, body } = await request(app).get('/brands').send();
    expect(status).toBe(HttpCode.OK);
    expect(body.data).toHaveLength(2);
  });
});