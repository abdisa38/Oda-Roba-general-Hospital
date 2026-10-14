export type AvailabilityStatus = "unverified" | "available" | "limited" | "unavailable"
export type ScheduleDay = {
  day: string
  status: AvailabilityStatus
  times: string[]
}
export type MedicalProfessional = {
  id: string
  name: string
  slug: string
  photo: string | null
  photoAlt: string
  professionalTitle: string
  specialty: string
  specialtyId: string
  department: string
  departmentId: string
  introduction: string
  biography: string
  qualifications: string[]
  experience: string
  languages: string[]
  areasOfCare: string[]
  availability: {
    status: AvailabilityStatus
    schedule: ScheduleDay[]
    lastConfirmed: string | null
  }
  appointmentEligibility: "pending" | "eligible" | "not-eligible"
  featured: boolean
  verification: "placeholder" | "verified"
}
type StaffSeed = {
  specialty: string
  slug: string
  department: string
  departmentId: string
  featured?: boolean
}
const seeds: StaffSeed[] = [
  {
    specialty: "General Medicine",
    slug: "general-medicine",
    department: "General Medicine",
    departmentId: "general-medicine",
    featured: true,
  },
  {
    specialty: "Pediatrics",
    slug: "pediatrics",
    department: "Maternal & Child Health",
    departmentId: "maternal-child-health",
    featured: true,
  },
  {
    specialty: "Surgery",
    slug: "surgery",
    department: "Surgery",
    departmentId: "surgery",
    featured: true,
  },
  {
    specialty: "Obstetrics & Gynecology",
    slug: "obstetrics-gynecology",
    department: "Maternal & Child Health",
    departmentId: "maternal-child-health",
  },
  {
    specialty: "Internal Medicine",
    slug: "internal-medicine",
    department: "General Medicine",
    departmentId: "general-medicine",
  },
  {
    specialty: "Radiology",
    slug: "radiology",
    department: "Radiology & Imaging",
    departmentId: "radiology-imaging",
  },
  {
    specialty: "Emergency Care",
    slug: "emergency-care",
    department: "Emergency",
    departmentId: "emergency",
  },
  {
    specialty: "General Practice",
    slug: "general-practice",
    department: "General Medicine",
    departmentId: "general-medicine",
  },
]
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
export const medicalProfessionals: MedicalProfessional[] = seeds.map(
  (seed) => ({
    id: `placeholder-${seed.slug}`,
    slug: `profile-${seed.slug}`,
    name: "Dr. [Name Placeholder]",
    photo: null,
    photoAlt: "Approved professional portrait to be supplied by the hospital",
    professionalTitle: "[Professional Title]",
    specialty: seed.specialty,
    specialtyId: seed.slug,
    department: seed.department,
    departmentId: seed.departmentId,
    introduction:
      "Professional background and approach to care will be added after hospital verification.",
    biography:
      "[A hospital-approved biography, care approach, and professional introduction will be added here.]",
    qualifications: [
      "[Verified education & qualifications]",
      "[Approved professional credentials]",
    ],
    experience:
      "[Verified professional experience to be supplied by the hospital]",
    languages: ["[Verified languages]"],
    areasOfCare:
      seed.slug === "general-medicine"
        ? [
            "[Adult primary care]",
            "[Follow-up care]",
            "[Preventive care]",
            "[Chronic conditions]",
          ]
        : ["[Verified area of care]", "[Additional area of care]"],
    availability: {
      status: "unverified",
      lastConfirmed: null,
      schedule: days.map((day) => ({ day, status: "unverified", times: [] })),
    },
    appointmentEligibility: "pending",
    featured: seed.featured ?? false,
    verification: "placeholder",
  }),
)
export const staffSpecialties = seeds.map((seed) => ({
  id: seed.slug,
  name: seed.specialty,
}))
export const staffDepartments = Array.from(
  new Map(
    seeds.map((seed) => [
      seed.departmentId,
      { id: seed.departmentId, name: seed.department },
    ]),
  ).values(),
)
export function matchesProfessional(
  doctor: MedicalProfessional,
  query: string,
) {
  const haystack = [
    doctor.name,
    doctor.specialty,
    doctor.department,
    doctor.professionalTitle,
  ]
    .join(" ")
    .toLowerCase()
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}
export default medicalProfessionals
