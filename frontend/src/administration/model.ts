// Oda Roba Hospital Information Management System (ORHIMS)
// Phase 10: Administration & System Management Data Models & Demonstration Seed Data
// Strictly adhering to hospital design guidelines, least-privilege security, and zero emojis.

export type AdminUserStatus = "active" | "inactive" | "suspended"

export type AdminUser = {
  id: string
  name: string
  username: string
  staffId: string
  email: string
  phone: string
  departmentId: string
  departmentName: string
  roleId: string
  roleName: string
  status: AdminUserStatus
  lastLogin: string
  createdAt: string
  isProtectedAdmin?: boolean
  twoFactorEnabled: boolean
  notes: string
}

export type PermissionAction = "view" | "create" | "edit" | "approve" | "complete" | "export" | "configure"

export type PermissionModuleDef = {
  key: string
  name: string
  description: string
  supportedActions: PermissionAction[]
}

export const PERMISSION_MODULES: PermissionModuleDef[] = [
  {
    key: "patient_mgmt",
    name: "Patient Management",
    description: "Registration, patient directory, demographics, and identification wristbands",
    supportedActions: ["view", "create", "edit", "export"],
  },
  {
    key: "appointments",
    name: "Appointments & Encounters",
    description: "Scheduling, clinic queues, reception check-ins, and visit triage",
    supportedActions: ["view", "create", "edit", "complete"],
  },
  {
    key: "clinical_records",
    name: "Clinical Records & Consultations",
    description: "Doctor evaluations, medical diagnoses, consultation notes, and history",
    supportedActions: ["view", "create", "edit", "approve", "export"],
  },
  {
    key: "laboratory",
    name: "Laboratory & Diagnostics",
    description: "Lab order requests, specimen collection, result entry, and clinical validation",
    supportedActions: ["view", "create", "edit", "approve", "export"],
  },
  {
    key: "pharmacy",
    name: "Pharmacy & Medication Stock",
    description: "Prescription queue, medication dispensing, stock movements, and inventory",
    supportedActions: ["view", "create", "edit", "approve", "complete", "export"],
  },
  {
    key: "inpatient_emergency",
    name: "Inpatient & Emergency",
    description: "Emergency arrivals, triage acuity, ward occupancy, bed allocation, and discharges",
    supportedActions: ["view", "create", "edit", "approve", "complete"],
  },
  {
    key: "billing_finance",
    name: "Billing & Financial Operations",
    description: "Patient billing, invoice generation, payment receipts, and financial reports",
    supportedActions: ["view", "create", "edit", "approve", "export"],
  },
  {
    key: "user_admin",
    name: "User & Access Administration",
    description: "Staff account provisioning, status management, role assignments, and credential recovery",
    supportedActions: ["view", "create", "edit", "configure"],
  },
  {
    key: "department_mgmt",
    name: "Department Management",
    description: "Hospital department organizational hierarchy, service assignments, and heads",
    supportedActions: ["view", "create", "edit", "configure"],
  },
  {
    key: "hospital_config",
    name: "Hospital Configuration",
    description: "Institutional identity, regional localization, numbering sequences, and facility profile",
    supportedActions: ["view", "edit", "configure"],
  },
  {
    key: "audit_security",
    name: "Audit Logs & Security Monitoring",
    description: "Immutable event audit trails, authentication logs, and compliance oversight",
    supportedActions: ["view", "export"],
  },
]

export type AdminRole = {
  id: string
  name: string
  description: string
  userCount: number
  status: "active" | "draft"
  lastUpdated: string
  isSystemProtected?: boolean
  permissions: Record<string, PermissionAction[]>
}

export type DepartmentType = "clinical" | "diagnostic" | "inpatient" | "support" | "administrative"

export type AdminDepartment = {
  id: string
  code: string
  name: string
  type: DepartmentType
  headOfDepartment: string
  staffCount: number
  location: string
  phone: string
  status: "active" | "inactive"
  establishedDate: string
  description: string
}

export type HospitalProfile = {
  name: string
  institutionType: string
  location: string
  postalAddress: string
  phone: string
  emergencyHotline: string
  email: string
  website: string
  facilityLicense: string
  mohFacilityCode: string
}

