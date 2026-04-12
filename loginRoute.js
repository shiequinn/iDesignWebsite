// loginRoute.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET ='972431bb52be49cddd3f36420df375d54f21151f8551d06548aba499deb56e5b'; // Change this to a secure key

// Dummy user data for demonstration
const users = [
  { username: 'admin', password: 'password123' },
  { username: 'user', password: 'mypassword' }
];

router.post('/index.login.html', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

export default router;