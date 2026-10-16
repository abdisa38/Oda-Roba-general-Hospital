// ORHIMS — Laboratory Orders Data Model (Phase 05, Prompt 30)

export interface LabPatientContext {
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
  allergiesAlert?: string
  diagnoses: {
    code: string
    name: string
    type: "Primary" | "Secondary"
  }[]
}

export type LabRequestStatus =
  | "Draft"
  | "Requested"
  | "Accepted"
  | "Specimen Collection Pending"
  | "Specimen Collected"
  | "In Progress"
  | "Result Available"
  | "Cancelled"

export type LabPriority = "Routine" | "Urgent (STAT)"

export interface LabCatalogueTest {
  id: string
  code: string // e.g., LAB-CBC-01
  name: string
  category: "Hematology" | "Parasitology" | "Clinical Chemistry" | "Microbiology / TB" | "Serology" | "Urinalysis"
  specimenType: string // e.g., "Whole Blood (EDTA 3mL Lavender Tube)"
  standardTurnaround: string // e.g., "1 - 2 hours"
  description: string
  fastingRequired?: boolean
}

export interface LabResultItem {
  parameter: string
  value: string
  unit: string
  referenceRange: string
  flag?: "Normal" | "High" | "Low" | "Critical"
}

export interface LabResultReport {
  reportedAt: string
  technologistName: string
  technologistRole: string
  reviewedByDoctor?: string
  reviewedAt?: string
  findingsSummary: string
  results: LabResultItem[]
}

export interface LaboratoryRequest {
  id: string // e.g., LR-2026-0184
  encounterId: string
  patientId: string
  tests: LabCatalogueTest[]
  priority: LabPriority
  clinicalIndication: string
  notesForLab?: string
  requestedCollectionTiming: string
  orderedBy: string
  orderRole: string
  orderedDate: string
  orderedTime: string
  status: LabRequestStatus
  specimenCollectedAt?: string
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
  resultReport?: LabResultReport
  history: {
    timestamp: string
    status: LabRequestStatus
    actor: string
    note?: string
  }[]
}

// Current Patient & Active Encounter context for Prompt 30
export const sampleLabPatient: LabPatientContext = {
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
  allergiesAlert: "Penicillin G & Beta-Lactams (Severe Anaphylaxis Risk)",
  diagnoses: [
    { code: "J02.9", name: "Acute Pharyngitis, Unspecified", type: "Primary" },
    { code: "J45.21", name: "Mild Intermittent Asthma with Acute Exacerbation", type: "Secondary" },
  ],
}

