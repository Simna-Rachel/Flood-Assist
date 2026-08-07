const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  updateLocation,
  getMe,
  updateMe,
  requestRoleChange,
  listPendingRequests,
  approveRoleRequest,
  rejectRoleRequest
} = require('../controllers/userController');

// Existing feature — left untouched, no auth required (Dashboard sends this pre-login-check today).
router.post('/location', updateLocation);

// New: profile / settings
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

// New: role request + approval workflow
router.post('/request-role', requireAuth, requestRoleChange);
router.get('/pending-requests', requireAuth, listPendingRequests);
router.post('/approve/:userId', requireAuth, approveRoleRequest);
router.post('/reject/:userId', requireAuth, rejectRoleRequest);

module.exports = router;
