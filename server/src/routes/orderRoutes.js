const express = require('express');
const { checkout, pay, myOrders, cancelBookingItem, downloadPdf } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', requireAuth, checkout);
router.post('/pay', requireAuth, pay);
router.get('/mine', requireAuth, myOrders);
router.post('/:orderId/items/:itemId/cancel', requireAuth, cancelBookingItem);
router.get('/:orderId/pdf', requireAuth, downloadPdf);

module.exports = router;
