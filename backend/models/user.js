const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const socialSchema = new Schema({
	provider: { type: String, required: true },
	socialId: { type: String, required: false, unique: true, sparse: true },
});

const userSchema = new Schema({
	name: { type: String },
	email: {
		type: String,
		required: function () {
			// Make password required only if there is no social account
			return this.socialAccounts.length === 0;
		},
		unique: true,
	},
	password: {
		type: String,
		required: function () {
			// Make password required only if there is no social account
			return !this.socialAccounts || this.socialAccounts.length === 0;
		},
		validate: {
			validator: function (password) {
				const minLength = 8;
				const hasLetter = /[a-zA-Z]/.test(password);
				const hasNumber = /\d/.test(password);
				const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

				return password.length >= minLength && hasLetter && hasNumber && hasSpecialChar;
			},
			message: (props) =>
				`${props.value} is not a valid password. Please ensure it has at least 8 characters and includes letters, numbers, and at least one special character`,
		},
	},
	socialAccounts: [socialSchema],
	savedStocks: [
		{
			ticker: { type: String, required: false },
			buyInPrice: { type: String, required: false },
		},
	],
	settings: {
		currency: { type: String, required: false, default: 'USD' },
		markets: {
			type: [String],
			default: ['XNYS'],
		},
	},
});

module.exports = mongoose.model('User', userSchema);
