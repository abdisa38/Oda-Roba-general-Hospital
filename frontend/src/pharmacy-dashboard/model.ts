// ORHIMS — Phase 07, Prompt 36: Pharmacy Dashboard Data Model
// Oda Roba General Hospital — Main Outpatient Pharmacy (Bale Robe, Ethiopia)

export type PrescriptionPriority = "Routine" | "Urgent" | "STAT"
export type PrescriptionDispenseStatus =
  | "Pending"
  | "In Progress"
  | "Partially Dispensed"
  | "Dispensed"
  | "On Hold"
  | "Cancelled"

export interface PrescribedMedicine {
  name: string
  code: string
  dosageForm: string
  strength: string
  dose: string
  frequency: string
  duration: string
  quantityPrescribed: number
  quantityDispensed: number
  unit: string
  stockAvailable: number
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock"
  instructions: string
}

export interface PharmacyPrescription {
  id: string // e.g. "RX-2026-00124"
  patientName: string
  patientId: string // e.g. "ORH-P-000185"
  ageGender: string
  dob: string
  prescribingDepartment: string
  prescribingClinician: string
  prescriptionTime: string
  priority: PrescriptionPriority
  dispensingStatus: PrescriptionDispenseStatus
  medicines: PrescribedMedicine[]
  clinicalDiagnosisSummary?: string
  prescriberNotes?: string
  pharmacistNotes?: string
  pharmacistAssigned?: string
  paymentStatus: "Settled / Insured (CBHI)" | "Paid (Cash)" | "Exempt" | "Pending Payment"
}

export interface MedicineInventoryAlert {
  id: string
  name: string
  code: string
  dosageForm: string
  strength: string
  category: "Antibiotics" | "Analgesics / Antipyretics" | "Antimalarials" | "Cardiovascular / Endocrine" | "IV Fluids & Electrolytes" | "Gastrointestinal"
  usableQuantity: number
  physicalQuantity: number
  quarantinedQuantity: number
  unit: string
  reorderThreshold: number
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock" | "Restricted / Quarantined" | "Expired Present"
  location: string
  supplierRef: string
}

export interface ExpiryBatch {
  id: string
  medicineName: string
  dosageForm: string
  strength: string
  batchNumber: string
  quantity: number
  unit: string
  expiryDate: string
  daysRemaining: number
  status: "Expiring Soon" | "Expired" | "Quarantined / Unavailable"
  location: string
  quarantineReason?: string
}

export interface StockMovement {
  id: string
  movementReference: string
  medicineName: string
  type: "Stock Received" | "Dispensed" | "Stock Adjustment" | "Returned to Inventory" | "Transferred Between Stores"
  quantity: string
  unit: string
  timestamp: string
  responsibleUser: string
  referenceDocument: string
}

export interface PharmacyAlert {
  id: string
  title: string
  explanation: string
  severity: "High" | "Medium" | "Informational"
  reference: string
  timestamp: string
  actionLabel: string
  category: "Stock Out" | "STAT Order" | "Expiry Quarantined" | "Reorder Threshold" | "Audit Discrepancy"
}

/**
 * Fictional demonstration dataset for Oda Roba General Hospital
 * Main Pharmacy Department (Bale Robe, Oromia, Ethiopia).
 */
