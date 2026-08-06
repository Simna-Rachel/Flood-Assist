const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'volunteer', 'official'], default: 'citizen' },
  languagePreference: { type: String, default: 'en' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  }
}, { timestamps: true });

userSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('User', userSchema);