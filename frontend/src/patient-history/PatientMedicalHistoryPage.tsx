// ORHIMS — Patient Medical History Screen (Phase 05, Prompt 27)

import { useState, useMemo } from "react"
import Icon from "../Icon"
import { Button, Heading } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  sampleMedicalHistory,
  emptyMedicalHistory,
  type HistoryTabId,
  type SimulationState,
  type HistoricalEncounter,
  type HistoricalCondition,
  type HistoricalAllergy,
  type HistoricalMedication,
  type HistoricalProcedure,
  type HistoricalLabReport,
  type HistoricalClinicalNote,
} from "./model"
import "./patient-history.css"

export default function PatientMedicalHistoryPage({
  state: initialSimState = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  // Check doctor/nurse permissions for accessing medical history
  const canAccess =
    permissions.has("consultations") ||
    permissions.has("clinical-workspace") ||
    permissions.has("assigned") ||
    permissions.has("records") ||
    permissions.has("triage")

  // State management
  const [simState, setSimState] = useState<SimulationState>(
    initialSimState === "empty"
      ? "empty"
      : initialSimState === "error"
        ? "error"
        : initialSimState === "loading"
          ? "loading"
          : "ready"
  )
  const [activeTab, setActiveTab] = useState<HistoryTabId>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"all" | "6m" | "1y" | "older">("all")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  // Traceable Detail Drawer State
  const [selectedRecord, setSelectedRecord] = useState<{
    title: string
    category: string
    date: string
    author: string
    role: string
    encounterId: string
    status?: string
    notes: string
    details?: Record<string, string>
  } | null>(null)

  // Choose dataset based on simulation
  const data = simState === "empty" ? emptyMedicalHistory : sampleMedicalHistory

  // Filtered Encounters
  const filteredEncounters = useMemo(() => {
    let list = [...data.encounters]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.encounterId.toLowerCase().includes(q) ||
          e.chiefComplaint.toLowerCase().includes(q) ||
          e.primaryDiagnosis.toLowerCase().includes(q) ||
          e.doctor.toLowerCase().includes(q) ||
          e.clinic.toLowerCase().includes(q)
      )
    }

    if (dateFilter === "6m") {
      list = list.filter((e) => e.date.includes("2026") || e.date.includes("Nov 2025"))
    } else if (dateFilter === "1y") {
      list = list.filter((e) => e.date.includes("2026") || e.date.includes("2025"))
    }

    if (sortOrder === "asc") {
      list.reverse()
    }

    return list
  }, [data.encounters, searchQuery, dateFilter, sortOrder])

  // Filtered Conditions
  const filteredConditions = useMemo(() => {
    let list = [...data.conditions]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.clinicalNotes.toLowerCase().includes(q) ||
          c.recordedBy.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.conditions, searchQuery])

  // Filtered Medications
  const filteredMedications = useMemo(() => {
    let list = [...data.medications]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.indication.toLowerCase().includes(q) ||
          m.prescribingDoctor.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.medications, searchQuery])

  // Filtered Labs
  const filteredLabs = useMemo(() => {
    let list = [...data.labReports]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (l) =>
          l.testName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.orderingDoctor.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.labReports, searchQuery])

  if (!canAccess) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  return (
    <div className="patient-history-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="pmh-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("consultations")}>Doctor Dashboard</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("clinical-workspace")}>Clinical Workspace</Button>
        <Icon name="chevron" size={11} />
        <strong>Patient Medical History</strong>
      </nav>

      {/* ── Simulation State Toolbar (Prompt 27 - Section 14) ── */}
      <div className="pmh-state-toolbar">
        <span style={{ fontWeight: 600, color: "var(--navy)" }}>
          Clinical Archive State Simulation:
        </span>
        <div className="pmh-state-pills">
          <button
            type="button"
            className={`pmh-state-pill${simState === "ready" ? " active" : ""}`}
            onClick={() => setSimState("ready")}
          >
            Verified History (Standard)
          </button>
          <button
            type="button"
            className={`pmh-state-pill${simState === "empty" ? " active" : ""}`}
            onClick={() => setSimState("empty")}
          >
            New Patient (No History)
          </button>
          <button
            type="button"
            className={`pmh-state-pill${simState === "loading" ? " active" : ""}`}
            onClick={() => setSimState("loading")}
          >
            Loading Archive
          </button>
          <button
            type="button"
            className={`pmh-state-pill${simState === "error" ? " active" : ""}`}
            onClick={() => setSimState("error")}
          >
            Record Retrieval Error
          </button>
        </div>
      </div>

      {/* ── Patient Identity Header ── */}
      <div className="pmh-identity-banner">
        <div className="pmh-identity-top">
          <div className="pmh-patient-info-left">
            <div className="pmh-avatar">
              {data.patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="pmh-patient-title-group">
              <div className="pmh-patient-name-row">
                <h1 className="pmh-patient-name">{data.patient.name}</h1>
                {data.patient.amharicName && (
                  <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>
                    ({data.patient.amharicName})
                  </span>
                )}
                <span className="pmh-mrn-chip">{data.patient.patientId}</span>
                <span
                  style={{
                    background: "var(--mist)",
                    border: "1px solid var(--border)",
                    color: "var(--teal)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  Medical History Archive
                </span>
              </div>
              <div className="pmh-meta-row">
                <span>
                  Sex: <strong>{data.patient.sex}</strong>
                </span>
                <span>·</span>
                <span>
                  Age: <strong>{data.patient.age}</strong> (DOB: {data.patient.dob})
                </span>
                <span>·</span>
                <span>
                  Blood Group: <strong>{data.patient.bloodGroup}</strong>
                </span>
                <span>·</span>
                <span>
                  Residence: <strong>{data.patient.kebele}, Bale Robe</strong>
                </span>
                <span>·</span>
                <span>
                  Phone: <strong>{data.patient.phone}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pmh-header-actions">
            <Button
              className="button secondary"
              onClick={() => onNavigate("consultations")}
            >
              <Icon name="arrow" size={14} />
              Doctor Dashboard
            </Button>
            <Button
              className="button"
              onClick={() => onNavigate("clinical-workspace")}
            >
              <Icon name="edit" size={14} />
              Return to Clinical Workspace
            </Button>
          </div>
        </div>

        {/* ── Active Encounter Safety Separation Strip (Prompt 27 - Section 3) ── */}
        <div className="pmh-active-encounter-strip">
          <div className="pmh-aes-left">
            <span className="pmh-aes-badge">Active Encounter</span>
            <span className="pmh-aes-text">
              <strong>{data.currentEncounter.encounterId}</strong> · {data.currentEncounter.type} (
              {data.currentEncounter.clinic}) · Attending:{" "}
              <strong>{data.currentEncounter.attendingDoctor}</strong> · {data.currentEncounter.startTime}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 600 }}>
            Current Visit In-Progress · Historical records below are read-only
          </span>
        </div>
      </div>

      {/* ── Loading State View ── */}
      {simState === "loading" && (
        <div className="pmh-loading-card">
          <Icon name="clock" size={28} />
          <Heading level={3} style={{ color: "var(--navy)", marginTop: "12px" }}>
            Retrieving Historical Patient Archive...
          </Heading>
          <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "420px", margin: "8px auto 24px" }}>
            Fetching verified encounters, clinical notes, laboratory histories, and prior diagnoses for {data.patient.name}.
          </p>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="pmh-shimmer-box" style={{ width: "100%", height: "24px" }} />
            <div className="pmh-shimmer-box" style={{ width: "85%", height: "18px" }} />
            <div className="pmh-shimmer-box" style={{ width: "70%", height: "18px" }} />
          </div>
        </div>
      )}

      {/* ── Error State View ── */}
      {simState === "error" && (
        <div className="pmh-error-state">
          <Icon name="warning" size={32} />
          <Heading level={3} style={{ color: "var(--emergency)", marginTop: "10px" }}>
            Archive Retrieval Interrupted
          </Heading>
          <p style={{ fontSize: "13px", color: "#7f1d1d", maxWidth: "480px", margin: "8px auto 20px" }}>
            Unable to connect to the ORHIMS archival record repository for Patient {data.patient.patientId}. Local cached records may be incomplete.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Button className="button" onClick={() => setSimState("ready")}>
              Retry Connection
            </Button>
            <Button className="button secondary" onClick={() => onNavigate("clinical-workspace")}>
              Return to Clinical Workspace
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Ready / Empty History View ── */}
      {(simState === "ready" || simState === "empty") && (
        <>
          {/* ── Navigation Tabs ── */}
          <div className="pmh-nav-tabs-wrapper">
            <div className="pmh-nav-tabs">
              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "overview" ? " active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <Icon name="shield" size={15} />
                Overview
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "encounters" ? " active" : ""}`}
                onClick={() => setActiveTab("encounters")}
              >
                <Icon name="clock" size={15} />
                Encounter History
                <span className="pmh-tab-count">{data.encounters.length}</span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "conditions" ? " active" : ""}`}
                onClick={() => setActiveTab("conditions")}
              >
                <Icon name="heart" size={15} />
                Medical Conditions
                <span className="pmh-tab-count">{data.conditions.length}</span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "allergies" ? " active" : ""}`}
                onClick={() => setActiveTab("allergies")}
              >
                <Icon name="warning" size={15} />
                Allergies
                <span className="pmh-tab-count">
                  {data.allergies.filter((a) => a.status === "Verified & Active").length}
                </span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "medications" ? " active" : ""}`}
                onClick={() => setActiveTab("medications")}
              >
                <Icon name="pill" size={15} />
                Medications
                <span className="pmh-tab-count">{data.medications.length}</span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "procedures" ? " active" : ""}`}
                onClick={() => setActiveTab("procedures")}
              >
                <Icon name="edit" size={15} />
                Procedures &amp; Surgeries
                <span className="pmh-tab-count">{data.procedures.length}</span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "family-social" ? " active" : ""}`}
                onClick={() => setActiveTab("family-social")}
              >
                <Icon name="user" size={15} />
                Family &amp; Social
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "labs" ? " active" : ""}`}
                onClick={() => setActiveTab("labs")}
              >
                <Icon name="flask" size={15} />
                Laboratory &amp; Diagnostics
                <span className="pmh-tab-count">{data.labReports.length}</span>
              </button>

              <button
                type="button"
                className={`pmh-tab-btn${activeTab === "notes" ? " active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <Icon name="mail" size={15} />
                Clinical Notes
                <span className="pmh-tab-count">{data.clinicalNotes.length}</span>
              </button>
            </div>
          </div>

          {/* ── Filter & Search Toolbar (When viewing list tabs) ── */}
          {activeTab !== "overview" && activeTab !== "family-social" && (
            <div className="pmh-filter-toolbar">
              <div className="pmh-search-wrapper">
                <Icon name="search" size={16} />
                <input
                  type="text"
                  className="pmh-search-input"
                  placeholder={`Search ${activeTab.replace("-", " ")} by keyword, doctor, ID...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="pmh-filter-actions">
                <select
                  className="pmh-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                >
                  <option value="all">All Dates Available</option>
                  <option value="6m">Past 6 Months</option>
                  <option value="1y">Past 1 Year</option>
                </select>

                <button
                  type="button"
                  className="pmh-sort-btn"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                >
                  <Icon name="clock" size={14} />
                  <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                </button>

                {(searchQuery || dateFilter !== "all") && (
                  <Button
                    className="button secondary"
                    onClick={() => {
                      setSearchQuery("")
                      setDateFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 1: OVERVIEW
             ══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <>
              {/* Allergy Alert Banner if high-risk allergy documented */}
              {data.allergies.some((a) => a.status === "Verified & Active") && (
                <div className="pmh-allergy-alert-card">
                  <div className="pmh-allergy-alert-header">
                    <Icon name="warning" size={18} />
                    <span>DOCUMENTED CRITICAL ALLERGY: PENICILLIN DERIVATIVES</span>
                  </div>
                  <div className="pmh-allergy-alert-text">
                    Severe Type I hypersensitivity (anaphylaxis risk) documented on 15 Mar 2025 by Dr. Dawit Alemu.
                    All penicillin and beta-lactam class medications are contraindicated.
                  </div>
                </div>
              )}

              {/* Category Availability Overview Grid (Prompt 27 - Section 4) */}
              <div className="pmh-overview-grid">
                {/* 1. Previous Encounters */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("encounters")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="clock" size={16} />
                        Encounter History
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.encounters.length > 0 ? "available" : "unrecorded"
                        }`}
                      >
                        {data.encounters.length > 0 ? "Available" : "No Past Visits"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.encounters.length > 0 ? (
                        <>
                          <strong>{data.encounters.length} previous visits</strong> documented at Oda Roba Hospital.
                          Most recent: <em>{data.encounters[0].date} ({data.encounters[0].type})</em>.
                        </>
                      ) : (
                        "No prior encounters logged for this patient registration."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>View Chronological Timeline</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>

                {/* 2. Medical Conditions */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("conditions")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="heart" size={16} />
                        Medical Conditions
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.conditions.length > 0 ? "available" : "absent"
                        }`}
                      >
                        {data.conditions.length > 0 ? "Documented" : "Not Documented"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.conditions.length > 0 ? (
                        <>
                          <strong>{data.conditions.length} conditions</strong> recorded. Includes:{" "}
                          {data.conditions.map((c) => c.name).join(", ")}.
                        </>
                      ) : (
                        "No medical conditions have been recorded in the available hospital history."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>Review Conditions</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>

                {/* 3. Allergies */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("allergies")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="warning" size={16} />
                        Recorded Allergies
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.allergies.some((a) => a.status === "Verified & Active")
                            ? "warning"
                            : "absent"
                        }`}
                      >
                        {data.allergies.some((a) => a.status === "Verified & Active")
                          ? "Active Alert"
                          : "Unverified"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.allergies.length > 0 ? (
                        <>
                          <strong>{data.allergies[0].allergen}</strong> verified severe reaction. Latex explicitly
                          documented absent.
                        </>
                      ) : (
                        "Allergy information has not been verified or recorded. Absence of record does NOT imply no allergy."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>Inspect Allergy Details</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>

                {/* 4. Medications */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("medications")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="pill" size={16} />
                        Medication History
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.medications.length > 0 ? "available" : "absent"
                        }`}
                      >
                        {data.medications.length > 0 ? "Available" : "None Logged"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.medications.length > 0 ? (
                        <>
                          <strong>{data.medications.filter((m) => m.status === "Active").length} active</strong>,{" "}
                          {data.medications.filter((m) => m.status === "Completed").length} completed,{" "}
                          {data.medications.filter((m) => m.status === "Discontinued").length} discontinued medications.
                        </>
                      ) : (
                        "No prior hospital prescriptions found on record."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>Inspect Medication Log</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>

                {/* 5. Procedures & Surgeries */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("procedures")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="edit" size={16} />
                        Procedures &amp; Surgeries
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.procedures.length > 0 ? "available" : "unrecorded"
                        }`}
                      >
                        {data.procedures.length > 0 ? "1 Recorded" : "Not Recorded"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.procedures.length > 0 ? (
                        <>
                          <strong>Minor procedure:</strong> Forearm laceration suture closure (Aug 2025). Major
                          surgeries not recorded.
                        </>
                      ) : (
                        "No surgical history has been recorded. This does not confirm absence of external surgeries."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>Review Procedures</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>

                {/* 6. Laboratory & Diagnostic Results */}
                <div className="pmh-overview-card" onClick={() => setActiveTab("labs")}>
                  <div>
                    <div className="pmh-oc-head">
                      <span className="pmh-oc-title">
                        <Icon name="flask" size={16} />
                        Laboratory Results
                      </span>
                      <span
                        className={`pmh-oc-status-badge ${
                          data.labReports.length > 0 ? "available" : "absent"
                        }`}
                      >
                        {data.labReports.length > 0 ? "Reports On File" : "None"}
                      </span>
                    </div>
                    <div className="pmh-oc-body">
                      {data.labReports.length > 0 ? (
                        <>
                          <strong>{data.labReports.length} diagnostic reports</strong> available (CBC, ESR, RBG, Sputum
                          AFB). All signed by clinician.
                        </>
                      ) : (
                        "No previous diagnostic laboratory reports found on file."
                      )}
                    </div>
                  </div>
                  <div className="pmh-oc-footer">
                    <span>View Diagnostic Results</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════
              TAB 2: ENCOUNTER HISTORY TIMELINE
             ══════════════════════════════════════════════ */}
          {activeTab === "encounters" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="clock" size={18} />
                  Chronological Encounter Timeline ({filteredEncounters.length} Visits)
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Click an encounter to inspect complete clinical summary
                </span>
              </div>

              {filteredEncounters.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="clock" size={32} />
                  <div className="pmh-empty-title">No Historical Encounters Found</div>
                  <div className="pmh-empty-desc">
                    {searchQuery
                      ? "No previous encounters match your search query."
                      : "No past encounters have been recorded for this patient at Oda Roba Hospital."}
                  </div>
                  <div className="pmh-honest-note">
                    Note: Newly registered patients will only possess their current active visit record until discharge
                    or follow-up occurs.
                  </div>
                </div>
              ) : (
                <div className="pmh-timeline-container">
                  <div className="pmh-timeline-line" />
                  {filteredEncounters.map((enc) => (
                    <div key={enc.id} className="pmh-timeline-node">
                      <div className="pmh-timeline-dot" />
                      <div
                        className="pmh-timeline-card"
                        onClick={() =>
                          setSelectedRecord({
                            title: `Encounter: ${enc.encounterId} (${enc.type})`,
                            category: "Encounter Record",
                            date: `${enc.date} · ${enc.time}`,
                            author: enc.doctor,
                            role: enc.doctorRole,
                            encounterId: enc.encounterId,
                            status: enc.status,
                            notes: enc.summary,
                            details: {
                              "Clinic / Department": enc.clinic,
                              "Chief Complaint": enc.chiefComplaint,
                              "Primary Diagnosis": enc.primaryDiagnosis,
                              "Visit Disposition": enc.status,
                            },
                          })
                        }
                      >
                        <div className="pmh-tc-header">
                          <div className="pmh-tc-date-group">
                            <span className="pmh-tc-date">{enc.date}</span>
                            <span className="pmh-tc-time">{enc.time}</span>
                            <span className="pmh-tc-type-badge">{enc.type}</span>
                            <span className="pmh-mrn-chip">{enc.encounterId}</span>
                          </div>
                          <span className="pmh-badge completed">{enc.status}</span>
                        </div>

                        <div className="pmh-tc-complaint">
                          Chief Complaint: {enc.chiefComplaint}
                        </div>
                        <div className="pmh-tc-diagnosis">
                          Primary Diagnosis: {enc.primaryDiagnosis}
                        </div>
                        <div className="pmh-tc-summary">{enc.summary}</div>

                        <div className="pmh-tc-footer">
                          <span>
                            Attending: <strong>{enc.doctor}</strong> ({enc.doctorRole}) · {enc.clinic}
                          </span>
                          <span style={{ color: "var(--teal)", fontWeight: 600 }}>
                            View Traceable Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 3: MEDICAL CONDITIONS
             ══════════════════════════════════════════════ */}
          {activeTab === "conditions" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="heart" size={18} />
                  Previously Documented Medical Conditions
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Historical diagnoses retained with clinical provenance
                </span>
              </div>

              {filteredConditions.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="heart" size={32} />
                  <div className="pmh-empty-title">No Medical Conditions Recorded</div>
                  <div className="pmh-empty-desc">
                    No medical conditions or chronic diagnoses have been entered into the patient's record.
                  </div>
                  <div className="pmh-honest-note">
                    Absence of documentation does not confirm that the patient has never suffered from any illness.
                    Only verifiable hospital observations are shown.
                  </div>
                </div>
              ) : (
                <table className="pmh-table">
                  <thead>
                    <tr>
                      <th>Condition / Diagnosis</th>
                      <th>ICD Reference</th>
                      <th>Clinical Status</th>
                      <th>Date Recorded</th>
                      <th>Documenting Clinician</th>
                      <th>Associated Visit</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConditions.map((cond) => (
                      <tr key={cond.id}>
                        <td>
                          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>{cond.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                            {cond.clinicalNotes}
                          </div>
                        </td>
                        <td>
                          <code style={{ background: "var(--mist)", padding: "2px 6px", borderRadius: "3px" }}>
                            {cond.icdCode || "—"}
                          </code>
                        </td>
                        <td>
                          <span
                            className={`pmh-badge ${
                              cond.status === "Active"
                                ? "active"
                                : cond.status === "Chronic"
                                  ? "chronic"
                                  : "resolved"
                            }`}
                          >
                            {cond.status}
                          </span>
                        </td>
                        <td>{cond.dateRecorded}</td>
                        <td>
                          <strong>{cond.recordedBy}</strong>
                          <div style={{ fontSize: "10px", color: "var(--muted)" }}>{cond.role}</div>
                        </td>
                        <td>
                          <span className="pmh-mrn-chip">{cond.encounterId}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            className="button secondary compact"
                            onClick={() =>
                              setSelectedRecord({
                                title: cond.name,
                                category: "Documented Medical Condition",
                                date: cond.dateRecorded,
                                author: cond.recordedBy,
                                role: cond.role,
                                encounterId: cond.encounterId,
                                status: cond.status,
                                notes: cond.clinicalNotes,
                                details: {
                                  "ICD Code": cond.icdCode || "Not codified",
                                  "Status": cond.status,
                                  "Associated Encounter": cond.encounterId,
                                },
                              })
                            }
                          >
                            Trace
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 4: ALLERGY HISTORY (CRITICAL SAFETY)
             ══════════════════════════════════════════════ */}
          {activeTab === "allergies" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="warning" size={18} />
                  Allergy &amp; Hypersensitivity Record
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Verified allergen reactions and documented explicit exclusions
                </span>
              </div>

              {data.allergies.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="warning" size={32} />
                  <div className="pmh-empty-title">Allergy Information Not Recorded</div>
                  <div className="pmh-empty-desc">
                    No allergy assessment has been recorded in the patient file.
                  </div>
                  <div className="pmh-honest-note" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                    <strong>Safety Rule:</strong> Never assume "No Known Drug Allergies" when unrecorded. Always ask the
                    patient directly before administering any substance.
                  </div>
                </div>
              ) : (
                <>
                  <table className="pmh-table">
                    <thead>
                      <tr>
                        <th>Substance / Allergen</th>
                        <th>Type</th>
                        <th>Documented Reaction</th>
                        <th>Severity Level</th>
                        <th>Verification Status</th>
                        <th>Documented By</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.allergies.map((alg) => (
                        <tr key={alg.id}>
                          <td>
                            <strong
                              style={{
                                color:
                                  alg.status === "Verified & Active"
                                    ? "var(--emergency)"
                                    : "var(--navy)",
                                fontSize: "13px",
                              }}
                            >
                              {alg.allergen}
                            </strong>
                            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                              {alg.notes}
                            </div>
                          </td>
                          <td>{alg.substanceType}</td>
                          <td style={{ maxWidth: "260px" }}>{alg.reaction}</td>
                          <td>
                            <span
                              className={`pmh-badge ${
                                alg.severity.includes("Severe") ? "flag-high" : "resolved"
                              }`}
                            >
                              {alg.severity}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`pmh-badge ${
                                alg.status === "Verified & Active"
                                  ? "flag-high"
                                  : "resolved"
                              }`}
                            >
                              {alg.status}
                            </span>
                          </td>
                          <td>
                            <strong>{alg.recordedBy}</strong>
                            <div style={{ fontSize: "10px", color: "var(--muted)" }}>{alg.dateRecorded}</div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              className="button secondary compact"
                              onClick={() =>
                                setSelectedRecord({
                                  title: alg.allergen,
                                  category: "Allergy & Hypersensitivity Record",
                                  date: alg.dateRecorded,
                                  author: alg.recordedBy,
                                  role: "Clinical Practitioner",
                                  encounterId: "ENC-2025-0210",
                                  status: alg.status,
                                  notes: alg.notes,
                                  details: {
                                    "Reaction Description": alg.reaction,
                                    "Severity Rating": alg.severity,
                                    "Substance Class": alg.substanceType,
                                    "Verification": alg.status,
                                  },
                                })
                              }
                            >
                              Trace
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Explicit Absent Categories Note */}
                  <div
                    style={{
                      background: "var(--mist)",
                      padding: "12px 16px",
                      borderRadius: "6px",
                      marginTop: "16px",
                      fontSize: "12px",
                      color: "var(--muted)",
                      lineHeight: "1.6",
                    }}
                  >
                    <strong>Documentation Standards:</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>
                        <strong>Penicillin Class:</strong> Verified anaphylactoid reaction. Absolute contraindication.
                      </li>
                      <li>
                        <strong>Latex:</strong> Explicitly confirmed absent on 18 Jan 2026.
                      </li>
                      <li>
                        <strong>Food &amp; Environmental:</strong> Not recorded in hospital record. (Absence does not
                        rule out unrecorded allergies).
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 5: MEDICATIONS & PRESCRIPTIONS
             ══════════════════════════════════════════════ */}
          {activeTab === "medications" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="pill" size={18} />
                  Historical Prescriptions &amp; Medication Record
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Distinguishes active maintenance, completed regimens, and discontinued drugs
                </span>
              </div>

              {filteredMedications.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="pill" size={32} />
                  <div className="pmh-empty-title">No Prescriptions on File</div>
                  <div className="pmh-empty-desc">
                    No medications have been prescribed through Oda Roba Hospital for this patient.
                  </div>
                  <div className="pmh-honest-note">
                    External or OTC medications taken outside the hospital will not appear unless manually documented
                    during clinical consultation.
                  </div>
                </div>
              ) : (
                <table className="pmh-table">
                  <thead>
                    <tr>
                      <th>Medication &amp; Strength</th>
                      <th>Dosage &amp; Frequency</th>
                      <th>Indication</th>
                      <th>Prescription Date</th>
                      <th>Status</th>
                      <th>Prescribing Doctor</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedications.map((med) => (
                      <tr key={med.id}>
                        <td>
                          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>{med.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{med.dosage}</div>
                        </td>
                        <td>
                          <div>{med.frequency}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            Route: {med.route} · Duration: {med.duration}
                          </div>
                        </td>
                        <td>{med.indication}</td>
                        <td>{med.prescribedDate}</td>
                        <td>
                          <span
                            className={`pmh-badge ${
                              med.status === "Active"
                                ? "active"
                                : med.status === "Completed"
                                  ? "completed"
                                  : "discontinued"
                            }`}
                          >
                            {med.status}
                          </span>
                          {med.discontinueReason && (
                            <div style={{ fontSize: "10px", color: "var(--emergency)", marginTop: "2px" }}>
                              {med.discontinueReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{med.prescribingDoctor}</strong>
                          <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                            Encounter: {med.encounterId}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            className="button secondary compact"
                            onClick={() =>
                              setSelectedRecord({
                                title: med.name,
                                category: "Medication History",
                                date: med.prescribedDate,
                                author: med.prescribingDoctor,
                                role: "Prescribing Physician",
                                encounterId: med.encounterId,
                                status: med.status,
                                notes: med.discontinueReason
                                  ? `Discontinuation Reason: ${med.discontinueReason}`
                                  : `Prescribed for ${med.indication}. Dosage: ${med.dosage}, ${med.frequency}.`,
                                details: {
                                  "Dosage": med.dosage,
                                  "Frequency": med.frequency,
                                  "Route": med.route,
                                  "Duration": med.duration,
                                  "Indication": med.indication,
                                  "Status": med.status,
                                },
                              })
                            }
                          >
                            Trace
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 6: PROCEDURES & SURGERIES
             ══════════════════════════════════════════════ */}
          {activeTab === "procedures" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="edit" size={18} />
                  Procedures &amp; Surgical Interventions
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Surgical history and minor procedures performed at ORH
                </span>
              </div>

              {data.procedures.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="edit" size={32} />
                  <div className="pmh-empty-title">No Procedures Recorded</div>
                  <div className="pmh-empty-desc">
                    No surgical or minor procedure records are present in the hospital archives.
                  </div>
                  <div className="pmh-honest-note">
                    Note: "No records found" does NOT imply the patient has never undergone surgery. Surgeries at other
                    institutions must be verified with the patient directly.
                  </div>
                </div>
              ) : (
                <>
                  <table className="pmh-table">
                    <thead>
                      <tr>
                        <th>Procedure Description</th>
                        <th>Category</th>
                        <th>Date Performed</th>
                        <th>Performing Doctor</th>
                        <th>Facility / Location</th>
                        <th>Outcome</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.procedures.map((proc) => (
                        <tr key={proc.id}>
                          <td>
                            <strong style={{ color: "var(--navy)", fontSize: "13px" }}>{proc.name}</strong>
                            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                              {proc.notes}
                            </div>
                          </td>
                          <td>
                            <span className="pmh-badge resolved">{proc.category}</span>
                          </td>
                          <td>{proc.date}</td>
                          <td>{proc.performingDoctor}</td>
                          <td>{proc.facility}</td>
                          <td>
                            <span className="pmh-badge completed">{proc.outcome}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              className="button secondary compact"
                              onClick={() =>
                                setSelectedRecord({
                                  title: proc.name,
                                  category: "Procedure Record",
                                  date: proc.date,
                                  author: proc.performingDoctor,
                                  role: "Operating Clinician",
                                  encounterId: proc.encounterId,
                                  status: proc.outcome,
                                  notes: proc.notes,
                                  details: {
                                    "Category": proc.category,
                                    "Facility": proc.facility,
                                    "Outcome": proc.outcome,
                                    "Associated Encounter": proc.encounterId,
                                  },
                                })
                              }
                            >
                              Trace
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pmh-honest-note" style={{ marginTop: "20px" }}>
                    <strong>Major Inpatient Surgery Status:</strong> Not recorded in ORHIMS. No prior inpatient surgical
                    admissions logged.
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 7: FAMILY & SOCIAL HISTORY
             ══════════════════════════════════════════════ */}
          {activeTab === "family-social" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Family History */}
              <div className="pmh-content-card">
                <div className="pmh-section-header">
                  <h2 className="pmh-section-title">
                    <Icon name="user" size={18} />
                    Family Medical History
                  </h2>
                </div>

                {data.familyHistory.length === 0 ? (
                  <div className="pmh-empty-state">
                    <div className="pmh-empty-title">Family History Not Recorded</div>
                    <div className="pmh-empty-desc">
                      No hereditary or familial conditions have been documented.
                    </div>
                  </div>
                ) : (
                  <div>
                    {data.familyHistory.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--mist)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>
                            {item.relation}: {item.condition}
                          </strong>
                          <span className="pmh-badge resolved">{item.status}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                          {item.notes} {item.ageOfOnset && `(${item.ageOfOnset})`}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "6px" }}>
                          Documented on {item.recordedDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social History */}
              <div className="pmh-content-card">
                <div className="pmh-section-header">
                  <h2 className="pmh-section-title">
                    <Icon name="user" size={18} />
                    Social &amp; Occupational History
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ background: "var(--mist)", padding: "12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      Tobacco Use
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginTop: "2px" }}>
                      {data.socialHistory.tobaccoUse}
                    </div>
                  </div>

                  <div style={{ background: "var(--mist)", padding: "12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      Alcohol Consumption
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginTop: "2px" }}>
                      {data.socialHistory.alcoholUse}
                    </div>
                  </div>

                  <div style={{ background: "var(--mist)", padding: "12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      Occupation
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginTop: "2px" }}>
                      {data.socialHistory.occupation}
                    </div>
                  </div>

                  <div style={{ background: "var(--mist)", padding: "12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      Living Environment
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginTop: "2px" }}>
                      {data.socialHistory.livingEnvironment}
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "right" }}>
                    Recorded by {data.socialHistory.recordedBy} on {data.socialHistory.recordedDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 8: LABORATORY & DIAGNOSTIC RESULTS
             ══════════════════════════════════════════════ */}
          {activeTab === "labs" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="flask" size={18} />
                  Historical Laboratory &amp; Diagnostic Results
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Verified laboratory panels with reference ranges and clinician review endorsement
                </span>
              </div>

              {filteredLabs.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="flask" size={32} />
                  <div className="pmh-empty-title">No Laboratory Reports Found</div>
                  <div className="pmh-empty-desc">
                    No diagnostic investigations are recorded for this patient.
                  </div>
                  <div className="pmh-honest-note">
                    External laboratory investigations brought in paper format may be scanned or recorded during active
                    consultation.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {filteredLabs.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Report Header */}
                      <div
                        style={{
                          background: "var(--mist)",
                          padding: "12px 18px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid var(--border)",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "14px", color: "var(--navy)" }}>{report.testName}</strong>
                          <span
                            style={{
                              marginLeft: "10px",
                              fontSize: "11px",
                              color: "var(--muted)",
                              background: "#ffffff",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {report.category}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                            Ordered: {report.orderDate} · Completed: {report.completedDate || "Pending"}
                          </span>
                          <span className="pmh-badge completed">{report.status}</span>
                        </div>
                      </div>

                      {/* Parameters Table */}
                      <table className="pmh-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Observed Value</th>
                            <th>Unit</th>
                            <th>Reference Range</th>
                            <th>Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.results.map((r, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{r.parameter}</strong>
                              </td>
                              <td>
                                <strong
                                  style={{
                                    color:
                                      r.flag === "High" || r.flag === "Low"
                                        ? "var(--emergency)"
                                        : "var(--navy)",
                                  }}
                                >
                                  {r.value}
                                </strong>
                              </td>
                              <td style={{ color: "var(--muted)" }}>{r.unit || "—"}</td>
                              <td>{r.referenceRange}</td>
                              <td>
                                <span
                                  className={`pmh-badge ${
                                    r.flag === "High" || r.flag === "Low"
                                      ? "flag-high"
                                      : "flag-normal"
                                  }`}
                                >
                                  {r.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Interpretation Footer */}
                      <div
                        style={{
                          padding: "12px 18px",
                          background: "#fafcfc",
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Clinical Interpretation: </span>
                          <span style={{ color: "var(--navy)" }}>{report.interpretationNotes || "None"}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                          Reviewed by <strong>{report.reviewingDoctor || "Pending review"}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 9: CLINICAL NOTES
             ══════════════════════════════════════════════ */}
          {activeTab === "notes" && (
            <div className="pmh-content-card">
              <div className="pmh-section-header">
                <h2 className="pmh-section-title">
                  <Icon name="mail" size={18} />
                  Historical Clinical Consultation Notes ({data.clinicalNotes.length})
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Signed provider documentation from prior hospital encounters
                </span>
              </div>

              {data.clinicalNotes.length === 0 ? (
                <div className="pmh-empty-state">
                  <Icon name="mail" size={32} />
                  <div className="pmh-empty-title">No Historical Clinical Notes</div>
                  <div className="pmh-empty-desc">
                    No consultation notes from previous visits are available for this patient.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {data.clinicalNotes.map((cn) => (
                    <div
                      key={cn.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "16px 20px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <strong style={{ fontSize: "14px", color: "var(--navy)" }}>{cn.title}</strong>
                          <span className="pmh-tc-type-badge">{cn.noteType}</span>
                          <span className="pmh-mrn-chip">{cn.encounterId}</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{cn.date}</span>
                      </div>

                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text)",
                          lineHeight: "1.6",
                          margin: "0 0 12px",
                        }}
                      >
                        {cn.content}
                      </p>

                      <div
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "var(--muted)",
                        }}
                      >
                        <span>
                          Author: <strong>{cn.author}</strong> ({cn.authorRole}) · {cn.department}
                        </span>
                        <Button
                          className="button secondary compact"
                          onClick={() =>
                            setSelectedRecord({
                              title: cn.title,
                              category: "Clinical Consultation Note",
                              date: cn.date,
                              author: cn.author,
                              role: cn.authorRole,
                              encounterId: cn.encounterId,
                              status: "Signed & Filed",
                              notes: cn.content,
                              details: {
                                "Note Type": cn.noteType,
                                "Department": cn.department,
                                "Associated Encounter": cn.encounterId,
                              },
                            })
                          }
                        >
                          Trace Audit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Read-Only Traceability Detail Drawer (Prompt 27 - Section 12) ── */}
      {selectedRecord && (
        <div
          className="pmh-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedRecord(null)}
        >
          <div className="pmh-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pmh-drawer-header">
              <div>
                <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 700, textTransform: "uppercase" }}>
                  {selectedRecord.category}
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: "16px", color: "var(--navy)" }}>
                  {selectedRecord.title}
                </h3>
              </div>
              <Button
                className="icon-button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </Button>
            </div>

            <div className="pmh-drawer-body">
              <div className="pmh-detail-field">
                <label>Date &amp; Time Logged</label>
                <p>{selectedRecord.date}</p>
              </div>

              <div className="pmh-detail-field">
                <label>Documenting Clinician &amp; Role</label>
                <p>
                  <strong>{selectedRecord.author}</strong> ({selectedRecord.role})
                </p>
              </div>

              <div className="pmh-detail-field">
                <label>Associated Encounter</label>
                <p>
                  <span className="pmh-mrn-chip">{selectedRecord.encounterId}</span>
                </p>
              </div>

              {selectedRecord.status && (
                <div className="pmh-detail-field">
                  <label>Record Status</label>
                  <p>
                    <span className="pmh-badge completed">{selectedRecord.status}</span>
                  </p>
                </div>
              )}

              {selectedRecord.details && (
                <div className="pmh-detail-field">
                  <label>Structured Record Attributes</label>
                  <div className="pmh-detail-box">
                    {Object.entries(selectedRecord.details).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: "4px" }}>
                        <span style={{ color: "var(--muted)", fontWeight: 600 }}>{k}: </span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pmh-detail-field">
                <label>Verbatim Clinical Content / Clinical Notes</label>
                <div className="pmh-detail-box" style={{ background: "#ffffff", border: "1px solid var(--border)" }}>
                  {selectedRecord.notes}
                </div>
              </div>

              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "var(--muted)",
                  lineHeight: "1.5",
                  marginTop: "20px",
                }}
              >
                <span style={{ verticalAlign: "middle", marginRight: "6px", display: "inline-flex" }}>
                  <Icon name="shield" size={13} />
                </span>
                <strong>Clinical Immutability Notice:</strong> Historical records in this archive are permanent and
                cryptographically traceable. Amendments require formalized clinical addendum workflows.
              </div>
            </div>

            <div className="pmh-drawer-footer">
              <Button className="button secondary" onClick={() => setSelectedRecord(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
