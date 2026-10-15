import { useState } from "react"
import Icon from "../Icon"
import { Button, Heading } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  sampleWorkspacePatient,
  initialConsultationNote,
  type ClinicalWorkspacePatient,
  type StructuredConsultationNote,
  type WorkspaceSectionId,
} from "./model"
import "./clinical-workspace.css"

export default function ClinicalWorkspacePage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const [patient] = useState<ClinicalWorkspacePatient>(sampleWorkspacePatient)
  const [note, setNote] = useState<StructuredConsultationNote>(initialConsultationNote)
  const [activeSection, setActiveSection] = useState<WorkspaceSectionId>("notes")
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("Saved as draft at " + (initialConsultationNote.lastSavedAt || "08:42 AM"))
  const [saveError, setSaveError] = useState(false)
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  // Security check: Doctor role or consultations permission
  const canAccess = permissions.has("consultations") || permissions.has("assigned")

  if (!canAccess) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  // Handle note field modification
  function handleFieldChange(field: keyof StructuredConsultationNote, value: string) {
    setNote((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    setSaveError(false)
  }

  // Handle manual draft save
  function handleSaveDraft() {
    setIsSaving(true)
    setSaveError(false)

    setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      setNote((prev) => ({
        ...prev,
        isDraft: true,
        lastSavedAt: now,
      }))
      setIsSaving(false)
      setIsDirty(false)
      setSaveMessage(`Draft saved successfully at ${now}`)
    }, 600)
  }

  // Handle finalize consultation
  function handleFinalize() {
    setIsSaving(true)
    setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      setNote((prev) => ({
        ...prev,
        isDraft: false,
        isFinalized: true,
        lastSavedAt: now,
      }))
      setIsSaving(false)
      setIsDirty(false)
      setConfirmFinalizeOpen(false)
      setSaveMessage(`Consultation finalized and signed at ${now}`)
    }, 600)
  }

  return (
    <div className="clinical-workspace-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("consultations")}>Doctor Dashboard</Button>
        <Icon name="chevron" size={11} />
        <strong>Clinical Workspace</strong>
      </nav>

      {/* ── Patient Identity & Current Encounter Header ── */}
      <div className="cw-patient-banner">
        <div className="cw-patient-primary">
          <div className="cw-avatar">HM</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="cw-patient-name">{patient.name}</h1>
              <span className="cw-mrn-chip">{patient.patientId}</span>
              <span className="doctor-status-badge inconsultation">
                {patient.encounterStatus}
              </span>
            </div>
            <div className="cw-patient-sub">
              <span>{patient.sex} · {patient.age} (DOB: {patient.dob})</span>
              <span>·</span>
              <span>Encounter: <strong>{patient.encounterId}</strong></span>
              <span>·</span>
              <span>{patient.encounterType}</span>
            </div>
          </div>
        </div>

        <div className="cw-header-actions">
          <Button
            className="button secondary"
            onClick={() => onNavigate("consultations")}
          >
            <Icon name="arrow" size={14} />
            Doctor Dashboard
          </Button>

          <Button
            className="button"
            onClick={() => setConfirmFinalizeOpen(true)}
            disabled={note.isFinalized}
          >
            <Icon name="check" size={15} />
            {note.isFinalized ? "Finalized" : "Finalize Consultation"}
          </Button>
        </div>
      </div>

      {/* ── Clinical Safety Bar ── */}
      <div className="cw-safety-bar">
        <div className="cw-safety-left">
          {patient.allergiesStatus === "documented" ? (
            <div className="cw-allergy-badge danger">
              <Icon name="warning" size={14} />
              <span>Allergy: <strong>{patient.allergyDetails}</strong></span>
            </div>
          ) : patient.allergiesStatus === "no_known" ? (
            <div className="cw-allergy-badge neutral">
              <Icon name="check" size={14} />
              <span>No Known Allergies Recorded</span>
            </div>
          ) : (
            <div className="cw-allergy-badge warning">
              <Icon name="warning" size={14} />
              <span>Allergy Information Unverified</span>
            </div>
          )}

          <div className="cw-vitals-strip">
            <div className="cw-vital-pill">
              <span>BP</span>
              <strong>{patient.vitals.bloodPressure}</strong>
            </div>
            <div className="cw-vital-pill">
              <span>PULSE</span>
              <strong>{patient.vitals.pulseRate}</strong>
            </div>
            <div className="cw-vital-pill">
              <span>TEMP</span>
              <strong>{patient.vitals.temperature}</strong>
            </div>
            <div className="cw-vital-pill">
              <span>SpO2</span>
              <strong style={{ color: "var(--emergency)" }}>{patient.vitals.oxygenSaturation}</strong>
            </div>
            <div className="cw-vital-pill">
              <span>RESP</span>
              <strong>{patient.vitals.respiratoryRate}</strong>
            </div>
          </div>
        </div>

        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          Vitals: {patient.vitals.recordedAt}
        </span>
      </div>

      {/* ── 3-Area Main Consultation Grid ── */}
      <div className="cw-main-grid">
        {/* Area A: Section Navigation Tabs */}
        <aside className="cw-nav-card" aria-label="Clinical sections">
          <button
            className={`cw-nav-tab${activeSection === "notes" ? " active" : ""}`}
            onClick={() => setActiveSection("notes")}
          >
            <Icon name="edit" size={15} />
            Clinical Notes
          </button>

          <button
            className={`cw-nav-tab${activeSection === "overview" ? " active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <Icon name="user" size={15} />
            Overview
          </button>

          <button
            className={`cw-nav-tab${activeSection === "history" ? " active" : ""}`}
            onClick={() => setActiveSection("history")}
          >
            <Icon name="clock" size={15} />
            Medical History
          </button>

          <button
            className={`cw-nav-tab${activeSection === "diagnoses" ? " active" : ""}`}
            onClick={() => setActiveSection("diagnoses")}
          >
            <Icon name="shield" size={15} />
            Diagnoses
          </button>

          <button
            className={`cw-nav-tab${activeSection === "prescriptions" ? " active" : ""}`}
            onClick={() => setActiveSection("prescriptions")}
          >
            <Icon name="pill" size={15} />
            Prescriptions
          </button>

          <button
            className={`cw-nav-tab${activeSection === "laboratory" ? " active" : ""}`}
            onClick={() => setActiveSection("laboratory")}
          >
            <Icon name="flask" size={15} />
            Laboratory
          </button>

          <button
            className={`cw-nav-tab${activeSection === "documents" ? " active" : ""}`}
            onClick={() => setActiveSection("documents")}
          >
            <Icon name="mail" size={15} />
            Documents
          </button>
        </aside>

        {/* Area B: Main Consultation Area */}
        <main className="cw-editor-card">
          <div className="cw-editor-header">
            <div>
              <h2 className="cw-editor-title">Structured Consultation Notes</h2>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Encounter: {patient.encounterId} · {patient.visitDateTime}
              </span>
            </div>

            <div className={`cw-save-indicator ${isDirty ? "unsaved" : "saved"}`}>
              <Icon name={isDirty ? "edit" : "check"} size={13} />
              <span>{isDirty ? "Unsaved edits" : saveMessage}</span>
            </div>
          </div>

          {activeSection === "notes" ? (
            <>
              {/* Chief Complaint */}
              <div className="cw-note-field">
                <label htmlFor="chief-complaint">Chief Complaint</label>
                <textarea
                  id="chief-complaint"
                  className="cw-textarea"
                  style={{ minHeight: "60px" }}
                  value={note.chiefComplaint}
                  onChange={(e) => handleFieldChange("chiefComplaint", e.target.value)}
                  placeholder="Primary reason for patient visit..."
                />
              </div>

              {/* History of Present Illness (HPI) */}
              <div className="cw-note-field">
                <label htmlFor="hpi">History of Present Illness (HPI)</label>
                <textarea
                  id="hpi"
                  className="cw-textarea"
                  style={{ minHeight: "100px" }}
                  value={note.historyOfPresentIllness}
                  onChange={(e) => handleFieldChange("historyOfPresentIllness", e.target.value)}
                  placeholder="Onset, duration, severity, aggravating/relieving factors..."
                />
              </div>

              {/* Relevant Examination Findings */}
              <div className="cw-note-field">
                <label htmlFor="exam-findings">Physical Examination Findings</label>
                <textarea
                  id="exam-findings"
                  className="cw-textarea"
                  style={{ minHeight: "100px" }}
                  value={note.examinationFindings}
                  onChange={(e) => handleFieldChange("examinationFindings", e.target.value)}
                  placeholder="Systemic physical examination findings..."
                />
              </div>

              {/* Clinical Assessment */}
              <div className="cw-note-field">
                <label htmlFor="clinical-assessment">Clinical Assessment</label>
                <textarea
                  id="clinical-assessment"
                  className="cw-textarea"
                  style={{ minHeight: "75px" }}
                  value={note.clinicalAssessment}
                  onChange={(e) => handleFieldChange("clinicalAssessment", e.target.value)}
                  placeholder="Clinical impression and differential assessment..."
                />
              </div>

              {/* Treatment Plan */}
              <div className="cw-note-field">
                <label htmlFor="treatment-plan">Management &amp; Treatment Plan</label>
                <textarea
                  id="treatment-plan"
                  className="cw-textarea"
                  style={{ minHeight: "95px" }}
                  value={note.treatmentPlan}
                  onChange={(e) => handleFieldChange("treatmentPlan", e.target.value)}
                  placeholder="Investigations, medications, follow-up schedule..."
                />
              </div>

              {/* Save Draft Toolbar */}
              <div className="cw-editor-actions">
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Doctor: {patient.assignedDoctor}
                </span>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    className="button secondary"
                    onClick={handleSaveDraft}
                    disabled={isSaving || !isDirty}
                  >
                    <Icon name="check" size={14} />
                    {isSaving ? "Saving..." : "Save Draft"}
                  </Button>

                  <Button
                    className="button"
                    onClick={() => setConfirmFinalizeOpen(true)}
                    disabled={note.isFinalized}
                  >
                    Finalize &amp; Sign
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--muted)" }}>
              <Icon name="info" size={28} />
              <Heading level={3} style={{ marginTop: "12px", color: "var(--navy)" }}>
                {activeSection.toUpperCase()} MODULE
              </Heading>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                This section connects to the upcoming roadmap module. Active clinical notes remain preserved.
              </p>
              <Button
                className="button secondary"
                style={{ marginTop: "16px" }}
                onClick={() => setActiveSection("notes")}
              >
                Return to Clinical Notes
              </Button>
            </div>
          )}
        </main>

        {/* Area C: Context & Workflow Shortcuts Panel */}
        <aside className="cw-side-panel">
          {/* Quick Workflow Actions */}
          <div className="cw-side-card">
            <h3 className="cw-side-title">Clinical Actions</h3>
            <button
              type="button"
              className="cw-shortcut-btn"
              onClick={() => setActiveSection("diagnoses")}
            >
              <span>Add / Review Diagnoses</span>
              <Icon name="arrow" size={12} />
            </button>
            <button
              type="button"
              className="cw-shortcut-btn"
              onClick={() => setActiveSection("prescriptions")}
            >
              <span>Author Prescriptions</span>
              <Icon name="arrow" size={12} />
            </button>
            <button
              type="button"
              className="cw-shortcut-btn"
              onClick={() => setActiveSection("laboratory")}
            >
              <span>Request Lab Orders</span>
              <Icon name="arrow" size={12} />
            </button>
            <button
              type="button"
              className="cw-shortcut-btn"
              onClick={() => onNavigate("patient-profile")}
            >
              <span>Full Patient Record</span>
              <Icon name="arrow" size={12} />
            </button>
          </div>

          {/* Recent Encounters Preview */}
          <div className="cw-side-card">
            <h3 className="cw-side-title">
              <span>Past Encounters</span>
              <span className="cw-mrn-chip">{patient.history.length}</span>
            </h3>
            {patient.history.map((h) => (
              <div key={h.id} className="cw-history-item">
                <div className="cw-history-header">
                  <span>{h.date}</span>
                  <span style={{ color: "var(--teal)" }}>{h.status}</span>
                </div>
                <strong style={{ color: "var(--navy)" }}>{h.diagnosis}</strong>
                <span style={{ color: "var(--muted)", fontSize: "10px" }}>
                  {h.type} · {h.doctor}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Finalize Confirmation Modal ── */}
      {confirmFinalizeOpen && (
        <div className="doctor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="doctor-modal-dialog" style={{ maxWidth: "480px" }}>
            <div className="doctor-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px" }}>Finalize Consultation</h3>
              <Button
                className="icon-button"
                onClick={() => setConfirmFinalizeOpen(false)}
                aria-label="Close"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <div className="doctor-modal-body" style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <p>
                Finalizing this encounter will sign your consultation notes as <strong>{patient.assignedDoctor}</strong>.
              </p>
              <div style={{ background: "var(--mist)", padding: "10px 14px", borderRadius: "6px" }}>
                <span>Patient: <strong>{patient.name}</strong></span><br />
                <span>Encounter ID: <strong>{patient.encounterId}</strong></span>
              </div>
            </div>
            <div className="doctor-modal-footer">
              <Button
                className="button secondary"
                onClick={() => setConfirmFinalizeOpen(false)}
              >
                Continue Editing
              </Button>
              <Button className="button" onClick={handleFinalize}>
                Sign &amp; Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
