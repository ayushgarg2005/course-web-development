import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import z from 'zod';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import { signupSchema, signinSchema } from '../schemas/zodschemas.js';
import { JWT_SECRET_KEY, JWT_REFRESH_SECRET } from '../config/config.js';
import { authLimiter } from '../middleware/ratelimiter.js';

const router = express.Router();

// Helper — generates both tokens
const generateTokens = (userId, email, role) => {
  const accessToken  = jwt.sign({ userId, email, role }, JWT_SECRET_KEY,     { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, email, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// POST /signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const { accessToken, refreshToken } = generateTokens(newUser._id, email, newUser.role);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
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

    const { accessToken, refreshToken } = generateTokens(user._id, email, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      userId: user._id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /refresh — swap a valid refresh token for a new token pair
router.post('/refresh', authLimiter, async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.email, user.role);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken, role: user.role });
  } catch {
    res.status(403).json({ message: 'Expired or invalid refresh token' });
  }
});

// POST /logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;