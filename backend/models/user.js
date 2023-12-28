const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  savedStocks: [{ type: String, required: false }]
});


module.exports = mongoose.model('User', userSchema);