export type LocalizationSettings = {
  timeZone: string
  primaryLanguage: string
  secondaryLanguages: string[]
  calendarSystem: string
  dateFormat: string
  timeFormat: string
  currency: string
  numberFormat: string
}

export type OperationalNumbering = {
  patientMrnPattern: string
  encounterPrefix: string
  admissionPrefix: string
  invoicePrefix: string
  receiptPrefix: string
  labOrderPrefix: string
  prescriptionPrefix: string
}

export type AuditLogEntry = {
  id: string
  timestamp: string
  actor: string
  actorRole: string
  ipAddress: string
  module: string
  action: string
  recordType: string
  recordReference: string
  outcome: "success" | "warning" | "failure"
  details: string
  diff?: { field: string; before: string; after: string }[]
}

export type SystemSettings = {
  systemName: string
  environmentTag: string
  supportContactEmail: string
  sessionTimeoutMinutes: number
  passwordMinLength: number
  requireSpecialChars: boolean
  accountLockoutAttempts: number
  mfaEnforcement: "disabled" | "admin_only" | "all_staff"
  sessionIdleTimeout: number
  inAppNotifications: boolean
  smsEmergencyAlerts: boolean
  emailSummaries: boolean
  clinicalRecordRetentionYears: number
  auditLogRetentionYears: number
  automatedDailyBackupTime: string
  lastBackupTimestamp: string
  applicationVersion: string
  databaseEngine: string
  systemStatus: string
  activeConnections: number
}

// -------------------------------------------------------------
// DEMONSTRATION SEED DATA (Clean, Fictional, Realistic Healthcare)
// -------------------------------------------------------------

