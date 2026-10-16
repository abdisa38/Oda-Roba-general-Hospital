// ORHIMS — Prescription Management Data Model (Phase 05, Prompt 29)

export interface PrescriptionPatientContext {
  patientId: string
  name: string
  amharicName?: string
  age: string
  sex: "Female" | "Male" | "Other"
  dob: string
  encounterId: string
  encounterDate: string
  encounterType: string
  clinic: string
  attendingDoctor: string
  encounterStatus: "In Progress" | "Finalized" | "Awaiting Documentation"
  allergies: {
    status: "Documented" | "NKDA" | "Unverified"
    details: string
    severity?: "Mild" | "Moderate" | "Severe"
  }
  diagnoses: {
    code: string
    name: string
    type: "Primary" | "Secondary"
  }[]
}

export type MedicationFormulation =
  | "Tablet"
  | "Capsule"
  | "Oral Suspension"
  | "Syrup"
  | "Powder for Injection"
  | "IV Infusion"
  | "Inhaler"
  | "Topical Ointment"
  | "Eye Drops"
  | "Oral Powder / Sachet"

export interface MedicationCatalogueItem {
  id: string
  genericName: string
  brandName?: string
  formulation: MedicationFormulation
  strength: string
  availableStrengths: string[]
  defaultRoute: string
  defaultDoseUnit: string
  category: "Antibacterial" | "Analgesic / Antipyretic" | "Respiratory" | "Antimalarial" | "Gastrointestinal" | "Cardiovascular" | "Fluids & Electrolytes"
  drugClass?: string
  notes?: string
}

export type OrderStatus = "Draft" | "Submitted" | "Cancelled" | "Dispensed"

export interface MedicationOrder {
  id: string
  encounterId: string
  patientId: string
  medicationId: string
  genericName: string
  brandName?: string
  formulation: MedicationFormulation
  strength: string
  doseAmount: number | string
  doseUnit: string
  route: string
  frequency: string
  duration: number
  durationUnit: "Days" | "Weeks" | "Months" | "Doses"
  quantity: string
  startDate: string
  patientInstructions: string
  internalNotes?: string
  prescriberName: string
  prescriberRole: string
  orderDate: string
  orderTime: string
  status: OrderStatus
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
  allergyWarningAcknowledged?: boolean
  potentialAllergyConflict?: string
}

export interface HistoricalPrescription {
  id: string
  encounterId: string
  encounterDate: string
  clinic: string
  doctor: string
  genericName: string
  brandName?: string
  strength: string
  formulation: MedicationFormulation
  instructions: string
  status: "Completed" | "Discontinued" | "Expired"
}

// Current Patient & Active Encounter for Prompt 29 Demonstration
export const samplePrescriptionPatient: PrescriptionPatientContext = {
  patientId: "ORH-2026-00124",
  name: "Hana Mohammed",
  amharicName: "ሀና መሀመድ",
  age: "28y",
  sex: "Female",
  dob: "14 May 1997",
  encounterId: "ENC-2026-0842",
  encounterDate: "15 Oct 2026",
  encounterType: "General Outpatient Consultation",
  clinic: "Adult OPD-2",
  attendingDoctor: "Dr. Dawit Alemu",
  encounterStatus: "In Progress",
  allergies: {
    status: "Documented",
    details: "Penicillin G & Beta-Lactams (Severe Anaphylaxis Risk)",
    severity: "Severe",
  },
  diagnoses: [
    { code: "J02.9", name: "Acute Pharyngitis, Unspecified", type: "Primary" },
    { code: "J45.21", name: "Mild Intermittent Asthma with Acute Exacerbation", type: "Secondary" },
  ],
}

