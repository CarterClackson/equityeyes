const jwt = require('jsonwebtoken');
const secretKey = process.env.AUTH_SECRET_KEY;

const authenticate = (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Unauthorized: No token provided' });
	}

	try {
		const decoded = jwt.verify(token, secretKey);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: 'Unauthorized: Invalid token' });
	}
};

module.exports = authenticate;
