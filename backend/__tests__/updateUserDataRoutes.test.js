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

describe('PATCH /update/user-data', () => {
	test('should update user data successfully', async () => {
		const testUser = {
			name: 'Test User',
			email: 'test@example.com',
			password: 'SecureP@ss123',
		};

		const updatedUserData = {
			name: 'Updated Name',
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		const response = await request(app)
			.patch('/user/update/user-data')
			.set('Authorization', `Bearer ${userWithToken.token}`)
			.send(updatedUserData);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'User data updated successfully');
		expect(response.body).toHaveProperty('user');
		// Add more assertions as needed
	});

	test('should return 401 if valid token is not used', async () => {
		const updatedUserData = {
			name: 'Updated Name',
			// Add other fields you want to update
		};

		const response = await request(app)
			.patch('/user/update/user-data')
			.set('Authorization', 'Bearer invalid-token')
			.send(updatedUserData);

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('error', 'Unauthorized: Invalid token');
	});
});
