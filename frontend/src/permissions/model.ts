import type { IconName } from "../Icon"

export type Destination = {
  id: string
  label: string
  group: string
  icon: IconName
  action: string
}
export const destinations: Destination[] = [
  {
    id: "registration",
    label: "Patient Registration",
    group: "Patient Operations",
    icon: "user",
    action: "Register patient",
  },
  {
    id: "directory",
    label: "Patient Directory",
    group: "Patient Operations",
    icon: "search",
    action: "Find patient",
  },
  {
    id: "patient-profile",
    label: "Patient Profile",
    group: "Patient Operations",
    icon: "user",
    action: "View patient record",
  },
  {
    id: "appointments",
    label: "Appointments",
    group: "Patient Operations",
    icon: "calendar",
    action: "View appointments",
  },
  {
    id: "queue",
    label: "Queue Management",
    group: "Patient Operations",
    icon: "clock",
    action: "View waiting queue",
  },
  {
    id: "assigned",
    label: "Assigned Patients",
    group: "Clinical Care",
    icon: "user",
    action: "Review assigned patients",
  },
  {
    id: "triage",
    label: "Nurse Dashboard",
    group: "Clinical Care",
    icon: "heart",
    action: "Review nursing queue",
  },
  {
    id: "triage-assessment",
    label: "Triage Assessment",
    group: "Clinical Care",
    icon: "heart",
    action: "Conduct triage assessment",
  },
  {
    id: "consultations",
    label: "Doctor Dashboard",
    group: "Clinical Care",
    icon: "cross",
    action: "Open consultations",
  },
  {
    id: "clinical-workspace",
    label: "Clinical Workspace",
    group: "Clinical Care",
    icon: "edit",
    action: "Conduct clinical consultation",
  },
  {
    id: "diagnosis-management",
    label: "Diagnosis Management",
    group: "Clinical Care",
    icon: "shield",
    action: "Manage encounter diagnoses",
  },
  {
    id: "medical-history",
    label: "Patient Medical History",
    group: "Clinical Care",
    icon: "clock",
    action: "Review patient medical history",
  },
  {
    id: "records",
    label: "Relevant Patient Records",
    group: "Clinical Care",
    icon: "shield",
    action: "Review permitted records",
  },
  {
    id: "orders",
    label: "Laboratory & Imaging Orders",
    group: "Clinical Care",
    icon: "flask",
    action: "Request a diagnostic service",
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    group: "Clinical Care",
    icon: "pill",
    action: "Prepare prescription",
  },
  {
    id: "specimen-collection",
    label: "Specimen Collection & Verification",
    group: "Diagnostics",
    icon: "flask",
    action: "Collect and verify specimens",
  },
  {
    id: "lab-orders",
    label: "Pending Laboratory Orders",
    group: "Diagnostics",
    icon: "flask",
    action: "Review pending orders",
  },
  {
    id: "result-entry",
    label: "Result Entry",
    group: "Diagnostics",
    icon: "edit",
    action: "Enter a result",
  },
  {
    id: "result-review",
    label: "Result Review",
    group: "Diagnostics",
    icon: "check",
    action: "Review results",
  },
  {
    id: "lab-history",
    label: "Laboratory History",
    group: "Diagnostics",
    icon: "clock",
    action: "View authorized history",
  },
  {
    id: "imaging",
    label: "Imaging Requests",
    group: "Diagnostics",
    icon: "scan",
    action: "Review imaging requests",
  },
  {
    id: "imaging-queue",
    label: "Imaging Work Queue",
    group: "Diagnostics",
    icon: "clock",
    action: "Open imaging queue",
  },
  {
    id: "imaging-results",
    label: "Imaging Reports",
    group: "Diagnostics",
    icon: "scan",
    action: "Prepare imaging report",
  },
  {
    id: "pharmacy-dashboard",
    label: "Pharmacy Dashboard",
    group: "Pharmacy & Medication Inventory",
    icon: "pill",
    action: "Open pharmacy dashboard",
  },
  {
    id: "prescription-queue",
    label: "Prescription Queue",
    group: "Pharmacy & Medication Inventory",
    icon: "pill",
    action: "Review prescriptions",
  },
  {
    id: "dispensing",
    label: "Dispensing",
    group: "Pharmacy & Medication Inventory",
    icon: "check",
    action: "Record dispensing",
  },
  {
    id: "medication-stock",
    label: "Medicine Inventory",
    group: "Pharmacy & Medication Inventory",
    icon: "building",
    action: "Review medicine stock",
  },
  {
    id: "stock-movements",
    label: "Stock Movements",
    group: "Pharmacy & Medication Inventory",
    icon: "arrow",
    action: "Review stock movements",
  },
  {
    id: "expiry-monitoring",
    label: "Expiry Monitoring",
    group: "Pharmacy & Medication Inventory",
    icon: "clock",
    action: "Review expiry alerts",
  },
  {
    id: "dispensing-history",
    label: "Dispensing History",
    group: "Pharmacy & Medication Inventory",
    icon: "check",
    action: "View dispensing records",
  },
  {
    id: "stock-alerts",
    label: "Stock Alerts",
    group: "Pharmacy & Medication Inventory",
    icon: "warning",
    action: "Review stock alerts",
  },
  {
    id: "invoices",
    label: "Invoices",
    group: "Financial Operations",
    icon: "edit",
    action: "Review assigned invoices",
  },
  {
    id: "payments",
    label: "Payments",
    group: "Financial Operations",
    icon: "check",
    action: "Record payment",
  },
  {
    id: "payment-history",
    label: "Payment History",
    group: "Financial Operations",
    icon: "clock",
    action: "View transaction history",
  },
  {
    id: "receipts",
    label: "Receipts",
    group: "Financial Operations",
    icon: "edit",
    action: "View relevant receipts",
  },
  {
    id: "inventory",
    label: "Inventory Items",
    group: "Hospital Operations",
    icon: "building",
    action: "Review general inventory",
  },
  {
    id: "movements",
    label: "Stock Movements",
    group: "Hospital Operations",
    icon: "arrow",
    action: "Record stock movement",
  },
  {
    id: "reorder",
    label: "Reorder Alerts",
    group: "Hospital Operations",
    icon: "warning",
    action: "Review reorder thresholds",
  },
  {
    id: "expiry",
    label: "Expiry Monitoring",
    group: "Hospital Operations",
    icon: "clock",
    action: "Review expiry alerts",
  },
  {
    id: "department-queue",
    label: "Department Queue",
    group: "Hospital Operations",
    icon: "clock",
    action: "Review assigned department",
  },
  {
    id: "departments",
    label: "Departments",
    group: "Management & Administration",
    icon: "building",
    action: "Review departments",
  },
  {
    id: "staff",
    label: "Staff Directory",
    group: "Management & Administration",
    icon: "user",
    action: "View authorized staff",
  },
  {
    id: "staff-records",
    label: "Staff Records",
    group: "Management & Administration",
    icon: "edit",
    action: "Manage staff records",
  },
  {
    id: "users",
    label: "Staff & Users",
    group: "Management & Administration",
    icon: "user",
    action: "Manage staff accounts",
  },
  {
    id: "permissions",
    label: "Roles & Permissions",
    group: "Management & Administration",
    icon: "shield",
    action: "Review access configuration",
  },
  {
    id: "audit",
    label: "Audit Logs",
    group: "Management & Administration",
    icon: "shield",
    action: "Review authorized audit events",
  },
  {
    id: "settings",
    label: "System Settings",
    group: "Management & Administration",
    icon: "building",
    action: "Review system configuration",
  },
  {
    id: "hospital-settings",
    label: "Hospital Settings",
    group: "Management & Administration",
    icon: "building",
    action: "Review delegated settings",
  },
  {
    id: "reports",
    label: "Operational Reports",
    group: "Management & Administration",
    icon: "edit",
    action: "View operational reports",
  },
  {
    id: "department-reports",
    label: "Department Reports",
    group: "Management & Administration",
    icon: "edit",
    action: "View department reports",
  },
  {
    id: "performance",
    label: "Department Performance",
    group: "Management & Administration",
    icon: "building",
    action: "Compare aggregate indicators",
  },
  {
    id: "financial-reports",
    label: "Financial Reports",
    group: "Management & Administration",
    icon: "edit",
    action: "View approved financial summary",
  },
  {
    id: "analytics",
    label: "Analytics",
    group: "Management & Administration",
    icon: "search",
    action: "Explore aggregate reports",
  },
]