export const demoPrescriptions: PharmacyPrescription[] = [
  {
    id: "RX-2026-00125",
    patientName: "Almaz Kebede",
    patientId: "ORH-P-000192",
    ageGender: "62y / Female",
    dob: "11 Dec 1963",
    prescribingDepartment: "Emergency Department (Resuscitation)",
    prescribingClinician: "Dr. Yonas Girma, MD",
    prescriptionTime: "Today · 10:48 AM",
    priority: "STAT",
    dispensingStatus: "In Progress",
    paymentStatus: "Exempt",
    clinicalDiagnosisSummary: "Severe hyperkalemia (K+ 6.4 mmol/L) with acute renal insufficiency",
    prescriberNotes: "STAT EMERGENCY ORDER. Patient undergoing urgent ECG monitoring in Resus Bay 2.",
    pharmacistAssigned: "Ato Bekele Tolosa, RPh",
    medicines: [
      {
        name: "Calcium Gluconate 10% Injection",
        code: "MED-0205",
        dosageForm: "Injection Ampoule",
        strength: "10% (10 mL)",
        dose: "10 mL IV slow push over 5 mins",
        frequency: "Once STAT",
        duration: "Single dose",
        quantityPrescribed: 2,
        quantityDispensed: 2,
        unit: "Ampoules",
        stockAvailable: 24,
        stockStatus: "In Stock",
        instructions: "Administer with cardiac monitoring. Do not mix with carbonate solutions."
      },
      {
        name: "Salbutamol 5mg/mL Respirator Solution",
        code: "MED-0182",
        dosageForm: "Nebulizer Solution",
        strength: "5 mg / mL",
        dose: "10 mg via nebulizer over 15 mins",
        frequency: "Once STAT",
        duration: "Single dose",
        quantityPrescribed: 2,
        quantityDispensed: 0,
        unit: "Vials",
        stockAvailable: 45,
        stockStatus: "In Stock",
        instructions: "Driven by continuous 6L oxygen flow."
      },
      {
        name: "Furosemide 20mg/2mL Injection",
        code: "MED-0094",
        dosageForm: "Injection Ampoule",
        strength: "20 mg / 2 mL",
        dose: "40 mg IV push",
        frequency: "Once STAT",
        duration: "Single dose",
        quantityPrescribed: 2,
        quantityDispensed: 0,
        unit: "Ampoules",
        stockAvailable: 80,
        stockStatus: "In Stock",
        instructions: "Slow IV push over 2 minutes."
      }
    ]
  },
  {
    id: "RX-2026-00126",
    patientName: "Tolosa Desta",
    patientId: "ORH-P-000215",
    ageGender: "19y / Male",
    dob: "05 Mar 2007",
    prescribingDepartment: "Pediatric / Youth Consultation (OPD-1)",
    prescribingClinician: "Dr. Helen Tadesse, MD",
    prescriptionTime: "Today · 10:35 AM",
    priority: "Urgent",
    dispensingStatus: "Pending",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalDiagnosisSummary: "Confirmed P. falciparum Malaria (Lab: 2+ rings)",
    prescriberNotes: "Patient has high fever and body chills. Instruct on complete treatment course adherence.",
    medicines: [
      {
        name: "Artemether-Lumefantrine (Coartem)",
        code: "MED-0230",
        dosageForm: "Tablet",
        strength: "20 mg / 120 mg",
        dose: "4 tablets PO",
        frequency: "Twice daily (0h, 8h, then BID x 2 days)",
        duration: "3 days (6 total doses)",
        quantityPrescribed: 24,
        quantityDispensed: 0,
        unit: "Tablets",
        stockAvailable: 320,
        stockStatus: "In Stock",
        instructions: "Take with fatty food or milk for optimal absorption. Complete all 24 tablets."
      },
      {
        name: "Paracetamol 500mg Tablets",
        code: "MED-0021",
        dosageForm: "Tablet",
        strength: "500 mg",
        dose: "1,000 mg PO",
        frequency: "Every 8 hours as needed for fever",
        duration: "3 days",
        quantityPrescribed: 10,
        quantityDispensed: 0,
        unit: "Tablets",
        stockAvailable: 4200,
        stockStatus: "In Stock",
        instructions: "Do not exceed 4,000 mg in 24 hours. Keep hydrated."
      }
    ]
  },
  {
    id: "RX-2026-00124",
    patientName: "Abebe Bekele",
    patientId: "ORH-P-000185",
    ageGender: "51y / Male",
    dob: "18 Jun 1975",
    prescribingDepartment: "Non-Communicable Diseases (NCD Clinic)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionTime: "Today · 10:15 AM",
    priority: "Routine",
    dispensingStatus: "Pending",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalDiagnosisSummary: "Essential Hypertension & Dyslipidemia follow-up",
    prescriberNotes: "Monthly refill. Patient adheres well to evening statin dose.",
    medicines: [
      {
        name: "Atorvastatin 20mg Tablets",
        code: "MED-0118",
        dosageForm: "Tablet",
        strength: "20 mg",
        dose: "1 tablet PO",
        frequency: "Once daily at bedtime",
        duration: "30 days",
        quantityPrescribed: 30,
        quantityDispensed: 0,
        unit: "Tablets",
        stockAvailable: 450,
        stockStatus: "In Stock",
        instructions: "Take with or without food at night. Report unexpected muscle pain."
      },
      {
        name: "Amlodipine 5mg Tablets",
        code: "MED-0072",
        dosageForm: "Tablet",
        strength: "5 mg",
        dose: "1 tablet PO",
        frequency: "Once daily in the morning",
        duration: "30 days",
        quantityPrescribed: 30,
        quantityDispensed: 0,
        unit: "Tablets",
        stockAvailable: 600,
        stockStatus: "In Stock",
        instructions: "Take each morning. Check blood pressure weekly at health post."
      }
    ]
  },
  {
    id: "RX-2026-00128",
    patientName: "Fatuma Kedir",
    patientId: "ORH-P-000174",
    ageGender: "44y / Female",
    dob: "20 Aug 1982",
    prescribingDepartment: "Maternal Health Clinic (ANC)",
    prescribingClinician: "Dr. Aster Bekele, MD",
    prescriptionTime: "Today · 09:50 AM",
    priority: "Routine",
    dispensingStatus: "Partially Dispensed",
    paymentStatus: "Paid (Cash)",
    clinicalDiagnosisSummary: "Gestational Diabetes (FBS 142 mg/dL) & Iron deficiency",
    prescriberNotes: "Patient received initial insulin demonstration in ANC clinic.",
    pharmacistAssigned: "W/ro Selamawit Degu, Druggist",
    pharmacistNotes: "1 vial Insulin NPH dispensed immediately. Second refill vial on hold for next clinic visit.",
    medicines: [
      {
        name: "Insulin NPH (Human Isophane) 100 IU/mL",
        code: "MED-0160",
        dosageForm: "Subcutaneous Injection Vial",
        strength: "100 IU / mL (10 mL)",
        dose: "14 IU SubQ morning, 8 IU evening",
        frequency: "Twice daily Subcutaneously",
        duration: "30 days",
        quantityPrescribed: 2,
        quantityDispensed: 1,
        unit: "Vials",
        stockAvailable: 18,
        stockStatus: "Low Stock",
        instructions: "Store in refrigerator (2°C – 8°C). Gently roll vial before drawing up."
      },
      {
        name: "Ferrous Sulfate 200mg + Folic Acid 0.5mg",
        code: "MED-0044",
        dosageForm: "Tablet",
        strength: "200 mg / 0.5 mg",
        dose: "1 tablet PO",
        frequency: "Once daily with water",
        duration: "30 days",
        quantityPrescribed: 30,
        quantityDispensed: 30,
        unit: "Tablets",
        stockAvailable: 800,
        stockStatus: "In Stock",
        instructions: "Do not take with tea or milk. May darken stool."
      }
    ]
  },
  {
    id: "RX-2026-00127",
    patientName: "Hana Mohammed",
    patientId: "ORH-P-000208",
    ageGender: "28y / Female",
    dob: "14 May 1998",
    prescribingDepartment: "General Outpatient Consultation (Adult OPD-2)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionTime: "Today · 09:15 AM",
    priority: "Routine",
    dispensingStatus: "Dispensed",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalDiagnosisSummary: "Microcytic Hypochromic Anemia (Hb 9.2 g/dL)",
    pharmacistAssigned: "Ato Bekele Tolosa, RPh",
    pharmacistNotes: "Full 60-day oral iron supply dispensed. Patient counselled on gastrointestinal tolerance.",
    medicines: [
      {
        name: "Ferrous Sulfate 200mg Tablets",
        code: "MED-0045",
        dosageForm: "Tablet",
        strength: "200 mg",
        dose: "1 tablet PO",
        frequency: "Twice daily after meals",
        duration: "60 days",
        quantityPrescribed: 120,
        quantityDispensed: 120,
        unit: "Tablets",
        stockAvailable: 1400,
        stockStatus: "In Stock",
        instructions: "Take with fresh water or citrus juice. Avoid concurrent antacids."
      }
    ]
  },
  {
    id: "RX-2026-00129",
    patientName: "Girma Worku",
    patientId: "ORH-P-000160",
    ageGender: "38y / Male",
    dob: "02 Feb 1988",
    prescribingDepartment: "General Outpatient Consultation (Adult OPD-1)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionTime: "Today · 08:45 AM",
    priority: "Routine",
    dispensingStatus: "On Hold",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalDiagnosisSummary: "Suspected uncomplicated lower urinary tract infection",
    prescriberNotes: "Prescribed Ciprofloxacin 500mg BID x 7 days.",
    pharmacistNotes: "Dispensing placed on hold: Ciprofloxacin dosage clarification needed with prescriber; urinalysis microscopy was negative for significant bacteriuria.",
    medicines: [
      {
        name: "Ciprofloxacin 500mg Tablets",
        code: "MED-0055",
        dosageForm: "Tablet",
        strength: "500 mg",
        dose: "500 mg PO",
        frequency: "Twice daily",
        duration: "7 days",
        quantityPrescribed: 14,
        quantityDispensed: 0,
        unit: "Tablets",
        stockAvailable: 180,
        stockStatus: "In Stock",
        instructions: "Drink plenty of water. Avoid milk/antacids within 2 hours of dose."
      }
    ]
  }
]

