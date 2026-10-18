const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicineId: { type: String, default: '' },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: 'Take after meals' },
  dispensed: { type: Boolean, default: false }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, default: '' },
  doctorName: { type: String, required: true },
  department: { type: String, default: 'Outpatient Clinic' },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  status: { type: String, enum: ['Active', 'Dispensed', 'Discontinued', 'Pending'], default: 'Active' },
  diagnosis: { type: String, default: '' },
  notes: { type: String, default: '' },
  items: [prescriptionItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
