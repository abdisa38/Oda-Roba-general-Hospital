// ORHIMS — Phase 07, Prompt 39: Stock Movements and Stock Receiving Data Model
// Oda Roba General Hospital — Main Pharmacy & Central Medical Store (Bale Robe, Ethiopia)

export type MovementType =
  | "Stock Received"
  | "Dispensed"
  | "Returned"
  | "Transferred"
  | "Adjustment"
  | "Quarantined"
  | "Released from Quarantine"
  | "Expired or Removed from Usable Stock"

export type MovementStatus = "Posted" | "Draft" | "Under Review" | "Reversed"

export interface StockMovementLineItem {
  id: string
  medicineId: string
  medicineName: string
  genericName: string
  medicineCode: string
  strength: string
  dosageForm: string
  batchNumber: string
  manufactureDate?: string
  expiryDate: string
  quantity: number
  unitOfMeasure: string
  storageLocation: string
  unitCostETB?: number
  previousQuantity?: number
  resultingQuantity?: number
  notes?: string
}

export interface StockMovementRecord {
  id: string // e.g. "TXN-REC-2026-00142"
  referenceNumber: string // e.g. "GRN-2026-00142" or "RX-2026-00125"
  movementType: MovementType
  status: MovementStatus
  timestamp: string // e.g. "16 Oct 2026 · 11:30 AM"
  date: string // ISO "2026-10-16"
  performedBy: string // e.g. "Ato Bekele Tolosa, RPh"
  receivingDetails?: {
    supplierOrSource: string // e.g. "EPSA Regional Hub (Adama)"
    deliveryNoteNumber: string // e.g. "DN-88492-AD"
    receivingStore: string // e.g. "Main Pharmacy Dispensary"
    verifiedBy: string
  }
  transferDetails?: {
    sourceLocation: string
    destinationLocation: string
  }
  adjustmentDetails?: {
    reason: string // e.g. "Breakage / damaged ampoules", "Physical count discrepancy"
    approvalRef: string
  }
  items: StockMovementLineItem[]
  summaryNotes: string
  auditEvents: {
    timestamp: string
    action: string
    actor: string
    notes?: string
  }[]
}

export const SUPPLIERS_SOURCES = [
  "EPSA Regional Hub (Adama)",
  "Central Medical Store (Oda Roba)",
  "EPHARM (Ethiopian Pharmaceuticals Mfg)",
  "Direct Donation (WHO / UNICEF)",
  "Cadila Pharmaceuticals Ethiopia",
  "Oromia Regional Health Bureau Depot",
  "Emergency Mutual Aid Loan (Robe Hospital)",
] as const

export const STORAGE_LOCATIONS = [
  "Main Pharmacy Dispensary",
  "Dispensary / Shelf A-04",
  "Dispensary / Fast-Mover Shelf B-01",
  "Dispensary / Shelf C-02",
  "Dispensary / Injection Bay",
  "Quarantine Store / Locked Cabinet Q-01",
  "Cold Chain Refrigerator 1 (2°C - 8°C)",
  "IV Fluid Rack / Bulk Bay F-01",
  "Emergency Drug Cupboard E-02",
  "Central Medical Store",
] as const

export const ADJUSTMENT_REASONS = [
  "Physical inventory count reconciliation (gain)",
  "Physical inventory count reconciliation (shortage)",
  "Accidental breakage / shattered ampoules",
  "Packaging seal compromised / rejected",
  "Quarantine segregation (quality inspection)",
  "Disposal of expired inventory following board approval",
] as const

/**
 * Demonstration transaction dataset for Oda Roba General Hospital
 * Realistic stock movements traceable to dispensary and receipt workflows.
 */
