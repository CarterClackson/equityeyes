const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const axios = require('axios');
const { addTestUser } = require('./util/testUtils');

const User = require('../models/user');


beforeAll(async () => {
    await User.deleteMany();
    server = app.listen(3000);
});

beforeEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    server.close();
});

describe('GET /stocks', () => {
  // Test case for successful paginated request
  it('should respond with paginated stocks', async () => {
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecureP@ss123',
        savedStocks: [],
        settings: {
            currency: 'USD',
            markets: ['XNYS', 'XNAS'],
        },
    };

    const userWithToken = await addTestUser({ ...testUser, generateToken: true });


    const response = await request(app)
      .get('/stocks?paginated=true&page=1&pageSize=100')
      .set('Authorization', `Bearer ${userWithToken.token}`);


    expect(response.statusCode).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.totalPages).toBe(2); // Assuming pageSize is 5 and total stocks are 10
    expect(response.body.stocks).toHaveLength(100);
  });

  // Test case for non-paginated request
  it('should respond with all stocks for non-paginated request', async () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecureP@ss123',
        savedStocks: [],
        settings: {
            currency: 'USD',
            markets: ['XNYS', 'XNAS'],
        },
    };

    const userWithToken = await addTestUser({ ...testUser, generateToken: true });


    const response = await request(app)
      .get('/stocks')
      .set('Authorization', `Bearer ${userWithToken.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(174);
  });

  // Test case for unsuccessful user lookup
  it('should respond with 401 if passed invalid token', async () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecureP@ss123',
        savedStocks: [],
        settings: {
            currency: 'USD',
            markets: ['XNYS', 'XNAS'],
        },
    };

    const userWithToken = await addTestUser({ ...testUser, generateToken: true });


    const response = await request(app)
      .get('/stocks')
      .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized: Invalid token');
  });


  // Test case for invalid page number
  it('should respond with 400 for an invalid page number', async () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecureP@ss123',
        savedStocks: [],
        settings: {
            currency: 'USD',
            markets: ['XNYS', 'XNAS'],
        },
    };

    const userWithToken = await addTestUser({ ...testUser, generateToken: true });


    const response = await request(app)
      .get('/stocks?paginated=true&page=0&pageSize=100')
      .set('Authorization', `Bearer ${userWithToken.token}`);


    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid page number');
  });

});