// Fictional demonstration data only. No real patient records.

export type RecordStatus = "active" | "incomplete" | "duplicate-warning"

export type PatientProfile = {
  id: string
  name: string
  given: string
  family: string
  initials: string
  dob: string | null
  estimatedAge: number | null
  sex: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  residence: string | null
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  } | null
  registeredDate: string
  registeredBy: string | null
  recordStatus: RecordStatus
  hasDuplicateWarning: boolean
}

export type AppointmentEntry = {
  id: string
  date: string
  time: string
  department: string
  clinician: string | null
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
}

export type EncounterEntry = {
  id: string
  date: string
  type: string
  department: string
  clinician: string | null
  status: "open" | "completed" | "draft"
}

export type LabOrder = {
  id: string
  date: string
  test: string
  department: string
  status: "pending" | "in-progress" | "resulted" | "reviewed"
}

export type PrescriptionEntry = {
  id: string
  date: string
  medication: string
  status: "active" | "completed" | "cancelled"
  prescriber: string | null
}

export type InvoiceEntry = {
  id: string
  date: string
  amount: string
  status: "unpaid" | "partial" | "paid"
}

export type ActivityEvent = {
  id: string
  type:
    | "appointment-scheduled"
    | "appointment-updated"
    | "visit-registered"
    | "encounter-opened"
    | "encounter-completed"
    | "lab-result"
    | "prescription-created"
    | "registration-updated"
    | "invoice-issued"
  label: string
  timestamp: string
  detail: string | null
}

// --------------- Authentic Baseline Patients for Oda Roba General Hospital ---------------

export const demoPatient: PatientProfile = {
  id: "ORH-2026-00101",
  name: "Chala Bekele Tufa",
  given: "Chala",
  family: "Bekele",
  initials: "CB",
  dob: "1988-04-12",
  estimatedAge: 38,
  sex: "Male",
  phone: "+251 91 123 4589",
  alternatePhone: null,
  email: null,
  residence: "Kebele 02, Bale Robe",
  emergencyContact: {
    name: "Ayantu Bekele",
    relationship: "Spouse",
    phone: "+251 91 123 4590",
  },
  registeredDate: "2026-06-15",
  registeredBy: "Ato Bekele Tolosa",
  recordStatus: "active",
  hasDuplicateWarning: false,
}

export const incompletePatient: PatientProfile = {
  ...demoPatient,
  id: "ORH-2026-00102",
  name: "Fatuma Mohammed Kedir",
  given: "Fatuma",
  family: "Mohammed",
  initials: "FM",
  dob: "1994-09-21",
  estimatedAge: 31,
  sex: "Female",
  phone: "+251 92 234 1290",
  alternatePhone: null,
  email: null,
  residence: "Kebele 01, Bale Robe",
  emergencyContact: null,
  registeredDate: "2026-06-16",
  registeredBy: "Sr. Almaz Kebede",
  recordStatus: "incomplete",
  hasDuplicateWarning: false,
}

export const duplicateWarningPatient: PatientProfile = {
  ...demoPatient,
  id: "ORH-2026-00103",
  name: "Tolasa Desta Gemeda",
  given: "Tolasa",
  family: "Desta",
  initials: "TD",
  dob: "1975-11-03",
  estimatedAge: 50,
  sex: "Male",
  phone: "+251 93 345 7821",
  residence: "Kebele 03, Bale Robe",
  registeredDate: "2026-06-16",
  recordStatus: "duplicate-warning",
  hasDuplicateWarning: true,
}

export const demoAppointments: AppointmentEntry[] = [
  {
    id: "APT-2026-001",
    date: "2026-10-20",
    time: "09:00",
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele",
    status: "confirmed",
  },
  {
    id: "APT-2026-002",
    date: "2026-09-10",
    time: "11:30",
    department: "Laboratory",
    clinician: "Mr. Getachew Tadesse",
    status: "completed",
  },
  {
    id: "APT-2026-003",
    date: "2026-08-05",
    time: "10:00",
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele",
    status: "completed",
  },
  {
    id: "APT-2026-004",
    date: "2026-07-22",
    time: "14:00",
    department: "Pharmacy",
    clinician: null,
    status: "cancelled",
  },
]

export const demoEncounters: EncounterEntry[] = [
  {
    id: "ENC-2026-001",
    date: "2026-09-10",
    type: "Outpatient",
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele",
    status: "completed",
  },
  {
    id: "ENC-2026-002",
    date: "2026-08-05",
    type: "Outpatient",
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele",
    status: "completed",
  },
  {
    id: "ENC-2026-003",
    date: "2026-07-01",
    type: "Emergency",
    department: "Emergency",
    clinician: "Dr. Aster Lemma",
    status: "completed",
  },
]

export const demoLabOrders: LabOrder[] = [
  {
    id: "LAB-2026-001",
    date: "2026-09-10",
    test: "Complete Blood Count (CBC)",
    department: "Laboratory",
    status: "resulted",
  },
  {
    id: "LAB-2026-002",
    date: "2026-09-10",
    test: "Blood Film for Malaria Parasites (BF for MP)",
    department: "Laboratory",
    status: "reviewed",
  },
]

export const demoPrescriptions: PrescriptionEntry[] = [
  {
    id: "RX-2026-001",
    date: "2026-09-10",
    medication: "Coartem 20/120mg (Artemether/Lumefantrine)",
    status: "active",
    prescriber: "Dr. Dawit Bekele",
  },
]

export const demoInvoices: InvoiceEntry[] = [
  {
    id: "INV-2026-001",
    date: "2026-09-10",
    amount: "ETB 260.00",
    status: "paid",
  },
]

export const demoActivity: ActivityEvent[] = [
  {
    id: "act-1",
    type: "appointment-scheduled",
    label: "Appointment scheduled",
    timestamp: "2026-10-14",
    detail: "General Medicine · 20 Oct 2026",
  },
  {
    id: "act-2",
    type: "encounter-completed",
    label: "Encounter completed",
    timestamp: "2026-09-10",
    detail: "Outpatient · General Medicine",
  },
  {
    id: "act-3",
    type: "lab-result",
    label: "Laboratory result recorded",
    timestamp: "2026-09-10",
    detail: "Complete Blood Count · resulted",
  },
  {
    id: "act-4",
    type: "prescription-created",
    label: "Prescription created",
    timestamp: "2026-09-10",
    detail: "By Dr. Dawit Bekele",
  },
  {
    id: "act-5",
    type: "visit-registered",
    label: "Visit registered",
    timestamp: "2026-08-05",
    detail: "Outpatient · General Medicine",
  },
  {
    id: "act-6",
    type: "registration-updated",
    label: "Record registered",
    timestamp: "2026-06-15",
    detail: "Initial registration",
  },
]

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function statusLabel(status: RecordStatus) {
  if (status === "active") return "Active"
  if (status === "incomplete") return "Incomplete"
  return "Duplicate warning"
}

export function appointmentStatusLabel(s: AppointmentEntry["status"]) {
  const map: Record<AppointmentEntry["status"], string> = {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    "no-show": "No-show",
  }
  return map[s]
}

export function encounterStatusLabel(s: EncounterEntry["status"]) {
  return s === "open" ? "Open" : s === "draft" ? "Draft" : "Completed"
}

export function labStatusLabel(s: LabOrder["status"]) {
  return s === "pending"
    ? "Pending"
    : s === "in-progress"
      ? "In progress"
      : s === "resulted"
        ? "Resulted"
        : "Reviewed"
}
