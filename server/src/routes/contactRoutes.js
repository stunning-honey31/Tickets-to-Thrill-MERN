const express = require('express');
const { submitMessage } = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitMessage);

module.exports = router;
