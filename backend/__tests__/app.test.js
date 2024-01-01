const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('Test the root path', () => {
  test('It should respond with 404 status code', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
  });
});