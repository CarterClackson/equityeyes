/* Routes for returning details about all stocks in the collection */
const express = require('express');
const axios = require('axios');
const { restart } = require('nodemon');

const Stock = require('../models/stock');
const User = require('../models/user');

const verifyToken = require('../middleware/authenticate');

const router = express.Router();

// localhost:3000/stocks?paginated=true&page=1pageSize=100 - paginated requests
// localhost:3000/stocks - everything.
router.get('/', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    let user;

    try {
        user = await User.findOne({ _id: userID });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    let markets = [];

    if (user.settings.markets.length > 0) {
        markets = [...user.settings.markets];
    }

    const isPaginatedRequest = req.query.paginated === 'true';

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;


    try {
        if (isPaginatedRequest) {
            const totalCount = await Stock.countDocuments({ exchange: { $in: user.settings.markets.map(market => market) } });
            const totalPages = Math.ceil(totalCount / pageSize);
    
    
            if (page > totalPages || page < 1 || totalPages === 0) {
                return res.status(400).json({ error: 'Invalid page number' });
            }
    
            const startIndex = (page - 1) * pageSize;
    
            const stocks = await Stock.find({ exchange: { $in: user.settings.markets.map(market => market) } })
                .skip(startIndex)
                .limit(pageSize);
    
            if (stocks.length > 0) {
                return res.status(200).json({
                    page: page,
                    totalPages: totalPages,
                    stocks: stocks
                });
            } else {
                return res.status(204).json({ message: 'No stocks available for the specified page.' });
            }
        } else {
            const allStocks = await Stock.find({ exchange: { $in: user.settings.markets.map(market => market) } });
            return res.status(200).json(allStocks);
        }
    } catch (error) {
        console.error('Error fetching stocks list:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;