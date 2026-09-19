const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { createHazard, getHazards } = require('../controllers/hazardController');

router.get('/', getHazards);
router.post('/report', requireAuth, upload.single('image'), createHazard);

module.exports = router;