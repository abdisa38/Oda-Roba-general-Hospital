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

const standardSchedule: ScheduleDay[] = [
  { day: "Monday", status: "available", times: ["08:30", "10:30", "14:00", "16:00"] },
  { day: "Tuesday", status: "available", times: ["08:30", "10:30", "14:00"] },
  { day: "Wednesday", status: "available", times: ["09:00", "11:00", "15:00"] },
  { day: "Thursday", status: "available", times: ["08:30", "10:30", "14:00", "16:00"] },
  { day: "Friday", status: "available", times: ["08:30", "10:30"] },
  { day: "Saturday", status: "limited", times: ["09:00", "11:00"] },
]

export const medicalProfessionals: MedicalProfessional[] = [
  {
    id: "dr-mudesir-aman",
    slug: "dr-mudesir-aman",
    name: "Dr. Mudesir Aman, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Electron-Kebebew.jpg",
    photoAlt: "Dr. Mudesir Aman, MD - General Surgery & Clinical Operations at Oda Roba Hospital",
    professionalTitle: "Senior Consultant General Surgeon & Head of Surgical Operations",
    specialty: "Surgery",
    specialtyId: "surgery",
    department: "Surgery",
    departmentId: "surgery",
    introduction:
      "Senior general surgeon leading elective surgical consultations, emergency surgical intervention, and post-operative clinical care at Oda Roba Hospital.",
    biography:
      "Dr. Mudesir Aman provides expert surgical care for the Bale Robe community and surrounding woredas. His clinical focus covers acute abdominal procedures, elective minor and major surgeries, trauma response, and sterile perioperative care.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Specialty Certificate in General Surgery",
      "Fellow of the Ethiopian Society of Surgeons",
      "Licensed by the Ethiopian Ministry of Health & Oromia Health Bureau",
    ],
    experience: "12+ years in clinical general surgery and acute surgical emergency response.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "Abdominal & Trauma Surgery",
      "Elective & Emergency Surgical Interventions",
      "Hernia & Soft Tissue Procedures",
      "Perioperative & Wound Recovery Care",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active on duty",
    },
    appointmentEligibility: "eligible",
    featured: true,
    verification: "verified",
  },
  {
    id: "dr-muhammed-amin",
    slug: "dr-muhammed-amin",
    name: "Dr. Muhammed Amin, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Dr_Kesete_Admasu.jpg",
    photoAlt: "Dr. Muhammed Amin, MD - Consultant Physician & Internal Medicine Lead",
    professionalTitle: "Senior Consultant Physician & Head of Internal Medicine",
    specialty: "Internal Medicine",
    specialtyId: "internal-medicine",
    department: "General Medicine",
    departmentId: "general-medicine",
    introduction:
      "Consultant internist dedicated to comprehensive adult diagnosis, cardiovascular health, diabetes management, and chronic outpatient care.",
    biography:
      "Dr. Muhammed Amin has spent over 14 years advancing adult healthcare and chronic disease prevention in Oromia. He directs inpatient internal medicine rounds and oversees personalized diagnostic programs for patients across Bale.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Specialty Board in Internal Medicine",
      "Member of Ethiopian Medical Association (EMA)",
      "Certified in Adult Critical Care & Cardiovascular Diagnostics",
    ],
    experience: "14+ years in internal medicine, infectious diseases, and non-communicable disease management.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "Cardiovascular & Hypertension Care",
      "Diabetes & Endocrine Health",
      "Respiratory & Chest Medicine",
      "Comprehensive Adult Health Assessment",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active on duty",
    },
    appointmentEligibility: "eligible",
    featured: true,
    verification: "verified",
  },
  {
    id: "dr-workineh-alamu",
    slug: "dr-workineh-alamu",
    name: "Dr. Workineh Alamu, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Young_Doctors_in_Ethiopia.jpg",
    photoAlt: "Dr. Workineh Alamu, MD - Consultant Pediatrician & Child Health Specialist",
    professionalTitle: "Consultant Pediatrician & Head of Child Health Services",
    specialty: "Pediatrics",
    specialtyId: "pediatrics",
    department: "Maternal & Child Health",
    departmentId: "maternal-child-health",
    introduction:
      "Specialist pediatrician devoted to newborn care, childhood immunizations, developmental assessments, and acute pediatric medical care.",
    biography:
      "Dr. Workineh Alamu leads maternal and child health clinical operations at Oda Roba Hospital. He has dedicated his career to safeguarding children's health, treating neonatal infections, and guiding parents through early development milestones.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Specialty Certificate in Pediatrics & Child Health",
      "Member of the Ethiopian Pediatric Society (EPS)",
      "Neonatal Resuscitation & Emergency Pediatric Care Certified",
    ],
    experience: "10+ years dedicated to pediatric clinical practice and neonatal intensive care in Bale Robe.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "Newborn & Infant Clinical Care",
      "Pediatric Infectious Diseases",
      "Childhood Growth & Nutrition Assessment",
      "Pediatric Emergency & Inpatient Triage",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active on duty",
    },
    appointmentEligibility: "eligible",
    featured: true,
    verification: "verified",
  },
  {
    id: "dr-chaltu-gemechu",
    slug: "dr-chaltu-gemechu",
    name: "Dr. Chaltu Gemechu, MD",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    photoAlt: "Dr. Chaltu Gemechu - Obstetrics & Gynecology Specialist",
    professionalTitle: "Lead Obstetrician & Gynecologist",
    specialty: "Obstetrics & Gynecology",
    specialtyId: "obstetrics-gynecology",
    department: "Maternal & Child Health",
    departmentId: "maternal-child-health",
    introduction:
      "Comprehensive maternal healthcare, prenatal follow-up, safe delivery, and reproductive health specialist.",
    biography:
      "Dr. Chaltu Gemechu oversees maternal health services, antenatal care programs, and labor and delivery suites at Oda Roba Hospital.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Specialty Board in Obstetrics & Gynecology",
      "Ethiopian Society of Obstetricians & Gynecologists (ESOG)",
    ],
    experience: "9+ years in women's health, safe motherhood, and emergency obstetric care.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "Prenatal & Postnatal Care",
      "Safe Delivery & Labor Management",
      "Gynecological Consultations",
      "Women's Reproductive Health",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active on duty",
    },
    appointmentEligibility: "eligible",
    featured: false,
    verification: "verified",
  },
  {
    id: "dr-abera-tola",
    slug: "dr-abera-tola",
    name: "Dr. Abera Tola, MD",
    photo: null,
    photoAlt: "Dr. Abera Tola - Emergency Medicine Specialist",
    professionalTitle: "Emergency & Critical Care Physician",
    specialty: "Emergency Care",
    specialtyId: "emergency-care",
    department: "Emergency",
    departmentId: "emergency",
    introduction:
      "24/7 urgent clinical triage, acute trauma care, and emergency stabilization lead physician.",
    biography:
      "Dr. Abera leads the emergency response team at Oda Roba Hospital, coordinating fast-track triage and immediate interventions for critical patients.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Emergency & Critical Medicine Fellow",
      "Advanced Trauma Life Support (ATLS) Certified",
    ],
    experience: "8+ years in acute emergency triage and critical hospital care.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "24/7 Acute Triage",
      "Trauma & Accident Stabilization",
      "Emergency Resuscitation",
      "Urgent Medical Intervention",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active 24/7",
    },
    appointmentEligibility: "eligible",
    featured: false,
    verification: "verified",
  },
  {
    id: "dr-yonas-dibaba",
    slug: "dr-yonas-dibaba",
    name: "Dr. Yonas Dibaba, MD",
    photo: null,
    photoAlt: "Dr. Yonas Dibaba - Consultant Radiologist",
    professionalTitle: "Consultant Radiologist & Diagnostic Imaging Lead",
    specialty: "Radiology",
    specialtyId: "radiology",
    department: "Radiology & Imaging",
    departmentId: "radiology-imaging",
    introduction:
      "Diagnostic ultrasonography, digital radiography (X-ray), and medical imaging analysis specialist.",
    biography:
      "Dr. Yonas provides rapid diagnostic imaging interpretation to assist surgical, pediatric, and internal medicine clinical decisions.",
    qualifications: [
      "Doctor of Medicine (MD)",
      "Specialty Certificate in Diagnostic Radiology",
      "Radiological Society of Ethiopia Member",
    ],
    experience: "11+ years in clinical medical imaging and diagnostic ultrasonography.",
    languages: ["Afaan Oromoo", "Amharic", "English"],
    areasOfCare: [
      "Diagnostic Ultrasound",
      "Digital X-Ray Interpretation",
      "Pre-operative Imaging Diagnostics",
      "Trauma & Chest Radiography",
    ],
    availability: {
      status: "available",
      schedule: standardSchedule,
      lastConfirmed: "Active on duty",
    },
    appointmentEligibility: "eligible",
    featured: false,
    verification: "verified",
  },
]

export const staffSpecialties = [
  { id: "surgery", name: "Surgery" },
  { id: "internal-medicine", name: "Internal Medicine" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "obstetrics-gynecology", name: "Obstetrics & Gynecology" },
  { id: "emergency-care", name: "Emergency Care" },
  { id: "radiology", name: "Radiology" },
]

export const staffDepartments = [
  { id: "surgery", name: "Surgery" },
  { id: "general-medicine", name: "General Medicine" },
  { id: "maternal-child-health", name: "Maternal & Child Health" },
  { id: "emergency", name: "Emergency" },
  { id: "radiology-imaging", name: "Radiology & Imaging" },
]

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
