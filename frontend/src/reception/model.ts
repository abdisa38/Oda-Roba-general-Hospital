export type ReceptionStatus = "Expected" | "Checked In" | "Waiting" | "Registration Required" | "Needs Attention"
export type QueuePatient = {
  id: string
  name: string
  visit: string
  reference?: string
  time: string | null
  status: ReceptionStatus
  context?: string
}
export const initialQueue: QueuePatient[] = [
  {
    id: "ORH-2026-00101",
    name: "Chala Bekele Tufa",
    visit: "Walk-in visit",
    time: null,
    status: "Registration Required",
    context: "Administrative details need completion.",
  },
  {
    id: "ORH-2026-00102",
    name: "Fatuma Mohammed Kedir",
    visit: "Appointment",
    reference: "APT-2026-002",
    time: "08:32",
    status: "Needs Attention",
    context: "MCH clinic appointment requires reception review.",
  },
  {
    id: "ORH-2026-00103",
    name: "Tolasa Desta Gemeda",
    visit: "Appointment",
    reference: "APT-2026-003",
    time: null,
    status: "Expected",
    context: "Expected appointment at 09:30 with Dr. Abebe Tola.",
  },
  {
    id: "ORH-2026-00104",
    name: "Hawi Abera Negash",
    visit: "Walk-in visit",
    time: "08:35",
    status: "Waiting",
    context: "Waiting for triage and vitals measurement.",
  },
  {
    id: "ORH-2026-00105",
    name: "Obsa Girma Wario",
    visit: "Appointment",
    reference: "APT-2026-005",
    time: "08:40",
    status: "Checked In",
    context: "Reception check-in completed for Outpatient consultation.",
  },
]
export type Appointment = {
  id: string
  patientId: string
  name: string
  time: string
  status: "Scheduled" | "Confirmed" | "Checked In" | "Cancelled" | "Missed"
  visit: string
}
export const appointments: Appointment[] = [
  {
    id: "APT-2026-006",
    patientId: "ORH-2026-00106",
    name: "Ayantu Jeylan Guyo",
    time: "09:15",
    status: "Confirmed",
    visit: "Well-child checkup",
  },
  {
    id: "APT-2026-007",
    patientId: "ORH-2026-00107",
    name: "Kedir Bedaso Ali",
    time: "09:30",
    status: "Scheduled",
    visit: "Hypertension review",
  },
  {
    id: "APT-2026-008",
    patientId: "ORH-2026-00108",
    name: "Medina Abdullahi Roba",
    time: "10:00",
    status: "Cancelled",
    visit: "General checkup",
  },
]
export type Activity = {
  id: string
  text: string
  time: string
  context: string
}
export const initialActivity: Activity[] = [
  {
    id: "activity-1",
    text: "Appointment checked in",
    time: "08:40",
    context: "APT-2026-005 · Reception Desk 1",
  },
  {
    id: "activity-2",
    text: "Demographic details updated",
    time: "08:36",
    context: "ORH-2026-00104 · Kebele 04 Bale Robe",
  },
  {
    id: "activity-3",
    text: "Patient registration completed",
    time: "08:28",
    context: "ORH-2026-00101 · MRN assigned",
  },
]
export function actionFor(status: ReceptionStatus) {
  if (status === "Registration Required")
    return { label: "Complete Registration", permission: "registration" }
  if (status === "Expected")
    return { label: "Check In", permission: "appointments" }
  if (status === "Needs Attention")
    return { label: "View Patient", permission: "directory" }
  return { label: "Open Queue", permission: "queue" }
}
