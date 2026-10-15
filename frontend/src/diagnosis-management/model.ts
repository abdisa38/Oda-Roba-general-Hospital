// ORHIMS — Diagnosis Management Data Model (Phase 05, Prompt 28)

export interface DiagnosisPatientContext {
  patientId: string
  name: string
  amharicName?: string
  age: string
  sex: "Female" | "Male" | "Other"
  dob: string
  encounterId: string
  encounterDate: string
  encounterType: string
  clinic: string
  attendingDoctor: string
  encounterStatus: "In Progress" | "Finalized" | "Awaiting Documentation"
  allergiesAlert?: string
}

export interface EncounterDiagnosis {
  id: string
  code: string // e.g., ICD-10 J02.9
  name: string
  designation: "Primary" | "Secondary"
  status: "Confirmed" | "Provisional" | "Differential"
  category: string
  dateRecorded: string
  timeRecorded: string
  recordedBy: string
  role: string
  encounterId: string
  clinicalNotes: string
}

export interface CatalogueDiagnosis {
  code: string
  name: string
  category: string
  chapter: string
  synonyms?: string[]
}

export interface HistoricalDiagnosisReference {
  id: string
  code: string
  name: string
  dateRecorded: string
  encounterId: string
  clinic: string
  doctor: string
  status: "Chronic" | "Resolved" | "Inactive"
  clinicalNotes: string
}

// Current Patient & Active Encounter for Prompt 28 Demonstration
export const sampleDiagnosisPatient: DiagnosisPatientContext = {
  patientId: "ORH-2026-00124",
  name: "Hana Mohammed",
  amharicName: "ሀና መሀመድ",
  age: "28y",
  sex: "Female",
  dob: "14 May 1997",
  encounterId: "ENC-2026-0842",
  encounterDate: "15 Oct 2026",
  encounterType: "General Outpatient Consultation",
  clinic: "Adult OPD-2",
  attendingDoctor: "Dr. Dawit Alemu",
  encounterStatus: "In Progress",
  allergiesAlert: "Penicillin G & Beta-Lactams (Severe Anaphylaxis Risk)",
}

// Initial active encounter diagnoses
export const initialEncounterDiagnoses: EncounterDiagnosis[] = [
  {
    id: "diag-curr-1",
    code: "J02.9",
    name: "Acute Pharyngitis, Unspecified",
    designation: "Primary",
    status: "Confirmed",
    category: "Respiratory",
    dateRecorded: "15 Oct 2026",
    timeRecorded: "08:45 AM",
    recordedBy: "Dr. Dawit Alemu",
    role: "General Medical Practitioner",
    encounterId: "ENC-2026-0842",
    clinicalNotes:
      "Tonsillar erythema and painful deglutition. Negative for exudative membranes. Penicillin allergy observed in medication planning.",
  },
  {
    id: "diag-curr-2",
    code: "J45.21",
    name: "Mild Intermittent Asthma with Acute Exacerbation",
    designation: "Secondary",
    status: "Provisional",
    category: "Respiratory",
    dateRecorded: "15 Oct 2026",
    timeRecorded: "08:48 AM",
    recordedBy: "Dr. Dawit Alemu",
    role: "General Medical Practitioner",
    encounterId: "ENC-2026-0842",
    clinicalNotes:
      "Occasional end-expiratory wheeze on forced expiration following cold exposure. Peak flow slightly reduced compared to baseline.",
  },
]

