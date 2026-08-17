import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'localmarket_super_secret_jwt_key_2026_production');
    
    // Query user from database to ensure account is active and role is up to date
    const result = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}
