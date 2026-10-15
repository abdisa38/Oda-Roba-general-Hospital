// Fictional demonstration data only for ORHIMS Doctor Dashboard.
// Oda Roba Hospital, Bale Robe, Ethiopia.
// No real patient records, clinician names, or live clinical data.

export type ConsultationWorkflowStatus =
  | "Waiting"
  | "In Consultation"
  | "Awaiting Results"
  | "Ready for Review"
  | "Completed"

export type ClinicalPriority =
  | "Urgent"
  | "Priority"
  | "Standard"
  | "Non-Urgent"

export type DoctorVitalSigns = {
  bloodPressure: string
  pulseRate: string
  temperature: string
  respiratoryRate: string
  oxygenSaturation: string
  bmi?: string
  recordedAt: string
}

export type DoctorPatientQueueItem = {
  id: string
  patientId: string
  name: string
  age: string
  sex: string
  encounterId: string
  encounterType: "OPD Consultation" | "Follow-up" | "Urgent Review" | "Referral"
  arrivalTime: string
  waitingDuration: string
  appointmentTime?: string
  chiefComplaint: string
  priority: ClinicalPriority
  status: ConsultationWorkflowStatus
  assignedDoctor: string
  isAssignedToMe: boolean
  triageNotes: string
  vitals?: DoctorVitalSigns
  allergies: string
  chronicConditions?: string
  pendingLabCount: number
}

export type DoctorDashboardSummary = {
  waitingCount: number
  inConsultationCount: number
  completedCount: number
  resultsReviewCount: number
}

export type ClinicalTaskItem = {
  id: string
  patientId: string
  patientName: string
  encounterId: string
  category: "Lab Result Review" | "Incomplete Note" | "Prescription Follow-up" | "Imaging Report"
  description: string
  resultPreview?: string
  timestamp: string
  status: "Result Available" | "Draft Pending" | "Pending Review"
  isUrgent: boolean
  reviewed: boolean
}

export type DoctorScheduleItem = {
  id: string
  time: string
  patientId: string
  patientName: string
  visitType: string
  status: "Arrived & Waiting" | "Confirmed" | "Completed"
}

