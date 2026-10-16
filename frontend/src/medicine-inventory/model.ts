// ORHIMS — Phase 07, Prompt 38: Medicine Inventory Management Data Model
// Oda Roba General Hospital — Main Outpatient Pharmacy (Bale Robe, Ethiopia)

export type StockStatus =
  | "In Stock"
  | "Low Stock"
  | "Out of Stock"
  | "Restricted / Quarantined"

export type BatchStatus =
  | "Available"
  | "Expiring Soon"
  | "Expired"
  | "Quarantined"
  | "Recalled"
  | "Depleted"

export interface MedicineBatchDetail {
  id: string
  batchNumber: string
  storageLocation: string
  quantityReceived: number
  physicalQuantity: number
  eligibleQuantity: number
  expiryDate: string
  daysUntilExpiry: number
  batchStatus: BatchStatus
  receivingDate: string
  receivingReference: string
  supplier: string
  quarantineReason?: string
}

export interface MedicineStockMovement {
  id: string
  timestamp: string
  type: "Stock Received" | "Dispensed" | "Stock Adjustment" | "Quarantine Transfer" | "Return to Store"
  quantity: string
  batchNumber: string
  reference: string
  user: string
}

export interface MedicineItem {
  id: string // e.g. "MED-0104"
  name: string
  genericName: string
  code: string
  category:
    | "Antibiotics"
    | "Analgesics & Antipyretics"
    | "Antimalarials"
    | "Cardiovascular & Endocrine"
    | "IV Fluids & Electrolytes"
    | "Gastrointestinal"
    | "Respiratory"
    | "Vitamins & Minerals"
  strength: string
  dosageForm: string
  unitOfMeasure: string
  manufacturer: string
  storageConditions: string
  description: string
  totalPhysicalStock: number
  reservedQuantity: number
  unavailableQuantity: number // expired or quarantined
  usableQuantity: number // eligible for dispensing
  reorderThreshold: number
  targetStockLevel: number
  stockStatus: StockStatus
  nearestEligibleExpiryDate?: string
  daysToNearestExpiry?: number
  hasExpiringBatch: boolean
  hasExpiredBatch: boolean
  isActive: boolean
  lastStockMovement: string
  batches: MedicineBatchDetail[]
  movements: MedicineStockMovement[]
}

/**
 * Fictional demonstration dataset for Oda Roba General Hospital
 * Pharmacy Medicine Inventory.
 */