export const DEMO_ADMIN_USERS: AdminUser[] = [
  {
    id: "USR-001",
    name: "Dr. Yohannes Haile",
    username: "admin",
    staffId: "ORH-ADM-001",
    email: "admin@orhims.et",
    phone: "+251 91 123 4560",
    departmentId: "DEP-MGT",
    departmentName: "Hospital Executive Management",
    roleId: "role-admin",
    roleName: "System & Hospital Administrator",
    status: "active",
    lastLogin: "Today, 17:42 EAT",
    createdAt: "12 Jan 2025",
    isProtectedAdmin: true,
    twoFactorEnabled: true,
    notes: "Primary executive administrator account. Protected against accidental deactivation.",
  },
  {
    id: "USR-002",
    name: "Dr. Daniel Abate, MD",
    username: "doctor",
    staffId: "ORH-DOC-009",
    email: "doctor@orhims.et",
    phone: "+251 92 234 5671",
    departmentId: "DEP-MED",
    departmentName: "Internal Medicine & OPD",
    roleId: "role-doctor",
    roleName: "Consultant Physician",
    status: "active",
    lastLogin: "Today, 16:30 EAT",
    createdAt: "15 Jan 2025",
    twoFactorEnabled: true,
    notes: "Senior clinical consultant with outpatient care and prescription authorization privileges.",
  },
  {
    id: "USR-003",
    name: "Nurse Rahel Kebede, B.Sc.",
    username: "nurse",
    staffId: "ORH-NR-042",
    email: "nurse@orhims.et",
    phone: "+251 93 345 6782",
    departmentId: "DEP-OPD",
    departmentName: "OPD & Triage Unit",
    roleId: "role-nurse",
    roleName: "Senior Triage & OPD Nurse",
    status: "active",
    lastLogin: "Today, 17:15 EAT",
    createdAt: "18 Jan 2025",
    twoFactorEnabled: false,
    notes: "Triage coordinator responsible for vital measurements and OPD nursing queue.",
  },
  {
    id: "USR-004",
    name: "Dr. Aster Lemma, MD",
    username: "emergency",
    staffId: "ORH-EM-011",
    email: "emergency@orhims.et",
    phone: "+251 91 456 7893",
    departmentId: "DEP-EMR",
    departmentName: "Emergency & Trauma Center",
    roleId: "role-emergency",
    roleName: "Emergency Department Lead",
    status: "active",
    lastLogin: "Today, 17:35 EAT",
    createdAt: "22 Jan 2025",
    twoFactorEnabled: true,
    notes: "Trauma and resuscitation team lead with emergency triage authorization.",
  },
  {
    id: "USR-005",
    name: "Sister Bethlehem Worku, RN",
    username: "inpatient",
    staffId: "ORH-IP-027",
    email: "inpatient@orhims.et",
    phone: "+251 92 567 8904",
    departmentId: "DEP-INP",
    departmentName: "Inpatient Services & Bed Coordination",
    roleId: "role-inpatient",
    roleName: "Inpatient Ward Head Nurse",
    status: "active",
    lastLogin: "Today, 17:10 EAT",
    createdAt: "25 Jan 2025",
    twoFactorEnabled: false,
    notes: "Ward coordinator overseeing bed occupancy, admissions, and discharge clearances.",
  },
  {
    id: "USR-006",
    name: "Tewodros Girma",
    username: "lab",
    staffId: "ORH-LAB-015",
    email: "lab@orhims.et",
    phone: "+251 93 678 9015",
    departmentId: "DEP-LAB",
    departmentName: "Clinical Diagnostic Laboratory",
    roleId: "role-lab",
    roleName: "Senior Laboratory Technologist",
    status: "active",
    lastLogin: "Today, 15:45 EAT",
    createdAt: "01 Feb 2025",
    twoFactorEnabled: true,
    notes: "Laboratory supervisor handling specimen validations and critical result approvals.",
  },
  {
    id: "USR-007",
    name: "Hiwot Bekele",
    username: "pharmacy",
    staffId: "ORH-PHARM-007",
    email: "pharmacy@orhims.et",
    phone: "+251 94 789 0126",
    departmentId: "DEP-PHM",
    departmentName: "Main Outpatient Pharmacy",
    roleId: "role-pharmacy",
    roleName: "Dispensary Pharmacist",
    status: "active",
    lastLogin: "Today, 16:50 EAT",
    createdAt: "05 Feb 2025",
    twoFactorEnabled: false,
    notes: "Dispensary lead for outpatient medications and stock receiving.",
  },
  {
    id: "USR-008",
    name: "Almaz Kebede",
    username: "cashier",
    staffId: "ORH-CSH-021",
    email: "cashier@orhims.et",
    phone: "+251 91 890 1237",
    departmentId: "DEP-FIN",
    departmentName: "Finance & Patient Billing",
    roleId: "role-cashier",
    roleName: "Hospital Billing Cashier",
    status: "active",
    lastLogin: "Today, 17:05 EAT",
    createdAt: "10 Feb 2025",
    twoFactorEnabled: false,
    notes: "Billing counter officer managing patient invoices, receipts, and cash reconciliations.",
  },
  {
    id: "USR-009",
    name: "Almaz Tadesse",
    username: "reception",
    staffId: "ORH-REC-018",
    email: "reception@orhims.et",
    phone: "+251 92 901 2348",
    departmentId: "DEP-REC",
    departmentName: "Front Desk & Admissions",
    roleId: "role-reception",
    roleName: "Reception & Admissions Officer",
    status: "active",
    lastLogin: "Today, 16:20 EAT",
    createdAt: "12 Feb 2025",
    twoFactorEnabled: false,
    notes: "Front desk intake officer responsible for patient check-ins and appointments.",
  },
  {
    id: "USR-010",
    name: "Kassahun Desta",
    username: "kassahun.d",
    staffId: "ORH-IT-004",
    email: "kassahun.d@orhims.et",
    phone: "+251 93 012 3459",
    departmentId: "DEP-IT",
    departmentName: "Health Information Technology (HIT)",
    roleId: "role-admin",
    roleName: "System & Hospital Administrator",
    status: "active",
    lastLogin: "Yesterday, 14:15 EAT",
    createdAt: "01 Mar 2025",
    twoFactorEnabled: true,
    notes: "HIT infrastructure engineer and secondary system administrator.",
  },
  {
    id: "USR-011",
    name: "Tigist Alemu, B.Sc.",
    username: "tigist.a",
    staffId: "ORH-NR-055",
    email: "tigist.a@orhims.et",
    phone: "+251 94 123 4567",
    departmentId: "DEP-INP",
    departmentName: "Inpatient Services & Bed Coordination",
    roleId: "role-nurse",
    roleName: "Senior Triage & OPD Nurse",
    status: "inactive",
    lastLogin: "14 Sep 2026",
    createdAt: "20 Apr 2025",
    twoFactorEnabled: false,
    notes: "On study leave for advanced clinical nursing training. Account retained per hospital policy.",
  },
  {
    id: "USR-012",
    name: "Biruk Mengistu",
    username: "biruk.m",
    staffId: "ORH-LOG-012",
    email: "biruk.m@orhims.et",
    phone: "+251 91 234 5678",
    departmentId: "DEP-LOG",
    departmentName: "Hospital Logistics & Store",
    roleId: "role-reception",
    roleName: "Reception & Admissions Officer",
    status: "suspended",
    lastLogin: "02 Oct 2026",
    createdAt: "10 May 2025",
    twoFactorEnabled: false,
    notes: "Suspended pending departmental transfer verification. Login temporarily restricted.",
  },
]

