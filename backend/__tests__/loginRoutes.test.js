const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Update the path accordingly
const User = require('../models/user');

const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authenticate');

const baseURL = 'https://api.polygon.io/v1';
const apiKey = process.env.POLYGON_API_KEY;
const secretKey = process.env.AUTH_SECRET_KEY;

const { addTestUser } = require('./util/testUtils');

beforeEach(async () => {
	// Clear the database before each test
	//await User.deleteMany();
});

beforeAll(async () => {
	// Clear database before starting tests.
	await User.deleteMany();

	// Create a test user
	const testUserData = {
		name: 'Test User',
		email: 'test@example.com',
		password: 'SecureP@ss123',
	};

	//const response = await addTestUser(testUserData);

	server = app.listen(3000);
});

afterAll(async () => {
	server.close();
});

describe('POST /login', () => {
	test('should log in a user with valid credentials', async () => {
		const user = {
			email: 'test@example.com',
			password: 'SecureP@ss123',
			socialAccounts: [],
		};

		await addTestUser(user);

		const response = await request(app).post('/user/login').send({
			email: user.email,
			password: 'SecureP@ss123',
		});

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Login successful');
		expect(response.body).toHaveProperty('token');
	});

	test('should return 400 if email or password is missing', async () => {
		const response = await request(app).post('/user/login').send({
			// Missing email or password
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Email and password are required');
	});

	test('should return 401 if user normally logs in with a social account', async () => {
		const socialUser = {
			email: 'test@gmail.com',
			password: 'SecureP@ss123',
			socialAccounts: [{ provider: 'google', socialId: 'google123' }],
		};

		await addTestUser(socialUser);

		const response = await request(app).post('/user/login').send({
			email: socialUser.email,
			password: 'password123',
		});

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('error', 'You normally log in with a social account.');
	});

	test('should return 401 for invalid email or password', async () => {
		const response = await request(app).post('/user/login').send({
			email: 'nonexistent@example.com',
			password: 'invalidPassword',
		});

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('error', 'Invalid email or password');
	});

	test('should return 401 for invalid password but valid username', async () => {
		const response = await request(app).post('/user/login').send({
			email: 'test@example.com',
			password: 'invalidPassword',
		});

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('error', 'Invalid email or password');
	});
});
