const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authenticate');

const router = express.Router();

const secretKey = process.env.AUTH_SECRET_KEY;

const User = require('../models/user');
const { restart } = require('nodemon');


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log(req.user); // This should now print the user information

        function handleTokenGeneration() {
            const user = req.user;
            const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

            console.log(token);
            res.status(200).json({ message: 'Login successful', token });
        }

        handleTokenGeneration();
    }
);

module.exports = router;