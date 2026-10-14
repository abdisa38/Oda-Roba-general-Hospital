import { sampleMatches, type PatientMatch } from "../registration/model"

export type DirectoryPatient = PatientMatch & {
  registered: string
  estimatedAge?: number
}
export type DateFilters = {
  from: string
  to: string
}
export type SearchScope = "all" | "id" | "name" | "phone"
export type SortField = "name" | "id" | "registered"
export type PatientSort = {
  field: SortField
  direction: "asc" | "desc"
}
export const emptyFilters: DateFilters = { from: "", to: "" }
export const defaultSort: PatientSort = {
  field: "registered",
  direction: "desc",
}
const additionalNames = [
  "Marta Example",
  "Aman Example",
  "Liya Example",
  "Sami Example",
  "Ruth Example",
  "Beki Example",
  "Mira Example",
  "Noah Example",
  "Sara Example",
  "Tola Example",
  "Lemi Example",
  "Nura Example",
  "Abdi Example",
  "Roza Example",
  "Dina Example",
  "Daniel Example",
  "Selam Example",
  "Tigist Example",
  "Abeba Additional Family Example",
  "Desta Example",
]
// Fixed, fictional examples only. IDs and dates are not hospital conventions.
export const patients: DirectoryPatient[] = [
  { ...sampleMatches[0], registered: "2026-06-17" },
  { ...sampleMatches[1], registered: "2026-05-28" },
  { ...sampleMatches[2], registered: "2026-06-15" },
  ...additionalNames.map((name, index) => ({
    id: `DEMO-EX-${104 + index}`,
    name,
    birth: index % 3 === 0 ? "1996-04-12" : "Birth date not recorded",
    contact:
      index % 4 === 0
        ? "No contact recorded"
        : `••• ••• ${String(104 + index).padStart(4, "0")}`,
    phoneToken:
      index % 4 === 0 ? "" : `000000${String(104 + index).padStart(4, "0")}`,
    residence: `Example locality ${index + 1}`,
    registered:
      index < 9
        ? `2026-06-${String(18 - index).padStart(2, "0")}`
        : `2026-05-${String(30 - index).padStart(2, "0")}`,
    estimatedAge: index % 3 === 1 ? 24 + index : undefined,
  })),
]
export function birthDisplay(patient: DirectoryPatient) {
  if (patient.estimatedAge !== undefined)
    return {
      value: `${patient.estimatedAge} years`,
      detail: "Estimated · 18 Jun 2026",
    }
  if (/^\d{4}-\d{2}-\d{2}$/.test(patient.birth))
    return { value: patient.birth, detail: "Recorded date of birth" }
  return { value: "Not recorded", detail: "No date or age provided" }
}
export function dateLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
export function filterPatients(
  source: DirectoryPatient[],
  query: string,
  scope: SearchScope,
  filters: DateFilters,
  sort: PatientSort,
) {
  const normalized = query.trim().toLowerCase()
  const phoneQuery = normalized.replace(/[\s()+.-]/g, "")
  const result = source.filter((patient) => {
    const id = patient.id.toLowerCase().includes(normalized)
    const name = patient.name.toLowerCase().includes(normalized)
    const phone =
      !!patient.phoneToken &&
      !!phoneQuery &&
      patient.phoneToken.includes(phoneQuery)
    const matchesQuery =
      !normalized ||
      (scope === "all"
        ? id || name || phone
        : scope === "id"
          ? id
          : scope === "name"
            ? name
            : phone)
    return (
      matchesQuery &&
      (!filters.from || patient.registered >= filters.from) &&
      (!filters.to || patient.registered <= filters.to)
    )
  })
  return result.sort((a, b) => {
    const comparison = a[sort.field].localeCompare(b[sort.field], "en")
    return (
      (sort.direction === "asc" ? comparison : -comparison) ||
      a.id.localeCompare(b.id, "en")
    )
  })
}
export function validateDateFilters(filters: DateFilters) {
  for (const value of [filters.from, filters.to]) {
    if (!value) continue
    const date = new Date(`${value}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      return "Enter a valid registration date."
  }
  if (filters.from && filters.to && filters.from > filters.to)
    return "The end date must be on or after the start date."
  return ""
}
