const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const ClinicalRecord = require('../models/ClinicalRecord');
const Diagnosis = require('../models/Diagnosis');
const Prescription = require('../models/Prescription');
const LabOrder = require('../models/LabOrder');
const InventoryItem = require('../models/Inventory');
const Billing = require('../models/Billing');
const InpatientBed = require('../models/Inpatient');

// ==========================================
// 1. HEALTH & METRICS
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    hospital: 'Oda Roba General Hospital',
    location: 'Bale Robe, Oromia, Ethiopia',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. PATIENTS CRUD
// ==========================================
router.get('/patients', async (req, res) => {
  try {
    const { q, scope, sort = 'registered', order = 'desc' } = req.query;
    let filter = {};

    if (q && q.trim()) {
      const term = q.trim();
      const regex = new RegExp(term, 'i');
      if (scope === 'id') filter.id = regex;
      else if (scope === 'name') filter.name = regex;
      else if (scope === 'phone') filter.phoneToken = regex;
      else {
        filter.$or = [
          { id: regex },
          { name: regex },
          { contact: regex },
          { phoneToken: regex },
          { residence: regex }
        ];
      }
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sort === 'name' ? 'name' : sort === 'id' ? 'id' : 'registered';

    const patients = await Patient.find(filter).sort({ [sortField]: sortOrder });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const id = req.body.id || `ORH-2026-${String(100 + count + 1).padStart(5, '0')}`;
    const patient = new Patient({
      ...req.body,
      id
    });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ id: req.params.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient archived and removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. STAFF USERS & AUTH
// ==========================================
router.get('/staff', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const count = await User.countDocuments();
    const id = req.body.id || `USR-${String(count + 1).padStart(3, '0')}`;
    const user = new User({ ...req.body, id });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Staff user not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Staff user not found' });
    res.json({ message: 'Staff user removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password, roleId } = req.body;
    let query = {};
    if (username) query.username = username.toLowerCase().trim();
    if (roleId && !username) query.roleId = roleId;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or staff record not found' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        roleTitle: user.roleTitle,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        avatarInitials: user.avatarInitials,
        isProtectedAdmin: user.isProtectedAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. APPOINTMENTS CRUD
// ==========================================
router.get('/appointments', async (req, res) => {
  try {
    const { patientId, doctorId, status, date } = req.query;
    let filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    const id = req.body.id || `APT-2026-${String(100 + count + 1).padStart(4, '0')}`;
    const apt = new Appointment({ ...req.body, id });
    await apt.save();
    res.status(201).json(apt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const apt = await Appointment.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(apt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/appointments/:id', async (req, res) => {
  try {
    const apt = await Appointment.findOneAndDelete({ id: req.params.id });
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled and removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. QUEUE CRUD
// ==========================================
router.get('/queue', async (req, res) => {
  try {
    const items = await Queue.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/queue', async (req, res) => {
  try {
    const count = await Queue.countDocuments();
    const id = req.body.id || `Q-${String(count + 1).padStart(3, '0')}`;
    const qItem = new Queue({ ...req.body, id });
    await qItem.save();
    res.status(201).json(qItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/queue/:id', async (req, res) => {
  try {
    const qItem = await Queue.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!qItem) return res.status(404).json({ error: 'Queue ticket not found' });
    res.json(qItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/queue/:id', async (req, res) => {
  try {
    const qItem = await Queue.findOneAndDelete({ id: req.params.id });
    if (!qItem) return res.status(404).json({ error: 'Queue ticket not found' });
    res.json({ message: 'Ticket removed from queue', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. CLINICAL RECORDS / MEDICAL HISTORY
// ==========================================
router.get('/clinical', async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const records = await ClinicalRecord.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clinical', async (req, res) => {
  try {
    const count = await ClinicalRecord.countDocuments();
    const id = req.body.id || `ENC-2026-${String(840 + count + 1).padStart(4, '0')}`;
    const record = new ClinicalRecord({ ...req.body, id });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/clinical/:id', async (req, res) => {
  try {
    const record = await ClinicalRecord.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. DIAGNOSES CRUD
// ==========================================
router.get('/diagnoses', async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const items = await Diagnosis.find(filter).sort({ documentedDate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/diagnoses', async (req, res) => {
  try {
    const count = await Diagnosis.countDocuments();
    const id = req.body.id || `DX-${String(1000 + count + 1)}`;
    const diag = new Diagnosis({ ...req.body, id });
    await diag.save();
    res.status(201).json(diag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/diagnoses/:id', async (req, res) => {
  try {
    const diag = await Diagnosis.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!diag) return res.status(404).json({ error: 'Diagnosis not found' });
    res.json(diag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/diagnoses/:id', async (req, res) => {
  try {
    const diag = await Diagnosis.findOneAndDelete({ id: req.params.id });
    if (!diag) return res.status(404).json({ error: 'Diagnosis not found' });
    res.json({ message: 'Diagnosis removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. PRESCRIPTIONS CRUD
// ==========================================
router.get('/prescriptions', async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let filter = {};
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    const rxs = await Prescription.find(filter).sort({ date: -1 });
    res.json(rxs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/prescriptions', async (req, res) => {
  try {
    const count = await Prescription.countDocuments();
    const id = req.body.id || `RX-2026-${String(40 + count + 1).padStart(4, '0')}`;
    const rx = new Prescription({ ...req.body, id });
    await rx.save();
    res.status(201).json(rx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/prescriptions/:id', async (req, res) => {
  try {
    const rx = await Prescription.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/prescriptions/:id', async (req, res) => {
  try {
    const rx = await Prescription.findOneAndDelete({ id: req.params.id });
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription cancelled', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. LAB ORDERS & RESULTS CRUD
// ==========================================
router.get('/lab', async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let filter = {};
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    const orders = await LabOrder.find(filter).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lab', async (req, res) => {
  try {
    const count = await LabOrder.countDocuments();
    const id = req.body.id || `LAB-2026-${String(310 + count + 1).padStart(4, '0')}`;
    const order = new LabOrder({ ...req.body, id });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/lab/:id', async (req, res) => {
  try {
    const order = await LabOrder.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Lab order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/lab/:id', async (req, res) => {
  try {
    const order = await LabOrder.findOneAndDelete({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Lab order not found' });
    res.json({ message: 'Lab order cancelled', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. PHARMACY INVENTORY CRUD
// ==========================================
router.get('/inventory', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { genericName: regex },
        { tradeName: regex },
        { itemCode: regex },
        { category: regex }
      ];
    }
    if (category && category !== 'All Categories') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.stockStatus = status;
    }

    const items = await InventoryItem.find(filter).sort({ genericName: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const count = await InventoryItem.countDocuments();
    const id = req.body.id || `MED-${String(100 + count + 1)}`;
    const item = new InventoryItem({ ...req.body, id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Medicine item archived and removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. BILLING & INVOICES CRUD
// ==========================================
router.get('/billing', async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let filter = {};
    if (patientId) filter.patientId = patientId;
    if (status) filter.paymentStatus = status;
    const bills = await Billing.find(filter).sort({ date: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/billing', async (req, res) => {
  try {
    const count = await Billing.countDocuments();
    const id = req.body.id || `INV-2026-${String(520 + count + 1).padStart(4, '0')}`;
    const bill = new Billing({ ...req.body, id });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/billing/:id', async (req, res) => {
  try {
    const bill = await Billing.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Invoice not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 12. INPATIENT BEDS & WARDS
// ==========================================
router.get('/inpatient', async (req, res) => {
  try {
    const { ward, status } = req.query;
    let filter = {};
    if (ward) filter.ward = ward;
    if (status) filter.status = status;
    const beds = await InpatientBed.find(filter).sort({ bedNumber: 1 });
    res.json(beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/inpatient/:bedId', async (req, res) => {
  try {
    const bed = await InpatientBed.findOneAndUpdate(
      { bedId: req.params.bedId },
      { $set: req.body },
      { new: true }
    );
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    res.json(bed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
