const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/** Requires a valid `Authorization: Bearer <token>` header. Attaches req.user. */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired, please log in again.' });
  }
}

/** Must be used after requireAuth. Blocks anyone whose role isn't admin. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
