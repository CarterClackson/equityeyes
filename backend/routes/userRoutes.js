/* Routes for dealing with authenticated requests */

const express = require('express');
const passport = require('passport');
const { validationResult } = require('express-validator');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authenticate');

const router = express.Router();

const baseURL = 'https://api.polygon.io/v1';
const apiKey = process.env.POLYGON_API_KEY;
const secretKey = process.env.AUTH_SECRET_KEY;

const User = require('../models/user');
const { restart } = require('nodemon');

const MAX_REQUESTS_PER_MINUTE = 5;
const delayMS = 1000 * (60 / MAX_REQUESTS_PER_MINUTE);


async function getUserByEmail(email) {
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
        return existingUser;
    } catch (err) {
        console.log(err);
    }
}

router.use(express.json());

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required for signup.' });
    }

    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Password Validation
        const minLength = 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

        if (!(password.length >= minLength && hasLetter && hasNumber && hasSpecialChar)) {
            return res.status(400).json({ error: 'Invalid password. Please ensure it has at least 8 characters and includes letters, numbers, and at least one special character' });
        }

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            savedStocks: [],
        });

        try {
            await newUser.save();

            const token = jwt.sign({ userId: newUser.id, email: newUser.email }, secretKey, { expiresIn: '1h' });
            console.log(newUser);
            res.status(201).json({ message: 'User created successfully', token });
        } catch (validationError) {
            console.log(validationError);
            res.status(400).json({ error: 'Invalid password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    const user = getUserByEmail(email);

    // If the user has a social login, return an error
    if (user.socialAccounts && user.socialAccounts.length > 0) {
        return res.status(401).json({ error: 'You normally log in with a social account.' });
    }
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
  
    res.status(200).json({ message: 'Login successful', token });
});


router.patch('/update/user-data', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    const updateUserData = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { _id: userID },
            { $set: updateUserData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User data updated successfully', user });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/update/markets', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    const updateMarketsData = req.body;

    try {
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update: Add markets
        if (updateMarketsData.add && updateMarketsData.add.length > 0) {
            await User.findByIdAndUpdate(userID, { $addToSet: { 'settings.markets': { $each: updateMarketsData.add } } });
        }

        // Update: Remove markets
        if (updateMarketsData.remove && updateMarketsData.remove.length > 0) {
            await User.findByIdAndUpdate(userID, { $pullAll: { 'settings.markets': updateMarketsData.remove } });
        }

        // Fetch the updated user
        const updatedUser = await User.findById(userID);

        res.json({ message: 'Markets updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating markets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/stocks/add', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    const savedStockTicker = req.body.savedStock.ticker.toUpperCase();


    try {
        const currentDate = new Date();
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];

        const response = await axios.get(`${baseURL}/open-close/${savedStockTicker}/${formattedYesterday}`, {
            params: {
              adjusted: true,
              apiKey: apiKey,
            }
          });
          savedStockPrice = response.data.close;
    } catch (error) {
    console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let user;

    try {
        user = await User.findOne({ _id: userID });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, could not update user.' });
    }
    if(user.savedStocks.length >= 5) {
        return res.status(429).json({ message: 'Due to API limitations, you can only add 5 saved stocks at a time.' });
    }
    const existingStock = user.savedStocks.find(stock => stock.ticker === savedStockTicker);

    if (existingStock) {
        return res.status(409).json({ message: 'User has already saved this stock' });
    } else {
        user.savedStocks.push({ ticker: savedStockTicker, buyInPrice: savedStockPrice });
        try {
            await user.save();
            return res.status(200).json({ message: 'Saved stock to user.' })
        } catch (error) {
            console.log("Save error:", error.message );
            return res.status(500).json({ message: 'Something went wrong, could not save place to user.' });
        }
    }
});

router.delete('/stocks/delete', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    const stockToDelete = req.body.stockToDelete.toUpperCase();

    let user;

    try {
        user = await User.findOne({ _id: userID });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, could not update user.' });
    }
    const existingStock = user.savedStocks.find(stock => stock.ticker === stockToDelete);
    if (!existingStock) {
        return res.status(409).json({ message: 'User has not saved this stock' });
    } else {
        user.savedStocks = user.savedStocks.filter(stock => stock.ticker !== stockToDelete);
        try {
            await user.save();
            return res.status(200).json({ message: 'Stock removed from user' })
        } catch (error) {
            console.log("Save error:", error.message );
            return res.status(500).json({ message: 'Something went wrong, could not save changes to user.' });
        }
    }
});

router.get('/stocks', verifyToken, async (req, res) => {
    const userID = req.user.userId;

    let user;
  
    try {
      user = await User.findOne({ _id: userID });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const savedStocks = user.savedStocks;
      if (savedStocks && savedStocks.length > 0) {
        const currentDate = new Date();
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];

        const stockDataPromises = savedStocks.map(async stock => {
            const response = await axios.get(`${baseURL}/open-close/${stock.ticker}/${formattedYesterday}`, {
              params: {
                adjusted: true,
                apiKey: apiKey,
              }
            });
            return { symbol: stock.ticker, buyInPrice: stock.buyInPrice, data: response.data };
          });
          const stockData = await Promise.all(stockDataPromises);
          return res.status(201).json(stockData);
      }
      return res.status(204).json({ message: 'User has no saved stocks.' }); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;