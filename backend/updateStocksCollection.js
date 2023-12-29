/* This file only needs to be run periodically when the tickers have changed.
It takes quite a while to run so be prepared for it to run for a couple of hours.
*/

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@equityeye.7ehlkcc.mongodb.net/equityEye?retryWrites=true&w=majority`;
const apiKey = process.env.POLYGON_API_KEY;

// Connect to your MongoDB database
mongoose.connect(uri);

const Stock = require('./models/stock');

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
  
        // Filter for only tickers in the US markets.
        const usTickers = results.filter(ticker => ticker.locale === 'us');
  
        // Map the tickers to include additional fields
        const tickersWithAdditionalFields = usTickers.map(ticker => ({
          symbol: ticker.ticker,
          name: ticker.name,
          currency: ticker.currency_name,
          exchange: ticker.primary_exchange,
        }));
  
        allTickers = allTickers.concat(tickersWithAdditionalFields);
  
        // Update nextUrl to continue pagination
        nextUrl = nextPageUrl;
  
        // Calculate elapsed time and add delay
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

        if (!ticker.exchange) {
            console.log(`Skipping symbol ${ticker.symbol} due to missing exchange information.`);
            continue;
        }
        // Try to find the stock in the database
        const existingStock = await Stock.findOne({ symbol: ticker.symbol });
  
        if (!existingStock) {
          // If the stock doesn't exist, create a new entry
          await Stock.create({
            symbol: ticker.symbol,
            name: ticker.name,
            currency: ticker.currency,
            exchange: ticker.exchange,
          });
          console.log(`Added symbol: ${ticker.symbol}`);
        } else {
          // If the stock already exists, update the existing entry
          await Stock.findOneAndUpdate(
            { symbol: ticker.symbol },
            {
              $set: {
                name: ticker.name,
                currency: ticker.currency,
                exchange: ticker.exchange,
              },
            }
          );
          console.log(`Updated symbol: ${ticker.symbol}`);
        }
      } catch (error) {
        console.error(`Error processing symbol ${ticker.symbol}:`, error.message);
      }
    }
  
    console.log('Stocks collection update completed.');
    mongoose.disconnect();
  }

updateStocksCollection();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}