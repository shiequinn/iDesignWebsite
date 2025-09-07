import express from 'express';
import mysql from 'mysql2/promise'; // import mysql2
import bcrypt from 'bcryptjs';       // import bcryptjs
import jwt from 'jsonwebtoken';      // import jsonwebtoken
import { Router } from 'express';

const router = Router();
app.use('/api', router);

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

// Helper function
async function getConnectionAsync() {
  return await pool.getConnection();
}

// Register route
router.post('/register', async (req, res) => {
  // Set CORS header
  res.setHeader('Access-Control-Allow-Origin', 'https://shiequinn.com');

  const { name, email, password, bio, membership_level } = req.body;
  try {
    const connection = await getConnectionAsync();

    // Check if email exists
    const [results] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO users (name, email, password, bio, membership_level) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, bio, membership_level]
    );

    connection.release();
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Error during registration', error: err.message });
  }
});
// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await getConnectionAsync();
    const [results] = await connection.execute('SELECT * FROM registration WHERE email = ?', [email]);
    if (results.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '1h' });
    connection.release();
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware for token verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Add review (protected)
router.post('/add-review', authenticateToken, async (req, res) => {
  const { name, position, review } = req.body;
  if (!name || !position || !review) return res.status(400).json({ message: 'Provide name, position, review' });
  const created_at = new Date();

  try {
    const connection = await getConnectionAsync();
    await connection.execute(
      'INSERT INTO reviews (name, position, review, created_at) VALUES (?, ?, ?, ?)',
      [name, position, review, created_at]
    );
    connection.release();
    res.json({ message: 'Review added successfully!' });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ message: 'Error saving review' });
  }
});

// Get reviews
router.get('/get-reviews', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM reviews');
    res.json(results);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Fetch user profile by email
router.get('/user-profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const connection = await getConnectionAsync();
    const [results] = await connection.execute(
      'SELECT name, email, bio, membership_level, id FROM registration WHERE email = ?',
      [email]
    );
    connection.release();
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;