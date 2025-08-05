import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import mysql from 'mysql';
import { hash, compare } from 'bcryptjs';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
console.log('Database URL:', process.env.DATABASE_URL);

// Define __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const app = express();


// Set up MySQL connection
// Using JawsDB MySQL for Heroku deployment
const connection = mysql.createConnection(process.env.JAWSDb_URL);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to JawsDB MySQL.');
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});
//using portgresSQL
//const db = connection; // Use db for queries
// Set up database connection
//const db = new Pool({
//  connectionString: process.env.DATABASE_URL,
//  ssl: false, // disable SSL for local development
//});

// Async startup to connect to DB and start server
(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('DB connected at:', result.rows[0].now);

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // CORS setup
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'https://idesignwebdeveloper.shiequinn.com',
    ];
    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    }));

    // Session setup
    app.use(session({
      secret: process.env.SECRET_KEY || 'defaultsecret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // set true if using HTTPS
    }));

    // Routes start here

    // Test route
    app.get('/test', (_req, res) => {
      res.send('Server is working');
    });

    // Register
    app.post('/register', async (req, res) => {
      const { name, email, password, bio, membership_level } = req.body;
      try {
        const { rows } = await db.query('SELECT * FROM registration WHERE email = $1', [email]);
        if (rows.length > 0) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await hash(password, 10);
        await db.query(
          'INSERT INTO registration (name, email, password, bio, membership_level) VALUES ($1, $2, $3, $4, $5)',
          [name, email, hashedPassword, bio, membership_level]
        );
        res.json({ message: 'Registration successful' });
      } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Database error' });
      }
    });

    // Login
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const result = await db.query('SELECT * FROM registration WHERE email = $1', [email]);
        if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        req.session.userId = user.id;
        res.json({ message: 'Login successful', userId: user.id });
      } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Add review
    app.post('/add-review', async (req, res) => {
      const { name, position, review } = req.body;
      if (!name || !position || !review) {
        return res.status(400).json({ message: 'Please provide name, position, and review.' });
      }
      const created_at = new Date();
      try {
        await db.query(
          'INSERT INTO reviews (name, position, review, created_at) VALUES ($1, $2, $3, $4)',
          [name, position, review, created_at]
        );
        res.json({ message: 'Review added successfully!' });
      } catch (err) {
        console.error('Error saving review:', err);
        res.status(500).json({ message: 'Error saving review.' });
      }
    });

    // Get reviews
    app.get('/get-reviews', async (req, res) => {
      try {
        const result = await db.query('SELECT * FROM reviews');
        res.json(result.rows);
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
      try {
        const results = await db.query(
          'SELECT name, email, bio, membership_level, id FROM registration WHERE email = $1',
          [email]
        );
        if (results.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(results.rows[0]);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update profile
    app.post('/api/update-profile', async (req, res) => {
      const { bio, membership_level } = req.body;
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const updates = {};
      if (bio !== undefined) updates.bio = bio;
      if (membership_level !== undefined) updates.membership_level = membership_level;

      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ message: 'No data to update' });
      }
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map(f => updates[f]);
      values.push(userId);

      try {
        await db.query(`UPDATE registration SET ${setClause} WHERE id = $${fields.length + 1}`, values);
        res.json({ success: true });
      } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false });
      }
    });

    // Get user info
    app.get('/api/get-user-info', async (req, res) => {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      try {
        const results = await db.query('SELECT username, email, bio, membership FROM users WHERE id = $1', [userId]);
        if (results.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results.rows[0]);
      } catch (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({ error: 'Database error' });
      }
    });

    // Update user info
    app.post('/api/update-user-info', async (req, res) => {
      const { username, email, bio, membership, password } = req.body;
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      const updates = {};
      if (username) updates.name = username;
      if (email) updates.email = email;
      if (bio) updates.bio = bio;
      if (membership) updates.membership_level = membership;
      if (password && password.trim() !== '') {
        try {
          const hashedPassword = await hash(password, 10);
          updates.password = hashedPassword;
        } catch (err) {
          console.error('Hash error:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
      }
      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No data to update' });
      }
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map(f => updates[f]);
      values.push(userId);

      try {
        await db.query(`UPDATE registration SET ${setClause} WHERE id = $${fields.length + 1}`, values);
        res.json({ success: true });
      } catch (err) {
        console.error('Update user info error:', err);
        res.status(500).json({ success: false });
      }
    });

    // Update email/password
    app.post('/api/update-email-password', async (req, res) => {
      const { email, password } = req.body;
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const updates = {};
      if (email) updates.email = email;
      if (password && password.trim() !== '') {
        try {
          const hashedPassword = await hash(password, 10);
          updates.password = hashedPassword;
        } catch (err) {
          console.error('Hash error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
      }
      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ message: 'No data to update' });
      }
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map(f => updates[f]);
      values.push(userId);

      try {
        await db.query(`UPDATE registration SET ${setClause} WHERE id = $${fields.length + 1}`, values);
        res.json({ message: 'Email/Password updated successfully' });
      } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Database error' });
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to DB or start server:', err);
    process.exit(1);
  }
})();