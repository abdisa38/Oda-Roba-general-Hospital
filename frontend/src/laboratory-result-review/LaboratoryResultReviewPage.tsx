import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoReviewOrders,
  type ReviewOrder,
  type ReviewStatus,
  type ReviewPriority,
  type ReviewAnalyte,
} from "./model"
import "./laboratory-result-review.css"

interface LaboratoryResultReviewPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function LaboratoryResultReviewPage({
  state = "ready",
  permissions,
  onNavigate,
}: LaboratoryResultReviewPageProps) {
  // Authorization check: senior lab officer or review permission
  const isAuthorized =
    permissions.has("lab") ||
    permissions.has("result-review") ||
    permissions.has("result-entry")

  // State
  const [orders, setOrders] = useState<ReviewOrder[]>(demoReviewOrders)
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>(demoReviewOrders[0].orderNumber)
  const [activeQueueView, setActiveQueueView] = useState<"all" | "pending" | "urgent" | "critical" | "returned">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [abnormalOnly, setAbnormalOnly] = useState(false)
  const [showQueueList, setShowQueueList] = useState(true)

  // Working review notes
  const [reviewNotes, setReviewNotes] = useState("")

  // Modals state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [auditModalOpen, setAuditModalOpen] = useState(false)

  // Correction Form
  const [correctionReason, setCorrectionReason] = useState("Missing required result")
  const [correctionAnalyte, setCorrectionAnalyte] = useState("All Analytes")
  const [correctionDescription, setCorrectionDescription] = useState("")

  // Escalation Form
  const [escalationClinician, setEscalationClinician] = useState("Dr. Dawit Alemu, MD")
  const [escalationContactMethod, setEscalationContactMethod] = useState("Direct Clinical Phone Call")
  const [escalationNotes, setEscalationNotes] = useState("")
  const [escalationConfirmed, setEscalationConfirmed] = useState(false)

  // Approval Form
  const [approvalConfirmed, setApprovalConfirmed] = useState(false)

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Currently selected order
  const selectedOrder = useMemo(
    () => orders.find((o) => o.orderNumber === selectedOrderNumber) || orders[0],
    [orders, selectedOrderNumber]
  )

  // Live Metrics
  const countPending = orders.filter((o) => o.status === "Pending Review").length
  const countUrgent = orders.filter((o) => o.status === "Pending Review" && o.priority !== "Routine").length
  const countCritical = orders.filter((o) => o.hasCritical && o.status !== "Approved" && o.status !== "Released").length
  const countReturned = orders.filter((o) => o.status === "Returned for Correction").length

  // Filtered Queue
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Metric quick filter
      if (activeQueueView === "pending" && ord.status !== "Pending Review") return false
      if (activeQueueView === "urgent" && (ord.status !== "Pending Review" || ord.priority === "Routine")) return false
      if (activeQueueView === "critical" && !ord.hasCritical) return false
      if (activeQueueView === "returned" && ord.status !== "Returned for Correction") return false

      // Department filter
      if (departmentFilter !== "All" && !ord.orderingDepartment.includes(departmentFilter)) return false

      // Priority filter
      if (priorityFilter !== "All" && ord.priority !== priorityFilter) return false

      // Abnormal only toggle
      if (abnormalOnly && !ord.hasAbnormal && !ord.hasCritical) return false

      // Search query
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.patientName.toLowerCase().includes(q) ||
        ord.patientId.toLowerCase().includes(q) ||
        ord.testName.toLowerCase().includes(q) ||
        ord.specimenId.toLowerCase().includes(q)
      )
    })
  }, [orders, activeQueueView, departmentFilter, priorityFilter, abnormalOnly, searchQuery])

  // Select an order from queue
  function handleSelectOrder(order: ReviewOrder) {
    setSelectedOrderNumber(order.orderNumber)
    setReviewNotes(order.internalReviewNotes || "")
    setApprovalConfirmed(false)
  }

  // Save Review Notes
  function handleSaveReviewNotes() {
    if (!selectedOrder) return
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === selectedOrder.orderNumber
          ? {
              ...o,
              internalReviewNotes: reviewNotes.trim(),
              auditHistory: [
                ...o.auditHistory,
                {
                  timestamp: now,
                  event: "Review Note Recorded",
                  user: "Sr. Tirhas Wolde",
                  role: "Senior Lab Officer",
                  notes: reviewNotes.trim(),
                },
              ],
            }
          : o
      )
    )

    setNotification({
      message: `Internal review notes saved for order ${selectedOrder.orderNumber}.`,
      type: "success",
    })
    setTimeout(() => setNotification(null), 4000)
  }

  // Open Approval Confirmation
  function handleOpenApproval() {
    setApprovalConfirmed(false)
    setApprovalModalOpen(true)
  }

  // Confirm Approval
  function handleConfirmApproval() {
    if (!selectedOrder || !approvalConfirmed) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === selectedOrder.orderNumber
          ? {
              ...o,
              status: "Approved" as const,
              approvedBy: "Sr. Tirhas Wolde, Senior Lab Officer",
              approvedAt: fullTimestamp,
              auditHistory: [
                ...o.auditHistory,
                {
                  timestamp: timeStr,
                  event: "Results Approved",
                  user: "Sr. Tirhas Wolde",
                  role: "Senior Lab Officer",
                  notes: "Technical findings and quality criteria authorized. Order eligible for release to attending clinician.",
                },
              ],
            }
          : o
      )
    )

    setApprovalModalOpen(false)
    setNotification({
      message: `Order ${selectedOrder.orderNumber} successfully Approved. Results verified and queued for clinician release.`,
      type: "success",
    })
    setTimeout(() => setNotification(null), 5000)
  }

  // Open Correction Dialog
  function handleOpenCorrection() {
    setCorrectionReason("Missing required result")
    setCorrectionAnalyte(selectedOrder?.analytes[0]?.name || "All Analytes")
    setCorrectionDescription("")
    setCorrectionModalOpen(true)
  }

  // Confirm Request Correction
  function handleConfirmCorrection() {
    if (!selectedOrder) return
    if (!correctionDescription.trim()) {
      setNotification({
        message: "Please provide a specific description explaining the required correction.",
        type: "error",
      })
      setTimeout(() => setNotification(null), 4000)
      return
    }

    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === selectedOrder.orderNumber
          ? {
              ...o,
              status: "Returned for Correction" as const,
              correctionReason,
              correctionDescription: correctionDescription.trim(),
              auditHistory: [
                ...o.auditHistory,
                {
                  timestamp: now,
                  event: "Correction Requested",
                  user: "Sr. Tirhas Wolde",
                  role: "Senior Lab Officer",
                  notes: `Reason: ${correctionReason} (${correctionAnalyte}). Details: ${correctionDescription.trim()}`,
                },
              ],
            }
          : o
      )
    )

    setCorrectionModalOpen(false)
    setNotification({
      message: `Order ${selectedOrder.orderNumber} returned for correction (${correctionReason}). Bench technologist alerted.`,
      type: "error",
    })
    setTimeout(() => setNotification(null), 5000)
  }

  // Open Escalation Dialog
  function handleOpenEscalate() {
    setEscalationClinician(selectedOrder?.orderingClinician || "Dr. Dawit Alemu, MD")
    setEscalationContactMethod("Direct Clinical Phone Call")
    setEscalationNotes("")
    setEscalationConfirmed(false)
    setEscalateModalOpen(true)
  }

  // Confirm Escalation
  function handleConfirmEscalation() {
    if (!selectedOrder || !escalationConfirmed) return
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === selectedOrder.orderNumber
          ? {
              ...o,
              status: "Escalated" as const,
              escalatedTo: `${escalationClinician} via ${escalationContactMethod}`,
              escalationNotes: escalationNotes.trim() || undefined,
              auditHistory: [
                ...o.auditHistory,
                {
                  timestamp: now,
                  event: "Critical Finding Escalated",
                  user: "Sr. Tirhas Wolde",
                  role: "Senior Lab Officer",
                  notes: `Critical finding communicated to ${escalationClinician} via ${escalationContactMethod}. Remarks: ${escalationNotes || "Read-back confirmed."}`,
                },
              ],
            }
          : o
      )
    )

    setEscalateModalOpen(false)
    setNotification({
      message: `Critical alert for order ${selectedOrder.orderNumber} escalated to ${escalationClinician}. Communication logged.`,
      type: "success",
    })
    setTimeout(() => setNotification(null), 5000)
  }

  if (state === "loading") {
    return (
      <div className="rr-workspace-page">
        <div className="rr-empty-state" style={{ padding: "80px 20px" }}>
          <Icon name="clock" size={36} />
          <Heading level={2}>Loading Laboratory Review Queue...</Heading>
          <Text>Retrieving submitted findings and analytical QC records from Central Laboratory database.</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="rr-workspace-page">
      {/* ── Breadcrumb & Page Header ── */}
      <header className="rr-page-header">
        <nav className="rr-breadcrumb" aria-label="Breadcrumb">
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate("laboratory")}>
            Dashboard
          </span>
          <span>/</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("specimen-collection")}
          >
            Laboratory
          </span>
          <span>/</span>
          <span className="active">Result Review</span>
        </nav>

        <div className="rr-header-main">
          <div className="rr-title-area">
            <h1>Laboratory Result Review</h1>
            <p className="rr-title-desc">
              Review submitted laboratory findings and complete the authorized review workflow. Verify patient identity,
              inspect analytical parameters, assess critical values, and record clinical authorization.
            </p>
          </div>

          <div className="rr-header-controls">
            <span className="rr-role-pill" title="Current authenticated reviewer session">
              <Icon name="shield" size={14} />
              <span>Reviewer Role:</span>
              <strong>Senior Lab Officer</strong>
              <small style={{ color: "var(--muted)", marginLeft: "4px" }}>(Sr. Tirhas Wolde)</small>
            </span>

            <Button
              className="button secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => {
                setNotification({ message: "Review queue refreshed. All orders up to date.", type: "success" })
                setTimeout(() => setNotification(null), 3000)
              }}
            >
              <Icon name="check" size={13} /> Refresh Queue
            </Button>
          </div>
        </div>
      </header>

      {/* ── Notification Banner ── */}
      {notification && (
        <div
          className={`rr-alert-banner ${
            notification.type === "success" ? "rr-alert-success" : "rr-alert-error"
          }`}
          role="status"
        >
          <Icon name={notification.type === "success" ? "check" : "warning"} size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Queue Summary Metrics ── */}
      <section className="rr-metrics-grid" aria-label="Queue summary counts">
        <div
          className={`rr-metric-card${activeQueueView === "pending" ? " is-active" : ""}`}
          onClick={() => setActiveQueueView(activeQueueView === "pending" ? "all" : "pending")}
        >
          <div className="rr-metric-icon" style={{ background: "#fef3c7", color: "#92400e" }}>
            <Icon name="clock" size={22} />
          </div>
          <div className="rr-metric-info">
            <span className="rr-metric-value">{countPending}</span>
            <span className="rr-metric-label">Pending Review</span>
          </div>
        </div>

        <div
          className={`rr-metric-card${activeQueueView === "urgent" ? " is-active" : ""}`}
          onClick={() => setActiveQueueView(activeQueueView === "urgent" ? "all" : "urgent")}
        >
          <div className="rr-metric-icon" style={{ background: "#fee2e2", color: "var(--emergency)" }}>
            <Icon name="warning" size={22} />
          </div>
          <div className="rr-metric-info">
            <span className="rr-metric-value">{countUrgent}</span>
            <span className="rr-metric-label">Urgent Orders Awaiting</span>
          </div>
        </div>

        <div
          className={`rr-metric-card${activeQueueView === "critical" ? " is-active" : ""}`}
          onClick={() => setActiveQueueView(activeQueueView === "critical" ? "all" : "critical")}
        >
          <div className="rr-metric-icon" style={{ background: "#fef2f2", color: "#b91c1c" }}>
            <Icon name="shield" size={22} />
          </div>
          <div className="rr-metric-info">
            <span className="rr-metric-value">{countCritical}</span>
            <span className="rr-metric-label">Critical Findings</span>
          </div>
        </div>

        <div
          className={`rr-metric-card${activeQueueView === "returned" ? " is-active" : ""}`}
          onClick={() => setActiveQueueView(activeQueueView === "returned" ? "all" : "returned")}
        >
          <div className="rr-metric-icon" style={{ background: "#fff7ed", color: "#c2410c" }}>
            <Icon name="edit" size={22} />
          </div>
          <div className="rr-metric-info">
            <span className="rr-metric-value">{countReturned}</span>
            <span className="rr-metric-label">Returned for Correction</span>
          </div>
        </div>
      </section>

      {/* ── Collapsible Review Queue Table ── */}
      <section className="rr-queue-card" aria-label="Review queue table">
        <div className="rr-queue-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", margin: 0 }}>
              Orders Awaiting Supervisory Review
            </h2>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "var(--teal)",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => setShowQueueList(!showQueueList)}
            >
              {showQueueList ? "Collapse Queue ▲" : "Expand Queue ▼"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="rr-search-box">
              <span className="rr-search-icon">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                className="rr-search-input"
                placeholder="Search patient, order, test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search review orders"
              />
            </div>

            <div className="rr-filter-group">
              <select
                className="rr-select-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="All">All Departments</option>
                <option value="Adult OPD-2">Adult OPD-2</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Emergency Triage">Emergency Triage</option>
                <option value="Outpatient Clinic 2">Outpatient Clinic 2</option>
              </select>

              <select
                className="rr-select-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="All">All Priorities</option>
                <option value="STAT">STAT Only</option>
                <option value="Urgent">Urgent Only</option>
                <option value="Routine">Routine Only</option>
              </select>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--navy)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={abnormalOnly}
                  onChange={(e) => setAbnormalOnly(e.target.checked)}
                />
                Abnormal / Critical Only
              </label>
            </div>
          </div>
        </div>

        {showQueueList && (
          <div className="rr-table-wrapper">
            <table className="rr-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Patient Identification</th>
                  <th>Investigation Summary</th>
                  <th>Ordering Dept</th>
                  <th>Priority</th>
                  <th>Submitted At</th>
                  <th>Review Status</th>
                  <th>Flag</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                      No orders match the current queue criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isSelected = ord.orderNumber === selectedOrderNumber
                    const badgeClass =
                      ord.status === "Pending Review"
                        ? "rr-badge-pending"
                        : ord.status === "Approved"
                        ? "rr-badge-approved"
                        : ord.status === "Returned for Correction"
                        ? "rr-badge-returned"
                        : ord.status === "Released"
                        ? "rr-badge-released"
                        : "rr-badge-escalated"

                    return (
                      <tr
                        key={ord.orderNumber}
                        className={isSelected ? "is-selected" : ""}
                        onClick={() => handleSelectOrder(ord)}
                      >
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--navy)" }}>
                            {ord.orderNumber}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--navy)", display: "block" }}>
                            {ord.patientName}
                          </strong>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {ord.patientId} · {ord.ageGender}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#334155" }}>{ord.testName}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {ord.analytes.length} analytes tested
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px" }}>{ord.orderingDepartment}</span>
                        </td>
                        <td>
                          <span
                            className={`rr-urgency-pill ${
                              ord.priority === "STAT"
                                ? "rr-urgency-stat"
                                : ord.priority === "Urgent"
                                ? "rr-urgency-urgent"
                                : "rr-urgency-routine"
                            }`}
                          >
                            {ord.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px" }}>{ord.submissionDateTime.split("·")[1] || ord.submissionDateTime}</span>
                        </td>
                        <td>
                          <span className={`rr-status-badge ${badgeClass}`}>{ord.status}</span>
                        </td>
                        <td>
                          {ord.hasCritical ? (
                            <span className="rr-flag-pill rr-flag-critical">CRITICAL ⚠</span>
                          ) : ord.hasAbnormal ? (
                            <span className="rr-flag-pill rr-flag-high">ABNORMAL</span>
                          ) : (
                            <span className="rr-flag-pill rr-flag-normal">NORMAL</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <Button
                            className="button secondary"
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            onClick={() => handleSelectOrder(ord)}
                          >
                            Open Review
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Detailed Review Workspace ── */}
      {selectedOrder && (
        <main className="rr-detail-layout">
          {/* Center Column: Results & Context */}
          <div className="rr-review-main">
            {/* 1. Selected Order Summary Banner */}
            <section className="rr-order-banner" aria-label="Patient and order summary">
              <div className="rr-order-banner-head">
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h2 className="rr-patient-name">{selectedOrder.patientName}</h2>
                    <span className="rr-patient-mrn">{selectedOrder.patientId}</span>
                    <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "8px" }}>
                      ({selectedOrder.ageGender} · DOB: {selectedOrder.dob})
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                    Order: <strong>{selectedOrder.orderNumber}</strong> · Requisition for{" "}
                    <strong>{selectedOrder.testName}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span
                    className={`rr-urgency-pill ${
                      selectedOrder.priority === "STAT"
                        ? "rr-urgency-stat"
                        : selectedOrder.priority === "Urgent"
                        ? "rr-urgency-urgent"
                        : "rr-urgency-routine"
                    }`}
                  >
                    {selectedOrder.priority}
                  </span>
                  <span
                    className={`rr-status-badge ${
                      selectedOrder.status === "Pending Review"
                        ? "rr-badge-pending"
                        : selectedOrder.status === "Approved"
                        ? "rr-badge-approved"
                        : selectedOrder.status === "Returned for Correction"
                        ? "rr-badge-returned"
                        : selectedOrder.status === "Released"
                        ? "rr-badge-released"
                        : "rr-badge-escalated"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="rr-order-banner-grid">
                <div className="rr-banner-cell">
                  <span>Ordering Clinician</span>
                  <strong>{selectedOrder.orderingClinician}</strong>
                </div>
                <div className="rr-banner-cell">
                  <span>Department</span>
                  <strong>{selectedOrder.orderingDepartment}</strong>
                </div>
                <div className="rr-banner-cell">
                  <span>Specimen ID &amp; Type</span>
                  <strong>
                    {selectedOrder.specimenId} ({selectedOrder.specimenType})
                  </strong>
                </div>
                <div className="rr-banner-cell">
                  <span>Collection &amp; Receipt</span>
                  <strong>{selectedOrder.collectionReceiptTime}</strong>
                </div>
              </div>
            </section>

            {/* 2. Critical Alert Callout if Critical Value Present */}
            {selectedOrder.hasCritical && (
              <div className="rr-critical-alert" role="alert">
                <Icon name="shield" size={24} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
                    Action Required: Critical Laboratory Value Detected
                  </strong>
                  <span>
                    One or more analytes in this panel exceed the defined critical threshold. Immediate escalation
                    to attending physician <strong>{selectedOrder.orderingClinician}</strong> is required by Oda
                    Roba Hospital laboratory critical value reporting policy.
                  </span>
                  {selectedOrder.status !== "Escalated" && (
                    <div style={{ marginTop: "10px" }}>
                      <Button
                        className="button"
                        style={{ background: "#991b1b", borderColor: "#991b1b", fontSize: "12px", padding: "5px 12px" }}
                        onClick={handleOpenEscalate}
                      >
                        <Icon name="phone" size={13} /> Escalate Critical Finding
                      </Button>
                    </div>
                  )}
                  {selectedOrder.status === "Escalated" && (
                    <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: 600, color: "#15803d" }}>
                      Escalated to: {selectedOrder.escalatedTo}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Test Results Review Table */}
            <section className="rr-results-card" aria-label="Analytes and results review table">
              <div className="rr-results-card-head">
                <h3 className="rr-results-card-title">Submitted Analytical Results ({selectedOrder.analytes.length})</h3>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Verified by bench technologist · Reference intervals based on age/sex configuration
                </span>
              </div>

              <div className="rr-table-wrapper">
                <table className="rr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "220px" }}>Test / Analyte</th>
                      <th>Submitted Result</th>
                      <th>Unit</th>
                      <th>Configured Reference Interval</th>
                      <th>Result Flag</th>
                      <th>Validation Status</th>
                      <th>Historical Comparison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.analytes.map((analyte) => {
                      return (
                        <tr key={analyte.code}>
                          <td>
                            <strong style={{ color: "var(--navy)", display: "block" }}>
                              {analyte.name}
                            </strong>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>{analyte.code}</span>
                          </td>

                          <td>
                            <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                              {analyte.submittedResult}
                            </strong>
                          </td>

                          <td>
                            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                              {analyte.unit || "—"}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontSize: "12px", color: "#334155" }}>
                              {analyte.referenceInterval}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`rr-flag-pill ${
                                analyte.flag === "Normal"
                                  ? "rr-flag-normal"
                                  : analyte.flag === "High"
                                  ? "rr-flag-high"
                                  : analyte.flag === "Low"
                                  ? "rr-flag-low"
                                  : analyte.flag === "Critical"
                                  ? "rr-flag-critical"
                                  : "rr-flag-abnormal"
                              }`}
                            >
                              {analyte.flag === "High" && "HIGH ▲"}
                              {analyte.flag === "Low" && "LOW ▼"}
                              {analyte.flag === "Critical" && "CRITICAL ⚠"}
                              {analyte.flag === "Abnormal" && "ABNORMAL"}
                              {analyte.flag === "Normal" && "NORMAL"}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontSize: "11px", color: "var(--teal-dark)", fontWeight: 600 }}>
                              {analyte.entryStatus}
                            </span>
                          </td>

                          <td>
                            {analyte.historicalResult ? (
                              <div style={{ fontSize: "11px" }}>
                                <span>
                                  Prev: <strong>{analyte.historicalResult} {analyte.historicalUnit}</strong> ({analyte.historicalDate})
                                </span>
                                {analyte.trend && (
                                  <span style={{ marginLeft: "4px", color: analyte.trend === "Up" ? "#c2410c" : analyte.trend === "Down" ? "#0369a1" : "#16a34a", fontWeight: 700 }}>
                                    {analyte.trend === "Up" ? "↑ Up" : analyte.trend === "Down" ? "↓ Down" : "↔ Stable"}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>
                                No comparable history
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Specimen & Laboratory Context */}
            <div className="rr-collapsible-card">
              <div className="rr-collapsible-head">
                <span className="rr-collapsible-title">
                  <Icon name="flask" size={15} /> Specimen Integrity &amp; Instrument Context
                </span>
                <span style={{ fontSize: "11px", color: "var(--teal)" }}>Accession &amp; QC Verified</span>
              </div>
              <div className="rr-collapsible-body">
                <div>
                  <strong style={{ color: "var(--navy)" }}>Specimen Verification Note: </strong>
                  {selectedOrder.specimenIntegrity}
                </div>
                <div>
                  <strong style={{ color: "var(--navy)" }}>Instrument &amp; Analytical Comments: </strong>
                  {selectedOrder.laboratoryComments}
                </div>
              </div>
            </div>

            {/* 5. Return for Correction Details if Returned */}
            {selectedOrder.status === "Returned for Correction" && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#c2410c",
                  borderRadius: "8px",
                  padding: "16px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                <strong>Returned for Correction ({selectedOrder.correctionReason}):</strong>
                <p style={{ margin: "4px 0 0 0" }}>{selectedOrder.correctionDescription}</p>
              </div>
            )}
          </div>

          {/* Right Column: Reviewer Decision Panel */}
          <aside className="rr-decision-panel" aria-label="Reviewer decision and authorization panel">
            <h3 className="rr-decision-title">Reviewer Decision</h3>

            {/* Validation & Verification Checklist */}
            <div className="rr-decision-check-box">
              <div className="rr-check-row">
                <span style={{ color: "var(--muted)" }}>Analytes Inspected:</span>
                <strong style={{ color: "var(--navy)" }}>{selectedOrder.analytes.length} / {selectedOrder.analytes.length}</strong>
              </div>
              <div className="rr-check-row">
                <span style={{ color: "var(--muted)" }}>Abnormal Findings:</span>
                <strong style={{ color: selectedOrder.hasAbnormal ? "#c2410c" : "var(--navy)" }}>
                  {selectedOrder.analytes.filter((a) => a.flag !== "Normal").length}
                </strong>
              </div>
              <div className="rr-check-row">
                <span style={{ color: "var(--muted)" }}>Critical Findings:</span>
                <strong style={{ color: selectedOrder.hasCritical ? "#991b1b" : "var(--navy)" }}>
                  {selectedOrder.analytes.filter((a) => a.flag === "Critical").length}
                </strong>
              </div>
              <div className="rr-check-row">
                <span style={{ color: "var(--muted)" }}>Specimen Eligibility:</span>
                <strong style={{ color: "#15803d" }}>Eligible (Verified)</strong>
              </div>
            </div>

            {/* Internal Review Notes Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                Internal Reviewer Notes
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  minHeight: "70px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#ffffff",
                }}
                placeholder="Document internal supervisory remarks or reference rationale..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
              <Button
                className="button secondary"
                style={{ fontSize: "11px", alignSelf: "flex-end", padding: "4px 8px" }}
                onClick={handleSaveReviewNotes}
              >
                Save Notes
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="rr-decision-actions">
              {selectedOrder.status !== "Approved" && selectedOrder.status !== "Released" ? (
                <>
                  <Button
                    className="button"
                    style={{ background: "#15803d", borderColor: "#15803d", width: "100%", justifyContent: "center" }}
                    onClick={handleOpenApproval}
                  >
                    <Icon name="check" size={15} /> Approve Results
                  </Button>

                  <Button
                    className="button secondary"
                    style={{ width: "100%", justifyContent: "center", color: "#c2410c", borderColor: "#fed7aa" }}
                    onClick={handleOpenCorrection}
                  >
                    <Icon name="edit" size={14} /> Request Correction
                  </Button>
                </>
              ) : (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  <strong>Results Authorized</strong>
                  <div style={{ fontSize: "11px", marginTop: "2px" }}>
                    Approved by {selectedOrder.approvedBy || "Sr. Tirhas Wolde"} on {selectedOrder.approvedAt || selectedOrder.submissionDateTime}
                  </div>
                </div>
              )}

              {selectedOrder.hasCritical && selectedOrder.status !== "Escalated" && (
                <Button
                  className="button secondary"
                  style={{ width: "100%", justifyContent: "center", color: "#991b1b", borderColor: "#fca5a5" }}
                  onClick={handleOpenEscalate}
                >
                  <Icon name="phone" size={14} /> Escalate Critical Value
                </Button>
              )}

              <Button
                className="button secondary"
                style={{ width: "100%", justifyContent: "center", fontSize: "12px" }}
                onClick={() => setAuditModalOpen(true)}
              >
                <Icon name="clock" size={14} /> View Audit Timeline
              </Button>
            </div>
          </aside>
        </main>
      )}

      {/* ── MODAL: APPROVAL CONFIRMATION ── */}
      {approvalModalOpen && selectedOrder && (
        <div className="rr-modal-overlay" role="dialog" aria-modal="true">
          <div className="rr-modal-dialog">
            <div className="rr-modal-head">
              <h2 className="rr-modal-title">Authorize &amp; Approve Laboratory Results</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setApprovalModalOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="rr-modal-body">
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  lineHeight: "1.45",
                }}
              >
                <strong>Clinical Authorization Checklist: </strong>
                You are approving the diagnostic results for <strong>{selectedOrder.testName}</strong> for patient{" "}
                <strong>{selectedOrder.patientName} ({selectedOrder.patientId})</strong>.
              </div>

              {selectedOrder.hasCritical && (
                <div className="rr-critical-alert" style={{ margin: 0 }}>
                  <Icon name="warning" size={18} />
                  <div style={{ fontSize: "12px" }}>
                    <strong>Warning: </strong> This panel contains critical values. Please ensure critical communication
                    has been made or logged prior to authorization.
                  </div>
                </div>
              )}

              {/* Summary table of values */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", fontSize: "12px" }}>
                <table className="rr-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Analyte</th>
                      <th>Result</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.analytes.map((a) => (
                      <tr key={a.code}>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.submittedResult}</td>
                        <td>{a.unit || "—"}</td>
                        <td>{a.referenceInterval}</td>
                        <td>
                          <span
                            className={`rr-flag-pill ${
                              a.flag === "Normal"
                                ? "rr-flag-normal"
                                : a.flag === "High"
                                ? "rr-flag-high"
                                : a.flag === "Low"
                                ? "rr-flag-low"
                                : a.flag === "Critical"
                                ? "rr-flag-critical"
                                : "rr-flag-abnormal"
                            }`}
                          >
                            {a.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  background: "var(--mist)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="chk-confirm-approval"
                  checked={approvalConfirmed}
                  onChange={(e) => setApprovalConfirmed(e.target.checked)}
                  style={{ marginTop: "2px", width: "16px", height: "16px", accentColor: "var(--teal)", cursor: "pointer" }}
                />
                <label
                  htmlFor="chk-confirm-approval"
                  style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600, lineHeight: "1.4", cursor: "pointer" }}
                >
                  I confirm that all submitted findings, units, and reference intervals have been thoroughly evaluated
                  and comply with Oda Roba Hospital quality control specifications.
                </label>
              </div>
            </div>

            <div className="rr-modal-foot">
              <Button className="button secondary" onClick={() => setApprovalModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "#15803d", borderColor: "#15803d" }}
                disabled={!approvalConfirmed}
                onClick={handleConfirmApproval}
              >
                <Icon name="check" size={14} /> Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REQUEST CORRECTION ── */}
      {correctionModalOpen && selectedOrder && (
        <div className="rr-modal-overlay" role="dialog" aria-modal="true">
          <div className="rr-modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="rr-modal-head">
              <h2 className="rr-modal-title" style={{ color: "#c2410c" }}>
                Request Result Correction
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setCorrectionModalOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="rr-modal-body">
              <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
                Returning this order to the result-entry bench will flag the order for correction. The submitted
                values will remain visible to the bench technologist for amendment.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Primary Correction Reason<span style={{ color: "var(--emergency)" }}>*</span>
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#ffffff",
                    outline: "none",
                  }}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                >
                  <option value="Missing required result">Missing required result or parameter</option>
                  <option value="Incorrect unit">Incorrect unit or measurement scale</option>
                  <option value="Inconsistent test information">Inconsistent test information / unexpected discrepancy</option>
                  <option value="Invalid result format">Invalid result format or transcription error</option>
                  <option value="Insufficient documentation">Insufficient documentation / fasting confirmation missing</option>
                  <option value="Other">Other documented reason</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Affected Parameter / Analyte
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#ffffff",
                    outline: "none",
                  }}
                  value={correctionAnalyte}
                  onChange={(e) => setCorrectionAnalyte(e.target.value)}
                >
                  <option value="All Analytes">All Analytes in Panel</option>
                  {selectedOrder.analytes.map((a) => (
                    <option key={a.code} value={a.name}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Specific Description / Remediation Guidance<span style={{ color: "var(--emergency)" }}>*</span>
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    minHeight: "80px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Detail the issue and instructions for the bench technologist..."
                  value={correctionDescription}
                  onChange={(e) => setCorrectionDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="rr-modal-foot">
              <Button className="button secondary" onClick={() => setCorrectionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "#c2410c", borderColor: "#c2410c" }}
                onClick={handleConfirmCorrection}
              >
                Send Correction Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ESCALATE CRITICAL FINDING ── */}
      {escalateModalOpen && selectedOrder && (
        <div className="rr-modal-overlay" role="dialog" aria-modal="true">
          <div className="rr-modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="rr-modal-head">
              <h2 className="rr-modal-title" style={{ color: "#991b1b" }}>
                Escalate Critical Finding
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setEscalateModalOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="rr-modal-body">
              <div className="rr-critical-alert" style={{ margin: 0 }}>
                <Icon name="shield" size={20} />
                <div style={{ fontSize: "12px" }}>
                  <strong>Critical Finding: </strong>
                  {selectedOrder.analytes.filter((a) => a.flag === "Critical").map((a) => `${a.name}: ${a.submittedResult} ${a.unit}`).join("; ")}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Contacted Clinician
                </label>
                <input
                  type="text"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                  value={escalationClinician}
                  onChange={(e) => setEscalationClinician(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Communication Channel
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#ffffff",
                    boxSizing: "border-box",
                  }}
                  value={escalationContactMethod}
                  onChange={(e) => setEscalationContactMethod(e.target.value)}
                >
                  <option value="Direct Clinical Phone Call">Direct Clinical Phone Call (Verified verbal read-back)</option>
                  <option value="Hospital Urgent Pager Alert">Hospital Urgent Pager Alert</option>
                  <option value="In-Person Ward Communication">In-Person Ward Communication</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--navy)" }}>
                  Escalation Remarks / Read-back Confirmation
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    minHeight: "70px",
                    boxSizing: "border-box",
                  }}
                  placeholder="Record clinician response and read-back confirmation timestamp..."
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                />
              </div>

              <div
                style={{
                  background: "var(--mist)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  id="chk-escalate-confirmed"
                  checked={escalationConfirmed}
                  onChange={(e) => setEscalationConfirmed(e.target.checked)}
                  style={{ marginTop: "2px", width: "16px", height: "16px", accentColor: "var(--emergency)" }}
                />
                <label
                  htmlFor="chk-escalate-confirmed"
                  style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600, cursor: "pointer" }}
                >
                  I certify that the critical value has been verbally communicated to and acknowledged by authorized clinical staff.
                </label>
              </div>
            </div>

            <div className="rr-modal-foot">
              <Button className="button secondary" onClick={() => setEscalateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "#991b1b", borderColor: "#991b1b" }}
                disabled={!escalationConfirmed}
                onClick={handleConfirmEscalation}
              >
                Record Escalation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AUDIT TIMELINE ── */}
      {auditModalOpen && selectedOrder && (
        <div className="rr-modal-overlay" role="dialog" aria-modal="true">
          <div className="rr-modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="rr-modal-head">
              <h2 className="rr-modal-title">Audit Timeline: {selectedOrder.orderNumber}</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setAuditModalOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="rr-modal-body">
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                  {selectedOrder.patientName} ({selectedOrder.patientId})
                </strong>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Order: {selectedOrder.orderNumber} · {selectedOrder.testName}
                </div>
              </div>

              <div className="rr-timeline">
                {selectedOrder.auditHistory.map((step, idx) => (
                  <div key={idx} className="rr-timeline-step">
                    <span className="rr-timeline-dot" />
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{step.event}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {step.timestamp} · {step.user} ({step.role})
                    </div>
                    {step.notes && (
                      <div style={{ fontSize: "12px", color: "var(--teal-dark)", marginTop: "2px" }}>
                        {step.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rr-modal-foot">
              <Button className="button secondary" onClick={() => setAuditModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
