const express = require('express');
const router = express.Router();
const {
    getNearbyShelters,
    getAllShelters,
    createShelter,
    getShelterById,
    updateShelter
} = require('../controllers/shelterController');

// Public routes
router.get('/nearby', getNearbyShelters);
router.get('/', getAllShelters);
router.get('/:id', getShelterById);

// Protected routes (add auth middleware later)
router.post('/', createShelter);
router.patch('/:id', updateShelter);

module.exports = router;