export const initialDoctorQueue: DoctorPatientQueueItem[] = [
  {
    id: "DQ-01",
    patientId: "ORH-2026-00124",
    name: "Hana Mohammed",
    age: "28 yrs",
    sex: "Female",
    encounterId: "ENC-2026-0842",
    encounterType: "Urgent Review",
    arrivalTime: "08:15",
    waitingDuration: "35 mins",
    appointmentTime: "08:30 AM",
    chiefComplaint: "Acute shortness of breath and chest tightness",
    priority: "Urgent",
    status: "Waiting",
    assignedDoctor: "Dr. Daniel Abate",
    isAssignedToMe: true,
    triageNotes: "Triage escalated: bilateral wheezing, tachypneic. Oxygen administered at triage.",
    vitals: {
      bloodPressure: "142/92 mmHg",
      pulseRate: "108 bpm",
      temperature: "37.4 °C",
      respiratoryRate: "26 /min",
      oxygenSaturation: "93 %",
      bmi: "22.4",
      recordedAt: "08:22",
    },
    allergies: "Penicillin",
    chronicConditions: "Bronchial Asthma",
    pendingLabCount: 0,
  },
  {
    id: "DQ-02",
    patientId: "ORH-2026-00318",
    name: "Bekele Tadesse",
    age: "52 yrs",
    sex: "Male",
    encounterId: "ENC-2026-0839",
    encounterType: "OPD Consultation",
    arrivalTime: "08:30",
    waitingDuration: "20 mins",
    appointmentTime: "09:00 AM",
    chiefComplaint: "Persistent epigastric pain radiating to back for 3 weeks",
    priority: "Standard",
    status: "In Consultation",
    assignedDoctor: "Dr. Daniel Abate",
    isAssignedToMe: true,
    triageNotes: "Stable vital signs. Moderate epigastric tenderness on deep palpation.",
    vitals: {
      bloodPressure: "128/80 mmHg",
      pulseRate: "76 bpm",
      temperature: "36.7 °C",
      respiratoryRate: "16 /min",
      oxygenSaturation: "98 %",
      bmi: "25.1",
      recordedAt: "08:35",
    },
    allergies: "No known allergies",
    chronicConditions: "Dyspepsia / PUD history",
    pendingLabCount: 1,
  },
  {
    id: "DQ-03",
    patientId: "ORH-2026-00455",
    name: "Fatima Kedir",
    age: "36 yrs",
    sex: "Female",
    encounterId: "ENC-2026-0831",
    encounterType: "Follow-up",
    arrivalTime: "08:45",
    waitingDuration: "12 mins",
    appointmentTime: "09:15 AM",
    chiefComplaint: "Uncontrolled polyuria, polydipsia and fatigue",
    priority: "Priority",
    status: "Ready for Review",
    assignedDoctor: "Dr. Daniel Abate",
    isAssignedToMe: true,
    triageNotes: "Fasting blood glucose test completed by central laboratory.",
    vitals: {
      bloodPressure: "135/86 mmHg",
      pulseRate: "84 bpm",
      temperature: "36.8 °C",
      respiratoryRate: "18 /min",
      oxygenSaturation: "97 %",
      bmi: "28.3",
      recordedAt: "08:50",
    },
    allergies: "Sulfonamides",
    chronicConditions: "Type 2 Diabetes Mellitus",
    pendingLabCount: 2,
  },
  {
    id: "DQ-04",
    patientId: "ORH-2026-00210",
    name: "Gemechu Desta",
    age: "44 yrs",
    sex: "Male",
    encounterId: "ENC-2026-0818",
    encounterType: "OPD Consultation",
    arrivalTime: "07:50",
    waitingDuration: "45 mins",
    appointmentTime: "08:00 AM",
    chiefComplaint: "High grade fever with chills and severe headache for 4 days",
    priority: "Urgent",
    status: "Awaiting Results",
    assignedDoctor: "Dr. Daniel Abate",
    isAssignedToMe: true,
    triageNotes: "Febrile, blood film for malaria parasites and CBC sent to lab.",
    vitals: {
      bloodPressure: "115/74 mmHg",
      pulseRate: "102 bpm",
      temperature: "39.1 °C",
      respiratoryRate: "22 /min",
      oxygenSaturation: "96 %",
      bmi: "21.0",
      recordedAt: "08:00",
    },
    allergies: "No known allergies",
    chronicConditions: "None recorded",
    pendingLabCount: 2,
  },
  {
    id: "DQ-05",
    patientId: "ORH-2026-00512",
    name: "Almaz Lemma",
    age: "61 yrs",
    sex: "Female",
    encounterId: "ENC-2026-0805",
    encounterType: "Follow-up",
    arrivalTime: "07:30",
    waitingDuration: "Completed",
    appointmentTime: "08:00 AM",
    chiefComplaint: "Routine hypertension evaluation and prescription refill",
    priority: "Standard",
    status: "Completed",
    assignedDoctor: "Dr. Daniel Abate",
    isAssignedToMe: true,
    triageNotes: "BP controlled on current regimen. Consultation finalized.",
    vitals: {
      bloodPressure: "124/78 mmHg",
      pulseRate: "72 bpm",
      temperature: "36.5 °C",
      respiratoryRate: "15 /min",
      oxygenSaturation: "98 %",
      bmi: "26.4",
      recordedAt: "07:38",
    },
    allergies: "No known allergies",
    chronicConditions: "Essential Hypertension",
    pendingLabCount: 0,
  },
  {
    id: "DQ-06",
    patientId: "ORH-2026-00628",
    name: "Tolera Negash",
    age: "19 yrs",
    sex: "Male",
    encounterId: "ENC-2026-0850",
    encounterType: "OPD Consultation",
    arrivalTime: "09:05",
    waitingDuration: "10 mins",
    appointmentTime: "09:30 AM",
    chiefComplaint: "Productive cough with yellowish sputum and pleuritic pain",
    priority: "Priority",
    status: "Waiting",
    assignedDoctor: "Dr. Yohannes Haile",
    isAssignedToMe: false,
    triageNotes: "Coarse crackles in right lower lung field. Sputum analysis ordered.",
    vitals: {
      bloodPressure: "120/75 mmHg",
      pulseRate: "90 bpm",
      temperature: "38.2 °C",
      respiratoryRate: "20 /min",
      oxygenSaturation: "95 %",
      bmi: "20.2",
      recordedAt: "09:10",
    },
    allergies: "No known allergies",
    chronicConditions: "None recorded",
    pendingLabCount: 1,
  },
]

