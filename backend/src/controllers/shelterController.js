const Shelter = require('../models/Shelter');

// GET /api/shelters/nearby?lat=9.93&lng=76.26&radius=5000
exports.getNearbyShelters = async (req, res) => {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        const shelters = await Shelter.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius)
                }
            }
        });
        res.json({ success: true, count: shelters.length, data: shelters });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/shelters (with optional district filter)
exports.getAllShelters = async (req, res) => {
    try {
        const { district } = req.query;
        const filter = district ? { district } : {};
        const shelters = await Shelter.find(filter).sort({ createdAt: -1 }).populate('addedBy', 'name role');
        res.json({ success: true, count: shelters.length, data: shelters });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/shelters
exports.createShelter = async (req, res) => {
    try {
        const { nameEn, nameMl, district, lat, lng, capacity, contactPhone, isVerified } = req.body;

        if (!nameEn || !lat || !lng || !capacity || !contactPhone) {
            return res.status(400).json({ error: 'Missing required fields: nameEn, lat, lng, capacity, contactPhone' });
        }

        const shelter = await Shelter.create({
            nameEn,
            nameMl: nameMl || nameEn,
            district,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            capacity: parseInt(capacity),
            contactPhone,
            isVerified: isVerified || false,
            addedBy: req.user._id
        });

        const populated = await shelter.populate('addedBy', 'name role');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/shelters/:id
exports.getShelterById = async (req, res) => {
    try {
        const shelter = await Shelter.findById(req.params.id);
        if (!shelter) {
            return res.status(404).json({ error: 'Shelter not found' });
        }
        res.json({ success: true, data: shelter });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/shelters/:id (update occupancy, status, etc.)
exports.updateShelter = async (req, res) => {
  try {
    const { currentOccupancy, status, baseVersion } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }

    const currentVersion = shelter.version || 0; // treat missing version as 0

    if (baseVersion !== undefined && Number(baseVersion) !== currentVersion) {
      return res.status(409).json({
        conflict: true,
        message: 'This shelter was updated by someone else since you last saw it.',
        serverRecord: shelter,
        yourChange: { currentOccupancy, status }
      });
    }

    if (currentOccupancy !== undefined) shelter.currentOccupancy = currentOccupancy;
    if (status !== undefined) shelter.status = status;
    shelter.version = currentVersion + 1; // <-- fixed: no more undefined + 1

    await shelter.save();
    res.json({ success: true, data: shelter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};