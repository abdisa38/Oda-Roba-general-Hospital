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

// --------------- Demonstration fixture ---------------

export const demoPatient: PatientProfile = {
  id: "DEMO-EX-101",
  name: "Abebe Example",
  given: "Abebe",
  family: "Example",
  initials: "AE",
  dob: "1989-04-14",
  estimatedAge: null,
  sex: "Male",
  phone: "••• ••• 0101",
  alternatePhone: null,
  email: null,
  residence: "Example locality, Bale Robe",
  emergencyContact: {
    name: "Almaz Example",
    relationship: "Spouse",
    phone: "••• ••• 0102",
  },
  registeredDate: "2026-06-17",
  registeredBy: "Demo Receptionist",
  recordStatus: "active",
  hasDuplicateWarning: false,
}

export const incompletePatient: PatientProfile = {
  ...demoPatient,
  id: "DEMO-EX-102",
  name: "Marta Example",
  given: "Marta",
  family: "Example",
  initials: "ME",
  dob: null,
  estimatedAge: null,
  sex: null,
  phone: null,
  alternatePhone: null,
  email: null,
  residence: null,
  emergencyContact: null,
  registeredDate: "2026-05-28",
  registeredBy: null,
  recordStatus: "incomplete",
  hasDuplicateWarning: false,
}

export const duplicateWarningPatient: PatientProfile = {
  ...demoPatient,
  id: "DEMO-EX-103",
  name: "Aman Example",
  given: "Aman",
  family: "Example",
  initials: "AE",
  registeredDate: "2026-06-15",
  recordStatus: "duplicate-warning",
  hasDuplicateWarning: true,
}

export const demoAppointments: AppointmentEntry[] = [
  {
    id: "APT-001",
    date: "2026-10-20",
    time: "09:00",
    department: "General Medicine",
    clinician: "Dr. Example",
    status: "confirmed",
  },
  {
    id: "APT-002",
    date: "2026-09-10",
    time: "11:30",
    department: "Laboratory",
    clinician: null,
    status: "completed",
  },
  {
    id: "APT-003",
    date: "2026-08-05",
    time: "10:00",
    department: "General Medicine",
    clinician: "Dr. Example",
    status: "completed",
  },
  {
    id: "APT-004",
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
    clinician: "Dr. Example",
    status: "completed",
  },
  {
    id: "ENC-2026-002",
    date: "2026-08-05",
    type: "Outpatient",
    department: "General Medicine",
    clinician: "Dr. Example",
    status: "completed",
  },
  {
    id: "ENC-2026-003",
    date: "2026-07-01",
    type: "Emergency",
    department: "Emergency",
    clinician: null,
    status: "completed",
  },
]

export const demoLabOrders: LabOrder[] = [
  {
    id: "LAB-001",
    date: "2026-09-10",
    test: "Full Blood Count",
    department: "Laboratory",
    status: "resulted",
  },
  {
    id: "LAB-002",
    date: "2026-09-10",
    test: "Blood Glucose",
    department: "Laboratory",
    status: "reviewed",
  },
]

export const demoPrescriptions: PrescriptionEntry[] = [
  {
    id: "RX-001",
    date: "2026-09-10",
    medication: "[Medication name withheld — not verified]",
    status: "active",
    prescriber: "Dr. Example",
  },
]

export const demoInvoices: InvoiceEntry[] = [
  {
    id: "INV-001",
    date: "2026-09-10",
    amount: "[Amount pending verification]",
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
    detail: "Full Blood Count · resulted",
  },
  {
    id: "act-4",
    type: "prescription-created",
    label: "Prescription created",
    timestamp: "2026-09-10",
    detail: "By Dr. Example",
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
    timestamp: "2026-06-17",
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