export const initialClinicalTasks: ClinicalTaskItem[] = [
  {
    id: "CT-01",
    patientId: "ORH-2026-00455",
    patientName: "Fatima Kedir",
    encounterId: "ENC-2026-0831",
    category: "Lab Result Review",
    description: "Fasting Blood Glucose: 218 mg/dL (High) · HbA1c: 8.9%",
    resultPreview: "Fasting Glucose 218 mg/dL, HbA1c 8.9%, Creatinine 0.9 mg/dL",
    timestamp: "10 mins ago",
    status: "Result Available",
    isUrgent: true,
    reviewed: false,
  },
  {
    id: "CT-02",
    patientId: "ORH-2026-00210",
    patientName: "Gemechu Desta",
    encounterId: "ENC-2026-0818",
    category: "Lab Result Review",
    description: "Blood Film: P. falciparum trophozoites seen (+) · CBC: WBC 13,200",
    resultPreview: "Positive for P. falciparum rings. Platelets 135,000/uL",
    timestamp: "18 mins ago",
    status: "Result Available",
    isUrgent: true,
    reviewed: false,
  },
  {
    id: "CT-03",
    patientId: "ORH-2026-00318",
    patientName: "Bekele Tadesse",
    encounterId: "ENC-2026-0839",
    category: "Incomplete Note",
    description: "Physical examination & clinical impression pending sign-off",
    timestamp: "45 mins ago",
    status: "Draft Pending",
    isUrgent: false,
    reviewed: false,
  },
  {
    id: "CT-04",
    patientId: "ORH-2026-00124",
    patientName: "Hana Mohammed",
    encounterId: "ENC-2026-0842",
    category: "Prescription Follow-up",
    description: "Salbutamol nebulization response evaluation needed post-triage",
    timestamp: "25 mins ago",
    status: "Pending Review",
    isUrgent: true,
    reviewed: false,
  },
]

export const initialDoctorSchedule: DoctorScheduleItem[] = [
  {
    id: "SCH-01",
    time: "08:30 AM",
    patientId: "ORH-2026-00124",
    patientName: "Hana Mohammed",
    visitType: "Emergency Review",
    status: "Arrived & Waiting",
  },
  {
    id: "SCH-02",
    time: "09:00 AM",
    patientId: "ORH-2026-00318",
    patientName: "Bekele Tadesse",
    visitType: "Follow-up",
    status: "Arrived & Waiting",
  },
  {
    id: "SCH-03",
    time: "09:30 AM",
    patientId: "ORH-2026-00628",
    patientName: "Tolera Negash",
    visitType: "Initial OPD",
    status: "Arrived & Waiting",
  },
  {
    id: "SCH-04",
    time: "10:15 AM",
    patientId: "ORH-2026-00701",
    patientName: "Chaltu Beyene",
    visitType: "Specialist Consultation",
    status: "Confirmed",
  },
  {
    id: "SCH-05",
    time: "11:00 AM",
    patientId: "ORH-2026-00742",
    patientName: "Demisse Feyisa",
    visitType: "Chronic Care Follow-up",
    status: "Confirmed",
  },
]
