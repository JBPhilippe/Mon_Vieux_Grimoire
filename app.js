const express = require('express');
const app = express();

const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');
const helmet = require("helmet")
const mongoSanitize = require('express-mongo-sanitize')

require('dotenv').config();




mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));



app.use(express.json())


// HTTP headers => security
app.use(helmet())

// Sanitize user input => prevents NoSql code injection 
app.use(mongoSanitize());


// CORS
app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enregistrement des routeurs
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;