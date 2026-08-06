const UserLocation = require('../models/UserLocation');

// Handles POST /api/user/location
// Matches the payload sent from Dashboard.jsx: { lat, lng, email }
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
