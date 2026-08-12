const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload'); // Adjust path if needed
const Hazard = require('../models/Hazard');

router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;

    const newHazard = new Hazard({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      imageUrl: imageUrl, // Saves Cloudinary URL directly
    });

    await newHazard.save();
    res.status(201).json({ success: true, hazard: newHazard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;