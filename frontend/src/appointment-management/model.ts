// Fictional demonstration data only for ORHIMS Appointment Management.
// No real patient, clinical staff, or hospital appointments.

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no-show"

export type StaffAppointment = {
  id: string
  patientId: string
  patientName: string
  patientPhone?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  duration: number // in minutes
  department: string
  clinician: string | null
  reason: string
  notes?: string
  status: AppointmentStatus
  createdDate: string
  hasConflict?: boolean
  conflictNote?: string
}

export type AppointmentSummary = {
  total: number
  confirmed: number
  arrived: number
  cancelled: number
}

export type CalendarViewMode = "list" | "calendar"

export const sampleDepartments = [
  "General Medicine",
  "Maternal & Child Health",
  "Outpatient Consultation",
  "Specialized Care",
  "Dental Clinic",
  "Ophthalmology",
  "Radiology & Imaging",
  "Laboratory Assessment",
]

export const sampleClinicians = [
  "Dr. Dawit Bekele (Internal Medicine)",
  "Dr. Tigist Mengistu (Pediatrics)",
  "Dr. Abebe Tola (General Medicine)",
  "Dr. Hanna Worku (Obs-Gyne)",
  "Unassigned / Any Available Clinician",
]

export const sampleAppointments: StaffAppointment[] = [
  {
    id: "APT-2026-001",
    patientId: "ORH-2026-00101",
    patientName: "Chala Bekele Tufa",
    patientPhone: "+251 91 123 4589",
    date: "2026-10-14",
    time: "08:30",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele (Internal Medicine)",
    reason: "Hypertension follow-up & BP review",
    status: "arrived",
    createdDate: "2026-10-10",
  },
  {
    id: "APT-2026-002",
    patientId: "ORH-2026-00102",
    patientName: "Fatuma Mohammed Kedir",
    patientPhone: "+251 92 234 1290",
    date: "2026-10-14",
    time: "09:00",
    duration: 30,
    department: "Maternal & Child Health",
    clinician: "Dr. Hanna Worku (Obs-Gyne)",
    reason: "Antenatal routine checkup",
    status: "confirmed",
    createdDate: "2026-10-11",
  },
  {
    id: "APT-2026-003",
    patientId: "ORH-2026-00103",
    patientName: "Tolasa Desta Gemeda",
    patientPhone: "+251 93 345 7821",
    date: "2026-10-14",
    time: "09:30",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Abebe Tola (General Medicine)",
    reason: "Diabetes fasting glucose monitoring",
    status: "scheduled",
    createdDate: "2026-10-12",
  },
  {
    id: "APT-2026-004",
    patientId: "ORH-2026-00104",
    patientName: "Hawi Abera Negash",
    patientPhone: "+251 94 456 6634",
    date: "2026-10-14",
    time: "10:15",
    duration: 45,
    department: "Radiology & Imaging",
    clinician: "Unassigned / Any Available Clinician",
    reason: "Diagnostic ultrasound review",
    status: "confirmed",
    createdDate: "2026-10-09",
  },
  {
    id: "APT-2026-005",
    patientId: "ORH-2026-00105",
    patientName: "Obsa Girma Wario",
    patientPhone: "+251 95 567 3312",
    date: "2026-10-14",
    time: "11:00",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele (Internal Medicine)",
    reason: "Lab result discussion - Malaria slide review",
    status: "completed",
    createdDate: "2026-10-08",
  },
  {
    id: "APT-2026-006",
    patientId: "ORH-2026-00106",
    patientName: "Ayantu Jeylan Guyo",
    patientPhone: "+251 96 678 8871",
    date: "2026-10-14",
    time: "11:30",
    duration: 30,
    department: "Maternal & Child Health",
    clinician: "Dr. Tigist Mengistu (Pediatrics)",
    reason: "Pediatric well-child consultation",
    status: "confirmed",
    createdDate: "2026-10-05",
  },
  {
    id: "APT-2026-007",
    patientId: "ORH-2026-00107",
    patientName: "Kedir Bedaso Ali",
    patientPhone: "+251 97 789 9942",
    date: "2026-10-15",
    time: "09:00",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Dawit Bekele (Internal Medicine)",
    reason: "Hypertension medication refill",
    status: "confirmed",
    createdDate: "2026-10-12",
  },
  {
    id: "APT-2026-008",
    patientId: "ORH-2026-00108",
    patientName: "Medina Abdullahi Roba",
    patientPhone: "+251 98 890 5523",
    date: "2026-10-15",
    time: "10:30",
    duration: 30,
    department: "Outpatient Consultation",
    clinician: "Dr. Abebe Tola (General Medicine)",
    reason: "General consultation",
    status: "scheduled",
    createdDate: "2026-10-13",
  },
]

export function computeSummary(
  appointments: StaffAppointment[],
  selectedDate: string
): AppointmentSummary {
  const dayItems = appointments.filter((a) => a.date === selectedDate)
  return {
    total: dayItems.length,
    confirmed: dayItems.filter((a) => a.status === "confirmed").length,
    arrived: dayItems.filter((a) => a.status === "arrived").length,
    cancelled: dayItems.filter((a) => a.status === "cancelled").length,
  }
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return dateStr
  }
}

export function statusBadgeClass(status: AppointmentStatus): string {
  switch (status) {
    case "scheduled":
      return "status-scheduled"
    case "confirmed":
      return "status-confirmed"
    case "arrived":
      return "status-arrived"
    case "completed":
      return "status-completed"
    case "cancelled":
      return "status-cancelled"
    case "no-show":
      return "status-noshow"
    default:
      return ""
  }
}

export function statusDisplayLabel(status: AppointmentStatus): string {
  switch (status) {
    case "scheduled":
      return "Scheduled"
    case "confirmed":
      return "Confirmed"
    case "arrived":
      return "Arrived / Checked In"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    case "no-show":
      return "No-show"
    default:
      return status
  }
}
