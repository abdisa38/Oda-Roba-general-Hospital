const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ticketNumber: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  department: { type: String, default: 'General Outpatient' },
  assignedDoctor: { type: String, default: '' },
  priority: { type: String, enum: ['Emergency', 'Urgent', 'Standard'], default: 'Standard' },
  status: { type: String, enum: ['Waiting', 'Called', 'With Doctor', 'Completed', 'Cancelled'], default: 'Waiting' },
  room: { type: String, default: 'OPD-1' },
  arrivalTime: { type: String, default: '08:30 AM' },
  calledTime: { type: String, default: '' },
  estimatedWaitMinutes: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('Queue', queueSchema);
