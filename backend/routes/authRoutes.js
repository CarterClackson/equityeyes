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
    (req, res, next) => {
        passport.authenticate('google', (err, user, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Authentication failed', info });
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                next();
            });
        })(req, res, next);
    },
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        function handleTokenGeneration() {
            const user = req.user;
            const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

            console.log(token); // Log the token (optional)
            res.status(200).json({ message: 'Login successful', token });
        }

        handleTokenGeneration();
    }
);

router.get('/github', passport.authenticate('github'));

router.get('/github/callback',
    (req, res, next) => {
        passport.authenticate('github', (err, user, info) => {
            if (err) {
                // Handle unexpected errors
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!user) {
                // Handle authentication failure
                return res.status(401).json({ error: 'Authentication failed', info });
            }

            // Handle successful authentication
            req.logIn(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                next();
            });
        })(req, res, next);
    },
    (req, res) => {
        // Ensure the user is available in the request
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // Handle token generation
        function handleTokenGeneration() {
            const user = req.user;
            const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

            console.log(token); // Log the token (optional)

            // Respond with the token
            res.status(200).json({ message: 'Login successful', token });
        }

        // Call the token generation function
        handleTokenGeneration();
    }
);

module.exports = router;