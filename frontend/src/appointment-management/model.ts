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
  "Dr. Example (General Medicine)",
  "Dr. Abebe (Outpatient)",
  "Dr. Tigist (Pediatrics)",
  "Dr. Daniel (Internal Medicine)",
  "Unassigned / Any Available Clinician",
]

export const sampleAppointments: StaffAppointment[] = [
  {
    id: "APT-2026-081",
    patientId: "DEMO-EX-101",
    patientName: "Abebe Example",
    patientPhone: "••• ••• 0101",
    date: "2026-10-14",
    time: "08:30",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Example (General Medicine)",
    reason: "Routine follow-up consultation",
    status: "arrived",
    createdDate: "2026-10-10",
  },
  {
    id: "APT-2026-082",
    patientId: "DEMO-EX-102",
    patientName: "Marta Example",
    patientPhone: "••• ••• 0102",
    date: "2026-10-14",
    time: "09:00",
    duration: 30,
    department: "Maternal & Child Health",
    clinician: "Dr. Tigist (Pediatrics)",
    reason: "Child wellness evaluation",
    status: "confirmed",
    createdDate: "2026-10-11",
  },
  {
    id: "APT-2026-083",
    patientId: "DEMO-EX-103",
    patientName: "Aman Example",
    patientPhone: "••• ••• 0103",
    date: "2026-10-14",
    time: "09:30",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Example (General Medicine)",
    reason: "Blood pressure and medication check",
    status: "scheduled",
    createdDate: "2026-10-12",
    hasConflict: true,
    conflictNote: "Overlap with another provisional slot for Dr. Example",
  },
  {
    id: "APT-2026-084",
    patientId: "DEMO-P05",
    patientName: "Liya Example",
    patientPhone: "••• ••• 0105",
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
    id: "APT-2026-085",
    patientId: "DEMO-P06",
    patientName: "Sami Example",
    patientPhone: "••• ••• 0106",
    date: "2026-10-14",
    time: "11:00",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Daniel (Internal Medicine)",
    reason: "Lab result discussion",
    status: "completed",
    createdDate: "2026-10-08",
  },
  {
    id: "APT-2026-086",
    patientId: "DEMO-P07",
    patientName: "Ruth Example",
    patientPhone: "••• ••• 0107",
    date: "2026-10-14",
    time: "11:30",
    duration: 30,
    department: "Specialized Care",
    clinician: "Dr. Abebe (Outpatient)",
    reason: "Cardiology follow-up",
    status: "cancelled",
    notes: "Patient called to reschedule due to transport issues.",
    createdDate: "2026-10-05",
  },
  {
    id: "APT-2026-087",
    patientId: "DEMO-P08",
    patientName: "Beki Example",
    patientPhone: "••• ••• 0108",
    date: "2026-10-14",
    time: "14:00",
    duration: 30,
    department: "Dental Clinic",
    clinician: "Unassigned / Any Available Clinician",
    reason: "Dental screening",
    status: "no-show",
    createdDate: "2026-10-02",
  },
  // Other dates
  {
    id: "APT-2026-088",
    patientId: "DEMO-EX-101",
    patientName: "Abebe Example",
    patientPhone: "••• ••• 0101",
    date: "2026-10-15",
    time: "09:00",
    duration: 30,
    department: "General Medicine",
    clinician: "Dr. Example (General Medicine)",
    reason: "Post-consultation follow-up",
    status: "confirmed",
    createdDate: "2026-10-12",
  },
  {
    id: "APT-2026-089",
    patientId: "DEMO-P03",
    patientName: "Marta Example",
    patientPhone: "••• ••• 0103",
    date: "2026-10-15",
    time: "10:30",
    duration: 30,
    department: "Outpatient Consultation",
    clinician: "Dr. Daniel (Internal Medicine)",
    reason: "Standard consultation",
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
