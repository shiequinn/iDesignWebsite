// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool from './db.js';
import session from 'express-session';
import routes from './routes.js'; // your routes file

// Setup __dirname for ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Your middleware here (e.g., app.use(express.json()))

// Define your routes here
app.get('/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


// Middleware setup
app.use(express.static('public'));
app.use(express.json());

// CORS setup
const allowedOrigins = [
  'https://shiequinn.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
}));

// Handle preflight options request
app.options('*', cors);

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Use your imported routes (assuming routes() returns a router)
const mainRouter = routes(); // or directly use 'routes' if it's a router

// Mount the main router at /api
app.use('/api', mainRouter);

// Example of defining a specific route for reviews if needed
// or if reviews are part of your routes, handle them inside routes.js
// For demonstration:
const reviewsRouter = express.Router();

reviewsRouter.get('/', (req, res) => {
  res.send('Get all reviews');
});

// Mount reviews router separately if needed
app.use('/reviews', reviewsRouter);

// Basic route
app.get('/', (req, res) => res.send('Hello World'));

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});