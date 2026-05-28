const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Register controller
const register = (req, res) => {
  const { username, email, password } = req.body;

  // Basic Validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields (username, email, password)' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists by email
    const emailCheckStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingEmail = emailCheckStmt.get(email.toLowerCase().trim());
    if (existingEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if user already exists by username
    const usernameCheckStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const existingUsername = usernameCheckStmt.get(username.trim());
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Insert user
    const insertStmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const result = insertStmt.run(
      username.trim(),
      email.toLowerCase().trim(),
      password_hash
    );

    const userId = result.lastInsertRowid;

    // Generate JWT
    const payload = {
      id: userId,
      username: username.trim(),
      email: email.toLowerCase().trim()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        username: username.trim(),
        email: email.toLowerCase().trim()
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

// Login controller
const login = (req, res) => {
  const { email, password } = req.body;

  // Basic Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Find user by email
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email.toLowerCase().trim());

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    // Match password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password matches incorrectly.' });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

// Get current user profile (useful for page reloads)
const getMe = (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('getMe Error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
