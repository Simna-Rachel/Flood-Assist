const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { verifyToken } = require('../middleware/authMiddleware');
const { createHazard, getHazards } = require('../controllers/hazardController');

router.get('/', getHazards);
router.post('/report', verifyToken, upload.single('image'), createHazard);

module.exports = router;