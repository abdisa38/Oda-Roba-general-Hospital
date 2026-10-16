export interface PatientProfile {
  id: string
  mrn: string
  fullName: string
  gender: "Female" | "Male" | "Other"
  dateOfBirth: string
  age: number
  bloodType: string
  nationalId: string
  kebele: string
  woreda: string
  zone: string
  phone: string
  email: string
  emergencyContact: {
    name: string
    relation: string
    phone: string
  }
  allergies: string[]
  chronicConditions: string[]
  cbhiId: string
  cbhiStatus: "Active" | "Pending Renewal" | "Inactive"
}

export interface PortalAppointment {
  id: string
  appointmentNumber: string
  department: string
  doctorName: string
  doctorSpecialty: string
  dateTime: string
  room: string
  status: "Confirmed" | "Pending Review" | "Completed" | "Cancelled"
  reason: string
  prepInstructions?: string
  canCancel: boolean
  canReschedule: boolean
}

export interface AnalyteItem {
  name: string
  result: string
  unit: string
  referenceRange: string
  flag: "Normal" | "High" | "Low"
}

export interface DiagnosticResult {
  id: string
  reportNumber: string
  testCategory: string
  testName: string
  orderDate: string
  resultDate: string
  orderingDoctor: string
  verifiedBy: string
  status: "Final / Verified" | "Preliminary"
  analytes: AnalyteItem[]
  clinicalNotes: string
}

export interface PrescriptionRecord {
  drug: string
  dosage: string
  frequency: string
  duration: string
  status: "Active" | "Completed"
  refillRemaining: number
}

