const mongoose = require('mongoose');

// Stores live GPS pings sent from the Dashboard.jsx frontend.
// Kept separate from the main User model since the frontend currently
// identifies people by email (local login), not the phone-based User model.
const userLocationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('UserLocation', userLocationSchema);