export type RoleScenario = {
  id: string
  role: string
  home: string
  description: string
  grants: string[]
  tasks: [string, string, string][]
  boundary: string
  decision: string
}
export const roles: RoleScenario[] = [
  {
    id: "reception",
    role: "Receptionist",
    home: "Reception Overview",
    description:
      "A clear starting point for registration, appointments, and patient flow.",
    grants: ["registration", "directory", "patient-profile", "appointments", "queue"],
    tasks: [
      ["Appointment check-in", "Appointments", "Ready for check-in"],
      ["Registration follow-up", "Patient Registration", "Details to complete"],
      ["Waiting queue review", "Queue Management", "Ready for review"],
    ],
    boundary:
      "Demographic information only; no clinical notes, restricted results, or financial reports.",
    decision:
      "Approve demographic fields, duplicate-record handling, and queue scope.",
  },
  {
    id: "nurse",
    role: "Nurse",
    home: "Nurse Dashboard",
    description:
      "Monitor patient flow, complete triage assessments, record vital signs, and prioritize clinical care.",
    grants: ["assigned", "triage", "triage-assessment", "queue", "records", "medical-history", "patient-profile", "directory"],
    tasks: [
      ["Pending triage", "Triage", "Awaiting observations"],
      ["Observation follow-up", "Triage", "Completion needed"],
      [
        "Assigned patient review",
        "Relevant Patient Records",
        "Ready for review",
      ],
    ],
    boundary:
      "Assigned patients and permitted observations only; no prescribing by default.",
    decision:
      "Approve assignment rules, observation editing, and record visibility.",
  },
  {
    id: "doctor",
    role: "Doctor",
    home: "Doctor Dashboard",
    description:
      "Manage assigned patients, open consultations, review diagnostic results, and track daily clinical tasks.",
    grants: ["assigned", "consultations", "clinical-workspace", "diagnosis-management", "medical-history", "records", "orders", "prescriptions", "patient-profile", "directory", "queue"],
    tasks: [
      ["Assigned consultation", "Consultations", "Waiting for review"],
      ["Clinical documentation", "Consultations", "Draft to complete"],
      ["Diagnostic request", "Laboratory & Imaging Orders", "Review needed"],
    ],
    boundary:
      "Assigned clinical scope; no user administration or unrelated records.",
    decision:
      "Approve prescribing, diagnostic ordering, and clinical record scope.",
  },
  {
    id: "lab",
    role: "Laboratory Technician",
    home: "Laboratory Overview",
    description:
      "Confirm patient identity, collect specimens, accession and verify specimens, and prepare diagnostic runs.",
    grants: ["specimen-collection", "lab-orders", "result-entry", "result-review", "lab-history"],
    tasks: [
      [
        "Specimen collection",
        "Specimen Collection & Verification",
        "Awaiting collection",
      ],
      [
        "Pending laboratory order",
        "Pending Laboratory Orders",
        "Awaiting preparation",
      ],
      ["Result entry task", "Result Entry", "Entry pending"],
      ["Result review & approval", "Result Review", "Pending review"],
    ],
    boundary: "Result entry does not grant validation or release authority.",
    decision:
      "Approve validation roles, release authority, and laboratory history scope.",
  },
  {
    id: "radiology",
    role: "Radiology Staff",
    home: "Imaging Overview",
    description:
      "Review authorized imaging requests and coordinate your work queue.",
    grants: ["imaging", "imaging-queue", "imaging-results"],
    tasks: [
      ["Imaging request", "Imaging Requests", "Awaiting review"],
      ["Imaging workflow", "Imaging Work Queue", "Preparation pending"],
      ["Report preparation", "Imaging Reports", "Draft to complete"],
    ],
    boundary:
      "Authorized imaging workflow only; no assumed device or PACS integration.",
    decision:
      "Approve report authoring, validation, and supported attachments.",
  },
  {
    id: "pharmacy",
    role: "Pharmacist",
    home: "Pharmacy Dashboard",
    description:
      "Monitor prescriptions, medicine availability, batch expiries, and pharmacy operations.",
    grants: [
      "pharmacy-dashboard",
      "prescription-queue",
      "medication-stock",
      "stock-movements",
      "expiry-monitoring",
      "dispensing-history",
      "dispensing",
      "stock-alerts",
    ],
    tasks: [
      ["Prescription review", "Prescription Queue", "Awaiting dispensing"],
      ["Stock reorder review", "Medicine Inventory", "Threshold reached"],
      ["Batch expiry inspection", "Expiry Monitoring", "Action required"],
    ],
    boundary: "No diagnosis editing or unrestricted clinical documentation.",
    decision:
      "Approve dispensing authority and medication stock responsibilities.",
  },
  {
    id: "cashier",
    role: "Cashier",
    home: "Cashier Overview",
    description:
      "Keep assigned invoices, payment tasks, and relevant receipts together.",
    grants: ["invoices", "payments", "payment-history", "receipts"],
    tasks: [
      ["Assigned invoice", "Invoices", "Awaiting payment"],
      ["Payment task", "Payments", "Ready to process"],
      ["Receipt review", "Receipts", "Ready for review"],
    ],
    boundary:
      "Assigned billing workflow only; no tariff changes or hospital-wide financial reports.",
    decision: "Approve refunds, receipt printing, and transaction visibility.",
  },
  {
    id: "inventory",
    role: "Inventory Officer",
    home: "Inventory Overview",
    description:
      "Coordinate general stock movements, reorder reviews, and expiry monitoring.",
    grants: ["inventory", "movements", "reorder", "expiry"],
    tasks: [
      ["Stock reconciliation", "Inventory Items", "Review needed"],
      ["Stock movement", "Stock Movements", "Entry pending"],
      ["Expiry review", "Expiry Monitoring", "Review needed"],
    ],
    boundary: "General inventory is separate from medication inventory.",
    decision: "Approve stock adjustment authority and inventory ownership.",
  },
  {
    id: "super",
    role: "Super Administrator",
    home: "System Overview",
    description:
      "Review platform configuration and access governance without default clinical access.",
    grants: [
      "users",
      "permissions",
      "departments",
      "audit",
      "settings",
      "reports",
    ],
    tasks: [
      ["Access configuration", "Roles & Permissions", "Review needed"],
      ["Account provisioning", "Staff & Users", "Awaiting review"],
      ["Audit oversight", "Audit Logs", "Ready for review"],
    ],
    boundary: "Platform administration is not unrestricted clinical access.",
    decision:
      "Approve delegated administration and explicit clinical access exceptions.",
  },
  {
    id: "admin",
    role: "Hospital Administrator",
    home: "Hospital Overview",
    description:
      "Coordinate hospital operations, staff, and delegated configuration.",
    grants: [
      "departments",
      "staff",
      "staff-records",
      "reports",
      "hospital-settings",
    ],
    tasks: [
      ["Department coordination", "Departments", "Review needed"],
      ["Staff coordination", "Staff Directory", "Awaiting review"],
      ["Operational report", "Operational Reports", "Ready for review"],
    ],
    boundary:
      "No default clinical records or audit access; delegated hospital scope only.",
    decision: "Approve configuration limits and any authorized audit access.",
  },
  {
    id: "hr",
    role: "HR / Staff Administrator",
    home: "Staff Overview",
    description:
      "Support authorized staff records and account onboarding coordination.",
    grants: ["staff", "staff-records", "reports"],
    tasks: [
      ["Staff onboarding", "Staff Records", "Details to complete"],
      ["Account status review", "Staff Directory", "Review needed"],
      ["Administrative report", "Operational Reports", "Ready for review"],
    ],
    boundary:
      "Staff administration does not grant patient record access. Reports are staff-scoped.",
    decision: "Approve personnel field visibility and onboarding authority.",
  },
  {
    id: "head",
    role: "Department Head",
    home: "Department Overview",
    description:
      "Coordinate the demonstration department and its permitted work.",
    grants: ["department-queue", "staff", "department-reports"],
    tasks: [
      ["Department queue", "Department Queue", "Review needed"],
      ["Staff coordination", "Staff Directory", "Awaiting review"],
      ["Department report", "Department Reports", "Ready for review"],
    ],
    boundary:
      "Only the assigned demonstration department; no cross-department access.",
    decision:
      "Approve department boundaries, staff visibility, and report scope.",
  },
  {
    id: "management",
    role: "Hospital Management",
    home: "Executive Overview",
    description:
      "Review approved aggregate indicators and department reporting.",
    grants: ["reports", "performance", "financial-reports", "analytics"],
    tasks: [
      ["Operational report", "Operational Reports", "Ready for review"],
      ["Department comparison", "Department Performance", "Review needed"],
      ["Financial summary", "Financial Reports", "Awaiting approval"],
    ],
    boundary: "Aggregate reporting rather than detailed clinical records.",
    decision: "Approve financial report visibility and aggregation thresholds.",
  },
]

// Deliberately separate scenario labels from effective permissions.
export function allowedDestinations(permissions: Set<string>) {
  return destinations.filter((destination) => permissions.has(destination.id))
}
