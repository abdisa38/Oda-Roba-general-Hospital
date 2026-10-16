// ORHIMS — Phase 09: Complete Inpatient & Emergency Management Module
// Oda Roba General Hospital — Bale Robe, Oromia, Ethiopia

export type TriagePriority = "red" | "orange" | "yellow" | "green" | "blue"

export interface TriagePriorityMeta {
  code: TriagePriority
  name: string
  level: string
  targetResponse: string
  badgeClass: string
  description: string
}

export const TRIAGE_PRIORITIES: Record<TriagePriority, TriagePriorityMeta> = {
  red: {
    code: "red",
    name: "Immediate / Resuscitation",
    level: "Level 1",
    targetResponse: "Immediate (0 min)",
    badgeClass: "triage-badge-red",
    description: "Life-threatening condition requiring immediate aggressive intervention.",
  },
  orange: {
    code: "orange",
    name: "Very Urgent",
    level: "Level 2",
    targetResponse: "Within 10 minutes",
    badgeClass: "triage-badge-orange",
    description: "Imminently life-threatening, high-risk situation or severe pain.",
  },
  yellow: {
    code: "yellow",
    name: "Urgent",
    level: "Level 3",
    targetResponse: "Within 30 minutes",
    badgeClass: "triage-badge-yellow",
    description: "Potentially life-threatening or complex acute presentations.",
  },
  green: {
    code: "green",
    name: "Standard / Semi-Urgent",
    level: "Level 4",
    targetResponse: "Within 60 minutes",
    badgeClass: "triage-badge-green",
    description: "Stable acute condition amenable to routine emergency care.",
  },
  blue: {
    code: "blue",
    name: "Non-Urgent",
    level: "Level 5",
    targetResponse: "Within 120 minutes",
    badgeClass: "triage-badge-blue",
    description: "Minor or chronic condition manageable in primary outpatient setting.",
  },
}

export type EmergencyStatus =
  | "awaiting-triage"
  | "awaiting-assessment"
  | "in-treatment"
  | "admission-pending"
  | "transferred"
  | "discharged"

export interface EmergencyPatient {
  id: string
  patientId: string
  patientName: string
  age: number
  gender: "Female" | "Male"
  arrivalTime: string
  arrivalDate: string
  arrivalSource: "Walk-in" | "Ambulance" | "District Referral (Goba)" | "Health Center Transfer" | "Police/Bystander"
  presentingComplaint: string
  triagePriority: TriagePriority | "unassigned"
  vitalSigns: {
    bloodPressure: string
    pulseRate: number
    respiratoryRate: number
    temperature: number
    spO2: number
    painScore: number
  }
  allergies: string
  clinicalNotes: string
  status: EmergencyStatus
  assignedClinician: string
  emergencyBed: string | null
  waitingMinutes: number
  triageNotes?: string
  isDraftTriage?: boolean
}

export interface InpatientAdmission {
  admissionRef: string
  patientId: string
  patientName: string
  age: number
  gender: "Female" | "Male"
  admissionDate: string
  admissionTime: string
  admissionReason: string
  primaryDiagnosis: string
  referringDepartment: "Emergency" | "OPD Internal Medicine" | "General Surgery" | "Obstetrics & Gyn" | "Pediatrics"
  referringClinician: string
  wardId: string
  wardName: string
  bedId: string
  bedLabel: string
  attendingPhysician: string
  status: "awaiting-bed" | "admitted" | "discharge-approved" | "discharged"
  admissionNotes: string
  estimatedStayDays: number
  emergencyOriginId?: string
}

export type BedStatus = "available" | "reserved" | "occupied" | "cleaning" | "maintenance"

export interface HospitalBed {
  id: string
  wardId: string
  wardName: string
  bedNumber: string
  status: BedStatus
  currentPatientId: string | null
  currentPatientName: string | null
  admissionRef: string | null
  occupiedSince: string | null
  notes: string
  bedType: "Standard Inpatient" | "Emergency Observation" | "Pediatric Cot" | "Post-Op Recovery" | "Maternity Delivery"
}

