const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const booksRoutes = require ('./routes/books');

app.use(express.json()); // lire le body des rêquetes en json
app.use (cors());

mongoose.connect('mongodb+srv://Mia:Mongodb18.@cluster0.uzelg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use('./api/books', booksRoutes);

module.exports = app;