export const demoInventoryAlerts: MedicineInventoryAlert[] = [
  {
    id: "MED-0145",
    name: "Ceftriaxone 1g Powder for Injection",
    code: "CRO-1G",
    dosageForm: "Injection Vial",
    strength: "1 g",
    category: "Antibiotics",
    usableQuantity: 0,
    physicalQuantity: 0,
    quarantinedQuantity: 0,
    unit: "Vials",
    reorderThreshold: 100,
    stockStatus: "Out of Stock",
    location: "Main Pharmacy / Refrigerator Vault B",
    supplierRef: "EPSA Regional Hub (Adama)"
  },
  {
    id: "MED-0104",
    name: "Amoxicillin 500mg Capsules",
    code: "AMX-500",
    dosageForm: "Capsule",
    strength: "500 mg",
    category: "Antibiotics",
    usableQuantity: 180,
    physicalQuantity: 180,
    quarantinedQuantity: 0,
    unit: "Capsules",
    reorderThreshold: 500,
    stockStatus: "Low Stock",
    location: "Dispensary / Shelf A-04",
    supplierRef: "Ethiopian Pharmaceuticals Supply Service"
  },
  {
    id: "MED-0082",
    name: "Oral Rehydration Salts (ORS) Low Osmolarity",
    code: "ORS-20.5",
    dosageForm: "Powder for Oral Solution",
    strength: "20.5 g sachet (1 Liter)",
    category: "Gastrointestinal",
    usableQuantity: 45,
    physicalQuantity: 45,
    quarantinedQuantity: 0,
    unit: "Sachets",
    reorderThreshold: 200,
    stockStatus: "Low Stock",
    location: "Dispensary / Shelf C-02",
    supplierRef: "UNICEF / EPSA"
  },
  {
    id: "MED-0155",
    name: "Normal Saline 0.9% IV Infusion",
    code: "NS-500",
    dosageForm: "IV Infusion Bag",
    strength: "0.9% (500 mL)",
    category: "IV Fluids & Electrolytes",
    usableQuantity: 15,
    physicalQuantity: 15,
    quarantinedQuantity: 0,
    unit: "Bags",
    reorderThreshold: 100,
    stockStatus: "Low Stock",
    location: "Emergency Drug Room / Bay IV-1",
    supplierRef: "Cadila Pharmaceuticals Ethiopia"
  },
  {
    id: "MED-0089",
    name: "Doxycycline 100mg Capsules",
    code: "DOX-100",
    dosageForm: "Capsule",
    strength: "100 mg",
    category: "Antibiotics",
    usableQuantity: 0,
    physicalQuantity: 120,
    quarantinedQuantity: 120,
    unit: "Capsules",
    reorderThreshold: 300,
    stockStatus: "Restricted / Quarantined",
    location: "Quarantine Locker Q-01",
    supplierRef: "EPHARM Addis Ababa"
  },
  {
    id: "MED-0160",
    name: "Insulin NPH (Human Isophane) 100 IU/mL",
    code: "INS-NPH",
    dosageForm: "Injection Vial",
    strength: "100 IU / mL (10 mL)",
    category: "Cardiovascular / Endocrine",
    usableQuantity: 18,
    physicalQuantity: 18,
    quarantinedQuantity: 0,
    unit: "Vials",
    reorderThreshold: 40,
    stockStatus: "Low Stock",
    location: "Dispensary Refrigerator (2°C – 8°C)",
    supplierRef: "Novo Nordisk / EPSA"
  }
]

