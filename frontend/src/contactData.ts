// Populate only with hospital-verified public information.
export type ContactDetails = {
  address: string | null
  phone: string | null
  email: string | null
  emergencyPhone: string | null
  emergencyHours: string | null
  visitingHours: string | null
  receptionHours: string | null
  holidayInformation: string | null
  arrivalInformation: string | null
  directionsUrl: string | null
  mapEmbedUrl: string | null
}
export const contactDetails: ContactDetails = {
  address: null,
  phone: null,
  email: null,
  emergencyPhone: null,
  emergencyHours: null,
  visitingHours: null,
  receptionHours: null,
  holidayInformation: null,
  arrivalInformation: null,
  directionsUrl: null,
  mapEmbedUrl: null,
}
export const inquiryTypes = [
  "General Inquiry",
  "Appointment Question",
  "Department or Service Information",
  "Visiting Information",
  "Other",
] as const
export type Inquiry = {
  name: string
  phone: string
  email: string
  type: string
  subject: string
  message: string
}
export type SubmitInquiry = (inquiry: Inquiry) => Promise<{ reference: string }>
