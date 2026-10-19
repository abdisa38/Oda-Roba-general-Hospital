import type { IconName } from "./Icon"

export type CareCategory = "clinical" | "diagnostic" | "pharmacy" | "emergency" | "family" | "inpatient" | "follow-up"
type CareBase = {
  id: string
  name: string
  slug: string
  description: string
  icon: IconName
  image: string | null
  category: CareCategory
  availability: "unverified" | "available" | "temporarily-unavailable" | "coming-soon"
  appointmentEligibility: "pending" | "eligible" | "not-eligible"
  featured: boolean
  keywords: string[]
}
export type Department = CareBase & {
  kind: "department"
  department: null
  audience: string
}
export type Service = CareBase & {
  kind: "service"
  department: string
  audience: string
}
export type CareItem = Department | Service
export type Category = {
  id: CareCategory
  name: string
  icon: IconName
  description: string
}
type DepartmentSeed = {
  name: string
  slug: string
  description: string
  icon: IconName
  category: CareCategory
  audience: string
  keywords: string[]
}
type ServiceSeed = DepartmentSeed & {
  department: string
  featured?: boolean
}
const departmentSeeds: DepartmentSeed[] = [
  {
    name: "General medicine",
    slug: "general-medicine",
    description: "A starting point for consultations and ongoing medical care.",
    icon: "user",
    category: "clinical",
    audience:
      "People looking for a medical consultation or information about ongoing care.",
    keywords: ["doctor", "consultation", "general", "health"],
  },
  {
    name: "Emergency",
    slug: "emergency",
    description: "Information and guidance for urgent healthcare needs.",
    icon: "cross",
    category: "emergency",
    audience:
      "People who need urgent medical help. Online requests are not an emergency pathway.",
    keywords: ["urgent", "emergency", "immediate"],
  },
  {
    name: "Maternal & child health",
    slug: "maternal-child-health",
    description: "An introduction to care for mothers, children, and families.",
    icon: "baby",
    category: "family",
    audience:
      "Mothers, children, and families seeking information about appropriate care.",
    keywords: [
      "maternal",
      "maternity",
      "pregnancy",
      "child",
      "children",
      "baby",
    ],
  },
  {
    name: "Surgery",
    slug: "surgery",
    description:
      "A place to learn about surgical consultations and preparation.",
    icon: "shield",
    category: "clinical",
    audience:
      "People looking for verified information about surgical assessment or follow-up.",
    keywords: ["surgery", "surgical", "operation"],
  },
  {
    name: "Laboratory",
    slug: "laboratory",
    description:
      "A clear path to diagnostic testing and preparation information.",
    icon: "flask",
    category: "diagnostic",
    audience:
      "People looking for information about a requested test or how to prepare.",
    keywords: ["lab", "test", "testing", "diagnostic", "results"],
  },
  {
    name: "Radiology & imaging",
    slug: "radiology-imaging",
    description:
      "Information about medical imaging and the steps around a visit.",
    icon: "scan",
    category: "diagnostic",
    audience: "People looking for information about an imaging referral.",
    keywords: ["radiology", "imaging", "scan", "x-ray", "diagnostic"],
  },
  {
    name: "Pharmacy",
    slug: "pharmacy",
    description: "A starting point for medicine and prescription information.",
    icon: "pill",
    category: "pharmacy",
    audience:
      "People who need information about prescribed medicines or pharmacy access.",
    keywords: ["medication", "medicine", "pharmacy", "prescription"],
  },
  {
    name: "Outpatient services",
    slug: "outpatient-services",
    description:
      "Information for consultations and visits without an overnight stay.",
    icon: "calendar",
    category: "clinical",
    audience: "People planning a consultation or follow-up visit.",
    keywords: ["outpatient", "doctor", "appointment", "visit"],
  },
  {
    name: "Inpatient services",
    slug: "inpatient-services",
    description: "An introduction to care and support during a hospital stay.",
    icon: "building",
    category: "inpatient",
    audience:
      "Patients and families looking for information about admission or a hospital stay.",
    keywords: ["inpatient", "admission", "stay", "ward"],
  },
]
const serviceSeeds: ServiceSeed[] = [
  {
    name: "Outpatient care",
    slug: "outpatient-care",
    description: "Consultations, assessment, and guidance for your next steps.",
    icon: "user",
    category: "clinical",
    department: "outpatient-services",
    audience: "People seeking information about a medical appointment.",
    keywords: ["outpatient", "doctor", "appointment"],
    featured: true,
  },
  {
    name: "Emergency care",
    slug: "emergency-care",
    description: "Find clear information when a healthcare need cannot wait.",
    icon: "cross",
    category: "emergency",
    department: "emergency",
    audience:
      "People needing urgent medical help; do not wait for an online response.",
    keywords: ["urgent", "immediate"],
    featured: true,
  },
  {
    name: "Laboratory services",
    slug: "laboratory-services",
    description: "Explore testing information and preparation for a visit.",
    icon: "flask",
    category: "diagnostic",
    department: "laboratory",
    audience:
      "People looking for information about a requested laboratory test.",
    keywords: ["lab", "test", "testing", "results"],
    featured: true,
  },
  {
    name: "Pharmacy services",
    slug: "pharmacy-services",
    description: "A starting point for medicines and prescription guidance.",
    icon: "pill",
    category: "pharmacy",
    department: "pharmacy",
    audience:
      "People seeking information about pharmacy access and prescribed medicines.",
    keywords: ["medication", "medicine", "prescription"],
    featured: true,
  },
  {
    name: "Maternal & child care",
    slug: "maternal-child-care",
    description: "Information about care for mothers, children, and families.",
    icon: "baby",
    category: "family",
    department: "maternal-child-health",
    audience: "Mothers, children, and families exploring care options.",
    keywords: ["maternal", "maternity", "child", "baby", "pregnancy"],
    featured: true,
  },
  {
    name: "Inpatient care",
    slug: "inpatient-care",
    description: "Understand the care journey around a hospital stay.",
    icon: "building",
    category: "inpatient",
    department: "inpatient-services",
    audience: "Patients and families looking for information about admission.",
    keywords: ["admission", "stay", "ward"],
    featured: true,
  },
  {
    name: "Medical consultation",
    slug: "medical-consultation",
    description:
      "Information about a first visit and talking with a care professional.",
    icon: "user",
    category: "clinical",
    department: "general-medicine",
    audience:
      "People looking for a consultation and guidance about next steps.",
    keywords: ["general medicine", "doctor", "consultation"],
  },
  {
    name: "Follow-up care",
    slug: "follow-up-care",
    description: "Guidance about continuing your care after a visit.",
    icon: "heart",
    category: "follow-up",
    department: "general-medicine",
    audience: "Returning patients seeking follow-up information.",
    keywords: ["follow up", "follow-up", "return", "ongoing", "preventive"],
  },
  {
    name: "Diagnostic testing",
    slug: "diagnostic-testing",
    description: "Find information about requested tests and preparation.",
    icon: "flask",
    category: "diagnostic",
    department: "laboratory",
    audience: "People with a test request who need preparation information.",
    keywords: ["lab", "laboratory", "test", "testing", "diagnostic"],
  },
  {
    name: "Diagnostic imaging",
    slug: "diagnostic-imaging",
    description: "An introduction to imaging referrals and visit information.",
    icon: "scan",
    category: "diagnostic",
    department: "radiology-imaging",
    audience: "People seeking information about an imaging referral.",
    keywords: ["radiology", "scan", "x-ray"],
  },
  {
    name: "Surgical consultation",
    slug: "surgical-consultation",
    description: "Information about discussing surgical care and preparation.",
    icon: "shield",
    category: "clinical",
    department: "surgery",
    audience: "People looking for verified surgical assessment information.",
    keywords: ["surgery", "operation", "surgical"],
  },
  {
    name: "Continued care information",
    slug: "continued-care-information",
    description: "Understand where to find guidance about your next visit.",
    icon: "calendar",
    category: "follow-up",
    department: "outpatient-services",
    audience:
      "Patients and families looking for information after an appointment.",
    keywords: ["follow-up", "follow up", "preventive", "ongoing"],
  },
]
export const departments: Department[] = departmentSeeds.map((item) => ({
  ...item,
  id: `department-${item.slug}`,
  kind: "department",
  department: null,
  image:
    item.slug === "general-medicine" ? "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80" : null,
  availability: "unverified",
  appointmentEligibility: "pending",
  featured: item.slug === "general-medicine",
}))
export const services: Service[] = serviceSeeds.map((item) => ({
  ...item,
  id: `service-${item.slug}`,
  kind: "service",
  image: null,
  availability: "unverified",
  appointmentEligibility: "pending",
  featured: item.featured ?? false,
}))
export const categories: Category[] = [
  {
    id: "clinical",
    name: "Clinical care",
    icon: "user",
    description:
      "Consultations and information about medical or surgical care.",
  },
  {
    id: "diagnostic",
    name: "Diagnostic services",
    icon: "flask",
    description: "Information about testing, imaging, and preparation.",
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    icon: "pill",
    description: "Find medicine and prescription information.",
  },
  {
    id: "emergency",
    name: "Emergency care",
    icon: "cross",
    description:
      "For urgent needs, seek immediate help. Do not wait for an online request.",
  },
  {
    id: "family",
    name: "Maternal & child care",
    icon: "baby",
    description:
      "A starting point for mothers, children, and growing families.",
  },
  {
    id: "inpatient",
    name: "Inpatient care",
    icon: "building",
    description:
      "Information for patients and families around a hospital stay.",
  },
  {
    id: "follow-up",
    name: "Preventive & follow-up care",
    icon: "heart",
    description:
      "Information for continuing your care journey and finding next steps.",
  },
]
export const allCare: CareItem[] = [...departments, ...services]
export function departmentServices(department: Department) {
  return services.filter((service) => service.department === department.slug)
}
export function careMatches(item: CareItem, query: string) {
  const departmentName =
    item.kind === "service"
      ? departments.find((d) => d.slug === item.department)?.name
      : ""
  const categoryName = categories.find(
    (category) => category.id === item.category,
  )?.name
  const haystack = [
    item.name,
    item.description,
    departmentName,
    categoryName,
    ...item.keywords,
  ]
    .join(" ")
    .toLocaleLowerCase()
  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}
const directoryData = { departments, services, categories }
export default directoryData
