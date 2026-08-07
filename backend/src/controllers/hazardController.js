const Hazard = require('../models/Hazard');

// Get all active hazards
exports.getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name role');
    res.json(hazards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Post a new hazard report from IncidentReport.jsx
// Any logged-in user (citizen and up) can report a hazard.
exports.createHazard = async (req, res) => {
  try {
    const { hazardType, description, locationLabel, latitude, longitude, offlineSyncId } = req.body;

    if (!hazardType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'hazardType, latitude and longitude are required' });
    }

    const newHazard = await Hazard.create({
      hazardType,
      description,
      locationLabel,
      reportedBy: req.user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
      },
      offlineSyncId
    });

    const populated = await newHazard.populate('reportedBy', 'name role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/hazards/nearby?lat=9.93&lng=76.26&radius=3000
exports.getNearbyHazards = async (req, res) => {
    const { lat, lng, radius = 3000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        const hazards = await Hazard.find({
            status: 'active',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius)
                }
            }
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: hazards.length, data: hazards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/hazards/:id (update status, etc.)
exports.updateHazard = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['active', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "active" or "resolved"' });
        }

        const hazard = await Hazard.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!hazard) {
            return res.status(404).json({ error: 'Hazard not found' });
        }
        res.json({ success: true, data: hazard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};