export const demoExpiryBatches: ExpiryBatch[] = [
  {
    id: "LOT-DOX-2023-08",
    medicineName: "Doxycycline 100mg Capsules",
    dosageForm: "Capsule",
    strength: "100 mg",
    batchNumber: "LOT-DOX-2023-08",
    quantity: 120,
    unit: "Capsules",
    expiryDate: "12 Oct 2026",
    daysRemaining: -4,
    status: "Expired",
    location: "Quarantine Locker Q-01",
    quarantineReason: "Batch reached manufacturer shelf-life on 12 Oct 2026. Moved to biohazard quarantine pending formal board survey & incineration disposal."
  },
  {
    id: "LOT-CIP-2024-C2",
    medicineName: "Ciprofloxacin 500mg Tablets",
    dosageForm: "Tablet",
    strength: "500 mg",
    batchNumber: "LOT-CIP-2024-C2",
    quantity: 180,
    unit: "Tablets",
    expiryDate: "15 Nov 2026",
    daysRemaining: 30,
    status: "Expiring Soon",
    location: "Dispensary / Shelf A-08"
  },
  {
    id: "LOT-ERY-2024-11",
    medicineName: "Erythromycin 250mg Capsules",
    dosageForm: "Capsule",
    strength: "250 mg",
    batchNumber: "LOT-ERY-2024-11",
    quantity: 90,
    unit: "Capsules",
    expiryDate: "05 Dec 2026",
    daysRemaining: 50,
    status: "Expiring Soon",
    location: "Dispensary / Shelf B-03"
  }
]

