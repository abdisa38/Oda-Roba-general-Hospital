// ORHIMS — Phase 06, Prompt 33: Laboratory Result Entry Workspace Data Model
// Bale Robe, Ethiopia — Central Diagnostic Laboratory

export type ResultType = "numeric" | "categorical" | "panel" | "text"

export type ResultEntryStatus =
  | "Awaiting Processing"
  | "In Processing"
  | "Awaiting Result Entry"
  | "Draft Saved"
  | "Incomplete"
  | "Submitted for Review"
  | "Verified"
  | "Released"
  | "Ineligible / Rejected Specimen"

export type AbnormalFlag = "Normal" | "High" | "Low" | "Critical" | "Abnormal"

export interface TestComponentDefinition {
  key: string
  name: string
  code: string
  type: "numeric" | "categorical" | "text"
  unit?: string
  referenceRange?: string
  normalLow?: number
  normalHigh?: number
  criticalLow?: number
  criticalHigh?: number
  categoricalOptions?: string[]
  required: boolean
}

export interface ResultEntryOrder {
  id: string // e.g. "RE-2026-0810"
  requestId: string // e.g. "LR-2026-0185"
  encounterId: string // e.g. "ENC-2026-0415"
  patientId: string // e.g. "ORH-2026-0654"
  patientName: string // e.g. "Almaz Kebede Dadi"
  patientAgeGender: string // e.g. "56y / Female"
  patientDob: string // e.g. "19 Jan 1970"
  specimenId: string // e.g. "SP-2026-9039"
  specimenType: string // e.g. "Serum (SST)"
  specimenStatus: "Verified" | "Collected" | "Rejected" | "Cancelled"
  collectionTimestamp: string
  requestingDoctor: string
  requestedDepartment: string
  priority: "Routine" | "STAT (Urgent)"
  testName: string
  testCode: string
  testCategory: "Hematology" | "Parasitology" | "Clinical Chemistry" | "Microbiology / TB" | "Urinalysis" | "Serology"
  resultType: ResultType
  status: ResultEntryStatus
  components: TestComponentDefinition[]
  enteredResults: Record<string, string>
  analyzerName?: string
  benchTechnician: string
  technicalNotes?: string
  lastSavedAt?: string
  submittedAt?: string
  verifiedAt?: string
  releasedAt?: string
  ineligibleReason?: string
}

/**
 * Calculates result flag based on configured reference ranges and critical thresholds.
 * Adheres strictly to hospital laboratory policy without fabricating values.
 */
export function calculateResultFlag(
  value: string,
  comp: TestComponentDefinition
): AbnormalFlag | undefined {
  if (!value || value.trim() === "") return undefined

  if (comp.type === "numeric") {
    const num = parseFloat(value)
    if (isNaN(num)) return undefined

    if (comp.criticalHigh !== undefined && num >= comp.criticalHigh) return "Critical"
    if (comp.criticalLow !== undefined && num <= comp.criticalLow) return "Critical"
    if (comp.normalHigh !== undefined && num > comp.normalHigh) return "High"
    if (comp.normalLow !== undefined && num < comp.normalLow) return "Low"
    if (comp.normalLow !== undefined && comp.normalHigh !== undefined) return "Normal"
    return undefined
  }

  if (comp.type === "categorical") {
    const lower = value.toLowerCase()
    if (lower.includes("positive") || lower.includes("reactive")) return "Abnormal"
    if (lower.includes("negative") || lower.includes("non-reactive")) return "Normal"
  }

  return undefined
}

/**
 * Demonstration dataset representative of Oda Roba General Hospital
 * Central Diagnostic Laboratory result entry work queue.
 */