export interface HospitalWard {
  id: string
  name: string
  serviceType: "Male Medical" | "Female Medical" | "General Surgical" | "Pediatrics" | "Maternity & Obstetrics" | "Emergency Observation"
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  cleaningBeds: number
  maintenanceBeds: number
  inpatientCount: number
  operationalStatus: "active" | "maintenance" | "quarantine" | "restricted"
  chargeNurse: string
  location: string
}

export interface InpatientDischarge {
  dischargeId: string
  admissionRef: string
  patientId: string
  patientName: string
  wardId: string
  wardName: string
  bedId: string
  bedLabel: string
  admissionDate: string
  dischargeDate: string
  lengthOfStayDays: number
  authorizingPhysician: string
  dischargeStatus: "pending-review" | "approved" | "completed"
  destination: "Home with Care Plan" | "Specialist Referral (Tikur Anbessa)" | "Local Health Center Follow-up" | "Community Health Post"
  clinicalSummary: string
  dischargeMedications: string[]
  followUpDate: string
  adminClearance: {
    pharmacyClear: boolean
    billingClear: boolean
    dischargeSummarySigned: boolean
  }
}

// -------------------------------------------------------------
// SEED DATA FOR ODA ROBA GENERAL HOSPITAL (Bale Robe, Ethiopia)
// -------------------------------------------------------------

