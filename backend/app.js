const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const baseURL = 'https://api.polygon.io/v1/open-close/';
const apiKey = process.env.POLYGON_API_KEY;

const users = [
  { id: 1, name: 'John', savedStocks: ['AAPL', 'GOOGL', 'MSFT'] },
  { id: 2, name: 'Jane', savedStocks: ['AMZN', 'GOOGL', 'MSFT'] },
];

// Define middleware to parse JSON requests
app.use(express.json());

// Example endpoint to get a list of available stocks
app.get('/user/:userID/stocks', async (req, res) => {
  const userID = parseInt(req.params.userID);

  try {
    const user = users.find(u => u.id === userID);
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const savedStocks = user.savedStocks;

    const stockDataPromises = savedStocks.map(async symbol => {
      const response = await axios.get(`${baseURL}${symbol}/${formattedYesterday}`, {
        params: {
          adjusted: true,
          apiKey: apiKey,
        }
      });
      return { symbol, data: response.data };
    });
    const stockData = await Promise.all(stockDataPromises);
    res.json(stockData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example endpoint to get details about a specific stock
app.get('/stock/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    const response = await axios.get(`${baseURL}${symbol}/${formattedYesterday}`, {
      params: {
        adjusted: true,
        apiKey: apiKey,
      }
    });
    const stockDetails = response.data;
    res.json(stockDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});