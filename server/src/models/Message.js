const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true },
    message: { type: String, required: true, minlength: 10, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