export const INITIAL_EMERGENCY_QUEUE: EmergencyPatient[] = [
  {
    id: "EM-2026-001",
    patientId: "ORH-P-00104",
    patientName: "Abebech Tadesse",
    age: 48,
    gender: "Female",
    arrivalTime: "14:15",
    arrivalDate: "2026-10-16",
    arrivalSource: "Ambulance",
    presentingComplaint: "Acute onset dyspnea and severe left substernal chest pressure",
    triagePriority: "red",
    vitalSigns: {
      bloodPressure: "178/104",
      pulseRate: 118,
      respiratoryRate: 28,
      temperature: 36.8,
      spO2: 89,
      painScore: 9,
    },
    allergies: "Penicillin",
    clinicalNotes: "ECG shows ST-segment elevations in anterior leads V1-V4. Immediate resuscitation bay activation.",
    status: "in-treatment",
    assignedClinician: "Dr. Aster Lemma, MD",
    emergencyBed: "RESUS-01",
    waitingMinutes: 0,
    triageNotes: "Immediate oxygen therapy 10L NRB, dual antiplatelet loading protocol administered.",
  },
  {
    id: "EM-2026-002",
    patientId: "ORH-P-00219",
    patientName: "Dawit Kebede",
    age: 32,
    gender: "Male",
    arrivalTime: "14:35",
    arrivalDate: "2026-10-16",
    arrivalSource: "District Referral (Goba)",
    presentingComplaint: "Blunt abdominal trauma following motorcycle incident; acute peritoneal guarding",
    triagePriority: "orange",
    vitalSigns: {
      bloodPressure: "105/65",
      pulseRate: 104,
      respiratoryRate: 22,
      temperature: 37.1,
      spO2: 96,
      painScore: 8,
    },
    allergies: "No known drug allergies",
    clinicalNotes: "FAST ultrasound positive for free fluid in Morison pouch. Surgical consultation initiated.",
    status: "admission-pending",
    assignedClinician: "Dr. Daniel Abate, MD",
    emergencyBed: "EM-OBS-02",
    waitingMinutes: 8,
    triageNotes: "FAST exam reveals hemoperitoneum. Crossmatch 2 units packed RBCs requested.",
  },
  {
    id: "EM-2026-003",
    patientId: "ORH-P-00388",
    patientName: "Hanan Mohammed",
    age: 24,
    gender: "Female",
    arrivalTime: "15:00",
    arrivalDate: "2026-10-16",
    arrivalSource: "Walk-in",
    presentingComplaint: "High grade intermittent fevers, rigors, vomiting and severe headache for 3 days",
    triagePriority: "yellow",
    vitalSigns: {
      bloodPressure: "112/74",
      pulseRate: 98,
      respiratoryRate: 20,
      temperature: 39.4,
      spO2: 97,
      painScore: 6,
    },
    allergies: "Sulfonamides (Bactrim)",
    clinicalNotes: "Peripheral blood smear positive for P. falciparum rings (4+ parasitemia). Moderate dehydration.",
    status: "in-treatment",
    assignedClinician: "Dr. Aster Lemma, MD",
    emergencyBed: "EM-OBS-03",
    waitingMinutes: 20,
    triageNotes: "Initiated IV Artesunate 2.4 mg/kg and 1000ml Ringer's Lactate rehydration.",
  },
  {
    id: "EM-2026-004",
    patientId: "ORH-P-00412",
    patientName: "Tolosa Gemechu",
    age: 67,
    gender: "Male",
    arrivalTime: "15:20",
    arrivalDate: "2026-10-16",
    arrivalSource: "Health Center Transfer",
    presentingComplaint: "Productive purulent cough, right pleuritic pain, and respiratory distress",
    triagePriority: "orange",
    vitalSigns: {
      bloodPressure: "142/86",
      pulseRate: 110,
      respiratoryRate: 30,
      temperature: 38.9,
      spO2: 90,
      painScore: 7,
    },
    allergies: "No known allergies",
    clinicalNotes: "Right lower lobe bronchial breathing and dullness. Suspected severe community-acquired pneumonia.",
    status: "awaiting-assessment",
    assignedClinician: "Dr. Daniel Abate, MD",
    emergencyBed: "EM-OBS-04",
    waitingMinutes: 12,
    triageNotes: "Supplemental nasal cannula O2 at 4L/min titrating SpO2 to >94%.",
  },
  {
    id: "EM-2026-005",
    patientId: "ORH-P-00523",
    patientName: "Fatuma Kedir",
    age: 29,
    gender: "Female",
    arrivalTime: "15:45",
    arrivalDate: "2026-10-16",
    arrivalSource: "Walk-in",
    presentingComplaint: "Deep laceration on right forearm from farm equipment with active venous oozing",
    triagePriority: "green",
    vitalSigns: {
      bloodPressure: "120/78",
      pulseRate: 76,
      respiratoryRate: 16,
      temperature: 36.6,
      spO2: 99,
      painScore: 5,
    },
    allergies: "None",
    clinicalNotes: "Laceration 5cm, intact motor and sensory function. Wound exploration and primary repair pending.",
    status: "awaiting-triage",
    assignedClinician: "Nurse Rahel Kebede, B.Sc.",
    emergencyBed: null,
    waitingMinutes: 18,
    triageNotes: "Direct pressure dressing applied, tetanus toxoid status checked.",
  },
  {
    id: "EM-2026-006",
    patientId: "ORH-P-00609",
    patientName: "Yared Wolde",
    age: 55,
    gender: "Male",
    arrivalTime: "16:05",
    arrivalDate: "2026-10-16",
    arrivalSource: "Walk-in",
    presentingComplaint: "Mild generalized lower abdominal cramping, no fever, passing gas normally",
    triagePriority: "blue",
    vitalSigns: {
      bloodPressure: "124/80",
      pulseRate: 72,
      respiratoryRate: 15,
      temperature: 36.7,
      spO2: 98,
      painScore: 2,
    },
    allergies: "None",
    clinicalNotes: "Soft abdomen, non-tender. Vital signs stable. Appropriate for ambulatory assessment.",
    status: "awaiting-triage",
    assignedClinician: "Nurse Rahel Kebede, B.Sc.",
    emergencyBed: null,
    waitingMinutes: 25,
    triageNotes: "Waiting for ambulatory triage assessment.",
  },
]

