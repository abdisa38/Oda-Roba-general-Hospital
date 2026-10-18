// ORHIMS — Phase 09: Complete Inpatient & Emergency Management Module
// Oda Roba General Hospital — Bale Robe, Oromia, Ethiopia

import React, { useEffect, useMemo, useState } from "react"
import Icon from "../Icon"
import { Button } from "../permissions/ui"
import {
  INITIAL_ADMISSIONS,
  INITIAL_BEDS,
  INITIAL_DISCHARGES,
  INITIAL_EMERGENCY_QUEUE,
  INITIAL_WARDS,
  TRIAGE_PRIORITIES,
  type BedStatus,
  type EmergencyPatient,
  type EmergencyStatus,
  type HospitalBed,
  type HospitalWard,
  type InpatientAdmission,
  type InpatientDischarge,
  type TriagePriority,
} from "./model"
import "./inpatient-emergency.css"

interface InpatientEmergencyPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
  initialTab?: "emergency-dashboard" | "emergency-triage" | "admissions" | "ward-management" | "bed-management" | "discharges"
}

export default function InpatientEmergencyPage({
  state = "ready",
  permissions,
  onNavigate,
  initialTab = "emergency-dashboard",
}: InpatientEmergencyPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("emergency-dashboard") ||
    permissions.has("emergency-triage") ||
    permissions.has("admissions") ||
    permissions.has("ward-management") ||
    permissions.has("bed-management") ||
    permissions.has("discharges") ||
    permissions.has("doctor") ||
    permissions.has("management")

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<
    "emergency-dashboard" | "emergency-triage" | "admissions" | "ward-management" | "bed-management" | "discharges"
  >(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Master Data State
  const [emergencyQueue, setEmergencyQueue] = useState<EmergencyPatient[]>(INITIAL_EMERGENCY_QUEUE)
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>(INITIAL_ADMISSIONS)
  const [wards, setWards] = useState<HospitalWard[]>(INITIAL_WARDS)
  const [beds, setBeds] = useState<HospitalBed[]>(INITIAL_BEDS)
  const [discharges, setDischarges] = useState<InpatientDischarge[]>(INITIAL_DISCHARGES)

  // Filters & Search
  const [emergencySearch, setEmergencySearch] = useState("")
  const [emergencyPriorityFilter, setEmergencyPriorityFilter] = useState<string>("all")
  const [emergencyStatusFilter, setEmergencyStatusFilter] = useState<string>("all")

  const [admissionSearch, setAdmissionSearch] = useState("")
  const [admissionWardFilter, setAdmissionWardFilter] = useState<string>("all")
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState<string>("all")

  const [bedWardFilter, setBedWardFilter] = useState<string>("all")
  const [bedStatusFilter, setBedStatusFilter] = useState<string>("all")
  const [bedViewMode, setBedViewMode] = useState<"board" | "table">("board")

  const [dischargeSearch, setDischargeSearch] = useState("")
  const [dischargeStatusFilter, setDischargeStatusFilter] = useState<string>("all")

  // Selected entities for drawers & modals
  const [selectedEmergencyPatient, setSelectedEmergencyPatient] = useState<EmergencyPatient | null>(null)
  const [selectedAdmission, setSelectedAdmission] = useState<InpatientAdmission | null>(null)
  const [selectedWard, setSelectedWard] = useState<HospitalWard | null>(null)
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null)
  const [selectedDischarge, setSelectedDischarge] = useState<InpatientDischarge | null>(null)

  // Modal dialog states
  const [registerArrivalOpen, setRegisterArrivalOpen] = useState(false)
  const [admissionWizardOpen, setAdmissionWizardOpen] = useState(false)
  const [dischargeWizardOpen, setDischargeWizardOpen] = useState(false)
  const [transferBedOpen, setTransferBedOpen] = useState(false)
  const [wardConfigOpen, setWardConfigOpen] = useState(false)
  const [bedConflictAlert, setBedConflictAlert] = useState<string | null>(null)

  // Toast / Operation confirmation feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // ---------------------------------------------------------
  // EMERGENCY TRIAGE FORM STATE
  // ---------------------------------------------------------
  const [triagePatientId, setTriagePatientId] = useState<string>(
    INITIAL_EMERGENCY_QUEUE[4]?.id || ""
  )
  const activeTriagePatient = useMemo(
    () => emergencyQueue.find((p) => p.id === triagePatientId) || emergencyQueue[0],
    [emergencyQueue, triagePatientId]
  )

  const [triageVitals, setTriageVitals] = useState({
    bpSystolic: "120",
    bpDiastolic: "78",
    pulse: "76",
    rr: "16",
    temp: "36.6",
    spO2: "99",
    pain: "5",
  })
  const [triagePriority, setTriagePriority] = useState<TriagePriority>("green")
  const [triageObservations, setTriageObservations] = useState(
    "Alert and oriented. Right forearm laceration without distal neurovascular deficit."
  )
  const [triageAllergies, setTriageAllergies] = useState("No known allergies")
  const [triageDisposition, setTriageDisposition] = useState("awaiting-assessment")
  const [triageAssessor, setTriageAssessor] = useState("Nurse Rahel Kebede, B.Sc.")

  // Sync active triage patient info when selection changes
  useEffect(() => {
    if (activeTriagePatient) {
      const bpParts = (activeTriagePatient.vitalSigns.bloodPressure || "120/80").split("/")
      setTriageVitals({
        bpSystolic: bpParts[0] || "120",
        bpDiastolic: bpParts[1] || "80",
        pulse: String(activeTriagePatient.vitalSigns.pulseRate || 75),
        rr: String(activeTriagePatient.vitalSigns.respiratoryRate || 18),
        temp: String(activeTriagePatient.vitalSigns.temperature || 36.8),
        spO2: String(activeTriagePatient.vitalSigns.spO2 || 98),
        pain: String(activeTriagePatient.vitalSigns.painScore || 0),
      })
      if (activeTriagePatient.triagePriority !== "unassigned") {
        setTriagePriority(activeTriagePatient.triagePriority as TriagePriority)
      }
      setTriageObservations(activeTriagePatient.clinicalNotes || "")
      setTriageAllergies(activeTriagePatient.allergies || "No known allergies")
    }
  }, [triagePatientId, activeTriagePatient])

  // Save Triage Assessment
  const handleSaveTriage = (isDraft: boolean) => {
    if (!activeTriagePatient) return
    const updated = emergencyQueue.map((p) => {
      if (p.id === activeTriagePatient.id) {
        return {
          ...p,
          triagePriority,
          vitalSigns: {
            bloodPressure: `${triageVitals.bpSystolic}/${triageVitals.bpDiastolic}`,
            pulseRate: Number(triageVitals.pulse),
            respiratoryRate: Number(triageVitals.rr),
            temperature: Number(triageVitals.temp),
            spO2: Number(triageVitals.spO2),
            painScore: Number(triageVitals.pain),
          },
          clinicalNotes: triageObservations,
          allergies: triageAllergies,
          status: isDraft ? ("awaiting-triage" as EmergencyStatus) : ("awaiting-assessment" as EmergencyStatus),
          isDraftTriage: isDraft,
        }
      }
      return p
    })
    setEmergencyQueue(updated)
    showToast(
      isDraft
        ? `Triage assessment draft saved for ${activeTriagePatient.patientName}.`
        : `Triage finalized for ${activeTriagePatient.patientName} (${TRIAGE_PRIORITIES[triagePriority].name}).`
    )
  }

  // ---------------------------------------------------------
  // 5-STEP GUIDED ADMISSION WIZARD STATE
  // ---------------------------------------------------------
  const [admissionStep, setAdmissionStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [admissionForm, setAdmissionForm] = useState({
    patientId: "ORH-P-00219",
    patientName: "Dawit Kebede",
    age: 32,
    gender: "Male" as "Female" | "Male",
    admissionReason: "Blunt abdominal trauma, hemoperitoneum, urgent exploratory laparotomy",
    primaryDiagnosis: "Splenic laceration grade III & Hemoperitoneum",
    referringDepartment: "Emergency" as "Emergency" | "OPD Internal Medicine" | "General Surgery" | "Obstetrics & Gyn" | "Pediatrics",
    referringClinician: "Dr. Aster Lemma, MD",
    attendingPhysician: "Dr. Yohannes Haile, Lead Surgeon",
    wardId: "WARD-SURG",
    bedId: "BED-SURG-03",
    admissionNotes: "Type and crossmatch 2 units packed RBCs. Patient NPO since 14:00.",
    estimatedStayDays: 7,
    emergencyOriginId: "EM-2026-002",
  })

  // Start Admission for an Emergency Patient
  const startAdmissionFromEmergency = (patient: EmergencyPatient) => {
    setAdmissionForm({
      patientId: patient.patientId,
      patientName: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      admissionReason: patient.presentingComplaint,
      primaryDiagnosis: patient.clinicalNotes || "Acute Emergency Admission",
      referringDepartment: "Emergency",
      referringClinician: patient.assignedClinician || "Dr. Aster Lemma, MD",
      attendingPhysician: "Dr. Daniel Abate, MD",
      wardId: patient.gender === "Female" ? "WARD-FM" : "WARD-MM",
      bedId: "",
      admissionNotes: patient.triageNotes || "Admitted directly from Emergency Department.",
      estimatedStayDays: 4,
      emergencyOriginId: patient.id,
    })
    setAdmissionStep(2)
    setAdmissionWizardOpen(true)
  }

  // Complete Admission
  const handleCompleteAdmission = () => {
    // Validate target bed
    const targetBed = beds.find((b) => b.id === admissionForm.bedId)
    if (!targetBed || targetBed.status === "occupied" || targetBed.status === "maintenance") {
      setBedConflictAlert(`Bed ${admissionForm.bedId} is no longer available. Please select an available bed.`)
      return
    }

    const newRef = `ADM-2026-0${admissions.length + 84}`
    const targetWard = wards.find((w) => w.id === admissionForm.wardId)

    const newAdmission: InpatientAdmission = {
      admissionRef: newRef,
      patientId: admissionForm.patientId,
      patientName: admissionForm.patientName,
      age: admissionForm.age,
      gender: admissionForm.gender,
      admissionDate: "2026-10-16",
      admissionTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      admissionReason: admissionForm.admissionReason,
      primaryDiagnosis: admissionForm.primaryDiagnosis,
      referringDepartment: admissionForm.referringDepartment,
      referringClinician: admissionForm.referringClinician,
      wardId: admissionForm.wardId,
      wardName: targetWard?.name || "Inpatient Ward",
      bedId: admissionForm.bedId,
      bedLabel: targetBed.bedNumber,
      attendingPhysician: admissionForm.attendingPhysician,
      status: "admitted",
      admissionNotes: admissionForm.admissionNotes,
      estimatedStayDays: admissionForm.estimatedStayDays,
      emergencyOriginId: admissionForm.emergencyOriginId,
    }

    // 1. Add admission record
    setAdmissions([newAdmission, ...admissions])

    // 2. Mark Bed as occupied
    setBeds(
      beds.map((b) =>
        b.id === admissionForm.bedId
          ? {
              ...b,
              status: "occupied" as BedStatus,
              currentPatientId: admissionForm.patientId,
              currentPatientName: admissionForm.patientName,
              admissionRef: newRef,
              occupiedSince: "2026-10-16",
            }
          : b
      )
    )

    // 3. Update Ward counts
    setWards(
      wards.map((w) =>
        w.id === admissionForm.wardId
          ? {
              ...w,
              occupiedBeds: w.occupiedBeds + 1,
              availableBeds: Math.max(0, w.availableBeds - 1),
              inpatientCount: w.inpatientCount + 1,
            }
          : w
      )
    )

    // 4. Update Emergency Patient status if admitted from Emergency
    if (admissionForm.emergencyOriginId) {
      setEmergencyQueue(
        emergencyQueue.map((p) =>
          p.id === admissionForm.emergencyOriginId
            ? { ...p, status: "transferred" as EmergencyStatus }
            : p
        )
      )
    }

    setAdmissionWizardOpen(false)
    setAdmissionStep(1)
    showToast(`Patient ${admissionForm.patientName} admitted to ${targetWard?.name} (${targetBed.bedNumber}). Ref: ${newRef}`)
  }

  // ---------------------------------------------------------
  // 5-STEP GUIDED DISCHARGE WIZARD STATE
  // ---------------------------------------------------------
  const [dischargeStep, setDischargeStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [dischargeForm, setDischargeForm] = useState({
    admissionRef: "ADM-2026-061",
    authorizingPhysician: "Dr. Daniel Abate, MD",
    destination: "Home with Care Plan" as InpatientDischarge["destination"],
    clinicalSummary: "Patient with right MCA ischemic stroke showed progressive motor recovery on physiotherapy. Power 4/5, speech clear, vital signs stable, swallowing assessment passed.",
    dischargeMedications: "Aspirin 81 mg daily, Atorvastatin 40 mg at bedtime, Amlodipine 5 mg daily",
    followUpDate: "2026-10-30",
    pharmacyCleared: true,
    billingCleared: true,
    summarySigned: true,
  })

  // Start Discharge for an Inpatient
  const startDischargeForAdmission = (adm: InpatientAdmission) => {
    setDischargeForm({
      admissionRef: adm.admissionRef,
      authorizingPhysician: adm.attendingPhysician || "Dr. Daniel Abate, MD",
      destination: "Home with Care Plan",
      clinicalSummary: `Inpatient stay for ${adm.primaryDiagnosis}. Patient achieved clinical stability. Vital signs within normal limits.`,
      dischargeMedications: "Oral maintenance therapy per discharge prescription.",
      followUpDate: "2026-10-30",
      pharmacyCleared: true,
      billingCleared: true,
      summarySigned: true,
    })
    setDischargeStep(2)
    setDischargeWizardOpen(true)
  }

  // Complete Discharge
  const handleCompleteDischarge = () => {
    const adm = admissions.find((a) => a.admissionRef === dischargeForm.admissionRef)
    if (!adm) return

    const newDischargeId = `DIS-2026-0${discharges.length + 43}`
    const medList = dischargeForm.dischargeMedications
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)

    const newDischarge: InpatientDischarge = {
      dischargeId: newDischargeId,
      admissionRef: adm.admissionRef,
      patientId: adm.patientId,
      patientName: adm.patientName,
      wardId: adm.wardId,
      wardName: adm.wardName,
      bedId: adm.bedId,
      bedLabel: adm.bedLabel,
      admissionDate: adm.admissionDate,
      dischargeDate: "2026-10-16",
      lengthOfStayDays: Math.max(1, adm.estimatedStayDays || 4),
      authorizingPhysician: dischargeForm.authorizingPhysician,
      dischargeStatus: "completed",
      destination: dischargeForm.destination,
      clinicalSummary: dischargeForm.clinicalSummary,
      dischargeMedications: medList.length > 0 ? medList : ["Standard maintenance medications prescribed"],
      followUpDate: dischargeForm.followUpDate,
      adminClearance: {
        pharmacyClear: dischargeForm.pharmacyCleared,
        billingClear: dischargeForm.billingCleared,
        dischargeSummarySigned: dischargeForm.summarySigned,
      },
    }

    // 1. Add to discharges list
    setDischarges([newDischarge, ...discharges])

    // 2. Mark admission as discharged
    setAdmissions(
      admissions.map((a) =>
        a.admissionRef === adm.admissionRef ? { ...a, status: "discharged" } : a
      )
    )

    // 3. Update Bed status to 'cleaning' turnaround
    setBeds(
      beds.map((b) =>
        b.id === adm.bedId
          ? {
              ...b,
              status: "cleaning" as BedStatus,
              currentPatientId: null,
              currentPatientName: null,
              admissionRef: null,
              occupiedSince: null,
              notes: `Discharged ${newDischargeId}; cleaning and terminal sanitation requested.`,
            }
          : b
      )
    )

    // 4. Update Ward Occupancy
    setWards(
      wards.map((w) =>
        w.id === adm.wardId
          ? {
              ...w,
              occupiedBeds: Math.max(0, w.occupiedBeds - 1),
              cleaningBeds: w.cleaningBeds + 1,
              inpatientCount: Math.max(0, w.inpatientCount - 1),
            }
          : w
      )
    )

    setDischargeWizardOpen(false)
    setDischargeStep(1)
    showToast(`Discharge completed for ${adm.patientName}. Bed ${adm.bedLabel} placed in Turnaround/Cleaning.`)
  }

  // Bed Actions: Release from Cleaning to Available
  const handleReleaseBed = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId)
    if (!bed) return

    setBeds(
      beds.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: "available" as BedStatus,
              notes: "Sanitized and ready for intake.",
            }
          : b
      )
    )

    setWards(
      wards.map((w) =>
        w.id === bed.wardId
          ? {
              ...w,
              cleaningBeds: Math.max(0, w.cleaningBeds - 1),
              availableBeds: w.availableBeds + 1,
            }
          : w
      )
    )

    showToast(`Bed ${bed.bedNumber} in ${bed.wardName} is now Cleaned and Available.`)
  }

  // ---------------------------------------------------------
  // FILTERED LISTS
  // ---------------------------------------------------------
  const filteredEmergencyQueue = useMemo(() => {
    return emergencyQueue.filter((p) => {
      const matchSearch =
        p.patientName.toLowerCase().includes(emergencySearch.toLowerCase()) ||
        p.patientId.toLowerCase().includes(emergencySearch.toLowerCase()) ||
        p.presentingComplaint.toLowerCase().includes(emergencySearch.toLowerCase())
      const matchPriority =
        emergencyPriorityFilter === "all" || p.triagePriority === emergencyPriorityFilter
      const matchStatus =
        emergencyStatusFilter === "all" || p.status === emergencyStatusFilter
      return matchSearch && matchPriority && matchStatus
    })
  }, [emergencyQueue, emergencySearch, emergencyPriorityFilter, emergencyStatusFilter])

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchSearch =
        a.patientName.toLowerCase().includes(admissionSearch.toLowerCase()) ||
        a.patientId.toLowerCase().includes(admissionSearch.toLowerCase()) ||
        a.admissionRef.toLowerCase().includes(admissionSearch.toLowerCase()) ||
        a.primaryDiagnosis.toLowerCase().includes(admissionSearch.toLowerCase())
      const matchWard =
        admissionWardFilter === "all" || a.wardId === admissionWardFilter
      const matchStatus =
        admissionStatusFilter === "all" || a.status === admissionStatusFilter
      return matchSearch && matchWard && matchStatus
    })
  }, [admissions, admissionSearch, admissionWardFilter, admissionStatusFilter])

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchWard = bedWardFilter === "all" || b.wardId === bedWardFilter
      const matchStatus = bedStatusFilter === "all" || b.status === bedStatusFilter
      return matchWard && matchStatus
    })
  }, [beds, bedWardFilter, bedStatusFilter])

  const filteredDischarges = useMemo(() => {
    return discharges.filter((d) => {
      const matchSearch =
        d.patientName.toLowerCase().includes(dischargeSearch.toLowerCase()) ||
        d.patientId.toLowerCase().includes(dischargeSearch.toLowerCase()) ||
        d.admissionRef.toLowerCase().includes(dischargeSearch.toLowerCase()) ||
        d.dischargeId.toLowerCase().includes(dischargeSearch.toLowerCase())
      const matchStatus =
        dischargeStatusFilter === "all" || d.dischargeStatus === dischargeStatusFilter
      return matchSearch && matchStatus
    })
  }, [discharges, dischargeSearch, dischargeStatusFilter])

  // Aggregate Metrics
  const emergencyMetrics = useMemo(() => {
    return {
      awaitingTriage: emergencyQueue.filter((p) => p.status === "awaiting-triage").length,
      awaitingAssessment: emergencyQueue.filter((p) => p.status === "awaiting-assessment").length,
      inTreatment: emergencyQueue.filter((p) => p.status === "in-treatment").length,
      admissionPending: emergencyQueue.filter((p) => p.status === "admission-pending").length,
      availableBeds: beds.filter((b) => b.wardId === "WARD-EM-OBS" && b.status === "available").length,
      totalEmBeds: beds.filter((b) => b.wardId === "WARD-EM-OBS").length,
    }
  }, [emergencyQueue, beds])

  const inpatientMetrics = useMemo(() => {
    const totalConfigured = wards.reduce((sum, w) => sum + w.totalBeds, 0)
    const totalOccupied = beds.filter((b) => b.status === "occupied").length
    const totalAvailable = beds.filter((b) => b.status === "available").length
    const totalCleaning = beds.filter((b) => b.status === "cleaning").length
    const totalReserved = beds.filter((b) => b.status === "reserved").length
    const awaitingBed = admissions.filter((a) => a.status === "awaiting-bed").length
    return {
      totalConfigured,
      totalOccupied,
      totalAvailable,
      totalCleaning,
      totalReserved,
      awaitingBed,
      occupancyPercent: Math.round((totalOccupied / (totalConfigured || 1)) * 100),
    }
  }, [wards, beds, admissions])

  // Loading or restricted states
  if (!isAuthorized) {
    return (
      <div className="inpatient-emergency-module" role="alert">
        <div className="ie-callout danger">
          <Icon name="shield" size={20} />
          <div>
            <strong>Access Restricted: Inpatient &amp; Emergency Department</strong>
            <p>Your current staff role does not have authorization to view inpatient wards or emergency triage records.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="inpatient-emergency-module">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="ie-callout success" role="status" style={{ position: "fixed", top: "24px", right: "24px", zIndex: 1200, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
          <Icon name="check" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bed Conflict Alert */}
      {bedConflictAlert && (
        <div className="ie-callout danger" role="alert">
          <Icon name="alert-triangle" size={18} />
          <div style={{ flex: 1 }}>
            <strong>Bed Assignment Conflict</strong>
            <p>{bedConflictAlert}</p>
          </div>
          <Button className="button compact secondary" onClick={() => setBedConflictAlert(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Sub-view Navigation Tabs */}
      <nav className="ie-nav-tabs" aria-label="Inpatient and Emergency Modules">
        <button
          className={`ie-nav-tab ${activeTab === "emergency-dashboard" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("emergency-dashboard")
            onNavigate("emergency-dashboard")
          }}
        >
          <Icon name="cross" size={16} />
          Emergency Dashboard
          <span className="ie-tab-count">{emergencyQueue.length}</span>
        </button>

        <button
          className={`ie-nav-tab ${activeTab === "emergency-triage" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("emergency-triage")
            onNavigate("emergency-triage")
          }}
        >
          <Icon name="activity" size={16} />
          Emergency Triage
          <span className="ie-tab-count">
            {emergencyQueue.filter((p) => p.status === "awaiting-triage").length}
          </span>
        </button>

        <button
          className={`ie-nav-tab ${activeTab === "admissions" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("admissions")
            onNavigate("admissions")
          }}
        >
          <Icon name="user-plus" size={16} />
          Admissions
          <span className="ie-tab-count">
            {admissions.filter((a) => a.status === "awaiting-bed" || a.status === "admitted").length}
          </span>
        </button>

        <button
          className={`ie-nav-tab ${activeTab === "ward-management" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("ward-management")
            onNavigate("ward-management")
          }}
        >
          <Icon name="building" size={16} />
          Ward Management
          <span className="ie-tab-count">{wards.length}</span>
        </button>

        <button
          className={`ie-nav-tab ${activeTab === "bed-management" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("bed-management")
            onNavigate("bed-management")
          }}
        >
          <Icon name="bed" size={16} />
          Bed Management
          <span className="ie-tab-count">{inpatientMetrics.totalAvailable} Avail</span>
        </button>

        <button
          className={`ie-nav-tab ${activeTab === "discharges" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("discharges")
            onNavigate("discharges")
          }}
        >
          <Icon name="log-out" size={16} />
          Discharges
          <span className="ie-tab-count">
            {admissions.filter((a) => a.status === "discharge-approved").length}
          </span>
        </button>
      </nav>

      {/* =======================================================
          TAB 1: EMERGENCY DASHBOARD
      ======================================================= */}
      {activeTab === "emergency-dashboard" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="cross" size={24} />
                Emergency Dashboard
              </h1>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveTab("emergency-triage")
                  onNavigate("emergency-triage")
                }}
              >
                <Icon name="activity" size={16} />
                Triage Queue
              </Button>
              <Button
                className="button primary"
                onClick={() => setRegisterArrivalOpen(true)}
              >
                <Icon name="plus" size={16} />
                Register Arrival
              </Button>
            </div>
          </header>

          {/* Operational Metrics Cards */}
          <div className="ie-metrics-grid">
            <div className="ie-metric-card accent-red">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Awaiting Triage</span>
                <Icon name="clock" size={18} />
              </div>
              <div className="ie-metric-value">{emergencyMetrics.awaitingTriage}</div>
            </div>

            <div className="ie-metric-card accent-orange">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Awaiting Assessment</span>
                <Icon name="activity" size={18} />
              </div>
              <div className="ie-metric-value">{emergencyMetrics.awaitingAssessment}</div>
            </div>

            <div className="ie-metric-card accent-teal">
              <div className="ie-metric-top">
                <span className="ie-metric-label">In Treatment</span>
                <Icon name="heart" size={18} />
              </div>
              <div className="ie-metric-value">{emergencyMetrics.inTreatment}</div>
            </div>

            <div className="ie-metric-card accent-yellow">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Admission Pending</span>
                <Icon name="user-plus" size={18} />
              </div>
              <div className="ie-metric-value">{emergencyMetrics.admissionPending}</div>
            </div>

            <div className="ie-metric-card accent-green">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Beds Available</span>
                <Icon name="bed" size={18} />
              </div>
              <div className="ie-metric-value">
                {emergencyMetrics.availableBeds} / {emergencyMetrics.totalEmBeds}
              </div>
            </div>
          </div>

          {/* Queue Filter Controls */}
          <div className="ie-controls-bar">
            <div className="ie-search-box">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search emergency queue by patient name, MRN, complaint…"
                value={emergencySearch}
                onChange={(e) => setEmergencySearch(e.target.value)}
                aria-label="Search emergency queue"
              />
              {emergencySearch && (
                <button
                  style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  onClick={() => setEmergencySearch("")}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            <div className="ie-filter-group">
              <select
                className="ie-select"
                value={emergencyPriorityFilter}
                onChange={(e) => setEmergencyPriorityFilter(e.target.value)}
                aria-label="Filter by Triage Priority"
              >
                <option value="all">All Triage Priorities</option>
                <option value="red">Red (Level 1 - Immediate)</option>
                <option value="orange">Orange (Level 2 - Very Urgent)</option>
                <option value="yellow">Yellow (Level 3 - Urgent)</option>
                <option value="green">Green (Level 4 - Standard)</option>
                <option value="blue">Blue (Level 5 - Non-Urgent)</option>
                <option value="unassigned">Unassigned / Pending Triage</option>
              </select>

              <select
                className="ie-select"
                value={emergencyStatusFilter}
                onChange={(e) => setEmergencyStatusFilter(e.target.value)}
                aria-label="Filter by Emergency Status"
              >
                <option value="all">All Emergency Statuses</option>
                <option value="awaiting-triage">Awaiting Triage</option>
                <option value="awaiting-assessment">Awaiting Assessment</option>
                <option value="in-treatment">In Treatment</option>
                <option value="admission-pending">Admission Pending</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>

          {/* Emergency Patient Queue Table */}
          <div className="ie-table-container">
            <table className="ie-table" aria-label="Emergency Patient Queue">
              <thead>
                <tr>
                  <th>Arrival &amp; MRN</th>
                  <th>Patient Name</th>
                  <th>Presenting Complaint</th>
                  <th>Triage Priority</th>
                  <th>Vital Signs</th>
                  <th>Status &amp; Bed</th>
                  <th>Assigned Clinician</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmergencyQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ie-table-empty">
                      <Icon name="inbox" size={32} />
                      <p style={{ marginTop: "8px", fontWeight: 600 }}>No emergency patients match the filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmergencyQueue.map((patient) => {
                    const priorityMeta =
                      patient.triagePriority !== "unassigned"
                        ? TRIAGE_PRIORITIES[patient.triagePriority]
                        : null
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="ie-patient-cell">
                            <strong>{patient.arrivalTime}</strong>
                            <span className="ie-patient-sub">{patient.patientId}</span>
                            <small style={{ color: "var(--muted)" }}>{patient.arrivalSource}</small>
                          </div>
                        </td>

                        <td>
                          <div className="ie-patient-cell">
                            <span className="ie-patient-name">{patient.patientName}</span>
                            <span className="ie-patient-sub">
                              {patient.age} yrs · {patient.gender}
                            </span>
                            {patient.allergies && patient.allergies !== "None" && (
                              <span style={{ fontSize: "11px", color: "#c0392b", fontWeight: 600 }}>
                                Allergy: {patient.allergies}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ maxWidth: "240px" }}>
                          <span style={{ fontSize: "12.5px", lineHeight: "1.35", display: "block" }}>
                            {patient.presentingComplaint}
                          </span>
                        </td>

                        <td>
                          {priorityMeta ? (
                            <span className={`triage-badge ${priorityMeta.badgeClass}`}>
                              {priorityMeta.level}: {priorityMeta.name}
                            </span>
                          ) : (
                            <span className="triage-badge" style={{ background: "#f2f4f4", color: "#7f8c8d" }}>
                              Pending Triage
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                            <div>BP: <strong>{patient.vitalSigns.bloodPressure || "—"}</strong></div>
                            <div>HR: {patient.vitalSigns.pulseRate} bpm · SpO2: {patient.vitalSigns.spO2}%</div>
                            <div>Temp: {patient.vitalSigns.temperature}°C · Pain: {patient.vitalSigns.painScore}/10</div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              className={`ie-status-badge ${
                                patient.status === "in-treatment"
                                  ? "ie-status-active"
                                  : patient.status === "awaiting-triage"
                                  ? "ie-status-urgent"
                                  : patient.status === "admission-pending"
                                  ? "ie-status-awaiting"
                                  : "ie-status-neutral"
                              }`}
                            >
                              {patient.status.replace("-", " ")}
                            </span>
                            {patient.emergencyBed && (
                              <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 700 }}>
                                Bed: {patient.emergencyBed}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600 }}>
                            {patient.assignedClinician || "Unassigned"}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            {patient.status === "awaiting-triage" && (
                              <Button
                                className="button compact primary"
                                onClick={() => {
                                  setTriagePatientId(patient.id)
                                  setActiveTab("emergency-triage")
                                  onNavigate("emergency-triage")
                                }}
                              >
                                Triage
                              </Button>
                            )}

                            {patient.status !== "transferred" && patient.status !== "discharged" && (
                              <Button
                                className="button compact secondary"
                                onClick={() => startAdmissionFromEmergency(patient)}
                              >
                                Admit
                              </Button>
                            )}

                            <Button
                              className="button compact secondary"
                              onClick={() => setSelectedEmergencyPatient(patient)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =======================================================
          TAB 2: EMERGENCY TRIAGE WORKSPACE
      ======================================================= */}
      {activeTab === "emergency-triage" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="activity" size={24} />
                Emergency Triage &amp; Rapid Assessment
              </h1>
              <p>
                Standardized clinical triage assessment, vital signs documentation, and acuity categorization for authorized emergency nursing staff.
              </p>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button secondary"
                onClick={() => handleSaveTriage(true)}
              >
                <Icon name="edit" size={16} />
                Save Draft
              </Button>
              <Button
                className="button primary"
                onClick={() => handleSaveTriage(false)}
              >
                <Icon name="check" size={16} />
                Finalize Triage Assessment
              </Button>
            </div>
          </header>

          {/* Patient Selector Strip */}
          <div className="ie-controls-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)", whiteSpace: "nowrap" }}>
                Select Patient Awaiting Triage:
              </label>
              <select
                className="ie-select"
                style={{ flex: 1 }}
                value={triagePatientId}
                onChange={(e) => setTriagePatientId(e.target.value)}
              >
                {emergencyQueue.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.arrivalTime} — {p.patientName} ({p.patientId}) · {p.age}y {p.gender} — {p.presentingComplaint.slice(0, 50)}…
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comprehensive Triage Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
            {/* Patient & Vital Signs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Section A: Patient & Arrival Information */}
              <div className="ie-form-section">
                <h3>
                  <Icon name="user" size={18} />
                  Section A: Patient &amp; Arrival Context
                </h3>
                <div className="ie-summary-card">
                  <div className="ie-summary-row">
                    <span className="ie-summary-label">Patient Name:</span>
                    <span className="ie-summary-value">{activeTriagePatient?.patientName}</span>
                  </div>
                  <div className="ie-summary-row">
                    <span className="ie-summary-label">Medical Record Number (MRN):</span>
                    <span className="ie-summary-value">{activeTriagePatient?.patientId}</span>
                  </div>
                  <div className="ie-summary-row">
                    <span className="ie-summary-label">Demographics:</span>
                    <span className="ie-summary-value">
                      {activeTriagePatient?.age} yrs · {activeTriagePatient?.gender}
                    </span>
                  </div>
                  <div className="ie-summary-row">
                    <span className="ie-summary-label">Arrival Time / Mode:</span>
                    <span className="ie-summary-value">
                      {activeTriagePatient?.arrivalTime} ({activeTriagePatient?.arrivalSource})
                    </span>
                  </div>
                </div>

                <div className="ie-form-group">
                  <label>Chief Presenting Complaint</label>
                  <input
                    type="text"
                    value={activeTriagePatient?.presentingComplaint || ""}
                    readOnly
                    style={{ background: "var(--background)" }}
                  />
                </div>
              </div>

              {/* Section B: Vital Signs Documentation */}
              <div className="ie-form-section">
                <h3>
                  <Icon name="heart" size={18} />
                  Section B: Objective Vital Signs
                </h3>
                <div className="ie-form-grid-3">
                  <div className="ie-form-group">
                    <label>Blood Pressure (Systolic / Diastolic)</label>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="120"
                        value={triageVitals.bpSystolic}
                        onChange={(e) =>
                          setTriageVitals({ ...triageVitals, bpSystolic: e.target.value })
                        }
                      />
                      <span>/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={triageVitals.bpDiastolic}
                        onChange={(e) =>
                          setTriageVitals({ ...triageVitals, bpDiastolic: e.target.value })
                        }
                      />
                      <small>mmHg</small>
                    </div>
                  </div>

                  <div className="ie-form-group">
                    <label>Pulse Rate (HR)</label>
                    <input
                      type="number"
                      value={triageVitals.pulse}
                      onChange={(e) =>
                        setTriageVitals({ ...triageVitals, pulse: e.target.value })
                      }
                    />
                    <small>bpm (60–100 normal)</small>
                  </div>

                  <div className="ie-form-group">
                    <label>Respiratory Rate (RR)</label>
                    <input
                      type="number"
                      value={triageVitals.rr}
                      onChange={(e) =>
                        setTriageVitals({ ...triageVitals, rr: e.target.value })
                      }
                    />
                    <small>breaths/min (12–20)</small>
                  </div>

                  <div className="ie-form-group">
                    <label>Body Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      value={triageVitals.temp}
                      onChange={(e) =>
                        setTriageVitals({ ...triageVitals, temp: e.target.value })
                      }
                    />
                    <small>°C (axillary/tympanic)</small>
                  </div>

                  <div className="ie-form-group">
                    <label>Oxygen Saturation (SpO2)</label>
                    <input
                      type="number"
                      value={triageVitals.spO2}
                      onChange={(e) =>
                        setTriageVitals({ ...triageVitals, spO2: e.target.value })
                      }
                    />
                    <small>% on ambient room air</small>
                  </div>

                  <div className="ie-form-group">
                    <label>Pain Score (0–10 Numeric)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={triageVitals.pain}
                      onChange={(e) =>
                        setTriageVitals({ ...triageVitals, pain: e.target.value })
                      }
                    />
                    <small>0 = None, 10 = Worst</small>
                  </div>
                </div>

                <div className="ie-form-group">
                  <label>Documented Drug Allergies &amp; Alerts</label>
                  <input
                    type="text"
                    value={triageAllergies}
                    onChange={(e) => setTriageAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, NSAIDs, or No known drug allergies"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Acuity & Disposition */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Section C: Triage Priority Categorization */}
              <div className="ie-form-section">
                <h3>
                  <Icon name="shield" size={18} />
                  Section C: Triage Acuity Categorization
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(["red", "orange", "yellow", "green", "blue"] as TriagePriority[]).map(
                    (key) => {
                      const meta = TRIAGE_PRIORITIES[key]
                      const isSelected = triagePriority === key
                      return (
                        <div
                          key={key}
                          onClick={() => setTriagePriority(key)}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "6px",
                            border: `2px solid ${isSelected ? "var(--teal)" : "var(--border)"}`,
                            background: isSelected ? "rgba(8, 126, 131, 0.04)" : "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <span className={`triage-badge ${meta.badgeClass}`}>
                              {meta.level}: {meta.name}
                            </span>
                            <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "4px" }}>
                              {meta.description}
                            </div>
                          </div>
                          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--navy)" }}>
                            {meta.targetResponse}
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>

                <div className="ie-form-group" style={{ marginTop: "10px" }}>
                  <label>Clinical Rationale &amp; Observations</label>
                  <textarea
                    rows={4}
                    value={triageObservations}
                    onChange={(e) => setTriageObservations(e.target.value)}
                    placeholder="Document clinical observations supporting the selected triage priority category…"
                  />
                </div>
              </div>

              {/* Section D: Disposition & Workflow Actions */}
              <div className="ie-form-section">
                <h3>
                  <Icon name="arrow" size={18} />
                  Section D: Recommended Disposition
                </h3>

                <div className="ie-form-group">
                  <label>Initial Clinical Pathway</label>
                  <select
                    className="ie-select"
                    value={triageDisposition}
                    onChange={(e) => setTriageDisposition(e.target.value)}
                  >
                    <option value="awaiting-assessment">Await Emergency Doctor Assessment</option>
                    <option value="resus-activation">Activate Immediate Resuscitation Team</option>
                    <option value="emergency-obs">Transfer to Emergency Short-Stay Observation</option>
                    <option value="inpatient-admission">Recommend Immediate Inpatient Admission</option>
                    <option value="ambulatory-care">Route to OPD Ambulatory Care</option>
                  </select>
                </div>

                <div className="ie-form-group">
                  <label>Assessing Triage Officer</label>
                  <input
                    type="text"
                    value={triageAssessor}
                    onChange={(e) => setTriageAssessor(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <Button
                    className="button primary"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => handleSaveTriage(false)}
                  >
                    <Icon name="check" size={16} /> Finalize Triage
                  </Button>
                  {activeTriagePatient && (
                    <Button
                      className="button secondary"
                      onClick={() => startAdmissionFromEmergency(activeTriagePatient)}
                    >
                      <Icon name="user-plus" size={16} /> Admit Inpatient
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =======================================================
          TAB 3: ADMISSIONS MANAGEMENT WORKSPACE
      ======================================================= */}
      {activeTab === "admissions" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="user-plus" size={24} />
                Inpatient Admission Management
              </h1>
              <p>
                Authorized inpatient admissions, clinical admission decisions, ward bed allocations, and admission confirmation workflow for Oda Roba Hospital.
              </p>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button primary"
                onClick={() => {
                  setAdmissionStep(1)
                  setAdmissionWizardOpen(true)
                }}
              >
                <Icon name="plus" size={16} />
                New Inpatient Admission
              </Button>
            </div>
          </header>

          {/* Admission Metrics */}
          <div className="ie-metrics-grid">
            <div className="ie-metric-card accent-orange">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Awaiting Bed Assignment</span>
                <Icon name="clock" size={18} />
              </div>
              <div className="ie-metric-value">{inpatientMetrics.awaitingBed}</div>
              <div className="ie-metric-desc">Approved; pending inpatient bed</div>
            </div>

            <div className="ie-metric-card accent-teal">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Active Inpatient Census</span>
                <Icon name="bed" size={18} />
              </div>
              <div className="ie-metric-value">{inpatientMetrics.totalOccupied}</div>
              <div className="ie-metric-desc">Current admitted patients</div>
            </div>

            <div className="ie-metric-card accent-green">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Hospital Bed Availability</span>
                <Icon name="check" size={18} />
              </div>
              <div className="ie-metric-value">{inpatientMetrics.totalAvailable}</div>
              <div className="ie-metric-desc">Clean beds ready for admission</div>
            </div>

            <div className="ie-metric-card accent-yellow">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Overall Bed Occupancy</span>
                <Icon name="activity" size={18} />
              </div>
              <div className="ie-metric-value">{inpatientMetrics.occupancyPercent}%</div>
              <div className="ie-metric-desc">
                {inpatientMetrics.totalOccupied} of {inpatientMetrics.totalConfigured} beds
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="ie-controls-bar">
            <div className="ie-search-box">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search admissions by patient name, MRN, Admission Ref, or diagnosis…"
                value={admissionSearch}
                onChange={(e) => setAdmissionSearch(e.target.value)}
              />
            </div>

            <div className="ie-filter-group">
              <select
                className="ie-select"
                value={admissionWardFilter}
                onChange={(e) => setAdmissionWardFilter(e.target.value)}
              >
                <option value="all">All Hospital Wards</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <select
                className="ie-select"
                value={admissionStatusFilter}
                onChange={(e) => setAdmissionStatusFilter(e.target.value)}
              >
                <option value="all">All Admission Statuses</option>
                <option value="awaiting-bed">Awaiting Bed Assignment</option>
                <option value="admitted">Admitted (Active Inpatient)</option>
                <option value="discharge-approved">Discharge Approved</option>
                <option value="discharged">Discharged</option>
              </select>
            </div>
          </div>

          {/* Admissions Table */}
          <div className="ie-table-container">
            <table className="ie-table" aria-label="Inpatient Admissions Queue">
              <thead>
                <tr>
                  <th>Admission Ref &amp; Date</th>
                  <th>Patient Name &amp; MRN</th>
                  <th>Admission Reason &amp; Diagnosis</th>
                  <th>Referring Service</th>
                  <th>Ward &amp; Bed</th>
                  <th>Attending Physician</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ie-table-empty">
                      <Icon name="inbox" size={32} />
                      <p style={{ marginTop: "8px", fontWeight: 600 }}>No admissions match the selected criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <tr key={adm.admissionRef}>
                      <td>
                        <div className="ie-patient-cell">
                          <strong>{adm.admissionRef}</strong>
                          <span className="ie-patient-sub">
                            {adm.admissionDate} · {adm.admissionTime}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="ie-patient-cell">
                          <span className="ie-patient-name">{adm.patientName}</span>
                          <span className="ie-patient-sub">
                            {adm.patientId} · {adm.age}y {adm.gender}
                          </span>
                        </div>
                      </td>

                      <td style={{ maxWidth: "250px" }}>
                        <strong style={{ color: "var(--navy)", fontSize: "12.5px", display: "block" }}>
                          {adm.primaryDiagnosis}
                        </strong>
                        <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                          {adm.admissionReason}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: "12px" }}>
                          <div>{adm.referringDepartment}</div>
                          <small style={{ color: "var(--muted)" }}>{adm.referringClinician}</small>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: "12px" }}>
                          <strong style={{ color: "var(--teal)" }}>{adm.wardName}</strong>
                          <div>{adm.bedLabel}</div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600 }}>
                          {adm.attendingPhysician}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ie-status-badge ${
                            adm.status === "admitted"
                              ? "ie-status-active"
                              : adm.status === "awaiting-bed"
                              ? "ie-status-urgent"
                              : adm.status === "discharge-approved"
                              ? "ie-status-awaiting"
                              : "ie-status-completed"
                          }`}
                        >
                          {adm.status.replace("-", " ")}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          {adm.status === "admitted" && (
                            <Button
                              className="button compact secondary"
                              onClick={() => startDischargeForAdmission(adm)}
                            >
                              Discharge
                            </Button>
                          )}
                          <Button
                            className="button compact secondary"
                            onClick={() => setSelectedAdmission(adm)}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =======================================================
          TAB 4: WARD MANAGEMENT WORKSPACE
      ======================================================= */}
      {activeTab === "ward-management" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="building" size={24} />
                Ward Management
              </h1>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveTab("bed-management")
                  onNavigate("bed-management")
                }}
              >
                <Icon name="bed" size={16} />
                Open Bed Board
              </Button>
              <Button
                className="button primary"
                onClick={() => setWardConfigOpen(true)}
              >
                <Icon name="edit" size={16} />
                Ward Capacity Settings
              </Button>
            </div>
          </header>

          {/* Ward Cards Grid */}
          <div className="ie-wards-grid">
            {wards.map((ward) => {
              const occPercent = Math.round((ward.occupiedBeds / ward.totalBeds) * 100)
              const cleaningPercent = Math.round((ward.cleaningBeds / ward.totalBeds) * 100)
              const maintPercent = Math.round((ward.maintenanceBeds / ward.totalBeds) * 100)

              return (
                <div key={ward.id} className="ie-ward-card">
                  <div className="ie-ward-card-header">
                    <div>
                      <h3>{ward.name}</h3>
                      <div className="ie-ward-card-sub">{ward.location}</div>
                    </div>
                    <span
                      className="ie-status-badge ie-status-active"
                      style={{ textTransform: "capitalize" }}
                    >
                      {ward.operationalStatus}
                    </span>
                  </div>

                  <div className="ie-occupancy-bar-wrap">
                    <div className="ie-occupancy-bar-labels">
                      <span>Occupancy: {occPercent}%</span>
                      <span>
                        {ward.occupiedBeds} / {ward.totalBeds} Beds
                      </span>
                    </div>
                    <div className="ie-occupancy-bar">
                      <div className="ie-bar-occupied" style={{ width: `${occPercent}%` }} />
                      <div className="ie-bar-cleaning" style={{ width: `${cleaningPercent}%` }} />
                      <div className="ie-bar-maintenance" style={{ width: `${maintPercent}%` }} />
                    </div>
                  </div>

                  <div className="ie-ward-metrics-row">
                    <div className="ie-ward-metric-item">
                      <small>Available</small>
                      <strong style={{ color: "#27ae60" }}>{ward.availableBeds}</strong>
                    </div>
                    <div className="ie-ward-metric-item">
                      <small>Occupied</small>
                      <strong style={{ color: "var(--teal)" }}>{ward.occupiedBeds}</strong>
                    </div>
                    <div className="ie-ward-metric-item">
                      <small>Cleaning</small>
                      <strong style={{ color: "#f39c12" }}>{ward.cleaningBeds}</strong>
                    </div>
                    <div className="ie-ward-metric-item">
                      <small>Inpatients</small>
                      <strong style={{ color: "var(--navy)" }}>{ward.inpatientCount}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Charge Nurse: <strong>{ward.chargeNurse}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                    <Button
                      className="button compact secondary"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setSelectedWard(ward)}
                    >
                      Ward Inpatients
                    </Button>
                    <Button
                      className="button compact primary"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => {
                        setBedWardFilter(ward.id)
                        setActiveTab("bed-management")
                        onNavigate("bed-management")
                      }}
                    >
                      View Beds
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* =======================================================
          TAB 5: BED MANAGEMENT WORKSPACE
      ======================================================= */}
      {activeTab === "bed-management" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="bed" size={24} />
                Bed Management
              </h1>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveTab("admissions")
                  onNavigate("admissions")
                }}
              >
                <Icon name="user-plus" size={16} />
                Admit to Available Bed
              </Button>
            </div>
          </header>

          {/* Controls Bar */}
          <div className="ie-controls-bar">
            <div className="ie-filter-group">
              <select
                className="ie-select"
                value={bedWardFilter}
                onChange={(e) => setBedWardFilter(e.target.value)}
              >
                <option value="all">All Hospital Wards</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <select
                className="ie-select"
                value={bedStatusFilter}
                onChange={(e) => setBedStatusFilter(e.target.value)}
              >
                <option value="all">All Bed Statuses</option>
                <option value="available">Available (Ready)</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning / Turnaround</option>
                <option value="maintenance">Out of Service / Maintenance</option>
              </select>
            </div>

            <div className="ie-view-toggle">
              <button
                className={`ie-toggle-btn ${bedViewMode === "board" ? "active" : ""}`}
                onClick={() => setBedViewMode("board")}
              >
                <Icon name="grid" size={14} /> Visual Board
              </button>
              <button
                className={`ie-toggle-btn ${bedViewMode === "table" ? "active" : ""}`}
                onClick={() => setBedViewMode("table")}
              >
                <Icon name="file-text" size={14} /> Table View
              </button>
            </div>
          </div>

          {/* Visual Bed Board View */}
          {bedViewMode === "board" ? (
            <div className="ie-bed-board">
              {wards
                .filter((w) => bedWardFilter === "all" || w.id === bedWardFilter)
                .map((ward) => {
                  const wardBeds = filteredBeds.filter((b) => b.wardId === ward.id)
                  if (wardBeds.length === 0) return null

                  return (
                    <div key={ward.id} className="ie-ward-section">
                      <div className="ie-ward-section-header">
                        <div className="ie-ward-info">
                          <h2>{ward.name}</h2>
                          <div className="ie-ward-sub">
                            {ward.location} · Charge Nurse: {ward.chargeNurse}
                          </div>
                        </div>
                        <div className="ie-ward-occupancy-pill">
                          <span>
                            {ward.occupiedBeds} Occupied / {ward.availableBeds} Available
                          </span>
                        </div>
                      </div>

                      <div className="ie-beds-grid">
                        {wardBeds.map((bed) => (
                          <div key={bed.id} className={`ie-bed-card status-${bed.status}`}>
                            <div className="ie-bed-header">
                              <span className="ie-bed-title">
                                <Icon name="bed" size={16} />
                                {bed.bedNumber}
                              </span>
                              <span className={`ie-bed-badge ${bed.status}`}>
                                {bed.status}
                              </span>
                            </div>

                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {bed.bedType}
                            </div>

                            {bed.status === "occupied" && bed.currentPatientName && (
                              <div className="ie-bed-patient">
                                <span className="ie-bed-patient-name">{bed.currentPatientName}</span>
                                <span className="ie-bed-patient-meta">
                                  MRN: {bed.currentPatientId} · Since: {bed.occupiedSince}
                                </span>
                                {bed.notes && (
                                  <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                                    {bed.notes}
                                  </span>
                                )}
                              </div>
                            )}

                            {bed.status === "reserved" && (
                              <div className="ie-bed-patient">
                                <span className="ie-bed-patient-name">{bed.currentPatientName || "Pending Admission"}</span>
                                <span className="ie-bed-patient-meta">Reserved for incoming admission</span>
                              </div>
                            )}

                            {bed.status === "cleaning" && (
                              <div className="ie-bed-patient">
                                <span style={{ fontSize: "12px", color: "#b7950b", fontWeight: 600 }}>
                                  Terminal Cleaning in Progress
                                </span>
                                <span className="ie-bed-patient-meta">{bed.notes}</span>
                              </div>
                            )}

                            {bed.status === "available" && (
                              <div className="ie-bed-patient">
                                <span style={{ fontSize: "12px", color: "#27ae60", fontWeight: 600 }}>
                                  Sanitized &amp; Ready
                                </span>
                                <span className="ie-bed-patient-meta">{bed.notes}</span>
                              </div>
                            )}

                            <div className="ie-bed-actions">
                              {bed.status === "cleaning" && (
                                <Button
                                  className="button compact primary"
                                  style={{ width: "100%", justifyContent: "center" }}
                                  onClick={() => handleReleaseBed(bed.id)}
                                >
                                  Release to Available
                                </Button>
                              )}

                              {bed.status === "available" && (
                                <Button
                                  className="button compact secondary"
                                  style={{ width: "100%", justifyContent: "center" }}
                                  onClick={() => {
                                    setAdmissionForm({ ...admissionForm, wardId: bed.wardId, bedId: bed.id })
                                    setAdmissionWizardOpen(true)
                                  }}
                                >
                                  Assign Patient
                                </Button>
                              )}

                              {bed.status === "occupied" && (
                                <Button
                                  className="button compact secondary"
                                  style={{ width: "100%", justifyContent: "center" }}
                                  onClick={() => {
                                    setSelectedBed(bed)
                                    setTransferBedOpen(true)
                                  }}
                                >
                                  Transfer Bed
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            /* Table View */
            <div className="ie-table-container">
              <table className="ie-table" aria-label="Bed Inventory Table">
                <thead>
                  <tr>
                    <th>Bed ID &amp; Label</th>
                    <th>Ward</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Current Patient</th>
                    <th>Occupied Since</th>
                    <th>Operational Notes</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeds.map((bed) => (
                    <tr key={bed.id}>
                      <td>
                        <strong>{bed.bedNumber}</strong>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>{bed.id}</div>
                      </td>
                      <td>{bed.wardName}</td>
                      <td>{bed.bedType}</td>
                      <td>
                        <span className={`ie-bed-badge ${bed.status}`}>
                          {bed.status}
                        </span>
                      </td>
                      <td>
                        {bed.currentPatientName ? (
                          <div>
                            <strong>{bed.currentPatientName}</strong>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {bed.currentPatientId}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td>{bed.occupiedSince || "—"}</td>
                      <td style={{ fontSize: "12px", color: "var(--muted)" }}>{bed.notes}</td>
                      <td style={{ textAlign: "right" }}>
                        {bed.status === "cleaning" ? (
                          <Button
                            className="button compact primary"
                            onClick={() => handleReleaseBed(bed.id)}
                          >
                            Release
                          </Button>
                        ) : bed.status === "occupied" ? (
                          <Button
                            className="button compact secondary"
                            onClick={() => {
                              setSelectedBed(bed)
                              setTransferBedOpen(true)
                            }}
                          >
                            Transfer
                          </Button>
                        ) : (
                          <Button
                            className="button compact secondary"
                            onClick={() => {
                              setAdmissionForm({ ...admissionForm, wardId: bed.wardId, bedId: bed.id })
                              setAdmissionWizardOpen(true)
                            }}
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* =======================================================
          TAB 6: PATIENT DISCHARGE MANAGEMENT
      ======================================================= */}
      {activeTab === "discharges" && (
        <>
          <header className="ie-header">
            <div className="ie-header-title-group">
              <h1>
                <Icon name="log-out" size={24} />
                Patient Discharge Management
              </h1>
              <p>
                Clinical discharge documentation, multidisciplinary clearance verification, discharge medication coordination, and bed turnaround release.
              </p>
            </div>
            <div className="ie-header-actions">
              <Button
                className="button primary"
                onClick={() => {
                  setDischargeStep(1)
                  setDischargeWizardOpen(true)
                }}
              >
                <Icon name="plus" size={16} />
                Initiate New Discharge
              </Button>
            </div>
          </header>

          {/* Discharge Metrics */}
          <div className="ie-metrics-grid">
            <div className="ie-metric-card accent-orange">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Approved for Discharge</span>
                <Icon name="clock" size={18} />
              </div>
              <div className="ie-metric-value">
                {admissions.filter((a) => a.status === "discharge-approved").length}
              </div>
              <div className="ie-metric-desc">Awaiting administrative completion</div>
            </div>

            <div className="ie-metric-card accent-teal">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Completed Discharges</span>
                <Icon name="check" size={18} />
              </div>
              <div className="ie-metric-value">{discharges.length}</div>
              <div className="ie-metric-desc">Cleared and released this period</div>
            </div>

            <div className="ie-metric-card accent-green">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Average Inpatient Stay</span>
                <Icon name="activity" size={18} />
              </div>
              <div className="ie-metric-value">4.5 Days</div>
              <div className="ie-metric-desc">Across all clinical departments</div>
            </div>

            <div className="ie-metric-card accent-yellow">
              <div className="ie-metric-top">
                <span className="ie-metric-label">Beds in Turnaround</span>
                <Icon name="bed" size={18} />
              </div>
              <div className="ie-metric-value">{inpatientMetrics.totalCleaning}</div>
              <div className="ie-metric-desc">Post-discharge sanitation</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="ie-controls-bar">
            <div className="ie-search-box">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search discharges by patient name, MRN, Discharge ID, or admission ref…"
                value={dischargeSearch}
                onChange={(e) => setDischargeSearch(e.target.value)}
              />
            </div>

            <div className="ie-filter-group">
              <select
                className="ie-select"
                value={dischargeStatusFilter}
                onChange={(e) => setDischargeStatusFilter(e.target.value)}
              >
                <option value="all">All Discharge Statuses</option>
                <option value="completed">Completed Discharge</option>
                <option value="approved">Approved (Pending Clearance)</option>
                <option value="pending-review">Pending Clinical Review</option>
              </select>
            </div>
          </div>

          {/* Discharges Table */}
          <div className="ie-table-container">
            <table className="ie-table" aria-label="Patient Discharges Record">
              <thead>
                <tr>
                  <th>Discharge ID &amp; Ref</th>
                  <th>Patient Name &amp; MRN</th>
                  <th>Ward &amp; Bed</th>
                  <th>Stay Duration</th>
                  <th>Authorizing Physician</th>
                  <th>Destination</th>
                  <th>Clearances</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDischarges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ie-table-empty">
                      <Icon name="inbox" size={32} />
                      <p style={{ marginTop: "8px", fontWeight: 600 }}>No discharge records match the filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDischarges.map((dis) => (
                    <tr key={dis.dischargeId}>
                      <td>
                        <div className="ie-patient-cell">
                          <strong>{dis.dischargeId}</strong>
                          <span className="ie-patient-sub">Ref: {dis.admissionRef}</span>
                          <small style={{ color: "var(--muted)" }}>{dis.dischargeDate}</small>
                        </div>
                      </td>

                      <td>
                        <div className="ie-patient-cell">
                          <span className="ie-patient-name">{dis.patientName}</span>
                          <span className="ie-patient-sub">{dis.patientId}</span>
                        </div>
                      </td>

                      <td>
                        <div>{dis.wardName}</div>
                        <small style={{ color: "var(--teal)", fontWeight: 700 }}>{dis.bedLabel}</small>
                      </td>

                      <td>
                        <strong>{dis.lengthOfStayDays} days</strong>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                          Adm: {dis.admissionDate}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600 }}>
                          {dis.authorizingPhysician}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px" }}>{dis.destination}</span>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "4px", fontSize: "11px" }}>
                          <span
                            style={{
                              padding: "2px 5px",
                              borderRadius: "3px",
                              background: dis.adminClearance.pharmacyClear ? "#eafaf1" : "#fde8e8",
                              color: dis.adminClearance.pharmacyClear ? "#1e8449" : "#900c3f",
                            }}
                          >
                            Rx
                          </span>
                          <span
                            style={{
                              padding: "2px 5px",
                              borderRadius: "3px",
                              background: dis.adminClearance.billingClear ? "#eafaf1" : "#fde8e8",
                              color: dis.adminClearance.billingClear ? "#1e8449" : "#900c3f",
                            }}
                          >
                            Bill
                          </span>
                          <span
                            style={{
                              padding: "2px 5px",
                              borderRadius: "3px",
                              background: dis.adminClearance.dischargeSummarySigned ? "#eafaf1" : "#fde8e8",
                              color: dis.adminClearance.dischargeSummarySigned ? "#1e8449" : "#900c3f",
                            }}
                          >
                            Summary
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <Button
                          className="button compact secondary"
                          onClick={() => setSelectedDischarge(dis)}
                        >
                          View Summary
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =======================================================
          MODAL 1: REGISTER EMERGENCY ARRIVAL
      ======================================================= */}
      {registerArrivalOpen && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box">
            <div className="ie-modal-header">
              <h2>Register Emergency Arrival</h2>
              <button
                className="icon-button"
                onClick={() => setRegisterArrivalOpen(false)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="ie-modal-body">
              <div className="ie-callout info">
                <Icon name="info" size={16} />
                <span>
                  Immediate arrival registration queues the patient for urgent triage assessment and clinical prioritization.
                </span>
              </div>

              <div className="ie-form-grid-2">
                <div className="ie-form-group">
                  <label>Patient Full Name</label>
                  <input type="text" placeholder="e.g. Gemechu Desta" id="em-reg-name" />
                </div>
                <div className="ie-form-group">
                  <label>Medical Record Number (MRN)</label>
                  <input type="text" defaultValue="ORH-P-00714" id="em-reg-mrn" />
                </div>
                <div className="ie-form-group">
                  <label>Age &amp; Gender</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="number" placeholder="Age" style={{ width: "80px" }} id="em-reg-age" />
                    <select className="ie-select" style={{ flex: 1 }} id="em-reg-gender">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                </div>
                <div className="ie-form-group">
                  <label>Arrival Source</label>
                  <select className="ie-select" id="em-reg-source">
                    <option value="Ambulance">Ambulance</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="District Referral (Goba)">District Referral (Goba)</option>
                    <option value="Health Center Transfer">Health Center Transfer</option>
                    <option value="Police/Bystander">Police / Bystander</option>
                  </select>
                </div>
              </div>

              <div className="ie-form-group">
                <label>Chief Presenting Complaint / Mechanism of Injury</label>
                <textarea
                  rows={3}
                  placeholder="Describe chief complaint, onset, and immediate physical findings…"
                  id="em-reg-complaint"
                />
              </div>

              <div className="ie-form-group">
                <label>Emergency Acuity Alert (Optional Preliminary Flag)</label>
                <select className="ie-select" id="em-reg-flag">
                  <option value="green">Standard (Awaiting full triage)</option>
                  <option value="orange">High Acuity / Potential Level 2</option>
                  <option value="red">Immediate Resuscitation Required (Level 1)</option>
                </select>
              </div>
            </div>

            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setRegisterArrivalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button primary"
                onClick={() => {
                  const nameInput = (document.getElementById("em-reg-name") as HTMLInputElement)?.value || "New Emergency Patient"
                  const mrnInput = (document.getElementById("em-reg-mrn") as HTMLInputElement)?.value || "ORH-P-00714"
                  const ageInput = Number((document.getElementById("em-reg-age") as HTMLInputElement)?.value) || 35
                  const genderInput = ((document.getElementById("em-reg-gender") as HTMLSelectElement)?.value as "Female" | "Male") || "Female"
                  const sourceInput = ((document.getElementById("em-reg-source") as HTMLSelectElement)?.value as EmergencyPatient["arrivalSource"]) || "Walk-in"
                  const complaintInput = (document.getElementById("em-reg-complaint") as HTMLTextAreaElement)?.value || "Acute emergency presentation"
                  const flagInput = ((document.getElementById("em-reg-flag") as HTMLSelectElement)?.value as TriagePriority) || "green"

                  const newEmergencyPatient: EmergencyPatient = {
                    id: `EM-2026-00${emergencyQueue.length + 1}`,
                    patientId: mrnInput,
                    patientName: nameInput,
                    age: ageInput,
                    gender: genderInput,
                    arrivalTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    arrivalDate: "2026-10-16",
                    arrivalSource: sourceInput,
                    presentingComplaint: complaintInput,
                    triagePriority: flagInput === "red" ? "red" : "unassigned",
                    vitalSigns: {
                      bloodPressure: "120/80",
                      pulseRate: 80,
                      respiratoryRate: 18,
                      temperature: 36.8,
                      spO2: 98,
                      painScore: 4,
                    },
                    allergies: "Unknown",
                    clinicalNotes: "Registered at emergency reception. Awaiting initial triage.",
                    status: flagInput === "red" ? "in-treatment" : "awaiting-triage",
                    assignedClinician: "Nurse Rahel Kebede, B.Sc.",
                    emergencyBed: flagInput === "red" ? "RESUS-02" : null,
                    waitingMinutes: 0,
                  }

                  setEmergencyQueue([newEmergencyPatient, ...emergencyQueue])
                  setRegisterArrivalOpen(false)
                  showToast(`Emergency arrival registered for ${nameInput} (${mrnInput}).`)
                }}
              >
                <Icon name="check" size={16} /> Save &amp; Queue for Triage
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: 5-STEP GUIDED ADMISSION WIZARD
      ======================================================= */}
      {admissionWizardOpen && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box" style={{ maxWidth: "840px" }}>
            <div className="ie-modal-header">
              <h2>Guided Inpatient Admission — Step {admissionStep} of 5</h2>
              <button
                className="icon-button"
                onClick={() => setAdmissionWizardOpen(false)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Step Progress Rail */}
            <div className="ie-wizard-steps">
              <div className={`ie-wizard-step ${admissionStep === 1 ? "active" : admissionStep > 1 ? "completed" : ""}`}>
                <span className="ie-step-number">1</span>
                <span>Patient Identity</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${admissionStep === 2 ? "active" : admissionStep > 2 ? "completed" : ""}`}>
                <span className="ie-step-number">2</span>
                <span>Clinical Decision</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${admissionStep === 3 ? "active" : admissionStep > 3 ? "completed" : ""}`}>
                <span className="ie-step-number">3</span>
                <span>Ward &amp; Bed</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${admissionStep === 4 ? "active" : admissionStep > 4 ? "completed" : ""}`}>
                <span className="ie-step-number">4</span>
                <span>Review Details</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${admissionStep === 5 ? "active" : ""}`}>
                <span className="ie-step-number">5</span>
                <span>Confirmation</span>
              </div>
            </div>

            <div className="ie-modal-body">
              {/* Step 1: Patient Identity */}
              {admissionStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="user" size={16} />
                    <span>Search or select verified patient record to initiate inpatient admission.</span>
                  </div>
                  <div className="ie-form-grid-2">
                    <div className="ie-form-group">
                      <label>Patient Full Name</label>
                      <input
                        type="text"
                        value={admissionForm.patientName}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, patientName: e.target.value })}
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Medical Record Number (MRN)</label>
                      <input
                        type="text"
                        value={admissionForm.patientId}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, patientId: e.target.value })}
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={admissionForm.age}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, age: Number(e.target.value) })}
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Gender</label>
                      <select
                        className="ie-select"
                        value={admissionForm.gender}
                        onChange={(e) =>
                          setAdmissionForm({ ...admissionForm, gender: e.target.value as "Female" | "Male" })
                        }
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Clinical Decision */}
              {admissionStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="activity" size={16} />
                    <span>Record authorized clinical admission rationale and attending physician.</span>
                  </div>
                  <div className="ie-form-grid-2">
                    <div className="ie-form-group">
                      <label>Primary Working Diagnosis</label>
                      <input
                        type="text"
                        value={admissionForm.primaryDiagnosis}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, primaryDiagnosis: e.target.value })}
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Referring Department</label>
                      <select
                        className="ie-select"
                        value={admissionForm.referringDepartment}
                        onChange={(e) =>
                          setAdmissionForm({
                            ...admissionForm,
                            referringDepartment: e.target.value as any,
                          })
                        }
                      >
                        <option value="Emergency">Emergency Department</option>
                        <option value="OPD Internal Medicine">OPD Internal Medicine</option>
                        <option value="General Surgery">General Surgery Clinic</option>
                        <option value="Obstetrics & Gyn">Obstetrics &amp; Gynecology</option>
                        <option value="Pediatrics">Pediatrics Clinic</option>
                      </select>
                    </div>
                    <div className="ie-form-group">
                      <label>Admitting / Attending Physician</label>
                      <input
                        type="text"
                        value={admissionForm.attendingPhysician}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, attendingPhysician: e.target.value })}
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Estimated Inpatient Stay (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={admissionForm.estimatedStayDays}
                        onChange={(e) =>
                          setAdmissionForm({ ...admissionForm, estimatedStayDays: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="ie-form-group">
                    <label>Admission Reason &amp; Clinical Orders</label>
                    <textarea
                      rows={3}
                      value={admissionForm.admissionReason}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, admissionReason: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Select Inpatient Destination (Ward & Bed) */}
              {admissionStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="bed" size={16} />
                    <span>Select suitable inpatient ward and available bed. Occupied beds are prevented from double-allocation.</span>
                  </div>
                  <div className="ie-form-grid-2">
                    <div className="ie-form-group">
                      <label>Inpatient Ward</label>
                      <select
                        className="ie-select"
                        value={admissionForm.wardId}
                        onChange={(e) => {
                          const wId = e.target.value
                          const firstAvailable = beds.find((b) => b.wardId === wId && b.status === "available")
                          setAdmissionForm({
                            ...admissionForm,
                            wardId: wId,
                            bedId: firstAvailable ? firstAvailable.id : "",
                          })
                        }}
                      >
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.availableBeds} beds available)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ie-form-group">
                      <label>Available Beds in Selected Ward</label>
                      <select
                        className="ie-select"
                        value={admissionForm.bedId}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, bedId: e.target.value })}
                      >
                        <option value="">-- Choose an Available Bed --</option>
                        {beds
                          .filter((b) => b.wardId === admissionForm.wardId && b.status === "available")
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.bedNumber} — {b.bedType} (Available)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Bed status helper */}
                  {admissionForm.bedId ? (
                    <div className="ie-callout success">
                      <Icon name="check" size={16} />
                      <span>Bed {admissionForm.bedId} is confirmed clean and ready for immediate patient allocation.</span>
                    </div>
                  ) : (
                    <div className="ie-callout warning">
                      <Icon name="warning" size={16} />
                      <span>Please select an available bed before continuing.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review Admission Details */}
              {admissionStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="shield" size={16} />
                    <span>Review complete admission parameters before finalizing hospital bed occupancy.</span>
                  </div>
                  <div className="ie-summary-card">
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Patient:</span>
                      <span className="ie-summary-value">{admissionForm.patientName} ({admissionForm.patientId})</span>
                    </div>
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Diagnosis:</span>
                      <span className="ie-summary-value">{admissionForm.primaryDiagnosis}</span>
                    </div>
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Target Ward:</span>
                      <span className="ie-summary-value">{wards.find((w) => w.id === admissionForm.wardId)?.name}</span>
                    </div>
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Selected Bed:</span>
                      <span className="ie-summary-value">{beds.find((b) => b.id === admissionForm.bedId)?.bedNumber || admissionForm.bedId}</span>
                    </div>
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Attending Doctor:</span>
                      <span className="ie-summary-value">{admissionForm.attendingPhysician}</span>
                    </div>
                    <div className="ie-summary-row">
                      <span className="ie-summary-label">Estimated Stay:</span>
                      <span className="ie-summary-value">{admissionForm.estimatedStayDays} Days</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {admissionStep === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center", padding: "16px" }}>
                  <div style={{ margin: "0 auto", color: "var(--teal)" }}>
                    <Icon name="check" size={48} />
                  </div>
                  <h3 style={{ fontSize: "18px", color: "var(--navy)", margin: "0" }}>
                    Ready to Complete Inpatient Admission
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "540px", margin: "0 auto" }}>
                    Confirming will assign <strong>{admissionForm.patientName}</strong> to{" "}
                    <strong>{beds.find((b) => b.id === admissionForm.bedId)?.bedNumber}</strong> in{" "}
                    <strong>{wards.find((w) => w.id === admissionForm.wardId)?.name}</strong>, update ward occupancy counters, and register the admission event.
                  </p>
                </div>
              )}
            </div>

            <div className="ie-modal-footer">
              {admissionStep > 1 && (
                <Button
                  className="button secondary"
                  onClick={() => setAdmissionStep((s) => (s - 1) as any)}
                >
                  Back
                </Button>
              )}
              {admissionStep < 5 ? (
                <Button
                  className="button primary"
                  disabled={admissionStep === 3 && !admissionForm.bedId}
                  onClick={() => setAdmissionStep((s) => (s + 1) as any)}
                >
                  Continue to Step {admissionStep + 1}
                </Button>
              ) : (
                <Button className="button primary" onClick={handleCompleteAdmission}>
                  <Icon name="check" size={16} /> Confirm &amp; Admit Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 3: 5-STEP GUIDED DISCHARGE WIZARD
      ======================================================= */}
      {dischargeWizardOpen && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box" style={{ maxWidth: "840px" }}>
            <div className="ie-modal-header">
              <h2>Guided Patient Discharge — Step {dischargeStep} of 5</h2>
              <button
                className="icon-button"
                onClick={() => setDischargeWizardOpen(false)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Step Progress Rail */}
            <div className="ie-wizard-steps">
              <div className={`ie-wizard-step ${dischargeStep === 1 ? "active" : dischargeStep > 1 ? "completed" : ""}`}>
                <span className="ie-step-number">1</span>
                <span>Select Inpatient</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${dischargeStep === 2 ? "active" : dischargeStep > 2 ? "completed" : ""}`}>
                <span className="ie-step-number">2</span>
                <span>Clinical Decision</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${dischargeStep === 3 ? "active" : dischargeStep > 3 ? "completed" : ""}`}>
                <span className="ie-step-number">3</span>
                <span>Instructions &amp; Rx</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${dischargeStep === 4 ? "active" : dischargeStep > 4 ? "completed" : ""}`}>
                <span className="ie-step-number">4</span>
                <span>Admin Clearances</span>
              </div>
              <div className="ie-step-divider" />
              <div className={`ie-wizard-step ${dischargeStep === 5 ? "active" : ""}`}>
                <span className="ie-step-number">5</span>
                <span>Complete Discharge</span>
              </div>
            </div>

            <div className="ie-modal-body">
              {/* Step 1: Select Inpatient */}
              {dischargeStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="user" size={16} />
                    <span>Select an active inpatient admission to process clinical discharge.</span>
                  </div>
                  <div className="ie-form-group">
                    <label>Active Inpatient Admissions</label>
                    <select
                      className="ie-select"
                      value={dischargeForm.admissionRef}
                      onChange={(e) => setDischargeForm({ ...dischargeForm, admissionRef: e.target.value })}
                    >
                      {admissions
                        .filter((a) => a.status === "admitted" || a.status === "discharge-approved")
                        .map((a) => (
                          <option key={a.admissionRef} value={a.admissionRef}>
                            {a.admissionRef} — {a.patientName} ({a.wardName}, {a.bedLabel}) · {a.primaryDiagnosis}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Clinical Decision */}
              {dischargeStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="activity" size={16} />
                    <span>Record authorized physician and discharge destination.</span>
                  </div>
                  <div className="ie-form-grid-2">
                    <div className="ie-form-group">
                      <label>Authorizing Physician</label>
                      <input
                        type="text"
                        value={dischargeForm.authorizingPhysician}
                        onChange={(e) =>
                          setDischargeForm({ ...dischargeForm, authorizingPhysician: e.target.value })
                        }
                      />
                    </div>
                    <div className="ie-form-group">
                      <label>Discharge Destination / Disposition</label>
                      <select
                        className="ie-select"
                        value={dischargeForm.destination}
                        onChange={(e) =>
                          setDischargeForm({ ...dischargeForm, destination: e.target.value as any })
                        }
                      >
                        <option value="Home with Care Plan">Home with Care Plan</option>
                        <option value="Specialist Referral (Tikur Anbessa)">Specialist Referral (Tikur Anbessa)</option>
                        <option value="Local Health Center Follow-up">Local Health Center Follow-up</option>
                        <option value="Community Health Post">Community Health Post</option>
                      </select>
                    </div>
                  </div>
                  <div className="ie-form-group">
                    <label>Clinical Discharge Summary</label>
                    <textarea
                      rows={4}
                      value={dischargeForm.clinicalSummary}
                      onChange={(e) => setDischargeForm({ ...dischargeForm, clinicalSummary: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Instructions & Discharge Medications */}
              {dischargeStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="pill" size={16} />
                    <span>Provide take-home medications and scheduled follow-up clinic appointment date.</span>
                  </div>
                  <div className="ie-form-group">
                    <label>Discharge Take-Home Medications (comma-separated)</label>
                    <textarea
                      rows={3}
                      value={dischargeForm.dischargeMedications}
                      onChange={(e) =>
                        setDischargeForm({ ...dischargeForm, dischargeMedications: e.target.value })
                      }
                      placeholder="e.g. Ciprofloxacin 500 mg oral twice daily, Paracetamol 500 mg as needed"
                    />
                  </div>
                  <div className="ie-form-group">
                    <label>Follow-up Appointment Date</label>
                    <input
                      type="date"
                      value={dischargeForm.followUpDate}
                      onChange={(e) => setDischargeForm({ ...dischargeForm, followUpDate: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Administrative Clearances */}
              {dischargeStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ie-callout info">
                    <Icon name="shield" size={16} />
                    <span>Confirm multidisciplinary clearance verification before final discharge execution.</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--background)", padding: "16px", borderRadius: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={dischargeForm.pharmacyCleared}
                        onChange={(e) => setDischargeForm({ ...dischargeForm, pharmacyCleared: e.target.checked })}
                      />
                      Pharmacy Dispensing Clearance (Discharge medications verified)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={dischargeForm.billingCleared}
                        onChange={(e) => setDischargeForm({ ...dischargeForm, billingCleared: e.target.checked })}
                      />
                      Hospital Billing &amp; Cashier Clearance (Invoices settled / approved)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={dischargeForm.summarySigned}
                        onChange={(e) => setDischargeForm({ ...dischargeForm, summarySigned: e.target.checked })}
                      />
                      Physician Clinical Discharge Summary Signed &amp; Authenticated
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Complete Discharge */}
              {dischargeStep === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center", padding: "16px" }}>
                  <div style={{ margin: "0 auto", color: "var(--teal)" }}>
                    <Icon name="check" size={48} />
                  </div>
                  <h3 style={{ fontSize: "18px", color: "var(--navy)", margin: "0" }}>
                    Ready to Complete Discharge
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "540px", margin: "0 auto" }}>
                    This will mark the admission as discharged, record the discharge summary, place the assigned bed into <strong>Cleaning / Turnaround</strong> mode, and release ward occupancy.
                  </p>
                </div>
              )}
            </div>

            <div className="ie-modal-footer">
              {dischargeStep > 1 && (
                <Button
                  className="button secondary"
                  onClick={() => setDischargeStep((s) => (s - 1) as any)}
                >
                  Back
                </Button>
              )}
              {dischargeStep < 5 ? (
                <Button
                  className="button primary"
                  onClick={() => setDischargeStep((s) => (s + 1) as any)}
                >
                  Continue to Step {dischargeStep + 1}
                </Button>
              ) : (
                <Button className="button primary" onClick={handleCompleteDischarge}>
                  <Icon name="check" size={16} /> Finalize Discharge &amp; Release Bed
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 4: PATIENT BED TRANSFER
      ======================================================= */}
      {transferBedOpen && selectedBed && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box">
            <div className="ie-modal-header">
              <h2>Transfer Inpatient — {selectedBed.currentPatientName}</h2>
              <button
                className="icon-button"
                onClick={() => setTransferBedOpen(false)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="ie-modal-body">
              <div className="ie-callout info">
                <Icon name="arrow" size={16} />
                <span>
                  Current Bed: <strong>{selectedBed.bedNumber} ({selectedBed.wardName})</strong>. Select a clean, available target bed for clinical transfer.
                </span>
              </div>

              <div className="ie-form-group">
                <label>Target Available Bed</label>
                <select className="ie-select" id="transfer-target-bed">
                  {beds
                    .filter((b) => b.status === "available" && b.id !== selectedBed.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.wardName} — {b.bedNumber} ({b.bedType})
                      </option>
                    ))}
                </select>
              </div>

              <div className="ie-form-group">
                <label>Clinical Reason for Transfer</label>
                <input
                  type="text"
                  placeholder="e.g. Clinical improvement, step-down care, telemetry monitoring required"
                  id="transfer-reason"
                />
              </div>
            </div>
            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setTransferBedOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button primary"
                onClick={() => {
                  const targetBedId = (document.getElementById("transfer-target-bed") as HTMLSelectElement)?.value
                  const targetBed = beds.find((b) => b.id === targetBedId)
                  if (!targetBed) return

                  // 1. Update source bed to cleaning
                  // 2. Update target bed to occupied
                  setBeds(
                    beds.map((b) => {
                      if (b.id === selectedBed.id) {
                        return {
                          ...b,
                          status: "cleaning" as BedStatus,
                          currentPatientId: null,
                          currentPatientName: null,
                          admissionRef: null,
                          occupiedSince: null,
                          notes: `Patient transferred to ${targetBed.bedNumber}; turnaround required.`,
                        }
                      }
                      if (b.id === targetBed.id) {
                        return {
                          ...b,
                          status: "occupied" as BedStatus,
                          currentPatientId: selectedBed.currentPatientId,
                          currentPatientName: selectedBed.currentPatientName,
                          admissionRef: selectedBed.admissionRef,
                          occupiedSince: "2026-10-16",
                          notes: `Transferred from ${selectedBed.bedNumber}`,
                        }
                      }
                      return b
                    })
                  )

                  setTransferBedOpen(false)
                  showToast(`Patient ${selectedBed.currentPatientName} successfully transferred to ${targetBed.bedNumber} (${targetBed.wardName}).`)
                }}
              >
                <Icon name="check" size={16} /> Execute Bed Transfer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          DRAWER: DISCHARGE SUMMARY VIEW
      ======================================================= */}
      {selectedDischarge && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box" style={{ maxWidth: "680px" }}>
            <div className="ie-modal-header">
              <h2>Discharge Summary — {selectedDischarge.dischargeId}</h2>
              <button
                className="icon-button"
                onClick={() => setSelectedDischarge(null)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="ie-modal-body">
              <div className="ie-summary-card">
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Patient:</span>
                  <span className="ie-summary-value">{selectedDischarge.patientName} ({selectedDischarge.patientId})</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Admission Ref:</span>
                  <span className="ie-summary-value">{selectedDischarge.admissionRef}</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Inpatient Ward:</span>
                  <span className="ie-summary-value">{selectedDischarge.wardName} ({selectedDischarge.bedLabel})</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Dates of Stay:</span>
                  <span className="ie-summary-value">
                    {selectedDischarge.admissionDate} to {selectedDischarge.dischargeDate} ({selectedDischarge.lengthOfStayDays} days)
                  </span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Authorizing Doctor:</span>
                  <span className="ie-summary-value">{selectedDischarge.authorizingPhysician}</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Destination:</span>
                  <span className="ie-summary-value">{selectedDischarge.destination}</span>
                </div>
              </div>

              <div className="ie-form-section">
                <h3>Clinical Summary</h3>
                <p style={{ fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
                  {selectedDischarge.clinicalSummary}
                </p>
              </div>

              <div className="ie-form-section">
                <h3>Take-Home Medications</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                  {selectedDischarge.dischargeMedications.map((med, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{med}</li>
                  ))}
                </ul>
              </div>

              <div className="ie-form-section">
                <h3>Follow-up Plan</h3>
                <p style={{ fontSize: "13px", margin: 0 }}>
                  Appointment: <strong>{selectedDischarge.followUpDate}</strong>
                </p>
              </div>
            </div>
            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setSelectedDischarge(null)}>
                Close
              </Button>
              <Button
                className="button primary"
                onClick={() => {
                  window.print()
                }}
              >
                <Icon name="printer" size={16} /> Print Discharge Slip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          DRAWER: WARD DETAILS VIEW
      ======================================================= */}
      {selectedWard && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box" style={{ maxWidth: "720px" }}>
            <div className="ie-modal-header">
              <h2>{selectedWard.name} — Current Inpatients</h2>
              <button
                className="icon-button"
                onClick={() => setSelectedWard(null)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="ie-modal-body">
              <div className="ie-summary-card">
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Location:</span>
                  <span className="ie-summary-value">{selectedWard.location}</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Total Beds:</span>
                  <span className="ie-summary-value">{selectedWard.totalBeds} Configured</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Active Inpatients:</span>
                  <span className="ie-summary-value">{selectedWard.inpatientCount} Patients</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Available Capacity:</span>
                  <span className="ie-summary-value">{selectedWard.availableBeds} Clean Beds</span>
                </div>
              </div>

              <div className="ie-table-container">
                <table className="ie-table">
                  <thead>
                    <tr>
                      <th>Bed</th>
                      <th>Patient Name</th>
                      <th>MRN</th>
                      <th>Admission Diagnosis</th>
                      <th>Stay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions
                      .filter((a) => a.wardId === selectedWard.id && a.status === "admitted")
                      .map((a) => (
                        <tr key={a.admissionRef}>
                          <td><strong>{a.bedLabel}</strong></td>
                          <td>{a.patientName}</td>
                          <td>{a.patientId}</td>
                          <td>{a.primaryDiagnosis}</td>
                          <td>{a.admissionDate}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setSelectedWard(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          DRAWER: EMERGENCY PATIENT DETAILS
      ======================================================= */}
      {selectedEmergencyPatient && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box">
            <div className="ie-modal-header">
              <h2>Emergency Record — {selectedEmergencyPatient.patientName}</h2>
              <button
                className="icon-button"
                onClick={() => setSelectedEmergencyPatient(null)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="ie-modal-body">
              <div className="ie-summary-card">
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Patient MRN:</span>
                  <span className="ie-summary-value">{selectedEmergencyPatient.patientId}</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Arrival:</span>
                  <span className="ie-summary-value">{selectedEmergencyPatient.arrivalTime} ({selectedEmergencyPatient.arrivalSource})</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Complaint:</span>
                  <span className="ie-summary-value">{selectedEmergencyPatient.presentingComplaint}</span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Vital Signs:</span>
                  <span className="ie-summary-value">
                    BP {selectedEmergencyPatient.vitalSigns.bloodPressure} · HR {selectedEmergencyPatient.vitalSigns.pulseRate} · SpO2 {selectedEmergencyPatient.vitalSigns.spO2}%
                  </span>
                </div>
                <div className="ie-summary-row">
                  <span className="ie-summary-label">Notes:</span>
                  <span className="ie-summary-value">{selectedEmergencyPatient.clinicalNotes}</span>
                </div>
              </div>
            </div>
            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setSelectedEmergencyPatient(null)}>
                Close
              </Button>
              <Button
                className="button primary"
                onClick={() => {
                  const p = selectedEmergencyPatient
                  setSelectedEmergencyPatient(null)
                  startAdmissionFromEmergency(p)
                }}
              >
                Proceed to Admission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 5: WARD CAPACITY CONFIGURATION
      ======================================================= */}
      {wardConfigOpen && (
        <div className="ie-modal-overlay" role="dialog" aria-modal="true">
          <div className="ie-modal-box">
            <div className="ie-modal-header">
              <h2>Ward Capacity &amp; Operational Governance</h2>
              <button
                className="icon-button"
                onClick={() => setWardConfigOpen(false)}
                aria-label="Close dialog"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="ie-modal-body">
              <div className="ie-callout warning">
                <Icon name="warning" size={16} />
                <span>
                  Ward capacity alterations cannot reduce configured beds below the currently occupied inpatient count without active bed reassignment.
                </span>
              </div>
              <div className="ie-table-container">
                <table className="ie-table">
                  <thead>
                    <tr>
                      <th>Ward</th>
                      <th>Current Beds</th>
                      <th>Occupied</th>
                      <th>Operational Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map((w) => (
                      <tr key={w.id}>
                        <td><strong>{w.name}</strong></td>
                        <td>{w.totalBeds} Beds</td>
                        <td>{w.occupiedBeds} Inpatients</td>
                        <td>
                          <select className="ie-select" defaultValue={w.operationalStatus}>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="quarantine">Quarantine Isolation</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ie-modal-footer">
              <Button className="button secondary" onClick={() => setWardConfigOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button primary"
                onClick={() => {
                  setWardConfigOpen(false)
                  showToast("Ward capacity governance parameters saved successfully.")
                }}
              >
                <Icon name="check" size={16} /> Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
