const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
    getHazards,
    createHazard,
    getNearbyHazards,
    updateHazard
} = require('../controllers/hazardController');

// Public routes — anyone can see active hazards, logged in or not.
router.get('/nearby', getNearbyHazards);
router.get('/', getHazards);

// Any logged-in user (citizen and up) can report a hazard.
router.post('/', requireAuth, createHazard);

// Marking a hazard resolved is an elevated action, to stop random accounts
// from closing out real reports.
router.patch('/:id', requireAuth, requireRole('volunteer', 'ward_member', 'official', 'admin'), updateHazard);

module.exports = router;