export const INITIAL_WARDS: HospitalWard[] = [
  {
    id: "WARD-MM",
    name: "Male Medical Ward",
    serviceType: "Male Medical",
    totalBeds: 16,
    occupiedBeds: 12,
    availableBeds: 3,
    cleaningBeds: 1,
    maintenanceBeds: 0,
    inpatientCount: 12,
    operationalStatus: "active",
    chargeNurse: "Sr. Bethlehem Worku, RN",
    location: "Ward Block A, Ground Floor",
  },
  {
    id: "WARD-FM",
    name: "Female Medical Ward",
    serviceType: "Female Medical",
    totalBeds: 16,
    occupiedBeds: 13,
    availableBeds: 2,
    cleaningBeds: 1,
    maintenanceBeds: 0,
    inpatientCount: 13,
    operationalStatus: "active",
    chargeNurse: "Sr. Martha Mengistu, RN",
    location: "Ward Block A, 1st Floor",
  },
  {
    id: "WARD-SURG",
    name: "General Surgical Ward",
    serviceType: "General Surgical",
    totalBeds: 14,
    occupiedBeds: 10,
    availableBeds: 3,
    cleaningBeds: 0,
    maintenanceBeds: 1,
    inpatientCount: 10,
    operationalStatus: "active",
    chargeNurse: "Ato Sisay Bekele, B.Sc.",
    location: "Ward Block B, Ground Floor",
  },
  {
    id: "WARD-PED",
    name: "Pediatric Inpatient Unit",
    serviceType: "Pediatrics",
    totalBeds: 12,
    occupiedBeds: 8,
    availableBeds: 3,
    cleaningBeds: 1,
    maintenanceBeds: 0,
    inpatientCount: 8,
    operationalStatus: "active",
    chargeNurse: "Sr. Genet Alemu, RN",
    location: "Maternal & Child Health Wing, 1st Floor",
  },
  {
    id: "WARD-MAT",
    name: "Maternity & Obstetric Ward",
    serviceType: "Maternity & Obstetrics",
    totalBeds: 14,
    occupiedBeds: 11,
    availableBeds: 2,
    cleaningBeds: 1,
    maintenanceBeds: 0,
    inpatientCount: 11,
    operationalStatus: "active",
    chargeNurse: "Sr. Rahel Desta, Midwife Lead",
    location: "Maternal & Child Health Wing, Ground Floor",
  },
  {
    id: "WARD-EM-OBS",
    name: "Emergency Short-Stay Observation",
    serviceType: "Emergency Observation",
    totalBeds: 8,
    occupiedBeds: 4,
    availableBeds: 3,
    cleaningBeds: 1,
    maintenanceBeds: 0,
    inpatientCount: 4,
    operationalStatus: "active",
    chargeNurse: "Sr. Aster Lemma, MD / Nurse Lead",
    location: "Emergency Center, Unit East",
  },
]

