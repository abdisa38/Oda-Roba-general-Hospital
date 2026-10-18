const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  roleId: { type: String, required: true },
  roleTitle: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, required: true },
  avatarInitials: { type: String, default: 'ST' },
  password: { type: String, default: 'orhims2026' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isProtectedAdmin: { type: Boolean, default: false },
  lastLogin: { type: String, default: 'Today' },
  twoFactorEnabled: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
