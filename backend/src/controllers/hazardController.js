const Hazard = require('../models/Hazard');

// Get all active hazards
exports.getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(hazards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Post a new hazard report from IncidentReport.jsx
exports.createHazard = async (req, res) => {
  try {
    const { hazardType, description, latitude, longitude, offlineSyncId } = req.body;

    const newHazard = await Hazard.create({
      hazardType,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
      },
      offlineSyncId
    });

    res.status(201).json(newHazard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};