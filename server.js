import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import fetch from 'node-fetch'; // ensure node-fetch is installed
import pool from './db.js'; 
import routes from './routes.js';
import loginRoute from './loginRoute.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use('/api', loginRoute);

// Allowed origins for CORS
const allowedOrigins = [
  'https://shiequinn.com', // production domain
  'https://idesignwebsite-905e545d981b981b.herokuapp.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
];

// CORS configuration
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

// Session configuration with conditional secure flag
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Use your imported routes
app.use('/api/reviews', routes);

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Your user verification logic here
  if (username === 'admin' && password === 'password123') {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Route to fetch reviews
app.get('/api/reviews', async (req, res) => {
  const apiUrl = "https://shiequinn.com/api/index.reviews"; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Optional root route
app.get('/', (req, res) => res.send('Hello World'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});