export type BookingEntry = {
  departmentSlug?: string
  serviceSlug?: string
  doctorId?: string
}
export type PatientDetails = {
  type: "new" | "returning"
  identifyBy: "id" | "phone"
  patientId: string
  firstName: string
  lastName: string
  dob: string
  sex: string
  phone: string
  email: string
  address: string
  contactPreference: "none" | "sms" | "phone" | "email"
}
export type AppointmentStatus = "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no-show"
export type AppointmentDraft = {
  careKind: "department" | "service"
  careId: string
  doctorChoice: "unselected" | "specific" | "hospital"
  doctorId: string
  date: string
  timePreference: string
  patient: PatientDetails
  consent: boolean
}
export type AppointmentRequest = {
  appointmentId: string | null
  patientId: string | null
  department: string
  service: string | null
  doctor: string | null
  date: string
  time: string | null
  timePreference: string
  status: AppointmentStatus
  appointmentType: "planned"
  createdDate: string
  contactPreference: PatientDetails["contactPreference"]
  patient: PatientDetails
  demo: boolean
}
export const blankPatient: PatientDetails = {
  type: "new",
  identifyBy: "id",
  patientId: "",
  firstName: "",
  lastName: "",
  dob: "",
  sex: "",
  phone: "",
  email: "",
  address: "",
  contactPreference: "none",
}
export const timePreferences = [
  {
    id: "morning",
    name: "Morning preference",
    description: "The hospital would confirm an appropriate time.",
  },
  {
    id: "afternoon",
    name: "Afternoon preference",
    description: "A preference, not a reserved appointment slot.",
  },
  {
    id: "any",
    name: "No time preference",
    description: "Ask the hospital to arrange a suitable time.",
  },
]
export const statusDescriptions: Record<AppointmentStatus, {
  label: string
  description: string
}> = {
  pending: {
    label: "Pending confirmation",
    description: "Awaiting hospital confirmation",
  },
  confirmed: {
    label: "Confirmed",
    description: "The hospital has confirmed the appointment",
  },
  rescheduled: {
    label: "Rescheduled",
    description: "The appointment has been moved to a new date or time",
  },
  completed: {
    label: "Completed",
    description: "The appointment has been completed",
  },
  cancelled: {
    label: "Cancelled",
    description: "The appointment has been cancelled",
  },
  "no-show": {
    label: "No-show",
    description: "The patient did not attend the appointment",
  },
}
export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00`)
  return Number.isFinite(date.getTime()) && dateKey(date) === value
    ? date
    : null
}
export function readableDate(value: string) {
  const date = parseDate(value)
  return date
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : "Not selected"
}
export function patientErrors(patient: PatientDetails) {
  const errors: Record<string, string> = {}
  if (patient.type === "new") {
    if (!patient.firstName.trim())
      errors.firstName = "Please enter your first name."
    if (!patient.lastName.trim())
      errors.lastName = "Please enter your last name."
    if (!patient.dob) errors.dob = "Please enter the patient's date of birth."
  } else if (patient.identifyBy === "id" && !patient.patientId.trim())
    errors.patientId = "Please enter your patient ID."
  const phoneRequired =
    patient.type === "new" ||
    patient.identifyBy === "phone" ||
    patient.contactPreference === "sms" ||
    patient.contactPreference === "phone"
  if (phoneRequired && !patient.phone.trim())
    errors.phone = "Please enter a phone number."
  else if (
    patient.phone.trim() &&
    (!/^\+?[\d\s().-]+$/.test(patient.phone.trim()) ||
      patient.phone.replace(/\D/g, "").length < 7 ||
      patient.phone.replace(/\D/g, "").length > 18)
  )
    errors.phone = "Please enter a valid phone number."
  if (
    patient.dob &&
    (!parseDate(patient.dob) || patient.dob > dateKey(new Date()))
  )
    errors.dob = "Please enter a valid date of birth, not a future date."
  if (patient.contactPreference === "email" && !patient.email.trim())
    errors.email = "Please enter an email address for email contact."
  else if (
    patient.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)
  )
    errors.email = "Please enter a valid email address."
  return errors
}
export function stepErrors(
  step: number,
  draft: AppointmentDraft,
): Record<string, string> {
  if (step === 1)
    return draft.careId
      ? {}
      : { care: "Please select a department or service." }
  if (step === 2)
    return draft.doctorChoice === "unselected" ||
      (draft.doctorChoice === "specific" && !draft.doctorId)
      ? { doctor: "Please choose a professional or select “Choose for me.”" }
      : {}
  if (step === 3) {
    const errors: Record<string, string> = {}
    if (!parseDate(draft.date) || draft.date < dateKey(new Date()))
      errors.date = "Please select today or a valid future date."
    if (!timePreferences.some((item) => item.id === draft.timePreference))
      errors.time = "Please choose a time preference."
    return errors
  }
  if (step === 4) return patientErrors(draft.patient)
  if (step === 5)
    return draft.consent
      ? {}
      : {
          consent:
            "Please confirm that the information you provided is accurate.",
        }
  return {}
}
