import type { IconName } from "../Icon"

export interface BreadcrumbItem {
  label: string
  destinationId?: string
  onClick?: () => void
}

export type StatusVariant =
  | "neutral"
  | "pending"
  | "progress"
  | "success"
  | "danger"
  | "warning"
  | "info"

export interface StatusDefinition {
  key: string
  label: string
  icon: IconName
  variant: StatusVariant
  domain: "clinical" | "financial" | "inventory" | "administrative" | "general"
  description: string
}

export const STANDARD_STATUSES: StatusDefinition[] = [
  {
    key: "draft",
    label: "Draft",
    icon: "edit",
    variant: "neutral",
    domain: "general",
    description: "Initial unsubmitted record; editable by author.",
  },
  {
    key: "pending",
    label: "Pending Review",
    icon: "clock",
    variant: "pending",
    domain: "clinical",
    description: "Awaiting clinical supervisor or authorization check.",
  },
  {
    key: "in-progress",
    label: "In Progress",
    icon: "activity",
    variant: "progress",
    domain: "clinical",
    description: "Encounter, triage, or test currently underway.",
  },
  {
    key: "verified",
    label: "Verified / Approved",
    icon: "check",
    variant: "success",
    domain: "clinical",
    description: "Formally validated by authorized physician or technologist.",
  },
  {
    key: "completed",
    label: "Completed",
    icon: "check",
    variant: "success",
    domain: "general",
    description: "Consultation, task, or procedure fully concluded.",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: "x",
    variant: "danger",
    domain: "general",
    description: "Order, appointment, or request terminated before completion.",
  },
  {
    key: "paid",
    label: "Paid in Full",
    icon: "receipt",
    variant: "success",
    domain: "financial",
    description: "Invoice settled via cash, Telebirr, CBE, or insurance subsidy.",
  },
  {
    key: "partially-paid",
    label: "Partially Paid",
    icon: "credit-card",
    variant: "warning",
    domain: "financial",
    description: "Partial balance paid; remainder due before discharge.",
  },
  {
    key: "overdue",
    label: "Payment Pending",
    icon: "warning",
    variant: "danger",
    domain: "financial",
    description: "Outstanding bill requires settlement at cashier desk.",
  },
  {
    key: "admitted",
    label: "Admitted to Ward",
    icon: "bed",
    variant: "progress",
    domain: "clinical",
    description: "Patient actively allocated to inpatient bed.",
  },
  {
    key: "discharged",
    label: "Discharged",
    icon: "log-out",
    variant: "neutral",
    domain: "clinical",
    description: "Patient discharge instructions given and bed vacated.",
  },
  {
    key: "low-stock",
    label: "Below Reorder Level",
    icon: "warning",
    variant: "warning",
    domain: "inventory",
    description: "Inventory count under minimum safety threshold.",
  },
]

export interface WorkflowStage {
  id: string
  stageNumber: number
  title: string
  module: string
  destinationId: string
  status: "completed" | "current" | "pending" | "optional"
  description: string
  actorRole: string
  recordReference?: string
}

export interface PatientContextState {
  mrn: string
  fullName: string
  age: number
  gender: "Female" | "Male"
  bloodGroup: string
  kebele: string
  phone: string
  cbhiId: string
  cbhiStatus: "Active" | "Pending" | "Expired"
  allergies: string[]
  currentEncounterId: string
  currentDepartment: string
  currentWard?: string
  currentBed?: string
}

export const DEMO_PATIENT_CONTEXT: PatientContextState = {
  mrn: "ORH-26-00104",
  fullName: "Chaltu Tolasa",
  age: 34,
  gender: "Female",
  bloodGroup: "A+",
  kebele: "Kebele 03, Bale Robe",
  phone: "+251 91 234 5678",
  cbhiId: "CBHI-ROB-2026-4491",
  cbhiStatus: "Active",
  allergies: ["Penicillin (Cutaneous rash noted)"],
  currentEncounterId: "ENC-2026-0182",
  currentDepartment: "Internal Medicine Outpatient",
  currentWard: "Medical Ward 2",
  currentBed: "Bed 204-B",
}

