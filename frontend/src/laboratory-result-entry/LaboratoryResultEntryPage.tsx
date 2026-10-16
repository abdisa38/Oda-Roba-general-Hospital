import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoResultOrders,
  calculateResultFlag,
  type ResultEntryOrder,
  type ResultEntryStatus,
  type AbnormalFlag,
} from "./model"
import "./laboratory-result-entry.css"

interface LaboratoryResultEntryPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function LaboratoryResultEntryPage({
  state = "ready",
  permissions,
  onNavigate,
}: LaboratoryResultEntryPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("lab") ||
    permissions.has("result-entry") ||
    permissions.has("lab-orders") ||
    permissions.has("specimen-collection")

  // State
  const [orders, setOrders] = useState<ResultEntryOrder[]>(demoResultOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string>(demoResultOrders[0].id)
  const [activeTab, setActiveTab] = useState<"All" | ResultEntryStatus>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All")

  // Active working form values
  const [currentResults, setCurrentResults] = useState<Record<string, string>>({})
  const [currentNotes, setCurrentNotes] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Currently selected order
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  )

  // Sync working state when selected order changes
  function selectOrder(order: ResultEntryOrder) {
    setSelectedOrderId(order.id)
    setCurrentResults(order.enteredResults || {})
    setCurrentNotes(order.technicalNotes || "")
    setValidationErrors({})
    setReviewModalOpen(false)
  }

  // Live Counts
  const countAwaiting = orders.filter((o) => o.status === "Awaiting Result Entry").length
  const countDraft = orders.filter((o) => o.status === "Draft Saved").length
  const countProcessing = orders.filter((o) => o.status === "In Processing").length
  const countSubmitted = orders.filter((o) => o.status === "Submitted for Review").length
  const countReleased = orders.filter((o) => o.status === "Released").length

  // Filtered Queue
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      const matchTab = activeTab === "All" || order.status === activeTab

      // Category filter
      const matchCat = categoryFilter === "All" || order.testCategory === categoryFilter

      // Urgency filter
      const matchUrgency = urgencyFilter === "All" || order.priority.startsWith(urgencyFilter)

      // Search query
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        order.patientName.toLowerCase().includes(q) ||
        order.patientId.toLowerCase().includes(q) ||
        order.requestId.toLowerCase().includes(q) ||
        order.specimenId.toLowerCase().includes(q) ||
        order.testName.toLowerCase().includes(q)

      return matchTab && matchCat && matchUrgency && matchSearch
    })
  }, [orders, activeTab, categoryFilter, urgencyFilter, searchQuery])

  // Handle component value change
  function handleValueChange(key: string, value: string) {
    setCurrentResults((prev) => ({ ...prev, [key]: value }))
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Validate required components
  function validateForm(): boolean {
    if (!selectedOrder) return false
    const errors: Record<string, string> = {}

    selectedOrder.components.forEach((comp) => {
      const val = currentResults[comp.key]
      if (comp.required && (!val || val.trim() === "")) {
        errors[comp.key] = `${comp.name} is a mandatory parameter.`
      } else if (comp.type === "numeric" && val && val.trim() !== "") {
        if (isNaN(parseFloat(val))) {
          errors[comp.key] = `Please enter a valid numeric value.`
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save as Draft
  function handleSaveDraft() {
    if (!selectedOrder) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "Draft Saved" as const,
              enteredResults: { ...currentResults },
              technicalNotes: currentNotes.trim() || undefined,
              lastSavedAt: fullTimestamp,
            }
          : o
      )
    )

    setNotification({
      message: `Draft saved for ${selectedOrder.testName} (${selectedOrder.patientName}). Work is preserved in the queue.`,
      type: "success",
    })
    setTimeout(() => setNotification(null), 4000)
  }

  // Open Review Modal
  function handleOpenReview() {
    if (validateForm()) {
      setReviewModalOpen(true)
    } else {
      setNotification({
        message: "Validation Error: Please complete all mandatory test parameters before submission review.",
        type: "error",
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  // Submit Completed Results for Review
  function handleConfirmSubmission() {
    if (!selectedOrder) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "Submitted for Review" as const,
              enteredResults: { ...currentResults },
              technicalNotes: currentNotes.trim() || undefined,
              submittedAt: fullTimestamp,
            }
          : o
      )
    )

    setReviewModalOpen(false)
    setNotification({
      message: `Results for ${selectedOrder.testName} submitted for review. Transferred to supervisor authorization queue.`,
      type: "success",
    })
    setTimeout(() => setNotification(null), 5000)
  }

  if (state === "loading") {
    return (
      <div className="re-workspace-page">
        <div className="re-empty-state" style={{ padding: "80px 20px" }}>
          <Icon name="clock" size={36} />
          <Heading level={2}>Loading Laboratory Result Entry Workspace...</Heading>
          <Text>Retrieving verified specimens and analytical orders from laboratory database.</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="re-workspace-page">
      {/* ── Breadcrumb & Page Header ── */}
      <header className="re-page-header">
        <nav className="re-breadcrumb" aria-label="Breadcrumb">
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate("laboratory")}>
            Laboratory
          </span>
          <span>/</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("specimen-collection")}
          >
            Specimen Collection
          </span>
          <span>/</span>
          <span className="active">Result Entry</span>
          <span>/</span>
          <span
            style={{ cursor: "pointer", color: "var(--teal)", fontWeight: 600 }}
            onClick={() => onNavigate("result-review")}
          >
            Result Review &amp; Approval
          </span>
        </nav>

        <div className="re-header-main">
          <div className="re-title-area">
            <h1>Laboratory Result Entry</h1>
            <p className="re-title-desc">
              Record, validate, and submit quantitative and qualitative diagnostic findings for verified specimens
              before authorization and release to attending clinicians.
            </p>
          </div>

          <div className="re-header-controls">
            <span className="re-demo-pill" title="Demonstration data representative of Oda Roba Hospital">
              <Icon name="flask" size={14} />
              <span>Awaiting Entry:</span>
              <strong>{countAwaiting} Orders</strong>
              <small style={{ color: "var(--muted)", marginLeft: "4px" }}>(Demonstration Data)</small>
            </span>

            <div className="re-search-box">
              <span className="re-search-icon">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                className="re-search-input"
                placeholder="Search patient, MRN, specimen ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search result entry queue"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Notification Banner ── */}
      {notification && (
        <div
          className={`re-alert-banner ${
            notification.type === "success" ? "re-alert-success" : "re-alert-error"
          }`}
          role="status"
        >
          <Icon name={notification.type === "success" ? "check" : "warning"} size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <section className="re-filter-bar">
        <div className="re-status-tabs" role="tablist" aria-label="Filter result entry queue">
          <button
            type="button"
            className={`re-tab-btn${activeTab === "All" ? " active" : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All Orders <span className="re-count-badge">{orders.length}</span>
          </button>
          <button
            type="button"
            className={`re-tab-btn tab-awaiting${activeTab === "Awaiting Result Entry" ? " active" : ""}`}
            onClick={() => setActiveTab("Awaiting Result Entry")}
          >
            Awaiting Entry <span className="re-count-badge">{countAwaiting}</span>
          </button>
          <button
            type="button"
            className={`re-tab-btn tab-draft${activeTab === "Draft Saved" ? " active" : ""}`}
            onClick={() => setActiveTab("Draft Saved")}
          >
            Draft Saved <span className="re-count-badge">{countDraft}</span>
          </button>
          <button
            type="button"
            className={`re-tab-btn${activeTab === "In Processing" ? " active" : ""}`}
            onClick={() => setActiveTab("In Processing")}
          >
            In Processing <span className="re-count-badge">{countProcessing}</span>
          </button>
          <button
            type="button"
            className={`re-tab-btn tab-submitted${activeTab === "Submitted for Review" ? " active" : ""}`}
            onClick={() => setActiveTab("Submitted for Review")}
          >
            Submitted for Review <span className="re-count-badge">{countSubmitted}</span>
          </button>
          <button
            type="button"
            className={`re-tab-btn tab-released${activeTab === "Released" ? " active" : ""}`}
            onClick={() => setActiveTab("Released")}
          >
            Released <span className="re-count-badge">{countReleased}</span>
          </button>
        </div>

        <div className="re-extra-filters">
          <select
            className="re-select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by department category"
          >
            <option value="All">All Categories</option>
            <option value="Hematology">Hematology</option>
            <option value="Parasitology">Parasitology</option>
            <option value="Clinical Chemistry">Clinical Chemistry</option>
            <option value="Urinalysis">Urinalysis</option>
            <option value="Microbiology / TB">Microbiology / TB</option>
          </select>

          <select
            className="re-select-filter"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value="STAT">STAT / Urgent Only</option>
            <option value="Routine">Routine Only</option>
          </select>
        </div>
      </section>

      {/* ── Main Two-Column Layout ── */}
      <main className="re-main-layout">
        {/* Left Column: Work Queue */}
        <section className="re-queue-card" aria-label="Result entry work queue">
          <div className="re-queue-header">
            <h2 className="re-queue-title">Diagnostic Test Work Queue</h2>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              Showing {filteredOrders.length} of {orders.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredOrders.length === 0 ? (
              <div className="re-empty-state">
                <Icon name="flask" size={28} />
                <Heading level={3}>No Orders Found</Heading>
                <Text>No laboratory orders match the current filter criteria.</Text>
                <Button
                  className="button secondary"
                  onClick={() => {
                    setActiveTab("All")
                    setCategoryFilter("All")
                    setUrgencyFilter("All")
                    setSearchQuery("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = order.id === selectedOrderId
                const statusBadgeClass =
                  order.status === "Awaiting Result Entry"
                    ? "re-badge-awaiting"
                    : order.status === "Draft Saved"
                    ? "re-badge-draft"
                    : order.status === "In Processing"
                    ? "re-badge-processing"
                    : order.status === "Submitted for Review"
                    ? "re-badge-submitted"
                    : order.status === "Verified"
                    ? "re-badge-verified"
                    : order.status === "Released"
                    ? "re-badge-released"
                    : "re-badge-ineligible"

                return (
                  <article
                    key={order.id}
                    className={`re-order-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => selectOrder(order)}
                  >
                    <div className="re-order-head">
                      <span className="re-req-id">{order.requestId}</span>
                      <span className={`re-status-badge ${statusBadgeClass}`}>
                        {order.status === "Released" && <Icon name="check" size={11} />}
                        {order.status === "Draft Saved" && <Icon name="edit" size={11} />}
                        {order.status === "Ineligible / Rejected Specimen" && <Icon name="warning" size={11} />}
                        {order.status}
                      </span>
                    </div>

                    <div className="re-patient-row">
                      <span className="re-patient-name">{order.patientName}</span>
                      <span className="re-patient-mrn">{order.patientId}</span>
                    </div>

                    <div className="re-test-title">
                      {order.testName}
                    </div>

                    <div className="re-order-meta">
                      <span>
                        Specimen: <strong>{order.specimenId}</strong> ({order.specimenType})
                      </span>
                      <span
                        className={`re-urgency-pill ${
                          order.priority.startsWith("STAT") ? "re-urgency-stat" : "re-urgency-routine"
                        }`}
                      >
                        {order.priority}
                      </span>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        {/* Right Column: Result Entry Form & Patient Context */}
        {selectedOrder && (
          <section className="re-form-workspace" aria-label="Selected test result entry">
            {/* 1. Patient & Requisition Context Banner */}
            <div className="re-patient-banner">
              <div className="re-patient-banner-item">
                <span>Patient Identification</span>
                <strong>{selectedOrder.patientName}</strong>
                <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "1px" }}>
                  MRN: {selectedOrder.patientId} · {selectedOrder.patientAgeGender}
                </div>
              </div>

              <div className="re-patient-banner-item">
                <span>Encounter &amp; Location</span>
                <strong>{selectedOrder.encounterId}</strong>
                <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "1px" }}>
                  {selectedOrder.requestedDepartment}
                </div>
              </div>

              <div className="re-patient-banner-item">
                <span>Verified Specimen</span>
                <strong>{selectedOrder.specimenId}</strong>
                <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "1px" }}>
                  {selectedOrder.specimenType} ({selectedOrder.specimenStatus})
                </div>
              </div>

              <div className="re-patient-banner-item">
                <span>Requesting Clinician</span>
                <strong>{selectedOrder.requestingDoctor}</strong>
                <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "1px" }}>
                  Collection: {selectedOrder.collectionTimestamp}
                </div>
              </div>
            </div>

            {/* Ineligible Specimen Alert if rejected/cancelled */}
            {selectedOrder.status === "Ineligible / Rejected Specimen" && (
              <div className="re-ineligible-banner" role="alert">
                <Icon name="warning" size={20} />
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    Ineligible for Result Entry:
                  </strong>
                  {selectedOrder.ineligibleReason}
                  <div style={{ marginTop: "8px" }}>
                    <Button
                      className="button secondary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      onClick={() => onNavigate("specimen-collection")}
                    >
                      <Icon name="arrow" size={12} /> Return to Specimen Collection Queue
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Test Specifications & Instrument */}
            <div className="re-test-specs-card">
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Test Protocol: {selectedOrder.testCategory}
                </span>
                <div className="re-test-specs-title">
                  {selectedOrder.testName} <span style={{ fontSize: "12px", color: "var(--muted)" }}>({selectedOrder.testCode})</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {selectedOrder.analyzerName && (
                  <span style={{ color: "var(--navy)", fontSize: "12px" }}>
                    Analyzer: <strong>{selectedOrder.analyzerName}</strong>
                  </span>
                )}
                <span
                  className={`re-status-badge ${
                    selectedOrder.status === "Awaiting Result Entry"
                      ? "re-badge-awaiting"
                      : selectedOrder.status === "Draft Saved"
                      ? "re-badge-draft"
                      : selectedOrder.status === "In Processing"
                      ? "re-badge-processing"
                      : selectedOrder.status === "Submitted for Review"
                      ? "re-badge-submitted"
                      : selectedOrder.status === "Released"
                      ? "re-badge-released"
                      : "re-badge-ineligible"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* 3. Dynamic Result Entry Form */}
            {selectedOrder.status !== "Ineligible / Rejected Specimen" && (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", margin: "0 0 10px 0" }}>
                  {selectedOrder.resultType === "panel"
                    ? "Multi-Component Analytical Parameters"
                    : "Diagnostic Result Determination"}
                </h3>

                <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                  <table className="re-components-table">
                    <thead>
                      <tr>
                        <th style={{ width: "240px" }}>Parameter / Test Component</th>
                        <th>Entered Value</th>
                        <th style={{ width: "100px" }}>Unit</th>
                        <th style={{ width: "160px" }}>Reference Range</th>
                        <th style={{ width: "120px" }}>Abnormal Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.components.map((comp) => {
                        const val = currentResults[comp.key] || ""
                        const flag = calculateResultFlag(val, comp)
                        const hasErr = !!validationErrors[comp.key]
                        const isReadOnly =
                          selectedOrder.status === "Submitted for Review" ||
                          selectedOrder.status === "Released"

                        return (
                          <tr key={comp.key}>
                            <td>
                              <strong style={{ color: "var(--navy)", display: "block" }}>
                                {comp.name}
                                {comp.required && <span style={{ color: "var(--emergency)", marginLeft: "3px" }}>*</span>}
                              </strong>
                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{comp.code}</span>
                              {hasErr && (
                                <div style={{ fontSize: "11px", color: "var(--emergency)", marginTop: "2px" }}>
                                  {validationErrors[comp.key]}
                                </div>
                              )}
                            </td>

                            <td>
                              {comp.type === "numeric" ? (
                                <input
                                  type="text"
                                  className={`re-input-result${hasErr ? " has-error" : ""}`}
                                  placeholder="0.0"
                                  value={val}
                                  disabled={isReadOnly}
                                  onChange={(e) => handleValueChange(comp.key, e.target.value)}
                                  aria-label={`${comp.name} result value`}
                                />
                              ) : comp.type === "categorical" && comp.categoricalOptions ? (
                                <select
                                  className="re-select-result"
                                  value={val}
                                  disabled={isReadOnly}
                                  onChange={(e) => handleValueChange(comp.key, e.target.value)}
                                  aria-label={`${comp.name} result selection`}
                                >
                                  <option value="">-- Select Configured Finding --</option>
                                  {comp.categoricalOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  className="re-input-result"
                                  style={{ width: "220px" }}
                                  value={val}
                                  disabled={isReadOnly}
                                  onChange={(e) => handleValueChange(comp.key, e.target.value)}
                                />
                              )}
                            </td>

                            <td>
                              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                                {comp.unit || "—"}
                              </span>
                            </td>

                            <td>
                              <span style={{ fontSize: "12px", color: "#334155" }}>
                                {comp.referenceRange || "None configured"}
                              </span>
                            </td>

                            <td>
                              {flag ? (
                                <span
                                  className={`re-flag-pill ${
                                    flag === "Normal"
                                      ? "re-flag-normal"
                                      : flag === "High"
                                      ? "re-flag-high"
                                      : flag === "Low"
                                      ? "re-flag-low"
                                      : flag === "Critical"
                                      ? "re-flag-critical"
                                      : "re-flag-abnormal"
                                  }`}
                                >
                                  {flag === "High" && "HIGH ▲"}
                                  {flag === "Low" && "LOW ▼"}
                                  {flag === "Critical" && "CRITICAL ⚠"}
                                  {flag === "Abnormal" && "ABNORMAL"}
                                  {flag === "Normal" && "NORMAL"}
                                </span>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--muted)" }}>—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Technical / Bench Notes */}
            {selectedOrder.status !== "Ineligible / Rejected Specimen" && (
              <div className="re-notes-group">
                <label className="re-notes-label">
                  Bench Technologist Notes / Analytical Comments (Optional)
                </label>
                <textarea
                  className="re-notes-textarea"
                  rows={2}
                  placeholder="Record instrument flags, reagent lot details, slide microscopy observations, or sample dilution factors..."
                  value={currentNotes}
                  disabled={
                    selectedOrder.status === "Submitted for Review" || selectedOrder.status === "Released"
                  }
                  onChange={(e) => setCurrentNotes(e.target.value)}
                />
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Technical documentation only. Clinical diagnosis and treatment recommendations are strictly prohibited.
                </span>
              </div>
            )}

            {/* 5. Action Bar */}
            {selectedOrder.status !== "Ineligible / Rejected Specimen" && (
              <div className="re-action-bar">
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Responsible Tech: <strong>{selectedOrder.benchTechnician}</strong>
                  {selectedOrder.lastSavedAt && (
                    <span style={{ marginLeft: "8px" }}>· Last Draft: {selectedOrder.lastSavedAt}</span>
                  )}
                  {selectedOrder.submittedAt && (
                    <span style={{ marginLeft: "8px", color: "#7c3aed" }}>
                      · Submitted: {selectedOrder.submittedAt}
                    </span>
                  )}
                </div>

                <div className="re-action-group-right">
                  {selectedOrder.status !== "Submitted for Review" && selectedOrder.status !== "Released" ? (
                    <>
                      <Button className="button secondary" onClick={handleSaveDraft}>
                        <Icon name="edit" size={13} /> Save Draft
                      </Button>
                      <Button className="button" onClick={handleOpenReview}>
                        <Icon name="check" size={13} /> Review &amp; Submit Results
                      </Button>
                    </>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {selectedOrder.status === "Submitted for Review" && (
                        <Button
                          className="button"
                          style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                          onClick={() => onNavigate("result-review")}
                        >
                          <Icon name="check" size={13} /> Open in Result Review
                        </Button>
                      )}
                      <Button
                        className="button secondary"
                        onClick={() => {
                          window.alert(`[Print Result Slip]\nPrinting result record for ${selectedOrder.patientName} (${selectedOrder.id})`)
                        }}
                      >
                        Print Lab Record
                      </Button>
                      <Button
                        className="button secondary"
                        onClick={() => {
                          setNotification({
                            message: `Order ${selectedOrder.id} is in "${selectedOrder.status}" state. Formal revision requires senior pathologist supervisor authorization.`,
                            type: "error",
                          })
                          setTimeout(() => setNotification(null), 5000)
                        }}
                      >
                        Request Amendment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── MODAL: PRE-SUBMISSION VERIFICATION & REVIEW ── */}
      {reviewModalOpen && selectedOrder && (
        <div className="re-modal-overlay" role="dialog" aria-modal="true">
          <div className="re-modal-dialog">
            <div className="re-modal-head">
              <div>
                <h2 className="re-modal-title">Pre-Submission Result Review</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Order: <strong>{selectedOrder.id}</strong> · Specimen: <strong>{selectedOrder.specimenId}</strong>
                </div>
              </div>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setReviewModalOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="re-modal-body">
              {/* Context Summary */}
              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Patient:</span>
                  <strong style={{ color: "var(--navy)" }}>
                    {selectedOrder.patientName} ({selectedOrder.patientId})
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Investigation:</span>
                  <strong style={{ color: "var(--navy)" }}>{selectedOrder.testName}</strong>
                </div>
              </div>

              {/* Notice */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                <strong>Workflow Notice: </strong> Submitting these findings will advance the order to
                <strong> "Submitted for Review"</strong>. Technical validation confirms data format adherence;
                final release to attending physicians will be authorized by the supervisory laboratory officer.
              </div>

              {/* Results Table Summary */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                <table className="re-components-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.components.map((comp) => {
                      const val = currentResults[comp.key] || "—"
                      const flag = calculateResultFlag(val, comp)
                      return (
                        <tr key={comp.key}>
                          <td><strong>{comp.name}</strong></td>
                          <td><strong style={{ color: "var(--navy)" }}>{val}</strong></td>
                          <td>{comp.unit || "—"}</td>
                          <td>{comp.referenceRange || "—"}</td>
                          <td>
                            {flag ? (
                              <span
                                className={`re-flag-pill ${
                                  flag === "Normal"
                                    ? "re-flag-normal"
                                    : flag === "High"
                                    ? "re-flag-high"
                                    : flag === "Low"
                                    ? "re-flag-low"
                                    : flag === "Critical"
                                    ? "re-flag-critical"
                                    : "re-flag-abnormal"
                                }`}
                              >
                                {flag}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {currentNotes && (
                <div style={{ fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                  <strong>Bench Notes: </strong> {currentNotes}
                </div>
              )}
            </div>

            <div className="re-modal-foot">
              <Button className="button secondary" onClick={() => setReviewModalOpen(false)}>
                Back to Edit
              </Button>
              <Button
                className="button"
                style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                onClick={handleConfirmSubmission}
              >
                <Icon name="check" size={14} /> Submit for Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
