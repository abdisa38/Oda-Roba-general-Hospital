// ORHIMS — Patient Medical History Data Model (Phase 05, Prompt 27)

export interface HistoricalPatient {
  id: string
  patientId: string
  name: string
  amharicName?: string
  age: string
  sex: "Female" | "Male" | "Other"
  dob: string
  phone: string
  address: string
  kebele: string
  bloodGroup: string
}

export interface CurrentEncounterReference {
  encounterId: string
  type: string
  clinic: string
  attendingDoctor: string
  startTime: string
  status: "In Progress" | "Triage Completed" | "Waiting Consultation"
}

export interface HistoricalEncounter {
  id: string
  encounterId: string
  date: string
  time: string
  type: "Outpatient" | "Emergency" | "Inpatient" | "Antenatal / MCH" | "Follow-up"
  clinic: string
  doctor: string
  doctorRole: string
  chiefComplaint: string
  primaryDiagnosis: string
  status: "Completed" | "Discharged" | "Referred"
  summary: string
}

export interface HistoricalCondition {
  id: string
  name: string
  icdCode?: string
  dateRecorded: string
  recordedBy: string
  role: string
  status: "Active" | "Resolved" | "Chronic" | "Inactive"
  encounterId: string
  clinicalNotes: string
}

export interface HistoricalAllergy {
  id: string
  allergen: string
  substanceType: "Medication" | "Food" | "Environmental" | "Other"
  reaction: string
  severity: "Severe (High Risk)" | "Moderate" | "Mild"
  dateRecorded: string
  recordedBy: string
  status: "Verified & Active" | "Documented Absent" | "Unverified / Patient-Reported"
  notes: string
}

export interface HistoricalMedication {
  id: string
  name: string
  dosage: string
  frequency: string
  route: string
  duration: string
  prescribedDate: string
  prescribingDoctor: string
  encounterId: string
  status: "Active" | "Completed" | "Discontinued"
  indication: string
  discontinueReason?: string
}

export interface HistoricalProcedure {
  id: string
  name: string
  category: "Minor Procedure" | "Surgical" | "Diagnostic"
  date: string
  performingDoctor: string
  facility: string
  encounterId: string
  outcome: string
  notes: string
}

export interface FamilyHistoryItem {
  relation: string
  condition: string
  ageOfOnset?: string
  status: "Living" | "Deceased" | "Unknown"
  recordedDate: string
  notes: string
}

export interface SocialHistory {
  tobaccoUse: string
  alcoholUse: string
  occupation: string
  livingEnvironment: string
  recordedDate: string
  recordedBy: string
}

export interface LabResultItem {
  parameter: string
  value: string
  unit: string
  referenceRange: string
  flag: "Normal" | "High" | "Low" | "Abnormal"
}

export interface HistoricalLabReport {
  id: string
  testName: string
  category: "Hematology" | "Microbiology" | "Biochemistry" | "Imaging"
  orderDate: string
  completedDate?: string
  orderingDoctor: string
  reportingTechnologist?: string
  reviewingDoctor?: string
  status: "Ordered" | "In Progress" | "Completed" | "Reviewed"
  encounterId: string
  results: LabResultItem[]
  interpretationNotes?: string
}

export interface HistoricalClinicalNote {
  id: string
  encounterId: string
  date: string
  title: string
  noteType: "Consultation Note" | "Triage Assessment" | "Discharge Summary" | "Referral"
  author: string
  authorRole: string
  department: string
  content: string
}

export interface MedicalHistoryData {
  patient: HistoricalPatient
  currentEncounter: CurrentEncounterReference
  encounters: HistoricalEncounter[]
  conditions: HistoricalCondition[]
  allergies: HistoricalAllergy[]
  medications: HistoricalMedication[]
  procedures: HistoricalProcedure[]
  familyHistory: FamilyHistoryItem[]
  socialHistory: SocialHistory
  labReports: HistoricalLabReport[]
  clinicalNotes: HistoricalClinicalNote[]
}