export const OUTPATIENT_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "stage-reg",
    stageNumber: 1,
    title: "Patient Registration",
    module: "Reception / Registration",
    destinationId: "registration",
    status: "completed",
    description: "Demographics, National/Kebele ID, and CBHI insurance verified.",
    actorRole: "Receptionist / Registrar",
    recordReference: "ORH-26-00104",
  },
  {
    id: "stage-triage",
    stageNumber: 2,
    title: "Nursing Triage",
    module: "Triage Assessment",
    destinationId: "triage-assessment",
    status: "completed",
    description: "Vital signs recorded: BP 126/82, Pulse 72 bpm, Temp 36.6°C.",
    actorRole: "Triage Nurse",
    recordReference: "TRG-2026-0819",
  },
  {
    id: "stage-consult",
    stageNumber: 3,
    title: "Clinical Consultation",
    module: "Clinical Workspace",
    destinationId: "clinical-workspace",
    status: "current",
    description: "Physician assessment, chief complaint review, and care plan.",
    actorRole: "Doctor / Internist",
    recordReference: "ENC-2026-0182",
  },
  {
    id: "stage-lab",
    stageNumber: 4,
    title: "Laboratory Diagnostic",
    module: "Laboratory Orders",
    destinationId: "orders",
    status: "completed",
    description: "CBC with differential & Lipid panel verified by Technologist.",
    actorRole: "Laboratory Technologist",
    recordReference: "LAB-2026-04891",
  },
  {
    id: "stage-pharm",
    stageNumber: 5,
    title: "Pharmacy Dispensing",
    module: "Prescription Queue",
    destinationId: "prescription-queue",
    status: "pending",
    description: "Dispensing 90-day Enalapril Maleate 5mg and Vitamin D3.",
    actorRole: "Hospital Pharmacist",
    recordReference: "RX-2026-0312",
  },
  {
    id: "stage-billing",
    stageNumber: 6,
    title: "Billing & Settlement",
    module: "Hospital Billing",
    destinationId: "invoices",
    status: "pending",
    description: "Subsidized via CBHI Policy #CBHI-ROB-2026-4491; receipt issued.",
    actorRole: "Cashier / Billing Clerk",
    recordReference: "INV-2026-00142",
  },
]

export const INPATIENT_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "stage-emr",
    stageNumber: 1,
    title: "Emergency Arrival & Triage",
    module: "Emergency Management",
    destinationId: "emergency-triage",
    status: "completed",
    description: "Acuity Level 2 (Emergent) stabilized in resuscitation room.",
    actorRole: "Emergency Physician & Nurse",
    recordReference: "EMR-2026-0902",
  },
  {
    id: "stage-admit",
    stageNumber: 2,
    title: "Admission Authorization",
    module: "Inpatient Admissions",
    destinationId: "admissions",
    status: "completed",
    description: "Physician authorizes inpatient admission to Medical Ward.",
    actorRole: "Attending Physician",
    recordReference: "ADM-2026-0038",
  },
  {
    id: "stage-bed",
    stageNumber: 3,
    title: "Ward & Bed Allocation",
    module: "Bed Management",
    destinationId: "bed-management",
    status: "current",
    description: "Assigned to Medical Ward 2, Bed 204-B.",
    actorRole: "Ward Nurse Supervisor",
    recordReference: "BED-204-B",
  },
  {
    id: "stage-ward-care",
    stageNumber: 4,
    title: "Inpatient Care & Rounds",
    module: "Ward Management",
    destinationId: "ward-management",
    status: "pending",
    description: "Continuous vital monitoring, IV administration, and daily rounds.",
    actorRole: "Ward Staff",
    recordReference: "RND-2026-041",
  },
  {
    id: "stage-discharge",
    stageNumber: 5,
    title: "Discharge & Follow-Up",
    module: "Patient Discharges",
    destinationId: "discharges",
    status: "pending",
    description: "Discharge summary signed, medications dispensed, home care instructions.",
    actorRole: "Attending Doctor & Cashier",
    recordReference: "DSC-2026-0029",
  },
]
