// ORHIMS — Phase 08: Hospital Billing & Financial Management Data Model
// Oda Roba General Hospital — Finance & Cashier Office (Bale Robe, Ethiopia)

export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Voided"

export type PaymentMethod =
  | "Cash"
  | "Telebirr"
  | "CBE Birr"
  | "Bank Transfer (CBE)"
  | "Other Approved Method"

export type PaymentStatus = "Completed" | "Pending" | "Reversed"

export type ServiceCategory =
  | "Consultation"
  | "Laboratory"
  | "Imaging"
  | "Medication"
  | "Procedures"
  | "Inpatient / Bed"
  | "Emergency Services"

export interface BillableItem {
  id: string
  category: ServiceCategory
  serviceName: string
  description?: string
  unitPriceETB: number
  quantity: number
  totalETB: number
}

export interface Invoice {
  id: string // e.g. "INV-2026-00412"
  patientId: string // e.g. "ORH-2026-0941"
  patientName: string // e.g. "Solomon Desta"
  patientAge: number
  patientGender: "Male" | "Female"
  encounterId: string // e.g. "ENC-2026-1044"
  department: string // e.g. "Emergency Department"
  issueDate: string // e.g. "16 Oct 2026 · 10:55 AM"
  dueDate: string // e.g. "23 Oct 2026"
  subtotalETB: number
  discountETB: number
  totalAmountETB: number
  paidAmountETB: number
  outstandingBalanceETB: number
  status: InvoiceStatus
  items: BillableItem[]
  notes?: string
  createdBy: string
}

export interface PaymentReceipt {
  id: string // e.g. "REC-2026-00512"
  invoiceId: string
  patientId: string
  patientName: string
  paymentDate: string // e.g. "16 Oct 2026 · 11:15 AM"
  amountPaidETB: number
  paymentMethod: PaymentMethod
  transactionReference: string
  recordedBy: string
  status: PaymentStatus
  notes?: string
  previousBalanceETB: number
  remainingBalanceETB: number
}

/**
 * Standard Billable Service Catalog (Oda Roba General Hospital standard tariffs)
 */
export const STANDARD_TARIFFS: {
  category: ServiceCategory
  code: string
  name: string
  defaultPriceETB: number
}[] = [
  { category: "Consultation", code: "SRV-CNS-01", name: "General Outpatient Consultation", defaultPriceETB: 150 },
  { category: "Consultation", code: "SRV-CNS-02", name: "Specialist Physician Consultation", defaultPriceETB: 350 },
  { category: "Consultation", code: "SRV-CNS-03", name: "Emergency Triage & Assessment", defaultPriceETB: 200 },
  { category: "Laboratory", code: "SRV-LAB-01", name: "Complete Blood Count (CBC) with Diff", defaultPriceETB: 120 },
  { category: "Laboratory", code: "SRV-LAB-02", name: "Malaria Rapid Diagnostic Test (RDT) & Smear", defaultPriceETB: 80 },
  { category: "Laboratory", code: "SRV-LAB-03", name: "Comprehensive Urinalysis (Strip + Micro)", defaultPriceETB: 90 },
  { category: "Laboratory", code: "SRV-LAB-04", name: "Random / Fasting Blood Glucose (RBS/FBS)", defaultPriceETB: 70 },
  { category: "Laboratory", code: "SRV-LAB-05", name: "Renal Function Panel (Creatinine & Urea)", defaultPriceETB: 180 },
  { category: "Laboratory", code: "SRV-LAB-06", name: "Liver Enzymes (AST, ALT, Bilirubin)", defaultPriceETB: 210 },
  { category: "Imaging", code: "SRV-IMG-01", name: "Chest X-Ray (PA & Lateral)", defaultPriceETB: 320 },
  { category: "Imaging", code: "SRV-IMG-02", name: "Abdominal & Pelvic Ultrasound", defaultPriceETB: 450 },
  { category: "Imaging", code: "SRV-IMG-03", name: "Obstetric Ultrasound (Fetal Wellbeing)", defaultPriceETB: 380 },
  { category: "Medication", code: "SRV-MED-01", name: "Amoxicillin 500mg Capsules (Course)", defaultPriceETB: 95 },
  { category: "Medication", code: "SRV-MED-02", name: "Ceftriaxone 1g Injection + Diluent", defaultPriceETB: 180 },
  { category: "Medication", code: "SRV-MED-03", name: "Artemether/Lumefantrine (Coartem) Course", defaultPriceETB: 140 },
  { category: "Medication", code: "SRV-MED-04", name: "Paracetamol 500mg Tablets (Strip)", defaultPriceETB: 25 },
  { category: "Medication", code: "SRV-MED-05", name: "Oral Rehydration Salts (ORS) x 5 Sachets", defaultPriceETB: 45 },
  { category: "Medication", code: "SRV-MED-06", name: "Normal Saline 0.9% IV Infusion (1000ml)", defaultPriceETB: 120 },
  { category: "Procedures", code: "SRV-PRC-01", name: "Surgical Wound Dressing & Cleansing", defaultPriceETB: 180 },
  { category: "Procedures", code: "SRV-PRC-02", name: "Peripheral IV Cannulation & Fluid Setup", defaultPriceETB: 100 },
  { category: "Procedures", code: "SRV-PRC-03", name: "Minor Laceration Suture (Local)", defaultPriceETB: 420 },
  { category: "Inpatient / Bed", code: "SRV-BED-01", name: "General Medical Ward Bed (Per Day)", defaultPriceETB: 250 },
  { category: "Inpatient / Bed", code: "SRV-BED-02", name: "Pediatric Inpatient Bed (Per Day)", defaultPriceETB: 220 },
  { category: "Emergency Services", code: "SRV-EMG-01", name: "Emergency Resuscitation & Oxygenation", defaultPriceETB: 650 },
]

