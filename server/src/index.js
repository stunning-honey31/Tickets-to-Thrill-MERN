require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('express-async-errors');
const connectDB = require('./config/db');
const seed = require('./utils/seed');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Centralized error handler - so a thrown/rejected error in any
// controller returns clean JSON instead of an HTML stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seed();
  app.listen(PORT, () => console.log(`[server] Tickets to Thrill API listening on :${PORT}`));
}

start();

module.exports = app;
