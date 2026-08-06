const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/userController');

router.post('/location', updateLocation);

module.exports = router;