export const demoResultOrders: ResultEntryOrder[] = [
  {
    id: "RE-2026-0810",
    requestId: "LR-2026-0185",
    encounterId: "ENC-2026-0415",
    patientId: "ORH-2026-0654",
    patientName: "Almaz Kebede Dadi",
    patientAgeGender: "56y / Female",
    patientDob: "19 Jan 1970",
    specimenId: "SP-2026-9039",
    specimenType: "Serum (SST)",
    specimenStatus: "Verified",
    collectionTimestamp: "15 Oct 2026 · 08:55",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestedDepartment: "Internal Medicine OPD",
    priority: "Routine",
    testName: "Renal Function Panel & Electrolytes (RFT)",
    testCode: "CHM-RFT-01",
    testCategory: "Clinical Chemistry",
    resultType: "panel",
    status: "Awaiting Result Entry",
    analyzerName: "Roche Cobas c311 Chemistry Analyzer",
    benchTechnician: "Ato Dawit Haile, Lab Tech",
    components: [
      {
        key: "creatinine",
        name: "Serum Creatinine",
        code: "CREAT",
        type: "numeric",
        unit: "mg/dL",
        referenceRange: "0.6 - 1.2",
        normalLow: 0.6,
        normalHigh: 1.2,
        criticalHigh: 5.0,
        required: true,
      },
      {
        key: "urea",
        name: "Blood Urea Nitrogen (BUN)",
        code: "BUN",
        type: "numeric",
        unit: "mg/dL",
        referenceRange: "7.0 - 20.0",
        normalLow: 7.0,
        normalHigh: 20.0,
        criticalHigh: 80.0,
        required: true,
      },
      {
        key: "egfr",
        name: "eGFR (CKD-EPI)",
        code: "EGFR",
        type: "numeric",
        unit: "mL/min/1.73m²",
        referenceRange: "> 60.0",
        normalLow: 60.0,
        required: true,
      },
      {
        key: "sodium",
        name: "Sodium (Na+)",
        code: "NA",
        type: "numeric",
        unit: "mmol/L",
        referenceRange: "135.0 - 145.0",
        normalLow: 135.0,
        normalHigh: 145.0,
        criticalLow: 120.0,
        criticalHigh: 160.0,
        required: true,
      },
      {
        key: "potassium",
        name: "Potassium (K+)",
        code: "K",
        type: "numeric",
        unit: "mmol/L",
        referenceRange: "3.5 - 5.0",
        normalLow: 3.5,
        normalHigh: 5.0,
        criticalLow: 2.8,
        criticalHigh: 6.2,
        required: true,
      },
      {
        key: "chloride",
        name: "Chloride (Cl-)",
        code: "CL",
        type: "numeric",
        unit: "mmol/L",
        referenceRange: "96.0 - 106.0",
        normalLow: 96.0,
        normalHigh: 106.0,
        required: false,
      },
    ],
    enteredResults: {},
  },
  {
    id: "RE-2026-0811",
    requestId: "LR-2026-0187",
    encounterId: "ENC-2026-0419",
    patientId: "ORH-2026-0842",
    patientName: "Tolosa Desta Roba",
    patientAgeGender: "42y / Male",
    patientDob: "12 Mar 1984",
    specimenId: "SP-2026-9041",
    specimenType: "Capillary Blood",
    specimenStatus: "Verified",
    collectionTimestamp: "15 Oct 2026 · 09:35",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestedDepartment: "Outpatient Clinic 2",
    priority: "STAT (Urgent)",
    testName: "Malaria Rapid Diagnostic Test (mRDT)",
    testCode: "PAR-MRDT-01",
    testCategory: "Parasitology",
    resultType: "categorical",
    status: "Draft Saved",
    benchTechnician: "Sr. Chala Beyene, Phlebotomist",
    lastSavedAt: "15 Oct 2026 · 09:48",
    technicalNotes: "Rapid antigen test cassette read at exactly 15 minutes. Distinct control line observed.",
    components: [
      {
        key: "antigen_result",
        name: "mRDT Antigen Result",
        code: "MRDT-RES",
        type: "categorical",
        referenceRange: "Negative (Non-reactive)",
        categoricalOptions: [
          "Negative (Non-reactive)",
          "Positive (Plasmodium falciparum - HRP2)",
          "Positive (Plasmodium vivax - pLDH)",
          "Positive (Mixed P. falciparum + P. vivax)",
          "Invalid test (Control line missing)",
        ],
        required: true,
      },
      {
        key: "parasite_species",
        name: "Identified Species",
        code: "MAL-SPEC",
        type: "categorical",
        referenceRange: "None detected",
        categoricalOptions: [
          "None detected",
          "Plasmodium falciparum",
          "Plasmodium vivax",
          "Mixed species",
        ],
        required: true,
      },
    ],
    enteredResults: {
      antigen_result: "Positive (Plasmodium falciparum - HRP2)",
      parasite_species: "Plasmodium falciparum",
    },
  },
  {
    id: "RE-2026-0812",
    requestId: "LR-2026-0186",
    encounterId: "ENC-2026-0418",
    patientId: "ORH-2026-0791",
    patientName: "Bontu Mohammed Ali",
    patientAgeGender: "28y / Female",
    patientDob: "04 Aug 1998",
    specimenId: "SP-2026-9040",
    specimenType: "Whole Blood (EDTA)",
    specimenStatus: "Verified",
    collectionTimestamp: "15 Oct 2026 · 09:22",
    requestingDoctor: "Dr. Sara Abera, MD",
    requestedDepartment: "Maternal & Child Health (MCH)",
    priority: "Routine",
    testName: "Complete Blood Count (CBC) with Differential",
    testCode: "HEM-CBC-01",
    testCategory: "Hematology",
    resultType: "panel",
    status: "In Processing",
    analyzerName: "Sysmex XN-350 Automated Hematology Analyzer",
    benchTechnician: "Ato Dawit Haile, Lab Tech",
    components: [
      {
        key: "wbc",
        name: "White Blood Cells (WBC)",
        code: "WBC",
        type: "numeric",
        unit: "x10³/µL",
        referenceRange: "4.0 - 10.0",
        normalLow: 4.0,
        normalHigh: 10.0,
        criticalLow: 1.5,
        criticalHigh: 30.0,
        required: true,
      },
      {
        key: "rbc",
        name: "Red Blood Cells (RBC)",
        code: "RBC",
        type: "numeric",
        unit: "x10⁶/µL",
        referenceRange: "3.8 - 5.2",
        normalLow: 3.8,
        normalHigh: 5.2,
        required: true,
      },
      {
        key: "hgb",
        name: "Hemoglobin (Hgb)",
        code: "HGB",
        type: "numeric",
        unit: "g/dL",
        referenceRange: "12.0 - 15.5",
        normalLow: 12.0,
        normalHigh: 15.5,
        criticalLow: 7.0,
        criticalHigh: 20.0,
        required: true,
      },
      {
        key: "hct",
        name: "Hematocrit (Hct)",
        code: "HCT",
        type: "numeric",
        unit: "%",
        referenceRange: "36.0 - 46.0",
        normalLow: 36.0,
        normalHigh: 46.0,
        required: true,
      },
      {
        key: "plt",
        name: "Platelet Count",
        code: "PLT",
        type: "numeric",
        unit: "x10³/µL",
        referenceRange: "150 - 450",
        normalLow: 150,
        normalHigh: 450,
        criticalLow: 50,
        criticalHigh: 1000,
        required: true,
      },
      {
        key: "neutrophils",
        name: "Neutrophils %",
        code: "NEUT",
        type: "numeric",
        unit: "%",
        referenceRange: "40.0 - 70.0",
        normalLow: 40.0,
        normalHigh: 70.0,
        required: false,
      },
      {
        key: "lymphocytes",
        name: "Lymphocytes %",
        code: "LYMPH",
        type: "numeric",
        unit: "%",
        referenceRange: "20.0 - 45.0",
        normalLow: 20.0,
        normalHigh: 45.0,
        required: false,
      },
    ],
    enteredResults: {
      wbc: "7.4",
      rbc: "4.12",
      hgb: "10.8", // slightly low for female, flag as Low
    },
  },
  {
    id: "RE-2026-0813",
    requestId: "LR-2026-0181",
    encounterId: "ENC-2026-0408",
    patientId: "ORH-2026-0429",
    patientName: "Fatuma Kedir Gudeta",
    patientAgeGender: "51y / Female",
    patientDob: "22 Sep 1975",
    specimenId: "SP-2026-9037",
    specimenType: "Plasma (Fluoride Oxalate)",
    specimenStatus: "Verified",
    collectionTimestamp: "15 Oct 2026 · 08:30",
    requestingDoctor: "Dr. Gemechu Tufa, MD",
    requestedDepartment: "Internal Medicine OPD",
    priority: "Routine",
    testName: "Fasting Blood Sugar (FBS)",
    testCode: "CHM-FBS-01",
    testCategory: "Clinical Chemistry",
    resultType: "numeric",
    status: "Submitted for Review",
    analyzerName: "Roche Cobas c311 Chemistry Analyzer",
    benchTechnician: "Ato Dawit Haile, Lab Tech",
    submittedAt: "15 Oct 2026 · 09:12",
    technicalNotes: "Patient confirmed 10 hour overnight fast. Duplicate run confirmed linearity.",
    components: [
      {
        key: "fbs",
        name: "Fasting Blood Sugar",
        code: "FBS",
        type: "numeric",
        unit: "mg/dL",
        referenceRange: "70.0 - 100.0",
        normalLow: 70.0,
        normalHigh: 100.0,
        criticalLow: 45.0,
        criticalHigh: 400.0,
        required: true,
      },
    ],
    enteredResults: {
      fbs: "168.0",
    },
  },
  {
    id: "RE-2026-0814",
    requestId: "LR-2026-0182",
    encounterId: "ENC-2026-0410",
    patientId: "ORH-2026-0512",
    patientName: "Kassahun Bekele Tadesse",
    patientAgeGender: "34y / Male",
    patientDob: "08 Jul 1992",
    specimenId: "SP-2026-9038",
    specimenType: "Early Morning Sputum",
    specimenStatus: "Rejected",
    collectionTimestamp: "15 Oct 2026 · 08:35",
    requestingDoctor: "Dr. Meron Assefa, MD",
    requestedDepartment: "Chest / TB Clinic",
    priority: "Routine",
    testName: "Sputum Smear for AFB Microscopy",
    testCode: "AFB-SPUT-01",
    testCategory: "Microbiology / TB",
    resultType: "categorical",
    status: "Ineligible / Rejected Specimen",
    benchTechnician: "Sr. Tirhas Wolde, Lab Officer",
    ineligibleReason: "Specimen SP-2026-9038 rejected at accessioning (Insufficient specimen quantity - saliva only). Result entry cannot proceed until a recollected purulent sputum specimen is verified.",
    components: [
      {
        key: "afb_result",
        name: "AFB Smear Microscopy",
        code: "AFB-RES",
        type: "categorical",
        referenceRange: "Negative (No AFB observed)",
        categoricalOptions: [
          "Negative (No AFB observed in 100 fields)",
          "Scanty (1-9 AFB in 100 fields)",
          "Positive 1+ (10-99 AFB in 100 fields)",
          "Positive 2+ (1-10 AFB per field)",
          "Positive 3+ (>10 AFB per field)",
        ],
        required: true,
      },
    ],
    enteredResults: {},
  },
  {
    id: "RE-2026-0815",
    requestId: "LR-2026-0178",
    encounterId: "ENC-2026-0390",
    patientId: "ORH-2026-0199",
    patientName: "Girma Worku Megersa",
    patientAgeGender: "63y / Male",
    patientDob: "14 Nov 1962",
    specimenId: "SP-2026-9028",
    specimenType: "Random Clean-Catch Urine",
    specimenStatus: "Verified",
    collectionTimestamp: "15 Oct 2026 · 07:45",
    requestingDoctor: "Dr. Daniel Mengistu, MD",
    requestedDepartment: "Emergency Triage Unit",
    priority: "STAT (Urgent)",
    testName: "Urinalysis Dipstick & Microscopy",
    testCode: "URI-MIC-01",
    testCategory: "Urinalysis",
    resultType: "panel",
    status: "Released",
    analyzerName: "Manual Dipstick + Olympus CX23 Microscopy",
    benchTechnician: "Sr. Tirhas Wolde, Lab Officer",
    verifiedAt: "15 Oct 2026 · 08:15",
    releasedAt: "15 Oct 2026 · 08:20",
    technicalNotes: "Microscopic exam: 10-12 WBC/HPF, few calcium oxalate crystals.",
    components: [
      {
        key: "color",
        name: "Color",
        code: "URI-COL",
        type: "categorical",
        referenceRange: "Straw to Amber",
        categoricalOptions: ["Straw", "Yellow", "Amber", "Dark Amber", "Red/Bloody"],
        required: true,
      },
      {
        key: "clarity",
        name: "Clarity",
        code: "URI-CLAR",
        type: "categorical",
        referenceRange: "Clear",
        categoricalOptions: ["Clear", "Slightly Hazy", "Turbid"],
        required: true,
      },
      {
        key: "protein",
        name: "Protein",
        code: "URI-PROT",
        type: "categorical",
        referenceRange: "Negative",
        categoricalOptions: ["Negative", "Trace", "1+ (30 mg/dL)", "2+ (100 mg/dL)", "3+ (300 mg/dL)"],
        required: true,
      },
      {
        key: "glucose",
        name: "Glucose",
        code: "URI-GLUC",
        type: "categorical",
        referenceRange: "Negative",
        categoricalOptions: ["Negative", "Trace", "1+", "2+", "3+"],
        required: true,
      },
      {
        key: "leukocyte_esterase",
        name: "Leukocyte Esterase",
        code: "URI-LEUK",
        type: "categorical",
        referenceRange: "Negative",
        categoricalOptions: ["Negative", "Trace", "1+ Small", "2+ Moderate", "3+ Large"],
        required: true,
      },
    ],
    enteredResults: {
      color: "Yellow",
      clarity: "Slightly Hazy",
      protein: "Trace",
      glucose: "Negative",
      leukocyte_esterase: "2+ Moderate",
    },
  },
]