// Fictional demonstration record for Hana Mohammed
export const sampleMedicalHistory: MedicalHistoryData = {
  patient: {
    id: "pat-00124",
    patientId: "ORH-2026-00124",
    name: "Hana Mohammed",
    amharicName: "ሀና መሀመድ",
    age: "28y",
    sex: "Female",
    dob: "14 May 1997",
    phone: "0911-234567",
    address: "Bale Robe, Oromia, Ethiopia",
    kebele: "Kebele 02",
    bloodGroup: "O+",
  },
  currentEncounter: {
    encounterId: "ENC-2026-0842",
    type: "General Outpatient Consultation",
    clinic: "Adult Outpatient Department (OPD-2)",
    attendingDoctor: "Dr. Dawit Alemu",
    startTime: "Today, 08:30 AM",
    status: "In Progress",
  },
  encounters: [
    {
      id: "enc-h-1",
      encounterId: "ENC-2026-0041",
      date: "18 Jan 2026",
      time: "09:30 AM",
      type: "Outpatient",
      clinic: "Adult OPD",
      doctor: "Dr. Dawit Alemu",
      doctorRole: "General Medical Practitioner",
      chiefComplaint: "Sore throat, fever (38.4°C), and productive cough for 3 days",
      primaryDiagnosis: "Acute Bacterial Pharyngitis & Mild Bronchitis",
      status: "Completed",
      summary:
        "Treated with oral antibiotics and symptomatic relief. Recommended hydration and follow-up if symptoms persist beyond 5 days.",
    },
    {
      id: "enc-h-2",
      encounterId: "ENC-2025-0912",
      date: "04 Nov 2025",
      time: "02:15 PM",
      type: "Follow-up",
      clinic: "Internal Medicine Clinic",
      doctor: "Dr. Tigist Mengistu",
      doctorRole: "Consultant Physician",
      chiefComplaint: "Routine asthma review and prescription refill",
      primaryDiagnosis: "Mild Intermittent Asthma (Controlled)",
      status: "Completed",
      summary:
        "Chest clear on auscultation. Salbutamol inhaler PRN technique reviewed and confirmed. No nocturnal awakenings reported in preceding 8 weeks.",
    },
    {
      id: "enc-h-3",
      encounterId: "ENC-2025-0671",
      date: "12 Aug 2025",
      time: "10:00 AM",
      type: "Emergency",
      clinic: "Emergency Room (ER)",
      doctor: "Dr. Tigist Mengistu",
      doctorRole: "Emergency Medical Officer",
      chiefComplaint: "Accidental superficial glass laceration to right distal forearm",
      primaryDiagnosis: "Forearm Laceration (Superficial, 3cm)",
      status: "Completed",
      summary:
        "Local anesthesia administered with 1% lidocaine. Wound debrided, irrigated with sterile saline, and primary closure performed with 3 nylon sutures. Tetanus toxoid booster administered.",
    },
    {
      id: "enc-h-4",
      encounterId: "ENC-2025-0210",
      date: "15 Mar 2025",
      time: "11:30 AM",
      type: "Outpatient",
      clinic: "Adult OPD",
      doctor: "Dr. Dawit Alemu",
      doctorRole: "General Medical Practitioner",
      chiefComplaint: "Generalized pruritic rash and periorbital edema following oral amoxicillin",
      primaryDiagnosis: "Drug Allergy / Type I Hypersensitivity Reaction (Penicillin G)",
      status: "Completed",
      summary:
        "Immediate cessation of amoxicillin. Administered intramuscular promethazine and oral prednisolone. Patient stabilized and observed for 3 hours. Critical allergy alert logged into ORHIMS.",
    },
  ],
  conditions: [
    {
      id: "cond-1",
      name: "Mild Intermittent Asthma",
      icdCode: "J45.20",
      dateRecorded: "04 Nov 2025",
      recordedBy: "Dr. Tigist Mengistu",
      role: "Internal Medicine",
      status: "Chronic",
      encounterId: "ENC-2025-0912",
      clinicalNotes: "Mild seasonal exacerbations during dry season. Well-managed with Salbutamol inhaler 100mcg PRN.",
    },
    {
      id: "cond-2",
      name: "Acute Bacterial Pharyngitis",
      icdCode: "J02.9",
      dateRecorded: "18 Jan 2026",
      recordedBy: "Dr. Dawit Alemu",
      role: "General Practitioner",
      status: "Resolved",
      encounterId: "ENC-2026-0041",
      clinicalNotes: "Resolved completely with non-penicillin antibiotic course.",
    },
    {
      id: "cond-3",
      name: "Superficial Forearm Laceration",
      icdCode: "S51.81",
      dateRecorded: "12 Aug 2025",
      recordedBy: "Dr. Tigist Mengistu",
      role: "Emergency Care",
      status: "Resolved",
      encounterId: "ENC-2025-0671",
      clinicalNotes: "Sutures removed on post-procedure day 10 with clean scar healing.",
    },
  ],
  allergies: [
    {
      id: "alg-1",
      allergen: "Penicillin G & Beta-Lactam Antibiotics",
      substanceType: "Medication",
      reaction: "Severe generalized urticaria, bronchospasm, and facial angioedema",
      severity: "Severe (High Risk)",
      dateRecorded: "15 Mar 2025",
      recordedBy: "Dr. Dawit Alemu",
      status: "Verified & Active",
      notes: "Confirmed reaction to oral Amoxicillin in March 2025. Absolute contraindication to all penicillin derivatives and cephalosporins without prior desensitization.",
    },
    {
      id: "alg-2",
      allergen: "Latex Products",
      substanceType: "Environmental",
      reaction: "Explicitly tested / challenged without hypersensitivity",
      severity: "Mild",
      dateRecorded: "18 Jan 2026",
      recordedBy: "Nurse Rahel Kassa",
      status: "Documented Absent",
      notes: "Patient tolerates standard latex examination gloves without contact dermatitis or irritation.",
    },
  ],
  medications: [
    {
      id: "med-1",
      name: "Salbutamol Inhaler (Albuterol)",
      dosage: "100 mcg / actuation",
      frequency: "1–2 puffs every 4–6 hours as needed for shortness of breath or wheeze",
      route: "Inhalation",
      duration: "Ongoing PRN",
      prescribedDate: "04 Nov 2025",
      prescribingDoctor: "Dr. Tigist Mengistu",
      encounterId: "ENC-2025-0912",
      status: "Active",
      indication: "Bronchospasm / Mild Intermittent Asthma",
    },
    {
      id: "med-2",
      name: "Azithromycin Tablets",
      dosage: "500 mg",
      frequency: "Once daily for 3 consecutive days",
      route: "Oral",
      duration: "3 days (Completed)",
      prescribedDate: "18 Jan 2026",
      prescribingDoctor: "Dr. Dawit Alemu",
      encounterId: "ENC-2026-0041",
      status: "Completed",
      indication: "Bacterial upper respiratory tract infection (penicillin-safe alternative)",
    },
    {
      id: "med-3",
      name: "Paracetamol (Acetaminophen) Tablets",
      dosage: "500 mg",
      frequency: "1–2 tablets three times daily with meals",
      route: "Oral",
      duration: "5 days as needed",
      prescribedDate: "18 Jan 2026",
      prescribingDoctor: "Dr. Dawit Alemu",
      encounterId: "ENC-2026-0041",
      status: "Completed",
      indication: "Fever and sore throat pain relief",
    },
    {
      id: "med-4",
      name: "Amoxicillin-Clavulanate (Augmentin)",
      dosage: "625 mg",
      frequency: "Twice daily",
      route: "Oral",
      duration: "Discontinued immediately on Day 1",
      prescribedDate: "15 Mar 2025",
      prescribingDoctor: "Dr. Dawit Alemu",
      encounterId: "ENC-2025-0210",
      status: "Discontinued",
      indication: "Pharyngitis",
      discontinueReason: "Severe acute allergic reaction (anaphylactoid urticaria and angioedema)",
    },
  ],
  procedures: [
    {
      id: "proc-1",
      name: "Minor Wound Debridement & Primary Closure (3 Sutures)",
      category: "Minor Procedure",
      date: "12 Aug 2025",
      performingDoctor: "Dr. Tigist Mengistu",
      facility: "Oda Roba Hospital Minor Operating Theatre",
      encounterId: "ENC-2025-0671",
      outcome: "Clean wound edges, primary healing without infection",
      notes: "Sutures removed post-procedure day 10 with intact distal sensation and vascular perfusion.",
    },
  ],
  familyHistory: [
    {
      relation: "Mother",
      condition: "Type 2 Diabetes Mellitus",
      ageOfOnset: "Age 50",
      status: "Living",
      recordedDate: "18 Jan 2026",
      notes: "Managed on oral Metformin in Bale Robe.",
    },
    {
      relation: "Father",
      condition: "Essential Hypertension",
      ageOfOnset: "Age 54",
      status: "Living",
      recordedDate: "18 Jan 2026",
      notes: "Prescribed Amlodipine 5mg daily. Blood pressure reported stable.",
    },
  ],
  socialHistory: {
    tobaccoUse: "Non-smoker (Documented lifetime non-smoker, no environmental exposure)",
    alcoholUse: "Occasional social use (Traditional beverage, no heavy alcohol intake)",
    occupation: "Secondary School Teacher at Bale Robe Comprehensive High School",
    livingEnvironment: "Lives in urban residential housing in Kebele 02, Bale Robe, with municipal tap water supply",
    recordedDate: "18 Jan 2026",
    recordedBy: "Nurse Rahel Kassa",
  },
  labReports: [
    {
      id: "lab-1",
      testName: "Complete Blood Count (CBC) with Differential",
      category: "Hematology",
      orderDate: "18 Jan 2026, 09:40 AM",
      completedDate: "18 Jan 2026, 11:15 AM",
      orderingDoctor: "Dr. Dawit Alemu",
      reportingTechnologist: "Abebe Bekele (MLS)",
      reviewingDoctor: "Dr. Dawit Alemu",
      status: "Reviewed",
      encounterId: "ENC-2026-0041",
      results: [
        { parameter: "White Blood Cells (WBC)", value: "11.2", unit: "10^9 / L", referenceRange: "4.0 – 10.0", flag: "High" },
        { parameter: "Hemoglobin (Hgb)", value: "13.4", unit: "g / dL", referenceRange: "12.0 – 15.5", flag: "Normal" },
        { parameter: "Hematocrit (Hct)", value: "39.8", unit: "%", referenceRange: "36.0 – 46.0", flag: "Normal" },
        { parameter: "Platelet Count", value: "275", unit: "10^9 / L", referenceRange: "150 – 450", flag: "Normal" },
        { parameter: "Neutrophils (%)", value: "72.4", unit: "%", referenceRange: "45.0 – 70.0", flag: "High" },
        { parameter: "Lymphocytes (%)", value: "21.0", unit: "%", referenceRange: "20.0 – 40.0", flag: "Normal" },
      ],
      interpretationNotes: "Mild neutrophilic leukocytosis consistent with active acute bacterial upper respiratory infection.",
    },
    {
      id: "lab-2",
      testName: "Erythrocyte Sedimentation Rate (ESR)",
      category: "Hematology",
      orderDate: "18 Jan 2026, 09:40 AM",
      completedDate: "18 Jan 2026, 11:20 AM",
      orderingDoctor: "Dr. Dawit Alemu",
      reportingTechnologist: "Abebe Bekele (MLS)",
      reviewingDoctor: "Dr. Dawit Alemu",
      status: "Reviewed",
      encounterId: "ENC-2026-0041",
      results: [
        { parameter: "ESR (Westergren)", value: "22", unit: "mm / hr", referenceRange: "0 – 20", flag: "High" },
      ],
      interpretationNotes: "Mildly elevated, reflecting acute inflammatory phase.",
    },
    {
      id: "lab-3",
      testName: "Random Blood Glucose (RBG)",
      category: "Biochemistry",
      orderDate: "04 Nov 2025, 02:30 PM",
      completedDate: "04 Nov 2025, 02:45 PM",
      orderingDoctor: "Dr. Tigist Mengistu",
      reportingTechnologist: "Oda Roba Point-of-Care Laboratory",
      reviewingDoctor: "Dr. Tigist Mengistu",
      status: "Reviewed",
      encounterId: "ENC-2025-0912",
      results: [
        { parameter: "Glucose (Random)", value: "108", unit: "mg / dL", referenceRange: "70 – 140", flag: "Normal" },
      ],
      interpretationNotes: "Euglycemic; screening recommended given positive maternal diabetic history.",
    },
    {
      id: "lab-4",
      testName: "Sputum AFB (Acid-Fast Bacilli) Microscopic Smear",
      category: "Microbiology",
      orderDate: "18 Jan 2026, 10:00 AM",
      completedDate: "19 Jan 2026, 09:30 AM",
      orderingDoctor: "Dr. Dawit Alemu",
      reportingTechnologist: "Fatima Kedir (Microbiology Unit)",
      reviewingDoctor: "Dr. Dawit Alemu",
      status: "Reviewed",
      encounterId: "ENC-2026-0041",
      results: [
        { parameter: "Specimen Quality", value: "Adequate (Mucoid)", unit: "", referenceRange: "Salivary / Mucoid", flag: "Normal" },
        { parameter: "AFB Smear Result", value: "Negative for Acid-Fast Bacilli (0 / 100 HPF)", unit: "", referenceRange: "Negative", flag: "Normal" },
      ],
      interpretationNotes: "Negative on single sample examination. No evidence of pulmonary tuberculosis at this stage.",
    },
  ],
  clinicalNotes: [
    {
      id: "note-1",
      encounterId: "ENC-2026-0041",
      date: "18 Jan 2026",
      title: "Outpatient Consultation & Management Note",
      noteType: "Consultation Note",
      author: "Dr. Dawit Alemu",
      authorRole: "General Medical Practitioner",
      department: "Adult Outpatient Department",
      content:
        "Patient presents with fever and painful swallowing. Exam revealed tonsillar erythema without purulent exudates. Cervical lymph nodes palpably tender. Due to documented Penicillin allergy, Azithromycin 500mg daily for 3 days prescribed alongside Paracetamol. Advised red-flag signs (stridor, inability to swallow saliva) requiring emergency attendance.",
    },
    {
      id: "note-2",
      encounterId: "ENC-2025-0912",
      date: "04 Nov 2025",
      title: "Chronic Care Follow-up Note: Asthma",
      noteType: "Consultation Note",
      author: "Dr. Tigist Mengistu",
      authorRole: "Consultant Physician",
      department: "Internal Medicine",
      content:
        "Periodic follow-up for intermittent asthma. Patient reports excellent exercise tolerance without rescue inhaler usage exceeding 1x per fortnight. Lungs clear to auscultation bilaterally, no expiratory rhonchi. Salbutamol inhaler refilled. Patient re-educated on trigger avoidance during harvest/dust season.",
    },
    {
      id: "note-3",
      encounterId: "ENC-2025-0671",
      date: "12 Aug 2025",
      title: "Emergency Procedure & Discharge Summary",
      noteType: "Discharge Summary",
      author: "Dr. Tigist Mengistu",
      authorRole: "Emergency Medical Officer",
      department: "Emergency Department",
      content:
        "Sharp forearm trauma secondary to broken household glass. Complete neurovascular examination of right hand normal (radial, median, ulnar intact; capillary refill < 2s). Suture closure performed with 3-0 Nylon. Tetanus prophylaxis given. Wound dressing applied and instructions for suture removal in 10 days given.",
    },
  ],
}

