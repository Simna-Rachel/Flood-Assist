const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register User
// Body: { name, email, phone, address, password, requestedRole }
// requestedRole is optional. If omitted or 'citizen', the account is an
// active citizen immediately. If it's volunteer/ward_member/official, the
// account still starts as an active *citizen*, but a role request is filed
// for an appropriate approver to review (see userController.approveRoleRequest).
exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, password, requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const wantsUpgrade = requestedRole && User.REQUESTABLE_ROLES.includes(requestedRole);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      address,
      passwordHash,
      role: 'citizen',
      requestedRole: wantsUpgrade ? requestedRole : null,
      roleStatus: wantsUpgrade ? 'pending' : 'none',
      roleRequestedAt: wantsUpgrade ? new Date() : null
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Login User
// Body: { email, password }
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Deliberately vague message so we don't reveal whether the email exists.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
