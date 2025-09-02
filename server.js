// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { hash, compare } from 'bcryptjs';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const jwtSecret = process.env.JWT_SECRET || 'default-secret';

// Define __dirname (since __dirname isn't available in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware: serve static files from 'public'
app.use(express.static('public'));

// Middleware: parse JSON
app.use(express.json());

// CORS setup
const allowedOrigins = [
  'https://shiequinn.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5501',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Connect to MySQL using mysql2 with promises
const pool = mysql.createPool({
  host: 'd1kb8x1fu8rhcnej.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'a9a1kyqcj8r1g7kf',
  password: 'kapd7rxwuzbqcmlq',
  database: 'xbxm73r0k93viqkl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to get connection
async function getConnectionAsync() {
  return await pool.getConnection();
}

// Routes

// Home route
app.get('/', (req, res) => res.send('Hello World'));

// Register route
app.post('/register', async (req, res) => {
  const { name, email, password, bio, membership_level } = req.body;

  try {
    const connection = await getConnectionAsync();

    // Check if email exists
    const [results] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length > 0) {
      connection.release();
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hash(password, 10);

    await connection.execute(
      'INSERT INTO users (name, email, password, bio, membership_level) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, bio, membership_level]
    );

    connection.release();
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ message: 'An error occurred during registration', error: err.message });
  }
});
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const connection = await getConnectionAsync();
  try {
    const [results] = await connection.execute('SELECT * FROM registration WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Auth header:', authHeader);
  console.log('Token:', token);
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
// Add review (protected)
app.post('/add-review', authenticateToken, async (req, res) => {
  const { name, position, review } = req.body;
  if (!name || !position || !review) return res.status(400).json({ message: 'Please provide name, position, and review.' });
  const created_at = new Date();

  const connection = await getConnectionAsync();
  try {
    await connection.execute(
      'INSERT INTO reviews (name, position, review, created_at) VALUES (?, ?, ?, ?)',
      [name, position, review, created_at]
    );
    res.json({ message: 'Review added successfully!' });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ message: 'Error saving review.' });
  } finally {
    connection.release();
  }
});

// Get reviews
app.get('/get-reviews', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM reviews');
    res.json(results);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Fetch user profile by email
app.get('/api/user-profile', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }
  const connection = await getConnectionAsync();
  try {
    const [results] = await connection.execute('SELECT name, email, bio, membership_level, id FROM registration WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// ... (rest of your routes, following the same pattern)
  
// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});