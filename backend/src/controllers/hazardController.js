const Hazard = require('../models/Hazard');

// Create a new hazard report
exports.createHazard = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      hazardType, 
      severity, 
      location,
      locationLabel,
      latitude, 
      longitude 
    } = req.body;

    // 1. Image Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;

    // 2. Map hazardType (falls back to category if hazardType wasn't explicitly passed)
    const typeOfHazard = hazardType || category || 'General';

    // 3. Parse location object or build GeoJSON coordinates [lng, lat]
    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = null;
      }
    }

    // Ensure GeoJSON format: { type: 'Point', coordinates: [longitude, latitude] }
    if (!parsedLocation || !parsedLocation.coordinates) {
      const lat = parseFloat(latitude || (parsedLocation && parsedLocation.lat) || 0);
      const lng = parseFloat(longitude || (parsedLocation && parsedLocation.lng) || 0);

      parsedLocation = {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB expects [Longitude, Latitude]
      };
    }

    // 4. Save Hazard document
    const hazard = new Hazard({
      title,
      description,
      category: category || typeOfHazard,
      hazardType: typeOfHazard,
      severity: severity || 'Medium',
      locationLabel,
      location: parsedLocation,
      imageUrl,
      reportedBy: req.user ? (req.user.id || req.user._id) : null
    });

    await hazard.save();
    return res.status(201).json(hazard);

  } catch (error) {
    console.error('--- CREATE HAZARD ERROR ---');
    console.error(error);
    console.error('---------------------------');

    return res.status(500).json({
      message: 'Error creating hazard report',
      error: error.message
    });
  }
};

// Get all hazards
exports.getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json(hazards);
  } catch (error) {
    console.error('GET HAZARDS ERROR:', error);
    return res.status(500).json({
      message: 'Error fetching hazards',
      error: error.message
    });
  }
};