// Standard demonstration terminology catalogue (ICD-10 subset relevant to general hospital outpatient care)
export const diagnosisCatalogue: CatalogueDiagnosis[] = [
  {
    code: "J02.9",
    name: "Acute pharyngitis, unspecified",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Sore throat", "Acute sore throat", "Pharyngitis"],
  },
  {
    code: "J06.9",
    name: "Acute upper respiratory infection, unspecified",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Common cold", "URI", "URTI"],
  },
  {
    code: "J20.9",
    name: "Acute bronchitis, unspecified",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Bronchitis", "Chest cold"],
  },
  {
    code: "J45.20",
    name: "Mild intermittent asthma, uncomplicated",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Bronchial asthma", "Intermittent asthma"],
  },
  {
    code: "J45.21",
    name: "Mild intermittent asthma with acute exacerbation",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Asthma attack", "Asthma flare"],
  },
  {
    code: "J18.9",
    name: "Pneumonia, unspecified organism",
    category: "Diseases of the Respiratory System",
    chapter: "Respiratory (J00–J99)",
    synonyms: ["Community acquired pneumonia", "Chest infection"],
  },
  {
    code: "A09",
    name: "Infectious gastroenteritis and colitis, unspecified",
    category: "Certain Infectious and Parasitic Diseases",
    chapter: "Infectious (A00–B99)",
    synonyms: ["Diarrheal illness", "Acute diarrhea", "Gastroenteritis"],
  },
  {
    code: "B54",
    name: "Unspecified malaria",
    category: "Certain Infectious and Parasitic Diseases",
    chapter: "Infectious (A00–B99)",
    synonyms: ["Clinical malaria", "Febrile illness"],
  },
  {
    code: "A01.0",
    name: "Typhoid fever",
    category: "Certain Infectious and Parasitic Diseases",
    chapter: "Infectious (A00–B99)",
    synonyms: ["Enteric fever", "Salmonella typhi infection"],
  },
  {
    code: "N39.0",
    name: "Urinary tract infection, site not specified",
    category: "Diseases of the Genitourinary System",
    chapter: "Genitourinary (N00–N99)",
    synonyms: ["UTI", "Cystitis", "Bladder infection"],
  },
  {
    code: "K29.70",
    name: "Gastritis, unspecified, without bleeding",
    category: "Diseases of the Digestive System",
    chapter: "Digestive (K00–K95)",
    synonyms: ["Dyspepsia", "Epigastric pain", "Acid peptic disorder"],
  },
  {
    code: "I10",
    name: "Essential (primary) hypertension",
    category: "Diseases of the Circulatory System",
    chapter: "Circulatory (I00–I99)",
    synonyms: ["High blood pressure", "HTN"],
  },
  {
    code: "E11.9",
    name: "Type 2 diabetes mellitus without complications",
    category: "Endocrine, Nutritional and Metabolic Diseases",
    chapter: "Endocrine (E00–E89)",
    synonyms: ["Adult-onset diabetes", "NIDDM", "T2DM"],
  },
  {
    code: "M54.5",
    name: "Low back pain",
    category: "Diseases of the Musculoskeletal System",
    chapter: "Musculoskeletal (M00–M99)",
    synonyms: ["Lumbago", "Mechanical back strain"],
  },
  {
    code: "S51.81",
    name: "Laceration without foreign body of right forearm",
    category: "Injury, Poisoning and Consequences of External Causes",
    chapter: "Injury & Trauma (S00–T88)",
    synonyms: ["Cut forearm", "Wound forearm"],
  },
]

// Historical diagnoses from prior visits for reference (Section 8)
export const historicalDiagnosesReference: HistoricalDiagnosisReference[] = [
  {
    id: "hdiag-1",
    code: "J45.20",
    name: "Mild Intermittent Asthma (Controlled)",
    dateRecorded: "04 Nov 2025",
    encounterId: "ENC-2025-0912",
    clinic: "Internal Medicine Clinic",
    doctor: "Dr. Tigist Mengistu",
    status: "Chronic",
    clinicalNotes:
      "Stable on Salbutamol inhaler PRN. Good technique confirmed during annual respiratory review.",
  },
  {
    id: "hdiag-2",
    code: "S51.81",
    name: "Superficial Forearm Laceration (Clean)",
    dateRecorded: "12 Aug 2025",
    encounterId: "ENC-2025-0671",
    clinic: "Emergency Room (ER)",
    doctor: "Dr. Tigist Mengistu",
    status: "Resolved",
    clinicalNotes: "Primary suture closure (3 nylon stitches). Healed with no cosmetic defect.",
  },
  {
    id: "hdiag-3",
    code: "T78.40",
    name: "Severe Type I Hypersensitivity Reaction (Penicillin G)",
    dateRecorded: "15 Mar 2025",
    encounterId: "ENC-2025-0210",
    clinic: "Adult OPD",
    doctor: "Dr. Dawit Alemu",
    status: "Chronic",
    clinicalNotes:
      "Allergy documentation: severe facial angioedema and urticaria upon amoxicillin exposure. Penicillins contraindicated.",
  },
]
