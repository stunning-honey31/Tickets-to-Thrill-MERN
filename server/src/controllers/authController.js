const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { vName, vEmail, vPhone, vPassword } = require('../utils/validators');

const LOCK_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

async function register(req, res) {
  const { name, email, phone, password } = req.body;

  if (!vName(name)) return res.status(400).json({ message: 'Please enter a valid name (2-120 letters).' });
  if (!vEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!vPhone(phone)) return res.status(400).json({ message: 'Please enter a valid phone number.' });
  if (!vPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8-72 characters with at least one letter and one number.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'An account with that email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), phone: phone || '', passwordHash });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const secs = Math.ceil((user.lockedUntil - new Date()) / 1000);
    return res.status(429).json({ message: `Too many failed attempts. Try again in ${secs}s.` });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  const { name, phone } = req.body;
  if (!vName(name)) return res.status(400).json({ message: 'Please enter a valid name.' });
  if (!vPhone(phone)) return res.status(400).json({ message: 'Please enter a valid phone number.' });

  req.user.name = name.trim();
  req.user.phone = phone || '';
  await req.user.save();
  res.json({ user: req.user });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const ok = await bcrypt.compare(currentPassword || '', user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (!vPassword(newPassword)) {
    return res.status(400).json({ message: 'New password must be 8-72 characters with at least one letter and one number.' });
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated.' });
}

module.exports = { register, login, me, updateProfile, changePassword };
