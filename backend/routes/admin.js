import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators.js';

const router = Router();

function Router() {
  return express.Router();
}

// Apply Auth & Admin Role Check to all routes in this router
router.use(authenticateToken);
router.use(requireRole('System Administrator'));

// GET /api/admin/dashboard - System Stats & Charts Data
router.get('/dashboard', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const storesCount = await pool.query('SELECT COUNT(*)::int AS count FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*)::int AS count FROM ratings');

    const avgRatingRes = await pool.query('SELECT COALESCE(ROUND(AVG(rating), 1), 0)::float AS avg FROM ratings');

    const totalUsers = usersCount.rows[0].count;
    const totalStores = storesCount.rows[0].count;
    const totalRatings = ratingsCount.rows[0].count;
    const avgStoreRating = avgRatingRes.rows[0].avg;

    // Rating distribution
    const distRes = await pool.query(`
      SELECT rating, COUNT(*)::int AS count
      FROM ratings
      GROUP BY rating
    `);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distRes.rows.forEach(r => {
      distribution[r.rating] = r.count;
    });

    // Recent Stores with Average Rating & Owner Info
    const recentStoresRes = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS avg_rating,
        COUNT(r.id)::int AS reviews_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, u.name, u.email
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    return res.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
        avgStoreRating
      },
      ratingDistribution: distribution,
      recentStores: recentStoresRes.rows
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin dashboard metrics.' });
  }
});

// GET /api/admin/users - User Management List
router.get('/users', async (req, res) => {
  try {
    const { searchName, searchEmail, searchAddress, role, sortBy, sortOrder } = req.query;

    let queryText = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        u.updated_at,
        s.id AS store_id,
        s.name AS store_name,
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS store_avg_rating,
        COUNT(r.id)::int AS store_ratings_count
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [];
    const whereClauses = [];

    if (searchName) {
      queryParams.push(`%${searchName.trim()}%`);
      whereClauses.push(`u.name ILIKE $${queryParams.length}`);
    }
    if (searchEmail) {
      queryParams.push(`%${searchEmail.trim()}%`);
      whereClauses.push(`u.email ILIKE $${queryParams.length}`);
    }
    if (searchAddress) {
      queryParams.push(`%${searchAddress.trim()}%`);
      whereClauses.push(`u.address ILIKE $${queryParams.length}`);
    }
    if (role && role !== 'All') {
      queryParams.push(role);
      whereClauses.push(`u.role = $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryText += ` GROUP BY u.id, s.id`;

    const sortFieldMap = {
      name: 'u.name',
      email: 'u.email',
      role: 'u.role',
      created_at: 'u.created_at'
    };
    const sortField = sortFieldMap[sortBy] || 'u.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(queryText, queryParams);
    return res.json({ users: result.rows });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// GET /api/admin/users/:id - Single User Details Page
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const userRes = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userRes.rows[0];
    let storeInfo = null;

    if (user.role === 'Store Owner') {
      const storeRes = await pool.query(`
        SELECT 
          s.id,
          s.name,
          s.email,
          s.address,
          s.created_at,
          COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS avg_rating,
          COUNT(r.id)::int AS total_ratings
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.owner_id = $1
        GROUP BY s.id
      `, [userId]);

      if (storeRes.rows.length > 0) {
        storeInfo = storeRes.rows[0];
      }
    }

    return res.json({ user, storeInfo });
  } catch (error) {
    console.error('Fetch user details error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user details.' });
  }
});

// POST /api/admin/users - Add New User (Admin or Normal User or Store Owner)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ error: addressErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    const validRoles = ['System Administrator', 'Normal User', 'Store Owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Please select a valid role.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUserRes = await pool.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, address, role, created_at, updated_at
    `, [name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), role]);

    return res.status(201).json({
      message: 'User created successfully.',
      user: newUserRes.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create new user.' });
  }
});

// GET /api/admin/stores - Admin Store Management Table
router.get('/stores', async (req, res) => {
  try {
    const { searchName, searchEmail, searchAddress, sortBy, sortOrder } = req.query;

    let queryText = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float AS avg_rating,
        COUNT(r.id)::int AS total_reviews
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [];
    const whereClauses = [];

    if (searchName) {
      queryParams.push(`%${searchName.trim()}%`);
      whereClauses.push(`s.name ILIKE $${queryParams.length}`);
    }
    if (searchEmail) {
      queryParams.push(`%${searchEmail.trim()}%`);
      whereClauses.push(`s.email ILIKE $${queryParams.length}`);
    }
    if (searchAddress) {
      queryParams.push(`%${searchAddress.trim()}%`);
      whereClauses.push(`s.address ILIKE $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryText += ` GROUP BY s.id, u.id`;

    const validSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'avg_rating',
      reviews: 'total_reviews',
      created_at: 's.created_at'
    };
    const sortField = validSortFields[sortBy] || 's.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(queryText, queryParams);
    return res.json({ stores: result.rows });
  } catch (error) {
    console.error('Fetch stores error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stores.' });
  }
});

// POST /api/admin/stores - Add New Store Modal API
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ error: addressErr });

    let assignedOwnerId = null;
    if (ownerId && ownerId !== '') {
      const numericOwnerId = parseInt(ownerId, 10);
      if (isNaN(numericOwnerId)) {
        return res.status(400).json({ error: 'Invalid owner ID format.' });
      }
      assignedOwnerId = numericOwnerId;
      const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [assignedOwnerId, 'Store Owner']);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Selected user is not a valid Store Owner.' });
      }
    }

    const newStoreRes = await pool.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, address, owner_id, created_at, updated_at
    `, [name.trim(), email.trim().toLowerCase(), address.trim(), assignedOwnerId]);

    return res.status(201).json({
      message: 'Store created successfully.',
      store: newStoreRes.rows[0]
    });
  } catch (error) {
    console.error('Create store error:', error);
    return res.status(500).json({ error: 'Failed to create store.' });
  }
});

// PUT /api/admin/stores/:id - Update Store
router.put('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    const storeId = parseInt(id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID format.' });
    }

    const nameErr = validateName(name);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const addressErr = validateAddress(address);
    if (addressErr) return res.status(400).json({ error: addressErr });

    let assignedOwnerId = null;
    if (ownerId && ownerId !== '') {
      const numericOwnerId = parseInt(ownerId, 10);
      if (isNaN(numericOwnerId)) {
        return res.status(400).json({ error: 'Invalid owner ID format.' });
      }
      assignedOwnerId = numericOwnerId;
      const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [assignedOwnerId, 'Store Owner']);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Selected user is not a valid Store Owner.' });
      }
    }

    const updatedStoreRes = await pool.query(`
      UPDATE stores
      SET name = $1, email = $2, address = $3, owner_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, address, owner_id, created_at, updated_at
    `, [name.trim(), email.trim().toLowerCase(), address.trim(), assignedOwnerId, storeId]);

    if (updatedStoreRes.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    return res.json({
      message: 'Store updated successfully.',
      store: updatedStoreRes.rows[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    return res.status(500).json({ error: 'Failed to update store.' });
  }
});

// DELETE /api/admin/stores/:id - Delete Store
router.delete('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const storeId = parseInt(id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID format.' });
    }

    const deletedStoreRes = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING id', [storeId]);

    if (deletedStoreRes.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Cascade handles deleting ratings, but delete manually just in case constraints are not active
    await pool.query('DELETE FROM ratings WHERE store_id = $1', [storeId]);

    return res.json({ message: 'Store deleted successfully.' });
  } catch (error) {
    console.error('Delete store error:', error);
    return res.status(500).json({ error: 'Failed to delete store.' });
  }
});

export default router;
