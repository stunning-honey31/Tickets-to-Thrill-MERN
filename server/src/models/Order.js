const mongoose = require('mongoose');

// One line item = one "booking" in the original PHP app's language.
// Its own status tracks the ticket's lifecycle (pending payment -> an
// upcoming visit -> completed/cancelled), independently of the order's
// own payment status.
const itemSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    ticketName: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending_payment', 'upcoming', 'completed', 'cancelled'],
      default: 'pending_payment',
    },
    // Set when a booking is cancelled, so the refund amount/policy applied
    // is recorded rather than recomputed differently later.
    refundAmount: { type: Number, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [itemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentRef: { type: String, default: null },
    // The date the visitor plans to come to the park - collected at
    // checkout, shown on the ticket/PDF, and used to work out refund
    // eligibility when a booking is cancelled.
    visitDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
