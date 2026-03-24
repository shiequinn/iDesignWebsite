import express from 'express';
import pool from './db.js';
import mysql from 'mysql2/promise'; // import mysql2
import bcrypt from 'bcryptjs';       // import bcryptjs
import jwt from 'jsonwebtoken';      // import jsonwebtoken
import { Router } from 'express';

const router = Router();



// Helper function
async function getConnectionAsync() {
  return await pool.getConnection();
}
 

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

export default router;