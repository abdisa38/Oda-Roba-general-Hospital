const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: { type: String, default: 'Consultation' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const billingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  department: { type: String, default: 'Outpatient Clinic' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partially Paid'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Telebirr', 'CBE Birr', 'Cash', 'Insurance', 'Pending'], default: 'Pending' },
  referenceNumber: { type: String, default: '' },
  cashierName: { type: String, default: 'Almaz Kebede' },
  items: [billItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
