/* Routes for returning details about all stocks in the collection */
const express = require('express');
const axios = require('axios');
const { restart } = require('nodemon');

const Stock = require('../models/stock');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        console.log('Error fetching stocks list:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;