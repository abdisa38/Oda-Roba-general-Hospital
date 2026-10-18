const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  amharicName: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
  birth: { type: String, default: 'Birth date not recorded' },
  dob: { type: String, default: '' },
  age: { type: Number, default: 30 },
  bloodGroup: { type: String, default: 'O+' },
  contact: { type: String, default: 'No contact recorded' },
  phoneToken: { type: String, default: '' },
  residence: { type: String, default: 'Kebele 01, Bale Robe' },
  registered: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  emergencyName: { type: String, default: '' },
  emergencyPhone: { type: String, default: '' },
  relationship: { type: String, default: '' },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  activeStatus: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
