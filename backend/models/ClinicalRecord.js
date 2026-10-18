const mongoose = require('mongoose');

const clinicalRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, default: '' },
  doctorName: { type: String, required: true },
  encounterType: { type: String, default: 'Outpatient Consultation' },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  vitals: {
    bp: { type: String, default: '120/80 mmHg' },
    pulse: { type: Number, default: 72 },
    temp: { type: Number, default: 36.6 },
    respRate: { type: Number, default: 18 },
    spo2: { type: Number, default: 98 },
    weight: { type: Number, default: 65 },
    height: { type: Number, default: 168 }
  },
  chiefComplaint: { type: String, default: '' },
  historyOfPresentIllness: { type: String, default: '' },
  physicalExam: { type: String, default: '' },
  assessmentNotes: { type: String, default: '' },
  plan: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Completed', 'Signed'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('ClinicalRecord', clinicalRecordSchema);
