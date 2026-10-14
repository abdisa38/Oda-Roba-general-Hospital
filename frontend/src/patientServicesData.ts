// Hospital-approved public guidance can replace these null values independently.
export type PatientGuidance = {
  visitRequirements: string | null
  reception: string | null
  departmentNavigation: string | null
  assistance: string | null
  results: string | null
  prescriptions: string | null
  billing: string | null
  payment: string | null
  invoices: string | null
  billingSupport: string | null
}
export const patientGuidance: PatientGuidance = {
  visitRequirements: null,
  reception: null,
  departmentNavigation: null,
  assistance: null,
  results: null,
  prescriptions: null,
  billing: null,
  payment: null,
  invoices: null,
  billingSupport: null,
}
