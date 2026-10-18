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
    id: "QE-2026-001",
    queueNumber: "Q-01",
    patientId: "ORH-2026-00101",
    patientName: "Chala Bekele Tufa",
    patientPhone: "+251 91 123 4589",
    date: "2026-10-14",
    arrivalTime: "08:15",
    service: "General Outpatient Consultation",
    status: "in-service",
    waitingMinutes: 25,
    assignedStaff: "Dr. Dawit Bekele",
    appointmentId: "APT-2026-001",
    isWalkIn: false,
    clinicalPriority: "Priority / Review",
  },
  {
    id: "QE-2026-002",
    queueNumber: "Q-02",
    patientId: "ORH-2026-00102",
    patientName: "Fatuma Mohammed Kedir",
    patientPhone: "+251 92 234 1290",
    date: "2026-10-14",
    arrivalTime: "08:35",
    service: "Maternal & Child Health",
    status: "called",
    waitingMinutes: 15,
    assignedStaff: "Sister Almaz Kebede",
    appointmentId: "APT-2026-002",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-003",
    queueNumber: "Q-03",
    patientId: "ORH-2026-00103",
    patientName: "Tolasa Desta Gemeda",
    patientPhone: "+251 93 345 7821",
    date: "2026-10-14",
    arrivalTime: "08:40",
    service: "Triage & Vitals Check",
    status: "waiting",
    waitingMinutes: 20,
    isWalkIn: true,
    clinicalPriority: "Priority / Review",
    notes: "Walk-in arrival. Blood pressure and vitals evaluation.",
  },
  {
    id: "QE-2026-004",
    queueNumber: "Q-04",
    patientId: "ORH-2026-00104",
    patientName: "Hawi Abera Negash",
    patientPhone: "+251 94 456 6634",
    date: "2026-10-14",
    arrivalTime: "08:50",
    service: "Laboratory Sampling",
    status: "waiting",
    waitingMinutes: 10,
    appointmentId: "APT-2026-004",
    isWalkIn: false,
    clinicalPriority: "Routine",
  },
  {
    id: "QE-2026-005",
    queueNumber: "Q-05",
    patientId: "ORH-2026-00105",
    patientName: "Obsa Girma Wario",
    patientPhone: "+251 95 567 3312",
    date: "2026-10-14",
    arrivalTime: "09:05",
    service: "General Outpatient Consultation",
    status: "waiting",
    waitingMinutes: 12,
    appointmentId: "APT-2026-005",
    isWalkIn: false,
    clinicalPriority: "Routine",
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
