const mongoose = require('mongoose');

// 1. User Location Schema
const userLocationSchema = new mongoose.Schema({
  email: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// 2. Report Schema
const reportSchema = new mongoose.Schema({
  user_email: { type: String },
  description: { type: String, required: true },
  location: { type: String },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  full_name: { type: String },
  phone: { type: String },
  role: { type: String, default: 'Citizen' }
});

// 4. Shelter Schema
const shelterSchema = new mongoose.Schema({
  district: { type: String, required: true },
  camp_name: { type: String, required: true },
  contact: { type: String },
  added_by: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Compile schemas into Models
const UserLocation = mongoose.model('UserLocation', userLocationSchema);
const Report = mongoose.model('Report', reportSchema);
const User = mongoose.model('User', userSchema);
const Shelter = mongoose.model('Shelter', shelterSchema);

// Export all models so index.js can use them
module.exports = {
  UserLocation,
  Report,
  User,
  Shelter
};

