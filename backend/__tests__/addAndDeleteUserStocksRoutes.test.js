const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const axios = require('axios');
const { addTestUser } = require('./util/testUtils');

const User = require('../models/user');

jest.mock('axios');

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

describe('POST /stocks/add', () => {
	it('should add a stock for a user', async () => {
		// Mock successful axios response
		axios.get.mockResolvedValue({
			data: { close: 100 }, // Adjust the mock data as needed
		});

		const testUser = {
			name: 'Test User',
			email: 'test@example.com',
			password: 'SecureP@ss123',
			savedStocks: [],
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		// Perform the request
		const response = await request(app)
			.post('/user/stocks/add')
			.set('Authorization', `Bearer ${userWithToken.token}`) // Mock token as needed
			.send({ savedStock: { ticker: 'AAPL' } });

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Saved stock to user.');
	});

	it('should handle invalid token passed', async () => {
		// Mock successful axios response
		axios.get.mockResolvedValue({
			data: { close: 100 }, // Adjust the mock data as needed
		});

		const nonExistentUserID = 'nonExistentUserID';

		// Perform the request
		const response = await request(app)
			.post('/user/stocks/add')
			.set('Authorization', `Bearer nonExistentToken`)
			.send({ savedStock: { ticker: 'AAPL' } });

		// Assertions
		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('error', 'Unauthorized: Invalid token');
	});

	it('should handle adding more than 5 saved stocks', async () => {
		const testUser = {
			name: 'Test User',
			email: 'test@example.com',
			password: 'SecureP@ss123',
			savedStocks: Array.from({ length: 5 }, (_, index) => ({
				ticker: `Stock${index}`,
				buyInPrice: 100 + index,
			})),
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		// Perform the request
		const response = await request(app)
			.post('/user/stocks/add')
			.set('Authorization', `Bearer ${userWithToken.token}`)
			.send({ savedStock: { ticker: 'AAPL' } });

		// Assertions
		expect(response.status).toBe(429);
		expect(response.body).toHaveProperty(
			'message',
			'Due to API limitations, you can only add 5 saved stocks at a time.'
		);
	});

	it('should handle user already saved the stock', async () => {
		const testUser = {
			name: 'Test User',
			email: 'test@example.com',
			password: 'SecureP@ss123',
			savedStocks: [
				{
					ticker: 'AAPL',
					buyInPrice: 100,
				},
			],
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		// Perform the request
		const response = await request(app)
			.post('/user/stocks/add')
			.set('Authorization', `Bearer ${userWithToken.token}`)
			.send({ savedStock: { ticker: 'AAPL' } });

		// Assertions
		expect(response.status).toBe(409);
		expect(response.body).toHaveProperty('message', 'User has already saved this stock');
	});
});

describe('DELETE /stocks/delete', () => {
	it('should delete a stock from a user', async () => {
		const testUser = {
			name: 'Test User Newer',
			email: 'test2@example.com',
			password: 'SecureP@ss123',
			savedStocks: [
				{
					ticker: 'AAPL',
					buyInPrice: 100,
				},
			],
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		// Perform the request
		const response = await request(app)
			.delete('/user/stocks/delete')
			.set('Authorization', `Bearer ${userWithToken.token}`) // Mock token as needed
			.send({ stockToDelete: 'AAPL' });

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Stock removed from user');
	});

	it('should handle stock not found', async () => {
		const testUser = {
			name: 'Test User Newer',
			email: 'test3@example.com',
			password: 'SecureP@ss123',
			savedStocks: [
				{
					ticker: 'AAPL',
					buyInPrice: 100,
				},
			],
		};

		const userWithToken = await addTestUser({ ...testUser, generateToken: true });

		const response = await request(app)
			.delete('/user/stocks/delete')
			.set('Authorization', `Bearer ${userWithToken.token}`)
			.send({ stockToDelete: 'GOOGL' });

		expect(response.status).toBe(409);
		expect(response.body.message).toBe('User has not saved this stock');
	});

	it('should handle invalid token passed', async () => {
		const response = await request(app)
			.delete('/user/stocks/delete')
			.set('Authorization', `Bearer invalid-token`)
			.send({ stockToDelete: 'AAPL' });

		expect(response.status).toBe(401);
		expect(response.body.error).toBe('Unauthorized: Invalid token');
	});
});