export const DEMO_ADMIN_ROLES: AdminRole[] = [
  {
    id: "role-admin",
    name: "System & Hospital Administrator",
    description: "Complete institutional oversight, user management, permissions, and system maintenance.",
    userCount: 2,
    status: "active",
    lastUpdated: "16 Oct 2026",
    isSystemProtected: true,
    permissions: {
      patient_mgmt: ["view", "create", "edit", "export"],
      appointments: ["view", "create", "edit", "complete"],
      clinical_records: ["view", "export"],
      laboratory: ["view", "export"],
      pharmacy: ["view", "export"],
      inpatient_emergency: ["view", "approve"],
      billing_finance: ["view", "approve", "export"],
      user_admin: ["view", "create", "edit", "configure"],
      department_mgmt: ["view", "create", "edit", "configure"],
      hospital_config: ["view", "edit", "configure"],
      audit_security: ["view", "export"],
    },
  },
  {
    id: "role-doctor",
    name: "Consultant Physician",
    description: "Clinical examinations, diagnoses, clinical notes, lab requests, and medication prescriptions.",
    userCount: 7,
    status: "active",
    lastUpdated: "12 Oct 2026",
    permissions: {
      patient_mgmt: ["view", "edit"],
      appointments: ["view", "complete"],
      clinical_records: ["view", "create", "edit", "approve", "export"],
      laboratory: ["view", "create"],
      pharmacy: ["view", "create"],
      inpatient_emergency: ["view", "approve", "complete"],
      billing_finance: ["view"],
    },
  },
  {
    id: "role-nurse",
    name: "Senior Triage & OPD Nurse",
    description: "Patient intake, vital measurements, triage acuity assessment, and care coordination.",
    userCount: 14,
    status: "active",
    lastUpdated: "10 Oct 2026",
    permissions: {
      patient_mgmt: ["view", "edit"],
      appointments: ["view", "complete"],
      clinical_records: ["view", "create"],
      laboratory: ["view", "create"],
      inpatient_emergency: ["view", "create", "edit"],
    },
  },
  {
    id: "role-emergency",
    name: "Emergency Department Lead",
    description: "Rapid trauma arrivals, 5-tier triage classification, resuscitation, and urgent admissions.",
    userCount: 4,
    status: "active",
    lastUpdated: "15 Oct 2026",
    permissions: {
      patient_mgmt: ["view", "create", "edit"],
      clinical_records: ["view", "create", "edit", "approve"],
      laboratory: ["view", "create"],
      pharmacy: ["view", "create"],
      inpatient_emergency: ["view", "create", "edit", "approve", "complete"],
      billing_finance: ["view"],
    },
  },
  {
    id: "role-inpatient",
    name: "Inpatient Ward Head Nurse",
    description: "Ward census oversight, bed allocations, patient transfers, and discharge clearances.",
    userCount: 5,
    status: "active",
    lastUpdated: "16 Oct 2026",
    permissions: {
      patient_mgmt: ["view", "edit"],
      clinical_records: ["view"],
      inpatient_emergency: ["view", "create", "edit", "approve", "complete"],
      pharmacy: ["view"],
      billing_finance: ["view"],
    },
  },
  {
    id: "role-lab",
    name: "Senior Laboratory Technologist",
    description: "Diagnostic order intake, specimen collection, result entry, and clinical review validation.",
    userCount: 6,
    status: "active",
    lastUpdated: "08 Oct 2026",
    permissions: {
      patient_mgmt: ["view"],
      laboratory: ["view", "create", "edit", "approve", "export"],
    },
  },
  {
    id: "role-pharmacy",
    name: "Dispensary Pharmacist",
    description: "Prescription verification, medication dispensing, stock receiving, and inventory control.",
    userCount: 5,
    status: "active",
    lastUpdated: "09 Oct 2026",
    permissions: {
      patient_mgmt: ["view"],
      pharmacy: ["view", "create", "edit", "approve", "complete", "export"],
      billing_finance: ["view"],
    },
  },
  {
    id: "role-cashier",
    name: "Hospital Billing Cashier",
    description: "Patient invoice generation, fee receipting, payment processing, and cashier balancing.",
    userCount: 4,
    status: "active",
    lastUpdated: "11 Oct 2026",
    permissions: {
      patient_mgmt: ["view"],
      billing_finance: ["view", "create", "edit", "approve", "export"],
    },
  },
  {
    id: "role-reception",
    name: "Reception & Admissions Officer",
    description: "Patient registration, appointment booking, queue management, and demographic verification.",
    userCount: 6,
    status: "active",
    lastUpdated: "05 Oct 2026",
    permissions: {
      patient_mgmt: ["view", "create", "edit"],
      appointments: ["view", "create", "edit", "complete"],
      inpatient_emergency: ["view", "create"],
    },
  },
]

