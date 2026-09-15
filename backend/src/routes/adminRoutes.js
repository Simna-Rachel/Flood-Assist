const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes below this line so only authenticated users/admins can access them
// router.use(authMiddleware);

// Admin-only endpoints (examples for your project)
// router.get('/dashboard-stats', getAdminStats);
// router.get('/pending-approvals', getPendingApprovals);
// router.put('/approve-hazard/:id', approveHazard);

module.exports = router;