import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// Require Auth & Store Owner Role
router.use(authenticateToken);
router.use(requireRole('Store Owner'));

// GET /api/owner/dashboard - Store Owner Dashboard Statistics & Rating Breakdown
router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch store owned by user
    const storeResult = await pool.query('SELECT * FROM stores WHERE owner_id = $1', [ownerId]);
    if (storeResult.rows.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No store currently assigned to this Store Owner account.'
      });
    }
    const store = storeResult.rows[0];

    // Rating stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(id)::int AS total_reviews,
        COALESCE(ROUND(AVG(rating), 1), 0)::float AS avg_rating
      FROM ratings
      WHERE store_id = $1
    `, [store.id]);

    const totalReviews = statsResult.rows[0].total_reviews;
    const avgRating = statsResult.rows[0].avg_rating;

    // Rating distribution breakdown
    const distributionResult = await pool.query(`
      SELECT rating, COUNT(id)::int AS count
      FROM ratings
      WHERE store_id = $1
      GROUP BY rating
    `, [store.id]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distributionResult.rows.forEach(row => {
      distribution[row.rating] = row.count;
    });

    const fiveStarRatio = totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0;

    return res.json({
      hasStore: true,
      store: store,
      stats: {
        avgRating,
        totalReviews,
        fiveStarRatio
      },
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    return res.status(500).json({ error: 'Failed to retrieve store owner metrics.' });
  }
});

// GET /api/owner/reviews - Store Owner Customer Reviews List
router.get('/reviews', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { searchCustomer, sortBy, sortOrder } = req.query;

    const storeResult = await pool.query('SELECT * FROM stores WHERE owner_id = $1', [ownerId]);
    if (storeResult.rows.length === 0) {
      return res.json({ reviews: [] });
    }
    const store = storeResult.rows[0];

    let queryText = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        r.user_id,
        u.name AS customer_name,
        u.email AS customer_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
    `;

    const queryParams = [store.id];

    if (searchCustomer) {
      queryParams.push(`%${searchCustomer.trim()}%`);
      queryText += ` AND (u.name ILIKE $2 OR u.email ILIKE $2)`;
    }

    const sortFieldMap = {
      name: 'customer_name',
      rating: 'r.rating',
      date: 'r.created_at'
    };

    const sortField = sortFieldMap[sortBy] || 'r.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${order}`;

    const reviewsResult = await pool.query(queryText, queryParams);
    return res.json({ reviews: reviewsResult.rows });
  } catch (error) {
    console.error('Owner reviews fetch error:', error);
    return res.status(500).json({ error: 'Failed to retrieve customer reviews.' });
  }
});

export default router;
