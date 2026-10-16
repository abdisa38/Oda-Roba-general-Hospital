// Oda Roba Hospital Information Management System (ORHIMS)
// Phase 11: Analytics & Reporting Data Models & Demonstration Seed Data
// Strictly adhering to hospital design guidelines, zero emojis, and Ethiopian healthcare context.

export type ReportingPeriod =
  | "today"
  | "last-7-days"
  | "last-30-days"
  | "this-month"
  | "previous-month"
  | "custom"

export interface PeriodOption {
  id: ReportingPeriod
  label: string
  sublabel: string
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { id: "today", label: "Today", sublabel: "16 Oct 2026" },
  { id: "last-7-days", label: "Last 7 Days", sublabel: "10 Oct – 16 Oct 2026" },
  { id: "last-30-days", label: "Last 30 Days", sublabel: "17 Sep – 16 Oct 2026" },
  { id: "this-month", label: "This Month", sublabel: "01 Oct – 16 Oct 2026" },
  { id: "previous-month", label: "Previous Month", sublabel: "01 Sep – 30 Sep 2026" },
  { id: "custom", label: "Custom Range", sublabel: "Configured period" },
]

export interface OverviewMetrics {
  totalRegisteredPatients: number
  periodVisits: number
  appointmentsScheduled: number
  appointmentsCompleted: number
  appointmentsMissed: number
  currentInpatients: number
  bedOccupancyRate: number
  completedLabTests: number
  paymentsCollectedETB: number
  invoicedTotalETB: number
  outstandingBalancesETB: number
}

export interface MetricInsight {
  id: string
  title: string
  detail: string
  trend: "positive" | "neutral" | "warning"
  metric: string
}

export interface ChartDataPoint {
  label: string
  value: number
  secondary?: number
}

export interface DepartmentOperationalStats {
  id: string
  departmentName: string
  code: string
  visits: number
  admissions: number
  discharges: number
  avgLengthOfStayDays: number
  occupancyRate: number
  staffOnDuty: number
}

export interface ClinicalDiagnosisStat {
  code: string
  diagnosisName: string
  casesCount: number
  percentage: number
  department: string
}

export interface FinancialServiceRevenue {
  serviceCategory: string
  amountInvoicedETB: number
  amountCollectedETB: number
  outstandingETB: number
  collectionRate: number
}

export interface PaymentMethodBreakdown {
  method: string
  amountETB: number
  percentage: number
  transactionsCount: number
}

export interface OutstandingInvoiceItem {
  invoiceNumber: string
  patientMrn: string
  patientName: string
  invoiceDate: string
  totalAmountETB: number
  amountPaidETB: number
  balanceDueETB: number
  status: "unpaid" | "partial" | "overdue"
  department: string
}

export interface ExportHistoryEntry {
  id: string
  reportName: string
  category: "Operations" | "Clinical" | "Financial" | "Custom"
  generatedBy: string
  timestamp: string
  period: string
  format: "PDF" | "CSV" | "Excel"
  fileSize: string
  status: "ready" | "archived"
}

// -------------------------------------------------------------
// DEMONSTRATION SEED DATA (Clean, Realistic for Bale Robe)
// -------------------------------------------------------------

export const DEMO_OVERVIEW_METRICS: OverviewMetrics = {
  totalRegisteredPatients: 3842,
  periodVisits: 1248,
  appointmentsScheduled: 978,
  appointmentsCompleted: 892,
  appointmentsMissed: 86,
  currentInpatients: 78,
  bedOccupancyRate: 83.0,
  completedLabTests: 642,
  paymentsCollectedETB: 482650,
  invoicedTotalETB: 564200,
  outstandingBalancesETB: 81550,
}

export const DEMO_INSIGHTS: MetricInsight[] = [
  {
    id: "ins-1",
    title: "Outpatient Encounters Up 8.4%",
    detail:
      "Internal Medicine & OPD recorded 524 visits, with seasonal acute respiratory presentations in Bale Robe forming the largest clinical segment.",
    trend: "positive",
    metric: "+8.4% vs last period",
  },
  {
    id: "ins-2",
    title: "Emergency Acuity Peak on Weekends",
    detail:
      "Triage resuscitation bays operated at 88% capacity during Saturday and Sunday trauma intake. Median triage-to-doctor response time was 8.2 minutes.",
    trend: "warning",
    metric: "88% peak occupancy",
  },
  {
    id: "ins-3",
    title: "High Appointment Adherence",
    detail:
      "91.2% of scheduled clinic appointments were completed successfully. Only 86 patient cancellations or no-shows were logged across all departments.",
    trend: "positive",
    metric: "91.2% completion rate",
  },
  {
    id: "ins-4",
    title: "Digital Collections Leading at 64.2%",
    detail:
      "Telebirr and CBE Birr account for 64.2% of non-cash payment collections, reducing physical cash reconciliation overhead at cashier counters.",
    trend: "positive",
    metric: "309,950 ETB digital payments",
  },
]

