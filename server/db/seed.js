import bcrypt from 'bcryptjs';
import pool from './index.js';

async function seedDatabase() {
  try {
    console.log('Seeding PostgreSQL database with initial data...');

    // Clear existing data (cascade handles ratings and stores)
    await pool.query('TRUNCATE TABLE ratings, stores, users RESTART IDENTITY CASCADE');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const ownerPasswordHash = await bcrypt.hash('OwnerPass123!', 10);
    const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

    // Insert Users
    const userInsertQuery = `
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email
    `;

    const adminUser = await pool.query(userInsertQuery, [
      'System Administrator Central', 'admin@localmarket.com', adminPasswordHash, 'Plot No. 45, Sector 15, Vashi, Navi Mumbai, MH 400703', 'System Administrator'
    ]);
    const owner1 = await pool.query(userInsertQuery, [
      'Rajesh Patel Store Owner', 'freshmart.owner@localmarket.com', ownerPasswordHash, '100 Mahatma Gandhi Road, Camp, Pune, MH 411001', 'Store Owner'
    ]);
    const owner2 = await pool.query(userInsertQuery, [
      'Amit Sharma Store Owner', 'techhub.owner@localmarket.com', ownerPasswordHash, '500 IT Expressway, OMR, Karapakkam, Chennai, TN 600097', 'Store Owner'
    ]);
    const owner3 = await pool.query(userInsertQuery, [
      'Priya Mehta Store Owner', 'bakery.owner@localmarket.com', ownerPasswordHash, '22B Park Street, Park Circus, Kolkata, WB 700016', 'Store Owner'
    ]);
    const user1 = await pool.query(userInsertQuery, [
      'Aarav Sharma Verified Customer', 'aarav.sharma.verified@localmarket.com', userPasswordHash, 'Flat 402, Shanti Kunj, Sector 9, Rohini, New Delhi, DL 110085', 'Normal User'
    ]);
    const user2 = await pool.query(userInsertQuery, [
      'Diya Patel Verified Customer', 'diya.patel.verified@localmarket.com', userPasswordHash, '35, Jubilee Hills, Hyderabad, TS 500033', 'Normal User'
    ]);
    const user3 = await pool.query(userInsertQuery, [
      'Rohan Mehta Verified Consumer', 'rohan.mehta.verified@localmarket.com', userPasswordHash, '88, MG Road, Ashok Nagar, Bengaluru, KA 560001', 'Normal User'
    ]);

    console.log('Created user accounts.');

    // Insert Stores
    const storeInsertQuery = `
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name
    `;

    const store1 = await pool.query(storeInsertQuery, [
      'FreshMart Organic Supermarket', 'contact@freshmartorganic.com', '100 Mahatma Gandhi Road, Camp, Pune, MH 411001', owner1.rows[0].id
    ]);
    const store2 = await pool.query(storeInsertQuery, [
      'TechHub Gadgets & Electronics', 'support@techhubelectronics.com', '500 IT Expressway, OMR, Chennai, TN 600097', owner2.rows[0].id
    ]);
    const store3 = await pool.query(storeInsertQuery, [
      'Artisan Bakes & Confectionery', 'hello@artisanbakeshop.com', '22B Park Street, Kolkata, WB 700016', owner3.rows[0].id
    ]);
    const store4 = await pool.query(storeInsertQuery, [
      'Urban Outfitters & Apparel Hub', 'info@urbanoutfittersapparel.com', '740 Linking Road, Bandra West, Mumbai, MH 400050', null
    ]);

    console.log('Created stores.');

    // Insert Ratings
    const ratingInsertQuery = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
    `;

    await pool.query(ratingInsertQuery, [user1.rows[0].id, store1.rows[0].id, 5]);
    await pool.query(ratingInsertQuery, [user1.rows[0].id, store2.rows[0].id, 3]);
    await pool.query(ratingInsertQuery, [user1.rows[0].id, store3.rows[0].id, 4]);
    await pool.query(ratingInsertQuery, [user2.rows[0].id, store1.rows[0].id, 4]);
    await pool.query(ratingInsertQuery, [user2.rows[0].id, store2.rows[0].id, 5]);
    await pool.query(ratingInsertQuery, [user3.rows[0].id, store3.rows[0].id, 5]);

    console.log('Database seeded successfully with initial data.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
