const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const { buildTicketPdf } = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/mailer');
const { calculateRefund } = require('../utils/refund');
const { vCardNumber, vExpiry, vCvv, vVisitDate } = require('../utils/validators');

/**
 * Step 1 of checkout: turn the cart (sent from the client, since cart
 * state lives client-side/localStorage in this version) into a
 * pending order. Prices are re-looked-up server-side from the Ticket
 * collection rather than trusted from the client, same as the
 * original app never trusting client-supplied prices.
 */
async function checkout(req, res) {
  const { items, visitDate } = req.body; // items: [{ ticketId, qty }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }
  if (!vVisitDate(visitDate)) {
    return res.status(400).json({ message: 'Please choose a valid visit date (today or later).' });
  }

  const ticketIds = items.map((i) => i.ticketId);
  const tickets = await Ticket.find({ _id: { $in: ticketIds }, active: true });
  const ticketMap = new Map(tickets.map((t) => [t._id.toString(), t]));

  const orderItems = [];
  let total = 0;
  for (const line of items) {
    const ticket = ticketMap.get(line.ticketId);
    const qty = Math.max(1, Math.min(20, parseInt(line.qty, 10) || 1));
    if (!ticket) continue;
    orderItems.push({ ticket: ticket._id, ticketName: ticket.name, price: ticket.price, qty, status: 'pending_payment' });
    total += ticket.price * qty;
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ message: 'None of the items in your cart are available anymore.' });
  }

  const order = await Order.create({ user: req.user._id, items: orderItems, total, status: 'pending', visitDate });
  res.status(201).json({ order });
}

/**
 * Step 2: a simulated payment gateway. Like the original app, this
 * only checks that the card details *look* real (length/format) - it
 * never contacts an actual bank, since there's no payment processor
 * or merchant credentials wired up here.
 */
async function pay(req, res) {
  const { orderId, cardNumber, expiry, cvv } = req.body;

  if (!vCardNumber(cardNumber)) return res.status(400).json({ message: 'Enter a valid card number.' });
  if (!vExpiry(expiry)) return res.status(400).json({ message: 'Expiry must be in MM/YY format.' });
  if (!vCvv(cvv)) return res.status(400).json({ message: 'Enter a valid CVV.' });

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (order.status === 'paid') return res.status(409).json({ message: 'This order is already paid.' });

  order.status = 'paid';
  order.paymentRef = 'PAY-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  order.items.forEach((item) => {
    item.status = 'upcoming';
  });
  await order.save();

  let mailResult = { delivered: false };
  try {
    const pdfBuffer = await buildTicketPdf({ order, user: req.user });
    mailResult = await sendTicketEmail({
      to: req.user.email,
      name: req.user.name,
      orderId: order._id.toString().slice(-6).toUpperCase(),
      total: order.total,
      pdfBuffer,
    });
  } catch (err) {
    console.error('[order] pdf/email step failed:', err.message);
  }

  res.json({ order, emailSent: mailResult.delivered });
}

async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
}

/** Soft-cancels one line item within one of the current user's orders, and calculates a simulated refund. */
async function cancelBookingItem(req, res) {
  const { orderId, itemId } = req.params;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });

  const item = order.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Booking not found.' });
  if (item.status !== 'upcoming') {
    return res.status(400).json({ message: 'Only upcoming bookings can be cancelled.' });
  }

  const lineTotal = item.price * item.qty;
  const { amount: refundAmount, rate } = calculateRefund(lineTotal, order.visitDate);

  item.status = 'cancelled';
  item.refundAmount = refundAmount;
  item.cancelledAt = new Date();
  await order.save();

  let refundMessage;
  if (refundAmount <= 0) {
    refundMessage = `"${item.ticketName}" has been cancelled. Since the visit date has already passed, this booking isn't eligible for a refund.`;
  } else if (rate === 1) {
    refundMessage = `"${item.ticketName}" has been cancelled. A full refund of Rs. ${refundAmount.toFixed(2)} will be credited to your original payment method within 5-7 business days.`;
  } else {
    refundMessage = `"${item.ticketName}" has been cancelled. Since it's within 24 hours of your visit date, a partial refund of Rs. ${refundAmount.toFixed(2)} (50%) will be credited to your original payment method within 5-7 business days.`;
  }

  res.json({ order, refundAmount, refundMessage });
}

/** Streams the PDF for a paid order - the owner or an admin may download it. */
async function downloadPdf(req, res) {
  const order = await Order.findById(req.params.orderId).populate('user', 'name email');
  if (!order) return res.status(404).send('Order not found.');
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return res.status(403).send('Not allowed.');
  if (order.status !== 'paid') return res.status(400).send('This order has not been paid yet.');

  const pdfBuffer = await buildTicketPdf({ order, user: order.user });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="ticket-order-${order._id.toString().slice(-6)}.pdf"`);
  res.send(pdfBuffer);
}

module.exports = { checkout, pay, myOrders, cancelBookingItem, downloadPdf };