// Hospital Laboratory Catalogue (Essential Diagnostic Tests)
export const hospitalLabCatalogue: LabCatalogueTest[] = [
  {
    id: "lab-01",
    code: "HEM-CBC",
    name: "Complete Blood Count (CBC) with 5-Part Diff",
    category: "Hematology",
    specimenType: "Whole Blood (EDTA 3mL Lavender Top)",
    standardTurnaround: "1 - 2 hours",
    description: "Evaluates RBC, WBC, Hemoglobin, Hematocrit, Platelets, and leukocyte differential.",
  },
  {
    id: "lab-02",
    code: "PAR-MRDT",
    name: "Malaria Rapid Diagnostic Test (mRDT)",
    category: "Parasitology",
    specimenType: "Capillary or Venous Blood (0.5 mL)",
    standardTurnaround: "30 minutes",
    description: "Qualitative detection of Plasmodium falciparum and pan-Plasmodium antigens.",
  },
  {
    id: "lab-03",
    code: "PAR-BFMP",
    name: "Blood Film for Malaria Parasites (BF for MP)",
    category: "Parasitology",
    specimenType: "Whole Blood Smear (Giemsa stain)",
    standardTurnaround: "1 - 2 hours",
    description: "Microscopic quantification of malaria species and parasite density.",
  },
  {
    id: "lab-04",
    code: "CHM-RFT",
    name: "Renal Function Test (Creatinine & Blood Urea Nitrogen)",
    category: "Clinical Chemistry",
    specimenType: "Serum (5 mL Gold / SST Gel Tube)",
    standardTurnaround: "2 - 3 hours",
    description: "Assesses glomerular filtration rate, kidney function, and nitrogenous clearance.",
  },
  {
    id: "lab-05",
    code: "CHM-LYTES",
    name: "Serum Electrolytes (Na+, K+, Cl-)",
    category: "Clinical Chemistry",
    specimenType: "Serum (4 mL SST Gel Tube)",
    standardTurnaround: "1 - 2 hours",
    description: "Monitors fluid-electrolyte balance and acid-base homeostasis.",
  },
  {
    id: "lab-06",
    code: "CHM-FBS",
    name: "Fasting Blood Sugar (FBS)",
    category: "Clinical Chemistry",
    specimenType: "Plasma (Fluoride Oxalate Grey Top)",
    standardTurnaround: "1 hour",
    fastingRequired: true,
    description: "Measures baseline glucose after an overnight fast (minimum 8 hours).",
  },
  {
    id: "lab-07",
    code: "URI-DIP",
    name: "Urinalysis (Chemical Dipstick & Microscopic Exam)",
    category: "Urinalysis",
    specimenType: "Clean-Catch Midstream Urine (Sterile Container)",
    standardTurnaround: "45 minutes",
    description: "Detects proteinuria, hematuria, leukocyte esterase, nitrites, and urinary casts.",
  },
  {
    id: "lab-08",
    code: "MIC-AFB",
    name: "Sputum Smear for Acid-Fast Bacilli (AFB / ZN Stain)",
    category: "Microbiology / TB",
    specimenType: "Early Morning Deep Sputum (Sterile Cup)",
    standardTurnaround: "4 - 6 hours",
    description: "Microscopic examination for Mycobacterium tuberculosis using Ziehl-Neelsen staining.",
  },
  {
    id: "lab-09",
    code: "SER-WIDAL",
    name: "Widal Agglutination Test (Typhoid Serology)",
    category: "Serology",
    specimenType: "Serum (3 mL Red Top Tube)",
    standardTurnaround: "2 hours",
    description: "Semi-quantitative detection of agglutinating antibodies against Salmonella enterica serovars.",
  },
  {
    id: "lab-10",
    code: "CHM-LFT",
    name: "Liver Function Tests (ALT, AST, Total & Direct Bilirubin, ALP)",
    category: "Clinical Chemistry",
    specimenType: "Serum (5 mL Gold SST Tube)",
    standardTurnaround: "2 - 3 hours",
    description: "Comprehensive panel evaluating hepatic enzyme integrity and biliary clearance.",
  },
]