export const DEMO_ADMIN_DEPARTMENTS: AdminDepartment[] = [
  {
    id: "DEP-MGT",
    code: "ADM-MGT",
    name: "Hospital Executive Management",
    type: "administrative",
    headOfDepartment: "Dr. Yohannes Haile",
    staffCount: 6,
    location: "Administration Block, Level 2",
    phone: "+251 22 665 0100",
    status: "active",
    establishedDate: "10 Sep 2018",
    description: "Overall clinical leadership, governance, institutional planning, and regulatory compliance.",
  },
  {
    id: "DEP-EMR",
    code: "CLN-EMR",
    name: "Emergency & Trauma Center",
    type: "clinical",
    headOfDepartment: "Dr. Aster Lemma, MD",
    staffCount: 22,
    location: "Emergency Wing, Ground Level",
    phone: "+251 22 665 0199",
    status: "active",
    establishedDate: "15 Oct 2018",
    description: "24/7 acute trauma care, triage resuscitation bays, and emergency admissions.",
  },
  {
    id: "DEP-MED",
    code: "CLN-MED",
    name: "Internal Medicine & OPD",
    type: "clinical",
    headOfDepartment: "Dr. Daniel Abate, MD",
    staffCount: 18,
    location: "Clinical Block A, Rooms 101–114",
    phone: "+251 22 665 0102",
    status: "active",
    establishedDate: "15 Oct 2018",
    description: "Adult general medicine, chronic disease management, and specialized medical consultations.",
  },
  {
    id: "DEP-INP",
    code: "INP-WRD",
    name: "Inpatient Services & Bed Coordination",
    type: "inpatient",
    headOfDepartment: "Sister Bethlehem Worku, RN",
    staffCount: 36,
    location: "Inpatient Pavilions A & B",
    phone: "+251 22 665 0108",
    status: "active",
    establishedDate: "20 Nov 2018",
    description: "Medical, surgical, pediatric, maternity, and ICU inpatient beds and clinical nursing care.",
  },
  {
    id: "DEP-LAB",
    code: "DGN-LAB",
    name: "Clinical Diagnostic Laboratory",
    type: "diagnostic",
    headOfDepartment: "Tewodros Girma",
    staffCount: 12,
    location: "Diagnostic Wing, Level 1",
    phone: "+251 22 665 0104",
    status: "active",
    establishedDate: "01 Dec 2018",
    description: "Hematology, clinical chemistry, microbiology, parasitology, and blood banking.",
  },
  {
    id: "DEP-PHM",
    code: "SUP-PHM",
    name: "Main Outpatient Pharmacy",
    type: "support",
    headOfDepartment: "Hiwot Bekele",
    staffCount: 10,
    location: "Central Concourse, Room 10",
    phone: "+251 22 665 0106",
    status: "active",
    establishedDate: "01 Dec 2018",
    description: "Medication dispensing, prescription validation, drug safety checks, and stock storage.",
  },
  {
    id: "DEP-FIN",
    code: "ADM-FIN",
    name: "Finance & Patient Billing",
    type: "administrative",
    headOfDepartment: "Almaz Kebede",
    staffCount: 8,
    location: "Patient Services Building, Counters 1–4",
    phone: "+251 22 665 0110",
    status: "active",
    establishedDate: "15 Oct 2018",
    description: "Patient invoicing, cashier payment collection, insurance clearing, and fiscal audit.",
  },
  {
    id: "DEP-REC",
    code: "ADM-REC",
    name: "Front Desk & Admissions",
    type: "administrative",
    headOfDepartment: "Almaz Tadesse",
    staffCount: 9,
    location: "Hospital Main Lobby",
    phone: "+251 22 665 0101",
    status: "active",
    establishedDate: "15 Oct 2018",
    description: "Initial patient registration, appointment scheduling, visitor desk, and queue directing.",
  },
  {
    id: "DEP-IT",
    code: "SUP-HIT",
    name: "Health Information Technology (HIT)",
    type: "support",
    headOfDepartment: "Kassahun Desta",
    staffCount: 5,
    location: "IT Operations Center, Room 204",
    phone: "+251 22 665 0115",
    status: "active",
    establishedDate: "05 Jan 2019",
    description: "Hospital network, server infrastructure, terminal support, and ORHIMS deployment.",
  },
]

