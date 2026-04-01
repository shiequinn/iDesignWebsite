// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

console.log('Loaded env variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('SECRET_KEY:', process.env.SECRET_KEY);
console.log('PORT:', process.env.PORT);

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pool from './db.js'; 
import routes from './routes.js'; // Your routes file

// Setup __dirname for ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware setup
app.use(express.static('public'));
app.use(express.json());

// Define the list of allowed origins
const allowedOrigins = [
  'https://shiequinn.com',
  'https://idesignwebsite-905e545d981b.herokuapp.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
];

// Setup CORS with custom origin validation and logging
app.use(cors({
  origin: (origin, callback) => {
    console.log('Request from origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
}));

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Use your imported routes (including reviews)
app.use('/api', routes); // Assuming routes is a router with all routes

// Optional: define root route
app.get('/', (req, res) => res.send('Hello World'));

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});