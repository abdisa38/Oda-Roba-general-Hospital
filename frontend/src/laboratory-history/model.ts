// ORHIMS — Phase 06, Prompt 35: Laboratory History and Record Retrieval Data Model
// Oda Roba General Hospital — Central Diagnostic Laboratory (Bale Robe, Ethiopia)

export type HistoricalPriority = "Routine" | "Urgent" | "STAT"
export type HistoricalOrderStatus = "Completed" | "Cancelled"
export type HistoricalResultStatus = "Released" | "Approved" | "Corrected or Amended"

export interface HistoricalAnalyte {
  name: string
  code: string
  value: string
  unit: string
  referenceInterval: string
  flag: "Normal" | "Low" | "High" | "Critical" | "Abnormal"
  interpretation?: string
  technicalComment?: string
}

export interface HistoricalAuditEntry {
  timestamp: string
  event: string
  user: string
  role: string
  details?: string
}

export interface CorrectionRecord {
  analyteName: string
  originalValue: string
  correctedValue: string
  unit: string
  referenceInterval: string
  correctedAt: string
  correctedBy: string
  correctionReason: string
  authorizedBy: string
  auditReference: string
}

export interface HistoricalComparisonPoint {
  date: string
  orderNumber: string
  value: string
  unit: string
  referenceInterval: string
  flag: "Normal" | "Low" | "High" | "Critical" | "Abnormal"
}

export interface HistoricalComparison {
  analyteName: string
  currentValue: string
  currentDate: string
  unit: string
  referenceInterval: string
  previousPoints: HistoricalComparisonPoint[]
  trendInterpretation: string
}

export interface HistoricalOrder {
  id: string // e.g. "ORD-LAB-2026-00102"
  orderNumber: string
  patientName: string
  patientId: string // e.g. "ORH-P-000174"
  ageGender: string
  dob: string
  encounterId: string
  wardDepartment: string
  orderingClinician: string
  orderingDepartment: string
  orderDateTime: string
  completionDateTime: string
  priority: HistoricalPriority
  orderStatus: HistoricalOrderStatus
  resultStatus: HistoricalResultStatus
  testSummary: string
  testCategory: "Hematology" | "Clinical Chemistry" | "Parasitology" | "Urinalysis" | "Microbiology / TB"
  recordVersion: number
  hasCorrection: boolean
  
  // Specimen Information
  specimenType: string
  specimenId: string
  collectionDateTime: string
  receiptDateTime: string
  accessionStatus: string
  specimenCondition: string

  // Results & Analytes
  analytes: HistoricalAnalyte[]
  
  // Review & Release Information
  reviewedBy: string
  reviewedAt: string
  approvedBy: string
  approvedAt: string
  releasedBy?: string
  releasedAt?: string
  isReleased: boolean

  // Timeline & Corrections
  auditTimeline: HistoricalAuditEntry[]
  corrections?: CorrectionRecord[]
  comparisons?: HistoricalComparison[]
}

/**
 * Fictional demonstration historical dataset for Oda Roba General Hospital
 * Central Diagnostic Laboratory.
 */
