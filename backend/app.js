const express = require('express');
const session = require('express-session');
const axios = require('axios');
const mongoose = require('mongoose');

const passportConfig = require('./middleware/passport');

require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@equityeye.7ehlkcc.mongodb.net/equityEye?retryWrites=true&w=majority`;
const secretKey = process.env.AUTH_SECRET_KEY;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const stocksRoutes = require('./routes/stocksRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Define middleware to parse JSON requests
app.use(express.json());

//Passport middleware
app.use(session({ secret: secretKey, resave: true, saveUninitialized: true }));
app.use(passportConfig.initialize);
app.use(passportConfig.session);

//Middleware routes
app.use('/stock', stockRoutes);
app.use('/stocks', stocksRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);


mongoose
  .connect(
    uri
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
      console.log(err);
  });