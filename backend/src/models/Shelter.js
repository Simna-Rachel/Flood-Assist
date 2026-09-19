const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameMl: { type: String, required: true },
  district: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'full', 'closed'], default: 'open' },
  contactPhone: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 0 }   // <-- ADD THIS
}, { timestamps: true });

shelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', shelterSchema);