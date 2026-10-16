// ORHIMS — Phase 07, Prompt 37: Prescription Queue and Dispensing Data Model
// Oda Roba General Hospital — Main Outpatient Pharmacy (Bale Robe, Ethiopia)

export type DispensingPriority = "Routine" | "Urgent" | "STAT"

export type DispensingStatus =
  | "Pending"
  | "In Progress"
  | "Partially Dispensed"
  | "Dispensed"
  | "On Hold"
  | "Cancelled"

export interface MedicineBatch {
  id: string
  batchNumber: string
  usableQuantity: number
  physicalQuantity: number
  expiryDate: string
  daysUntilExpiry: number
  location: string
  isEligible: boolean
  ineligibilityReason?: string
}

export interface DispensingMedicineLine {
  id: string
  name: string
  code: string
  strength: string
  dosageForm: string
  route: string
  frequency: string
  duration: string
  instructions: string
  prescribedQuantity: number
  previouslyDispensed: number
  remainingQuantity: number
  dispenseNowQuantity: number
  unit: string
  selectedBatchId: string
  availableBatches: MedicineBatch[]
  matchedStatus: "Exact Match" | "Substituted (Authorized)" | "Stock Out" | "Ineligible"
}

export interface DispensingAuditItem {
  transactionRef: string // e.g. "DISP-2026-00381"
  timestamp: string
  responsibleUser: string
  medicineName: string
  batchNumber: string
  quantityDispensed: number
  unit: string
  outcome: "Fully Dispensed" | "Partially Dispensed"
  partialReason?: string
  notes?: string
}

export interface DispensingPrescription {
  id: string // e.g. "RX-2026-00125"
  patientName: string
  patientId: string // e.g. "ORH-P-000192"
  ageGender: string
  dob: string
  prescribingDepartment: string
  prescribingClinician: string
  prescriptionDateTime: string
  priority: DispensingPriority
  dispensingStatus: DispensingStatus
  clinicalApprovalStatus: string
  paymentStatus: "Settled / Insured (CBHI)" | "Paid (Cash)" | "Exempt" | "Pending Payment"
  clinicalIndication?: string
  prescriberNotes?: string
  assignedPharmacist?: string
  pharmacistNotes?: string
  holdReason?: string
  holdTimestamp?: string
  holdUser?: string
  cancellationReason?: string
  medicines: DispensingMedicineLine[]
  auditHistory: DispensingAuditItem[]
}

/**
 * Fictional demonstration dataset for Oda Roba General Hospital
 * Main Outpatient Pharmacy Dispensing Queue.
 */
