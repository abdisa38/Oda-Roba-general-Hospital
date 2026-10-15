// Fictional clinical consultation records for ORHIMS Clinical Workspace.
// Oda Roba General Hospital, Bale Robe, Ethiopia.

export type AllergyStatus = "documented" | "no_known" | "unverified"

export type WorkspaceVitals = {
  bloodPressure: string
  pulseRate: string
  temperature: string
  respiratoryRate: string
  oxygenSaturation: string
  weight: string
  height: string
  bmi: string
  recordedAt: string
}

export type HistoricalEncounter = {
  id: string
  date: string
  type: string
  doctor: string
  diagnosis: string
  status: "Completed" | "Referred"
}

export type ClinicalWorkspacePatient = {
  id: string
  patientId: string
  name: string
  age: string
  dob: string
  sex: string
  phone: string
  address: string
  encounterId: string
  visitDateTime: string
  encounterType: string
  encounterStatus: "Waiting" | "In Consultation" | "Awaiting Results" | "Ready for Review" | "Completed"
  assignedDoctor: string
  allergiesStatus: AllergyStatus
  allergyDetails?: string
  alerts: string[]
  vitals: WorkspaceVitals
  history: HistoricalEncounter[]
}

export type StructuredConsultationNote = {
  chiefComplaint: string
  historyOfPresentIllness: string
  examinationFindings: string
  clinicalAssessment: string
  treatmentPlan: string
  isDraft: boolean
  isFinalized: boolean
  lastSavedAt?: string
}

export type WorkspaceSectionId =
  | "notes"
  | "overview"
  | "history"
  | "diagnoses"
  | "prescriptions"
  | "laboratory"
  | "documents"

export const sampleWorkspacePatient: ClinicalWorkspacePatient = {
  id: "WP-01",
  patientId: "ORH-2026-00124",
  name: "Hana Mohammed",
  age: "28 yrs",
  dob: "14 Mar 1998",
  sex: "Female",
  phone: "+251 91 234 5678",
  address: "Bale Robe, Kebele 02",
  encounterId: "ENC-2026-0842",
  visitDateTime: "15 Oct 2026 · 08:15 AM",
  encounterType: "Urgent OPD Consultation",
  encounterStatus: "In Consultation",
  assignedDoctor: "Dr. Daniel Abate, MD",
  allergiesStatus: "documented",
  allergyDetails: "Penicillin (Moderate rash & bronchospasm)",
  alerts: ["Escalated from Triage: SpO2 93% on room air"],
  vitals: {
    bloodPressure: "142/92 mmHg",
    pulseRate: "108 bpm",
    temperature: "37.4 °C",
    respiratoryRate: "26 /min",
    oxygenSaturation: "93 %",
    weight: "58 kg",
    height: "161 cm",
    bmi: "22.4",
    recordedAt: "08:22 AM (Triage)",
  },
  history: [
    {
      id: "ENC-2026-0312",
      date: "12 Jun 2026",
      type: "OPD Visit",
      doctor: "Dr. Daniel Abate",
      diagnosis: "Acute Bronchitis (Resolved)",
      status: "Completed",
    },
    {
      id: "ENC-2025-1104",
      date: "04 Nov 2025",
      type: "Emergency Review",
      doctor: "Dr. Yohannes Haile",
      diagnosis: "Moderate Asthma Exacerbation",
      status: "Completed",
    },
  ],
}

export const initialConsultationNote: StructuredConsultationNote = {
  chiefComplaint: "Acute shortness of breath and chest tightness since early morning.",
  historyOfPresentIllness: "Patient reports worsening dyspnea since 05:00 AM, accompanied by audible expiratory wheeze and dry non-productive cough. Used home Salbutamol inhaler twice without significant relief. Denies fever, hemoptysis, or chest pain.",
  examinationFindings: "General: Mild respiratory distress, speaks in short phrases.\nChest: Bilateral expiratory wheezing throughout lung fields. No crackles or stridor.\nCVS: Tachycardic, regular rhythm, S1+S2 present, no murmurs.\nAbdomen: Soft, non-tender.",
  clinicalAssessment: "Acute exacerbation of moderate persistent asthma (Trigger: Cold weather / viral upper respiratory prodrome).",
  treatmentPlan: "1. Salbutamol 5mg + Ipratropium 0.5mg nebulization stat.\n2. Prednisolone 40mg PO daily x 5 days.\n3. Re-evaluate respiratory rate and SpO2 in 30 minutes.\n4. Sputum routine & CBC ordered.",
  isDraft: true,
  isFinalized: false,
  lastSavedAt: "08:42 AM",
}