export interface MedicalRecord {
  id: string
  recordNumber: string
  visitDate: string
  department: string
  attendingDoctor: string
  visitType: "Outpatient Consultation" | "Inpatient Ward" | "Emergency Triage"
  chiefComplaint: string
  clinicalSummary: string
  vitalSigns: {
    bp: string
    pulse: string
    temp: string
    weight: string
  }
  prescriptions: PrescriptionRecord[]
  instructions: string
  followUp: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface PortalInvoice {
  id: string
  invoiceNumber: string
  date: string
  department: string
  serviceSummary: string
  items: InvoiceItem[]
  subtotal: number
  cbhiCovered: number
  totalDue: number
  status: "Paid" | "Pending" | "Partially Paid"
  receiptNumber?: string
  paymentMethod?: string
  paymentDate?: string
}

export interface PortalNotification {
  id: string
  category: "appointment" | "result" | "billing" | "prescription" | "announcement"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionTab?: "appointments" | "results" | "records" | "billing"
}

export const INITIAL_PATIENT: PatientProfile = {
  id: "PAT-2026-00104",
  mrn: "ORH-26-00104",
  fullName: "Chaltu Tolasa",
  gender: "Female",
  dateOfBirth: "1992-04-12",
  age: 34,
  bloodType: "A+",
  nationalId: "ETH-ORO-7849102",
  kebele: "Kebele 03, Bale Robe",
  woreda: "Robe City Administration",
  zone: "Bale Zone, Oromia Region",
  phone: "+251 91 234 5678",
  email: "chaltu.tolasa@example.com",
  emergencyContact: {
    name: "Dawit Tolasa",
    relation: "Spouse",
    phone: "+251 92 876 5432",
  },
  allergies: ["Penicillin (Mild cutaneous rash noted in 2021)"],
  chronicConditions: ["Essential Hypertension (Controlled on daily Enalapril)"],
  cbhiId: "CBHI-ROB-2026-4491",
  cbhiStatus: "Active",
}

export const INITIAL_APPOINTMENTS: PortalAppointment[] = [
  {
    id: "apt-1",
    appointmentNumber: "APT-2026-0891",
    department: "Internal Medicine",
    doctorName: "Dr. Daniel Abate",
    doctorSpecialty: "Senior Consultant Internist",
    dateTime: "2026-10-20T09:30:00",
    room: "OPD Room 104, Block B",
    status: "Confirmed",
    reason: "Hypertension 6-month routine review & blood pressure check",
    prepInstructions:
      "Please arrive 15 minutes before your time. Take your morning medications as scheduled. Fasting is not required for this visit.",
    canCancel: true,
    canReschedule: true,
  },
  {
    id: "apt-2",
    appointmentNumber: "REQ-2026-0145",
    department: "Ophthalmology / Eye Clinic",
    doctorName: "Dr. Aster Bekele",
    doctorSpecialty: "Ophthalmologist",
    dateTime: "2026-10-28T14:00:00",
    room: "Eye Clinic 2, Block A",
    status: "Pending Review",
    reason: "Routine vision assessment and reading glass prescription review",
    prepInstructions: "Bring existing spectacles or eye drops if currently in use.",
    canCancel: true,
    canReschedule: false,
  },
  {
    id: "apt-3",
    appointmentNumber: "APT-2026-0512",
    department: "Internal Medicine",
    doctorName: "Dr. Daniel Abate",
    doctorSpecialty: "Senior Consultant Internist",
    dateTime: "2026-07-15T10:00:00",
    room: "OPD Room 104, Block B",
    status: "Completed",
    reason: "Quarterly hypertensive evaluation and medication titration",
    canCancel: false,
    canReschedule: false,
  },
  {
    id: "apt-4",
    appointmentNumber: "APT-2026-0310",
    department: "Obstetrics & Gynecology",
    doctorName: "Dr. Hiwot Tadesse",
    doctorSpecialty: "OB/GYN Consultant",
    dateTime: "2026-04-08T11:15:00",
    room: "Maternal Health Suite 3",
    status: "Completed",
    reason: "Annual maternal wellness check-up and ultrasound scan review",
    canCancel: false,
    canReschedule: false,
  },
]

export const INITIAL_DIAGNOSTIC_RESULTS: DiagnosticResult[] = [
  {
    id: "res-1",
    reportNumber: "LAB-2026-04891",
    testCategory: "Hematology",
    testName: "Complete Blood Count (CBC) with Differential",
    orderDate: "2026-10-12T08:45:00",
    resultDate: "2026-10-12T11:30:00",
    orderingDoctor: "Dr. Daniel Abate",
    verifiedBy: "Tewodros Girma (Lead Medical Technologist)",
    status: "Final / Verified",
    clinicalNotes:
      "All major red and white cell lineages fall within reference ranges. Platelet count satisfactory. No significant morphological abnormalities identified.",
    analytes: [
      {
        name: "White Blood Cell Count (WBC)",
        result: "6.8",
        unit: "x10^9 / L",
        referenceRange: "4.0 - 11.0",
        flag: "Normal",
      },
      {
        name: "Red Blood Cell Count (RBC)",
        result: "4.65",
        unit: "x10^12 / L",
        referenceRange: "3.80 - 5.20",
        flag: "Normal",
      },
      {
        name: "Hemoglobin (Hgb)",
        result: "13.4",
        unit: "g / dL",
        referenceRange: "12.0 - 16.0",
        flag: "Normal",
      },
      {
        name: "Hematocrit (Hct)",
        result: "40.2",
        unit: "%",
        referenceRange: "36.0 - 46.0",
        flag: "Normal",
      },
      {
        name: "Mean Corpuscular Volume (MCV)",
        result: "86.5",
        unit: "fL",
        referenceRange: "80.0 - 100.0",
        flag: "Normal",
      },
      {
        name: "Platelet Count (PLT)",
        result: "248",
        unit: "x10^9 / L",
        referenceRange: "150 - 450",
        flag: "Normal",
      },
    ],
  },
  {
    id: "res-2",
    reportNumber: "LAB-2026-04892",
    testCategory: "Clinical Biochemistry",
    testName: "Lipid Profile & Serum Electrolytes",
    orderDate: "2026-10-12T08:45:00",
    resultDate: "2026-10-12T13:10:00",
    orderingDoctor: "Dr. Daniel Abate",
    verifiedBy: "Tewodros Girma (Lead Medical Technologist)",
    status: "Final / Verified",
    clinicalNotes:
      "Serum potassium and sodium are well balanced on current antihypertensive regimen. Total cholesterol is mildly elevated; lifestyle and dietary adjustments recommended.",
    analytes: [
      {
        name: "Total Cholesterol",
        result: "215",
        unit: "mg / dL",
        referenceRange: "< 200",
        flag: "High",
      },
      {
        name: "HDL Cholesterol ('Good')",
        result: "52",
        unit: "mg / dL",
        referenceRange: "> 40",
        flag: "Normal",
      },
      {
        name: "LDL Cholesterol ('Calculated')",
        result: "135",
        unit: "mg / dL",
        referenceRange: "< 130",
        flag: "High",
      },
      {
        name: "Triglycerides",
        result: "140",
        unit: "mg / dL",
        referenceRange: "< 150",
        flag: "Normal",
      },
      {
        name: "Serum Potassium (K+)",
        result: "4.2",
        unit: "mmol / L",
        referenceRange: "3.5 - 5.0",
        flag: "Normal",
      },
      {
        name: "Serum Sodium (Na+)",
        result: "141",
        unit: "mmol / L",
        referenceRange: "135 - 145",
        flag: "Normal",
      },
      {
        name: "Serum Creatinine",
        result: "0.85",
        unit: "mg / dL",
        referenceRange: "0.50 - 1.10",
        flag: "Normal",
      },
    ],
  },
]

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-1",
    recordNumber: "ENC-2026-0182",
    visitDate: "2026-07-15",
    department: "Internal Medicine Outpatient",
    attendingDoctor: "Dr. Daniel Abate",
    visitType: "Outpatient Consultation",
    chiefComplaint: "Follow-up for blood pressure monitoring; no headaches or chest tightness.",
    clinicalSummary:
      "Patient reports strict adherence to daily Enalapril 5mg. Home systolic readings average 124-128 mmHg. Physical examination demonstrates regular pulse, no peripheral edema, chest clear to auscultation.",
    vitalSigns: {
      bp: "126/82 mmHg",
      pulse: "72 bpm",
      temp: "36.6 °C",
      weight: "64.5 kg",
    },
    prescriptions: [
      {
        drug: "Enalapril Maleate 5mg Tablets",
        dosage: "5mg oral tablet",
        frequency: "Once daily every morning",
        duration: "90 days",
        status: "Active",
        refillRemaining: 2,
      },
      {
        drug: "Vitamin D3 (Cholecalciferol) 1,000 IU",
        dosage: "1 capsule",
        frequency: "Once daily with food",
        duration: "60 days",
        status: "Active",
        refillRemaining: 1,
      },
    ],
    instructions:
      "Continue daily salt-restriction diet. Regular brisk walking for 30 minutes 4 times weekly. Recheck blood pressure weekly at nearest clinic or home monitor. Report immediately if dizziness or ankle swelling occurs.",
    followUp: "Return in 3 months for routine follow-up appointment.",
  },
  {
    id: "rec-2",
    recordNumber: "ENC-2026-0094",
    visitDate: "2026-04-08",
    department: "Obstetrics & Gynecology",
    attendingDoctor: "Dr. Hiwot Tadesse",
    visitType: "Outpatient Consultation",
    chiefComplaint: "Annual routine maternal and pelvic health screening.",
    clinicalSummary:
      "Standard physical exam and preventive check. Pelvic exam normal without masses or tenderness. Cervical screening performed and reported negative for dysplasia.",
    vitalSigns: {
      bp: "122/80 mmHg",
      pulse: "76 bpm",
      temp: "36.8 °C",
      weight: "65.0 kg",
    },
    prescriptions: [],
    instructions:
      "Standard preventive health recommendations maintained. Annual screening cycle scheduled for April 2027.",
    followUp: "Routine annual check-up next year, or earlier if symptoms arise.",
  },
]

