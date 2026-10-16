// ORHIMS — Phase 06, Prompt 34: Laboratory Result Review and Approval Data Model
// Bale Robe, Ethiopia — Central Diagnostic Laboratory

export type ReviewStatus =
  | "Pending Review"
  | "Approved"
  | "Returned for Correction"
  | "Released"
  | "Escalated"

export type ReviewPriority = "Routine" | "Urgent" | "STAT"

export interface ReviewAnalyte {
  name: string
  code: string
  submittedResult: string
  unit: string
  referenceInterval: string
  flag: "Normal" | "Low" | "High" | "Critical" | "Abnormal"
  entryStatus: "Validated" | "Manual Entry" | "Analyzer Run" | "Flagged"
  historicalResult?: string
  historicalDate?: string
  historicalUnit?: string
  historicalInterval?: string
  trend?: "Up" | "Down" | "Stable"
  reviewerComment?: string
}

export interface ReviewAuditItem {
  timestamp: string
  event: string
  user: string
  role: string
  notes?: string
}

export interface ReviewOrder {
  orderNumber: string // e.g., "ORD-LAB-2026-00138"
  patientName: string // e.g., "Hana Mohammed"
  patientId: string // e.g., "ORH-P-000208"
  ageGender: string // e.g., "28y / Female"
  dob: string // e.g., "14 May 1998"
  orderingClinician: string // e.g., "Dr. Dawit Alemu, MD"
  orderingDepartment: string // e.g., "Adult OPD-2"
  orderDateTime: string // e.g., "15 Oct 2026 · 09:15"
  submissionDateTime: string // e.g., "15 Oct 2026 · 09:45"
  specimenType: string // e.g., "Whole Blood (EDTA)"
  specimenId: string // e.g., "SP-2026-9040"
  collectionReceiptTime: string // e.g., "Collected: 09:22 · Received: 09:28"
  specimenIntegrity: string
  laboratoryComments: string
  testName: string // e.g., "Complete Blood Count (CBC) with 5-Part Differential"
  priority: ReviewPriority
  status: ReviewStatus
  hasAbnormal: boolean
  hasCritical: boolean
  analytes: ReviewAnalyte[]
  internalReviewNotes?: string
  correctionReason?: string
  correctionDescription?: string
  escalationNotes?: string
  escalatedTo?: string
  approvedBy?: string
  approvedAt?: string
  auditHistory: ReviewAuditItem[]
}

/**
 * Fictional demonstration dataset for Oda Roba General Hospital
 * Central Diagnostic Laboratory senior supervisory review queue.
 */
