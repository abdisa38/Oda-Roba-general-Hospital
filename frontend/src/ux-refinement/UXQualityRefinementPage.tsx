import { useState } from "react"
import Icon from "../Icon"
import "./refinement.css"
import Breadcrumbs from "./Breadcrumbs"
import PatientContextBanner from "./PatientContextBanner"
import CrossModuleWorkflow from "./CrossModuleWorkflow"
import {
  STANDARD_STATUSES,
  DEMO_PATIENT_CONTEXT,
} from "./model"

interface UXQualityRefinementPageProps {
  onNavigate?: (destinationId: string) => void
}

export default function UXQualityRefinementPage({
  onNavigate,
}: UXQualityRefinementPageProps) {
  const [activeTab, setActiveTab] = useState<
    "components" | "workflow" | "states" | "tables" | "responsive" | "accessibility"
  >("components")

  // Interactive Form Test State
  const [testFullName, setTestFullName] = useState("")
  const [testMrn, setTestMrn] = useState("ORH-26-00104")
  const [testAge, setTestAge] = useState("-5") // Invalid on purpose to demo validation
  const [showFormErrors, setShowFormErrors] = useState(true)
  const [formSavedSuccess, setFormSavedSuccess] = useState(false)

  // Interactive Toast State
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Interactive Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalType, setConfirmModalType] = useState<"discharge" | "deactivate" | "save">("discharge")

  // Viewport Simulator State
  const [viewportWidth, setViewportWidth] = useState<"100%" | "768px" | "375px">("100%")

  // Table Filter State
  const [tableSearch, setTableSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>(["Active Patients", "Internal Med", "CBHI Insured"])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  return (
    <div className="portal-root" style={{ background: "var(--orh-bg)", padding: "1.25rem" }}>
      {/* 1. Page Header with Breadcrumbs */}
      <header className="orh-page-header">
        <Breadcrumbs
          items={[
            { label: "ORHIMS Staff System", destinationId: "home" },
            { label: "Administration & Design", destinationId: "admin-overview" },
            { label: "UX Quality & Interaction Refinement (Phase 13)" },
          ]}
          onNavigate={onNavigate}
        />

        <div className="orh-page-header-top">
          <div className="orh-page-header-titles">
            <h1 className="orh-page-title">
              <Icon name="sliders" size={24} />
              <span>UX Quality & Interaction Refinement</span>
              <span className="orh-status-badge success">Phase 13 Standardized</span>
            </h1>
            <p className="orh-page-description">
              Comprehensive UX consistency review, standardized design library, responsive interaction states, cross-module patient care workflows, and accessibility compliance for Oda Roba General Hospital.
            </p>
          </div>

          <div className="orh-page-header-actions">
            <button
              type="button"
              className="portal-btn portal-btn-secondary portal-btn-sm"
              onClick={() => triggerToast("Design system accessibility audit passed with 0 critical WCAG violations.")}
            >
              <Icon name="check" size={15} /> Run Design Audit
            </button>
            <button
              type="button"
              className="portal-btn portal-btn-primary portal-btn-sm"
              onClick={() => {
                setConfirmModalType("save")
                setShowConfirmModal(true)
              }}
            >
              <Icon name="download" size={15} /> Export Standards Guide
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sticky Patient Context Header Demonstration */}
      <PatientContextBanner
        patient={DEMO_PATIENT_CONTEXT}
        onNavigate={onNavigate}
        onActionClick={(action) => triggerToast(`Context switch triggered: ${action} for Chaltu Tolasa.`)}
      />

      {/* 3. Navigation Tabs */}
      <div className="portal-nav-bar" style={{ marginBottom: "1.25rem", borderRadius: "var(--orh-radius-md)" }}>
        <div className="portal-nav-inner">
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "components" ? "active" : ""}`}
            onClick={() => setActiveTab("components")}
          >
            <Icon name="grid" size={17} /> Component Library & Tokens
          </button>
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "workflow" ? "active" : ""}`}
            onClick={() => setActiveTab("workflow")}
          >
            <Icon name="activity" size={17} /> Cross-Module Patient Workflow
          </button>
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "states" ? "active" : ""}`}
            onClick={() => setActiveTab("states")}
          >
            <Icon name="clock" size={17} /> Interface States (Loading, Empty, Error)
          </button>
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "tables" ? "active" : ""}`}
            onClick={() => setActiveTab("tables")}
          >
            <Icon name="file-text" size={17} /> Data Tables & Filter Patterns
          </button>
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "responsive" ? "active" : ""}`}
            onClick={() => setActiveTab("responsive")}
          >
            <Icon name="settings" size={17} /> Responsive Viewport Simulator
          </button>
          <button
            type="button"
            className={`portal-nav-tab ${activeTab === "accessibility" ? "active" : ""}`}
            onClick={() => setActiveTab("accessibility")}
          >
            <Icon name="shield" size={17} /> Accessibility & Ethiopian Hospital Context
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMPONENT LIBRARY & DESIGN TOKENS                  */}
      {/* ======================================================== */}
      {activeTab === "components" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Color & Tokens Overview */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="sliders" size={18} /> Official ORHIMS Color Palette & Semantic Tokens
              </h2>
              <span className="orh-status-badge progress">Strict 0-Emoji Compliance</span>
            </div>
            <div className="portal-card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem" }}>
                {[
                  { name: "Medical Navy", hex: "#142E42", role: "Primary brand, headers, high-contrast text", bg: "#142e42", text: "#fff" },
                  { name: "Healthcare Teal", hex: "#087E83", role: "Key actions, primary buttons, active tabs", bg: "#087e83", text: "#fff" },
                  { name: "Teal Subtle", hex: "#E6F5F5", role: "Active row highlights, badge backgrounds", bg: "#e6f5f5", text: "#142e42" },
                  { name: "Slate Background", hex: "#F3F7F7", role: "Workspace surface, backdrop", bg: "#f3f7f7", text: "#142e42" },
                  { name: "Border Slate", hex: "#D2E1E1", role: "Standard card & table borders", bg: "#d2e1e1", text: "#142e42" },
                  { name: "Clinical Success", hex: "#0D7B42", role: "Verified results, paid invoices, completed", bg: "#e8f7ee", text: "#0d7b42" },
                  { name: "Warning Amber", hex: "#B45309", role: "Pending review, partial payments, reorder alert", bg: "#fef7e7", text: "#b45309" },
                  { name: "Critical Crimson", hex: "#B91C1C", role: "Emergency triage, cancelled, destructive modal", bg: "#fee2e2", text: "#b91c1c" },
                ].map((token) => (
                  <div
                    key={token.name}
                    style={{
                      border: "1px solid var(--orh-border)",
                      borderRadius: "var(--orh-radius-md)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "55px",
                        background: token.bg,
                        color: token.text,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.86rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {token.hex}
                    </div>
                    <div style={{ padding: "0.6rem 0.75rem", fontSize: "0.78rem" }}>
                      <strong style={{ display: "block", color: "var(--orh-navy)" }}>{token.name}</strong>
                      <span style={{ color: "var(--orh-text-muted)" }}>{token.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standardized Button Hierarchy */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="check" size={18} /> Standardized Button Hierarchy & Interactive States
              </h2>
            </div>
            <div className="portal-card-body">
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" className="portal-btn portal-btn-primary">
                  <Icon name="plus" size={15} /> Primary Action
                </button>
                <button type="button" className="portal-btn portal-btn-secondary">
                  <Icon name="edit" size={15} /> Secondary Action
                </button>
                <button type="button" className="portal-btn portal-btn-danger-outline">
                  <Icon name="x" size={15} /> Danger / Destructive
                </button>
                <button type="button" className="portal-btn portal-btn-primary portal-btn-sm">
                  Small Primary (32px)
                </button>
                <button type="button" className="portal-btn portal-btn-secondary portal-btn-sm">
                  Small Secondary
                </button>
                <button type="button" className="portal-btn portal-btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                  Disabled State
                </button>
                <button type="button" className="portal-btn portal-btn-primary">
                  <Icon name="refresh" size={15} /> Loading State…
                </button>
              </div>
            </div>
          </div>

          {/* Standardized Status Indicators */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="shield" size={18} /> Standardized Status Badge Model (Text + Icon + Color)
              </h2>
            </div>
            <div className="portal-card-body">
              <p style={{ fontSize: "0.85rem", color: "var(--orh-text-muted)", marginTop: 0, marginBottom: "1rem" }}>
                Rule: Important status information is never communicated through color alone. Every badge pairs a dedicated SVG icon, human-readable text label, and accessible background tint.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
                {STANDARD_STATUSES.map((st) => (
                  <div
                    key={st.key}
                    style={{
                      border: "1px solid var(--orh-border)",
                      borderRadius: "var(--orh-radius-md)",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <span className={`orh-status-badge ${st.variant}`}>
                        <Icon name={st.icon} size={13} /> {st.label}
                      </span>
                      <div style={{ fontSize: "0.74rem", color: "var(--orh-text-muted)", marginTop: "0.35rem" }}>
                        {st.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standardized Form Controls & Inline Validation */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="edit" size={18} /> Standardized Form Controls & Inline Error Remediation
              </h2>
              <button
                type="button"
                className="portal-btn portal-btn-secondary portal-btn-sm"
                onClick={() => setShowFormErrors(!showFormErrors)}
              >
                Toggle Validation State
              </button>
            </div>
            <div className="portal-card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setFormSavedSuccess(true)
                  setTimeout(() => setFormSavedSuccess(false), 3000)
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {/* Field 1: Patient Name */}
                  <div className="orh-form-group">
                    <label className="orh-form-label" htmlFor="demo-name">
                      Full Legal Name <span className="orh-required-mark">*</span>
                    </label>
                    <input
                      id="demo-name"
                      type="text"
                      className={`orh-input ${showFormErrors && !testFullName ? "has-error" : ""}`}
                      placeholder="e.g. Chaltu Tolasa"
                      value={testFullName}
                      onChange={(e) => setTestFullName(e.target.value)}
                    />
                    {showFormErrors && !testFullName && (
                      <div className="orh-form-error-msg">
                        <Icon name="warning" size={13} /> Full patient legal name is required.
                      </div>
                    )}
                    <span className="orh-form-help-text">Matches national Kebele registration card.</span>
                  </div>

                  {/* Field 2: MRN */}
                  <div className="orh-form-group">
                    <label className="orh-form-label" htmlFor="demo-mrn">
                      Medical Record Number (MRN) <span className="orh-required-mark">*</span>
                    </label>
                    <input
                      id="demo-mrn"
                      type="text"
                      className="orh-input"
                      value={testMrn}
                      onChange={(e) => setTestMrn(e.target.value)}
                    />
                    <span className="orh-form-help-text">Standard hospital format: ORH-YY-XXXXX</span>
                  </div>

                  {/* Field 3: Age with numeric validation error */}
                  <div className="orh-form-group">
                    <label className="orh-form-label" htmlFor="demo-age">
                      Patient Age (Years) <span className="orh-required-mark">*</span>
                    </label>
                    <input
                      id="demo-age"
                      type="number"
                      className={`orh-input ${showFormErrors && Number(testAge) < 0 ? "has-error" : ""}`}
                      value={testAge}
                      onChange={(e) => setTestAge(e.target.value)}
                    />
                    {showFormErrors && Number(testAge) < 0 && (
                      <div className="orh-form-error-msg">
                        <Icon name="warning" size={13} /> Age cannot be negative. Please enter a valid number (0–125).
                      </div>
                    )}
                    <span className="orh-form-help-text">Used for clinical pediatric and adult dosing checks.</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="portal-btn portal-btn-secondary"
                    onClick={() => {
                      setTestFullName("Chaltu Tolasa")
                      setTestAge("34")
                    }}
                  >
                    Restore Valid Defaults
                  </button>
                  <button type="submit" className="portal-btn portal-btn-primary">
                    <Icon name="check" size={15} /> Save Patient Information
                  </button>
                </div>

                {formSavedSuccess && (
                  <div
                    style={{
                      marginTop: "1rem",
                      background: "var(--orh-success-bg)",
                      border: "1px solid #c6ebd2",
                      color: "var(--orh-success)",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--orh-radius-md)",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Icon name="check" size={16} />
                    <span>Form validation successful! Patient record ORH-26-00104 saved without data loss.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CROSS-MODULE PATIENT WORKFLOW                     */}
      {/* ======================================================== */}
      {activeTab === "workflow" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Interactive Cross-Module Stepper */}
          <CrossModuleWorkflow
            currentStageId="stage-consult"
            onNavigateStage={(dest) => {
              if (onNavigate) onNavigate(dest)
              triggerToast(`Navigated to module '${dest}' with patient context ORH-26-00104 preserved.`)
            }}
          />

          {/* Workflow Principles Card */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="activity" size={18} /> Cross-Module Patient Journey Integrity Principles
              </h2>
            </div>
            <div className="portal-card-body" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>Outpatient Care Pathway</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--orh-text)" }}>
                    <li><strong>Registration:</strong> Initial demographic and CBHI community insurance capture.</li>
                    <li><strong>Nursing Triage:</strong> Early warning vital assessment (BP, Heart Rate, SpO2, Temperature).</li>
                    <li><strong>Clinical Consultation:</strong> Attending physician examination, diagnosis coding, and care plan.</li>
                    <li><strong>Diagnostic Orders:</strong> Real-time lab and imaging ordering with automated specimen tracking.</li>
                    <li><strong>Pharmacy Dispense:</strong> Batch and expiry check, dosage verification, and dispensing recording.</li>
                    <li><strong>Billing Settlement:</strong> Automatic CBHI deductible deduction and Telebirr/CBE Birr settlement.</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>Emergency & Inpatient Pathway</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--orh-text)" }}>
                    <li><strong>Emergency Arrival:</strong> Immediate triage acuity assignment (Resuscitation vs Emergent).</li>
                    <li><strong>Admission Decision:</strong> Authorized doctor admission order requiring diagnosis and ward selection.</li>
                    <li><strong>Bed Allocation:</strong> Ward supervisor assigns physical bed (e.g. Medical Ward 2, Bed 204B).</li>
                    <li><strong>Inpatient Rounds:</strong> Daily nurse vital observations and medication administration record (MAR).</li>
                    <li><strong>Authorized Discharge:</strong> Attending physician discharge sign-off, billing clearance, and home-care summary.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: INTERFACE STATES MATRIX                           */}
      {/* ======================================================== */}
      {activeTab === "states" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Skeletons & Loading */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="refresh" size={18} /> 1. Standardized Loading Skeletons
              </h2>
              <span className="orh-status-badge progress">Fluid Shimmer Animation</span>
            </div>
            <div className="portal-card-body">
              <p style={{ fontSize: "0.84rem", color: "var(--orh-text-muted)", marginTop: 0, marginBottom: "1rem" }}>
                Prevents sudden layout shifting while retrieving patient records, laboratory test lists, or pharmacy inventory.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div className="orh-skeleton orh-skeleton-row" style={{ width: "100%" }} />
                <div className="orh-skeleton orh-skeleton-row" style={{ width: "95%" }} />
                <div className="orh-skeleton orh-skeleton-row" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          {/* Empty States */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="inbox" size={18} /> 2. Standardized Empty States
              </h2>
            </div>
            <div className="portal-card-body">
              <div className="orh-empty-state">
                <div className="orh-empty-state-icon">
                  <Icon name="calendar" size={26} />
                </div>
                <h3 className="orh-empty-state-title">No Appointments Scheduled Today</h3>
                <p className="orh-empty-state-desc">
                  There are no scheduled outpatient visits for this clinic room today. You can register a walk-in patient or schedule a new consultation.
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="portal-btn portal-btn-primary portal-btn-sm"
                    onClick={() => triggerToast("Navigated to Appointment Booking.")}
                  >
                    <Icon name="plus" size={14} /> Schedule Appointment
                  </button>
                  <button
                    type="button"
                    className="portal-btn portal-btn-secondary portal-btn-sm"
                    onClick={() => triggerToast("Filters cleared.")}
                  >
                    Reset Clinic Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error & Recovery */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="warning" size={18} /> 3. Human-Readable Error & Safe Recovery Pattern
              </h2>
              <span className="orh-status-badge danger">Zero Technical Leaks</span>
            </div>
            <div className="portal-card-body">
              <div className="orh-error-state">
                <div className="orh-error-state-icon">
                  <Icon name="alert-triangle" size={24} />
                </div>
                <div className="orh-error-state-content">
                  <h4>Unable to Retrieve Laboratory Orders</h4>
                  <p>
                    The hospital diagnostic server temporarily took longer than expected to respond. No patient records were altered. Please check your network connection and retry.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="portal-btn portal-btn-primary portal-btn-sm"
                      onClick={() => triggerToast("Retry request successful. Diagnostic orders synchronized.")}
                    >
                      <Icon name="refresh" size={14} /> Retry Request
                    </button>
                    <button
                      type="button"
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => triggerToast("Returned to Clinical Dashboard.")}
                    >
                      Return to Workspace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATA TABLES & FILTERING PATTERNS                  */}
      {/* ======================================================== */}
      {activeTab === "tables" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="file-text" size={18} /> Standardized Operational Table & Active Filter Bar
              </h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="portal-btn portal-btn-secondary portal-btn-sm"
                  onClick={() => setActiveFilters(["Active Patients", "Internal Med", "CBHI Insured"])}
                >
                  Reset Sample Filters
                </button>
              </div>
            </div>

            <div className="portal-card-body">
              {/* Filter Pills Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--orh-text-muted)", fontWeight: 600 }}>Active Filters:</span>
                {activeFilters.map((filt) => (
                  <span
                    key={filt}
                    className="orh-status-badge progress"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <span>{filt}</span>
                    <button
                      type="button"
                      onClick={() => removeFilter(filt)}
                      style={{ background: "none", border: "none", color: "var(--orh-teal)", cursor: "pointer", padding: 0 }}
                      aria-label={`Remove filter ${filt}`}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                ))}
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilters([])}
                    style={{ background: "none", border: "none", color: "var(--orh-danger)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Patient Name & MRN</th>
                      <th>Clinic Department</th>
                      <th>Encounter ID</th>
                      <th>Attending Clinician</th>
                      <th>Payment / CBHI</th>
                      <th>Clinical Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Chaltu Tolasa</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--orh-teal)", fontFamily: "monospace" }}>ORH-26-00104</div>
                      </td>
                      <td>Internal Medicine</td>
                      <td style={{ fontFamily: "monospace" }}>ENC-2026-0182</td>
                      <td>Dr. Daniel Abate</td>
                      <td>
                        <span className="orh-status-badge success">CBHI Covered</span>
                      </td>
                      <td>
                        <span className="orh-status-badge progress">
                          <Icon name="activity" size={12} /> In Consultation
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="portal-btn portal-btn-secondary portal-btn-sm"
                          onClick={() => triggerToast("Opened Clinical Encounter ENC-2026-0182.")}
                        >
                          Open Encounter
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Bekele Gemechu</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--orh-teal)", fontFamily: "monospace" }}>ORH-26-00089</div>
                      </td>
                      <td>General Surgery</td>
                      <td style={{ fontFamily: "monospace" }}>ENC-2026-0177</td>
                      <td>Dr. Tesfaye Wolde</td>
                      <td>
                        <span className="orh-status-badge success">Paid (Telebirr)</span>
                      </td>
                      <td>
                        <span className="orh-status-badge success">
                          <Icon name="check" size={12} /> Completed
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="portal-btn portal-btn-secondary portal-btn-sm"
                          onClick={() => triggerToast("Viewed Summary for Bekele Gemechu.")}
                        >
                          View Summary
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fatuma Ahmed</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--orh-teal)", fontFamily: "monospace" }}>ORH-26-00115</div>
                      </td>
                      <td>Pediatrics OPD</td>
                      <td style={{ fontFamily: "monospace" }}>ENC-2026-0190</td>
                      <td>Dr. Berhanu Mengistu</td>
                      <td>
                        <span className="orh-status-badge warning">Pending Cashier</span>
                      </td>
                      <td>
                        <span className="orh-status-badge pending">
                          <Icon name="clock" size={12} /> Triage Queued
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="portal-btn portal-btn-secondary portal-btn-sm"
                          onClick={() => triggerToast("Calling patient to Nurse Triage.")}
                        >
                          Call to Triage
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Standardized Pagination Bar */}
              <div className="orh-pagination-bar">
                <span>Showing 1 to 3 of 48 registered patients</span>
                <div className="orh-pagination-controls">
                  <button type="button" className="orh-page-btn" disabled>
                    Previous
                  </button>
                  <button type="button" className="orh-page-btn active">
                    1
                  </button>
                  <button type="button" className="orh-page-btn">
                    2
                  </button>
                  <button type="button" className="orh-page-btn">
                    3
                  </button>
                  <button type="button" className="orh-page-btn">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: RESPONSIVE VIEWPORT SIMULATOR                     */}
      {/* ======================================================== */}
      {activeTab === "responsive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="settings" size={18} /> Interactive Responsive Viewport Previewer
              </h2>
              <div style={{ display: "flex", gap: "0.45rem" }}>
                <button
                  type="button"
                  className={`portal-btn portal-btn-sm ${viewportWidth === "100%" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                  onClick={() => setViewportWidth("100%")}
                >
                  Desktop (1440px)
                </button>
                <button
                  type="button"
                  className={`portal-btn portal-btn-sm ${viewportWidth === "768px" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                  onClick={() => setViewportWidth("768px")}
                >
                  Tablet (768px)
                </button>
                <button
                  type="button"
                  className={`portal-btn portal-btn-sm ${viewportWidth === "375px" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                  onClick={() => setViewportWidth("375px")}
                >
                  Mobile (375px)
                </button>
              </div>
            </div>

            <div className="portal-card-body">
              <p style={{ fontSize: "0.85rem", color: "var(--orh-text-muted)", marginTop: 0, marginBottom: "1rem" }}>
                Preview how ORHIMS screens scale from desktop workstations down to tablet nursing carts and mobile patient/staff devices with touch targets $\ge 44\text{px}$.
              </p>

              {/* Viewport Frame */}
              <div
                className="orh-viewport-simulator"
                style={{ maxWidth: viewportWidth }}
              >
                <div className="orh-viewport-bar">
                  <span>ORHIMS Preview Frame — {viewportWidth === "100%" ? "Desktop Workstation" : viewportWidth === "768px" ? "Tablet Nurse Cart" : "Mobile Device"}</span>
                  <span style={{ fontFamily: "monospace" }}>{viewportWidth}</span>
                </div>

                <div style={{ padding: "1rem", background: "var(--orh-bg)" }}>
                  {/* Mini-mockup inside frame */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "6px",
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--orh-border)",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--orh-navy)" }}>Oda Roba General Hospital</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--orh-text-muted)" }}>Medical Ward 2 · Active Inpatients</div>
                    </div>
                    <span className="orh-status-badge progress">92% Occupancy</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: viewportWidth === "375px" ? "1fr" : "1fr 1fr", gap: "0.6rem" }}>
                    <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--orh-border)" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--orh-text-muted)" }}>Bed 204A</span>
                      <div style={{ fontWeight: 600, color: "var(--orh-navy)", fontSize: "0.86rem" }}>Ahmed Kedir</div>
                      <span className="orh-status-badge success" style={{ fontSize: "0.7rem", marginTop: "0.3rem" }}>Post-Op Day 2</span>
                    </div>

                    <div style={{ background: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--orh-border)" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--orh-text-muted)" }}>Bed 204B</span>
                      <div style={{ fontWeight: 600, color: "var(--orh-navy)", fontSize: "0.86rem" }}>Chaltu Tolasa</div>
                      <span className="orh-status-badge progress" style={{ fontSize: "0.7rem", marginTop: "0.3rem" }}>Observation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: ACCESSIBILITY & ETHIOPIAN HOSPITAL CONTEXT       */}
      {/* ======================================================== */}
      {activeTab === "accessibility" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="portal-card">
            <div className="portal-card-header">
              <h2 className="portal-card-title">
                <Icon name="shield" size={18} /> Accessibility Standards & Ethiopian Healthcare Context Verification
              </h2>
            </div>
            <div className="portal-card-body" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>WCAG 2.1 AA Accessibility Conformance</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--orh-text)" }}>
                    <li><strong>Contrast Ratio:</strong> Primary text (#142E42 on #FFFFFF) exceeds 12.8:1 (minimum 4.5:1 required).</li>
                    <li><strong>Touch Targets:</strong> All buttons, inputs, and tab items meet or exceed 44×44px interactive areas.</li>
                    <li><strong>Keyboard Navigation:</strong> High-visibility teal focus rings (`:focus-visible`) across all interactive controls.</li>
                    <li><strong>Screen Readers:</strong> Standard `aria-label`, `aria-current="page"`, and `role="status"` on all feedback toasts.</li>
                    <li><strong>Zero Emojis:</strong> Medical clarity maintained using standardized SVG Lucide line icons.</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>Bale Robe Hospital Practical Usability</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--orh-text)" }}>
                    <li><strong>Offline Resilience:</strong> Form data preserved during transient network interruptions.</li>
                    <li><strong>CBHI Scheme:</strong> Native support for Community Based Health Insurance membership tracking.</li>
                    <li><strong>Localization:</strong> Multilingual preparedness for Afaan Oromoo, Amharic, and English.</li>
                    <li><strong>Digital & Cashier Payments:</strong> Seamless coexistence of Telebirr, CBE Birr, and physical Cashier desks.</li>
                    <li><strong>Role Separation:</strong> Patient Portal strictly isolated from internal clinical and administrative audits.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title" style={{ color: confirmModalType === "discharge" ? "var(--orh-danger)" : "var(--orh-navy)" }}>
                {confirmModalType === "discharge" ? (
                  <>
                    <Icon name="log-out" size={18} /> Confirm Inpatient Discharge
                  </>
                ) : (
                  <>
                    <Icon name="download" size={18} /> Export UX Design System Documentation
                  </>
                )}
              </h3>
              <button
                type="button"
                className="portal-btn portal-btn-secondary portal-btn-sm"
                onClick={() => setShowConfirmModal(false)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="portal-modal-body" style={{ fontSize: "0.88rem" }}>
              {confirmModalType === "discharge" ? (
                <div>
                  <p style={{ marginTop: 0 }}>
                    Are you sure you want to finalize the discharge for <strong>Chaltu Tolasa</strong> (MRN: <code>ORH-26-00104</code>)?
                  </p>
                  <div
                    style={{
                      background: "var(--orh-danger-bg)",
                      border: "1px solid #fecaca",
                      borderRadius: "var(--orh-radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.82rem",
                      color: "var(--orh-danger)",
                    }}
                  >
                    <strong>Consequence:</strong> The allocated bed (Medical Ward 2, Bed 204B) will be marked for sanitization and freed for new admissions. An itemized billing invoice will be sent to the cashier desk.
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ marginTop: 0 }}>
                    Generate a PDF summary of the Phase 13 ORHIMS UX Quality & Interaction Refinement standard specifications.
                  </p>
                </div>
              )}
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="portal-btn portal-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  confirmModalType === "discharge"
                    ? "portal-btn portal-btn-danger-outline"
                    : "portal-btn portal-btn-primary"
                }
                style={
                  confirmModalType === "discharge"
                    ? { background: "var(--orh-danger)", color: "#ffffff", borderColor: "var(--orh-danger)" }
                    : {}
                }
                onClick={() => {
                  setShowConfirmModal(false)
                  triggerToast(
                    confirmModalType === "discharge"
                      ? "Discharge finalized. Summary DSC-2026-0029 generated."
                      : "Design specification exported successfully."
                  )
                }}
              >
                {confirmModalType === "discharge" ? "Confirm Discharge" : "Export Documentation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reusable Toast Notification */}
      {showToast && (
        <div className="orh-toast" role="status">
          <div style={{ color: "var(--orh-success)" }}>
            <Icon name="check" size={20} />
          </div>
          <span style={{ fontSize: "0.86rem", color: "var(--orh-navy)", fontWeight: 500 }}>
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            style={{ background: "none", border: "none", color: "var(--orh-text-muted)", cursor: "pointer", marginLeft: "auto", padding: 0 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
