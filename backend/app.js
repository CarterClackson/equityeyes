const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');


require('dotenv').config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@equityeye.7ehlkcc.mongodb.net/equityEye?retryWrites=true&w=majority`;

const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Define middleware to parse JSON requests
app.use(express.json());

//Middleware routes
app.use('/stock', stockRoutes);
app.use('/user', userRoutes)


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