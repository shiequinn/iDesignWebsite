import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Optional: serve static files from 'public' folder
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Example: use your routes (if you have routes.js)
import routes from './routes.js'; // Import your routes
app.use('/api', routes); // Mount at /api

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});