export const demoStockMovements: StockMovement[] = [
  {
    id: "MOV-2026-0842",
    movementReference: "MOV-2026-0842",
    medicineName: "Paracetamol 500mg Tablets",
    type: "Stock Received",
    quantity: "+2,000",
    unit: "Tablets",
    timestamp: "Today · 10:20 AM",
    responsibleUser: "Ato Bekele Tolosa, RPh",
    referenceDocument: "PO-2026-041 (EPSA Hub)"
  },
  {
    id: "MOV-2026-0841",
    movementReference: "MOV-2026-0841",
    medicineName: "Ferrous Sulfate 200mg Tablets",
    type: "Dispensed",
    quantity: "-120",
    unit: "Tablets",
    timestamp: "Today · 09:25 AM",
    responsibleUser: "Ato Bekele Tolosa, RPh",
    referenceDocument: "RX-2026-00127 (Hana Mohammed)"
  },
  {
    id: "MOV-2026-0840",
    movementReference: "MOV-2026-0840",
    medicineName: "Doxycycline 100mg Capsules",
    type: "Stock Adjustment",
    quantity: "-120",
    unit: "Capsules",
    timestamp: "Today · 08:30 AM",
    responsibleUser: "W/ro Selamawit Degu",
    referenceDocument: "ADJ-2026-012 (Expired Quarantine)"
  },
  {
    id: "MOV-2026-0839",
    movementReference: "MOV-2026-0839",
    medicineName: "Insulin NPH 100 IU/mL Vials",
    type: "Transferred Between Stores",
    quantity: "+10",
    unit: "Vials",
    timestamp: "Yesterday · 04:15 PM",
    responsibleUser: "Ato Bekele Tolosa, RPh",
    referenceDocument: "TRF-2026-088 (Cold Storage Vault)"
  }
]

export const demoPharmacyAlerts: PharmacyAlert[] = [
  {
    id: "ALT-2026-001",
    title: "STAT Prescription Pending Verification",
    explanation: "Emergency Resuscitation prescription RX-2026-00125 for Almaz Kebede (Potassium 6.4 mmol/L) requires immediate pharmacotherapy verification.",
    severity: "High",
    reference: "RX-2026-00125",
    timestamp: "10:48 AM",
    actionLabel: "Open Prescription",
    category: "STAT Order"
  },
  {
    id: "ALT-2026-002",
    title: "Critical Antibiotic Out of Stock",
    explanation: "Ceftriaxone 1g injection is completely depleted in Outpatient Dispensary. Emergency orders routed to inpatient central pharmacy.",
    severity: "High",
    reference: "MED-0145",
    timestamp: "09:30 AM",
    actionLabel: "Requisition Stock",
    category: "Stock Out"
  },
  {
    id: "ALT-2026-003",
    title: "Batch Expired — Locked in Quarantine",
    explanation: "Doxycycline Lot LOT-DOX-2023-08 (120 caps) expired on 12 Oct 2026. Physical stock is quarantined and strictly blocked from ordinary dispensing.",
    severity: "Medium",
    reference: "LOT-DOX-2023-08",
    timestamp: "08:30 AM",
    actionLabel: "View Quarantine",
    category: "Expiry Quarantined"
  },
  {
    id: "ALT-2026-004",
    title: "Oral Rehydration Salts (ORS) Below Reorder Threshold",
    explanation: "Current usable stock (45 sachets) is below hospital minimum threshold (200 sachets) ahead of weekend pediatric clinics.",
    severity: "Medium",
    reference: "MED-0082",
    timestamp: "08:15 AM",
    actionLabel: "Prepare Order",
    category: "Reorder Threshold"
  }
]
