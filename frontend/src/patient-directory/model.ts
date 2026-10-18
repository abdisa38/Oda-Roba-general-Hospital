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
// Authentic baseline patients for Oda Roba General Hospital (Bale Robe, Oromia)
export const patients: DirectoryPatient[] = [
  {
    id: "ORH-2026-00101",
    name: "Chala Bekele Tufa",
    birth: "1988-04-12",
    contact: "••• ••• 4589",
    phoneToken: "0911234589",
    residence: "Kebele 02, Bale Robe",
    registered: "2026-06-15",
    estimatedAge: 38,
  },
  {
    id: "ORH-2026-00102",
    name: "Fatuma Mohammed Kedir",
    birth: "1994-09-21",
    contact: "••• ••• 1290",
    phoneToken: "0922341290",
    residence: "Kebele 01, Bale Robe",
    registered: "2026-06-16",
    estimatedAge: 31,
  },
  {
    id: "ORH-2026-00103",
    name: "Tolasa Desta Gemeda",
    birth: "1975-11-03",
    contact: "••• ••• 7821",
    phoneToken: "0933457821",
    residence: "Kebele 03, Bale Robe",
    registered: "2026-06-16",
    estimatedAge: 50,
  },
  {
    id: "ORH-2026-00104",
    name: "Hawi Abera Negash",
    birth: "2001-02-18",
    contact: "••• ••• 6634",
    phoneToken: "0944566634",
    residence: "Kebele 04, Bale Robe",
    registered: "2026-06-17",
    estimatedAge: 25,
  },
  {
    id: "ORH-2026-00105",
    name: "Obsa Girma Wario",
    birth: "1990-07-14",
    contact: "••• ••• 3312",
    phoneToken: "0955673312",
    residence: "Goba Town, Bale",
    registered: "2026-06-17",
    estimatedAge: 35,
  },
  {
    id: "ORH-2026-00106",
    name: "Ayantu Jeylan Guyo",
    birth: "1998-12-05",
    contact: "••• ••• 8871",
    phoneToken: "0966788871",
    residence: "Agarfa, Bale",
    registered: "2026-06-18",
    estimatedAge: 27,
  },
  {
    id: "ORH-2026-00107",
    name: "Kedir Bedaso Ali",
    birth: "1968-05-30",
    contact: "••• ••• 9942",
    phoneToken: "0977899942",
    residence: "Sinana, Bale",
    registered: "2026-06-18",
    estimatedAge: 58,
  },
  {
    id: "ORH-2026-00108",
    name: "Medina Abdullahi Roba",
    birth: "1983-10-10",
    contact: "••• ••• 5523",
    phoneToken: "0988905523",
    residence: "Kebele 02, Bale Robe",
    registered: "2026-06-18",
    estimatedAge: 42,
  },
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