// Sample empty dataset for new patient or unrecorded history demonstration
export const emptyMedicalHistory: MedicalHistoryData = {
  patient: {
    id: "pat-99999",
    patientId: "ORH-2026-00998",
    name: "New Registered Patient",
    age: "35y",
    sex: "Male",
    dob: "02 Feb 1991",
    phone: "0922-000000",
    address: "Bale Robe, Oromia, Ethiopia",
    kebele: "Kebele 01",
    bloodGroup: "Unknown",
  },
  currentEncounter: {
    encounterId: "ENC-2026-0999",
    type: "Initial General Registration & Triage",
    clinic: "Adult OPD",
    attendingDoctor: "Dr. Dawit Alemu",
    startTime: "Today, 09:15 AM",
    status: "In Progress",
  },
  encounters: [],
  conditions: [],
  allergies: [],
  medications: [],
  procedures: [],
  familyHistory: [],
  socialHistory: {
    tobaccoUse: "Not yet documented in hospital records",
    alcoholUse: "Not yet documented in hospital records",
    occupation: "Not recorded",
    livingEnvironment: "Not recorded",
    recordedDate: "None",
    recordedBy: "Unassigned",
  },
  labReports: [],
  clinicalNotes: [],
}

export type HistoryTabId =
  | "overview"
  | "encounters"
  | "conditions"
  | "allergies"
  | "medications"
  | "procedures"
  | "family-social"
  | "labs"
  | "notes"

export type SimulationState = "ready" | "empty" | "loading" | "error"
