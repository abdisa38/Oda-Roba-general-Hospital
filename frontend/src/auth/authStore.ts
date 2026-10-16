export type StaffRole =
  | "nurse"
  | "reception"
  | "doctor"
  | "lab"
  | "pharmacy"
  | "cashier"
  | "records"
  | "head"
  | "management"
  | "emergency"
  | "inpatient"
  | "admin"

export type StaffUser = {
  id: string
  identifier: string
  name: string
  role: StaffRole
  roleTitle: string
  department: string
  staffId: string
  email: string
  avatarInitials: string
  dashboardPath: string
}

export const DEMO_ACCOUNTS: (StaffUser & { password: string; description: string })[] = [
  {
    id: "user-nurse",
    identifier: "nurse",
    password: "nurse",
    name: "Nurse Rahel Kebede, B.Sc.",
    role: "nurse",
    roleTitle: "Senior Triage & OPD Nurse",
    department: "OPD & Triage Unit",
    staffId: "ORH-NR-042",
    email: "nurse@orhims.et",
    avatarInitials: "RK",
    dashboardPath: "/staff/nurse",
    description: "Triage assessments, vital signs documentation, and patient queue monitoring.",
  },
  {
    id: "user-reception",
    identifier: "reception",
    password: "reception",
    name: "Almaz Tadesse",
    role: "reception",
    roleTitle: "Reception & Admissions Officer",
    department: "Front Desk & Admissions",
    staffId: "ORH-REC-018",
    email: "reception@orhims.et",
    avatarInitials: "AT",
    dashboardPath: "/staff/reception",
    description: "Patient registration, appointment scheduling, and reception queue check-ins.",
  },
  {
    id: "user-doctor",
    identifier: "doctor",
    password: "doctor",
    name: "Dr. Daniel Abate, MD",
    role: "doctor",
    roleTitle: "Consultant Physician",
    department: "Internal Medicine & OPD",
    staffId: "ORH-DOC-009",
    email: "doctor@orhims.et",
    avatarInitials: "DA",
    dashboardPath: "/staff/doctor",
    description: "Clinical consultations, diagnostic orders, and prescriptions.",
  },
  {
    id: "user-lab",
    identifier: "lab",
    password: "lab",
    name: "Tewodros Girma",
    role: "lab",
    roleTitle: "Senior Laboratory Technologist",
    department: "Clinical Diagnostic Laboratory",
    staffId: "ORH-LAB-015",
    email: "lab@orhims.et",
    avatarInitials: "TG",
    dashboardPath: "/staff/permissions/module/result-entry",
    description: "Specimen processing, result entry, and diagnostic verifications.",
  },
  {
    id: "user-pharmacy",
    identifier: "pharmacy",
    password: "pharmacy",
    name: "Hiwot Bekele",
    role: "pharmacy",
    roleTitle: "Dispensary Pharmacist",
    department: "Main Outpatient Pharmacy",
    staffId: "ORH-PHARM-007",
    email: "pharmacy@orhims.et",
    avatarInitials: "HB",
    dashboardPath: "/staff/permissions/module/dispensing",
    description: "Prescription verification, medication dispensing, and pharmacy inventory.",
  },
  {
    id: "user-cashier",
    identifier: "cashier",
    password: "cashier",
    name: "Almaz Kebede",
    role: "cashier",
    roleTitle: "Hospital Billing Cashier",
    department: "Finance & Patient Billing",
    staffId: "ORH-CSH-021",
    email: "cashier@orhims.et",
    avatarInitials: "AK",
    dashboardPath: "/staff/cashier/module/billing-overview",
    description: "Patient billing, invoice management, cash/digital receipting, and financial reconciliations.",
  },
  {
    id: "user-admin",
    identifier: "admin",
    password: "admin",
    name: "Dr. Yohannes Haile",
    role: "admin",
    roleTitle: "Medical Director & Admin",
    department: "Hospital Executive Management",
    staffId: "ORH-ADM-001",
    email: "admin@orhims.et",
    avatarInitials: "YH",
    dashboardPath: "/staff/admin/module/admin-overview",
    description: "Executive oversight, role assignments, audit logs, and hospital indicators.",
  },
  {
    id: "user-emergency",
    identifier: "emergency",
    password: "emergency",
    name: "Dr. Aster Lemma, MD",
    role: "emergency",
    roleTitle: "Emergency Department Lead",
    department: "Emergency & Trauma Center",
    staffId: "ORH-EM-011",
    email: "emergency@orhims.et",
    avatarInitials: "AL",
    dashboardPath: "/staff/emergency/module/emergency-dashboard",
    description: "Emergency arrivals, rapid triage, trauma resuscitation, and urgent admissions.",
  },
  {
    id: "user-inpatient",
    identifier: "inpatient",
    password: "inpatient",
    name: "Sister Bethlehem Worku, RN",
    role: "inpatient",
    roleTitle: "Inpatient Ward Head Nurse",
    department: "Inpatient Services & Bed Coordination",
    staffId: "ORH-IP-027",
    email: "inpatient@orhims.et",
    avatarInitials: "BW",
    dashboardPath: "/staff/inpatient/module/ward-management",
    description: "Inpatient ward admissions, bed allocation, patient transfers, and discharge clearances.",
  },
]

const AUTH_STORAGE_KEY = "orhims_authenticated_user"

export function getAuthenticatedUser(): StaffUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StaffUser
  } catch {
    return null
  }
}

export function setAuthenticatedUser(user: StaffUser): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Session storage may be restricted in some environments
  }
}

export function clearAuthenticatedUser(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Ignore error
  }
}

export function ensureAuthenticatedForRole(role: StaffRole): StaffUser {
  const existing = getAuthenticatedUser()
  if (existing) return existing
  const account =
    DEMO_ACCOUNTS.find((acc) => acc.role === role) ||
    DEMO_ACCOUNTS.find((acc) => acc.identifier === role) ||
    DEMO_ACCOUNTS[0]
  const { password: _, description: __, ...user } = account
  setAuthenticatedUser(user)
  return user
}

export function authenticateStaff(
  identifier: string,
  password?: string
): { success: boolean; user?: StaffUser; error?: string } {
  const cleanId = identifier.trim().toLowerCase()
  if (!cleanId) {
    return { success: false, error: "Staff ID or email is required." }
  }

  // Find matching account
  const account = DEMO_ACCOUNTS.find(
    (acc) =>
      acc.identifier.toLowerCase() === cleanId ||
      acc.email.toLowerCase() === cleanId ||
      acc.staffId.toLowerCase() === cleanId ||
      acc.role.toLowerCase() === cleanId
  )

  if (!account) {
    return {
      success: false,
      error: "No account found matching that staff ID or email. Try 'nurse', 'reception', or 'doctor'.",
    }
  }

  // In demo mode, accept correct password or role name or 'password'
  if (
    password &&
    password.trim() !== "" &&
    password !== account.password &&
    password !== "password" &&
    password !== "123456" &&
    password !== `${account.identifier}123`
  ) {
    return {
      success: false,
      error: "Invalid password for this staff account. (Hint: default password is the role name, e.g. 'nurse').",
    }
  }

  const { password: _, description: __, ...user } = account
  setAuthenticatedUser(user)
  return { success: true, user }
}
