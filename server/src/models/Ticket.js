const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['individual', 'combo', 'offer'],
      default: 'individual',
    },
    price: { type: Number, required: true, min: 0 },
    // Optional original (pre-discount) price - shown struck through next to
    // the current price when set, same as the original site's "was" field.
    originalPrice: { type: Number, default: null },
    // Unit label shown after the price, e.g. "per person", "per family".
    perLabel: { type: String, default: 'per person' },
    // Optional short ribbon text, e.g. "BEST VALUE", "POPULAR".
    badge: { type: String, default: null },
    // Short feature bullets shown on the ticket card.
    bullets: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
