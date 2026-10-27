const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  dashboard,
  listUsers,
  updateUserRole,
  deleteUser,
  listBookings,
  updateBookingStatus,
  listMessages,
  markMessageRead,
  deleteMessage,
} = require('../controllers/adminController');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/dashboard', dashboard);

router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/bookings', listBookings);
router.put('/bookings/:orderId/:itemId', updateBookingStatus);

router.get('/messages', listMessages);
router.put('/messages/:id', markMessageRead);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
