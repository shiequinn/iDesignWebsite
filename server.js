import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import fetch from 'node-fetch'; // <-- Added import
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

const allowedOrigins = [
  'https://shiequinn.com', // production domain
  'https://idesignwebsite-905e545d981b981b.herokuapp.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
];

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

app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, 
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use('/api', routes);

//new route for login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Your user verification logic here
  if (username === 'admin' && password === 'password123') {
    // Successful login
    res.status(200).json({ message: 'Login successful' });
  } else {
    // Unauthorized
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// New route to fetch reviews
app.get('/api/reviews', async (req, res) => {
  const apiUrl = 'https://idesignwebsite-905e545d981b981b.herokuapp.com/api/index.reviews.html';

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