// Fictional demonstration data only for ORHIMS Queue Management.
// No real patient, clinical triage, or live hospital queue.

export type QueueStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled"
  | "left-before-service"

export type QueueEntry = {
  id: string
  queueNumber: string // e.g., "A-12"
  patientId: string
  patientName: string
  patientPhone?: string
  date: string // YYYY-MM-DD
  arrivalTime: string // HH:mm
  service: string // Destination service
  status: QueueStatus
  waitingMinutes: number // calculated duration
  assignedStaff?: string | null
  appointmentId?: string | null // Linked appointment if applicable
  isWalkIn: boolean
  clinicalPriority?: "Routine" | "Priority / Review" // Authorized clinical triage indicator if assigned
  notes?: string
  hasDuplicateWarning?: boolean
  duplicateNote?: string
}

export type QueueSummaryCounts = {
  waiting: number
  called: number
  inService: number
  completed: number
  requiresReview: number
}

export const queueServices = [
  "General Outpatient Consultation",
  "Triage & Vitals Check",
  "Maternal & Child Health",
  "Laboratory Sampling",
  "Radiology & Ultrasound",
  "Cashier & Billing Service",
  "Pharmacy Dispensing Queue",
]

export const initialQueueEntries: QueueEntry[] = [
  {
    id: "QE-2026-101",
    queueNumber: "A-01",
    patientId: "DEMO-EX-101",
    patientName: "Abebe Example",
    patientPhone: "••• ••• 0101",
    date: "2026-10-14",
    arrivalTime: "08:15",
    service: "General Outpatient Consultation",
    status: "in-service",
    waitingMinutes: 45,
    assignedStaff: "Dr. Example",
    appointmentId: "APT-2026-081",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-102",
    queueNumber: "A-02",
    patientId: "DEMO-EX-102",
    patientName: "Marta Example",
    patientPhone: "••• ••• 0102",
    date: "2026-10-14",
    arrivalTime: "08:35",
    service: "Maternal & Child Health",
    status: "called",
    waitingMinutes: 30,
    assignedStaff: "Nurse Hana",
    appointmentId: "APT-2026-082",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-103",
    queueNumber: "A-03",
    patientId: "DEMO-EX-103",
    patientName: "Aman Example",
    patientPhone: "••• ••• 0103",
    date: "2026-10-14",
    arrivalTime: "08:40",
    service: "Triage & Vitals Check",
    status: "waiting",
    waitingMinutes: 55,
    isWalkIn: true,
    clinicalPriority: "Priority / Review",
    notes: "Walk-in registration. Awaiting blood pressure and temperature triage.",
  },
  {
    id: "QE-2026-104",
    queueNumber: "A-04",
    patientId: "DEMO-P05",
    patientName: "Liya Example",
    patientPhone: "••• ••• 0105",
    date: "2026-10-14",
    arrivalTime: "08:50",
    service: "Laboratory Sampling",
    status: "waiting",
    waitingMinutes: 38,
    appointmentId: "APT-2026-084",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-105",
    queueNumber: "A-05",
    patientId: "DEMO-P06",
    patientName: "Sami Example",
    patientPhone: "••• ••• 0106",
    date: "2026-10-14",
    arrivalTime: "09:05",
    service: "General Outpatient Consultation",
    status: "waiting",
    waitingMinutes: 22,
    appointmentId: "APT-2026-085",
    isWalkIn: false,
    clinicalPriority: "Routine",
    hasDuplicateWarning: true,
    duplicateNote: "Possible duplicate active entry under Laboratory queue.",
  },
  {
    id: "QE-2026-106",
    queueNumber: "A-06",
    patientId: "DEMO-P07",
    patientName: "Ruth Example",
    patientPhone: "••• ••• 0107",
    date: "2026-10-14",
    arrivalTime: "09:20",
    service: "Cashier & Billing Service",
    status: "waiting",
    waitingMinutes: 10,
    isWalkIn: true,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-107",
    queueNumber: "A-07",
    patientId: "DEMO-P08",
    patientName: "Beki Example",
    patientPhone: "••• ••• 0108",
    date: "2026-10-14",
    arrivalTime: "07:55",
    service: "General Outpatient Consultation",
    status: "completed",
    waitingMinutes: 25,
    assignedStaff: "Dr. Daniel",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-108",
    queueNumber: "A-08",
    patientId: "DEMO-P04",
    patientName: "Dawit Example",
    patientPhone: "••• ••• 0104",
    date: "2026-10-14",
    arrivalTime: "08:10",
    service: "Triage & Vitals Check",
    status: "left-before-service",
    waitingMinutes: 40,
    isWalkIn: true,
    notes: "Patient left premises prior to consultation room call.",
  },
]

export function formatWaitingDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hrs} hr ${remainder} min` : `${hrs} hr`
}

export function computeQueueSummary(
  entries: QueueEntry[],
  date: string,
  serviceFilter: string
): QueueSummaryCounts {
  const dayItems = entries.filter((e) => {
    const matchDate = e.date === date
    const matchService = serviceFilter === "all" || e.service === serviceFilter
    return matchDate && matchService
  })

  return {
    waiting: dayItems.filter((e) => e.status === "waiting").length,
    called: dayItems.filter((e) => e.status === "called").length,
    inService: dayItems.filter((e) => e.status === "in-service").length,
    completed: dayItems.filter((e) => e.status === "completed").length,
    requiresReview: dayItems.filter((e) => e.hasDuplicateWarning || e.waitingMinutes > 50).length,
  }
}

export function queueStatusPillClass(status: QueueStatus): string {
  switch (status) {
    case "waiting":
      return "status-waiting"
    case "called":
      return "status-called"
    case "in-service":
      return "status-inservice"
    case "completed":
      return "status-completed"
    case "cancelled":
      return "status-cancelled"
    case "left-before-service":
      return "status-left"
    default:
      return ""
  }
}

export function queueStatusLabel(status: QueueStatus): string {
  switch (status) {
    case "waiting":
      return "Waiting"
    case "called":
      return "Called"
    case "in-service":
      return "In Service"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    case "left-before-service":
      return "Left Before Service"
    default:
      return status
  }
}
