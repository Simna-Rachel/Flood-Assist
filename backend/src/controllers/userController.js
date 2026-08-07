const User = require('../models/User');
const UserLocation = require('../models/UserLocation');

// ---- Existing feature: GPS ping logging (unchanged behaviour) ----
// Handles POST /api/user/location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, email } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const entry = await UserLocation.create({ email, lat, lng });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---- New: profile (Settings page) ----

// GET /api/user/me
exports.getMe = async (req, res) => {
  res.json(req.user.toSafeJSON());
};

// PUT /api/user/me
// Body: any subset of { name, phone, address, languagePreference }
// Email and role are intentionally NOT editable here.
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, address, languagePreference } = req.body;

    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    if (languagePreference !== undefined) req.user.languagePreference = languagePreference;

    await req.user.save();
    res.json(req.user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---- New: role request / approval workflow ----

// Who is allowed to approve a given requested role.
// volunteer  -> approved by ward_member, official, or admin
// ward_member-> approved by official or admin
// official   -> approved by admin only
const APPROVER_ROLES_FOR = {
  volunteer: ['ward_member', 'official', 'admin'],
  ward_member: ['official', 'admin'],
  official: ['admin']
};

// POST /api/user/request-role
// Body: { requestedRole }
// Lets an already-registered citizen file (or refile) a role upgrade request.
exports.requestRoleChange = async (req, res) => {
  try {
    const { requestedRole } = req.body;

    if (!User.REQUESTABLE_ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid role requested' });
    }

    if (req.user.role !== 'citizen') {
      return res.status(400).json({ message: `You are already a ${req.user.role.replace('_', ' ')}` });
    }

    req.user.requestedRole = requestedRole;
    req.user.roleStatus = 'pending';
    req.user.roleRejectionReason = null;
    req.user.roleRequestedAt = new Date();
    req.user.roleDecidedAt = null;
    req.user.roleDecidedBy = null;

    await req.user.save();
    res.json(req.user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user/pending-requests
// Returns pending role requests this approver is allowed to act on.
exports.listPendingRequests = async (req, res) => {
  try {
    const approverRole = req.user.role;

    const rolesTheyCanApprove = Object.entries(APPROVER_ROLES_FOR)
      .filter(([, approvers]) => approvers.includes(approverRole))
      .map(([requested]) => requested);

    if (rolesTheyCanApprove.length === 0) {
      return res.json([]);
    }

    const pending = await User.find({
      roleStatus: 'pending',
      requestedRole: { $in: rolesTheyCanApprove }
    }).select('name email phone address requestedRole roleRequestedAt');

    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/approve/:userId
exports.approveRoleRequest = async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);

    if (!target || target.roleStatus !== 'pending' || !target.requestedRole) {
      return res.status(404).json({ message: 'No pending request found for this user' });
    }

    const allowedApprovers = APPROVER_ROLES_FOR[target.requestedRole] || [];
    if (!allowedApprovers.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to approve this role' });
    }

    target.role = target.requestedRole;
    target.roleStatus = 'approved';
    target.roleDecidedAt = new Date();
    target.roleDecidedBy = req.user._id;

    await target.save();
    res.json({ message: `${target.name} approved as ${target.role.replace('_', ' ')}`, user: target.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/reject/:userId
// Body: { reason }
exports.rejectRoleRequest = async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);

    if (!target || target.roleStatus !== 'pending' || !target.requestedRole) {
      return res.status(404).json({ message: 'No pending request found for this user' });
    }

    const allowedApprovers = APPROVER_ROLES_FOR[target.requestedRole] || [];
    if (!allowedApprovers.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to reject this role' });
    }

    target.roleStatus = 'rejected';
    target.roleRejectionReason = req.body.reason || 'Not specified';
    target.requestedRole = null;
    target.roleDecidedAt = new Date();
    target.roleDecidedBy = req.user._id;

    await target.save();
    res.json({ message: `Request rejected`, user: target.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
