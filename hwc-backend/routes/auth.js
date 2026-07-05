// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_key_12345',
    { expiresIn: '8h' }
  );
};

// 📝 REGISTER ENDPOINT
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const newUser = new User({ username, password, role });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration server error', error: error.message });
  }
});

// 🔑 LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login server error', error: error.message });
  }
});

// ⚡ ES MODULE EXPORT (FIXES THE CRASH!)
export default router;