/**
 * Initial Invoices Dataset for Oda Roba Hospital
 */
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-2026-00412",
    patientId: "ORH-2026-0941",
    patientName: "Solomon Desta",
    patientAge: 42,
    patientGender: "Male",
    encounterId: "ENC-2026-1044",
    department: "Emergency Department",
    issueDate: "16 Oct 2026 · 10:55 AM",
    dueDate: "23 Oct 2026",
    subtotalETB: 970.0,
    discountETB: 0,
    totalAmountETB: 970.0,
    paidAmountETB: 0,
    outstandingBalanceETB: 970.0,
    status: "Issued",
    createdBy: "Billing Officer Kedir Abdi",
    notes: "Emergency stabilization, stat calcium gluconate, and CBC lab investigation.",
    items: [
      { id: "ITEM-1", category: "Consultation", serviceName: "Emergency Triage & Assessment", unitPriceETB: 200, quantity: 1, totalETB: 200 },
      { id: "ITEM-2", category: "Emergency Services", serviceName: "Emergency Resuscitation & Oxygenation", unitPriceETB: 650, quantity: 1, totalETB: 650 },
      { id: "ITEM-3", category: "Laboratory", serviceName: "Complete Blood Count (CBC) with Diff", unitPriceETB: 120, quantity: 1, totalETB: 120 },
    ],
  },
  {
    id: "INV-2026-00411",
    patientId: "ORH-2026-0712",
    patientName: "Fatuma Roba",
    patientAge: 28,
    patientGender: "Female",
    encounterId: "ENC-2026-1039",
    department: "Adult OPD-1",
    issueDate: "16 Oct 2026 · 09:40 AM",
    dueDate: "23 Oct 2026",
    subtotalETB: 615.0,
    discountETB: 50.0,
    totalAmountETB: 565.0,
    paidAmountETB: 565.0,
    outstandingBalanceETB: 0,
    status: "Paid",
    createdBy: "Cashier Almaz Kebede",
    notes: "Full settlement via Telebirr. Receipt issued.",
    items: [
      { id: "ITEM-4", category: "Consultation", serviceName: "General Outpatient Consultation", unitPriceETB: 150, quantity: 1, totalETB: 150 },
      { id: "ITEM-5", category: "Imaging", serviceName: "Chest X-Ray (PA & Lateral)", unitPriceETB: 320, quantity: 1, totalETB: 320 },
      { id: "ITEM-6", category: "Medication", serviceName: "Amoxicillin 500mg Capsules (Course)", unitPriceETB: 95, quantity: 1, totalETB: 95 },
      { id: "ITEM-7", category: "Medication", serviceName: "Paracetamol 500mg Tablets (Strip)", unitPriceETB: 25, quantity: 2, totalETB: 50 },
    ],
  },
  {
    id: "INV-2026-00410",
    patientId: "ORH-2026-0688",
    patientName: "Chaltu Tolosa",
    patientAge: 34,
    patientGender: "Female",
    encounterId: "ENC-2026-1025",
    department: "Maternal Health Clinic",
    issueDate: "15 Oct 2026 · 03:20 PM",
    dueDate: "22 Oct 2026",
    subtotalETB: 830.0,
    discountETB: 0,
    totalAmountETB: 830.0,
    paidAmountETB: 400.0,
    outstandingBalanceETB: 430.0,
    status: "Partially Paid",
    createdBy: "Cashier Almaz Kebede",
    notes: "Partial downpayment made via Cash. Remaining balance due before lab release.",
    items: [
      { id: "ITEM-8", category: "Consultation", serviceName: "Specialist Physician Consultation", unitPriceETB: 350, quantity: 1, totalETB: 350 },
      { id: "ITEM-9", category: "Imaging", serviceName: "Obstetric Ultrasound (Fetal Wellbeing)", unitPriceETB: 380, quantity: 1, totalETB: 380 },
      { id: "ITEM-10", category: "Laboratory", serviceName: "Urinalysis (Strip + Micro)", unitPriceETB: 90, quantity: 1, totalETB: 90 },
      { id: "ITEM-11", category: "Laboratory", serviceName: "Random Blood Glucose (RBS)", unitPriceETB: 70, quantity: 1, totalETB: 70 },
    ],
  },
  {
    id: "INV-2026-00409",
    patientId: "ORH-2026-0552",
    patientName: "Ahmed Mohammed",
    patientAge: 51,
    patientGender: "Male",
    encounterId: "ENC-2026-1011",
    department: "Adult OPD-2",
    issueDate: "15 Oct 2026 · 11:10 AM",
    dueDate: "22 Oct 2026",
    subtotalETB: 740.0,
    discountETB: 0,
    totalAmountETB: 740.0,
    paidAmountETB: 740.0,
    outstandingBalanceETB: 0,
    status: "Paid",
    createdBy: "Cashier Almaz Kebede",
    notes: "Settled via CBE Birr transfer.",
    items: [
      { id: "ITEM-12", category: "Consultation", serviceName: "General Outpatient Consultation", unitPriceETB: 150, quantity: 1, totalETB: 150 },
      { id: "ITEM-13", category: "Laboratory", serviceName: "Liver Enzymes (AST, ALT, Bilirubin)", unitPriceETB: 210, quantity: 1, totalETB: 210 },
      { id: "ITEM-14", category: "Laboratory", serviceName: "Renal Function Panel", unitPriceETB: 180, quantity: 1, totalETB: 180 },
      { id: "ITEM-15", category: "Imaging", serviceName: "Abdominal & Pelvic Ultrasound", unitPriceETB: 450, quantity: 1, totalETB: 450 },
    ],
  },
  {
    id: "INV-2026-00408",
    patientId: "ORH-2026-0429",
    patientName: "Derartu Tulu",
    patientAge: 19,
    patientGender: "Female",
    encounterId: "ENC-2026-0988",
    department: "Pediatric / Youth",
    issueDate: "14 Oct 2026 · 02:45 PM",
    dueDate: "21 Oct 2026",
    subtotalETB: 370.0,
    discountETB: 0,
    totalAmountETB: 370.0,
    paidAmountETB: 0,
    outstandingBalanceETB: 370.0,
    status: "Issued",
    createdBy: "Billing Officer Kedir Abdi",
    notes: "Awaiting payment at cashier window 2.",
    items: [
      { id: "ITEM-16", category: "Consultation", serviceName: "General Outpatient Consultation", unitPriceETB: 150, quantity: 1, totalETB: 150 },
      { id: "ITEM-17", category: "Laboratory", serviceName: "Malaria Rapid Diagnostic Test (RDT) & Smear", unitPriceETB: 80, quantity: 1, totalETB: 80 },
      { id: "ITEM-18", category: "Medication", serviceName: "Artemether/Lumefantrine (Coartem) Course", unitPriceETB: 140, quantity: 1, totalETB: 140 },
    ],
  },
  {
    id: "INV-2026-00407",
    patientId: "ORH-2026-0311",
    patientName: "Kenenisa Bekele",
    patientAge: 63,
    patientGender: "Male",
    encounterId: "ENC-2026-0945",
    department: "Non-Communicable Diseases",
    issueDate: "10 Oct 2026 · 09:15 AM",
    dueDate: "15 Oct 2026",
    subtotalETB: 1250.0,
    discountETB: 0,
    totalAmountETB: 1250.0,
    paidAmountETB: 300.0,
    outstandingBalanceETB: 950.0,
    status: "Overdue",
    createdBy: "Billing Officer Kedir Abdi",
    notes: "Due date passed on 15 Oct 2026. Follow-up reminder pending.",
    items: [
      { id: "ITEM-19", category: "Consultation", serviceName: "Specialist Physician Consultation", unitPriceETB: 350, quantity: 1, totalETB: 350 },
      { id: "ITEM-20", category: "Laboratory", serviceName: "Renal Function Panel", unitPriceETB: 180, quantity: 1, totalETB: 180 },
      { id: "ITEM-21", category: "Inpatient / Bed", serviceName: "General Medical Ward Bed (Per Day)", unitPriceETB: 250, quantity: 2, totalETB: 500 },
      { id: "ITEM-22", category: "Medication", serviceName: "Normal Saline 0.9% IV Infusion (1000ml)", unitPriceETB: 120, quantity: 2, totalETB: 240 },
    ],
  },
  {
    id: "INV-2026-00406",
    patientId: "ORH-2026-0204",
    patientName: "Tigist Girma",
    patientAge: 24,
    patientGender: "Female",
    encounterId: "ENC-2026-0910",
    department: "Adult OPD-1",
    issueDate: "16 Oct 2026 · 11:10 AM",
    dueDate: "23 Oct 2026",
    subtotalETB: 420.0,
    discountETB: 0,
    totalAmountETB: 420.0,
    paidAmountETB: 0,
    outstandingBalanceETB: 420.0,
    status: "Draft",
    createdBy: "Billing Officer Kedir Abdi",
    notes: "Draft prepared by triage nurse; awaiting clinical order review.",
    items: [
      { id: "ITEM-23", category: "Consultation", serviceName: "General Outpatient Consultation", unitPriceETB: 150, quantity: 1, totalETB: 150 },
      { id: "ITEM-24", category: "Procedures", serviceName: "Surgical Wound Dressing & Cleansing", unitPriceETB: 180, quantity: 1, totalETB: 180 },
      { id: "ITEM-25", category: "Laboratory", serviceName: "Urinalysis (Strip + Micro)", unitPriceETB: 90, quantity: 1, totalETB: 90 },
    ],
  },
]

