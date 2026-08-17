import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Optional/Flexible Auth middleware for listing stores (attaches user if token present)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'localmarket_super_secret_jwt_key_2026_production');
    req.user = decoded;
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
}

// GET /api/stores - List stores with search filters and rating aggregation
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { searchName, searchAddress, sortBy, sortOrder } = req.query;
    const userId = req.user ? req.user.id : null;

    let queryText = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COUNT(r.id)::int AS total_reviews,
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS avg_rating
    `;

    const queryParams = [];
    if (userId) {
      queryParams.push(userId);
      queryText += `, (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $${queryParams.length}) AS user_rating`;
    }

    queryText += `
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const whereClauses = [];
    if (searchName) {
      queryParams.push(`%${searchName.trim()}%`);
      whereClauses.push(`s.name ILIKE $${queryParams.length}`);
    }
    if (searchAddress) {
      queryParams.push(`%${searchAddress.trim()}%`);
      whereClauses.push(`s.address ILIKE $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryText += ` GROUP BY s.id`;

    const sortFieldMap = {
      name: 's.name',
      rating: 'avg_rating',
      reviews: 'total_reviews',
      created_at: 's.created_at'
    };
    const sortField = sortFieldMap[sortBy] || 's.name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    queryText += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(queryText, queryParams);
    return res.json({ stores: result.rows });
  } catch (error) {
    console.error('Fetch stores error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stores catalog.' });
  }
});

// GET /api/stores/:id - Single store view
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const storeId = parseInt(id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID format.' });
    }

    let queryText = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COUNT(r.id)::int AS total_reviews,
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS avg_rating
    `;

    const queryParams = [storeId];
    if (userId) {
      queryParams.push(userId);
      queryText += `, (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $2) AS user_rating`;
    }

    queryText += `
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await pool.query(queryText, queryParams);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    return res.json({ store: result.rows[0] });
  } catch (error) {
    console.error('Fetch store by ID error:', error);
    return res.status(500).json({ error: 'Failed to retrieve store details.' });
  }
});

// POST /api/stores/:storeId/ratings - Submit or Modify Rating (Requires Auth)
router.post('/:storeId/ratings', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const numericStoreId = parseInt(storeId, 10);
    if (isNaN(numericStoreId)) {
      return res.status(400).json({ error: 'Invalid store ID format.' });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    // Verify store existence
    const storeResult = await pool.query('SELECT * FROM stores WHERE id = $1', [numericStoreId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store does not exist.' });
    }

    // Upsert rating enforcing unique index (user_id, store_id)
    const savedRatingResult = await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, numericStoreId, numericRating]);

    return res.status(200).json({
      message: 'Your rating has been saved successfully.',
      rating: savedRatingResult.rows[0]
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

export default router;