// Initial Encounter Laboratory Requests
export const initialLabRequests: LaboratoryRequest[] = [
  {
    id: "LR-2026-0184",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    tests: [
      hospitalLabCatalogue[0], // Complete Blood Count (CBC)
    ],
    priority: "Routine",
    clinicalIndication: "Severe sore throat, high fever (38.8°C), and cervical lymphadenopathy. Evaluate for leukocytosis.",
    notesForLab: "Patient has documented Penicillin allergy. Phlebotomy performed in Adult OPD.",
    requestedCollectionTiming: "Immediate (Clinic collection)",
    orderedBy: "Dr. Dawit Alemu",
    orderRole: "Consulting Physician",
    orderedDate: "15 Oct 2026",
    orderedTime: "08:50 AM",
    status: "Result Available",
    specimenCollectedAt: "15 Oct 2026 · 09:05 AM",
    resultReport: {
      reportedAt: "15 Oct 2026 · 09:40 AM",
      technologistName: "Yohannes Tesfaye",
      technologistRole: "Senior Medical Laboratory Technologist",
      findingsSummary: "Moderate neutrophilic leukocytosis observed. Red cell indices and platelet count remain within normal limits.",
      results: [
        { parameter: "White Blood Cells (WBC)", value: "14.2", unit: "10^3/uL", referenceRange: "4.5 - 11.0", flag: "High" },
        { parameter: "Neutrophils (%)", value: "78.4", unit: "%", referenceRange: "40.0 - 70.0", flag: "High" },
        { parameter: "Lymphocytes (%)", value: "15.8", unit: "%", referenceRange: "20.0 - 45.0", flag: "Low" },
        { parameter: "Hemoglobin (Hgb)", value: "13.6", unit: "g/dL", referenceRange: "12.0 - 15.5", flag: "Normal" },
        { parameter: "Hematocrit (Hct)", value: "40.8", unit: "%", referenceRange: "37.0 - 48.0", flag: "Normal" },
        { parameter: "Platelet Count", value: "245", unit: "10^3/uL", referenceRange: "150 - 450", flag: "Normal" },
      ],
    },
    history: [
      { timestamp: "08:50 AM", status: "Requested", actor: "Dr. Dawit Alemu", note: "Requisition submitted from Adult OPD-2" },
      { timestamp: "08:58 AM", status: "Accepted", actor: "Central Laboratory Reception", note: "Order acknowledged by laboratory desk" },
      { timestamp: "09:05 AM", status: "Specimen Collected", actor: "Nurse Rahel", note: "Lavender top tube received at phlebotomy" },
      { timestamp: "09:12 AM", status: "In Progress", actor: "Yohannes Tesfaye", note: "Specimen running on Mindray BC-5000 analyzer" },
      { timestamp: "09:40 AM", status: "Result Available", actor: "Yohannes Tesfaye", note: "Results verified and authorized" },
    ],
  },
  {
    id: "LR-2026-0185",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    tests: [
      hospitalLabCatalogue[1], // Malaria Rapid Diagnostic Test
    ],
    priority: "Routine",
    clinicalIndication: "Acute febrile presentation in Bale zone endemic setting. Rule out acute malaria.",
    requestedCollectionTiming: "Immediate",
    orderedBy: "Dr. Dawit Alemu",
    orderRole: "Consulting Physician",
    orderedDate: "15 Oct 2026",
    orderedTime: "08:55 AM",
    status: "Result Available",
    specimenCollectedAt: "15 Oct 2026 · 09:08 AM",
    resultReport: {
      reportedAt: "15 Oct 2026 · 09:35 AM",
      technologistName: "Yohannes Tesfaye",
      technologistRole: "Senior Medical Laboratory Technologist",
      findingsSummary: "mRDT is NEGATIVE for both Plasmodium falciparum (HRP-2) and Pan-Plasmodium antigens.",
      results: [
        { parameter: "P. falciparum Antigen (HRP-2)", value: "Negative", unit: "Qualitative", referenceRange: "Negative", flag: "Normal" },
        { parameter: "Pan-Plasmodium Antigen", value: "Negative", unit: "Qualitative", referenceRange: "Negative", flag: "Normal" },
      ],
    },
    history: [
      { timestamp: "08:55 AM", status: "Requested", actor: "Dr. Dawit Alemu" },
      { timestamp: "09:08 AM", status: "Specimen Collected", actor: "Nurse Rahel" },
      { timestamp: "09:35 AM", status: "Result Available", actor: "Yohannes Tesfaye" },
    ],
  },
  {
    id: "LR-2026-0186",
    encounterId: "ENC-2026-0842",
    patientId: "ORH-2026-00124",
    tests: [
      hospitalLabCatalogue[3], // Renal Function Test
      hospitalLabCatalogue[4], // Serum Electrolytes
    ],
    priority: "Routine",
    clinicalIndication: "Evaluate baseline renal parameters and hydration status prior to prolonged pharmacotherapy.",
    notesForLab: "SST Gold tube collected. Fasting not required.",
    requestedCollectionTiming: "Routine OPD Phlebotomy",
    orderedBy: "Dr. Dawit Alemu",
    orderRole: "Consulting Physician",
    orderedDate: "15 Oct 2026",
    orderedTime: "09:10 AM",
    status: "In Progress",
    specimenCollectedAt: "15 Oct 2026 · 09:20 AM",
    history: [
      { timestamp: "09:10 AM", status: "Requested", actor: "Dr. Dawit Alemu" },
      { timestamp: "09:15 AM", status: "Accepted", actor: "Laboratory Reception Desk" },
      { timestamp: "09:20 AM", status: "Specimen Collected", actor: "Phlebotomist Belayneh" },
      { timestamp: "09:32 AM", status: "In Progress", actor: "Chemistry Workstation", note: "Serum centrifugation complete; loading Cobas analyzer" },
    ],
  },
]
