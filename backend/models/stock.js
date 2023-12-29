const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    symbol: String,
    name: String,
    currency: String,
    exchange: String,
});

module.exports = mongoose.model('Stock', stockSchema);