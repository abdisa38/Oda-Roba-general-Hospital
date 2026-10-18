const mongoose = require('mongoose');

const inpatientBedSchema = new mongoose.Schema({
  bedId: { type: String, required: true, unique: true },
  ward: { 
    type: String, 
    enum: ['Medical Ward', 'Surgical Ward', 'Pediatric Ward', 'Maternity Ward', 'Emergency Observation', 'ICU'], 
    required: true 
  },
  bedNumber: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'], default: 'Available' },
  patientId: { type: String, default: '' },
  patientName: { type: String, default: '' },
  admissionDate: { type: String, default: '' },
  attendingPhysician: { type: String, default: '' },
  primaryNurse: { type: String, default: '' },
  triageCategory: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('InpatientBed', inpatientBedSchema);
