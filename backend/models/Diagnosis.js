const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  code: { type: String, required: true }, // ICD-10 Code
  name: { type: String, required: true },
  type: { type: String, enum: ['Primary', 'Secondary', 'Differential'], default: 'Primary' },
  status: { type: String, enum: ['Active', 'Resolved', 'Chronic'], default: 'Active' },
  onsetDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  notes: { type: String, default: '' },
  documentedBy: { type: String, default: 'Dr. Daniel Abate' },
  documentedDate: { type: String, default: () => new Date().toISOString().slice(0, 10) }
}, { timestamps: true });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
