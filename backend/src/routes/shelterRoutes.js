const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
    getNearbyShelters,
    getAllShelters,
    createShelter,
    getShelterById,
    updateShelter
} = require('../controllers/shelterController');

// Public routes — everyone (including Citizens) can view shelters.
router.get('/nearby', getNearbyShelters);
router.get('/', getAllShelters);
router.get('/:id', getShelterById);

// Publishing/editing a shelter is restricted — Citizens can view only.
router.post('/', requireAuth, requireRole('volunteer', 'ward_member', 'official', 'admin'), createShelter);
router.patch('/:id', requireAuth, requireRole('volunteer', 'ward_member', 'official', 'admin'), updateShelter);

module.exports = router;
