const express = require('express');
const { register, login, me, updateProfile, changePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
router.put('/me/password', requireAuth, changePassword);

module.exports = router;