export const DEMO_HOSPITAL_PROFILE: HospitalProfile = {
  name: "Oda Roba General Hospital",
  institutionType: "Public General & Zonal Referral Hospital",
  location: "Bale Robe, Oromia Regional State, Ethiopia",
  postalAddress: "P.O. Box 42, Robe, Bale Zone, Ethiopia",
  phone: "+251 22 665 0100",
  emergencyHotline: "+251 22 665 0199 / 907",
  email: "info@orhims.et",
  website: "www.odarobahospital.gov.et",
  facilityLicense: "MOH-ET/OR-2018-842",
  mohFacilityCode: "ET-OR-BAL-004",
}

export const DEMO_LOCALIZATION_SETTINGS: LocalizationSettings = {
  timeZone: "Africa/Addis_Ababa (EAT UTC+3)",
  primaryLanguage: "English (Clinical Documentation Standard)",
  secondaryLanguages: ["Afaan Oromoo", "Amharic"],
  calendarSystem: "Gregorian (Primary Record) with Ethiopian Calendar Reference",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24-Hour (Hospital Standard)",
  currency: "ETB - Ethiopian Birr (Br)",
  numberFormat: "1,234.56",
}

export const DEMO_OPERATIONAL_NUMBERING: OperationalNumbering = {
  patientMrnPattern: "ORH-YY-XXXXX (e.g. ORH-26-00104)",
  encounterPrefix: "ENC- (e.g. ENC-2026-0042)",
  admissionPrefix: "ADM- (e.g. ADM-2026-0018)",
  invoicePrefix: "INV-2026- (e.g. INV-2026-00142)",
  receiptPrefix: "RCT- (e.g. RCT-2026-0089)",
  labOrderPrefix: "LAB- (e.g. LAB-2026-0075)",
  prescriptionPrefix: "RX- (e.g. RX-2026-0091)",
}

