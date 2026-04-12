import pool from './db.js';
import jwt from 'jsonwebtoken';      
import express from 'express';

const router = express.Router();

console.log('Loading routes.js');

// Middleware for token verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'default-secret';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Attach user info to request
    next();
  });
}

// Add review (protected route)
router.post('/reviews', authenticateToken, async (req, res) => {
  const { name, position, review } = req.body;

  if (!name || !position || !review) {
    return res.status(400).json({ message: 'Please provide name, position, and review' });
  }

  const sanitizedName = String(name).trim();
  const sanitizedPosition = String(position).trim();
  const sanitizedReview = String(review).trim();
  const created_at = new Date();

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO reviews (name, position, review, created_at) VALUES (?, ?, ?, ?)',
      [sanitizedName, sanitizedPosition, sanitizedReview, created_at]
    );
    res.json({ message: 'Review added successfully!' });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ message: 'Error saving review' });
  } finally {
    if (connection) connection.release();
  }
});

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM reviews');
    res.json(results);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

export default router;