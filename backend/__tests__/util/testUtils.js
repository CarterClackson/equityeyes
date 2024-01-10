const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../../models/user');

require('dotenv').config();

const secretKey = process.env.AUTH_SECRET_KEY;

async function addTestUser(userData) {
	const userFields = {
		name: userData.name,
		email: userData.email,
		savedStocks: userData.savedStocks,
	};

	// Only include socialAccounts if there is data available
	if (userData.socialAccounts && userData.socialAccounts.length > 0) {
		userFields.socialAccounts = userData.socialAccounts.map((account) => ({
			provider: account.provider,
			socialId: account.socialId || null,
		}));
	}

	if (userData.password) {
		userFields.password = await bcrypt.hash(userData.password, 10);
	}

	const newUser = new User(userFields);

	try {
		await newUser.save();

		if (userData.generateToken) {
			const token = jwt.sign({ userId: newUser.id, email: newUser.email }, secretKey, { expiresIn: '1h' });
			newUser.token = token;
			await newUser.save();
		}

		return newUser;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

module.exports = { addTestUser };
