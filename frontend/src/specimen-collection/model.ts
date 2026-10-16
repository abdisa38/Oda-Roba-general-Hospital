export type SpecimenStatus =
  | "Awaiting Collection"
  | "Collection Started"
  | "Collected — Verification Pending"
  | "Verified"
  | "Rejected"
  | "Cancelled"

export type SpecimenType =
  | "Whole Blood (EDTA)"
  | "Serum (SST)"
  | "Sodium Citrate Blood"
  | "Random Clean-Catch Urine"
  | "Early Morning Sputum"
  | "Stool (Clean Cup)"
  | "Capillary Blood"

export type RejectionReason =
  | "Incorrect specimen type or tube"
  | "Specimen container or labelling problem"
  | "Insufficient specimen quantity (QNS)"
  | "Damaged or leaking container"
  | "Hemolyzed or clotted blood sample"
  | "Mismatched patient requisition details"
  | "Other documented reason"

export interface CollectionAuditStep {
  timestamp: string
  status: SpecimenStatus
  actor: string
  role: string
  note?: string
}

export interface SpecimenRecord {
  id: string // e.g. "SP-2026-9041"
  requestId: string // e.g. "LR-2026-0187"
  encounterId: string // e.g. "ENC-2026-0419"
  patientId: string // e.g. "ORH-2026-0842"
  patientName: string // e.g. "Tolosa Desta Roba"
  patientAgeGender: string // e.g. "42y / Male"
  patientDob: string // e.g. "12 Mar 1984"
  requestedDepartment: string // e.g. "Outpatient Clinic 2"
  requestingDoctor: string // e.g. "Dr. Gemechu Tufa, MD"
  requestDate: string // e.g. "15 Oct 2026"
  requestTime: string // e.g. "09:30"
  urgency: "Routine" | "STAT (Urgent)"
  tests: {
    code: string
    name: string
    category: string
  }[]
  requiredSpecimenType: SpecimenType
  container: string // e.g. "Purple-top EDTA tube (3 mL)"
  collectionInstructions: string
  specialPrecautions?: string
  status: SpecimenStatus
  collectedAt?: string
  collectedBy?: string
  collectionLocation?: string
  specimenBarcode?: string
  collectorNotes?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: RejectionReason
  rejectionNotes?: string
  rejectedAt?: string
  rejectedBy?: string
  auditHistory: CollectionAuditStep[]
}

/**
 * Demonstration dataset representative of Oda Roba General Hospital
 * Central Diagnostic Laboratory phlebotomy & accession work queue.
 */