export const DEMO_VISITS_TREND: ChartDataPoint[] = [
  { label: "10 Oct", value: 165, secondary: 140 },
  { label: "11 Oct", value: 178, secondary: 152 },
  { label: "12 Oct", value: 192, secondary: 168 },
  { label: "13 Oct", value: 184, secondary: 160 },
  { label: "14 Oct", value: 172, secondary: 155 },
  { label: "15 Oct", value: 180, secondary: 162 },
  { label: "16 Oct", value: 177, secondary: 155 },
]

export const DEMO_APPOINTMENT_BREAKDOWN: ChartDataPoint[] = [
  { label: "Completed", value: 892 },
  { label: "Missed / No-Show", value: 86 },
  { label: "Rescheduled", value: 42 },
  { label: "Cancelled", value: 18 },
]

export const DEMO_LAB_ACTIVITY_TREND: ChartDataPoint[] = [
  { label: "Hematology (CBC)", value: 245 },
  { label: "Clinical Chemistry", value: 178 },
  { label: "Microbiology & Stains", value: 88 },
  { label: "Parasitology & Stool", value: 74 },
  { label: "Blood Bank & Crossmatch", value: 57 },
]

export const DEMO_DEPARTMENT_STATS: DepartmentOperationalStats[] = [
  {
    id: "DEP-MED",
    departmentName: "Internal Medicine & OPD",
    code: "CLN-MED",
    visits: 524,
    admissions: 38,
    discharges: 34,
    avgLengthOfStayDays: 4.5,
    occupancyRate: 85.0,
    staffOnDuty: 18,
  },
  {
    id: "DEP-EMR",
    departmentName: "Emergency & Trauma Center",
    code: "CLN-EMR",
    visits: 312,
    admissions: 45,
    discharges: 12,
    avgLengthOfStayDays: 1.2,
    occupancyRate: 78.0,
    staffOnDuty: 22,
  },
  {
    id: "DEP-INP",
    departmentName: "Inpatient General Medical & Surgical",
    code: "INP-WRD",
    visits: 186,
    admissions: 52,
    discharges: 48,
    avgLengthOfStayDays: 5.1,
    occupancyRate: 86.4,
    staffOnDuty: 36,
  },
  {
    id: "DEP-MAT",
    departmentName: "Maternity & Obstetric Ward",
    code: "INP-MAT",
    visits: 128,
    admissions: 36,
    discharges: 35,
    avgLengthOfStayDays: 2.8,
    occupancyRate: 75.0,
    staffOnDuty: 16,
  },
  {
    id: "DEP-PED",
    departmentName: "Pediatric & Child Health",
    code: "CLN-PED",
    visits: 98,
    admissions: 22,
    discharges: 20,
    avgLengthOfStayDays: 3.4,
    occupancyRate: 80.0,
    staffOnDuty: 12,
  },
]

export const DEMO_TOP_DIAGNOSES: ClinicalDiagnosisStat[] = [
  {
    code: "CA00",
    diagnosisName: "Acute Upper Respiratory Tract Infection",
    casesCount: 164,
    percentage: 24.2,
    department: "Internal Medicine & OPD",
  },
  {
    code: "1A00",
    diagnosisName: "Bacterial & Viral Acute Gastroenteritis",
    casesCount: 118,
    percentage: 17.4,
    department: "Internal Medicine & OPD",
  },
  {
    code: "BA00",
    diagnosisName: "Essential Primary Hypertension",
    casesCount: 94,
    percentage: 13.9,
    department: "Internal Medicine & OPD",
  },
  {
    code: "ND54",
    diagnosisName: "Trauma, Contusions & Musculoskeletal Injury",
    casesCount: 82,
    percentage: 12.1,
    department: "Emergency & Trauma Center",
  },
  {
    code: "JA00",
    diagnosisName: "Normal Spontaneous Vertex Delivery",
    casesCount: 56,
    percentage: 8.3,
    department: "Maternity Ward",
  },
  {
    code: "5A11",
    diagnosisName: "Type 2 Diabetes Mellitus with Monitoring",
    casesCount: 48,
    percentage: 7.1,
    department: "Internal Medicine & OPD",
  },
]

export const DEMO_SERVICE_REVENUES: FinancialServiceRevenue[] = [
  {
    serviceCategory: "Inpatient Ward & Bed Accommodation",
    amountInvoicedETB: 158000,
    amountCollectedETB: 142300,
    outstandingETB: 15700,
    collectionRate: 90.1,
  },
  {
    serviceCategory: "Outpatient Medical Consultations",
    amountInvoicedETB: 136000,
    amountCollectedETB: 124500,
    outstandingETB: 11500,
    collectionRate: 91.5,
  },
  {
    serviceCategory: "Clinical Diagnostic Laboratory",
    amountInvoicedETB: 112000,
    amountCollectedETB: 98400,
    outstandingETB: 13600,
    collectionRate: 87.9,
  },
  {
    serviceCategory: "Pharmacy Medication Dispensing",
    amountInvoicedETB: 104200,
    amountCollectedETB: 86200,
    outstandingETB: 18000,
    collectionRate: 82.7,
  },
  {
    serviceCategory: "Emergency Resuscitation & Trauma Care",
    amountInvoicedETB: 54000,
    amountCollectedETB: 31250,
    outstandingETB: 22750,
    collectionRate: 57.9,
  },
]

