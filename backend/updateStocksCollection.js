const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@equityeye.7ehlkcc.mongodb.net/equityEye?retryWrites=true&w=majority`;
const apiKey = process.env.POLYGON_API_KEY;

// Connect to your MongoDB database
mongoose.connect(uri);

const Stock = mongoose.model('Stock', {
  symbol: String,
});

const polygonApiKey = apiKey;
const requestsPerMinute = 5;
const delayMS = 60 * 1000 / requestsPerMinute; // 60 seconds per minute

async function fetchAllTickers() {
  let allTickers = [];
  let nextUrl = `https://api.polygon.io/v3/reference/tickers`;

  try {
    while (nextUrl) {
      console.log(`Fetching tickers from: ${nextUrl}`);

      const startTime = Date.now();

      const response = await axios.get(nextUrl, {
        params: {
          apiKey: polygonApiKey,
          limit: 1000,
        },
      });

      const { results, next_url: nextPageUrl } = response.data;

      allTickers = allTickers.concat(results);

      // Update nextUrl to continue pagination
      nextUrl = nextPageUrl;

      // Calculate elapsed time and introduce a delay if needed
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < delayMS) {
        console.log(`Delaying for ${delayMS - elapsedTime} ms`);
        await delay(delayMS - elapsedTime);
      }
    }

    console.log('All tickers fetched successfully');
    return allTickers;
  } catch (error) {
    console.error('Error fetching tickers:', error.message);
    return [];
  }
}

async function updateStocksCollection() {
  const allTickers = await fetchAllTickers();

  if (allTickers.length === 0) {
    console.log('No tickers found.');
    mongoose.disconnect();
    return;
  }

  for (const ticker of allTickers) {

    try {
      // Check if the symbol already exists in the database
      const existingStock = await Stock.findOne({ symbol: ticker.ticker });

      if (!existingStock) {
        // Symbol doesn't exist, add it to the database
        await Stock.create({ symbol: ticker.ticker });
        console.log(`Added symbol: ${ticker.ticker}`);
      } else {
        console.log(`Symbol ${ticker.ticker} already exists in the database.`);
      }
    } catch (error) {
      console.error(`Error processing symbol ${ticker.ticker}:`, error.message);
    }
  }

  console.log('Stocks collection update completed.');
  mongoose.disconnect();
}

updateStocksCollection();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}