export const INITIAL_BEDS: HospitalBed[] = [
  // Male Medical Ward
  {
    id: "BED-MM-01",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 01",
    status: "occupied",
    currentPatientId: "ORH-P-00101",
    currentPatientName: "Girma Assefa",
    admissionRef: "ADM-2026-061",
    occupiedSince: "2026-10-12",
    notes: "Post-stroke rehabilitation, daily neuro vitals",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-02",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 02",
    status: "occupied",
    currentPatientId: "ORH-P-00108",
    currentPatientName: "Hailu Tefera",
    admissionRef: "ADM-2026-065",
    occupiedSince: "2026-10-13",
    notes: "Severe uncontrolled hypertension, continuous monitoring",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-03",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 03",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Sanitized and prepared for new admission",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-04",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 04",
    status: "occupied",
    currentPatientId: "ORH-P-00115",
    currentPatientName: "Berhanu Legesse",
    admissionRef: "ADM-2026-068",
    occupiedSince: "2026-10-14",
    notes: "Diabetic ketoacidosis recovering on sliding scale insulin",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-05",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 05",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Ready for direct transfer",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-06",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 06",
    status: "cleaning",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Discharged 13:30; environmental turnaround in progress",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-07",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 07",
    status: "reserved",
    currentPatientId: "ORH-P-00412",
    currentPatientName: "Tolosa Gemechu",
    admissionRef: "ADM-2026-083",
    occupiedSince: null,
    notes: "Reserved for emergency transfer (Pneumonia)",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-MM-08",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedNumber: "Bed 08",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Oxygen concentrator point tested",
    bedType: "Standard Inpatient",
  },

  // Female Medical Ward
  {
    id: "BED-FM-01",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedNumber: "Bed 01",
    status: "occupied",
    currentPatientId: "ORH-P-00104",
    currentPatientName: "Abebech Tadesse",
    admissionRef: "ADM-2026-081",
    occupiedSince: "2026-10-16",
    notes: "Transferred from Resus; acute coronary syndrome care",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-FM-02",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedNumber: "Bed 02",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Ready for admission",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-FM-03",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedNumber: "Bed 03",
    status: "occupied",
    currentPatientId: "ORH-P-00133",
    currentPatientName: "Tirhas Gebre",
    admissionRef: "ADM-2026-072",
    occupiedSince: "2026-10-14",
    notes: "Severe anemia under crossmatched blood transfusion",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-FM-04",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedNumber: "Bed 04",
    status: "cleaning",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Linen change & terminal disinfection requested",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-FM-05",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedNumber: "Bed 05",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Cleaned and inspected",
    bedType: "Standard Inpatient",
  },

  // General Surgical Ward
  {
    id: "BED-SURG-01",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedNumber: "Bed 01",
    status: "reserved",
    currentPatientId: "ORH-P-00219",
    currentPatientName: "Dawit Kebede",
    admissionRef: "ADM-2026-082",
    occupiedSince: null,
    notes: "Reserved for post-exploratory laparotomy",
    bedType: "Post-Op Recovery",
  },
  {
    id: "BED-SURG-02",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedNumber: "Bed 02",
    status: "occupied",
    currentPatientId: "ORH-P-00145",
    currentPatientName: "Kassahun Desta",
    admissionRef: "ADM-2026-070",
    occupiedSince: "2026-10-13",
    notes: "Day 3 post appendectomy; surgical drain in situ",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-SURG-03",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedNumber: "Bed 03",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Suction apparatus verified operational",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-SURG-04",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedNumber: "Bed 04",
    status: "maintenance",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Hydraulic elevation lever damaged; work order #204 filed",
    bedType: "Standard Inpatient",
  },
  {
    id: "BED-SURG-05",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedNumber: "Bed 05",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Ready for elective or emergency admission",
    bedType: "Standard Inpatient",
  },

  // Emergency Observation
  {
    id: "BED-EM-01",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Resus Bay 01",
    status: "occupied",
    currentPatientId: "ORH-P-00104",
    currentPatientName: "Abebech Tadesse",
    admissionRef: null,
    occupiedSince: "2026-10-16 14:20",
    notes: "Cardiac monitoring, continuous telemetry",
    bedType: "Emergency Observation",
  },
  {
    id: "BED-EM-02",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Obs Bed 02",
    status: "occupied",
    currentPatientId: "ORH-P-00219",
    currentPatientName: "Dawit Kebede",
    admissionRef: null,
    occupiedSince: "2026-10-16 14:40",
    notes: "Trauma monitoring, awaiting OR transfer",
    bedType: "Emergency Observation",
  },
  {
    id: "BED-EM-03",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Obs Bed 03",
    status: "occupied",
    currentPatientId: "ORH-P-00388",
    currentPatientName: "Hanan Mohammed",
    admissionRef: null,
    occupiedSince: "2026-10-16 15:10",
    notes: "Severe malaria IV antimalarial infusion running",
    bedType: "Emergency Observation",
  },
  {
    id: "BED-EM-04",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Obs Bed 04",
    status: "occupied",
    currentPatientId: "ORH-P-00412",
    currentPatientName: "Tolosa Gemechu",
    admissionRef: null,
    occupiedSince: "2026-10-16 15:30",
    notes: "Oxygen titration, nebulization every 4h",
    bedType: "Emergency Observation",
  },
  {
    id: "BED-EM-05",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Obs Bed 05",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Cleaned and ready for next arrival",
    bedType: "Emergency Observation",
  },
  {
    id: "BED-EM-06",
    wardId: "WARD-EM-OBS",
    wardName: "Emergency Short-Stay Observation",
    bedNumber: "Obs Bed 06",
    status: "available",
    currentPatientId: null,
    currentPatientName: null,
    admissionRef: null,
    occupiedSince: null,
    notes: "Ready for emergency intake",
    bedType: "Emergency Observation",
  },
]