/**
 * Initial Payments & Receipts Dataset
 */
export const INITIAL_PAYMENTS: PaymentReceipt[] = [
  {
    id: "REC-2026-00512",
    invoiceId: "INV-2026-00411",
    patientId: "ORH-2026-0712",
    patientName: "Fatuma Roba",
    paymentDate: "16 Oct 2026 · 10:05 AM",
    amountPaidETB: 565.0,
    paymentMethod: "Telebirr",
    transactionReference: "TB-ET-98241029",
    recordedBy: "Cashier Almaz Kebede",
    status: "Completed",
    previousBalanceETB: 565.0,
    remainingBalanceETB: 0,
    notes: "Full payment confirmed via Ethio Telecom Telebirr API SMS reference.",
  },
  {
    id: "REC-2026-00511",
    invoiceId: "INV-2026-00410",
    patientId: "ORH-2026-0688",
    patientName: "Chaltu Tolosa",
    paymentDate: "15 Oct 2026 · 03:45 PM",
    amountPaidETB: 400.0,
    paymentMethod: "Cash",
    transactionReference: "CASH-DRAWER-01-44",
    recordedBy: "Cashier Almaz Kebede",
    status: "Completed",
    previousBalanceETB: 830.0,
    remainingBalanceETB: 430.0,
    notes: "Partial payment; 4x 100 Birr notes verified and drawer logged.",
  },
  {
    id: "REC-2026-00510",
    invoiceId: "INV-2026-00409",
    patientId: "ORH-2026-0552",
    patientName: "Ahmed Mohammed",
    paymentDate: "15 Oct 2026 · 11:35 AM",
    amountPaidETB: 740.0,
    paymentMethod: "CBE Birr",
    transactionReference: "CBE-TXN-449102",
    recordedBy: "Cashier Almaz Kebede",
    status: "Completed",
    previousBalanceETB: 740.0,
    remainingBalanceETB: 0,
    notes: "Commercial Bank of Ethiopia Birr mobile wallet transfer.",
  },
  {
    id: "REC-2026-00509",
    invoiceId: "INV-2026-00407",
    patientId: "ORH-2026-0311",
    patientName: "Kenenisa Bekele",
    paymentDate: "10 Oct 2026 · 09:30 AM",
    amountPaidETB: 300.0,
    paymentMethod: "Cash",
    transactionReference: "CASH-DRAWER-01-28",
    recordedBy: "Cashier Almaz Kebede",
    status: "Completed",
    previousBalanceETB: 1250.0,
    remainingBalanceETB: 950.0,
    notes: "Initial admission deposit; remaining balance currently overdue.",
  },
]

/**
 * Supported Payment Methods
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Telebirr",
  "CBE Birr",
  "Bank Transfer (CBE)",
  "Other Approved Method",
]

/**
 * Service Categories
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Consultation",
  "Laboratory",
  "Imaging",
  "Medication",
  "Procedures",
  "Inpatient / Bed",
  "Emergency Services",
]

/**
 * Helper to format Ethiopian Birr
 */
export function formatETB(amount: number): string {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
}
