// Fictional demonstration data only for ORHIMS Complete Triage Assessment Workspace.
// No real patient, clinical assessment, or hospital encounter records.

export type TriageUrgency =
  | "Routine"
  | "Priority Review"
  | "Urgent / Resuscitation"

export type TriageAssessmentRecord = {
  encounterId: string
  patientId: string
  patientName: string
  age: string
  sex: string
  arrivalDate: string
  arrivalTime: string
  currentStatus: string
  allergies: string
  assignedNurse: string

  // Chief Complaint
  chiefComplaint: string
  symptomDescription: string
  onsetInterval: string
  painLevel: string // e.g. "0/10", "4/10", "8/10"

  // Vitals
  systolicBP: string
  diastolicBP: string
  pulseRate: string
  temperature: string
  respiratoryRate: string
  oxygenSaturation: string
  weight: string
  height: string

  // Observations
  generalObservations: string
  relevantFindings: string
  documentedAllergyStatus: "not-recorded" | "none-known" | "present"
  allergyDetails: string
  existingConditions: string
  additionalNotes: string

  // Triage categorization
  priority: TriageUrgency
  escalationNote?: string
  escalatedToDoctor?: boolean

  // State flags
  isDraft: boolean
  isCompleted: boolean
  handoffDestination?: string
  completedAt?: string
}

export const initialTriageData: TriageAssessmentRecord = {
  encounterId: "ENC-2026-00087",
  patientId: "ORH-2026-00124",
  patientName: "Hana Mohammed",
  age: "28 yrs",
  sex: "Female",
  arrivalDate: "2026-10-14",
  arrivalTime: "09:24",
  currentStatus: "Waiting for Triage",
  allergies: "Penicillin (Moderate rash)",
  assignedNurse: "Nurse Rahel (RN-042)",

  chiefComplaint: "Acute shortness of breath and progressive chest tightness",
  symptomDescription:
    "Patient reports sudden onset of breathing difficulty starting this morning at 07:30. Associated with dry cough and audible expiratory wheeze. Inhaled bronchodilator at home provided minimal relief.",
  onsetInterval: "2 hours ago",
  painLevel: "5 / 10 (Chest tightness)",

  systolicBP: "144",
  diastolicBP: "92",
  pulseRate: "114",
  temperature: "37.5",
  respiratoryRate: "28",
  oxygenSaturation: "90",
  weight: "62",
  height: "164",

  generalObservations:
    "Patient is alert, seated upright in tripod position. Mild intercostal retractions noted. Speech limited to short sentences due to dyspnea.",
  relevantFindings: "Bilateral expiratory wheezing across mid-to-lower lung fields. No peripheral cyanosis.",
  documentedAllergyStatus: "present",
  allergyDetails: "Penicillin: causes diffuse erythematous rash.",
  existingConditions: "Known bronchial asthma (diagnosed 2021). No prior ICU admissions.",
  additionalNotes: "Escort present (brother). High-flow oxygen cannula pre-positioned at triage bedside.",

  priority: "Urgent / Resuscitation",
  escalationNote: "Severe acute bronchospasm with SpO2 90% on room air. Immediate medical officer review requested.",
  escalatedToDoctor: true,

  isDraft: false,
  isCompleted: false,
  handoffDestination: "Medical Officer Review (Acute Cubicle 1)",
}

export type TriageStepId =
  | "verification"
  | "complaint"
  | "vitals"
  | "observations"
  | "review"

export type TriageStep = {
  id: TriageStepId
  label: string
  isComplete: boolean
  hasError: boolean
}

export const triageStepsConfig: TriageStep[] = [
  { id: "verification", label: "Patient Identity", isComplete: true, hasError: false },
  { id: "complaint", label: "Chief Complaint", isComplete: true, hasError: false },
  { id: "vitals", label: "Vital Signs", isComplete: true, hasError: false },
  { id: "observations", label: "Initial Assessment", isComplete: true, hasError: false },
  { id: "review", label: "Review & Handoff", isComplete: false, hasError: false },
]

export const sampleAlternativePatients = [
  {
    patientId: "ORH-2026-00124",
    name: "Hana Mohammed",
    age: "28 yrs",
    sex: "Female",
    encounterId: "ENC-2026-00087",
    complaint: "Acute shortness of breath and chest tightness",
  },
  {
    patientId: "ORH-2026-00125",
    name: "Ahmed Hassan",
    age: "45 yrs",
    sex: "Male",
    encounterId: "ENC-2026-00088",
    complaint: "Severe epigastric pain and dizziness",
  },
  {
    patientId: "ORH-2026-00126",
    name: "Fatuma Ali",
    age: "34 yrs",
    sex: "Female",
    encounterId: "ENC-2026-00089",
    complaint: "Persistent fever and headache for 4 days",
  },
]