export const demoMedicineInventory: MedicineItem[] = [
  {
    id: "MED-0104",
    name: "Amoxicillin 500mg Capsules",
    genericName: "Amoxicillin Trihydrate",
    code: "AMX-500",
    category: "Antibiotics",
    strength: "500 mg",
    dosageForm: "Capsule",
    unitOfMeasure: "Capsules",
    manufacturer: "EPHARM (Ethiopian Pharmaceuticals Mfg)",
    storageConditions: "Store below 25°C in a dry place. Protect from moisture.",
    description: "Broad-spectrum beta-lactam bactericidal antibiotic used for respiratory and soft tissue infections.",
    totalPhysicalStock: 180,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 180,
    reorderThreshold: 500,
    targetStockLevel: 1500,
    stockStatus: "Low Stock",
    nearestEligibleExpiryDate: "14 Jul 2027",
    daysToNearestExpiry: 271,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "14 Oct 2026 · Dispensed (-24 Caps)",
    batches: [
      {
        id: "BATCH-AMX-2025-01",
        batchNumber: "LOT-AMX-2025-01",
        storageLocation: "Dispensary / Shelf A-04",
        quantityReceived: 1000,
        physicalQuantity: 180,
        eligibleQuantity: 180,
        expiryDate: "14 Jul 2027",
        daysUntilExpiry: 271,
        batchStatus: "Available",
        receivingDate: "10 Mar 2025",
        receivingReference: "GRN-2025-0142",
        supplier: "EPSA Regional Hub (Adama)",
      },
    ],
    movements: [
      {
        id: "MOV-0104-1",
        timestamp: "14 Oct 2026 · 11:20 AM",
        type: "Dispensed",
        quantity: "-24",
        batchNumber: "LOT-AMX-2025-01",
        reference: "RX-2026-00109",
        user: "Ato Bekele Tolosa, RPh",
      },
      {
        id: "MOV-0104-2",
        timestamp: "10 Mar 2025 · 09:15 AM",
        type: "Stock Received",
        quantity: "+1,000",
        batchNumber: "LOT-AMX-2025-01",
        reference: "PO-2025-088",
        user: "W/ro Selamawit Degu",
      },
    ],
  },
  {
    id: "MED-0021",
    name: "Paracetamol 500mg Tablets",
    genericName: "Acetaminophen",
    code: "PARA-500",
    category: "Analgesics & Antipyretics",
    strength: "500 mg",
    dosageForm: "Tablet",
    unitOfMeasure: "Tablets",
    manufacturer: "Cadila Pharmaceuticals Ethiopia",
    storageConditions: "Store below 30°C in a dry place. Protect from direct light.",
    description: "Analgesic and antipyretic for mild to moderate pain and febrile conditions.",
    totalPhysicalStock: 4200,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 4200,
    reorderThreshold: 1000,
    targetStockLevel: 5000,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "20 Dec 2028",
    daysToNearestExpiry: 795,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Stock Received (+2,000 Tabs)",
    batches: [
      {
        id: "BATCH-PARA-2026-02",
        batchNumber: "LOT-PARA-2026-02",
        storageLocation: "Dispensary / Bulk Bay 01",
        quantityReceived: 2000,
        physicalQuantity: 2000,
        eligibleQuantity: 2000,
        expiryDate: "20 Dec 2028",
        daysUntilExpiry: 795,
        batchStatus: "Available",
        receivingDate: "16 Oct 2026",
        receivingReference: "GRN-2026-0412",
        supplier: "EPSA Regional Hub (Adama)",
      },
      {
        id: "BATCH-PARA-2025-01",
        batchNumber: "LOT-PARA-2025-01",
        storageLocation: "Dispensary / Shelf A-01",
        quantityReceived: 3000,
        physicalQuantity: 2200,
        eligibleQuantity: 2200,
        expiryDate: "15 Aug 2027",
        daysUntilExpiry: 303,
        batchStatus: "Available",
        receivingDate: "12 May 2025",
        receivingReference: "GRN-2025-0299",
        supplier: "Cadila Pharmaceuticals Ethiopia",
      },
    ],
    movements: [
      {
        id: "MOV-0021-1",
        timestamp: "Today · 10:20 AM",
        type: "Stock Received",
        quantity: "+2,000",
        batchNumber: "LOT-PARA-2026-02",
        reference: "PO-2026-041",
        user: "Ato Bekele Tolosa, RPh",
      },
      {
        id: "MOV-0021-2",
        timestamp: "Yesterday · 03:40 PM",
        type: "Dispensed",
        quantity: "-30",
        batchNumber: "LOT-PARA-2025-01",
        reference: "RX-2026-00115",
        user: "W/ro Selamawit Degu",
      },
    ],
  },
  {
    id: "MED-0230",
    name: "Artemether-Lumefantrine 20/120mg",
    genericName: "Artemether + Lumefantrine",
    code: "COA-20/120",
    category: "Antimalarials",
    strength: "20 mg / 120 mg",
    dosageForm: "Tablet",
    unitOfMeasure: "Tablets",
    manufacturer: "Novartis / Global Fund",
    storageConditions: "Store below 30°C in blister packaging. Protect from excessive heat.",
    description: "Fixed-dose artemisinin combination therapy (ACT) for uncomplicated falciparum malaria.",
    totalPhysicalStock: 320,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 320,
    reorderThreshold: 150,
    targetStockLevel: 600,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "18 Jun 2028",
    daysToNearestExpiry: 610,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Dispensed (-24 Tabs)",
    batches: [
      {
        id: "BATCH-COA-2026-01",
        batchNumber: "LOT-COA-2026-01",
        storageLocation: "Dispensary / Shelf A-02",
        quantityReceived: 500,
        physicalQuantity: 320,
        eligibleQuantity: 320,
        expiryDate: "18 Jun 2028",
        daysUntilExpiry: 610,
        batchStatus: "Available",
        receivingDate: "02 Feb 2026",
        receivingReference: "GRN-2026-0081",
        supplier: "Federal Ministry of Health (FMoH Malaria Program)",
      },
    ],
    movements: [
      {
        id: "MOV-0230-1",
        timestamp: "Today · 10:35 AM",
        type: "Dispensed",
        quantity: "-24",
        batchNumber: "LOT-COA-2026-01",
        reference: "RX-2026-00126",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0145",
    name: "Ceftriaxone 1g Powder for Injection",
    genericName: "Ceftriaxone Sodium",
    code: "CRO-1G",
    category: "Antibiotics",
    strength: "1 g",
    dosageForm: "Injection Vial",
    unitOfMeasure: "Vials",
    manufacturer: "Sandoz / Novartis",
    storageConditions: "Store below 25°C. Protect from light. Reconstituted solution stable 24h at 2-8°C.",
    description: "Third-generation cephalosporin antibiotic for severe bacterial sepsis, meningitis, and pneumonia.",
    totalPhysicalStock: 0,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 0,
    reorderThreshold: 100,
    targetStockLevel: 400,
    stockStatus: "Out of Stock",
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "14 Oct 2026 · Dispensed (-6 Vials, Depleted)",
    batches: [],
    movements: [
      {
        id: "MOV-0145-1",
        timestamp: "14 Oct 2026 · 04:30 PM",
        type: "Dispensed",
        quantity: "-6",
        batchNumber: "LOT-CRO-2024-09",
        reference: "RX-2026-00101",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0089",
    name: "Doxycycline 100mg Capsules",
    genericName: "Doxycycline Hyclate",
    code: "DOX-100",
    category: "Antibiotics",
    strength: "100 mg",
    dosageForm: "Capsule",
    unitOfMeasure: "Capsules",
    manufacturer: "EPHARM Addis Ababa",
    storageConditions: "Store below 25°C. Protect from moisture and light.",
    description: "Tetracycline class antimicrobial for atypical respiratory, rickettsial, and chlamydial infections.",
    totalPhysicalStock: 120,
    reservedQuantity: 0,
    unavailableQuantity: 120, // Expired and quarantined
    usableQuantity: 0, // Zero usable dispensing stock
    reorderThreshold: 300,
    targetStockLevel: 800,
    stockStatus: "Restricted / Quarantined",
    hasExpiringBatch: false,
    hasExpiredBatch: true,
    isActive: true,
    lastStockMovement: "Today · Quarantine Transfer (Expired, -120)",
    batches: [
      {
        id: "BATCH-DOX-2023-08",
        batchNumber: "LOT-DOX-2023-08",
        storageLocation: "Quarantine Locker Q-01",
        quantityReceived: 500,
        physicalQuantity: 120,
        eligibleQuantity: 0,
        expiryDate: "12 Oct 2026",
        daysUntilExpiry: -4,
        batchStatus: "Expired",
        receivingDate: "15 Aug 2023",
        receivingReference: "GRN-2023-0402",
        supplier: "EPHARM Addis Ababa",
        quarantineReason: "Batch reached manufacturer shelf-life on 12 Oct 2026. Moved to biohazard quarantine pending formal disposal survey.",
      },
    ],
    movements: [
      {
        id: "MOV-0089-1",
        timestamp: "Today · 08:30 AM",
        type: "Quarantine Transfer",
        quantity: "120",
        batchNumber: "LOT-DOX-2023-08",
        reference: "ADJ-2026-012",
        user: "W/ro Selamawit Degu",
      },
    ],
  },
  {
    id: "MED-0160",
    name: "Insulin NPH 100 IU/mL 10mL",
    genericName: "Human Isophane Insulin",
    code: "INS-NPH",
    category: "Cardiovascular & Endocrine",
    strength: "100 IU / mL (10 mL)",
    dosageForm: "Injection Vial",
    unitOfMeasure: "Vials",
    manufacturer: "Novo Nordisk / EPSA",
    storageConditions: "Strict Cold Chain: Store at 2°C – 8°C. Do not freeze. In-use vial stable at room temp for 28 days.",
    description: "Intermediate-acting human isophane insulin for diabetes mellitus glycemic control.",
    totalPhysicalStock: 18,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 18,
    reorderThreshold: 40,
    targetStockLevel: 120,
    stockStatus: "Low Stock",
    nearestEligibleExpiryDate: "12 Apr 2027",
    daysToNearestExpiry: 178,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Dispensed (-1 Vial)",
    batches: [
      {
        id: "BATCH-INS-2025-02",
        batchNumber: "LOT-INS-2025-02",
        storageLocation: "Dispensary Refrigerator R-01 (2°C – 8°C)",
        quantityReceived: 50,
        physicalQuantity: 18,
        eligibleQuantity: 18,
        expiryDate: "12 Apr 2027",
        daysUntilExpiry: 178,
        batchStatus: "Available",
        receivingDate: "15 Jan 2025",
        receivingReference: "GRN-2025-0044",
        supplier: "EPSA Cold Chain Depo",
      },
    ],
    movements: [
      {
        id: "MOV-0160-1",
        timestamp: "Today · 10:05 AM",
        type: "Dispensed",
        quantity: "-1",
        batchNumber: "LOT-INS-2025-02",
        reference: "RX-2026-00128",
        user: "W/ro Selamawit Degu",
      },
    ],
  },
  {
    id: "MED-0082",
    name: "Oral Rehydration Salts (ORS) Low Osmolarity",
    genericName: "Sodium Chloride + Glucose + Potassium + Citrate",
    code: "ORS-20.5",
    category: "Gastrointestinal",
    strength: "20.5 g (for 1 L solution)",
    dosageForm: "Powder for Oral Solution",
    unitOfMeasure: "Sachets",
    manufacturer: "UNICEF / EPSA",
    storageConditions: "Store in a cool dry place below 25°C. Keep sachets sealed until reconstitution.",
    description: "WHO/UNICEF low-osmolarity oral rehydration formula for acute diarrheal dehydration.",
    totalPhysicalStock: 45,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 45,
    reorderThreshold: 200,
    targetStockLevel: 800,
    stockStatus: "Low Stock",
    nearestEligibleExpiryDate: "10 Mar 2028",
    daysToNearestExpiry: 510,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Yesterday · Dispensed (-10 Sachets)",
    batches: [
      {
        id: "BATCH-ORS-2026-01",
        batchNumber: "LOT-ORS-2026-01",
        storageLocation: "Dispensary / Shelf C-02",
        quantityReceived: 400,
        physicalQuantity: 45,
        eligibleQuantity: 45,
        expiryDate: "10 Mar 2028",
        daysUntilExpiry: 510,
        batchStatus: "Available",
        receivingDate: "10 Jan 2026",
        receivingReference: "GRN-2026-0012",
        supplier: "UNICEF Ethiopia",
      },
    ],
    movements: [
      {
        id: "MOV-0082-1",
        timestamp: "15 Oct 2026 · 02:15 PM",
        type: "Dispensed",
        quantity: "-10",
        batchNumber: "LOT-ORS-2026-01",
        reference: "RX-2026-00119",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0155",
    name: "Normal Saline 0.9% IV Infusion 500mL",
    genericName: "Sodium Chloride 0.9%",
    code: "NS-500",
    category: "IV Fluids & Electrolytes",
    strength: "0.9% (500 mL)",
    dosageForm: "IV Infusion Bag",
    unitOfMeasure: "Bags",
    manufacturer: "Cadila Pharmaceuticals Ethiopia",
    storageConditions: "Store below 25°C. Do not freeze. Ensure clear solution prior to infusion.",
    description: "Isotonic crystalloid solution for intravascular volume resuscitation and fluid replacement.",
    totalPhysicalStock: 15,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 15,
    reorderThreshold: 100,
    targetStockLevel: 500,
    stockStatus: "Low Stock",
    nearestEligibleExpiryDate: "05 Nov 2027",
    daysToNearestExpiry: 385,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Dispensed (-4 Bags to ED)",
    batches: [
      {
        id: "BATCH-NS-2025-03",
        batchNumber: "LOT-NS-2025-03",
        storageLocation: "Emergency Drug Room / Bay IV-1",
        quantityReceived: 200,
        physicalQuantity: 15,
        eligibleQuantity: 15,
        expiryDate: "05 Nov 2027",
        daysUntilExpiry: 385,
        batchStatus: "Available",
        receivingDate: "05 May 2025",
        receivingReference: "GRN-2025-0211",
        supplier: "Cadila Pharmaceuticals Ethiopia",
      },
    ],
    movements: [
      {
        id: "MOV-0155-1",
        timestamp: "Today · 09:10 AM",
        type: "Dispensed",
        quantity: "-4",
        batchNumber: "LOT-NS-2025-03",
        reference: "ED-REQ-2026-081",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0055",
    name: "Ciprofloxacin 500mg Tablets",
    genericName: "Ciprofloxacin Hydrochloride",
    code: "CIP-500",
    category: "Antibiotics",
    strength: "500 mg",
    dosageForm: "Tablet",
    unitOfMeasure: "Tablets",
    manufacturer: "EPHARM Addis Ababa",
    storageConditions: "Store below 25°C. Protect from moisture and light.",
    description: "Fluoroquinolone antibiotic for complicated urinary tract and gastrointestinal infections.",
    totalPhysicalStock: 180,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 180,
    reorderThreshold: 100,
    targetStockLevel: 400,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "15 Nov 2026",
    daysToNearestExpiry: 30, // Expiring soon warning!
    hasExpiringBatch: true,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "14 Oct 2026 · Dispensed (-14 Tabs)",
    batches: [
      {
        id: "BATCH-CIP-2024-C2",
        batchNumber: "LOT-CIP-2024-C2",
        storageLocation: "Dispensary / Shelf A-08",
        quantityReceived: 400,
        physicalQuantity: 180,
        eligibleQuantity: 180,
        expiryDate: "15 Nov 2026",
        daysUntilExpiry: 30,
        batchStatus: "Expiring Soon",
        receivingDate: "20 Nov 2024",
        receivingReference: "GRN-2024-0552",
        supplier: "EPHARM Addis Ababa",
      },
    ],
    movements: [
      {
        id: "MOV-0055-1",
        timestamp: "14 Oct 2026 · 03:00 PM",
        type: "Dispensed",
        quantity: "-14",
        batchNumber: "LOT-CIP-2024-C2",
        reference: "RX-2026-00098",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0118",
    name: "Atorvastatin 20mg Tablets",
    genericName: "Atorvastatin Calcium",
    code: "ATV-20",
    category: "Cardiovascular & Endocrine",
    strength: "20 mg",
    dosageForm: "Tablet",
    unitOfMeasure: "Tablets",
    manufacturer: "Cadila Pharmaceuticals Ethiopia",
    storageConditions: "Store below 25°C. Protect from moisture.",
    description: "HMG-CoA reductase inhibitor for hypercholesterolemia and cardiovascular risk reduction.",
    totalPhysicalStock: 450,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 450,
    reorderThreshold: 200,
    targetStockLevel: 800,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "30 Mar 2027",
    daysToNearestExpiry: 165,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Dispensed (-30 Tabs to NCD)",
    batches: [
      {
        id: "BATCH-ATV-2025-07",
        batchNumber: "LOT-ATV-2025-07",
        storageLocation: "Dispensary / Shelf C-04",
        quantityReceived: 600,
        physicalQuantity: 450,
        eligibleQuantity: 450,
        expiryDate: "30 Mar 2027",
        daysUntilExpiry: 165,
        batchStatus: "Available",
        receivingDate: "15 Jul 2025",
        receivingReference: "GRN-2025-0344",
        supplier: "EPSA Regional Hub (Adama)",
      },
    ],
    movements: [
      {
        id: "MOV-0118-1",
        timestamp: "Today · 10:15 AM",
        type: "Dispensed",
        quantity: "-30",
        batchNumber: "LOT-ATV-2025-07",
        reference: "RX-2026-00124",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
  {
    id: "MED-0072",
    name: "Amlodipine 5mg Tablets",
    genericName: "Amlodipine Besylate",
    code: "AML-5",
    category: "Cardiovascular & Endocrine",
    strength: "5 mg",
    dosageForm: "Tablet",
    unitOfMeasure: "Tablets",
    manufacturer: "EPHARM Addis Ababa",
    storageConditions: "Store below 25°C. Protect from light.",
    description: "Dihydropyridine calcium channel blocker for essential hypertension.",
    totalPhysicalStock: 600,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 600,
    reorderThreshold: 200,
    targetStockLevel: 1000,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "15 May 2028",
    daysToNearestExpiry: 576,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "12 Oct 2026 · Dispensed (-30 Tabs)",
    batches: [
      {
        id: "BATCH-AML-2026-03",
        batchNumber: "LOT-AML-2026-03",
        storageLocation: "Dispensary / Shelf C-01",
        quantityReceived: 800,
        physicalQuantity: 600,
        eligibleQuantity: 600,
        expiryDate: "15 May 2028",
        daysUntilExpiry: 576,
        batchStatus: "Available",
        receivingDate: "18 Mar 2026",
        receivingReference: "GRN-2026-0155",
        supplier: "EPHARM Addis Ababa",
      },
    ],
    movements: [
      {
        id: "MOV-0072-1",
        timestamp: "12 Oct 2026 · 11:30 AM",
        type: "Dispensed",
        quantity: "-30",
        batchNumber: "LOT-AML-2026-03",
        reference: "RX-2026-00088",
        user: "W/ro Selamawit Degu",
      },
    ],
  },
  {
    id: "MED-0205",
    name: "Calcium Gluconate 10% Injection",
    genericName: "Calcium Gluconate",
    code: "CG-10",
    category: "IV Fluids & Electrolytes",
    strength: "10% (10 mL)",
    dosageForm: "Injection Ampoule",
    unitOfMeasure: "Ampoules",
    manufacturer: "B. Braun / EPSA",
    storageConditions: "Store between 15°C and 25°C. Do not freeze. Ensure clear precipitate-free solution.",
    description: "Emergency cardioprotective agent for severe acute hyperkalemia and hypocalcemia.",
    totalPhysicalStock: 24,
    reservedQuantity: 0,
    unavailableQuantity: 0,
    usableQuantity: 24,
    reorderThreshold: 20,
    targetStockLevel: 60,
    stockStatus: "In Stock",
    nearestEligibleExpiryDate: "14 Jul 2027",
    daysToNearestExpiry: 271,
    hasExpiringBatch: false,
    hasExpiredBatch: false,
    isActive: true,
    lastStockMovement: "Today · Dispensed (-2 Ampoules STAT to ED)",
    batches: [
      {
        id: "BATCH-CG-2025-04",
        batchNumber: "LOT-CG-2025-04",
        storageLocation: "Emergency Drug Cupboard E-02",
        quantityReceived: 40,
        physicalQuantity: 24,
        eligibleQuantity: 24,
        expiryDate: "14 Jul 2027",
        daysUntilExpiry: 271,
        batchStatus: "Available",
        receivingDate: "14 Apr 2025",
        receivingReference: "GRN-2025-0189",
        supplier: "EPSA Regional Hub (Adama)",
      },
    ],
    movements: [
      {
        id: "MOV-0205-1",
        timestamp: "Today · 10:50 AM",
        type: "Dispensed",
        quantity: "-2",
        batchNumber: "LOT-CG-2025-04",
        reference: "RX-2026-00125",
        user: "Ato Bekele Tolosa, RPh",
      },
    ],
  },
]
