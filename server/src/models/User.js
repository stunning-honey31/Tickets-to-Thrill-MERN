const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190 },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
