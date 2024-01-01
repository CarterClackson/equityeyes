const request = require('supertest');
const app = require('../app'); // Update with the correct path to your app file
const mongoose = require('mongoose');
const { addTestUser } = require('./util/testUtils');

const User = require('../models/user');

beforeAll(async () => {
    await User.deleteMany();
    server = app.listen(3000);
});

afterAll(async () => {
    server.close();
});

describe('PATCH /update/markets', () => {
    test('should update markets successfully', async () => {
        const testUser = {
            name: 'Test User New',
            email: 'thisisatest@test.com',
            password: 'SecureP@ss123',
            settings: {
                currency: 'USD',
                markets: ['XNYS', 'XNAS'],
            },
        };

        const updateMarketsData = {
            add: ['XLON'],
            remove: ['XNAS'],
        };

        const userWithToken = await addTestUser({ ...testUser, generateToken: true });

        const response = await request(app)
            .patch('/user/update/markets')
            .set('Authorization', `Bearer ${userWithToken.token}`)
            .send(updateMarketsData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Markets updated successfully');
        expect(response.body).toHaveProperty('user');
        // Add more assertions as needed
    });

    test('should return 401 if invalid token is passed', async () => {
        const updateMarketsData = {
            add: ['XLON'],
            remove: ['XNAS'],
        };

        const response = await request(app)
            .patch('/user/update/markets')
            .set('Authorization', 'Bearer invalid-token')
            .send(updateMarketsData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized: Invalid token');
    });

}); 