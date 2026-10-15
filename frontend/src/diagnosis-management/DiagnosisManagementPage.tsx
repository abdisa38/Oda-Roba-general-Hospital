// ORHIMS — Diagnosis Management Screen (Phase 05, Prompt 28)

import { useState, useMemo } from "react"
import Icon from "../Icon"
import { Button, Heading } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  sampleDiagnosisPatient,
  initialEncounterDiagnoses,
  diagnosisCatalogue,
  historicalDiagnosesReference,
  type EncounterDiagnosis,
  type CatalogueDiagnosis,
} from "./model"
import "./diagnosis-management.css"

export type DiagnosisSimState = "ready" | "empty" | "catalogue-offline" | "finalized"

export default function DiagnosisManagementPage({
  state: initialSimState = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  // Check doctor role or clinical permissions
  const canAccess =
    permissions.has("consultations") ||
    permissions.has("clinical-workspace") ||
    permissions.has("assigned") ||
    permissions.has("records")

  // State management
  const [simState, setSimState] = useState<DiagnosisSimState>(
    initialSimState === "empty"
      ? "empty"
      : initialSimState === "restricted"
        ? "finalized"
        : "ready"
  )

  const patient = sampleDiagnosisPatient
  const isReadOnly = simState === "finalized"

  // Encounter diagnoses list
  const [diagnoses, setDiagnoses] = useState<EncounterDiagnosis[]>(
    simState === "empty" ? [] : initialEncounterDiagnoses
  )

  // Success / notification message
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Add diagnosis form state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueDiagnosis | null>(null)
  const [designation, setDesignation] = useState<"Primary" | "Secondary">("Secondary")
  const [clinicalStatus, setClinicalStatus] = useState<"Confirmed" | "Provisional" | "Differential">("Confirmed")
  const [clinicalNotes, setClinicalNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Modals state
  const [diagnosisToRemove, setDiagnosisToRemove] = useState<EncounterDiagnosis | null>(null)
  const [diagnosisToEditNotes, setDiagnosisToEditNotes] = useState<EncounterDiagnosis | null>(null)
  const [editingNotesText, setEditingNotesText] = useState("")

  // Catalogue search results
  const searchResults = useMemo(() => {
    if (simState === "catalogue-offline") return []
    if (!searchQuery.trim()) return diagnosisCatalogue.slice(0, 6)

    const q = searchQuery.toLowerCase().trim()
    return diagnosisCatalogue.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.synonyms && item.synonyms.some((s) => s.toLowerCase().includes(q)))
    )
  }, [searchQuery, simState])

  // Duplicate check
  const isDuplicate = useMemo(() => {
    if (!selectedCatalogueItem) return false
    return diagnoses.some((d) => d.code.toLowerCase() === selectedCatalogueItem.code.toLowerCase())
  }, [selectedCatalogueItem, diagnoses])

  // Existing Primary Diagnosis
  const currentPrimaryDiagnosis = useMemo(() => {
    return diagnoses.find((d) => d.designation === "Primary")
  }, [diagnoses])

  // Handle setting another diagnosis as primary
  function handleSetAsPrimary(targetDiag: EncounterDiagnosis) {
    if (isReadOnly) return

    setDiagnoses((prev) =>
      prev.map((d) => {
        if (d.id === targetDiag.id) {
          return { ...d, designation: "Primary" }
        }
        if (d.designation === "Primary") {
          return { ...d, designation: "Secondary" }
        }
        return d
      })
    )

    setSuccessNotice(`Designated "${targetDiag.name}" (${targetDiag.code}) as the primary diagnosis.`)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Handle saving new diagnosis
  function handleSaveDiagnosis() {
    if (!selectedCatalogueItem || isDuplicate || isReadOnly) return

    setIsSaving(true)

    setTimeout(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

      // If designated as primary, reassign existing primary to secondary
      let updatedList = diagnoses
      if (designation === "Primary") {
        updatedList = diagnoses.map((d) =>
          d.designation === "Primary" ? { ...d, designation: "Secondary" as const } : d
        )
      }

      const newEntry: EncounterDiagnosis = {
        id: `diag-curr-${Date.now()}`,
        code: selectedCatalogueItem.code,
        name: selectedCatalogueItem.name,
        designation: designation,
        status: clinicalStatus,
        category: selectedCatalogueItem.category,
        dateRecorded: dateStr,
        timeRecorded: timeStr,
        recordedBy: patient.attendingDoctor,
        role: "General Medical Practitioner",
        encounterId: patient.encounterId,
        clinicalNotes: clinicalNotes.trim() || "Recorded during outpatient consultation.",
      }

      setDiagnoses([...updatedList, newEntry])
      setIsSaving(false)
      setSelectedCatalogueItem(null)
      setSearchQuery("")
      setClinicalNotes("")
      setDesignation("Secondary")
      setShowAddForm(false)
      setSuccessNotice(`Recorded diagnosis: "${newEntry.name}" (${newEntry.code})`)
      setTimeout(() => setSuccessNotice(null), 4000)
    }, 500)
  }

  // Handle removing diagnosis with confirmation
  function handleConfirmRemoval() {
    if (!diagnosisToRemove || isReadOnly) return

    const removedName = diagnosisToRemove.name
    setDiagnoses((prev) => prev.filter((d) => d.id !== diagnosisToRemove.id))
    setDiagnosisToRemove(null)
    setSuccessNotice(`Removed diagnosis "${removedName}" from this encounter.`)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Handle saving edited notes
  function handleSaveEditedNotes() {
    if (!diagnosisToEditNotes || isReadOnly) return

    setDiagnoses((prev) =>
      prev.map((d) =>
        d.id === diagnosisToEditNotes.id ? { ...d, clinicalNotes: editingNotesText.trim() } : d
      )
    )

    setDiagnosisToEditNotes(null)
    setSuccessNotice("Clinical notes updated successfully.")
    setTimeout(() => setSuccessNotice(null), 3000)
  }

  // Handle copying a historical diagnosis to the add form
  function handleCopyHistorical(h: (typeof historicalDiagnosesReference)[0]) {
    const match = diagnosisCatalogue.find((c) => c.code === h.code) || {
      code: h.code,
      name: h.name,
      category: "Historical Record Reference",
      chapter: "General",
    }
    setSelectedCatalogueItem(match)
    setClinicalNotes(`Carried forward from historical visit (${h.encounterId}, ${h.dateRecorded}). ${h.clinicalNotes}`)
    setShowAddForm(true)
  }

  if (!canAccess) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  return (
    <div className="diagnosis-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="diag-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("consultations")}>Doctor Dashboard</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("clinical-workspace")}>Clinical Workspace</Button>
        <Icon name="chevron" size={11} />
        <strong>Diagnosis Management</strong>
      </nav>

      {/* ── Simulation State Toolbar (Section 10 & 14) ── */}
      <div className="diag-sim-toolbar">
        <span style={{ fontWeight: 600, color: "var(--navy)" }}>
          Clinical Diagnosis State Simulation:
        </span>
        <div className="diag-sim-pills">
          <button
            type="button"
            className={`diag-sim-pill${simState === "ready" ? " active" : ""}`}
            onClick={() => {
              setSimState("ready")
              setDiagnoses(initialEncounterDiagnoses)
            }}
          >
            Active Encounter (Standard)
          </button>
          <button
            type="button"
            className={`diag-sim-pill${simState === "empty" ? " active" : ""}`}
            onClick={() => {
              setSimState("empty")
              setDiagnoses([])
            }}
          >
            No Diagnoses (Empty)
          </button>
          <button
            type="button"
            className={`diag-sim-pill${simState === "catalogue-offline" ? " active" : ""}`}
            onClick={() => setSimState("catalogue-offline")}
          >
            Catalogue Offline
          </button>
          <button
            type="button"
            className={`diag-sim-pill${simState === "finalized" ? " active" : ""}`}
            onClick={() => setSimState("finalized")}
          >
            Encounter Finalized (Read-Only)
          </button>
        </div>
      </div>

      {/* ── Patient Identity & Encounter Context Banner (Section 3) ── */}
      <div className="diag-patient-banner">
        <div className="diag-banner-top">
          <div className="diag-patient-info">
            <div className="diag-avatar">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="diag-patient-name-row">
                <h1 className="diag-patient-name">{patient.name}</h1>
                {patient.amharicName && (
                  <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>
                    ({patient.amharicName})
                  </span>
                )}
                <span className="diag-mrn-chip">{patient.patientId}</span>
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
                  Diagnosis Management
                </span>
              </div>
              <div className="diag-patient-meta">
                <span>
                  Sex: <strong>{patient.sex}</strong>
                </span>
                <span>·</span>
                <span>
                  Age: <strong>{patient.age}</strong> (DOB: {patient.dob})
                </span>
                <span>·</span>
                <span>
                  Assigned Clinician: <strong>{patient.attendingDoctor}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="diag-banner-actions">
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

        {/* ── Active Encounter Context Strip ── */}
        <div className="diag-encounter-strip">
          <div className="diag-strip-left">
            <span className="diag-strip-badge">Active Encounter</span>
            <span>
              <strong>{patient.encounterId}</strong> · {patient.encounterType} ({patient.clinic}) ·{" "}
              {patient.encounterDate} · Status:{" "}
              <strong style={{ color: isReadOnly ? "var(--muted)" : "var(--teal)" }}>
                {isReadOnly ? "Finalized / Signed" : patient.encounterStatus}
              </strong>
            </span>
          </div>

          {patient.allergiesAlert && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--emergency)", fontWeight: 600 }}>
              <Icon name="warning" size={14} />
              <span>Allergy Alert: {patient.allergiesAlert}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Read-Only Notice (If Finalized) ── */}
      {isReadOnly && (
        <div className="diag-finalized-notice" role="status">
          <Icon name="lock" size={18} />
          <span>
            <strong>Encounter Finalized:</strong> This clinical consultation has been finalized and locked. Diagnoses
            are preserved in read-only mode. Further alterations require an authorized clinical addendum.
          </span>
        </div>
      )}

      {/* ── Feedback Notification ── */}
      {successNotice && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          role="status"
        >
          <Icon name="check" size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* ── Two-Column Main Layout ── */}
      <div className="diag-main-grid">
        {/* ══════════════════════════════════════════════
            LEFT COLUMN: PRIMARY SPOTLIGHT & ENCOUNTER DIAGNOSES
           ══════════════════════════════════════════════ */}
        <div className="diag-left-column">
          {/* Primary Diagnosis Spotlight Card (Section 7) */}
          {currentPrimaryDiagnosis ? (
            <div className="diag-primary-card">
              <div className="diag-primary-head">
                <span className="diag-primary-tag">
                  <Icon name="shield" size={13} />
                  Designated Primary Diagnosis
                </span>
                <span className="diag-status-confirmed">{currentPrimaryDiagnosis.status}</span>
              </div>

              <div className="diag-primary-name">
                <span>{currentPrimaryDiagnosis.name}</span>
                <span className="diag-code-badge">{currentPrimaryDiagnosis.code}</span>
              </div>

              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Category: <strong>{currentPrimaryDiagnosis.category}</strong> · Associated with Active Encounter{" "}
                <strong>{currentPrimaryDiagnosis.encounterId}</strong>
              </div>

              {currentPrimaryDiagnosis.clinicalNotes && (
                <div className="diag-primary-notes">
                  <strong>Clinical Documentation:</strong> {currentPrimaryDiagnosis.clinicalNotes}
                </div>
              )}

              <div className="diag-primary-footer">
                <span>
                  Recorded on {currentPrimaryDiagnosis.dateRecorded} at {currentPrimaryDiagnosis.timeRecorded} by{" "}
                  <strong>{currentPrimaryDiagnosis.recordedBy}</strong>
                </span>
                {!isReadOnly && (
                  <Button
                    className="button secondary compact"
                    onClick={() => {
                      setDiagnosisToEditNotes(currentPrimaryDiagnosis)
                      setEditingNotesText(currentPrimaryDiagnosis.clinicalNotes)
                    }}
                  >
                    <Icon name="edit" size={13} />
                    Edit Notes
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#ffffff",
                border: "1px dashed var(--border)",
                borderRadius: "10px",
                padding: "20px 24px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              <Icon name="shield" size={24} />
              <div style={{ fontWeight: 600, color: "var(--navy)", marginTop: "6px" }}>
                No Primary Diagnosis Designated
              </div>
              <p style={{ fontSize: "12px", margin: "4px auto 0", maxWidth: "420px" }}>
                Select an existing encounter diagnosis or add a new one and designate it as Primary for this visit.
              </p>
            </div>
          )}

          {/* Section: Diagnoses for This Encounter (Section 4) */}
          <div className="diag-section-card">
            <div className="diag-section-header">
              <h2 className="diag-section-title">
                <Icon name="check" size={18} />
                Diagnoses for This Encounter ({diagnoses.length})
              </h2>

              {!isReadOnly && !showAddForm && (
                <Button className="button" onClick={() => setShowAddForm(true)}>
                  <Icon name="edit" size={14} />
                  Add Diagnosis
                </Button>
              )}
            </div>

            {diagnoses.length === 0 ? (
              <div className="diag-empty-box">
                <Icon name="shield" size={32} />
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--navy)", marginTop: "6px" }}>
                  No Diagnoses Recorded for This Encounter
                </div>
                <p style={{ fontSize: "13px", maxWidth: "440px", margin: "6px auto 16px" }}>
                  No clinical diagnoses have been attached to encounter {patient.encounterId}. Use the diagnosis search
                  to record the patient's condition.
                </p>
                {!isReadOnly && (
                  <Button className="button" onClick={() => setShowAddForm(true)}>
                    <Icon name="edit" size={14} />
                    Add First Diagnosis
                  </Button>
                )}
              </div>
            ) : (
              <table className="diag-table">
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>ICD-10 Code &amp; Name</th>
                    <th>Status</th>
                    <th>Recorded By</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((diag) => (
                    <tr key={diag.id}>
                      <td>
                        <span
                          className={
                            diag.designation === "Primary"
                              ? "diag-badge-primary"
                              : "diag-badge-secondary"
                          }
                        >
                          {diag.designation}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="diag-code-badge">{diag.code}</span>
                          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>{diag.name}</strong>
                        </div>
                        {diag.clinicalNotes && (
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                            {diag.clinicalNotes}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            diag.status === "Confirmed"
                              ? "diag-status-confirmed"
                              : diag.status === "Provisional"
                                ? "diag-status-provisional"
                                : "diag-status-differential"
                          }
                        >
                          {diag.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{diag.recordedBy}</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                          {diag.dateRecorded} · {diag.timeRecorded}
                        </div>
                      </td>

                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isReadOnly ? (
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            {diag.designation !== "Primary" && (
                              <Button
                                className="button secondary compact"
                                onClick={() => handleSetAsPrimary(diag)}
                                title="Designate as encounter primary diagnosis"
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              className="button secondary compact"
                              onClick={() => {
                                setDiagnosisToEditNotes(diag)
                                setEditingNotesText(diag.clinicalNotes)
                              }}
                              title="Edit clinical notes"
                            >
                              Notes
                            </Button>
                            <Button
                              className="button secondary compact"
                              style={{ color: "var(--emergency)" }}
                              onClick={() => setDiagnosisToRemove(diag)}
                              title="Remove from encounter"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT COLUMN: ADD DIAGNOSIS FORM & HISTORICAL REFERENCE
           ══════════════════════════════════════════════ */}
        <div className="diag-right-column">
          {/* Add Diagnosis Workflow Card (Section 5 & 6) */}
          <div className="diag-add-card">
            <div className="diag-add-title">
              <Icon name="search" size={16} />
              <span>Record New Diagnosis</span>
            </div>

            {isReadOnly ? (
              <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                Adding diagnoses is disabled because this encounter is finalized.
              </p>
            ) : simState === "catalogue-offline" ? (
              <div
                style={{
                  background: "#fff8f8",
                  border: "1px solid #fecaca",
                  padding: "16px",
                  borderRadius: "6px",
                  color: "#991b1b",
                  fontSize: "12px",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Terminology Catalogue Offline</div>
                The ICD-10 diagnostic terminology repository could not be contacted. Verify network connectivity or
                consult IT support.
              </div>
            ) : (
              <>
                {/* Search Field */}
                <div className="diag-search-box">
                  <Icon name="search" size={15} />
                  <input
                    type="text"
                    className="diag-search-input"
                    placeholder="Search ICD-10 by name, code, or synonym..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Search Results List */}
                {!selectedCatalogueItem && (
                  <>
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "6px", fontWeight: 600 }}>
                      {searchQuery
                        ? `Catalogue Results (${searchResults.length} matches)`
                        : "Common Outpatient Diagnoses (ICD-10):"}
                    </div>

                    {searchResults.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "var(--muted)",
                          border: "1px dashed var(--border)",
                          borderRadius: "6px",
                        }}
                      >
                        No catalogue diagnoses matching "{searchQuery}". Please verify spelling or code syntax.
                      </div>
                    ) : (
                      <div className="diag-results-list">
                        {searchResults.map((item) => (
                          <div
                            key={item.code}
                            className={`diag-result-item${
                              selectedCatalogueItem?.code === item.code ? " selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedCatalogueItem(item)
                              setSearchQuery("")
                            }}
                          >
                            <div>
                              <div className="diag-result-name">{item.name}</div>
                              <div className="diag-result-cat">{item.category}</div>
                            </div>
                            <span className="diag-code-badge">{item.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Selected Diagnosis Confirmation & Detail Inputs */}
                {selectedCatalogueItem && (
                  <div style={{ marginTop: "12px" }}>
                    <div className="diag-selected-box">
                      <div className="diag-selected-head">
                        <span>Selected Catalogue Diagnosis</span>
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "var(--teal)",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          onClick={() => setSelectedCatalogueItem(null)}
                        >
                          Change Selection
                        </button>
                      </div>
                      <div className="diag-selected-text">{selectedCatalogueItem.name}</div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                        <span className="diag-code-badge">{selectedCatalogueItem.code}</span>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                          {selectedCatalogueItem.category}
                        </span>
                      </div>
                    </div>

                    {/* Duplicate Warning */}
                    {isDuplicate && (
                      <div className="diag-duplicate-warning">
                        <strong>Duplicate Diagnosis:</strong> This diagnosis ({selectedCatalogueItem.code}) is already
                        recorded for this encounter.
                      </div>
                    )}

                    {/* Designation Toggle */}
                    <div className="diag-form-group">
                      <label className="diag-form-label">Diagnosis Designation</label>
                      <div className="diag-radio-group">
                        <label className="diag-radio-label">
                          <input
                            type="radio"
                            name="designation"
                            checked={designation === "Primary"}
                            onChange={() => setDesignation("Primary")}
                          />
                          <span>Primary Diagnosis</span>
                        </label>
                        <label className="diag-radio-label">
                          <input
                            type="radio"
                            name="designation"
                            checked={designation === "Secondary"}
                            onChange={() => setDesignation("Secondary")}
                          />
                          <span>Secondary</span>
                        </label>
                      </div>

                      {designation === "Primary" && currentPrimaryDiagnosis && (
                        <div className="diag-reassign-warning">
                          Selecting Primary will reassign current primary diagnosis ("{currentPrimaryDiagnosis.name}")
                          to Secondary.
                        </div>
                      )}
                    </div>

                    {/* Clinical Status Dropdown */}
                    <div className="diag-form-group">
                      <label className="diag-form-label" htmlFor="clinical-status">
                        Clinical Status
                      </label>
                      <select
                        id="clinical-status"
                        className="diag-select"
                        value={clinicalStatus}
                        onChange={(e) => setClinicalStatus(e.target.value as any)}
                      >
                        <option value="Confirmed">Confirmed Diagnosis</option>
                        <option value="Provisional">Provisional / Working Impression</option>
                        <option value="Differential">Differential Diagnosis</option>
                      </select>
                    </div>

                    {/* Supporting Clinical Notes */}
                    <div className="diag-form-group">
                      <label className="diag-form-label" htmlFor="diag-notes">
                        Clinical Documentation / Notes (Optional)
                      </label>
                      <textarea
                        id="diag-notes"
                        className="diag-textarea"
                        placeholder="Clinical rationale, observations, or severity factors..."
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="diag-form-actions">
                      <Button
                        className="button"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={handleSaveDiagnosis}
                        disabled={isSaving || isDuplicate}
                      >
                        <Icon name="check" size={14} />
                        {isSaving ? "Saving..." : "Save Diagnosis"}
                      </Button>
                      <Button
                        className="button secondary"
                        onClick={() => {
                          setSelectedCatalogueItem(null)
                          setClinicalNotes("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Historical Diagnoses Reference Card (Section 8) */}
          <div className="diag-history-card">
            <div className="diag-history-head">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "13px" }}>
                <Icon name="clock" size={14} />
                <span>Historical Diagnoses Reference</span>
              </div>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--teal)",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => onNavigate("medical-history")}
              >
                View Full Archive →
              </button>
            </div>

            <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px" }}>
              Prior diagnoses recorded in previous encounters. Not automatically applied to the active visit.
            </div>

            {historicalDiagnosesReference.map((h) => (
              <div key={h.id} className="diag-history-item">
                <div className="diag-history-name">
                  <span>{h.name}</span>
                  <span className="diag-code-badge" style={{ fontSize: "10px" }}>
                    {h.code}
                  </span>
                </div>
                <div className="diag-history-meta">
                  Recorded: {h.dateRecorded} ({h.encounterId}) · {h.status}
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="diag-history-copy-btn"
                    onClick={() => handleCopyHistorical(h)}
                  >
                    <Icon name="arrow" size={11} />
                    Copy to Current Encounter
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal: Remove Diagnosis (Section 9) ── */}
      {diagnosisToRemove && (
        <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
          <div className="diag-modal-dialog">
            <div className="diag-modal-header">
              <h3 style={{ margin: 0, fontSize: "15px", color: "var(--navy)" }}>
                Confirm Diagnosis Removal
              </h3>
              <Button
                className="icon-button"
                onClick={() => setDiagnosisToRemove(null)}
                aria-label="Close"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <div className="diag-modal-body">
              <p>
                Are you sure you want to remove this diagnosis from encounter{" "}
                <strong>{patient.encounterId}</strong>?
              </p>
              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  marginTop: "8px",
                }}
              >
                <div>
                  <strong>{diagnosisToRemove.name}</strong> ({diagnosisToRemove.code})
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                  Designation: {diagnosisToRemove.designation} · Status: {diagnosisToRemove.status}
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "12px" }}>
                This action only detaches the diagnosis from the current visit. Historical records remain untouched.
              </p>
            </div>
            <div className="diag-modal-footer">
              <Button className="button secondary" onClick={() => setDiagnosisToRemove(null)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)", borderColor: "var(--emergency)" }}
                onClick={handleConfirmRemoval}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Clinical Documentation Notes ── */}
      {diagnosisToEditNotes && (
        <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
          <div className="diag-modal-dialog">
            <div className="diag-modal-header">
              <h3 style={{ margin: 0, fontSize: "15px", color: "var(--navy)" }}>
                Edit Clinical Documentation
              </h3>
              <Button
                className="icon-button"
                onClick={() => setDiagnosisToEditNotes(null)}
                aria-label="Close"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <div className="diag-modal-body">
              <div style={{ marginBottom: "12px" }}>
                <strong>{diagnosisToEditNotes.name}</strong> ({diagnosisToEditNotes.code})
              </div>
              <label
                style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "4px" }}
              >
                Documentation / Clinical Notes:
              </label>
              <textarea
                className="diag-textarea"
                style={{ minHeight: "100px" }}
                value={editingNotesText}
                onChange={(e) => setEditingNotesText(e.target.value)}
              />
            </div>
            <div className="diag-modal-footer">
              <Button className="button secondary" onClick={() => setDiagnosisToEditNotes(null)}>
                Cancel
              </Button>
              <Button className="button" onClick={handleSaveEditedNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
