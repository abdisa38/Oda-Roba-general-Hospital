const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  testCode: { type: String, required: true },
  testName: { type: String, required: true },
  category: { type: String, default: 'Hematology' },
  resultValue: { type: String, default: '' },
  unit: { type: String, default: '' },
  referenceRange: { type: String, default: '' },
  flag: { type: String, enum: ['Normal', 'High', 'Low', 'Critical', 'Pending'], default: 'Pending' },
  status: { type: String, enum: ['Pending', 'Completed', 'Verified'], default: 'Pending' },
  technician: { type: String, default: '' },
  reviewedBy: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const labOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  orderingDoctor: { type: String, required: true },
  department: { type: String, default: 'Internal Medicine' },
  orderDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  priority: { type: String, enum: ['Routine', 'Urgent', 'Stat'], default: 'Routine' },
  status: { 
    type: String, 
    enum: ['Ordered', 'Specimen Collected', 'In-Analysis', 'Results Pending Review', 'Completed'], 
    default: 'Ordered' 
  },
  clinicalIndication: { type: String, default: '' },
  specimenType: { type: String, default: 'Whole Blood' },
  collectionDate: { type: String, default: '' },
  collectorName: { type: String, default: '' },
  tests: [labTestSchema]
}, { timestamps: true });

module.exports = mongoose.model('LabOrder', labOrderSchema);
