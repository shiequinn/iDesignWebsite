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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Use your imported routes
app.use('/api/reviews', routes);

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await pool.query('SELECT * FROM xbxm73r0k93viqkl.users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({ message: 'Login successful', userId: user.id });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Function to hash existing passwords (run once if needed)
async function hashPasswords() {
  try {
    const [users] = await pool.query('SELECT * FROM xbxm73r0k93viqkl.users');
    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      await pool.query('UPDATE xbxm73r0k93viqkl.users SET password = ? WHERE id = ?', [hashed, user.id]);
    }
    console.log('Password hashing completed.');
  } catch (err) {
    console.error('Error hashing passwords:', err);
  }
}
// Uncomment this line to run hashing once
// hashPasswords();

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO xbxm73r0k93viqkl.users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.send('User registered successfully');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// Fetch reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM xbxm73r0k93viqkl.reviews');
    res.json(result);
  } catch (error) {
    console.error('Error fetching reviews from DB:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/', (req, res) => res.send('Hello World'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});