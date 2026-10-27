const User = require('../models/User');
const Order = require('../models/Order');
const Message = require('../models/Message');
const { calculateRefund } = require('../utils/refund');

async function dashboard(req, res) {
  const [totalUsers, orders, unreadMessages] = await Promise.all([
    User.countDocuments(),
    Order.find({ status: 'paid' }),
    Message.countDocuments({ read: false }),
  ]);

  let totalTickets = 0;
  let revenue = 0;
  orders.forEach((o) => {
    totalTickets += o.items.reduce((sum, i) => sum + i.qty, 0);
    revenue += o.total;
  });

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
  const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);

  res.json({
    totalUsers,
    totalTickets,
    revenue,
    unreadMessages,
    recentOrders,
    recentMessages,
  });
}

// ---- Users ----

async function listUsers(req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
}

async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.role = role;
  await user.save();
  res.json({ user });
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await Order.deleteMany({ user: user._id }); // cascades their bookings, same as the original app
  res.json({ message: 'User deleted.' });
}

// ---- Bookings (flattened order line items across every customer) ----

async function listBookings(req, res) {
  const { status } = req.query;
  const orders = await Order.find({ status: 'paid' }).populate('user', 'name email').sort({ createdAt: -1 });

  const bookings = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (status && status !== 'all' && item.status !== status) return;
      bookings.push({
        orderId: order._id,
        itemId: item._id,
        ticketName: item.ticketName,
        qty: item.qty,
        price: item.price,
        status: item.status,
        user: order.user,
        createdAt: order.createdAt,
        visitDate: order.visitDate,
        refundAmount: item.refundAmount,
      });
    });
  });

  res.json({ bookings });
}

async function updateBookingStatus(req, res) {
  const { status } = req.body;
  if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const item = order.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Booking not found.' });

  let refundMessage = null;
  if (status === 'cancelled' && item.status !== 'cancelled') {
    const lineTotal = item.price * item.qty;
    const { amount: refundAmount } = calculateRefund(lineTotal, order.visitDate);
    item.refundAmount = refundAmount;
    item.cancelledAt = new Date();
    refundMessage = refundAmount > 0
      ? `Refund of Rs. ${refundAmount.toFixed(2)} recorded for this booking.`
      : 'No refund recorded - the visit date has already passed.';
  }
  item.status = status;
  await order.save();
  res.json({ message: 'Booking updated.', refundMessage });
}

// ---- Messages ----

async function listMessages(req, res) {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json({ messages });
}

async function markMessageRead(req, res) {
  const { read } = req.body;
  const message = await Message.findByIdAndUpdate(req.params.id, { read: !!read }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found.' });
  res.json({ message });
}

async function deleteMessage(req, res) {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted.' });
}

module.exports = {
  dashboard,
  listUsers,
  updateUserRole,
  deleteUser,
  listBookings,
  updateBookingStatus,
  listMessages,
  markMessageRead,
  deleteMessage,
};