export const INITIAL_ADMISSIONS: InpatientAdmission[] = [
  {
    admissionRef: "ADM-2026-081",
    patientId: "ORH-P-00104",
    patientName: "Abebech Tadesse",
    age: 48,
    gender: "Female",
    admissionDate: "2026-10-16",
    admissionTime: "14:50",
    admissionReason: "Acute anterior myocardial infarction with hemodynamic instability",
    primaryDiagnosis: "Acute ST-elevation Myocardial Infarction (STEMI)",
    referringDepartment: "Emergency",
    referringClinician: "Dr. Aster Lemma, MD",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedId: "BED-FM-01",
    bedLabel: "Bed 01",
    attendingPhysician: "Dr. Daniel Abate, MD",
    status: "admitted",
    admissionNotes: "Patient accepted to Female Medical Ward telemetry bed following initial stabilization in emergency resuscitation.",
    estimatedStayDays: 5,
    emergencyOriginId: "EM-2026-001",
  },
  {
    admissionRef: "ADM-2026-082",
    patientId: "ORH-P-00219",
    patientName: "Dawit Kebede",
    age: 32,
    gender: "Male",
    admissionDate: "2026-10-16",
    admissionTime: "15:10",
    admissionReason: "Hemoperitoneum secondary to blunt abdominal trauma; urgent laparotomy scheduled",
    primaryDiagnosis: "Splenic laceration grade III & Hemoperitoneum",
    referringDepartment: "Emergency",
    referringClinician: "Dr. Aster Lemma, MD",
    wardId: "WARD-SURG",
    wardName: "General Surgical Ward",
    bedId: "BED-SURG-01",
    bedLabel: "Bed 01 (Post-Op)",
    attendingPhysician: "Dr. Yohannes Haile, Lead Surgeon",
    status: "awaiting-bed",
    admissionNotes: "Surgical consent obtained. Bed reserved in Surgical Recovery; patient currently in OR transfer queue.",
    estimatedStayDays: 7,
    emergencyOriginId: "EM-2026-002",
  },
  {
    admissionRef: "ADM-2026-083",
    patientId: "ORH-P-00412",
    patientName: "Tolosa Gemechu",
    age: 67,
    gender: "Male",
    admissionDate: "2026-10-16",
    admissionTime: "15:40",
    admissionReason: "Severe community-acquired pneumonia with hypoxia",
    primaryDiagnosis: "Right Lower Lobe Pneumonia (CURB-65 = 3)",
    referringDepartment: "Emergency",
    referringClinician: "Dr. Daniel Abate, MD",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedId: "BED-MM-07",
    bedLabel: "Bed 07",
    attendingPhysician: "Dr. Daniel Abate, MD",
    status: "awaiting-bed",
    admissionNotes: "Requires parenteral Ceftriaxone + Azithromycin and continuous oxygen therapy.",
    estimatedStayDays: 4,
    emergencyOriginId: "EM-2026-004",
  },
  {
    admissionRef: "ADM-2026-068",
    patientId: "ORH-P-00115",
    patientName: "Berhanu Legesse",
    age: 51,
    gender: "Male",
    admissionDate: "2026-10-14",
    admissionTime: "10:15",
    admissionReason: "Diabetic ketoacidosis with severe dehydration",
    primaryDiagnosis: "Type 2 Diabetes Mellitus with Ketoacidosis",
    referringDepartment: "OPD Internal Medicine",
    referringClinician: "Dr. Daniel Abate, MD",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedId: "BED-MM-04",
    bedLabel: "Bed 04",
    attendingPhysician: "Dr. Daniel Abate, MD",
    status: "admitted",
    admissionNotes: "Blood glucose normalized to 148 mg/dL. Anion gap closed. Transitioning to subcutaneous insulin.",
    estimatedStayDays: 3,
  },
  {
    admissionRef: "ADM-2026-061",
    patientId: "ORH-P-00101",
    patientName: "Girma Assefa",
    age: 62,
    gender: "Male",
    admissionDate: "2026-10-12",
    admissionTime: "09:30",
    admissionReason: "Ischemic cerebral vascular accident with left hemiparesis",
    primaryDiagnosis: "Right Middle Cerebral Artery Ischemic Stroke",
    referringDepartment: "Emergency",
    referringClinician: "Dr. Aster Lemma, MD",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedId: "BED-MM-01",
    bedLabel: "Bed 01",
    attendingPhysician: "Dr. Daniel Abate, MD",
    status: "discharge-approved",
    admissionNotes: "Physical therapy completed. Swallowing intact. Clinically stable for home care.",
    estimatedStayDays: 6,
  },
  {
    admissionRef: "ADM-2026-055",
    patientId: "ORH-P-00088",
    patientName: "Chaltu Dibaba",
    age: 38,
    gender: "Female",
    admissionDate: "2026-10-10",
    admissionTime: "11:00",
    admissionReason: "Complicated acute pyelonephritis with persistent vomiting",
    primaryDiagnosis: "Acute Pyelonephritis (E. coli)",
    referringDepartment: "Emergency",
    referringClinician: "Dr. Daniel Abate, MD",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedId: "BED-FM-06",
    bedLabel: "Bed 06",
    attendingPhysician: "Dr. Daniel Abate, MD",
    status: "discharged",
    admissionNotes: "Afebrile x48h, oral Ciprofloxacin step-down completed successfully.",
    estimatedStayDays: 5,
  },
]

