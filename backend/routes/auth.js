import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators.js';

const router = express.Router();

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'localmarket_super_secret_jwt_key_2026_production',
    { expiresIn: '24h' }
  );
}

// POST /api/auth/register (Normal User Registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, address, password, confirmPassword } = req.body;

    // Perform strict field validations
    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ error: addressErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password & insert user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUserRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), 'Normal User']
    );

    const newUser = newUserRes.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email address and password.' });
    }

    // Query user by email
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const token = generateToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me (Get current authenticated user profile)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// PUT /api/auth/password (Change Password)
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'All password fields are required.' });
    }

    const passErr = validatePassword(newPassword);
    if (passErr) return res.status(400).json({ error: passErr });

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    // Retrieve stored password hash
    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Your current password was entered incorrectly.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error while updating password.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
