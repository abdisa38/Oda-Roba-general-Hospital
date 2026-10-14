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
    id: "DEMO-P01",
    name: "Hana Example",
    visit: "Walk-in visit",
    time: null,
    status: "Registration Required",
    context: "Administrative details need completion.",
  },
  {
    id: "DEMO-P02",
    name: "Dawit Example",
    visit: "Appointment",
    reference: "DEMO-A02",
    time: "08:32",
    status: "Needs Attention",
    context: "Appointment reference needs reception review.",
  },
  {
    id: "DEMO-P03",
    name: "Marta Example",
    visit: "Appointment",
    reference: "DEMO-A03",
    time: null,
    status: "Expected",
    context: "Expected appointment at 09:00.",
  },
  {
    id: "DEMO-P04",
    name: "Aman Example",
    visit: "Walk-in visit",
    time: "08:35",
    status: "Waiting",
    context: "Waiting for the next reception-coordinated service.",
  },
  {
    id: "DEMO-P05",
    name: "Liya Example",
    visit: "Appointment",
    reference: "DEMO-A05",
    time: "08:40",
    status: "Checked In",
    context:
      "Reception check-in is complete; clinical progression is not implied.",
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
    id: "DEMO-A06",
    patientId: "DEMO-P06",
    name: "Sami Example",
    time: "09:15",
    status: "Confirmed",
    visit: "Planned visit",
  },
  {
    id: "DEMO-A07",
    patientId: "DEMO-P07",
    name: "Ruth Example",
    time: "09:30",
    status: "Scheduled",
    visit: "Follow-up visit",
  },
  {
    id: "DEMO-A08",
    patientId: "DEMO-P08",
    name: "Beki Example",
    time: "10:00",
    status: "Cancelled",
    visit: "Planned visit",
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
    context: "DEMO-A05 · Reception only",
  },
  {
    id: "activity-2",
    text: "Demographic details updated",
    time: "08:36",
    context: "DEMO-P04 · Sample activity",
  },
  {
    id: "activity-3",
    text: "Patient registration completed",
    time: "08:28",
    context: "DEMO-P09 · Sample activity",
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