export const demoHistoricalOrders: HistoricalOrder[] = [
  {
    id: "ORD-LAB-2026-00138",
    orderNumber: "ORD-LAB-2026-00138",
    patientName: "Hana Mohammed",
    patientId: "ORH-P-000208",
    ageGender: "28y / Female",
    dob: "14 May 1998",
    encounterId: "ENC-2026-10048",
    wardDepartment: "Adult OPD-2",
    orderingClinician: "Dr. Dawit Alemu, MD",
    orderingDepartment: "General Outpatient Consultation (Adult OPD-2)",
    orderDateTime: "15 Oct 2026 · 09:15",
    completionDateTime: "15 Oct 2026 · 10:45",
    priority: "Urgent",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "Complete Blood Count (CBC) with 5-Part Differential",
    testCategory: "Hematology",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Whole Blood (EDTA)",
    specimenId: "SP-2026-9040",
    collectionDateTime: "15 Oct 2026 · 09:22",
    receiptDateTime: "15 Oct 2026 · 09:28",
    accessionStatus: "Accepted — Adequate volume, unhemolyzed, barcode verified",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Hemoglobin (Hgb)",
        code: "HGB",
        value: "9.2",
        unit: "g/dL",
        referenceInterval: "12.0 – 16.0",
        flag: "Low",
        interpretation: "Moderate microcytic hypochromic anemia.",
        technicalComment: "Verified on Mindray BC-5000 hematology analyzer."
      },
      {
        name: "Hematocrit (Hct)",
        code: "HCT",
        value: "28.5",
        unit: "%",
        referenceInterval: "36.0 – 48.0",
        flag: "Low"
      },
      {
        name: "White Blood Cells (WBC)",
        code: "WBC",
        value: "7.8",
        unit: "x10³/µL",
        referenceInterval: "4.0 – 11.0",
        flag: "Normal"
      },
      {
        name: "Platelet Count",
        code: "PLT",
        value: "245",
        unit: "x10³/µL",
        referenceInterval: "150 – 450",
        flag: "Normal"
      },
      {
        name: "MCV",
        code: "MCV",
        value: "71.4",
        unit: "fL",
        referenceInterval: "80.0 – 100.0",
        flag: "Low"
      },
      {
        name: "MCH",
        code: "MCH",
        value: "23.1",
        unit: "pg",
        referenceInterval: "27.0 – 33.0",
        flag: "Low"
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "15 Oct 2026 · 10:20",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "15 Oct 2026 · 10:35",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "15 Oct 2026 · 10:45",
    isReleased: true,
    auditTimeline: [
      { timestamp: "15 Oct 2026 · 09:15", event: "Order Created", user: "Dr. Dawit Alemu", role: "Attending Physician", details: "Urgent CBC requested for anemia evaluation." },
      { timestamp: "15 Oct 2026 · 09:22", event: "Specimen Collected", user: "Ato Getachew Tadesse", role: "Phlebotomist", details: "3 mL EDTA purple-top tube drawn." },
      { timestamp: "15 Oct 2026 · 09:28", event: "Specimen Accessioned", user: "Sr. Tirhas Wolde", role: "Laboratory Officer", details: "Specimen SP-2026-9040 verified and barcode scanned." },
      { timestamp: "15 Oct 2026 · 09:50", event: "Results Entered", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Analyzer Mindray BC-5000 output validated." },
      { timestamp: "15 Oct 2026 · 10:20", event: "Supervisory Review Complete", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Low Hb 9.2 confirmed against peripheral smear." },
      { timestamp: "15 Oct 2026 · 10:35", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Clinical sign-off complete." },
      { timestamp: "15 Oct 2026 · 10:45", event: "Results Released to EMR", user: "System Dispatcher", role: "Automated Release", details: "Released to Adult OPD-2 attending clinician workspace." }
    ],
    comparisons: [
      {
        analyteName: "Hemoglobin (Hgb)",
        currentValue: "9.2",
        currentDate: "15 Oct 2026",
        unit: "g/dL",
        referenceInterval: "12.0 – 16.0",
        previousPoints: [
          { date: "02 Sep 2026", orderNumber: "ORD-LAB-2026-00052", value: "8.4", unit: "g/dL", referenceInterval: "12.0 – 16.0", flag: "Low" },
          { date: "14 Jul 2026", orderNumber: "ORD-LAB-2026-00018", value: "7.9", unit: "g/dL", referenceInterval: "12.0 – 16.0", flag: "Low" }
        ],
        trendInterpretation: "Hemoglobin displays positive upward trajectory (+0.8 g/dL over 6 weeks) following oral iron therapy initiation."
      }
    ]
  },
  {
    id: "ORD-LAB-2026-00102",
    orderNumber: "ORD-LAB-2026-00102",
    patientName: "Fatuma Kedir",
    patientId: "ORH-P-000174",
    ageGender: "44y / Female",
    dob: "20 Aug 1982",
    encounterId: "ENC-2026-09880",
    wardDepartment: "Maternal Health Clinic (ANC)",
    orderingClinician: "Dr. Aster Bekele, MD",
    orderingDepartment: "Maternity & Reproductive Health (ANC)",
    orderDateTime: "10 Oct 2026 · 08:30",
    completionDateTime: "10 Oct 2026 · 11:15",
    priority: "Routine",
    orderStatus: "Completed",
    resultStatus: "Corrected or Amended",
    testSummary: "Fasting Blood Sugar (FBS) & HbA1c",
    testCategory: "Clinical Chemistry",
    recordVersion: 2,
    hasCorrection: true,
    specimenType: "Venous Serum (Fluoride Oxalate)",
    specimenId: "SP-2026-8794",
    collectionDateTime: "10 Oct 2026 · 08:42",
    receiptDateTime: "10 Oct 2026 · 08:50",
    accessionStatus: "Accepted — Grey-top fluoride tube, unhemolyzed",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Fasting Blood Glucose",
        code: "FBS",
        value: "142",
        unit: "mg/dL",
        referenceInterval: "70 – 100",
        flag: "High",
        interpretation: "Elevated fasting hyperglycemia; gestational diabetes follow-up indicated.",
        technicalComment: "Amended result. Re-analyzed on Cobas c111."
      },
      {
        name: "Hemoglobin A1c",
        code: "HBA1C",
        value: "6.8",
        unit: "%",
        referenceInterval: "4.0 – 5.6",
        flag: "High",
        interpretation: "Consistent with suboptimally controlled glycemic history."
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "10 Oct 2026 · 10:45",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "10 Oct 2026 · 11:00",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "10 Oct 2026 · 11:15",
    isReleased: true,
    corrections: [
      {
        analyteName: "Fasting Blood Glucose",
        originalValue: "280",
        correctedValue: "142",
        unit: "mg/dL",
        referenceInterval: "70 – 100",
        correctedAt: "10 Oct 2026 · 10:35",
        correctedBy: "Sr. Tirhas Wolde (Senior Lab Officer)",
        correctionReason: "Initial dilution factor of 2x was applied erroneously by entry technician. Sample was re-assayed in neat serum on Cobas c111 confirming true FBS of 142 mg/dL.",
        authorizedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
        auditReference: "CORR-2026-0041"
      }
    ],
    auditTimeline: [
      { timestamp: "10 Oct 2026 · 08:30", event: "Order Created", user: "Dr. Aster Bekele", role: "Attending Obstetrician", details: "Routine ANC gestational diabetes screening." },
      { timestamp: "10 Oct 2026 · 08:42", event: "Specimen Collected", user: "Nurse Genet Mengistu", role: "Clinic Nurse", details: "Fasting confirmed >8 hours." },
      { timestamp: "10 Oct 2026 · 08:50", event: "Specimen Received", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Accessioned under SP-2026-8794." },
      { timestamp: "10 Oct 2026 · 09:30", event: "Initial Results Entered", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Entered FBS as 280 mg/dL with 2x multiplier." },
      { timestamp: "10 Oct 2026 · 10:15", event: "Correction Requested", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Value questioned against HbA1c 6.8%. Re-test requested." },
      { timestamp: "10 Oct 2026 · 10:35", event: "Result Amended (v2)", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Dilution error corrected to neat run 142 mg/dL. Reason documented." },
      { timestamp: "10 Oct 2026 · 11:00", event: "Amended Result Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Pathology sign-off on amendment CORR-2026-0041." },
      { timestamp: "10 Oct 2026 · 11:15", event: "Amended Result Released", user: "System Dispatcher", role: "Automated Release", details: "Updated record broadcasted to ANC clinic." }
    ],
    comparisons: [
      {
        analyteName: "Fasting Blood Glucose",
        currentValue: "142",
        currentDate: "10 Oct 2026",
        unit: "mg/dL",
        referenceInterval: "70 – 100",
        previousPoints: [
          { date: "12 Aug 2026", orderNumber: "ORD-LAB-2026-00034", value: "138", unit: "mg/dL", referenceInterval: "70 – 100", flag: "High" }
        ],
        trendInterpretation: "FBS remains mildly elevated in the 138–142 mg/dL range across 8 weeks."
      }
    ]
  },
  {
    id: "ORD-LAB-2026-00135",
    orderNumber: "ORD-LAB-2026-00135",
    patientName: "Almaz Kebede",
    patientId: "ORH-P-000192",
    ageGender: "62y / Female",
    dob: "11 Dec 1963",
    encounterId: "ENC-2026-10022",
    wardDepartment: "Emergency Department",
    orderingClinician: "Dr. Yonas Girma, MD",
    orderingDepartment: "Emergency Department (Resuscitation)",
    orderDateTime: "14 Oct 2026 · 14:10",
    completionDateTime: "14 Oct 2026 · 15:05",
    priority: "STAT",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "Renal Function Panel & Serum Electrolytes",
    testCategory: "Clinical Chemistry",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Venous Serum (SST Gold Top)",
    specimenId: "SP-2026-9012",
    collectionDateTime: "14 Oct 2026 · 14:18",
    receiptDateTime: "14 Oct 2026 · 14:24",
    accessionStatus: "Accepted — Visual inspection verified: 0% hemolysis index",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Potassium (K+)",
        code: "K",
        value: "6.4",
        unit: "mmol/L",
        referenceInterval: "3.5 – 5.0",
        flag: "Critical",
        interpretation: "CRITICAL PANIC VALUE: Severe hyperkalemia with cardiac arrhythmia risk.",
        technicalComment: "Repeated on duplicate aliquot. Unhemolyzed serum confirmed."
      },
      {
        name: "Sodium (Na+)",
        code: "NA",
        value: "138",
        unit: "mmol/L",
        referenceInterval: "135 – 145",
        flag: "Normal"
      },
      {
        name: "Chloride (Cl-)",
        code: "CL",
        value: "102",
        unit: "mmol/L",
        referenceInterval: "98 – 107",
        flag: "Normal"
      },
      {
        name: "Blood Urea Nitrogen",
        code: "BUN",
        value: "42.0",
        unit: "mg/dL",
        referenceInterval: "7.0 – 20.0",
        flag: "High"
      },
      {
        name: "Serum Creatinine",
        code: "CREAT",
        value: "2.8",
        unit: "mg/dL",
        referenceInterval: "0.6 – 1.1",
        flag: "High",
        interpretation: "Acute on chronic renal impairment."
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "14 Oct 2026 · 14:48",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "14 Oct 2026 · 14:55",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "14 Oct 2026 · 15:05",
    isReleased: true,
    auditTimeline: [
      { timestamp: "14 Oct 2026 · 14:10", event: "Order Created", user: "Dr. Yonas Girma", role: "Emergency Clinician", details: "STAT renal panel for acute weakness & oliguria." },
      { timestamp: "14 Oct 2026 · 14:18", event: "Specimen Collected", user: "Nurse Chaltu Abera", role: "ED Staff Nurse", details: "Direct venipuncture, labeled at bedside." },
      { timestamp: "14 Oct 2026 · 14:24", event: "Specimen Accessioned", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Emergency runner delivery. Verified." },
      { timestamp: "14 Oct 2026 · 14:42", event: "Critical Result Detected", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "K+ 6.4 mmol/L flagged by electrolyte analyzer." },
      { timestamp: "14 Oct 2026 · 14:45", event: "Telephone Read-Back Escalation", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Critical call placed to Dr. Yonas Girma (ED). Full read-back received and confirmed." },
      { timestamp: "14 Oct 2026 · 14:55", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Approved with critical escalation audit trail attached." },
      { timestamp: "14 Oct 2026 · 15:05", event: "Results Released", user: "System Dispatcher", role: "Automated Release", details: "Critical banner broadcasted to ED central telemetry console." }
    ]
  },
  {
    id: "ORD-LAB-2026-00117",
    orderNumber: "ORD-LAB-2026-00117",
    patientName: "Tolosa Desta",
    patientId: "ORH-P-000215",
    ageGender: "19y / Male",
    dob: "05 Mar 2007",
    encounterId: "ENC-2026-09940",
    wardDepartment: "Pediatric / Youth OPD-1",
    orderingClinician: "Dr. Helen Tadesse, MD",
    orderingDepartment: "Pediatric Consultation (OPD-1)",
    orderDateTime: "12 Oct 2026 · 11:00",
    completionDateTime: "12 Oct 2026 · 11:45",
    priority: "STAT",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "Malaria Rapid Test (mRDT) & Giemsa Blood Film",
    testCategory: "Parasitology",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Capillary Whole Blood (Fingerstick)",
    specimenId: "SP-2026-8910",
    collectionDateTime: "12 Oct 2026 · 11:08",
    receiptDateTime: "12 Oct 2026 · 11:12",
    accessionStatus: "Accepted — Fingerstick blood collected onto slide and RDT cassette",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Malaria mRDT (Pf / Pan)",
        code: "RDT-MAL",
        value: "Positive (P. falciparum)",
        unit: "Qualitative",
        referenceInterval: "Negative",
        flag: "Abnormal",
        interpretation: "Histidine-Rich Protein II (HRP-2) antigen positive for Plasmodium falciparum."
      },
      {
        name: "Blood Film Microscopy",
        code: "BF-MICR",
        value: "Positive: P. falciparum ring forms (2+)",
        unit: "Parasite Density",
        referenceInterval: "No hemoparasites seen",
        flag: "Abnormal",
        interpretation: "Estimated parasite density ~18,000 parasites/µL.",
        technicalComment: "Thick and thin smears examined under 100x oil immersion. Schizonts not observed."
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "12 Oct 2026 · 11:32",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "12 Oct 2026 · 11:40",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "12 Oct 2026 · 11:45",
    isReleased: true,
    auditTimeline: [
      { timestamp: "12 Oct 2026 · 11:00", event: "Order Created", user: "Dr. Helen Tadesse", role: "Pediatrician", details: "STAT malaria screening for high-grade fever with chills." },
      { timestamp: "12 Oct 2026 · 11:08", event: "Specimen Collected", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Capillary sample drawn at lab phlebotomy booth." },
      { timestamp: "12 Oct 2026 · 11:28", event: "Results Entered", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "RDT read at 15 mins; Giemsa stain microscopy verified." },
      { timestamp: "12 Oct 2026 · 11:32", event: "Supervisory Review Complete", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Microscopy density confirmed." },
      { timestamp: "12 Oct 2026 · 11:40", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Authorized." },
      { timestamp: "12 Oct 2026 · 11:45", event: "Results Released", user: "System Dispatcher", role: "Automated Release", details: "Dispatched to Pediatric OPD-1." }
    ]
  },
  {
    id: "ORD-LAB-2026-00091",
    orderNumber: "ORD-LAB-2026-00091",
    patientName: "Abebe Bekele",
    patientId: "ORH-P-000185",
    ageGender: "51y / Male",
    dob: "18 Jun 1975",
    encounterId: "ENC-2026-09720",
    wardDepartment: "Chronic Care Clinic (NCD)",
    orderingClinician: "Dr. Dawit Alemu, MD",
    orderingDepartment: "Non-Communicable Diseases (NCD Clinic)",
    orderDateTime: "08 Oct 2026 · 09:00",
    completionDateTime: "08 Oct 2026 · 10:30",
    priority: "Routine",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "Comprehensive Lipid Panel & Liver Function",
    testCategory: "Clinical Chemistry",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Venous Serum (SST Gold Top)",
    specimenId: "SP-2026-8650",
    collectionDateTime: "08 Oct 2026 · 09:12",
    receiptDateTime: "08 Oct 2026 · 09:20",
    accessionStatus: "Accepted — Clear non-lipemic serum",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Total Cholesterol",
        code: "CHOL",
        value: "218",
        unit: "mg/dL",
        referenceInterval: "< 200",
        flag: "High"
      },
      {
        name: "Triglycerides",
        code: "TRIG",
        value: "165",
        unit: "mg/dL",
        referenceInterval: "< 150",
        flag: "High"
      },
      {
        name: "HDL Cholesterol",
        code: "HDL",
        value: "42",
        unit: "mg/dL",
        referenceInterval: "> 40",
        flag: "Normal"
      },
      {
        name: "LDL Cholesterol",
        code: "LDL",
        value: "143",
        unit: "mg/dL",
        referenceInterval: "< 100",
        flag: "High"
      },
      {
        name: "Alanine Aminotransferase (ALT)",
        code: "ALT",
        value: "28",
        unit: "U/L",
        referenceInterval: "10 – 49",
        flag: "Normal"
      },
      {
        name: "Aspartate Aminotransferase (AST)",
        code: "AST",
        value: "24",
        unit: "U/L",
        referenceInterval: "10 – 34",
        flag: "Normal"
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "08 Oct 2026 · 10:10",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "08 Oct 2026 · 10:20",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "08 Oct 2026 · 10:30",
    isReleased: true,
    auditTimeline: [
      { timestamp: "08 Oct 2026 · 09:00", event: "Order Created", user: "Dr. Dawit Alemu", role: "NCD Clinician", details: "Quarterly cardiovascular risk follow-up." },
      { timestamp: "08 Oct 2026 · 09:12", event: "Specimen Collected", user: "Ato Getachew Tadesse", role: "Phlebotomist", details: "Gold SST tube drawn." },
      { timestamp: "08 Oct 2026 · 09:20", event: "Specimen Received", user: "Sr. Tirhas Wolde", role: "Lab Officer", details: "Centrifuged and run on Cobas c111." },
      { timestamp: "08 Oct 2026 · 10:10", event: "Supervisory Review Complete", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Elevated lipids verified." },
      { timestamp: "08 Oct 2026 · 10:20", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Approved." },
      { timestamp: "08 Oct 2026 · 10:30", event: "Results Released", user: "System Dispatcher", role: "Automated Release", details: "Dispatched to NCD clinic." }
    ],
    comparisons: [
      {
        analyteName: "Total Cholesterol",
        currentValue: "218",
        currentDate: "08 Oct 2026",
        unit: "mg/dL",
        referenceInterval: "< 200",
        previousPoints: [
          { date: "15 Jul 2026", orderNumber: "ORD-LAB-2026-00020", value: "246", unit: "mg/dL", referenceInterval: "< 200", flag: "High" }
        ],
        trendInterpretation: "Total cholesterol improved from 246 to 218 mg/dL following dietary modification and statin initiation."
      }
    ]
  },
  {
    id: "ORD-LAB-2026-00129",
    orderNumber: "ORD-LAB-2026-00129",
    patientName: "Girma Worku",
    patientId: "ORH-P-000160",
    ageGender: "38y / Male",
    dob: "02 Feb 1988",
    encounterId: "ENC-2026-09990",
    wardDepartment: "Adult OPD-1",
    orderingClinician: "Dr. Dawit Alemu, MD",
    orderingDepartment: "General Outpatient Consultation (Adult OPD-1)",
    orderDateTime: "13 Oct 2026 · 10:20",
    completionDateTime: "13 Oct 2026 · 11:30",
    priority: "Routine",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "Urinalysis Complete Dipstick & Microscopy",
    testCategory: "Urinalysis",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Midstream Clean-Catch Urine",
    specimenId: "SP-2026-8980",
    collectionDateTime: "13 Oct 2026 · 10:35",
    receiptDateTime: "13 Oct 2026 · 10:40",
    accessionStatus: "Accepted — Clean sterile cup, adequate 40 mL volume",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "Color & Appearance",
        code: "URI-COL",
        value: "Straw / Clear",
        unit: "Visual",
        referenceInterval: "Pale yellow / Clear",
        flag: "Normal"
      },
      {
        name: "Specific Gravity",
        code: "URI-SG",
        value: "1.018",
        unit: "—",
        referenceInterval: "1.005 – 1.030",
        flag: "Normal"
      },
      {
        name: "pH",
        code: "URI-PH",
        value: "6.0",
        unit: "pH units",
        referenceInterval: "5.0 – 8.0",
        flag: "Normal"
      },
      {
        name: "Protein",
        code: "URI-PRO",
        value: "Negative",
        unit: "Qualitative",
        referenceInterval: "Negative",
        flag: "Normal"
      },
      {
        name: "Glucose",
        code: "URI-GLU",
        value: "Negative",
        unit: "Qualitative",
        referenceInterval: "Negative",
        flag: "Normal"
      },
      {
        name: "Leukocyte Esterase",
        code: "URI-LEU",
        value: "Negative",
        unit: "Qualitative",
        referenceInterval: "Negative",
        flag: "Normal"
      },
      {
        name: "Nitrite",
        code: "URI-NIT",
        value: "Negative",
        unit: "Qualitative",
        referenceInterval: "Negative",
        flag: "Normal"
      },
      {
        name: "Microscopic RBCs",
        code: "MICR-RBC",
        value: "0 – 1 / HPF",
        unit: "/ HPF",
        referenceInterval: "0 – 2 / HPF",
        flag: "Normal"
      },
      {
        name: "Microscopic WBCs",
        code: "MICR-WBC",
        value: "1 – 2 / HPF",
        unit: "/ HPF",
        referenceInterval: "0 – 5 / HPF",
        flag: "Normal"
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "13 Oct 2026 · 11:15",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "13 Oct 2026 · 11:22",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "13 Oct 2026 · 11:30",
    isReleased: true,
    auditTimeline: [
      { timestamp: "13 Oct 2026 · 10:20", event: "Order Created", user: "Dr. Dawit Alemu", role: "Attending Physician", details: "Routine checkup urinalysis." },
      { timestamp: "13 Oct 2026 · 10:35", event: "Specimen Collected", user: "Nurse Genet Mengistu", role: "OPD Staff Nurse", details: "Clean catch instructions provided." },
      { timestamp: "13 Oct 2026 · 10:40", event: "Specimen Accessioned", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Dipstick and centrifuge examination completed." },
      { timestamp: "13 Oct 2026 · 11:15", event: "Supervisory Review Complete", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Normal parameters verified." },
      { timestamp: "13 Oct 2026 · 11:22", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Signed off." },
      { timestamp: "13 Oct 2026 · 11:30", event: "Results Released", user: "System Dispatcher", role: "Automated Release", details: "Released to Adult OPD-1." }
    ]
  },
  {
    id: "ORD-LAB-2026-00084",
    orderNumber: "ORD-LAB-2026-00084",
    patientName: "Chala Tufa",
    patientId: "ORH-P-000155",
    ageGender: "49y / Male",
    dob: "24 Nov 1976",
    encounterId: "ENC-2026-09650",
    wardDepartment: "Chest / TB Clinic",
    orderingClinician: "Dr. Aster Bekele, MD",
    orderingDepartment: "Pulmonary & TB Clinic",
    orderDateTime: "05 Oct 2026 · 08:45",
    completionDateTime: "05 Oct 2026 · 11:30",
    priority: "Routine",
    orderStatus: "Completed",
    resultStatus: "Released",
    testSummary: "GeneXpert MTB/RIF & Sputum AFB Microscopy",
    testCategory: "Microbiology / TB",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Early Morning Sputum (Purulent)",
    specimenId: "SP-2026-8512",
    collectionDateTime: "05 Oct 2026 · 09:00",
    receiptDateTime: "05 Oct 2026 · 09:15",
    accessionStatus: "Accepted — Mucopurulent sputum in biohazard falcon tube",
    specimenCondition: "Optimal",
    analytes: [
      {
        name: "MTB Nucleic Acid (GeneXpert)",
        code: "XPERT-MTB",
        value: "MTB Not Detected",
        unit: "PCR Assay",
        referenceInterval: "Not Detected",
        flag: "Normal",
        interpretation: "Mycobacterium tuberculosis DNA not detected in sputum specimen."
      },
      {
        name: "Rifampicin Resistance",
        code: "XPERT-RIF",
        value: "Indeterminate / NA (MTB negative)",
        unit: "Molecular Probe",
        referenceInterval: "Susceptible",
        flag: "Normal"
      },
      {
        name: "Sputum AFB Smear (Ziehl-Neelsen)",
        code: "AFB-ZN",
        value: "No Acid Fast Bacilli Seen (0 AFB / 100 fields)",
        unit: "Microscopic Count",
        referenceInterval: "Negative (No AFB)",
        flag: "Normal",
        technicalComment: "Examined by senior microscopist under 100x oil immersion."
      }
    ],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "05 Oct 2026 · 11:05",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "05 Oct 2026 · 11:20",
    releasedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    releasedAt: "05 Oct 2026 · 11:30",
    isReleased: true,
    auditTimeline: [
      { timestamp: "05 Oct 2026 · 08:45", event: "Order Created", user: "Dr. Aster Bekele", role: "Chest Clinician", details: "Chronic cough evaluation." },
      { timestamp: "05 Oct 2026 · 09:00", event: "Specimen Collected", user: "Nurse Genet Mengistu", role: "TB Booth Nurse", details: "Deep cough sputum collected in outdoor booth." },
      { timestamp: "05 Oct 2026 · 09:15", event: "Specimen Received", user: "Ato Getachew Tadesse", role: "Lab Technician", details: "Sample buffer reagent added (2:1 ratio)." },
      { timestamp: "05 Oct 2026 · 11:05", event: "Supervisory Review Complete", user: "Sr. Tirhas Wolde", role: "Senior Lab Officer", details: "Cartridge run completed without internal error flags." },
      { timestamp: "05 Oct 2026 · 11:20", event: "Results Approved", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Signed off." },
      { timestamp: "05 Oct 2026 · 11:30", event: "Results Released", user: "System Dispatcher", role: "Automated Release", details: "Delivered to Chest Clinic." }
    ]
  },
  {
    id: "ORD-LAB-2026-00078",
    orderNumber: "ORD-LAB-2026-00078",
    patientName: "Kalkidan Fikre",
    patientId: "ORH-P-000142",
    ageGender: "31y / Female",
    dob: "15 Sep 1995",
    encounterId: "ENC-2026-09510",
    wardDepartment: "Adult OPD-2",
    orderingClinician: "Dr. Dawit Alemu, MD",
    orderingDepartment: "General Outpatient Consultation (Adult OPD-2)",
    orderDateTime: "02 Oct 2026 · 14:00",
    completionDateTime: "02 Oct 2026 · 15:30",
    priority: "Routine",
    orderStatus: "Cancelled",
    resultStatus: "Approved",
    testSummary: "Electrolytes & Serum Calcium",
    testCategory: "Clinical Chemistry",
    recordVersion: 1,
    hasCorrection: false,
    specimenType: "Venous Blood (SST Gold Top)",
    specimenId: "SP-2026-8430",
    collectionDateTime: "02 Oct 2026 · 14:15",
    receiptDateTime: "02 Oct 2026 · 14:25",
    accessionStatus: "Rejected — Gross 4+ hemolysis visible post-centrifugation",
    specimenCondition: "Grossly Hemolyzed (Unsuitable for potassium & calcium analysis)",
    analytes: [],
    reviewedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
    reviewedAt: "02 Oct 2026 · 14:50",
    approvedBy: "Dr. Dawit Alemayehu, Chief Pathologist",
    approvedAt: "02 Oct 2026 · 15:20",
    isReleased: false,
    auditTimeline: [
      { timestamp: "02 Oct 2026 · 14:00", event: "Order Created", user: "Dr. Dawit Alemu", role: "Attending Physician", details: "Electrolytes requested for fatigue." },
      { timestamp: "02 Oct 2026 · 14:15", event: "Specimen Collected", user: "Ato Getachew Tadesse", role: "Phlebotomist", details: "Difficult draw reported." },
      { timestamp: "02 Oct 2026 · 14:25", event: "Specimen Received & Rejected", user: "Sr. Tirhas Wolde", role: "Lab Officer", details: "Centrifuged; severe 4+ dark red hemolysis index." },
      { timestamp: "02 Oct 2026 · 14:50", event: "Clinician Notification & Re-draw Request", user: "Sr. Tirhas Wolde", role: "Lab Officer", details: "Notified Adult OPD-2. Patient reported had departed hospital and preferred re-booking next appointment." },
      { timestamp: "02 Oct 2026 · 15:20", event: "Order Formally Cancelled", user: "Dr. Dawit Alemayehu", role: "Chief Pathologist", details: "Order cancelled with documented cause: patient left prior to recollection. Re-order required upon return." }
    ]
  }
]
