// Fictional demonstration data only for ORHIMS Nurse Dashboard.
// No real patient records, clinician names, or live clinical data.

export type TriagePriority =
  | "Urgent / Resuscitation"
  | "High Priority"
  | "Standard"
  | "Non-Urgent"

export type TriageWorkflowStatus =
  | "Waiting for Assessment"
  | "In Assessment"
  | "Assessment Completed"
  | "Referred for Urgent Review"

export type VitalSigns = {
  bloodPressureSystolic?: string
  bloodPressureDiastolic?: string
  pulseRate?: string
  temperature?: string
  respiratoryRate?: string
  oxygenSaturation?: string
  weight?: string
  height?: string
  painScore?: string
  recordedAt?: string
}

export type NurseQueuePatient = {
  id: string
  patientId: string
  name: string
  age: string
  sex: string
  arrivalTime: string
  queueNumber: string
  chiefComplaint: string
  priority: TriagePriority
  status: TriageWorkflowStatus
  assignedNurse?: string | null
  allergies?: string
  existingConditions?: string
  vitals?: VitalSigns
  assessmentNotes?: string
  encounterId: string
}

export type NurseDashboardSummary = {
  waitingTriage: number
  inAssessment: number
  completedTriage: number
  urgentReview: number
}

export type NurseActivity = {
  id: string
  time: string
  text: string
  detail: string
  urgency?: "normal" | "urgent"
}

export const initialNurseQueue: NurseQueuePatient[] = [
  {
    id: "N-Q01",
    patientId: "ORH-2026-00124",
    name: "Hana Mohammed",
    age: "28 yrs",
    sex: "Female",
    arrivalTime: "08:15",
    queueNumber: "T-01",
    chiefComplaint: "Acute shortness of breath and chest tightness",
    priority: "Urgent / Resuscitation",
    status: "Referred for Urgent Review",
    assignedNurse: "Nurse Rahel",
    allergies: "Penicillin",
    existingConditions: "Asthma",
    vitals: {
      bloodPressureSystolic: "142",
      bloodPressureDiastolic: "92",
      pulseRate: "112",
      temperature: "37.4",
      respiratoryRate: "28",
      oxygenSaturation: "91",
      weight: "62",
      height: "165",
      painScore: "6/10",
      recordedAt: "08:22",
    },
    assessmentNotes: "Marked bilateral wheezing. Urgent oxygen support initiated.",
    encounterId: "ENC-2026-891",
  },
  {
    id: "N-Q02",
    patientId: "ORH-2026-00125",
    name: "Ahmed Hassan",
    age: "45 yrs",
    sex: "Male",
    arrivalTime: "08:30",
    queueNumber: "T-02",
    chiefComplaint: "Severe epigastric pain and dizziness",
    priority: "High Priority",
    status: "In Assessment",
    assignedNurse: "Nurse Rahel",
    allergies: "Not recorded",
    existingConditions: "Peptic Ulcer Disease",
    vitals: {
      bloodPressureSystolic: "110",
      bloodPressureDiastolic: "70",
      pulseRate: "88",
      temperature: "36.8",
      respiratoryRate: "18",
      oxygenSaturation: "98",
      weight: "74",
      height: "172",
      painScore: "8/10",
      recordedAt: "08:42",
    },
    assessmentNotes: "Pale conjunctiva, guarding on palpation.",
    encounterId: "ENC-2026-892",
  },
  {
    id: "N-Q03",
    patientId: "ORH-2026-00126",
    name: "Fatuma Ali",
    age: "34 yrs",
    sex: "Female",
    arrivalTime: "08:40",
    queueNumber: "T-03",
    chiefComplaint: "Persistent fever and headache for 4 days",
    priority: "Standard",
    status: "Waiting for Assessment",
    assignedNurse: null,
    allergies: "Sulfonamides",
    existingConditions: "None reported",
    vitals: undefined,
    encounterId: "ENC-2026-893",
  },
  {
    id: "N-Q04",
    patientId: "ORH-2026-00127",
    name: "Dawit Bekele",
    age: "52 yrs",
    sex: "Male",
    arrivalTime: "08:50",
    queueNumber: "T-04",
    chiefComplaint: "Routine hypertension medication follow-up",
    priority: "Non-Urgent",
    status: "Waiting for Assessment",
    assignedNurse: null,
    allergies: "Not recorded",
    existingConditions: "Essential Hypertension",
    vitals: undefined,
    encounterId: "ENC-2026-894",
  },
  {
    id: "N-Q05",
    patientId: "ORH-2026-00128",
    name: "Marta Tadesse",
    age: "19 yrs",
    sex: "Female",
    arrivalTime: "08:00",
    queueNumber: "T-05",
    chiefComplaint: "Ankle sprain following athletic activity",
    priority: "Standard",
    status: "Assessment Completed",
    assignedNurse: "Nurse Rahel",
    allergies: "None reported",
    existingConditions: "None",
    vitals: {
      bloodPressureSystolic: "120",
      bloodPressureDiastolic: "78",
      pulseRate: "76",
      temperature: "36.6",
      respiratoryRate: "16",
      oxygenSaturation: "99",
      weight: "55",
      height: "160",
      painScore: "4/10",
      recordedAt: "08:18",
    },
    assessmentNotes: "Localized swelling at right lateral malleolus. Ice pack applied.",
    encounterId: "ENC-2026-895",
  },
]

export const initialNurseActivities: NurseActivity[] = [
  {
    id: "act-1",
    time: "08:42",
    text: "Vitals recorded for Ahmed Hassan",
    detail: "High pain score noted (8/10). In assessment.",
  },
  {
    id: "act-2",
    time: "08:24",
    text: "Urgent Escalation: Hana Mohammed",
    detail: "Referred for immediate physician and oxygen review (SpO2 91%).",
    urgency: "urgent",
  },
  {
    id: "act-3",
    time: "08:18",
    text: "Triage assessment completed for Marta Tadesse",
    detail: "Routed to minor injury consultation room.",
  },
]

export function computeNurseSummary(queue: NurseQueuePatient[]): NurseDashboardSummary {
  return {
    waitingTriage: queue.filter((p) => p.status === "Waiting for Assessment").length,
    inAssessment: queue.filter((p) => p.status === "In Assessment").length,
    completedTriage: queue.filter((p) => p.status === "Assessment Completed").length,
    urgentReview: queue.filter(
      (p) => p.status === "Referred for Urgent Review" || p.priority === "Urgent / Resuscitation"
    ).length,
  }
}

export function priorityBadgeClass(priority: TriagePriority): string {
  switch (priority) {
    case "Urgent / Resuscitation":
      return "priority-urgent"
    case "High Priority":
      return "priority-high"
    case "Standard":
      return "priority-standard"
    case "Non-Urgent":
      return "priority-nonurgent"
    default:
      return ""
  }
}

export function triageStatusBadgeClass(status: TriageWorkflowStatus): string {
  switch (status) {
    case "Waiting for Assessment":
      return "triage-waiting"
    case "In Assessment":
      return "triage-inassessment"
    case "Assessment Completed":
      return "triage-completed"
    case "Referred for Urgent Review":
      return "triage-urgent"
    default:
      return ""
  }
}
