const mongoose = require('mongoose');

// Roles a user can actually hold at any given time.
const ROLES = ['citizen', 'volunteer', 'ward_member', 'official', 'admin'];

// Roles a citizen is allowed to request an upgrade to.
// (admin is never self-requestable — it must be granted manually in the DB.)
const REQUESTABLE_ROLES = ['volunteer', 'ward_member', 'official'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  address: { type: String },
  passwordHash: { type: String, required: true },

  // The role that is actually active / in effect right now.
  role: { type: String, enum: ROLES, default: 'citizen' },

  // Pending upgrade request (e.g. citizen -> volunteer). Null when there is none.
  requestedRole: { type: String, enum: REQUESTABLE_ROLES, default: null },
  roleStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  roleRejectionReason: { type: String, default: null },
  roleRequestedAt: { type: Date, default: null },
  roleDecidedAt: { type: Date, default: null },
  roleDecidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  languagePreference: { type: String, default: 'en' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  }
}, { timestamps: true });

userSchema.index({ currentLocation: '2dsphere' });

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    address: this.address,
    role: this.role,
    requestedRole: this.requestedRole,
    roleStatus: this.roleStatus,
    roleRejectionReason: this.roleRejectionReason,
    languagePreference: this.languagePreference,
    createdAt: this.createdAt
  };
};

userSchema.statics.ROLES = ROLES;
userSchema.statics.REQUESTABLE_ROLES = REQUESTABLE_ROLES;

module.exports = mongoose.model('User', userSchema);
