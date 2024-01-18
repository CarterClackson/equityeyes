const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authenticate');

const router = express.Router();

const secretKey = process.env.AUTH_SECRET_KEY;

const User = require('../models/user');
const { restart } = require('nodemon');

const handleTokenGeneration = (req, res, user) => {
	const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '7d' });

	res.cookie('authToken', token, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
	res.redirect(
		process.env.NODE_ENV === 'production'
			? 'https://equityeyes.netlify.app/dashboard'
			: 'http://localhost:3005/dashboard'
	);
};

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
	'/google/callback',
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
				handleTokenGeneration(req, res, user);
			});
		})(req, res, next);
	},
	(req, res) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication failed' });
		}
	}
);

router.get('/github', passport.authenticate('github'));

router.get(
	'/github/callback',
	(req, res, next) => {
		passport.authenticate(
			'github',
			{
				failureRedirect:
					process.env.NODE_ENV === 'production'
						? 'https://equityeyes.netlify.app/login-failed'
						: 'http://localhost:3005/login-failed',
			},
			(err, user, info) => {
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
					handleTokenGeneration(req, res, user);
				});
			}
		)(req, res, next);
	},
	(req, res) => {
		// Ensure the user is available in the request
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication failed' });
		}
	}
);

module.exports = router;
