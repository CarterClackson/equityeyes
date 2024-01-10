const request = require('supertest');
const express = require('express');
const stockRoutes = require('../routes/stockRoutes');
const axios = require('axios');

beforeAll(async () => {
	server = app.listen(3000);
});

afterAll(async () => {
	server.close();
});

jest.mock('axios');

const app = express();
app.use('/stock', stockRoutes);

describe('Stock Routes', () => {
	it('should get SMA data for a stock', async () => {
		const symbol = 'AAPL';
		const timeFrame = 'week';

		axios.get.mockResolvedValue({
			data: {
				results: {
					values: [
						/* SMA data */
					],
				},
			},
		});

		const response = await request(app).get(`/stock/${symbol}/sma/${timeFrame}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('values');
	});

	it('should get news for a stock', async () => {
		const symbol = 'AAPL';

		axios.get.mockResolvedValue({
			data: {
				results: [
					{
						/* mock news item 1 */
					},
					{
						/* mock news item 2 */
					},
					{
						/* mock news item 3 */
					},
				],
			},
		});

		const response = await request(app).get(`/stock/${symbol}/news`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(3); // Assuming you limit to 3 news items
	});

	it('should get details for a stock', async () => {
		const symbol = 'AAPL';

		axios.get
			.mockResolvedValueOnce({
				data: {
					/* Stock details */
				},
			})
			.mockResolvedValueOnce({
				data: {
					/* Ticker details */
				},
			});

		const response = await request(app).get(`/stock/${symbol}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('stock');
		expect(response.body).toHaveProperty('ticker');
	});

	it('should get stock history for a stock', async () => {
		const symbol = 'AAPL';

		const response = await request(app).get(`/stock/${symbol}/history?timespan=day&limit=365`);

		expect(response.status).toBe(200);
		// Add additional assertions based on the expected response for stock history
	});
});