export const INITIAL_DISCHARGES: InpatientDischarge[] = [
  {
    dischargeId: "DIS-2026-042",
    admissionRef: "ADM-2026-061",
    patientId: "ORH-P-00101",
    patientName: "Girma Assefa",
    wardId: "WARD-MM",
    wardName: "Male Medical Ward",
    bedId: "BED-MM-01",
    bedLabel: "Bed 01",
    admissionDate: "2026-10-12",
    dischargeDate: "2026-10-16",
    lengthOfStayDays: 4,
    authorizingPhysician: "Dr. Daniel Abate, MD",
    dischargeStatus: "approved",
    destination: "Home with Care Plan",
    clinicalSummary: "Patient with right MCA ischemic stroke showed progressive motor recovery on physiotherapy. Power left upper limb 4/5, left lower limb 4/5. Speech clear, vital signs stable, swallowing assessment passed.",
    dischargeMedications: [
      "Aspirin 81 mg oral daily",
      "Atorvastatin 40 mg oral at bedtime",
      "Amlodipine 5 mg oral daily",
    ],
    followUpDate: "2026-10-30 at OPD Neurology Clinic",
    adminClearance: {
      pharmacyClear: true,
      billingClear: true,
      dischargeSummarySigned: true,
    },
  },
  {
    dischargeId: "DIS-2026-041",
    admissionRef: "ADM-2026-055",
    patientId: "ORH-P-00088",
    patientName: "Chaltu Dibaba",
    wardId: "WARD-FM",
    wardName: "Female Medical Ward",
    bedId: "BED-FM-06",
    bedLabel: "Bed 06",
    admissionDate: "2026-10-10",
    dischargeDate: "2026-10-15",
    lengthOfStayDays: 5,
    authorizingPhysician: "Dr. Daniel Abate, MD",
    dischargeStatus: "completed",
    destination: "Home with Care Plan",
    clinicalSummary: "Acute pyelonephritis resolved. Afebrile x 48 hours. Tolerating oral fluids well. Repeat urine microscopy clean.",
    dischargeMedications: [
      "Ciprofloxacin 500 mg oral twice daily x 5 more days",
      "Paracetamol 500 mg as needed for mild pain",
    ],
    followUpDate: "2026-10-24 at Outpatient Clinic",
    adminClearance: {
      pharmacyClear: true,
      billingClear: true,
      dischargeSummarySigned: true,
    },
  },
]
