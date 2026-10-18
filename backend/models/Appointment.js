const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, default: '' },
  doctor: { type: String, required: true },
  doctorId: { type: String, default: '' },
  department: { type: String, default: 'General Medicine' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, default: 'In-Person Consultation' },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Confirmed', 'Checked-in', 'In-Progress', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  reason: { type: String, default: 'General Clinical Review' },
  priority: { type: String, default: 'Normal' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
