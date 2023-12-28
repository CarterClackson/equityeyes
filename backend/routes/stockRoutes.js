const express = require('express');
const axios = require('axios');

const router = express.Router();

const baseURL = 'https://api.polygon.io/v1';
const apiKey = process.env.POLYGON_API_KEY;

  //Get moving average values at interval timeframe. If week it's once per week.
  router.get('/:symbol/:timeFrame', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const timeFrame = req.params.timeFrame.toLowerCase() || 'week';
    const window = req.query.window;
    const seriesType = req.query.series_type;
    const order = req.query.order;
  
    const timeFrameMap = {
      'minute': 60,
      'hour': 24,
      'day': 365,
      'week': 52,
      'month': 12,
    };
  
    const limit = timeFrameMap[timeFrame] || 0;
  
    try {
      const apiUrl = `${baseURL}/indicators/sma/${symbol}?timespan=${timeFrame}&adjusted=true&window=${window}&series_type=${seriesType}&order=${order}&limit=${limit}&apiKey=${apiKey}`;
  
      const response = await axios.get(apiUrl);
      const allData = response.data.results.values;
  
      res.json(allData);
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: error });
    }
});
  
router.get('/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      const formattedYesterday = yesterday.toISOString().split('T')[0];

      // Fetch stock details
      const stockResponse = await axios.get(`${baseURL}/open-close/${symbol}/${formattedYesterday}`, {
        params: {
          adjusted: true,
          apiKey: apiKey,
        }
      });
      const stockDetails = stockResponse.data;

      //Fetch ticker details
      const tickerResponse = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}`, {
        params: {
            apiKey: apiKey,
        }
      });
      const tickerDetails = tickerResponse.data;

    const combinedDetails = {
        stock: stockDetails,
        ticker: tickerDetails,
    };
      res.json(combinedDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;