export const INITIAL_INVOICES: PortalInvoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-00142",
    date: "2026-10-12",
    department: "Laboratory & Diagnostics",
    serviceSummary: "Routine follow-up CBC with diff and lipid profile screening panel",
    items: [
      { description: "Complete Blood Count (CBC) Automated", quantity: 1, unitPrice: 280, total: 280 },
      { description: "Lipid Panel & Electrolyte Chemistry", quantity: 1, unitPrice: 560, total: 560 },
    ],
    subtotal: 840,
    cbhiCovered: 840,
    totalDue: 0,
    status: "Paid",
    receiptNumber: "RCT-2026-0089",
    paymentMethod: "CBHI Hospital Scheme Coverage",
    paymentDate: "2026-10-12",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-00109",
    date: "2026-07-15",
    department: "Internal Medicine OPD & Pharmacy",
    serviceSummary: "Specialist consultation fee and 90-day medication supply",
    items: [
      { description: "Consultant Outpatient Visit (Internal Med)", quantity: 1, unitPrice: 350, total: 350 },
      { description: "Enalapril 5mg (90 tablets pack)", quantity: 1, unitPrice: 240, total: 240 },
      { description: "Vitamin D3 1000 IU (60 capsules pack)", quantity: 1, unitPrice: 160, total: 160 },
    ],
    subtotal: 750,
    cbhiCovered: 600,
    totalDue: 0,
    status: "Paid",
    receiptNumber: "RCT-2026-0043",
    paymentMethod: "Telebirr Electronic Pay (Ref: TB-910284)",
    paymentDate: "2026-07-15",
  },
]

export const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: "notif-1",
    category: "appointment",
    title: "Upcoming Appointment Reminder",
    message: "You have a confirmed visit with Dr. Daniel Abate on Tuesday, Oct 20 at 09:30 AM in OPD Room 104.",
    timestamp: "2026-10-16T08:00:00",
    read: false,
    actionTab: "appointments",
  },
  {
    id: "notif-2",
    category: "result",
    title: "Laboratory Results Ready",
    message: "Your Complete Blood Count (CBC) and Lipid Profile results are finalized and verified by the laboratory.",
    timestamp: "2026-10-12T13:30:00",
    read: false,
    actionTab: "results",
  },
  {
    id: "notif-3",
    category: "billing",
    title: "Billing Settlement Confirmed",
    message: "Invoice INV-2026-00142 (840 ETB) was fully settled under your active CBHI Community Health policy.",
    timestamp: "2026-10-12T12:00:00",
    read: true,
    actionTab: "billing",
  },
  {
    id: "notif-4",
    category: "announcement",
    title: "Holiday Clinic Hours Notice",
    message: "Oda Roba Outpatient Specialty Clinics operate 08:30 - 17:30 weekdays. Emergency Department is open 24/7.",
    timestamp: "2026-10-01T09:00:00",
    read: true,
  },
]
