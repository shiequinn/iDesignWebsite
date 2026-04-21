import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import session from 'express-session';
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
app.use('/', loginRoute);

// Allowed origins for CORS
const allowedOrigins = [
  'https://shiequinn.com', // production domain
  'https://idesignwebsite-905e545d981b981b.herokuapp.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
];
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'd1kb8x1fu8rhcnej.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'a9a1kyqcj8r1g7kf',
  password: 'fshfpdflpsym5f0w ',
  database: 'xbxm73r0k93viqkl'
});

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

// Session configuration
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Use your imported routes
app.use('/api/reviews', routes);

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  connection.query('SELECT * FROM xbxm73r0k93viqkl.users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid username or password' });
    const user = results[0];
    // Verify password (hash comparison)
    if (password === user.password) { // replace with hash check in production
      // Generate token, etc.
      res.json({ message: 'Login successful', token: 'your_generated_token' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

// Route to fetch reviews from database
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM xbxm73r0k93viqkl.reviews');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews from DB:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Optional root route
app.get('/', (req, res) => res.send('Hello World'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
// When creating users:
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// During login verification:
bcrypt.compare(password, user.password, (err, result) => {
  if (result) {
    // Password match
  } else {
    // Invalid password
  }
});