const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  quantity: { type: Number, required: true },
  manufacturer: { type: String, default: 'Ethiopian Pharmaceuticals Supply Agency (EPSA)' },
  status: { type: String, enum: ['Released', 'Quarantine', 'Expired'], default: 'Released' }
}, { _id: false });

const inventoryItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  itemCode: { type: String, required: true },
  genericName: { type: String, required: true },
  tradeName: { type: String, default: '' },
  category: { 
    type: String, 
    enum: [
      'Antibiotics',
      'Analgesics & Antipyretics',
      'Antihypertensives',
      'Antidiabetics',
      'Antimalarials',
      'Gastrointestinal',
      'Respiratory',
      'IV Fluids & Electrolytes',
      'Dermatological',
      'Vitamins & Supplements'
    ], 
    default: 'Antibiotics' 
  },
  dosageForm: { type: String, default: 'Tablet' },
  strength: { type: String, default: '500 mg' },
  usableQuantity: { type: Number, default: 0 },
  reorderThreshold: { type: Number, default: 100 },
  targetStockLevel: { type: Number, default: 500 },
  unitPrice: { type: Number, default: 25.00 },
  storageLocation: { type: String, default: 'Main Pharmacy - Shelf A1' },
  storageConditions: { type: String, default: 'Store below 25°C in a dry place' },
  description: { type: String, default: '' },
  stockStatus: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
  batches: [batchSchema]
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