// Configured Hospital Medication Catalogue (Ethiopian Essential Medicines List)
export const hospitalMedicationCatalogue: MedicationCatalogueItem[] = [
  {
    id: "med-01",
    genericName: "Azithromycin",
    brandName: "Zithromax",
    formulation: "Tablet",
    strength: "500 mg",
    availableStrengths: ["250 mg", "500 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Antibacterial",
    drugClass: "Macrolide",
    notes: "Safe alternative for penicillin-allergic patients.",
  },
  {
    id: "med-02",
    genericName: "Paracetamol",
    brandName: "Panadol",
    formulation: "Tablet",
    strength: "500 mg",
    availableStrengths: ["500 mg", "1000 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Analgesic / Antipyretic",
    notes: "Standard antipyretic and mild pain relief.",
  },
  {
    id: "med-03",
    genericName: "Salbutamol",
    brandName: "Ventolin",
    formulation: "Inhaler",
    strength: "100 mcg/dose",
    availableStrengths: ["100 mcg/dose"],
    defaultRoute: "Inhalation",
    defaultDoseUnit: "puff",
    category: "Respiratory",
    drugClass: "Short-Acting Beta-2 Agonist (SABA)",
    notes: "Bronchodilator for acute asthma or bronchospasm.",
  },
  {
    id: "med-04",
    genericName: "Amoxicillin",
    brandName: "Amoxil",
    formulation: "Capsule",
    strength: "500 mg",
    availableStrengths: ["250 mg", "500 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Antibacterial",
    drugClass: "Penicillin / Beta-Lactam",
    notes: "Caution: Contraindicated in documented penicillin hypersensitivity.",
  },
  {
    id: "med-05",
    genericName: "Ceftriaxone",
    brandName: "Rocephin",
    formulation: "Powder for Injection",
    strength: "1 g",
    availableStrengths: ["500 mg", "1 g", "2 g"],
    defaultRoute: "Intravenous (IV)",
    defaultDoseUnit: "g",
    category: "Antibacterial",
    drugClass: "3rd Generation Cephalosporin",
    notes: "Reconstitute with 10 mL Sterile Water for IV administration.",
  },
  {
    id: "med-06",
    genericName: "Artemether + Lumefantrine",
    brandName: "Coartem",
    formulation: "Tablet",
    strength: "20 mg / 120 mg",
    availableStrengths: ["20/120 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "tablet",
    category: "Antimalarial",
    notes: "First-line ACT for uncomplicated falciparum malaria. Take with fatty meal.",
  },
  {
    id: "med-07",
    genericName: "Ciprofloxacin",
    brandName: "Cipro",
    formulation: "Tablet",
    strength: "500 mg",
    availableStrengths: ["250 mg", "500 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Antibacterial",
    drugClass: "Fluoroquinolone",
    notes: "Ensure adequate patient hydration during course.",
  },
  {
    id: "med-08",
    genericName: "Metronidazole",
    brandName: "Flagyl",
    formulation: "Tablet",
    strength: "500 mg",
    availableStrengths: ["250 mg", "500 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Antibacterial",
    drugClass: "Nitroimidazole",
    notes: "Advise strict abstinence from alcohol during treatment.",
  },
  {
    id: "med-09",
    genericName: "Omeprazole",
    brandName: "Losec",
    formulation: "Capsule",
    strength: "20 mg",
    availableStrengths: ["20 mg", "40 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Gastrointestinal",
    drugClass: "Proton Pump Inhibitor (PPI)",
    notes: "Take 30 minutes before breakfast.",
  },
  {
    id: "med-10",
    genericName: "Oral Rehydration Salts (ORS)",
    brandName: "Oralyte",
    formulation: "Oral Powder / Sachet",
    strength: "For 1 Litre",
    availableStrengths: ["For 1 Litre", "For 500 mL"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "sachet",
    category: "Fluids & Electrolytes",
    notes: "Dissolve entire packet in 1 litre of clean drinking water.",
  },
  {
    id: "med-11",
    genericName: "Amlodipine",
    brandName: "Norvasc",
    formulation: "Tablet",
    strength: "5 mg",
    availableStrengths: ["5 mg", "10 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Cardiovascular",
    drugClass: "Calcium Channel Blocker",
    notes: "Monitor blood pressure and peripheral edema.",
  },
  {
    id: "med-12",
    genericName: "Metformin",
    brandName: "Glucophage",
    formulation: "Tablet",
    strength: "500 mg",
    availableStrengths: ["500 mg", "850 mg", "1000 mg"],
    defaultRoute: "Oral (PO)",
    defaultDoseUnit: "mg",
    category: "Gastrointestinal",
    drugClass: "Biguanide Antidiabetic",
    notes: "Take with or immediately after meals to reduce GI effects.",
  },
]

// Initial Encounter Medication Orders
export const initialEncounterOrders: MedicationOrder[] = [
  {
    id: "ord-2026-01",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    medicationId: "med-01",
    genericName: "Azithromycin",
    brandName: "Zithromax",
    formulation: "Tablet",
    strength: "500 mg",
    doseAmount: 500,
    doseUnit: "mg",
    route: "Oral (PO)",
    frequency: "Once daily (OD)",
    duration: 3,
    durationUnit: "Days",
    quantity: "3 tablets",
    startDate: "15 Oct 2026",
    patientInstructions: "Take 1 tablet (500 mg) by mouth once daily for 3 consecutive days. Take with or without food. Complete full 3-day course.",
    internalNotes: "Indication: Acute pharyngitis in patient with confirmed penicillin hypersensitivity.",
    prescriberName: "Dr. Dawit Alemu",
    prescriberRole: "Consulting Physician",
    orderDate: "15 Oct 2026",
    orderTime: "08:52 AM",
    status: "Submitted",
  },
  {
    id: "ord-2026-02",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    medicationId: "med-03",
    genericName: "Salbutamol",
    brandName: "Ventolin",
    formulation: "Inhaler",
    strength: "100 mcg/dose",
    doseAmount: 2,
    doseUnit: "puff",
    route: "Inhalation",
    frequency: "As needed (PRN)",
    duration: 30,
    durationUnit: "Days",
    quantity: "1 inhaler (200 doses)",
    startDate: "15 Oct 2026",
    patientInstructions: "Inhale 2 puffs every 4 to 6 hours as needed for shortness of breath, wheezing, or chest tightness. Rinse mouth with water after inhalation.",
    internalNotes: "SABA rescue inhaler for acute intermittent asthma exacerbation.",
    prescriberName: "Dr. Dawit Alemu",
    prescriberRole: "Consulting Physician",
    orderDate: "15 Oct 2026",
    orderTime: "08:56 AM",
    status: "Submitted",
  },
  {
    id: "ord-2026-03",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    medicationId: "med-02",
    genericName: "Paracetamol",
    brandName: "Panadol",
    formulation: "Tablet",
    strength: "500 mg",
    doseAmount: 1000,
    doseUnit: "mg",
    route: "Oral (PO)",
    frequency: "Every 8 hours (q8h)",
    duration: 5,
    durationUnit: "Days",
    quantity: "15 tablets",
    startDate: "15 Oct 2026",
    patientInstructions: "Take 2 tablets (1000 mg) by mouth every 8 hours as needed for throat pain or fever. Do not exceed 8 tablets (4000 mg) in 24 hours.",
    internalNotes: "Symptomatic analgesia / antipyresis. Draft pending confirmation of liver enzyme status.",
    prescriberName: "Dr. Dawit Alemu",
    prescriberRole: "Consulting Physician",
    orderDate: "15 Oct 2026",
    orderTime: "09:05 AM",
    status: "Draft",
  },
]

// Historical prescriptions from previous hospital encounters
export const sampleHistoricalPrescriptions: HistoricalPrescription[] = [
  {
    id: "hist-rx-1",
    encounterId: "ENC-2025-0612",
    encounterDate: "12 Nov 2025",
    clinic: "Adult OPD-1",
    doctor: "Dr. Aster Bekele",
    genericName: "Omeprazole",
    brandName: "Losec",
    strength: "20 mg",
    formulation: "Capsule",
    instructions: "1 capsule PO once daily before breakfast for 14 days.",
    status: "Completed",
  },
  {
    id: "hist-rx-2",
    encounterId: "ENC-2025-0341",
    encounterDate: "04 May 2025",
    clinic: "Emergency Dept",
    doctor: "Dr. Dawit Alemu",
    genericName: "Salbutamol",
    brandName: "Ventolin",
    strength: "100 mcg/dose",
    formulation: "Inhaler",
    instructions: "2 puffs inhaled q4h PRN wheeze.",
    status: "Completed",
  },
]

export const routeOptions = [
  "Oral (PO)",
  "Intravenous (IV)",
  "Intramuscular (IM)",
  "Inhalation",
  "Sublingual",
  "Topical",
  "Ophthalmic",
  "Rectal",
]

export const frequencyOptions = [
  { label: "Once daily (OD)", value: "Once daily (OD)", multiplier: 1 },
  { label: "Twice daily (BID)", value: "Twice daily (BID)", multiplier: 2 },
  { label: "Three times daily (TID)", value: "Three times daily (TID)", multiplier: 3 },
  { label: "Four times daily (QID)", value: "Four times daily (QID)", multiplier: 4 },
  { label: "Every 8 hours (q8h)", value: "Every 8 hours (q8h)", multiplier: 3 },
  { label: "Every 12 hours (q12h)", value: "Every 12 hours (q12h)", multiplier: 2 },
  { label: "Every 4 to 6 hours PRN", value: "Every 4 to 6 hours PRN", multiplier: 4 },
  { label: "As needed (PRN)", value: "As needed (PRN)", multiplier: 1 },
  { label: "Stat / Immediately", value: "Stat / Immediately", multiplier: 1 },
]
