import { useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  initialTriageData,
  triageStepsConfig,
  sampleAlternativePatients,
  type TriageAssessmentRecord,
  type TriageStepId,
  type TriageUrgency,
} from "./model"
import "./triage-assessment.css"

export default function TriageAssessmentPage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const [activeStep, setActiveStep] = useState<TriageStepId>("verification")
  const [record, setRecord] = useState<TriageAssessmentRecord>(initialTriageData)
  const [patientSelectorOpen, setPatientSelectorOpen] = useState(false)

  // Validation errors map
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("")
  const [saveErrorMessage, setSaveErrorMessage] = useState("")

  // Security & permissions check
  const canAccessTriage = permissions.has("triage")

  if (!canAccessTriage) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  // Validate form entries
  function validateFields(): boolean {
    const errs: Record<string, string> = {}
    if (!record.chiefComplaint.trim()) {
      errs.chiefComplaint = "Chief complaint is required."
    }
    if (!record.systolicBP || isNaN(Number(record.systolicBP))) {
      errs.systolicBP = "Valid systolic BP is required."
    }
    if (!record.diastolicBP || isNaN(Number(record.diastolicBP))) {
      errs.diastolicBP = "Valid diastolic BP is required."
    }
    if (!record.pulseRate || isNaN(Number(record.pulseRate))) {
      errs.pulseRate = "Pulse rate is required."
    }
    if (!record.temperature || isNaN(Number(record.temperature))) {
      errs.temperature = "Body temperature is required."
    }
    if (!record.oxygenSaturation || isNaN(Number(record.oxygenSaturation))) {
      errs.oxygenSaturation = "Oxygen saturation is required."
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save Draft
  function handleSaveDraft() {
    setSaveErrorMessage("")
    setRecord((prev) => ({ ...prev, isDraft: true }))
    setSaveSuccessMessage("Triage assessment draft saved successfully.")
    setTimeout(() => setSaveSuccessMessage(""), 3500)
  }

  // Handle Complete Assessment
  function handleExecuteComplete() {
    if (!validateFields()) {
      setActiveStep("complaint")
      return
    }
    setSaveErrorMessage("")
    const completedRecord: TriageAssessmentRecord = {
      ...record,
      isDraft: false,
      isCompleted: true,
      currentStatus: "Triage Completed",
      completedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }
    setRecord(completedRecord)
    setConfirmCompleteOpen(false)
    setActiveStep("review")
    setSaveSuccessMessage("Triage assessment completed and routed for clinician handoff.")
    setTimeout(() => setSaveSuccessMessage(""), 4000)
  }

  return (
    <div className="triage-workspace-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Nurse Dashboard</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("queue")}>Patient Queue</Button>
        <Icon name="chevron" size={11} />
        <strong>Triage Assessment</strong>
      </nav>

      {/* ── Page Header ── */}
      <div className="triage-workspace-header">
        <div>
          <span className="permission-eyebrow">CLINICAL CARE / NURSING ASSESSMENT</span>
          <Heading level={1}>Triage Assessment</Heading>
          <Text>Record the patient's initial assessment and vital signs before clinical handoff.</Text>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            className="button secondary"
            onClick={() => onNavigate("queue")}
          >
            <Icon name="close" size={14} /> Return to Queue
          </Button>
          <Button
            className="button"
            onClick={() => setConfirmCompleteOpen(true)}
            disabled={record.isCompleted}
          >
            <Icon name="check" size={16} /> Complete Assessment
          </Button>
        </div>
      </div>

      {/* ── Success / Failure Feedback Alerts ── */}
      {saveSuccessMessage && (
        <div className="patient-save-success" role="status">
          <Icon name="check" size={16} /> {saveSuccessMessage}
        </div>
      )}
      {saveErrorMessage && (
        <div className="patient-save-error" role="alert">
          <Icon name="warning" size={16} /> {saveErrorMessage}
        </div>
      )}

      {/* ── Prominent Patient Identity Banner ── */}
      <div className="triage-patient-banner">
        <div className="triage-patient-meta">
          <div className="triage-avatar">
            {record.patientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="triage-patient-info">
            <strong>{record.patientName}</strong>
            <span>
              {record.patientId} · {record.age} · {record.sex} · Encounter: {record.encounterId}
            </span>
          </div>
        </div>

        <div className="triage-banner-badges">
          <span className="patient-status-badge active">
            ARRIVED {record.arrivalTime}
          </span>
          <span className={`priority-badge priority-${record.priority === "Urgent / Resuscitation" ? "urgent" : "standard"}`}>
            {record.priority}
          </span>
          <Button
            className="button secondary compact"
            onClick={() => setPatientSelectorOpen(!patientSelectorOpen)}
          >
            Switch Patient <Icon name="chevron" size={12} />
          </Button>
        </div>
      </div>

      {/* Patient Switcher Dropdown Drawer */}
      {patientSelectorOpen && (
        <div
          className="triage-summary-card"
          style={{ background: "#f9fbfa", border: "1px dashed var(--teal)", padding: "14px 18px" }}
        >
          <strong style={{ fontSize: "12px", color: "var(--navy)", display: "block", marginBottom: "8px" }}>
            Select Active Patient for Triage Assessment:
          </strong>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {sampleAlternativePatients.map((alt) => (
              <Button
                key={alt.patientId}
                className={`button secondary compact${record.patientId === alt.patientId ? " is-active" : ""}`}
                onClick={() => {
                  setRecord((prev) => ({
                    ...prev,
                    patientId: alt.patientId,
                    patientName: alt.name,
                    age: alt.age,
                    sex: alt.sex,
                    encounterId: alt.encounterId,
                    chiefComplaint: alt.complaint,
                  }))
                  setPatientSelectorOpen(false)
                }}
              >
                {alt.name} ({alt.patientId})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ── Urgent Escalation Warning Banner ── */}
      {record.priority === "Urgent / Resuscitation" && (
        <div className="triage-warning-banner urgent">
          <Icon name="warning" size={20} />
          <div>
            <strong>URGENT ESCALATION REQUIRED</strong>
            <p style={{ margin: "2px 0 0", fontSize: "11px" }}>
              Patient exhibits acute respiratory compromise (SpO2 {record.oxygenSaturation}%). Immediate medical officer review has been requested.
            </p>
          </div>
        </div>
      )}

      {/* ── Horizontal Progress Stepper ── */}
      <div className="triage-stepper">
        {triageStepsConfig.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            className={`triage-step-btn${activeStep === s.id ? " active" : ""}${s.isComplete ? " completed" : ""}`}
            onClick={() => setActiveStep(s.id)}
          >
            <div className="step-num-badge">
              {s.isComplete ? <Icon name="check" size={12} /> : idx + 1}
            </div>
            <div className="step-label-box">
              <span>Step 0{idx + 1}</span>
              <strong>{s.label}</strong>
            </div>
          </button>
        ))}
      </div>

      {/* ── 2-Column Assessment Workspace Layout ── */}
      <div className="triage-form-layout">
        {/* Left Column: Form Fields for Active Step */}
        <div className="triage-form-card">
          {/* STEP 1: Verification */}
          {activeStep === "verification" && (
            <div>
              <div className="triage-section-title">
                <span /> STEP 1: PATIENT IDENTITY &amp; ENCOUNTER CONFIRMATION
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "18px" }}>
                Confirm patient identity matches the active hospital wristband or ID card before recording clinical data.
              </p>

              <div className="patient-field-row">
                <span className="patient-field-label">Full Name:</span>
                <strong className="patient-field-value">{record.patientName}</strong>
              </div>
              <div className="patient-field-row">
                <span className="patient-field-label">Patient ID:</span>
                <span className="patient-field-value">{record.patientId}</span>
              </div>
              <div className="patient-field-row">
                <span className="patient-field-label">Encounter ID:</span>
                <span className="patient-field-value">{record.encounterId}</span>
              </div>
              <div className="patient-field-row">
                <span className="patient-field-label">Assigned Nurse:</span>
                <span className="patient-field-value">{record.assignedNurse}</span>
              </div>
              <div className="patient-field-row">
                <span className="patient-field-label">Arrival Timestamp:</span>
                <span className="patient-field-value">{record.arrivalDate} at {record.arrivalTime}</span>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <Button className="button" onClick={() => setActiveStep("complaint")}>
                  Confirm Identity &amp; Continue <Icon name="arrow" size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Chief Complaint */}
          {activeStep === "complaint" && (
            <div>
              <div className="triage-section-title">
                <span /> STEP 2: CHIEF COMPLAINT &amp; SYMPTOMS
              </div>

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>Primary Chief Complaint *</label>
                <div className="triage-input-wrap no-unit">
                  <input
                    placeholder="e.g. Acute shortness of breath, severe headache..."
                    value={record.chiefComplaint}
                    onChange={(e) => setRecord({ ...record, chiefComplaint: e.target.value })}
                  />
                </div>
                {errors.chiefComplaint && (
                  <span className="triage-field-error">{errors.chiefComplaint}</span>
                )}
              </div>

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>Symptom Description &amp; History</label>
                <textarea
                  rows={4}
                  className="permission-input"
                  style={{ width: "100%", height: "auto" }}
                  placeholder="Describe onset, triggers, progression, and home treatments tried..."
                  value={record.symptomDescription}
                  onChange={(e) => setRecord({ ...record, symptomDescription: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="triage-input-box">
                  <label>Onset / Duration</label>
                  <div className="triage-input-wrap no-unit">
                    <input
                      placeholder="e.g. 2 hours ago, 3 days"
                      value={record.onsetInterval}
                      onChange={(e) => setRecord({ ...record, onsetInterval: e.target.value })}
                    />
                  </div>
                </div>

                <div className="triage-input-box">
                  <label>Pain Score (0–10 Scale)</label>
                  <div className="triage-input-wrap no-unit">
                    <select
                      value={record.painLevel}
                      onChange={(e) => setRecord({ ...record, painLevel: e.target.value })}
                    >
                      <option value="0 / 10 (No pain)">0 / 10 (No pain)</option>
                      <option value="2 / 10 (Mild)">2 / 10 (Mild)</option>
                      <option value="5 / 10 (Moderate)">5 / 10 (Moderate)</option>
                      <option value="8 / 10 (Severe)">8 / 10 (Severe)</option>
                      <option value="10 / 10 (Worst possible)">10 / 10 (Worst possible)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <Button className="button secondary" onClick={() => setActiveStep("verification")}>
                  Back
                </Button>
                <Button className="button" onClick={() => setActiveStep("vitals")}>
                  Continue to Vital Signs <Icon name="arrow" size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Vital Signs */}
          {activeStep === "vitals" && (
            <div>
              <div className="triage-section-title">
                <span /> STEP 3: VITAL SIGNS OBSERVATIONS
              </div>

              <div className="triage-vitals-grid">
                <div className="triage-input-box">
                  <label>Systolic Blood Pressure *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.systolicBP}
                      onChange={(e) => setRecord({ ...record, systolicBP: e.target.value })}
                    />
                    <span className="triage-unit-label">mmHg</span>
                  </div>
                  {errors.systolicBP && <span className="triage-field-error">{errors.systolicBP}</span>}
                </div>

                <div className="triage-input-box">
                  <label>Diastolic Blood Pressure *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.diastolicBP}
                      onChange={(e) => setRecord({ ...record, diastolicBP: e.target.value })}
                    />
                    <span className="triage-unit-label">mmHg</span>
                  </div>
                  {errors.diastolicBP && <span className="triage-field-error">{errors.diastolicBP}</span>}
                </div>

                <div className="triage-input-box">
                  <label>Pulse / Heart Rate *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.pulseRate}
                      onChange={(e) => setRecord({ ...record, pulseRate: e.target.value })}
                    />
                    <span className="triage-unit-label">bpm</span>
                  </div>
                  {errors.pulseRate && <span className="triage-field-error">{errors.pulseRate}</span>}
                </div>

                <div className="triage-input-box">
                  <label>Body Temperature *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="text"
                      value={record.temperature}
                      onChange={(e) => setRecord({ ...record, temperature: e.target.value })}
                    />
                    <span className="triage-unit-label">°C</span>
                  </div>
                  {errors.temperature && <span className="triage-field-error">{errors.temperature}</span>}
                </div>

                <div className="triage-input-box">
                  <label>Respiratory Rate *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.respiratoryRate}
                      onChange={(e) => setRecord({ ...record, respiratoryRate: e.target.value })}
                    />
                    <span className="triage-unit-label">/min</span>
                  </div>
                </div>

                <div className="triage-input-box">
                  <label>Oxygen Saturation (SpO2) *</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.oxygenSaturation}
                      onChange={(e) => setRecord({ ...record, oxygenSaturation: e.target.value })}
                    />
                    <span className="triage-unit-label">%</span>
                  </div>
                  {errors.oxygenSaturation && (
                    <span className="triage-field-error">{errors.oxygenSaturation}</span>
                  )}
                </div>

                <div className="triage-input-box">
                  <label>Body Weight</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.weight}
                      onChange={(e) => setRecord({ ...record, weight: e.target.value })}
                    />
                    <span className="triage-unit-label">kg</span>
                  </div>
                </div>

                <div className="triage-input-box">
                  <label>Height</label>
                  <div className="triage-input-wrap">
                    <input
                      type="number"
                      value={record.height}
                      onChange={(e) => setRecord({ ...record, height: e.target.value })}
                    />
                    <span className="triage-unit-label">cm</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <Button className="button secondary" onClick={() => setActiveStep("complaint")}>
                  Back
                </Button>
                <Button className="button" onClick={() => setActiveStep("observations")}>
                  Continue to Clinical Observations <Icon name="arrow" size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Observations */}
          {activeStep === "observations" && (
            <div>
              <div className="triage-section-title">
                <span /> STEP 4: CLINICAL OBSERVATIONS &amp; ALLERGIES
              </div>

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>General Physical Observations</label>
                <textarea
                  rows={3}
                  className="permission-input"
                  style={{ width: "100%", height: "auto" }}
                  value={record.generalObservations}
                  onChange={(e) => setRecord({ ...record, generalObservations: e.target.value })}
                />
              </div>

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>Documented Allergy Status</label>
                <div className="triage-input-wrap no-unit">
                  <select
                    value={record.documentedAllergyStatus}
                    onChange={(e) =>
                      setRecord({
                        ...record,
                        documentedAllergyStatus: e.target.value as "not-recorded" | "none-known" | "present",
                      })
                    }
                  >
                    <option value="present">Allergies Present (Documented)</option>
                    <option value="none-known">No Known Allergies (Confirmed)</option>
                    <option value="not-recorded">Allergy Information Not Recorded</option>
                  </select>
                </div>
              </div>

              {record.documentedAllergyStatus === "present" && (
                <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                  <label>Allergy Details &amp; Reaction</label>
                  <input
                    className="permission-input"
                    value={record.allergyDetails}
                    onChange={(e) => setRecord({ ...record, allergyDetails: e.target.value })}
                  />
                </div>
              )}

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>Known Existing Conditions</label>
                <input
                  className="permission-input"
                  value={record.existingConditions}
                  onChange={(e) => setRecord({ ...record, existingConditions: e.target.value })}
                />
              </div>

              <div className="triage-input-box" style={{ marginBottom: "16px" }}>
                <label>Assigned Triage Priority Classification</label>
                <div className="triage-input-wrap no-unit">
                  <select
                    value={record.priority}
                    onChange={(e) => setRecord({ ...record, priority: e.target.value as TriageUrgency })}
                  >
                    <option value="Urgent / Resuscitation">Urgent / Resuscitation (Immediate Escalation)</option>
                    <option value="Priority Review">Priority Review (Urgent Clinical Attention)</option>
                    <option value="Routine">Routine Outpatient Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <Button className="button secondary" onClick={() => setActiveStep("vitals")}>
                  Back
                </Button>
                <Button className="button" onClick={() => setActiveStep("review")}>
                  Review &amp; Handoff <Icon name="arrow" size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Handoff */}
          {activeStep === "review" && (
            <div>
              <div className="triage-section-title">
                <span /> STEP 5: ASSESSMENT VERIFICATION &amp; CARE HANDOFF
              </div>

              {record.isCompleted ? (
                <div className="triage-handoff-box" style={{ marginBottom: "20px" }}>
                  <span style={{ color: "#1a6a50", display: "inline-flex" }}>
                    <Icon name="check" size={24} />
                  </span>
                  <div>
                    <strong>Triage Assessment Completed at {record.completedAt}</strong>
                    <span>Patient successfully routed to: {record.handoffDestination}</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "18px" }}>
                  Review all recorded vital signs and initial observations. Complete the assessment to transfer the patient to the attending medical team.
                </p>
              )}

              <div style={{ background: "var(--mist)", padding: "16px", borderRadius: "8px", fontSize: "12px", lineHeight: "1.8" }}>
                <p><strong>Chief Complaint:</strong> {record.chiefComplaint}</p>
                <p><strong>Vitals Summary:</strong> BP: {record.systolicBP}/{record.diastolicBP} mmHg · Pulse: {record.pulseRate} bpm · Temp: {record.temperature}°C · SpO2: {record.oxygenSaturation}%</p>
                <p><strong>Allergy Status:</strong> {record.documentedAllergyStatus === "present" ? record.allergyDetails : record.documentedAllergyStatus}</p>
                <p><strong>Clinical Priority:</strong> {record.priority}</p>
                <p><strong>Assessing Nurse:</strong> {record.assignedNurse}</p>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <Button className="button secondary" onClick={() => setActiveStep("observations")}>
                  Back to Observations
                </Button>
                {!record.isCompleted && (
                  <Button className="button" onClick={handleExecuteComplete}>
                    Confirm &amp; Complete Assessment <Icon name="check" size={14} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Clinical Context & Vital Signs Summary */}
        <div className="triage-summary-panel">
          <div className="triage-summary-card">
            <div className="triage-summary-card-head">
              Current Vital Observations
            </div>
            <div className="triage-summary-card-body">
              <div className="triage-vitals-summary-chips">
                <div className="triage-vital-chip">
                  <span>BLOOD PRESSURE</span>
                  <strong>{record.systolicBP}/{record.diastolicBP}</strong>
                </div>
                <div className="triage-vital-chip">
                  <span>PULSE RATE</span>
                  <strong>{record.pulseRate} bpm</strong>
                </div>
                <div className="triage-vital-chip">
                  <span>TEMPERATURE</span>
                  <strong>{record.temperature} °C</strong>
                </div>
                <div className="triage-vital-chip">
                  <span>OXYGEN (SPO2)</span>
                  <strong style={{ color: Number(record.oxygenSaturation) < 92 ? "var(--emergency)" : "var(--navy)" }}>
                    {record.oxygenSaturation} %
                  </strong>
                </div>
                <div className="triage-vital-chip">
                  <span>RESPIRATION</span>
                  <strong>{record.respiratoryRate} /min</strong>
                </div>
                <div className="triage-vital-chip">
                  <span>PAIN SCALE</span>
                  <strong>{record.painLevel.split(" ")[0]}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="triage-summary-card">
            <div className="triage-summary-card-head">
              Clinical Handoff Target
            </div>
            <div className="triage-summary-card-body">
              <p>
                <strong>Destination:</strong> {record.handoffDestination}
              </p>
              <p style={{ marginTop: "6px" }}>
                <strong>Accountable Staff:</strong> {record.assignedNurse}
              </p>
              <p style={{ marginTop: "6px", fontSize: "11px", color: "var(--muted)" }}>
                Completing this triage updates patient status in the doctor's consultation queue immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Persistent Actions Bar ── */}
      <div className="triage-bottom-actions">
        <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "var(--muted)" }}>
          <Icon name="shield" size={16} />
          <span>Fictional demonstration data · Electronic assessment record</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            className="button secondary"
            onClick={handleSaveDraft}
            disabled={record.isCompleted}
          >
            Save Draft
          </Button>
          <Button
            className="button"
            onClick={() => setConfirmCompleteOpen(true)}
            disabled={record.isCompleted}
          >
            Complete Assessment <Icon name="check" size={14} />
          </Button>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmCompleteOpen && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Confirm Triage Completion</h2>
              <Button className="icon-button" onClick={() => setConfirmCompleteOpen(false)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--ink)" }}>
              Are you sure you want to finalize the triage assessment for <strong>{record.patientName}</strong> ({record.patientId})?
              This will lock the initial vitals, mark the assessment completed, and route the patient to the attending clinician.
            </p>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setConfirmCompleteOpen(false)}>
                Cancel
              </Button>
              <Button className="button" onClick={handleExecuteComplete}>
                Yes, Finalize Triage <Icon name="check" size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
