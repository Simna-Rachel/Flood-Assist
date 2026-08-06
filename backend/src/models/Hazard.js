const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hazardType: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  offlineSyncId: { type: String }
}, { timestamps: true });

hazardSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hazard', hazardSchema);