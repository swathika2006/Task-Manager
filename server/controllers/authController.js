const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Helper: validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ─────────────────────────────────────────
   Register
───────────────────────────────────────── */
const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'Please enter all required fields (username, email, password)' });

  if (username.trim().length < 3)
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });

  if (!isValidEmail(email))
    return res.status(400).json({ message: 'Please provide a valid email address' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });

  try {
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail)
      return res.status(400).json({ message: 'User with this email already exists' });

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername)
      return res.status(400).json({ message: 'Username is already taken' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    const payload = { id: newUser._id, username: newUser.username, email: newUser.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

/* ─────────────────────────────────────────
   Login
───────────────────────────────────────── */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please enter all fields' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });

    const payload = { id: user._id, username: user.username, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

/* ─────────────────────────────────────────
   Get current user (token refresh)
───────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ user });
  } catch (error) {
    console.error('getMe Error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

module.exports = { register, login, getMe };
