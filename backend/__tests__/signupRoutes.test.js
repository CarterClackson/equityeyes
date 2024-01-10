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

beforeAll(async () => {
	// Clear the entire database before all tests
	await User.deleteMany();
});

beforeEach(async () => {
	// Clear the database, excluding specific users and null socialIds
	await User.deleteMany({
		$or: [{ email: { $nin: ['existing.user@example.com'] } }, { 'socialAccounts.socialId': { $ne: null } }],
	});
});

afterAll(async () => {});

describe('POST /signup', () => {
	test('should create a new user', async () => {
		const userData = {
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: 'SecureP@ss123',
		};

		const response = await request(app).post('/user/signup').send(userData);

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message', 'User created successfully');
		expect(response.body).toHaveProperty('token');

		const user = await User.findOne({ email: userData.email });
		expect(user).toBeTruthy();
	});

	test('should return 400 if email or password is missing', async () => {
		const response = await request(app).post('/user/signup').send({ name: 'John Doe' });

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Email and password are required for signup.');
	});

	test('should return 400 if email is already in use', async () => {
		const existingUser = new User({
			name: 'Existing User',
			email: 'existing.user@example.com',
			password: 'SecureP@ss123',
		});
		await existingUser.save();

		const response = await request(app).post('/user/signup').send({
			name: 'John Doe',
			email: 'existing.user@example.com',
			password: 'SecureP@ss456',
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Email already in use');
	});

	test('should return 400 for invalid password', async () => {
		const response = await request(app).post('/user/signup').send({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: 'weakpassword',
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty(
			'error',
			'Invalid password. Please ensure it has at least 8 characters and includes letters, numbers, and at least one special character'
		);
	});
});
