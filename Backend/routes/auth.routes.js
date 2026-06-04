import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import z from 'zod';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import { signupSchema, signinSchema } from '../schemas/zodschemas.js';
import { JWT_SECRET_KEY } from '../config/config.js';
import { authLimiter } from '../middleware/ratelimiter.js';

const router = express.Router();

// Helper — generates access token
const generateAccessToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET_KEY, { expiresIn: '7d' });
};

// POST /signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const accessToken = generateAccessToken(newUser._id, email, newUser.role);

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /signin
router.post('/signin', authLimiter, async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user._id, email, user.role);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      userId: user._id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;