export const demoSpecimenRecords: SpecimenRecord[] = [
  {
    id: "SP-2026-9041",
    requestId: "LR-2026-0187",
    encounterId: "ENC-2026-0419",
    patientId: "ORH-2026-0842",
    patientName: "Tolosa Desta Roba",
    patientAgeGender: "42y / Male",
    patientDob: "12 Mar 1984",
    requestedDepartment: "Outpatient Clinic 2",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestDate: "15 Oct 2026",
    requestTime: "09:30",
    urgency: "STAT (Urgent)",
    tests: [
      { code: "MAL-RDT", name: "Malaria Rapid Diagnostic Test (mRDT)", category: "Parasitology" },
      { code: "BF-MP", name: "Blood Film for Malaria Parasite (Thick & Thin)", category: "Parasitology" },
    ],
    requiredSpecimenType: "Capillary Blood",
    container: "EDTA Microtainer / Clean Glass Slides",
    collectionInstructions: "Clean finger prick with 70% alcohol. Wipe first drop. Prepare thick & thin smear immediately.",
    specialPrecautions: "Patient febrile (38.9°C); process STAT without delay.",
    status: "Awaiting Collection",
    auditHistory: [
      {
        timestamp: "09:30",
        status: "Awaiting Collection",
        actor: "Dr. Gemechu Tufa, MD",
        role: "Attending Physician",
        note: "Urgent requisition submitted from OPD Clinic 2",
      },
    ],
  },
  {
    id: "SP-2026-9040",
    requestId: "LR-2026-0186",
    encounterId: "ENC-2026-0418",
    patientId: "ORH-2026-0791",
    patientName: "Bontu Mohammed Ali",
    patientAgeGender: "28y / Female",
    patientDob: "04 Aug 1998",
    requestedDepartment: "Maternal & Child Health (MCH)",
    requestingDoctor: "Dr. Sara Abera, MD",
    requestDate: "15 Oct 2026",
    requestTime: "09:10",
    urgency: "Routine",
    tests: [
      { code: "CBC-DIFF", name: "Complete Blood Count (CBC) with 5-Part Differential", category: "Hematology" },
    ],
    requiredSpecimenType: "Whole Blood (EDTA)",
    container: "Lavender/Purple-top EDTA tube (3 mL)",
    collectionInstructions: "Invert tube gently 8-10 times immediately after collection to prevent microclots.",
    status: "Collected — Verification Pending",
    collectedAt: "15 Oct 2026 · 09:22",
    collectedBy: "Sr. Chala Beyene, Phlebotomist",
    collectionLocation: "Phlebotomy Station 1",
    specimenBarcode: "BAR-9040-EDTA",
    collectorNotes: "Clean venipuncture right median cubital vein. Inverted 8 times.",
    auditHistory: [
      {
        timestamp: "09:10",
        status: "Awaiting Collection",
        actor: "Dr. Sara Abera, MD",
        role: "Requesting Physician",
        note: "Antenatal routine screening request",
      },
      {
        timestamp: "09:22",
        status: "Collected — Verification Pending",
        actor: "Sr. Chala Beyene",
        role: "Phlebotomist",
        note: "Sample collected in Phlebotomy Station 1. Awaiting accession check.",
      },
    ],
  },
  {
    id: "SP-2026-9039",
    requestId: "LR-2026-0185",
    encounterId: "ENC-2026-0415",
    patientId: "ORH-2026-0654",
    patientName: "Almaz Kebede Dadi",
    patientAgeGender: "56y / Female",
    patientDob: "19 Jan 1970",
    requestedDepartment: "Internal Medicine OPD",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestDate: "15 Oct 2026",
    requestTime: "08:45",
    urgency: "Routine",
    tests: [
      { code: "RFT-01", name: "Renal Function Panel (Creatinine, Urea, eGFR)", category: "Clinical Chemistry" },
      { code: "LYTES-4", name: "Serum Electrolytes (Na+, K+, Cl-, HCO3-)", category: "Clinical Chemistry" },
    ],
    requiredSpecimenType: "Serum (SST)",
    container: "Gold-top SST (Gel separator) tube (5 mL)",
    collectionInstructions: "Allow sample to clot for 30 minutes in upright position before centrifugation.",
    status: "Verified",
    collectedAt: "15 Oct 2026 · 08:55",
    collectedBy: "Ato Dawit Haile, Lab Tech",
    collectionLocation: "Central Phlebotomy Lab",
    specimenBarcode: "BAR-9039-SST",
    collectorNotes: "Patient well-hydrated. Venipuncture left cephalic vein.",
    verifiedAt: "15 Oct 2026 · 09:15",
    verifiedBy: "Sr. Tirhas Wolde, Lab Officer",
    auditHistory: [
      {
        timestamp: "08:45",
        status: "Awaiting Collection",
        actor: "Dr. Gemechu Tufa, MD",
        role: "Attending Physician",
        note: "Hypertension / chronic kidney screening",
      },
      {
        timestamp: "08:55",
        status: "Collected — Verification Pending",
        actor: "Ato Dawit Haile",
        role: "Phlebotomist",
        note: "Specimen drawn and labeled at collection counter",
      },
      {
        timestamp: "09:15",
        status: "Verified",
        actor: "Sr. Tirhas Wolde",
        role: "Accession Officer",
        note: "Volume adequate (4.5 mL), label verified with two identifiers. Centrifuged at 3000 RPM for 10 min. Sent to Cobas c311 analyzer.",
      },
    ],
  },
  {
    id: "SP-2026-9038",
    requestId: "LR-2026-0182",
    encounterId: "ENC-2026-0410",
    patientId: "ORH-2026-0512",
    patientName: "Kassahun Bekele Tadesse",
    patientAgeGender: "34y / Male",
    patientDob: "08 Jul 1992",
    requestedDepartment: "Chest / TB Clinic",
    requestingDoctor: "Dr. Meron Assefa, MD",
    requestDate: "15 Oct 2026",
    requestTime: "08:20",
    urgency: "Routine",
    tests: [
      { code: "AFB-SPUT", name: "Sputum Smear for Acid Fast Bacilli (AFB)", category: "Microbiology / TB" },
    ],
    requiredSpecimenType: "Early Morning Sputum",
    container: "Wide-mouth leak-proof sterile 50 mL sputum container",
    collectionInstructions: "Instruct patient to rinse mouth with water, breathe deeply, and cough deeply from lungs. Min 2 mL purulent sputum.",
    status: "Rejected",
    collectedAt: "15 Oct 2026 · 08:35",
    collectedBy: "Sr. Chala Beyene, Phlebotomist",
    collectionLocation: "Sputum Collection Booth",
    specimenBarcode: "BAR-9038-SPUT",
    rejectionReason: "Insufficient specimen quantity (QNS)",
    rejectionNotes: "Specimen submitted contains only watery saliva (approx 0.5 mL) with no purulent bronchial secretions. Unsuitable for reliable AFB smear microscopy.",
    rejectedAt: "15 Oct 2026 · 08:50",
    rejectedBy: "Sr. Tirhas Wolde, Lab Officer",
    auditHistory: [
      {
        timestamp: "08:20",
        status: "Awaiting Collection",
        actor: "Dr. Meron Assefa, MD",
        role: "Requesting Physician",
        note: "Chronic cough evaluation",
      },
      {
        timestamp: "08:35",
        status: "Collected — Verification Pending",
        actor: "Sr. Chala Beyene",
        role: "Phlebotomist",
        note: "Patient returned container from sputum booth",
      },
      {
        timestamp: "08:50",
        status: "Rejected",
        actor: "Sr. Tirhas Wolde",
        role: "Lab Officer",
        note: "Rejected: Saliva only, QNS. Clinician Dr. Meron Assefa alerted. Recollection counselled for tomorrow early morning.",
      },
    ],
  },
  {
    id: "SP-2026-9037",
    requestId: "LR-2026-0181",
    encounterId: "ENC-2026-0408",
    patientId: "ORH-2026-0429",
    patientName: "Fatuma Kedir Gudeta",
    patientAgeGender: "51y / Female",
    patientDob: "22 Sep 1975",
    requestedDepartment: "Internal Medicine OPD",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestDate: "15 Oct 2026",
    requestTime: "08:15",
    urgency: "Routine",
    tests: [
      { code: "FBS-01", name: "Fasting Blood Sugar (FBS)", category: "Clinical Chemistry" },
      { code: "LIPID-PAN", name: "Lipid Profile Panel (TC, HDL, LDL, Triglycerides)", category: "Clinical Chemistry" },
    ],
    requiredSpecimenType: "Serum (SST)",
    container: "Gold-top SST tube (5 mL) + Grey-top Fluoride/Oxalate (2 mL)",
    collectionInstructions: "Confirm patient has maintained 8-12 hour overnight fast prior to collection.",
    status: "Awaiting Collection",
    auditHistory: [
      {
        timestamp: "08:15",
        status: "Awaiting Collection",
        actor: "Dr. Gemechu Tufa, MD",
        role: "Attending Physician",
        note: "Diabetes mellitus and dyslipidemia monitoring",
      },
    ],
  },
  {
    id: "SP-2026-9036",
    requestId: "LR-2026-0180",
    encounterId: "ENC-2026-0402",
    patientId: "ORH-2026-0318",
    patientName: "Girma Worku Megersa",
    patientAgeGender: "63y / Male",
    patientDob: "14 Nov 1962",
    requestedDepartment: "Emergency Triage Unit",
    requestingDoctor: "Dr. Daniel Mengistu, MD",
    requestDate: "15 Oct 2026",
    requestTime: "07:50",
    urgency: "STAT (Urgent)",
    tests: [
      { code: "UA-MIC", name: "Urinalysis with Microscopic Examination", category: "Urinalysis" },
    ],
    requiredSpecimenType: "Random Clean-Catch Urine",
    container: "Sterile urine container with screw cap (50 mL)",
    collectionInstructions: "Clean catch midstream sample. Deliver to laboratory within 1 hour of voiding.",
    status: "Cancelled",
    collectorNotes: "Order cancelled by Dr. Daniel Mengistu due to patient catheterization and direct ward admission.",
    auditHistory: [
      {
        timestamp: "07:50",
        status: "Awaiting Collection",
        actor: "Dr. Daniel Mengistu, MD",
        role: "Emergency Physician",
        note: "Emergency acute abdomen evaluation",
      },
      {
        timestamp: "08:05",
        status: "Cancelled",
        actor: "Dr. Daniel Mengistu, MD",
        role: "Emergency Physician",
        note: "Cancelled: Foley catheter inserted; inpatient ward orders will supersede.",
      },
    ],
  },
]
