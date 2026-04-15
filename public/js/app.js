import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Mount your routes
app.use('/api', routes);

// Handle 404 - Not Found
app.use((_req, res, _next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});