export const DEMO_PAYMENT_METHODS: PaymentMethodBreakdown[] = [
  {
    method: "Telebirr (Ethio Telecom Mobile Money)",
    amountETB: 215800,
    percentage: 44.7,
    transactionsCount: 412,
  },
  {
    method: "Cash (Official Hospital Cashier Notes)",
    amountETB: 152400,
    percentage: 31.6,
    transactionsCount: 320,
  },
  {
    method: "CBE Birr (Commercial Bank of Ethiopia)",
    amountETB: 94150,
    percentage: 19.5,
    transactionsCount: 165,
  },
  {
    method: "Debit Card (EthSwitch POS Terminal)",
    amountETB: 20300,
    percentage: 4.2,
    transactionsCount: 38,
  },
]

export const DEMO_OUTSTANDING_INVOICES: OutstandingInvoiceItem[] = [
  {
    invoiceNumber: "INV-2026-00138",
    patientMrn: "ORH-26-00098",
    patientName: "Dawit Bekele",
    invoiceDate: "12 Oct 2026",
    totalAmountETB: 2450.0,
    amountPaidETB: 1200.0,
    balanceDueETB: 1250.0,
    status: "partial",
    department: "Inpatient General Ward",
  },
  {
    invoiceNumber: "INV-2026-00139",
    patientMrn: "ORH-26-00102",
    patientName: "Chaltu Tolasa",
    invoiceDate: "14 Oct 2026",
    totalAmountETB: 1840.0,
    amountPaidETB: 0.0,
    balanceDueETB: 1840.0,
    status: "unpaid",
    department: "Emergency & Trauma",
  },
  {
    invoiceNumber: "INV-2026-00140",
    patientMrn: "ORH-26-00084",
    patientName: "Hanna Girma",
    invoiceDate: "08 Oct 2026",
    totalAmountETB: 3100.0,
    amountPaidETB: 1500.0,
    balanceDueETB: 1600.0,
    status: "overdue",
    department: "Surgical Ward",
  },
  {
    invoiceNumber: "INV-2026-00143",
    patientMrn: "ORH-26-00115",
    patientName: "Mohammed Kedir",
    invoiceDate: "15 Oct 2026",
    totalAmountETB: 920.0,
    amountPaidETB: 400.0,
    balanceDueETB: 520.0,
    status: "partial",
    department: "Internal Medicine OPD",
  },
]

export const DEMO_EXPORT_HISTORY: ExportHistoryEntry[] = [
  {
    id: "EXP-2026-0042",
    reportName: "Hospital Monthly Operational Census & Performance Report",
    category: "Operations",
    generatedBy: "Dr. Yohannes Haile (Medical Director)",
    timestamp: "16 Oct 2026, 17:30 EAT",
    period: "01 Oct 2026 – 16 Oct 2026",
    format: "PDF",
    fileSize: "1.4 MB",
    status: "ready",
  },
  {
    id: "EXP-2026-0041",
    reportName: "Inpatient Bed Occupancy & Average Length of Stay Audit",
    category: "Operations",
    generatedBy: "Sister Bethlehem Worku (Ward Head)",
    timestamp: "15 Oct 2026, 18:15 EAT",
    period: "Last 30 Days",
    format: "Excel",
    fileSize: "840 KB",
    status: "ready",
  },
  {
    id: "EXP-2026-0040",
    reportName: "Pharmacy Dispensing Volumes & Medication Stock Movement",
    category: "Operations",
    generatedBy: "Hiwot Bekele (Dispensary Lead)",
    timestamp: "14 Oct 2026, 16:45 EAT",
    period: "Last 7 Days",
    format: "CSV",
    fileSize: "412 KB",
    status: "ready",
  },
  {
    id: "EXP-2026-0039",
    reportName: "Cashier Collections & Digital Bank Reconciliation Statement",
    category: "Financial",
    generatedBy: "Almaz Kebede (Hospital Cashier)",
    timestamp: "13 Oct 2026, 19:10 EAT",
    period: "01 Oct 2026 – 13 Oct 2026",
    format: "PDF",
    fileSize: "980 KB",
    status: "ready",
  },
  {
    id: "EXP-2026-0038",
    reportName: "Emergency Trauma & Triage Acuity Distribution Summary",
    category: "Clinical",
    generatedBy: "Dr. Aster Lemma (Emergency Lead)",
    timestamp: "12 Oct 2026, 15:20 EAT",
    period: "Last 30 Days",
    format: "PDF",
    fileSize: "1.1 MB",
    status: "ready",
  },
]
