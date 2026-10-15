const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Generate JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    process.env.JWT_SECRET || 'inoviq_super_secret_key_change_in_production_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/* ──────────────────────────────────────────────────────────
   POST /api/auth/signup — Register a new user
   ────────────────────────────────────────────────────────── */
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (first name, last name, email, password).'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      password
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.toJSON()
    });

  } catch (err) {
    console.error('Signup error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    // Duplicate key error (email or username)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   POST /api/auth/login — Authenticate user and return token
   ────────────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email/username and password.'
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check your email and password.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check your email and password.'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toJSON()
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   GET /api/auth/me — Get current user profile (protected)
   ────────────────────────────────────────────────────────── */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   PUT /api/auth/profile — Update current user profile (protected)
   ────────────────────────────────────────────────────────── */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, username, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Validate required fields
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required.' });
    }

    // Validate username uniqueness if provided
    if (username && username.trim()) {
      const cleanUsername = username.trim().toLowerCase();

      if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        return res.status(400).json({ success: false, message: 'Username must be between 3 and 30 characters.' });
      }

      const existing = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user.id }
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'That username is already taken.' });
      }
      user.username = cleanUsername;
    } else {
      // Allow clearing username
      user.username = undefined;
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.phone = (phone || '').trim();

    await user.save();

    // Re-issue token so client JWT payload stays fresh
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      token,
      user: user.toJSON()
    });

  } catch (err) {
    console.error('Update profile error:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'That username is already taken.' });
    }

    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