export const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-94021",
    timestamp: "16 Oct 2026, 17:42:10 EAT",
    actor: "Dr. Yohannes Haile (admin)",
    actorRole: "System & Hospital Administrator",
    ipAddress: "10.12.4.15 (Terminal Admin-01)",
    module: "User Management",
    action: "Staff Account Role Modified",
    recordType: "Staff User",
    recordReference: "USR-005 (Sister Bethlehem Worku)",
    outcome: "success",
    details: "Assigned role updated from Senior Nurse to Inpatient Ward Head Nurse with ward management grants.",
    diff: [
      { field: "roleId", before: "role-nurse", after: "role-inpatient" },
      { field: "departmentId", before: "DEP-OPD", after: "DEP-INP" },
    ],
  },
  {
    id: "AUD-94020",
    timestamp: "16 Oct 2026, 17:28:44 EAT",
    actor: "Sister Bethlehem Worku (inpatient)",
    actorRole: "Inpatient Ward Head Nurse",
    ipAddress: "10.12.6.22 (Station Inpatient-03)",
    module: "Inpatient & Emergency",
    action: "Inpatient Bed Assigned",
    recordType: "Bed Allocation",
    recordReference: "BED-MED-04 -> Patient P-00104",
    outcome: "success",
    details: "Patient Gemechu Tufa assigned to Medical Ward Bed MED-04 following emergency admission referral.",
  },
  {
    id: "AUD-94019",
    timestamp: "16 Oct 2026, 16:55:02 EAT",
    actor: "Dr. Aster Lemma (emergency)",
    actorRole: "Emergency Department Lead",
    ipAddress: "10.12.5.10 (Resuscitation Bay-01)",
    module: "Inpatient & Emergency",
    action: "Emergency Triage Finalized",
    recordType: "Triage Assessment",
    recordReference: "TRG-2026-0038 (Patient Chaltu Tolasa)",
    outcome: "success",
    details: "Priority Red (Immediate) confirmed. Resuscitation bay allocated. ICU transfer alert dispatched.",
  },
  {
    id: "AUD-94018",
    timestamp: "16 Oct 2026, 16:15:20 EAT",
    actor: "Almaz Kebede (cashier)",
    actorRole: "Hospital Billing Cashier",
    ipAddress: "10.12.7.05 (Cashier Counter-02)",
    module: "Billing & Finance",
    action: "Invoice Payment Processed",
    recordType: "Invoice Receipt",
    recordReference: "INV-2026-00142 -> RCT-2026-0089",
    outcome: "success",
    details: "Recorded cash receipt of 840.00 ETB for emergency trauma consultation and laboratory tests.",
  },
  {
    id: "AUD-94017",
    timestamp: "16 Oct 2026, 15:40:12 EAT",
    actor: "Kassahun Desta (admin)",
    actorRole: "System & Hospital Administrator",
    ipAddress: "10.12.4.18 (Terminal IT-02)",
    module: "Hospital Configuration",
    action: "Operational Sequence Inspected",
    recordType: "Numbering Configuration",
    recordReference: "System Operational Settings",
    outcome: "success",
    details: "Verified invoice prefix sequence INV-2026-XXXXX continuity across financial counters.",
  },
  {
    id: "AUD-94016",
    timestamp: "16 Oct 2026, 14:12:05 EAT",
    actor: "Unknown / Failed Auth",
    actorRole: "Unauthenticated Session",
    ipAddress: "192.168.1.108 (External Gateway)",
    module: "User & Access Administration",
    action: "Sign-In Attempt Failed",
    recordType: "Security Event",
    recordReference: "Account: admin-service",
    outcome: "warning",
    details: "Invalid password attempt for non-existent administrative account. IP flagged for temporary cooldown.",
  },
  {
    id: "AUD-94015",
    timestamp: "16 Oct 2026, 12:30:19 EAT",
    actor: "Dr. Yohannes Haile (admin)",
    actorRole: "System & Hospital Administrator",
    ipAddress: "10.12.4.15 (Terminal Admin-01)",
    module: "Roles & Permissions",
    action: "Permission Matrix Saved",
    recordType: "Role Definition",
    recordReference: "role-emergency (Emergency Lead)",
    outcome: "success",
    details: "Granted inpatient admission sign-off privileges to Emergency Department Lead.",
  },
]

export const DEMO_SYSTEM_SETTINGS: SystemSettings = {
  systemName: "Oda Roba Hospital Information Management System (ORHIMS)",
  environmentTag: "Production (Bale Robe On-Premises & Zonal Cluster)",
  supportContactEmail: "hit-support@orhims.et",
  sessionTimeoutMinutes: 30,
  passwordMinLength: 10,
  requireSpecialChars: true,
  accountLockoutAttempts: 5,
  mfaEnforcement: "admin_only",
  sessionIdleTimeout: 15,
  inAppNotifications: true,
  smsEmergencyAlerts: true,
  emailSummaries: false,
  clinicalRecordRetentionYears: 25,
  auditLogRetentionYears: 10,
  automatedDailyBackupTime: "02:00 EAT",
  lastBackupTimestamp: "16 Oct 2026, 02:00:14 EAT - 428 MB Verified (Local NAS + Offsite)",
  applicationVersion: "ORHIMS v2.4.0 (Enterprise Release)",
  databaseEngine: "Node.js 20 LTS + MongoDB 7.0 Cluster",
  systemStatus: "Operational (All 12 Service Daemons Healthy)",
  activeConnections: 28,
}
