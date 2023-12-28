const express = require('express');
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

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            savedStocks: [],
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, secretKey, { expiresIn: '1h' });
        console.log(newUser);

        res.status(201).json({ message: 'User created successfully', token });
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
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
  
    res.status(200).json({ message: 'Login successful', token });
});

router.post('/stocks/add', verifyToken, async (req, res) => {
    const userID = req.user.userId;
    const savedStock = req.body.savedStock.toUpperCase();

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

    if (user.savedStocks.includes(savedStock)) {
        return res.status(409).json({ message: 'User has already saved this stock' });
    } else {
        user.savedStocks.push(savedStock);
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
    if (!user.savedStocks.includes(stockToDelete)) {
        return res.status(409).json({ message: 'User has not saved this stock' });
    } else {
        user.savedStocks = user.savedStocks.filter(stock => stock !== stockToDelete);
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
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      const formattedYesterday = yesterday.toISOString().split('T')[0];
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const savedStocks = user.savedStocks;
      if (savedStocks) {
        const stockDataPromises = savedStocks.map(async symbol => {
            const response = await axios.get(`${baseURL}/open-close/${symbol}/${formattedYesterday}`, {
              params: {
                adjusted: true,
                apiKey: apiKey,
              }
            });
            return { symbol, data: response.data };
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