export const demoQueuePrescriptions: DispensingPrescription[] = [
  {
    id: "RX-2026-00125",
    patientName: "Almaz Kebede",
    patientId: "ORH-P-000192",
    ageGender: "62y / Female",
    dob: "11 Dec 1963",
    prescribingDepartment: "Emergency Department (Resuscitation)",
    prescribingClinician: "Dr. Yonas Girma, MD",
    prescriptionDateTime: "16 Oct 2026 · 10:48 AM",
    priority: "STAT",
    dispensingStatus: "In Progress",
    clinicalApprovalStatus: "Clinically Verified by Dr. Yonas Girma (ED Consultant)",
    paymentStatus: "Exempt",
    clinicalIndication: "Severe hyperkalemia (Potassium 6.4 mmol/L) with acute renal insufficiency",
    prescriberNotes: "STAT EMERGENCY DISPENSING. Patient is monitored in Resus Bay 2.",
    assignedPharmacist: "Ato Bekele Tolosa, RPh",
    medicines: [
      {
        id: "MED-LINE-01",
        name: "Calcium Gluconate 10% Injection",
        code: "MED-0205",
        strength: "10% (10 mL)",
        dosageForm: "Injection Ampoule",
        route: "Slow IV Push",
        frequency: "Once STAT over 5 minutes",
        duration: "Single emergency dose",
        instructions: "Administer under continuous cardiac ECG monitoring. Do not mix with carbonate solutions.",
        prescribedQuantity: 2,
        previouslyDispensed: 0,
        remainingQuantity: 2,
        dispenseNowQuantity: 2,
        unit: "Ampoules",
        selectedBatchId: "BATCH-CG-2025-04",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-CG-2025-04",
            batchNumber: "LOT-CG-2025-04",
            usableQuantity: 24,
            physicalQuantity: 24,
            expiryDate: "14 Jul 2027",
            daysUntilExpiry: 271,
            location: "Emergency Drug Cupboard E-02",
            isEligible: true,
          },
        ],
      },
      {
        id: "MED-LINE-02",
        name: "Salbutamol 5mg/mL Respirator Solution",
        code: "MED-0182",
        strength: "5 mg / mL",
        dosageForm: "Nebulizer Solution",
        route: "Inhalation via Nebulizer",
        frequency: "Once STAT over 15 minutes",
        duration: "Single dose",
        instructions: "Nebulize driven by 6 L/min continuous oxygen flow.",
        prescribedQuantity: 2,
        previouslyDispensed: 0,
        remainingQuantity: 2,
        dispenseNowQuantity: 2,
        unit: "Vials",
        selectedBatchId: "BATCH-SAL-2025-09",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-SAL-2025-09",
            batchNumber: "LOT-SAL-2025-09",
            usableQuantity: 45,
            physicalQuantity: 45,
            expiryDate: "30 Sep 2027",
            daysUntilExpiry: 349,
            location: "Emergency Drug Cupboard E-04",
            isEligible: true,
          },
        ],
      },
      {
        id: "MED-LINE-03",
        name: "Furosemide 20mg/2mL Injection",
        code: "MED-0094",
        strength: "20 mg / 2 mL",
        dosageForm: "Injection Ampoule",
        route: "Slow IV Injection",
        frequency: "Once STAT",
        duration: "Single dose",
        instructions: "Slow IV push over 2 minutes. Monitor urine output hourly.",
        prescribedQuantity: 2,
        previouslyDispensed: 0,
        remainingQuantity: 2,
        dispenseNowQuantity: 2,
        unit: "Ampoules",
        selectedBatchId: "BATCH-FUR-2025-11",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-FUR-2025-11",
            batchNumber: "LOT-FUR-2025-11",
            usableQuantity: 80,
            physicalQuantity: 80,
            expiryDate: "15 Oct 2027",
            daysUntilExpiry: 364,
            location: "Dispensary / Shelf B-06",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [
      {
        transactionRef: "DISP-2026-00380",
        timestamp: "16 Oct 2026 · 10:50 AM",
        responsibleUser: "Ato Bekele Tolosa, RPh",
        medicineName: "Prescription Accessioned",
        batchNumber: "N/A",
        quantityDispensed: 0,
        unit: "N/A",
        outcome: "Partially Dispensed",
        notes: "STAT order received from Emergency. Began dispensing verification.",
      },
    ],
  },
  {
    id: "RX-2026-00126",
    patientName: "Tolosa Desta",
    patientId: "ORH-P-000215",
    ageGender: "19y / Male",
    dob: "05 Mar 2007",
    prescribingDepartment: "Pediatric / Youth Consultation (OPD-1)",
    prescribingClinician: "Dr. Helen Tadesse, MD",
    prescriptionDateTime: "16 Oct 2026 · 10:35 AM",
    priority: "Urgent",
    dispensingStatus: "Pending",
    clinicalApprovalStatus: "Clinically Verified by Dr. Helen Tadesse",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalIndication: "Confirmed Plasmodium falciparum Malaria (Microscopy: 2+ rings)",
    prescriberNotes: "Patient has high fever with rigors. Emphasize full 3-day course completion.",
    medicines: [
      {
        id: "MED-LINE-04",
        name: "Artemether-Lumefantrine (Coartem)",
        code: "MED-0230",
        strength: "20 mg / 120 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Twice daily (0h, 8h, then BID x 2 days)",
        duration: "3 days (6 doses total)",
        instructions: "Take with food or milk containing fat. Complete all 24 tablets even if feeling better.",
        prescribedQuantity: 24,
        previouslyDispensed: 0,
        remainingQuantity: 24,
        dispenseNowQuantity: 24,
        unit: "Tablets",
        selectedBatchId: "BATCH-COA-2026-01",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-COA-2026-01",
            batchNumber: "LOT-COA-2026-01",
            usableQuantity: 320,
            physicalQuantity: 320,
            expiryDate: "18 Jun 2028",
            daysUntilExpiry: 610,
            location: "Dispensary / Shelf A-02",
            isEligible: true,
          },
        ],
      },
      {
        id: "MED-LINE-05",
        name: "Paracetamol 500mg Tablets",
        code: "MED-0021",
        strength: "500 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Every 8 hours as needed for fever",
        duration: "3 days",
        instructions: "Do not exceed 4,000 mg in 24 hours. Maintain adequate hydration.",
        prescribedQuantity: 10,
        previouslyDispensed: 0,
        remainingQuantity: 10,
        dispenseNowQuantity: 10,
        unit: "Tablets",
        selectedBatchId: "BATCH-PARA-2026-02",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-PARA-2026-02",
            batchNumber: "LOT-PARA-2026-02",
            usableQuantity: 4200,
            physicalQuantity: 4200,
            expiryDate: "20 Dec 2028",
            daysUntilExpiry: 795,
            location: "Dispensary / Bulk Bay 01",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [],
  },
  {
    id: "RX-2026-00124",
    patientName: "Abebe Bekele",
    patientId: "ORH-P-000185",
    ageGender: "51y / Male",
    dob: "18 Jun 1975",
    prescribingDepartment: "Non-Communicable Diseases (NCD Clinic)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionDateTime: "16 Oct 2026 · 10:15 AM",
    priority: "Routine",
    dispensingStatus: "Pending",
    clinicalApprovalStatus: "Clinically Verified by Dr. Dawit Alemu",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalIndication: "Essential Hypertension & Mixed Dyslipidemia follow-up",
    prescriberNotes: "Monthly maintenance supply. Patient shows good compliance.",
    medicines: [
      {
        id: "MED-LINE-06",
        name: "Atorvastatin 20mg Tablets",
        code: "MED-0118",
        strength: "20 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Once daily at bedtime",
        duration: "30 days",
        instructions: "Take with or without food at bedtime. Report any unexplained muscle pain or weakness.",
        prescribedQuantity: 30,
        previouslyDispensed: 0,
        remainingQuantity: 30,
        dispenseNowQuantity: 30,
        unit: "Tablets",
        selectedBatchId: "BATCH-ATV-2025-07",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-ATV-2025-07",
            batchNumber: "LOT-ATV-2025-07",
            usableQuantity: 450,
            physicalQuantity: 450,
            expiryDate: "30 Mar 2027",
            daysUntilExpiry: 165,
            location: "Dispensary / Shelf C-04",
            isEligible: true,
          },
        ],
      },
      {
        id: "MED-LINE-07",
        name: "Amlodipine 5mg Tablets",
        code: "MED-0072",
        strength: "5 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Once daily in the morning",
        duration: "30 days",
        instructions: "Take every morning with water. Monitor blood pressure at local health post weekly.",
        prescribedQuantity: 30,
        previouslyDispensed: 0,
        remainingQuantity: 30,
        dispenseNowQuantity: 30,
        unit: "Tablets",
        selectedBatchId: "BATCH-AML-2026-03",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-AML-2026-03",
            batchNumber: "LOT-AML-2026-03",
            usableQuantity: 600,
            physicalQuantity: 600,
            expiryDate: "15 May 2028",
            daysUntilExpiry: 576,
            location: "Dispensary / Shelf C-01",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [],
  },
  {
    id: "RX-2026-00128",
    patientName: "Fatuma Kedir",
    patientId: "ORH-P-000174",
    ageGender: "44y / Female",
    dob: "20 Aug 1982",
    prescribingDepartment: "Maternal Health Clinic (ANC)",
    prescribingClinician: "Dr. Aster Bekele, MD",
    prescriptionDateTime: "16 Oct 2026 · 09:50 AM",
    priority: "Routine",
    dispensingStatus: "Partially Dispensed",
    clinicalApprovalStatus: "Clinically Verified by Dr. Aster Bekele (ANC Lead)",
    paymentStatus: "Paid (Cash)",
    clinicalIndication: "Gestational Diabetes Mellitus (FBS 142 mg/dL) & Iron deficiency",
    prescriberNotes: "Patient received injection technique counselling in clinic. Prescribed 2 vials Insulin NPH.",
    assignedPharmacist: "W/ro Selamawit Degu",
    medicines: [
      {
        id: "MED-LINE-08",
        name: "Insulin NPH (Human Isophane) 100 IU/mL",
        code: "MED-0160",
        strength: "100 IU / mL (10 mL)",
        dosageForm: "Subcutaneous Injection Vial",
        route: "Subcutaneous",
        frequency: "14 IU morning, 8 IU evening",
        duration: "30 days",
        instructions: "Keep refrigerated (2°C – 8°C). Gently roll vial 10 times between palms before drawing.",
        prescribedQuantity: 2,
        previouslyDispensed: 1,
        remainingQuantity: 1,
        dispenseNowQuantity: 1,
        unit: "Vials",
        selectedBatchId: "BATCH-INS-2025-02",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-INS-2025-02",
            batchNumber: "LOT-INS-2025-02",
            usableQuantity: 18,
            physicalQuantity: 18,
            expiryDate: "12 Apr 2027",
            daysUntilExpiry: 178,
            location: "Dispensary Refrigerator R-01",
            isEligible: true,
          },
        ],
      },
      {
        id: "MED-LINE-09",
        name: "Ferrous Sulfate 200mg + Folic Acid 0.5mg",
        code: "MED-0044",
        strength: "200 mg / 0.5 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Once daily with water",
        duration: "30 days",
        instructions: "Do not take with tea, coffee, or milk. May cause harmless black stools.",
        prescribedQuantity: 30,
        previouslyDispensed: 30,
        remainingQuantity: 0,
        dispenseNowQuantity: 0,
        unit: "Tablets",
        selectedBatchId: "BATCH-FEF-2025-05",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-FEF-2025-05",
            batchNumber: "LOT-FEF-2025-05",
            usableQuantity: 800,
            physicalQuantity: 800,
            expiryDate: "10 Aug 2027",
            daysUntilExpiry: 298,
            location: "Dispensary / Shelf A-05",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [
      {
        transactionRef: "DISP-2026-00375",
        timestamp: "16 Oct 2026 · 10:05 AM",
        responsibleUser: "W/ro Selamawit Degu",
        medicineName: "Insulin NPH 100 IU/mL",
        batchNumber: "LOT-INS-2025-02",
        quantityDispensed: 1,
        unit: "Vials",
        outcome: "Partially Dispensed",
        partialReason: "Insufficient refrigerated stock in dispensary drawer; balance deferred to follow-up visit.",
        notes: "1 vial Insulin NPH and 30 tabs Ferrous+Folate dispensed. Remaining 1 vial Insulin NPH on hold.",
      },
    ],
  },
  {
    id: "RX-2026-00129",
    patientName: "Girma Worku",
    patientId: "ORH-P-000160",
    ageGender: "38y / Male",
    dob: "02 Feb 1988",
    prescribingDepartment: "General Outpatient Consultation (Adult OPD-1)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionDateTime: "16 Oct 2026 · 08:45 AM",
    priority: "Routine",
    dispensingStatus: "On Hold",
    clinicalApprovalStatus: "Clarification Requested by Pharmacy",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalIndication: "Suspected lower urinary tract infection",
    prescriberNotes: "Ciprofloxacin 500mg BID x 7 days prescribed.",
    holdReason: "Prescription clarification required: Urinalysis microscopy was negative for significant bacteriuria (WBC 1-2/HPF, Nitrite neg). Attending clinician contacted for antibiotic stewardship review.",
    holdTimestamp: "16 Oct 2026 · 09:10 AM",
    holdUser: "Ato Bekele Tolosa, RPh",
    medicines: [
      {
        id: "MED-LINE-10",
        name: "Ciprofloxacin 500mg Tablets",
        code: "MED-0055",
        strength: "500 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Drink plenty of water. Avoid calcium or antacid ingestion within 2 hours of dose.",
        prescribedQuantity: 14,
        previouslyDispensed: 0,
        remainingQuantity: 14,
        dispenseNowQuantity: 14,
        unit: "Tablets",
        selectedBatchId: "BATCH-CIP-2024-C2",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-CIP-2024-C2",
            batchNumber: "LOT-CIP-2024-C2",
            usableQuantity: 180,
            physicalQuantity: 180,
            expiryDate: "15 Nov 2026",
            daysUntilExpiry: 30,
            location: "Dispensary / Shelf A-08",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [
      {
        transactionRef: "HOLD-2026-00042",
        timestamp: "16 Oct 2026 · 09:10 AM",
        responsibleUser: "Ato Bekele Tolosa, RPh",
        medicineName: "Ciprofloxacin 500mg Tablets",
        batchNumber: "N/A",
        quantityDispensed: 0,
        unit: "Tablets",
        outcome: "Partially Dispensed",
        notes: "Placed on hold pending clinician re-evaluation of negative urinalysis.",
      },
    ],
  },
  {
    id: "RX-2026-00127",
    patientName: "Hana Mohammed",
    patientId: "ORH-P-000208",
    ageGender: "28y / Female",
    dob: "14 May 1998",
    prescribingDepartment: "General Outpatient Consultation (Adult OPD-2)",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionDateTime: "16 Oct 2026 · 09:15 AM",
    priority: "Routine",
    dispensingStatus: "Dispensed",
    clinicalApprovalStatus: "Clinically Verified by Dr. Dawit Alemu",
    paymentStatus: "Settled / Insured (CBHI)",
    clinicalIndication: "Microcytic Hypochromic Anemia (Hb 9.2 g/dL)",
    prescriberNotes: "Full 60-day oral iron replacement therapy.",
    assignedPharmacist: "Ato Bekele Tolosa, RPh",
    medicines: [
      {
        id: "MED-LINE-11",
        name: "Ferrous Sulfate 200mg Tablets",
        code: "MED-0045",
        strength: "200 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Twice daily after meals",
        duration: "60 days",
        instructions: "Take with fresh water or citrus juice. Avoid tea or dairy products within 1 hour.",
        prescribedQuantity: 120,
        previouslyDispensed: 120,
        remainingQuantity: 0,
        dispenseNowQuantity: 0,
        unit: "Tablets",
        selectedBatchId: "BATCH-FS-2026-01",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-FS-2026-01",
            batchNumber: "LOT-FS-2026-01",
            usableQuantity: 1400,
            physicalQuantity: 1400,
            expiryDate: "15 Jan 2028",
            daysUntilExpiry: 456,
            location: "Dispensary / Shelf A-03",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [
      {
        transactionRef: "DISP-2026-00368",
        timestamp: "16 Oct 2026 · 09:30 AM",
        responsibleUser: "Ato Bekele Tolosa, RPh",
        medicineName: "Ferrous Sulfate 200mg Tablets",
        batchNumber: "LOT-FS-2026-01",
        quantityDispensed: 120,
        unit: "Tablets",
        outcome: "Fully Dispensed",
        notes: "Full 60-day supply dispensed. Patient counselled on gastrointestinal tolerance.",
      },
    ],
  },
  {
    id: "RX-2026-00130",
    patientName: "Chala Tufa",
    patientId: "ORH-P-000155",
    ageGender: "49y / Male",
    dob: "24 Nov 1976",
    prescribingDepartment: "Chest / Pulmonary Clinic",
    prescribingClinician: "Dr. Aster Bekele, MD",
    prescriptionDateTime: "16 Oct 2026 · 11:10 AM",
    priority: "Routine",
    dispensingStatus: "Pending",
    clinicalApprovalStatus: "Clinically Verified by Dr. Aster Bekele",
    paymentStatus: "Paid (Cash)",
    clinicalIndication: "Post-TB evaluation recovery supportive care (GeneXpert negative)",
    medicines: [
      {
        id: "MED-LINE-12",
        name: "Vitamin B-Complex Tablets",
        code: "MED-0033",
        strength: "B1/B2/B6/B12",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Once daily with morning meal",
        duration: "30 days",
        instructions: "Take with breakfast.",
        prescribedQuantity: 30,
        previouslyDispensed: 0,
        remainingQuantity: 30,
        dispenseNowQuantity: 30,
        unit: "Tablets",
        selectedBatchId: "BATCH-VBC-2025-08",
        matchedStatus: "Exact Match",
        availableBatches: [
          {
            id: "BATCH-VBC-2025-08",
            batchNumber: "LOT-VBC-2025-08",
            usableQuantity: 520,
            physicalQuantity: 520,
            expiryDate: "14 Feb 2027",
            daysUntilExpiry: 121,
            location: "Dispensary / Shelf B-01",
            isEligible: true,
          },
        ],
      },
    ],
    auditHistory: [],
  },
  {
    id: "RX-2026-00121",
    patientName: "Kalkidan Fikre",
    patientId: "ORH-P-000142",
    ageGender: "31y / Female",
    dob: "15 Sep 1995",
    prescribingDepartment: "Adult OPD-2",
    prescribingClinician: "Dr. Dawit Alemu, MD",
    prescriptionDateTime: "15 Oct 2026 · 02:40 PM",
    priority: "Routine",
    dispensingStatus: "Cancelled",
    clinicalApprovalStatus: "Prescription Cancelled by Attending Clinician",
    paymentStatus: "Exempt",
    clinicalIndication: "Acute electrolyte re-evaluation",
    cancellationReason: "Patient transferred to inpatient medical ward; outpatient prescription cancelled. Inpatient drug chart supersedes.",
    medicines: [
      {
        id: "MED-LINE-13",
        name: "Oral Potassium Chloride 600mg Tablets",
        code: "MED-0099",
        strength: "600 mg",
        dosageForm: "Tablet",
        route: "Oral",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "Take with full glass of water.",
        prescribedQuantity: 10,
        previouslyDispensed: 0,
        remainingQuantity: 10,
        dispenseNowQuantity: 0,
        unit: "Tablets",
        selectedBatchId: "BATCH-KCL-2025-01",
        matchedStatus: "Ineligible",
        availableBatches: [
          {
            id: "BATCH-KCL-2025-01",
            batchNumber: "LOT-KCL-2025-01",
            usableQuantity: 210,
            physicalQuantity: 210,
            expiryDate: "10 Dec 2026",
            daysUntilExpiry: 55,
            location: "Dispensary / Shelf B-05",
            isEligible: false,
            ineligibilityReason: "Prescription cancelled — dispensing locked.",
          },
        ],
      },
    ],
    auditHistory: [
      {
        transactionRef: "CANC-2026-00019",
        timestamp: "15 Oct 2026 · 03:15 PM",
        responsibleUser: "Dr. Dawit Alemu, MD",
        medicineName: "Oral Potassium Chloride 600mg",
        batchNumber: "N/A",
        quantityDispensed: 0,
        unit: "Tablets",
        outcome: "Partially Dispensed",
        notes: "Cancelled due to inpatient ward transfer.",
      },
    ],
  },
]
