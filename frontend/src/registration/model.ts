export type PatientDraft = {
  given: string
  additional: string
  family: string
  birthMode: "unknown" | "date" | "age"
  dob: string
  age: string
  ageBasis: "estimated" | "reported"
  phone: string
  alternatePhone: string
  email: string
  residence: string
  emergencyName: string
  relationship: string
  emergencyPhone: string
}
export const emptyDraft: PatientDraft = {
  given: "",
  additional: "",
  family: "",
  birthMode: "unknown",
  dob: "",
  age: "",
  ageBasis: "estimated",
  phone: "",
  alternatePhone: "",
  email: "",
  residence: "",
  emergencyName: "",
  relationship: "",
  emergencyPhone: "",
}
export type FieldName = keyof PatientDraft
export type Errors = Partial<Record<FieldName, string>>
export const fieldLabels: Partial<Record<FieldName, string>> = {
  given: "Given / primary name",
  additional: "Additional name",
  family: "Family name",
  dob: "Date of birth",
  age: "Age in completed years",
  phone: "Primary phone",
  alternatePhone: "Alternative phone",
  email: "Email address",
  residence: "Place of residence",
  emergencyName: "Emergency contact name",
  relationship: "Relationship",
  emergencyPhone: "Emergency contact phone",
}
export const sampleDate = "2026-06-18"
export function displayName(draft: PatientDraft) {
  return [draft.given, draft.additional, draft.family].filter(Boolean).join(" ")
}
export function birthDescription(draft: PatientDraft) {
  if (draft.birthMode === "date") return `${draft.dob} · recorded date`
  if (draft.birthMode === "age")
    return `${draft.age} years · ${draft.ageBasis} as of 18 Jun 2026 (sample date)`
  return "Date of birth / age not provided"
}
export function validateDraft(draft: PatientDraft): Errors {
  const errors: Errors = {}
  if (!draft.given.trim()) errors.given = "Enter the patient's name."
  if (draft.birthMode === "date") {
    const value = draft.dob
    const date = new Date(`${value}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      errors.dob =
        "Check the date format. Use a valid date in YYYY-MM-DD format."
    else if (value > sampleDate)
      errors.dob =
        "The birth date is after the illustrative registration date, 18 Jun 2026. Check this date."
  }
  if (
    draft.birthMode === "age" &&
    (!/^\d+$/.test(draft.age) || !Number.isSafeInteger(Number(draft.age)))
  )
    errors.age =
      "Enter a non-negative whole number of completed years, or choose Not provided."
  if (draft.dob && draft.age)
    errors.dob =
      "Record either a birth date or an age, not both. Review the birth information."
  for (const key of ["phone", "alternatePhone", "emergencyPhone"] as const) {
    if (
      draft[key].trim() &&
      (!/^[+\d\s().-]+$/.test(draft[key]) || !/\d/.test(draft[key]))
    )
      errors[key] =
        "Check the phone number. This demo accepts digits, spaces, +, parentheses, dots, and hyphens. Hospital format rules are pending."
  }
  if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
    errors.email =
      "Enter an email address such as person@example.test, or leave this optional field blank."
  return errors
}
export type PatientMatch = {
  id: string
  name: string
  birth: string
  contact: string
  residence: string
  phoneToken: string
}
export const sampleMatches: PatientMatch[] = [
  {
    id: "ORH-2026-00101",
    name: "Chala Bekele Tufa",
    birth: "1988-04-12",
    contact: "••• ••• 4589",
    residence: "Kebele 02, Bale Robe",
    phoneToken: "0911234589",
  },
  {
    id: "ORH-2026-00102",
    name: "Fatuma Mohammed Kedir",
    birth: "1994-09-21",
    contact: "••• ••• 1290",
    residence: "Kebele 01, Bale Robe",
    phoneToken: "0922341290",
  },
  {
    id: "ORH-2026-00103",
    name: "Tolasa Desta Gemeda",
    birth: "1975-11-03",
    contact: "••• ••• 7821",
    residence: "Kebele 03, Bale Robe",
    phoneToken: "0933457821",
  },
  {
    id: "ORH-2026-00104",
    name: "Hawi Abera Negash",
    birth: "2001-02-18",
    contact: "••• ••• 6634",
    residence: "Kebele 04, Bale Robe",
    phoneToken: "0944566634",
  },
]
export function searchMatches(query: string) {
  const normalized = query.trim().toLowerCase()
  return sampleMatches.filter((patient) =>
    `${patient.id} ${patient.name} ${patient.phoneToken}`
      .toLowerCase()
      .includes(normalized),
  )
}
export function draftCandidates(draft: PatientDraft) {
  const normalized = draft.given.trim().toLowerCase()
  return normalized.length >= 3
    ? sampleMatches.filter((patient) =>
        patient.name.toLowerCase().startsWith(normalized),
      )
    : []
}
