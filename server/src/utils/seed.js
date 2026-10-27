const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const catalog = require('../data/ticketCatalog');

/**
 * Runs once at startup. Creates the seeded admin account (only if no
 * admin exists yet) and the default ticket catalog (only if the
 * `tickets` collection is empty) - same idea as db_connect.php in the
 * original PHP app auto-creating its schema + admin on first run.
 */
async function seed() {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[seed] skipped - not connected to MongoDB yet.');
    return;
  }

  try {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@ticketstothrill.example').toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'Park Admin',
        email: adminEmail,
        phone: '',
        passwordHash,
        role: 'admin',
      });
      console.log(`[seed] created default admin -> ${adminEmail} / ${adminPassword}`);
    }

    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      await Ticket.insertMany(catalog);
      console.log(`[seed] inserted ${catalog.length} default ticket catalog items`);
    }
  } catch (err) {
    // Non-fatal - most likely means MongoDB isn't reachable yet.
    console.error('[seed] skipped:', err.message);
  }
}

module.exports = seed;