export const DEMO_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: "TXN-REC-2026-00142",
    referenceNumber: "GRN-2026-00142",
    movementType: "Stock Received",
    status: "Posted",
    timestamp: "16 Oct 2026 · 09:30 AM",
    date: "2026-10-16",
    performedBy: "Ato Bekele Tolosa, RPh",
    receivingDetails: {
      supplierOrSource: "EPSA Regional Hub (Adama)",
      deliveryNoteNumber: "DN-EPSA-99214-B",
      receivingStore: "Main Pharmacy Dispensary",
      verifiedBy: "Sr. Pharmacist Tigist Mengistu",
    },
    items: [
      {
        id: "LINE-142-1",
        medicineId: "MED-0104",
        medicineName: "Amoxicillin 500mg Capsules",
        genericName: "Amoxicillin Trihydrate",
        medicineCode: "AMX-500",
        strength: "500 mg",
        dosageForm: "Capsule",
        batchNumber: "LOT-AMX-2026-02",
        manufactureDate: "01 Aug 2026",
        expiryDate: "15 Aug 2028",
        quantity: 500,
        unitOfMeasure: "Capsules",
        storageLocation: "Dispensary / Shelf A-04",
        unitCostETB: 4.8,
        previousQuantity: 180,
        resultingQuantity: 680,
        notes: "Consignment sealed; cold/dry storage verified upon arrival.",
      },
      {
        id: "LINE-142-2",
        medicineId: "MED-0107",
        medicineName: "Ceftriaxone 1g Powder for Injection",
        genericName: "Ceftriaxone Sodium",
        medicineCode: "CTX-1000",
        strength: "1 g",
        dosageForm: "Vial",
        batchNumber: "LOT-CTX-2026-01",
        manufactureDate: "12 May 2026",
        expiryDate: "20 May 2028",
        quantity: 300,
        unitOfMeasure: "Vials",
        storageLocation: "Dispensary / Injection Bay",
        unitCostETB: 48.0,
        previousQuantity: 85,
        resultingQuantity: 385,
        notes: "Verified physical vials intact without moisture damage.",
      },
      {
        id: "LINE-142-3",
        medicineId: "MED-0110",
        medicineName: "Oral Rehydration Salts (ORS) Sachets",
        genericName: "Sodium Chloride, Trisodium Citrate, KCl, Glucose",
        medicineCode: "ORS-205",
        strength: "20.5 g / 1 Litre",
        dosageForm: "Sachet",
        batchNumber: "LOT-ORS-2026-03",
        manufactureDate: "10 Jun 2026",
        expiryDate: "30 Jun 2029",
        quantity: 1000,
        unitOfMeasure: "Sachets",
        storageLocation: "Dispensary / Fast-Mover Shelf B-01",
        unitCostETB: 3.5,
        previousQuantity: 620,
        resultingQuantity: 1620,
        notes: "Bulk carton received in dry condition.",
      },
    ],
    summaryNotes:
      "Quarterly EPSA scheduled allocation for essential antimicrobials and rehydration salts.",
    auditEvents: [
      {
        timestamp: "16 Oct 2026 · 09:15 AM",
        action: "Consignment Inspected & Counted",
        actor: "Sr. Pharmacist Tigist Mengistu",
        notes: "3 cartons unsealed and verified against Delivery Note DN-EPSA-99214-B.",
      },
      {
        timestamp: "16 Oct 2026 · 09:30 AM",
        action: "Stock Receipt Posted to Inventory",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Initial receiving transaction posted. Usable stock increased.",
      },
    ],
  },
  {
    id: "TXN-DSP-2026-00125",
    referenceNumber: "RX-2026-00125",
    movementType: "Dispensed",
    status: "Posted",
    timestamp: "16 Oct 2026 · 10:50 AM",
    date: "2026-10-16",
    performedBy: "Ato Bekele Tolosa, RPh",
    items: [
      {
        id: "LINE-125-1",
        medicineId: "MED-0205",
        medicineName: "Calcium Gluconate 10% Injection",
        genericName: "Calcium Gluconate",
        medicineCode: "CG-10ML",
        strength: "10% (10ml)",
        dosageForm: "Ampoule",
        batchNumber: "LOT-CG-2025-04",
        expiryDate: "14 Jul 2027",
        quantity: -2,
        unitOfMeasure: "Ampoules",
        storageLocation: "Emergency Drug Cupboard E-02",
        previousQuantity: 26,
        resultingQuantity: 24,
        notes: "STAT delivery for Emergency Resuscitation Room.",
      },
    ],
    summaryNotes: "Emergency dispensing to patient Solomon Desta (MRN: ORH-2026-0941).",
    auditEvents: [
      {
        timestamp: "16 Oct 2026 · 10:48 AM",
        action: "Prescription Dispense Authorization",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Physician telephone verification confirmed 2x 10ml ampoules STAT.",
      },
      {
        timestamp: "16 Oct 2026 · 10:50 AM",
        action: "Inventory Deduction Recorded",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Stock reduced from Emergency Cupboard E-02.",
      },
    ],
  },
  {
    id: "TXN-QRN-2026-00088",
    referenceNumber: "QRN-2026-00088",
    movementType: "Quarantined",
    status: "Posted",
    timestamp: "15 Oct 2026 · 03:15 PM",
    date: "2026-10-15",
    performedBy: "Sr. Pharmacist Tigist Mengistu",
    adjustmentDetails: {
      reason: "Quarantine segregation (expired batch removal)",
      approvalRef: "QA-INSP-2026-019",
    },
    items: [
      {
        id: "LINE-088-1",
        medicineId: "MED-0108",
        medicineName: "Doxycycline 100mg Capsules",
        genericName: "Doxycycline Hyclate",
        medicineCode: "DOX-100",
        strength: "100 mg",
        dosageForm: "Capsule",
        batchNumber: "LOT-DOX-2024-03",
        expiryDate: "10 Oct 2026",
        quantity: -120,
        unitOfMeasure: "Capsules",
        storageLocation: "Quarantine Store / Locked Cabinet Q-01",
        previousQuantity: 120,
        resultingQuantity: 0,
        notes:
          "Batch reached expiration on 10 Oct 2026. Transferred to segregated locked quarantine cabinet pending destruction protocol.",
      },
    ],
    summaryNotes:
      "Automated policy quarantine: 120 capsules removed from usable dispensing stock.",
    auditEvents: [
      {
        timestamp: "15 Oct 2026 · 03:10 PM",
        action: "Expiry Alert Flagged",
        actor: "ORHIMS Expiry Monitor",
        notes: "Batch LOT-DOX-2024-03 reached 0 days remaining.",
      },
      {
        timestamp: "15 Oct 2026 · 03:15 PM",
        action: "Physical Transfer to Quarantine",
        actor: "Sr. Pharmacist Tigist Mengistu",
        notes: "Locked in Cabinet Q-01 with red quarantine tags.",
      },
    ],
  },
  {
    id: "TXN-TRN-2026-00054",
    referenceNumber: "TRN-2026-00054",
    movementType: "Transferred",
    status: "Posted",
    timestamp: "15 Oct 2026 · 11:00 AM",
    date: "2026-10-15",
    performedBy: "Pharmacist Assistant Hailu Regassa",
    transferDetails: {
      sourceLocation: "Central Medical Store",
      destinationLocation: "Emergency Drug Cupboard E-02",
    },
    items: [
      {
        id: "LINE-054-1",
        medicineId: "MED-0205",
        medicineName: "Calcium Gluconate 10% Injection",
        genericName: "Calcium Gluconate",
        medicineCode: "CG-10ML",
        strength: "10% (10ml)",
        dosageForm: "Ampoule",
        batchNumber: "LOT-CG-2025-04",
        expiryDate: "14 Jul 2027",
        quantity: 20,
        unitOfMeasure: "Ampoules",
        storageLocation: "Emergency Drug Cupboard E-02",
        notes: "Internal replenishment transfer to meet emergency minimum buffer of 20 units.",
      },
    ],
    summaryNotes: "Internal transfer from Central Medical Store to Emergency Ward.",
    auditEvents: [
      {
        timestamp: "15 Oct 2026 · 10:45 AM",
        action: "Transfer Request Approved",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Requisition signed by ED Charge Nurse.",
      },
      {
        timestamp: "15 Oct 2026 · 11:00 AM",
        action: "Physical Relocation Acknowledged",
        actor: "Pharmacist Assistant Hailu Regassa",
        notes: "Handed over and verified in Emergency Cupboard E-02.",
      },
    ],
  },
  {
    id: "TXN-ADJ-2026-00031",
    referenceNumber: "ADJ-2026-00031",
    movementType: "Adjustment",
    status: "Posted",
    timestamp: "14 Oct 2026 · 04:45 PM",
    date: "2026-10-14",
    performedBy: "Ato Bekele Tolosa, RPh",
    adjustmentDetails: {
      reason: "Physical inventory count reconciliation (gain)",
      approvalRef: "AUDIT-CYCLE-2026-W41",
    },
    items: [
      {
        id: "LINE-031-1",
        medicineId: "MED-0105",
        medicineName: "Paracetamol 500mg Tablets",
        genericName: "Paracetamol (Acetaminophen)",
        medicineCode: "PCM-500",
        strength: "500 mg",
        dosageForm: "Tablet",
        batchNumber: "LOT-PCM-2025-06",
        expiryDate: "18 Nov 2027",
        quantity: 100,
        unitOfMeasure: "Tablets",
        storageLocation: "Dispensary / Fast-Mover Shelf B-01",
        previousQuantity: 2350,
        resultingQuantity: 2450,
        notes:
          "Weekly physical cycle count uncovered 1 unopened strip pack (100 tablets) not recorded on previous receiving batch.",
      },
    ],
    summaryNotes: "Audit reconciliation following weekly fast-mover physical count.",
    auditEvents: [
      {
        timestamp: "14 Oct 2026 · 04:30 PM",
        action: "Cycle Count Discrepancy Logged",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Count indicated 2,450 vs system 2,350.",
      },
      {
        timestamp: "14 Oct 2026 · 04:45 PM",
        action: "Authorized Adjustment Committed",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Adjustment approved under weekly variance allowance (<2%).",
      },
    ],
  },
  {
    id: "TXN-DSP-2026-00109",
    referenceNumber: "RX-2026-00109",
    movementType: "Dispensed",
    status: "Posted",
    timestamp: "14 Oct 2026 · 11:20 AM",
    date: "2026-10-14",
    performedBy: "Ato Bekele Tolosa, RPh",
    items: [
      {
        id: "LINE-109-1",
        medicineId: "MED-0104",
        medicineName: "Amoxicillin 500mg Capsules",
        genericName: "Amoxicillin Trihydrate",
        medicineCode: "AMX-500",
        strength: "500 mg",
        dosageForm: "Capsule",
        batchNumber: "LOT-AMX-2025-01",
        expiryDate: "14 Jul 2027",
        quantity: -24,
        unitOfMeasure: "Capsules",
        storageLocation: "Dispensary / Shelf A-04",
        previousQuantity: 204,
        resultingQuantity: 180,
        notes: "Full course dispensed: 1 capsule TID x 8 days.",
      },
    ],
    summaryNotes: "Outpatient dispensing for Patient Fatuma Roba (MRN: ORH-2026-0712).",
    auditEvents: [
      {
        timestamp: "14 Oct 2026 · 11:18 AM",
        action: "Prescription Verified",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Dosage and duration validated for acute respiratory infection.",
      },
      {
        timestamp: "14 Oct 2026 · 11:20 AM",
        action: "Dispensed and Handed to Patient",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Patient counseling completed in Afan Oromo.",
      },
    ],
  },
  {
    id: "TXN-RET-2026-00018",
    referenceNumber: "RET-2026-00018",
    movementType: "Returned",
    status: "Posted",
    timestamp: "13 Oct 2026 · 02:15 PM",
    date: "2026-10-13",
    performedBy: "Sr. Pharmacist Tigist Mengistu",
    items: [
      {
        id: "LINE-018-1",
        medicineId: "MED-0110",
        medicineName: "Oral Rehydration Salts (ORS) Sachets",
        genericName: "Sodium Chloride, Trisodium Citrate, KCl, Glucose",
        medicineCode: "ORS-205",
        strength: "20.5 g / 1 Litre",
        dosageForm: "Sachet",
        batchNumber: "LOT-ORS-2025-02",
        expiryDate: "22 Sep 2027",
        quantity: 20,
        unitOfMeasure: "Sachets",
        storageLocation: "Dispensary / Fast-Mover Shelf B-01",
        previousQuantity: 600,
        resultingQuantity: 620,
        notes:
          "Returned from Pediatric Ward surplus following patient discharge. Sachets unopened and verified intact by inspecting pharmacist.",
      },
    ],
    summaryNotes:
      "Pediatric ward ward-stock return. Pharmacist visual assessment confirms integrity.",
    auditEvents: [
      {
        timestamp: "13 Oct 2026 · 02:00 PM",
        action: "Return Physical Assessment",
        actor: "Sr. Pharmacist Tigist Mengistu",
        notes: "Verified moisture barrier seals intact and expiration valid.",
      },
      {
        timestamp: "13 Oct 2026 · 02:15 PM",
        action: "Re-admitted to Usable Stock",
        actor: "Sr. Pharmacist Tigist Mengistu",
        notes: "Inventory balance restored on Fast-Mover Shelf B-01.",
      },
    ],
  },
  {
    id: "TXN-REC-2026-00139",
    referenceNumber: "GRN-2026-00139",
    movementType: "Stock Received",
    status: "Posted",
    timestamp: "11 Oct 2026 · 10:15 AM",
    date: "2026-10-11",
    performedBy: "Ato Bekele Tolosa, RPh",
    receivingDetails: {
      supplierOrSource: "EPHARM (Ethiopian Pharmaceuticals Mfg)",
      deliveryNoteNumber: "EPH-DEL-2026-881",
      receivingStore: "Main Pharmacy Dispensary",
      verifiedBy: "Ato Bekele Tolosa, RPh",
    },
    items: [
      {
        id: "LINE-139-1",
        medicineId: "MED-0105",
        medicineName: "Paracetamol 500mg Tablets",
        genericName: "Paracetamol (Acetaminophen)",
        medicineCode: "PCM-500",
        strength: "500 mg",
        dosageForm: "Tablet",
        batchNumber: "LOT-PCM-2026-01",
        manufactureDate: "15 Sep 2026",
        expiryDate: "15 Sep 2029",
        quantity: 2000,
        unitOfMeasure: "Tablets",
        storageLocation: "Dispensary / Fast-Mover Shelf B-01",
        unitCostETB: 0.85,
        previousQuantity: 350,
        resultingQuantity: 2350,
        notes: "Direct hospital delivery of 20x 100-tablet boxes.",
      },
    ],
    summaryNotes: "Emergency replenishment order of Paracetamol analgesic tablets.",
    auditEvents: [
      {
        timestamp: "11 Oct 2026 · 10:00 AM",
        action: "Goods Received & Inspected",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "20 manufacturer boxes verified against invoice EPH-DEL-2026-881.",
      },
      {
        timestamp: "11 Oct 2026 · 10:15 AM",
        action: "Receipt Posted",
        actor: "Ato Bekele Tolosa, RPh",
        notes: "Stock ledger updated.",
      },
    ],
  },
]
