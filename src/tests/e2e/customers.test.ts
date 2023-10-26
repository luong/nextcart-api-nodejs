import app from '@/app';
import request from 'supertest';
import { expect } from 'vitest';
import HttpCode from '@/config/http-code';
import prisma from '@/services/prisma';
import Cognito from '@/services/cognito';

const defaultCustomerEmail = 'luongfox@gmail.com';
const defaultCustomerId = 'c4a87428-3021-708b-d9b6-f70db430b78b';
const defaultCustomer = {
  id: defaultCustomerId,
  email: defaultCustomerEmail,
  firstName: 'Luong',
  lastName: 'Le'
};
const defaultCustomerAddress = {
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

beforeEach(() => {
  vi.mock('@/services/cognito');
  vi.mocked(Cognito.prototype.verifyIdToken).mockResolvedValue({
    email: defaultCustomerEmail,
    token_use: 'id',
    aud: '',
    at_hash: '',
    'cognito:username': '',
    email_verified: false,
    phone_number_verified: false,
    identities: [],
    'cognito:roles': [],
    'cognito:preferred_role': '',
    sub: defaultCustomerId,
    iss: '',
    exp: 0,
    iat: 0,
    auth_time: 0,
    jti: '',
    origin_jti: ''
  });
});

describe('Create a customer', async () => {
  test('Not authorized', async () => {
    const { status, body } = await request(app).post('/customers').send();
    expect(status).toBe(HttpCode.ERROR_UNAUTHORIZED);
  });

  test('Successful case', async () => {
    await request(app).post('/customers').set('Authorization', 'Bearer 123').send({
      email: defaultCustomerEmail,
      firstName: 'Luong',
      lastName: 'Le'
    }).expect(200);
    expect(await prisma.customer.count({ where: { email: defaultCustomerEmail } })).toBe(1);
  });
});

describe('Update a customer', async () => {
  test('Successful case', async () => {
    await prisma.customer.create({ data: defaultCustomer });
    expect(await prisma.customer.count({ where: { email: defaultCustomerEmail, lastName: 'Fox' } })).toBe(0);
    await request(app).put(`/customers/${defaultCustomerId}`).set('Authorization', 'Bearer 123').send({
      email: defaultCustomerEmail,
      firstName: 'Luong',
      lastName: 'Fox'
    }).expect(200);
    expect(await prisma.customer.count({ where: { email: defaultCustomerEmail, lastName: 'Fox' } })).toBe(1);
  });
});

describe('Add an address to customer', async () => {
  test('Successful case', async () => {
    await prisma.customer.create({ data: defaultCustomer });
    expect(await prisma.address.count({ where: { customerId: defaultCustomerId }})).toBe(0);
    await request(app).post(`/customers/${defaultCustomerId}/addresses`).set('Authorization', 'Bearer 123').send(defaultCustomerAddress).expect(200);
    expect(await prisma.address.count({ where: { customerId: defaultCustomerId} })).toBe(1);
  });
});

describe('Update an existing address', async () => {
  test('Successful case', async () => {
    await prisma.customer.create({ data: defaultCustomer });
    const address = await prisma.address.create({ data: { ...defaultCustomerAddress, customerId: defaultCustomerId } });
    const newAddress = { ...defaultCustomerAddress, firstName: 'Tony', lastName: 'Tran' };
    await request(app).put(`/customers/${defaultCustomerId}/addresses/${address.id}`).set('Authorization', 'Bearer 123')
      .send(newAddress).expect(200);
    expect(await prisma.address.findUnique({ where: { id: address.id } })).contains({ firstName: 'Tony', lastName: 'Tran' });
  });
});

describe('Delete an existing address', async () => {
  test('Successful case', async () => {
    await prisma.customer.create({ data: defaultCustomer });
    const address = await prisma.address.create({ data: { ...defaultCustomerAddress, customerId: defaultCustomerId } });
    expect(await prisma.address.count({ where: { id: address.id } })).toBe(1);
    await request(app).delete(`/customers/${defaultCustomerId}/addresses/${address.id}`).set('Authorization', 'Bearer 123').expect(200);
      expect(await prisma.address.count({ where: { id: address.id } })).toBe(0);
  });
});