export const demoReviewOrders: ReviewOrder[] = [
  {
    orderNumber: "ORD-LAB-2026-00138",
    patientName: "Hana Mohammed",
    patientId: "ORH-P-000208",
    ageGender: "28y / Female",
    dob: "14 May 1998",
    orderingClinician: "Dr. Dawit Alemu, MD",
    orderingDepartment: "General Outpatient Consultation (Adult OPD-2)",
    orderDateTime: "15 Oct 2026 · 09:15",
    submissionDateTime: "15 Oct 2026 · 09:45",
    specimenType: "Whole Blood (EDTA)",
    specimenId: "SP-2026-9040",
    collectionReceiptTime: "Collected: 09:22 · Received: 09:28",
    specimenIntegrity: "Adequate volume (3.0 mL), clean lavender-top tube, unhemolyzed, no microclots detected.",
    laboratoryComments: "Processed on Sysmex XN-350 automated hematology analyzer with 5-part leukocyte differential. Calibration and 3-level QC verified valid at 08:00.",
    testName: "Complete Blood Count (CBC) with Differential",
    priority: "Urgent",
    status: "Pending Review",
    hasAbnormal: true,
    hasCritical: false,
    analytes: [
      {
        name: "Hemoglobin (Hgb)",
        code: "HGB",
        submittedResult: "10.8",
        unit: "g/dL",
        referenceInterval: "12.0 - 15.5",
        flag: "Low",
        entryStatus: "Analyzer Run",
        historicalResult: "11.2",
        historicalDate: "12 Aug 2026",
        historicalUnit: "g/dL",
        historicalInterval: "12.0 - 15.5",
        trend: "Down",
      },
      {
        name: "White Blood Cell Count (WBC)",
        code: "WBC",
        submittedResult: "7.4",
        unit: "x10³/µL",
        referenceInterval: "4.0 - 10.0",
        flag: "Normal",
        entryStatus: "Analyzer Run",
        historicalResult: "6.9",
        historicalDate: "12 Aug 2026",
        historicalUnit: "x10³/µL",
        historicalInterval: "4.0 - 10.0",
        trend: "Stable",
      },
      {
        name: "Platelet Count",
        code: "PLT",
        submittedResult: "248",
        unit: "x10³/µL",
        referenceInterval: "150 - 450",
        flag: "Normal",
        entryStatus: "Analyzer Run",
        historicalResult: "235",
        historicalDate: "12 Aug 2026",
        historicalUnit: "x10³/µL",
        historicalInterval: "150 - 450",
        trend: "Stable",
      },
      {
        name: "Red Blood Cell Count (RBC)",
        code: "RBC",
        submittedResult: "4.12",
        unit: "x10⁶/µL",
        referenceInterval: "3.80 - 5.20",
        flag: "Normal",
        entryStatus: "Analyzer Run",
        historicalResult: "4.20",
        historicalDate: "12 Aug 2026",
        historicalUnit: "x10⁶/µL",
        historicalInterval: "3.80 - 5.20",
        trend: "Stable",
      },
      {
        name: "Hematocrit (Hct)",
        code: "HCT",
        submittedResult: "33.2",
        unit: "%",
        referenceInterval: "36.0 - 46.0",
        flag: "Low",
        entryStatus: "Analyzer Run",
        historicalResult: "34.5",
        historicalDate: "12 Aug 2026",
        historicalUnit: "%",
        historicalInterval: "36.0 - 46.0",
        trend: "Down",
      },
      {
        name: "Neutrophils %",
        code: "NEUT%",
        submittedResult: "58.4",
        unit: "%",
        referenceInterval: "40.0 - 70.0",
        flag: "Normal",
        entryStatus: "Analyzer Run",
      },
      {
        name: "Lymphocytes %",
        code: "LYMPH%",
        submittedResult: "32.1",
        unit: "%",
        referenceInterval: "20.0 - 45.0",
        flag: "Normal",
        entryStatus: "Analyzer Run",
      },
    ],
    auditHistory: [
      {
        timestamp: "09:15",
        event: "Order Placed",
        user: "Dr. Dawit Alemu, MD",
        role: "Requesting Clinician",
        notes: "Urgent CBC ordered from Adult OPD-2",
      },
      {
        timestamp: "09:22",
        event: "Specimen Collected",
        user: "Sr. Chala Beyene",
        role: "Phlebotomist",
        notes: "Right arm median cubital venipuncture",
      },
      {
        timestamp: "09:28",
        event: "Accession Verified",
        user: "Sr. Tirhas Wolde",
        role: "Lab Officer",
        notes: "Label and tube integrity verified",
      },
      {
        timestamp: "09:45",
        event: "Results Submitted",
        user: "Ato Dawit Haile",
        role: "Bench Tech",
        notes: "Sysmex automated run completed and transferred to supervisory review queue",
      },
    ],
  },
  {
    orderNumber: "ORD-LAB-2026-00135",
    patientName: "Almaz Kebede Dadi",
    patientId: "ORH-P-000194",
    ageGender: "56y / Female",
    dob: "19 Jan 1970",
    orderingClinician: "Dr. Gemechu Tufa, MD",
    orderingDepartment: "Internal Medicine OPD",
    orderDateTime: "15 Oct 2026 · 08:45",
    submissionDateTime: "15 Oct 2026 · 09:30",
    specimenType: "Serum (SST)",
    specimenId: "SP-2026-9039",
    collectionReceiptTime: "Collected: 08:55 · Received: 09:05",
    specimenIntegrity: "Volume 4.5 mL, gold top tube, centrifuged 3000 RPM for 10 min. Non-lipemic, no hemolysis.",
    laboratoryComments: "Cobas c311 chemistry analyzer. Repeat assay performed to verify critical hyperkalemia.",
    testName: "Renal Function Panel & Electrolytes",
    priority: "Routine",
    status: "Pending Review",
    hasAbnormal: true,
    hasCritical: true,
    analytes: [
      {
        name: "Serum Potassium (K+)",
        code: "K",
        submittedResult: "6.4",
        unit: "mmol/L",
        referenceInterval: "3.5 - 5.0",
        flag: "Critical",
        entryStatus: "Flagged",
        historicalResult: "4.8",
        historicalDate: "04 May 2026",
        historicalUnit: "mmol/L",
        historicalInterval: "3.5 - 5.0",
        trend: "Up",
        reviewerComment: "Critical threshold exceeded (> 6.2 mmol/L). Re-run confirmed duplicate value.",
      },
      {
        name: "Serum Creatinine",
        code: "CREAT",
        submittedResult: "1.9",
        unit: "mg/dL",
        referenceInterval: "0.6 - 1.2",
        flag: "High",
        entryStatus: "Analyzer Run",
        historicalResult: "1.3",
        historicalDate: "04 May 2026",
        historicalUnit: "mg/dL",
        historicalInterval: "0.6 - 1.2",
        trend: "Up",
      },
      {
        name: "Blood Urea Nitrogen (BUN)",
        code: "BUN",
        submittedResult: "38.0",
        unit: "mg/dL",
        referenceInterval: "7.0 - 20.0",
        flag: "High",
        entryStatus: "Analyzer Run",
      },
      {
        name: "Serum Sodium (Na+)",
        code: "NA",
        submittedResult: "139.0",
        unit: "mmol/L",
        referenceInterval: "135.0 - 145.0",
        flag: "Normal",
        entryStatus: "Analyzer Run",
      },
    ],
    auditHistory: [
      {
        timestamp: "08:45",
        event: "Order Placed",
        user: "Dr. Gemechu Tufa, MD",
        role: "Requesting Clinician",
      },
      {
        timestamp: "09:30",
        event: "Results Submitted",
        user: "Ato Dawit Haile",
        role: "Bench Tech",
        notes: "Critical potassium 6.4 mmol/L flagged for immediate supervisory review.",
      },
    ],
  },
  {
    orderNumber: "ORD-LAB-2026-00139",
    patientName: "Tolosa Desta Roba",
    patientId: "ORH-P-000219",
    ageGender: "42y / Male",
    dob: "12 Mar 1984",
    orderingClinician: "Dr. Gemechu Tufa, MD",
    orderingDepartment: "Outpatient Clinic 2",
    orderDateTime: "15 Oct 2026 · 09:30",
    submissionDateTime: "15 Oct 2026 · 09:55",
    specimenType: "Capillary Blood",
    specimenId: "SP-2026-9041",
    collectionReceiptTime: "Collected: 09:35 · Received: 09:38",
    specimenIntegrity: "Clean finger prick capillary collection, thick and thin smears prepared on clean frosted slides.",
    laboratoryComments: "Giemsa stain 10% for 30 minutes. Microscopic examination at 1000x oil immersion. Ring forms visualized.",
    testName: "Malaria Rapid Diagnostic Test (mRDT) & Blood Film",
    priority: "STAT",
    status: "Pending Review",
    hasAbnormal: true,
    hasCritical: false,
    analytes: [
      {
        name: "mRDT Antigen Detection",
        code: "MRDT",
        submittedResult: "Positive (P. falciparum HRP2)",
        unit: "",
        referenceInterval: "Negative (Non-reactive)",
        flag: "Abnormal",
        entryStatus: "Manual Entry",
      },
      {
        name: "Blood Film for MP (Species)",
        code: "BF-SPEC",
        submittedResult: "Plasmodium falciparum",
        unit: "",
        referenceInterval: "No hemoparasites seen",
        flag: "Abnormal",
        entryStatus: "Manual Entry",
      },
      {
        name: "Parasite Density",
        code: "BF-DENS",
        submittedResult: "2+ (1-10 parasites per oil immersion field)",
        unit: "",
        referenceInterval: "Reference range unavailable",
        flag: "Abnormal",
        entryStatus: "Manual Entry",
      },
    ],
    auditHistory: [
      {
        timestamp: "09:30",
        event: "Order Placed",
        user: "Dr. Gemechu Tufa, MD",
        role: "Requesting Clinician",
      },
      {
        timestamp: "09:55",
        event: "Results Submitted",
        user: "Sr. Chala Beyene",
        role: "Phlebotomist / Tech",
      },
    ],
  },
  {
    orderNumber: "ORD-LAB-2026-00132",
    patientName: "Fatuma Kedir Gudeta",
    patientId: "ORH-P-000185",
    ageGender: "51y / Female",
    dob: "22 Sep 1975",
    orderingClinician: "Dr. Gemechu Tufa, MD",
    orderingDepartment: "Internal Medicine OPD",
    orderDateTime: "15 Oct 2026 · 08:15",
    submissionDateTime: "15 Oct 2026 · 09:12",
    specimenType: "Plasma (Fluoride Oxalate)",
    specimenId: "SP-2026-9037",
    collectionReceiptTime: "Collected: 08:30 · Received: 08:35",
    specimenIntegrity: "Grey top tube (2.0 mL), adequate filling.",
    laboratoryComments: "Analyzer run 168.0 mg/dL. Re-run matched 167.8 mg/dL.",
    testName: "Fasting Blood Sugar (FBS)",
    priority: "Routine",
    status: "Returned for Correction",
    hasAbnormal: true,
    hasCritical: false,
    correctionReason: "Insufficient documentation",
    correctionDescription: "Please confirm and record patient overnight fasting duration (hours) in technical remarks before authorization.",
    analytes: [
      {
        name: "Fasting Blood Sugar",
        code: "FBS",
        submittedResult: "168.0",
        unit: "mg/dL",
        referenceInterval: "70.0 - 100.0",
        flag: "High",
        entryStatus: "Analyzer Run",
        historicalResult: "142.0",
        historicalDate: "10 Jun 2026",
        historicalUnit: "mg/dL",
        historicalInterval: "70.0 - 100.0",
        trend: "Up",
      },
    ],
    auditHistory: [
      {
        timestamp: "08:15",
        event: "Order Placed",
        user: "Dr. Gemechu Tufa, MD",
        role: "Requesting Clinician",
      },
      {
        timestamp: "09:12",
        event: "Results Submitted",
        user: "Ato Dawit Haile",
        role: "Bench Tech",
      },
      {
        timestamp: "09:25",
        event: "Correction Requested",
        user: "Sr. Tirhas Wolde",
        role: "Senior Lab Officer",
        notes: "Returned for documentation of verified fasting hours.",
      },
    ],
  },
  {
    orderNumber: "ORD-LAB-2026-00129",
    patientName: "Girma Worku Megersa",
    patientId: "ORH-P-000142",
    ageGender: "63y / Male",
    dob: "14 Nov 1962",
    orderingClinician: "Dr. Daniel Mengistu, MD",
    orderingDepartment: "Emergency Triage Unit",
    orderDateTime: "15 Oct 2026 · 07:45",
    submissionDateTime: "15 Oct 2026 · 08:10",
    specimenType: "Random Clean-Catch Urine",
    specimenId: "SP-2026-9028",
    collectionReceiptTime: "Collected: 07:45 · Received: 07:50",
    specimenIntegrity: "Sterile cup 40 mL, clear yellow.",
    laboratoryComments: "Manual dipstick read at 60s. Microscopy confirms moderate pyuria.",
    testName: "Urinalysis Dipstick & Microscopy",
    priority: "STAT",
    status: "Approved",
    hasAbnormal: true,
    hasCritical: false,
    approvedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    approvedAt: "15 Oct 2026 · 08:18",
    analytes: [
      {
        name: "Urine Protein",
        code: "URI-PROT",
        submittedResult: "Trace",
        unit: "",
        referenceInterval: "Negative",
        flag: "Abnormal",
        entryStatus: "Manual Entry",
      },
      {
        name: "Leukocyte Esterase",
        code: "URI-LEUK",
        submittedResult: "2+ Moderate",
        unit: "",
        referenceInterval: "Negative",
        flag: "Abnormal",
        entryStatus: "Manual Entry",
      },
      {
        name: "Urine Glucose",
        code: "URI-GLUC",
        submittedResult: "Negative",
        unit: "",
        referenceInterval: "Negative",
        flag: "Normal",
        entryStatus: "Manual Entry",
      },
    ],
    auditHistory: [
      {
        timestamp: "07:45",
        event: "Order Placed",
        user: "Dr. Daniel Mengistu, MD",
        role: "Requesting Clinician",
      },
      {
        timestamp: "08:10",
        event: "Results Submitted",
        user: "Ato Dawit Haile",
        role: "Bench Tech",
      },
      {
        timestamp: "08:18",
        event: "Results Approved",
        user: "Sr. Tirhas Wolde",
        role: "Senior Lab Officer",
        notes: "Authorized findings and released to Emergency Triage Unit.",
      },
    ],
  },
]
