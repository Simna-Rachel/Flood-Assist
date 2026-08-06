const express = require('express');
const router = express.Router();
const { getHazards, createHazard } = require('../controllers/hazardController');

router.get('/', getHazards);
router.post('/', createHazard);

module.exports = router;