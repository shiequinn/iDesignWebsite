// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mysql from 'mysql2/promise';
import routes from './routes.js'; // your routes file

// Define __dirname for ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const jwtSecret = process.env.JWT_SECRET || 'default-secret';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware setup
app.use(express.static('public'));
app.use(express.json());
app.use('/api', routes); // Mount your routes here

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

// Handle preflight
app.options('*', cors);

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Database connection pool
const pool = mysql.createPool({
  host: 'd1kb8x1fu8rhcnej.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'a9a1kyqcj8r1g7kf',
  password: 'kapd7rxwuzbqcmlq',
  database: 'xbxm73r0k93viqkl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Basic route
app.get('/', (req, res) => res.send('Hello World'));

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});