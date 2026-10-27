const express = require('express');
const { listTickets } = require('../controllers/ticketController');

const router = express.Router();

router.get('/', listTickets);

module.exports = router;
