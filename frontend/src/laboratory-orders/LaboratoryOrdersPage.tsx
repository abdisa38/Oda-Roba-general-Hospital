// ORHIMS — Laboratory Orders Component (Phase 05, Prompt 30)

import { useState, useMemo } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  sampleLabPatient,
  hospitalLabCatalogue,
  initialLabRequests,
  type LaboratoryRequest,
  type LabCatalogueTest,
  type LabPriority,
  type LabRequestStatus,
} from "./model"
import "./laboratory-orders.css"

interface LaboratoryOrdersPageProps {
  state?: string
  permissions: Set<string>
  onNavigate: (destination: string) => void
  readOnly?: boolean
}

export default function LaboratoryOrdersPage({
  permissions,
  onNavigate,
  readOnly = false,
}: LaboratoryOrdersPageProps) {
  // Clinicians & doctors have order authoring permission
  const canOrderLabs = permissions.has("consultations") || permissions.has("orders") || permissions.has("triage")

  const patient = sampleLabPatient

  // Requests state
  const [requests, setRequests] = useState<LaboratoryRequest[]>(initialLabRequests)
  const [activeFilter, setActiveFilter] = useState<"All" | "Result" | "In Progress" | "Pending" | "Cancelled">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Modals and view state
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [detailsRequest, setDetailsRequest] = useState<LaboratoryRequest | null>(null)
  const [viewingResultRequest, setViewingResultRequest] = useState<LaboratoryRequest | null>(null)
  const [trackingRequest, setTrackingRequest] = useState<LaboratoryRequest | null>(null)
  const [requestToCancel, setRequestToCancel] = useState<LaboratoryRequest | null>(null)
  const [cancellationReason, setCancellationReason] = useState("Change in clinical presentation or management plan")

  // Create request multi-step workflow state
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1)
  const [catSearchQuery, setCatSearchQuery] = useState("")
  const [catCategory, setCatCategory] = useState<string>("All")
  const [selectedTests, setSelectedTests] = useState<LabCatalogueTest[]>([])
  const [priority, setPriority] = useState<LabPriority>("Routine")
  const [clinicalIndication, setClinicalIndication] = useState("")
  const [notesForLab, setNotesForLab] = useState("")
  const [collectionTiming, setCollectionTiming] = useState("Immediate (Clinic collection)")
  const [validationError, setValidationError] = useState<string | null>(null)

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Result"
          ? req.status === "Result Available"
          : activeFilter === "In Progress"
          ? req.status === "In Progress"
          : activeFilter === "Pending"
          ? req.status === "Requested" ||
            req.status === "Accepted" ||
            req.status === "Specimen Collection Pending" ||
            req.status === "Specimen Collected"
          : req.status === "Cancelled"

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.tests.some(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        )

      return matchFilter && matchSearch
    })
  }, [requests, activeFilter, searchQuery])

  // Count summaries
  const countResults = requests.filter((r) => r.status === "Result Available").length
  const countInProgress = requests.filter((r) => r.status === "In Progress").length
  const countPending = requests.filter(
    (r) =>
      r.status === "Requested" ||
      r.status === "Accepted" ||
      r.status === "Specimen Collection Pending" ||
      r.status === "Specimen Collected"
  ).length
  const countCancelled = requests.filter((r) => r.status === "Cancelled").length

  // Filter catalogue items for selection
  const filteredCatalogue = useMemo(() => {
    return hospitalLabCatalogue.filter((item) => {
      const matchCat = catCategory === "All" || item.category === catCategory
      const q = catSearchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [catCategory, catSearchQuery])

  // Open Create Request Modal
  function handleOpenCreate() {
    setSelectedTests([])
    setCreateStep(1)
    setCatSearchQuery("")
    setCatCategory("All")
    setPriority("Routine")
    setClinicalIndication("")
    setNotesForLab("")
    setCollectionTiming("Immediate (Clinic collection)")
    setValidationError(null)
    setShowCreateModal(true)
  }

  // Toggle test in selection tray
  function handleToggleTest(test: LabCatalogueTest) {
    if (selectedTests.some((t) => t.id === test.id)) {
      setSelectedTests((prev) => prev.filter((t) => t.id !== test.id))
      setValidationError(null)
    } else {
      setSelectedTests((prev) => [...prev, test])
      setValidationError(null)
    }
  }

  // Proceed from Step 1 to Step 2
  function handleProceedToDetails() {
    if (selectedTests.length === 0) {
      setValidationError("Please select at least one laboratory test to include in this requisition.")
      return
    }
    setValidationError(null)
    setCreateStep(2)
  }

  // Proceed from Step 2 to Step 3 (Review)
  function handleProceedToReview() {
    if (!clinicalIndication.trim()) {
      setValidationError("Please enter a clinical indication or diagnostic question for the laboratory team.")
      return
    }
    setValidationError(null)
    setCreateStep(3)
  }

  // Submit Requisition or Save as Draft
  function handleSaveRequest(targetStatus: "Draft" | "Requested") {
    if (selectedTests.length === 0) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    const newReq: LaboratoryRequest = {
      id: `LR-2026-0${186 + requests.length + 1}`,
      encounterId: patient.encounterId,
      patientId: patient.patientId,
      tests: selectedTests,
      priority,
      clinicalIndication: clinicalIndication.trim(),
      notesForLab: notesForLab.trim() || undefined,
      requestedCollectionTiming: collectionTiming,
      orderedBy: patient.attendingDoctor,
      orderRole: "Consulting Physician",
      orderedDate: patient.encounterDate,
      orderedTime: timeStr,
      status: targetStatus,
      history: [
        {
          timestamp: timeStr,
          status: targetStatus,
          actor: patient.attendingDoctor,
          note: targetStatus === "Requested" ? "Order submitted to Central Diagnostic Laboratory" : "Draft requisition saved",
        },
      ],
    }

    setRequests((prev) => [newReq, ...prev])
    setShowCreateModal(false)
    setSuccessNotice(
      targetStatus === "Requested"
        ? `Laboratory requisition ${newReq.id} submitted for ${selectedTests.map((t) => t.code).join(", ")}.`
        : `Laboratory request draft saved.`
    )
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Confirm cancellation
  function handleConfirmCancellation() {
    if (!requestToCancel) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestToCancel.id
          ? {
              ...r,
              status: "Cancelled" as const,
              cancellationReason,
              cancelledBy: patient.attendingDoctor,
              cancelledAt: `${patient.encounterDate} · ${timeStr}`,
              history: [
                ...r.history,
                {
                  timestamp: timeStr,
                  status: "Cancelled" as const,
                  actor: patient.attendingDoctor,
                  note: `Cancelled: ${cancellationReason}`,
                },
              ],
            }
          : r
      )
    )

    setRequestToCancel(null)
    setSuccessNotice(`Request ${requestToCancel.id} cancelled. Central Laboratory notified.`)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Doctor acknowledges report
  function handleAcknowledgeResult(req: LaboratoryRequest) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id && r.resultReport
          ? {
              ...r,
              resultReport: {
                ...r.resultReport,
                reviewedByDoctor: patient.attendingDoctor,
                reviewedAt: `${patient.encounterDate} · ${timeStr}`,
              },
            }
          : r
      )
    )

    setViewingResultRequest((prev) =>
      prev && prev.id === req.id && prev.resultReport
        ? {
            ...prev,
            resultReport: {
              ...prev.resultReport,
              reviewedByDoctor: patient.attendingDoctor,
              reviewedAt: `${patient.encounterDate} · ${timeStr}`,
            },
          }
        : prev
    )

    setSuccessNotice(`Laboratory report for ${req.id} signed and verified by ${patient.attendingDoctor}.`)
    setTimeout(() => setSuccessNotice(null), 3500)
  }

  if (!canOrderLabs) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  return (
    <div className="lab-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="lab-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("consultations")}>Doctor Dashboard</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("clinical-workspace")}>Clinical Workspace</Button>
        <Icon name="chevron" size={11} />
        <strong>Laboratory Orders</strong>
      </nav>

      {/* ── Patient Identity & Active Encounter Banner ── */}
      <div className="lab-patient-banner">
        <div className="lab-banner-top">
          <div className="lab-patient-info">
            <div className="lab-avatar">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="lab-patient-name-row">
                <h1 className="lab-patient-name">{patient.name}</h1>
                {patient.amharicName && (
                  <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>
                    ({patient.amharicName})
                  </span>
                )}
                <span className="lab-mrn-chip">{patient.patientId}</span>
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
                  Diagnostic Services
                </span>
              </div>
              <div className="lab-patient-meta">
                <span>
                  Sex: <strong>{patient.sex}</strong>
                </span>
                <span>·</span>
                <span>
                  Age: <strong>{patient.age}</strong> (DOB: {patient.dob})
                </span>
                <span>·</span>
                <span>
                  Attending Doctor: <strong>{patient.attendingDoctor}</strong>
                </span>
                <span>·</span>
                <span>
                  Encounter: <strong>{patient.encounterId}</strong> ({patient.clinic})
                </span>
              </div>
            </div>
          </div>

          <div className="lab-banner-actions">
            <Button
              className="button secondary"
              onClick={() => onNavigate("clinical-workspace")}
            >
              <Icon name="arrow" size={14} />
              Return to Clinical Workspace
            </Button>
            <Button
              className="button"
              onClick={handleOpenCreate}
              disabled={readOnly || patient.encounterStatus === "Finalized"}
            >
              <Icon name="flask" size={15} />
              New Laboratory Request
            </Button>
          </div>
        </div>

        {/* ── Context Strip: Active Diagnoses & Allergies ── */}
        <div className="lab-context-strip">
          <div className="lab-context-box">
            <div>
              <div className="lab-context-label">
                <Icon name="info" size={13} />
                Current Encounter Diagnoses
              </div>
              <div className="lab-context-text">
                {patient.diagnoses.map((d) => `${d.name} (${d.code})`).join(" · ")}
              </div>
            </div>
            <button
              type="button"
              className="rx-context-btn"
              onClick={() => onNavigate("diagnosis-management")}
            >
              Manage Diagnoses
            </button>
          </div>

          <div className="lab-context-box">
            <div>
              <div className="lab-context-label">
                <Icon name="shield" size={13} />
                Clinical Alerts
              </div>
              <div className="lab-context-text" style={{ color: "#7f1d1d" }}>
                {patient.allergiesAlert || "No critical safety alerts recorded"}
              </div>
            </div>
            <button
              type="button"
              className="rx-context-btn"
              onClick={() => onNavigate("prescriptions")}
            >
              Prescriptions &amp; Meds
            </button>
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successNotice && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderLeft: "4px solid #10b981",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
          role="status"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon name="check" size={18} />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* ── Controls Bar: Title & Status Filter Tabs ── */}
      <div className="lab-controls-bar">
        <div>
          <Heading level={2} style={{ fontSize: "18px", color: "var(--navy)", margin: 0 }}>
            Laboratory Requests for This Encounter
          </Heading>
          <Text style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0 0" }}>
            Order diagnostic tests, monitor specimen accessioning, and review authorized laboratory results.
          </Text>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search box */}
          <div style={{ position: "relative", width: "200px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              placeholder="Filter by test or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          {(activeFilter !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter("All")
                setSearchQuery("")
              }}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "12px",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          )}

          {/* View mode toggle */}
          <div className="lab-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`lab-toggle-btn${viewMode === "table" ? " active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
            <button
              type="button"
              className={`lab-toggle-btn${viewMode === "cards" ? " active" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              Card View
            </button>
          </div>

          {/* Filter tabs */}
          <div className="lab-filter-group" role="tablist" aria-label="Laboratory request status filters">
            <button
              type="button"
              className={`lab-filter-tab${activeFilter === "All" ? " active" : ""}`}
              onClick={() => setActiveFilter("All")}
            >
              All <span className="lab-count-badge">{requests.length}</span>
            </button>
            <button
              type="button"
              className={`lab-filter-tab${activeFilter === "Result" ? " active" : ""}`}
              onClick={() => setActiveFilter("Result")}
            >
              Result Available <span className="lab-count-badge">{countResults}</span>
            </button>
            <button
              type="button"
              className={`lab-filter-tab${activeFilter === "In Progress" ? " active" : ""}`}
              onClick={() => setActiveFilter("In Progress")}
            >
              In Progress <span className="lab-count-badge">{countInProgress}</span>
            </button>
            <button
              type="button"
              className={`lab-filter-tab${activeFilter === "Pending" ? " active" : ""}`}
              onClick={() => setActiveFilter("Pending")}
            >
              Pending Collection <span className="lab-count-badge">{countPending}</span>
            </button>
            <button
              type="button"
              className={`lab-filter-tab${activeFilter === "Cancelled" ? " active" : ""}`}
              onClick={() => setActiveFilter("Cancelled")}
            >
              Cancelled <span className="lab-count-badge">{countCancelled}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Existing Requests List ── */}
      {filteredRequests.length === 0 ? (
        <div className="lab-empty-state">
          <Icon name="flask" size={32} />
          <h3>No Laboratory Requests Found</h3>
          <p>
            {activeFilter === "All"
              ? "No laboratory investigations have been requested for this patient encounter yet."
              : `No laboratory requests match the selected "${activeFilter}" filter.`}
          </p>
          {!readOnly && (
            <Button className="button" onClick={handleOpenCreate}>
              <Icon name="flask" size={14} /> New Laboratory Request
            </Button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="lab-table-container">
          <table className="lab-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Requisition ID</th>
                <th>Investigation(s)</th>
                <th style={{ width: "120px" }}>Priority</th>
                <th style={{ width: "200px" }}>Specimen Required</th>
                <th style={{ width: "140px" }}>Ordered Date</th>
                <th style={{ width: "150px" }}>Status</th>
                <th style={{ width: "210px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const statusClass = req.status.toLowerCase().replace(/\s+/g, "-")
                return (
                  <tr key={req.id}>
                    <td>
                      <span className="lab-req-id">{req.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--navy)", display: "block", fontSize: "14px" }}>
                        {req.tests.map((t) => t.name).join(" + ")}
                      </strong>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {req.clinicalIndication}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`lab-priority-pill ${
                          req.priority === "Urgent (STAT)" ? "lab-priority-urgent" : "lab-priority-routine"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--navy)" }}>
                        {Array.from(new Set(req.tests.map((t) => t.specimenType))).join("; ")}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--navy)", display: "block" }}>
                        {req.orderedDate}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>{req.orderedTime}</span>
                    </td>
                    <td>
                      <span className={`lab-status-badge lab-status-${statusClass}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {req.status === "Result Available" ? (
                          <Button
                            className="button"
                            style={{ fontSize: "11px", padding: "5px 10px", background: "#15803d", borderColor: "#15803d" }}
                            onClick={() => setViewingResultRequest(req)}
                          >
                            <Icon name="check" size={12} /> Results
                          </Button>
                        ) : (
                          <Button
                            className="button secondary"
                            style={{ fontSize: "11px", padding: "5px 8px" }}
                            onClick={() => setTrackingRequest(req)}
                          >
                            <Icon name="clock" size={12} /> Track
                          </Button>
                        )}
                        <Button
                          className="button secondary"
                          style={{ fontSize: "11px", padding: "5px 8px" }}
                          onClick={() => setDetailsRequest(req)}
                        >
                          Details
                        </Button>
                        {(req.status === "Requested" ||
                          req.status === "Accepted" ||
                          req.status === "Specimen Collection Pending") &&
                          !readOnly && (
                            <Button
                              className="button secondary"
                              style={{
                                fontSize: "11px",
                                padding: "5px 8px",
                                color: "var(--emergency)",
                                borderColor: "#fca5a5",
                              }}
                              onClick={() => setRequestToCancel(req)}
                            >
                              Cancel
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="lab-requests-list">
          {filteredRequests.map((req) => {
            const statusClass = req.status.toLowerCase().replace(/\s+/g, "-")
            return (
              <article key={req.id} className={`lab-request-card is-${statusClass}`}>
                <div className="lab-card-head">
                  <div className="lab-title-group">
                    <span className="lab-req-id">{req.id}</span>
                    <h3 className="lab-tests-heading">
                      {req.tests.map((t) => t.name).join(" + ")}
                    </h3>
                    <span
                      className={`lab-priority-pill ${
                        req.priority === "Urgent (STAT)" ? "lab-priority-urgent" : "lab-priority-routine"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  <span className={`lab-status-badge lab-status-${statusClass}`}>
                    {req.status === "Result Available" && <Icon name="check" size={12} />}
                    {req.status === "In Progress" && <Icon name="clock" size={12} />}
                    {req.status === "Cancelled" && <Icon name="close" size={12} />}
                    {req.status}
                  </span>
                </div>

                {/* Tests & Specimen summary pills */}
                <div className="lab-tests-container">
                  {req.tests.map((test) => (
                    <div key={test.id} className="lab-test-pill">
                      <Icon name="flask" size={13} />
                      <div>
                        <strong>{test.name}</strong> <span>({test.code})</span>
                        <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                          Specimen: {test.specimenType}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specs Grid */}
                <div className="lab-specs-grid">
                  <div className="lab-spec-item">
                    <span className="lab-spec-label">Order Date &amp; Time</span>
                    <span className="lab-spec-value">
                      {req.orderedDate} · {req.orderedTime}
                    </span>
                  </div>
                  <div className="lab-spec-item">
                    <span className="lab-spec-label">Ordering Clinician</span>
                    <span className="lab-spec-value">{req.orderedBy}</span>
                  </div>
                  <div className="lab-spec-item">
                    <span className="lab-spec-label">Collection Timing</span>
                    <span className="lab-spec-value">{req.requestedCollectionTiming}</span>
                  </div>
                  <div className="lab-spec-item">
                    <span className="lab-spec-label">Specimen Status</span>
                    <span className="lab-spec-value">
                      {req.specimenCollectedAt ? `Collected (${req.specimenCollectedAt})` : "Collection Pending"}
                    </span>
                  </div>
                </div>

                {/* Clinical Indication box */}
                <div className="lab-indication-box">
                  <div className="lab-indication-title">
                    <Icon name="info" size={12} />
                    Clinical Indication
                  </div>
                  <p className="lab-indication-text">{req.clinicalIndication}</p>
                  {req.notesForLab && (
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px", fontStyle: "italic" }}>
                      Notes for Lab: {req.notesForLab}
                    </div>
                  )}
                </div>

                {/* Result Snapshot Banner if ready */}
                {req.status === "Result Available" && req.resultReport && (
                  <div className="lab-result-snapshot">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon name="check" size={16} />
                      <div className="lab-result-snapshot-text">
                        <strong>Official Findings:</strong> {req.resultReport.findingsSummary}
                        {req.resultReport.reviewedByDoctor && (
                          <span style={{ display: "block", fontSize: "11px", color: "#15803d", marginTop: "2px" }}>
                            Verified by {req.resultReport.reviewedByDoctor} on {req.resultReport.reviewedAt}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      className="button"
                      style={{ fontSize: "12px", padding: "6px 14px", background: "#15803d", borderColor: "#15803d" }}
                      onClick={() => setViewingResultRequest(req)}
                    >
                      <Icon name="shield" size={13} />
                      {req.resultReport.reviewedByDoctor ? "View Verified Report" : "Review Results"}
                    </Button>
                  </div>
                )}

                {/* Cancellation notice if cancelled */}
                {req.status === "Cancelled" && req.cancellationReason && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    <strong>Requisition Cancelled:</strong> {req.cancellationReason} · Cancelled by{" "}
                    {req.cancelledBy || "Doctor"} ({req.cancelledAt || req.orderedDate})
                  </div>
                )}

                {/* Card Foot with actions */}
                <div className="lab-card-foot">
                  <div className="lab-meta-prescriber">
                    Requisition ID: <strong>{req.id}</strong> · Destination: Central Diagnostic Laboratory
                  </div>

                  <div className="lab-actions-group">
                    <Button
                      className="button secondary"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                      onClick={() => setDetailsRequest(req)}
                    >
                      Details
                    </Button>

                    <Button
                      className="button secondary"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                      onClick={() => setTrackingRequest(req)}
                    >
                      <Icon name="clock" size={13} />
                      Track Progress
                    </Button>

                    {req.status === "Result Available" && (
                      <Button
                        className="button secondary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => setViewingResultRequest(req)}
                      >
                        <Icon name="edit" size={13} />
                        View Full Report
                      </Button>
                    )}

                    {(req.status === "Requested" ||
                      req.status === "Accepted" ||
                      req.status === "Specimen Collection Pending") &&
                      !readOnly && (
                        <Button
                          className="button secondary"
                          style={{
                            fontSize: "12px",
                            padding: "6px 12px",
                            color: "var(--emergency)",
                            borderColor: "#fca5a5",
                          }}
                          onClick={() => setRequestToCancel(req)}
                        >
                          <Icon name="close" size={13} />
                          Cancel Request
                        </Button>
                      )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ── CREATE NEW LABORATORY REQUEST MULTI-STEP MODAL ── */}
      {showCreateModal && (
        <div className="lab-modal-overlay" role="dialog" aria-modal="true">
          <div className="lab-modal-dialog">
            <div className="lab-modal-head">
              <h2 className="lab-modal-title">New Laboratory Requisition</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close dialog"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="lab-step-nav">
              <div
                className={`lab-step-item${
                  createStep === 1 ? " active" : createStep > 1 ? " completed" : ""
                }`}
              >
                <span className="lab-step-num">1</span>
                <span>Select Tests ({selectedTests.length})</span>
              </div>
              <div
                className={`lab-step-item${
                  createStep === 2 ? " active" : createStep > 2 ? " completed" : ""
                }`}
              >
                <span className="lab-step-num">2</span>
                <span>Clinical Indication</span>
              </div>
              <div className={`lab-step-item${createStep === 3 ? " active" : ""}`}>
                <span className="lab-step-num">3</span>
                <span>Review &amp; Submit</span>
              </div>
            </div>

            <div className="lab-modal-body">
              {validationError && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fca5a5",
                    color: "var(--emergency)",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Icon name="warning" size={16} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ── STEP 1: Search & Select Tests ── */}
              {createStep === 1 && (
                <div>
                  {/* Selected Tests Tray */}
                  {selectedTests.length > 0 && (
                    <div className="lab-selected-tray">
                      <div className="lab-tray-title">
                        <span>Selected Tests for This Requisition</span>
                        <span>{selectedTests.length} item(s)</span>
                      </div>
                      <div className="lab-tray-items">
                        {selectedTests.map((t) => (
                          <div key={t.id} className="lab-tray-chip">
                            <strong>{t.name}</strong>
                            <span>({t.code})</span>
                            <button
                              type="button"
                              onClick={() => handleToggleTest(t)}
                              title="Remove test"
                            >
                              <Icon name="close" size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="lab-search-input-wrap">
                    <span className="lab-search-icon">
                      <Icon name="search" size={16} />
                    </span>
                    <input
                      type="text"
                      className="lab-search-input"
                      placeholder="Search test by name, panel, code (e.g., CBC, Malaria, RFT, AFB)..."
                      value={catSearchQuery}
                      onChange={(e) => setCatSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="lab-cat-pill-row">
                    {[
                      "All",
                      "Hematology",
                      "Parasitology",
                      "Clinical Chemistry",
                      "Microbiology / TB",
                      "Serology",
                      "Urinalysis",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`lab-cat-filter-btn${catCategory === cat ? " active" : ""}`}
                        onClick={() => setCatCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Catalogue List */}
                  <div className="lab-cat-list">
                    {filteredCatalogue.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                        No diagnostic tests match "{catSearchQuery}".
                      </div>
                    ) : (
                      filteredCatalogue.map((item) => {
                        const isSelected = selectedTests.some((t) => t.id === item.id)
                        return (
                          <div
                            key={item.id}
                            className={`lab-cat-item-card${isSelected ? " is-selected" : ""}`}
                            onClick={() => handleToggleTest(item)}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <strong style={{ fontSize: "15px", color: "var(--navy)" }}>
                                  {item.name}
                                </strong>
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontSize: "11px",
                                    color: "var(--teal)",
                                    background: "var(--mist)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--muted)",
                                    border: "1px solid var(--border)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item.category}
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                                Required Specimen: <strong>{item.specimenType}</strong> · TAT:{" "}
                                {item.standardTurnaround}
                              </div>
                            </div>

                            <Button
                              className={`button ${isSelected ? "primary" : "secondary"}`}
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              {isSelected ? (
                                <>
                                  <Icon name="check" size={13} /> Selected
                                </>
                              ) : (
                                "Add Test"
                              )}
                            </Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Clinical Indication & Timing ── */}
              {createStep === 2 && (
                <div>
                  <div
                    style={{
                      background: "#f0fdfa",
                      border: "1px solid #99f6e4",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--teal)", textTransform: "uppercase" }}>
                      Included Investigations ({selectedTests.length})
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                      {selectedTests.map((t) => (
                        <span
                          key={t.id}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #99f6e4",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--navy)",
                          }}
                        >
                          {t.name} ({t.code})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rx-form-grid">
                    <div className="rx-form-group">
                      <label className="rx-label">
                        Request Priority<span className="required">*</span>
                      </label>
                      <select
                        className="rx-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as LabPriority)}
                      >
                        <option value="Routine">Routine Outpatient</option>
                        <option value="Urgent (STAT)">Urgent (STAT) — Immediate Processing</option>
                      </select>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Requested Collection Timing<span className="required">*</span>
                      </label>
                      <select
                        className="rx-select"
                        value={collectionTiming}
                        onChange={(e) => setCollectionTiming(e.target.value)}
                      >
                        <option value="Immediate (Clinic collection)">Immediate (Clinic collection)</option>
                        <option value="Routine OPD Phlebotomy">Routine OPD Phlebotomy</option>
                        <option value="Next Morning Fasting Sample">Next Morning Fasting Sample</option>
                      </select>
                    </div>

                    <div className="rx-form-group full-width">
                      <label className="rx-label">
                        Clinical Indication / Diagnostic Question<span className="required">*</span>
                      </label>
                      <textarea
                        className="rx-textarea"
                        value={clinicalIndication}
                        onChange={(e) => setClinicalIndication(e.target.value)}
                        placeholder="State patient symptoms, clinical reason for investigation, and specific questions for the lab team..."
                      />
                    </div>

                    <div className="rx-form-group full-width">
                      <label className="rx-label">Additional Instructions for Laboratory Staff</label>
                      <textarea
                        className="rx-textarea"
                        style={{ minHeight: "65px" }}
                        value={notesForLab}
                        onChange={(e) => setNotesForLab(e.target.value)}
                        placeholder="e.g. Patient on antibiotic therapy; sample taken from peripheral IV cannula..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review Requisition Summary ── */}
              {createStep === 3 && (
                <div>
                  <div className="rx-review-card">
                    <h3 className="rx-review-title">Laboratory Requisition Summary</h3>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Patient</span>
                      <span className="rx-review-val">
                        {patient.name} ({patient.patientId})
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Encounter &amp; Clinic</span>
                      <span className="rx-review-val">
                        {patient.encounterId} · {patient.clinic}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Selected Tests</span>
                      <span className="rx-review-val">
                        {selectedTests.map((t) => `${t.name} [${t.code}]`).join(", ")}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Specimen Requirements</span>
                      <span className="rx-review-val">
                        {Array.from(new Set(selectedTests.map((t) => t.specimenType))).join("; ")}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Priority &amp; Timing</span>
                      <span className="rx-review-val">
                        {priority} · {collectionTiming}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Clinical Indication</span>
                      <span className="rx-review-val">{clinicalIndication}</span>
                    </div>

                    {notesForLab && (
                      <div className="rx-review-row">
                        <span className="rx-review-label">Laboratory Notes</span>
                        <span className="rx-review-val">{notesForLab}</span>
                      </div>
                    )}

                    <div className="rx-review-row" style={{ borderBottom: "none" }}>
                      <span className="rx-review-label">Ordering Physician</span>
                      <span className="rx-review-val">
                        {patient.attendingDoctor} (Consulting Physician)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Foot Controls */}
            <div className="lab-modal-foot">
              {createStep === 1 && (
                <>
                  <Button className="button secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="button"
                    onClick={handleProceedToDetails}
                    disabled={selectedTests.length === 0}
                  >
                    Next: Clinical Details ({selectedTests.length}) <Icon name="arrow" size={14} />
                  </Button>
                </>
              )}

              {createStep === 2 && (
                <>
                  <Button className="button secondary" onClick={() => setCreateStep(1)}>
                    Back to Test Selection
                  </Button>
                  <Button className="button" onClick={handleProceedToReview}>
                    Review Requisition <Icon name="arrow" size={14} />
                  </Button>
                </>
              )}

              {createStep === 3 && (
                <>
                  <Button className="button secondary" onClick={() => setCreateStep(2)}>
                    Edit Details
                  </Button>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      className="button secondary"
                      onClick={() => handleSaveRequest("Draft")}
                    >
                      Save Draft
                    </Button>
                    <Button className="button" onClick={() => handleSaveRequest("Requested")}>
                      <Icon name="check" size={14} /> Submit to Laboratory
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW OFFICIAL LABORATORY REPORT MODAL ── */}
      {viewingResultRequest && viewingResultRequest.resultReport && (
        <div className="lab-modal-overlay" role="dialog" aria-modal="true">
          <div className="lab-modal-dialog" style={{ maxWidth: "800px" }}>
            <div className="lab-modal-head">
              <h2 className="lab-modal-title">Official Laboratory Diagnostic Report</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setViewingResultRequest(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="lab-modal-body">
              <div className="lab-report-sheet">
                <div className="lab-report-head">
                  <h3 style={{ margin: 0, fontSize: "17px", color: "var(--navy)" }}>
                    ODA ROBA GENERAL HOSPITAL
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                    Central Diagnostic Laboratory Department · Bale Robe, Ethiopia
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--teal-dark)", marginTop: "6px", fontWeight: 700 }}>
                    INVESTIGATION REPORT: {viewingResultRequest.tests.map((t) => t.name).join(", ")}
                  </div>
                </div>

                {/* Patient Header Block */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "12px",
                    background: "var(--mist)",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    Patient: <strong>{patient.name}</strong>
                  </div>
                  <div>
                    MRN: <strong>{patient.patientId}</strong>
                  </div>
                  <div>
                    Encounter: <strong>{patient.encounterId}</strong>
                  </div>
                  <div>
                    Requisition ID: <strong>{viewingResultRequest.id}</strong>
                  </div>
                  <div>
                    Ordering Doctor: <strong>{viewingResultRequest.orderedBy}</strong>
                  </div>
                  <div>
                    Report Date: <strong>{viewingResultRequest.resultReport.reportedAt}</strong>
                  </div>
                </div>

                {/* Results Table */}
                <table className="lab-report-table">
                  <thead>
                    <tr>
                      <th>Test Parameter</th>
                      <th>Observed Value</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Status Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingResultRequest.resultReport.results.map((res, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{res.parameter}</strong>
                        </td>
                        <td style={{ fontWeight: 700 }}>{res.value}</td>
                        <td style={{ color: "var(--muted)" }}>{res.unit}</td>
                        <td style={{ color: "var(--muted)" }}>{res.referenceRange}</td>
                        <td>
                          {res.flag === "High" && <span className="lab-flag-high">▲ High</span>}
                          {res.flag === "Low" && <span className="lab-flag-low">▼ Low</span>}
                          {res.flag === "Normal" && <span className="lab-flag-normal">Normal</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Findings summary */}
                <div
                  style={{
                    background: "#f8fafb",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    marginTop: "16px",
                  }}
                >
                  <strong style={{ fontSize: "12px", color: "var(--navy)", display: "block", marginBottom: "4px" }}>
                    Laboratory Findings &amp; Technologist Remarks:
                  </strong>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--navy)", lineHeight: "1.4" }}>
                    {viewingResultRequest.resultReport.findingsSummary}
                  </p>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px" }}>
                    Authorized by: <strong>{viewingResultRequest.resultReport.technologistName}</strong> (
                    {viewingResultRequest.resultReport.technologistRole})
                  </div>
                </div>

                {/* Clinician verification status */}
                <div
                  style={{
                    marginTop: "16px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: viewingResultRequest.resultReport.reviewedByDoctor ? "#f0fdf4" : "#fef3c7",
                    border: `1px solid ${
                      viewingResultRequest.resultReport.reviewedByDoctor ? "#bbf7d0" : "#fde68a"
                    }`,
                    color: viewingResultRequest.resultReport.reviewedByDoctor ? "#166534" : "#92400e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {viewingResultRequest.resultReport.reviewedByDoctor ? (
                      <>
                        <Icon name="check" size={14} /> Clinician Review Complete: Verified by{" "}
                        <strong>{viewingResultRequest.resultReport.reviewedByDoctor}</strong> (
                        {viewingResultRequest.resultReport.reviewedAt})
                      </>
                    ) : (
                      <>
                        <Icon name="warning" size={14} /> Pending Clinician Review: Please verify and acknowledge findings.
                      </>
                    )}
                  </span>

                  {!viewingResultRequest.resultReport.reviewedByDoctor && (
                    <Button
                      className="button"
                      style={{ fontSize: "11px", padding: "5px 10px" }}
                      onClick={() => handleAcknowledgeResult(viewingResultRequest)}
                    >
                      Acknowledge &amp; Sign
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="lab-modal-foot">
              <Button className="button secondary" onClick={() => setViewingResultRequest(null)}>
                Close Report
              </Button>
              <Button className="button" onClick={() => window.print()}>
                Print Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRACK REQUISITION PROGRESS TIMELINE MODAL ── */}
      {trackingRequest && (
        <div className="lab-modal-overlay" role="dialog" aria-modal="true">
          <div className="lab-modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="lab-modal-head">
              <h2 className="lab-modal-title">Requisition Tracking: {trackingRequest.id}</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setTrackingRequest(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="lab-modal-body">
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ fontSize: "15px", color: "var(--navy)" }}>
                  {trackingRequest.tests.map((t) => t.name).join(" + ")}
                </strong>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                  Priority: {trackingRequest.priority} · Ordered by {trackingRequest.orderedBy}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="lab-timeline">
                {trackingRequest.history.map((step, idx) => (
                  <div key={idx} className="lab-timeline-step">
                    <span className="lab-timeline-dot" />
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{step.status}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {step.timestamp} · {step.actor}
                    </div>
                    {step.note && (
                      <div style={{ fontSize: "12px", color: "var(--teal-dark)", marginTop: "3px" }}>
                        {step.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="lab-modal-foot">
              <Button className="button secondary" onClick={() => setTrackingRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL REQUEST CONFIRMATION MODAL ── */}
      {requestToCancel && (
        <div className="lab-modal-overlay" role="dialog" aria-modal="true">
          <div className="lab-modal-dialog" style={{ maxWidth: "520px" }}>
            <div className="lab-modal-head">
              <h2 className="lab-modal-title" style={{ color: "var(--emergency)" }}>
                Cancel Laboratory Request
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setRequestToCancel(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="lab-modal-body">
              <p style={{ fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                Are you sure you want to cancel requisition{" "}
                <strong>{requestToCancel.id}</strong> (
                {requestToCancel.tests.map((t) => t.name).join(", ")})? Central Laboratory will be
                notified to cease specimen processing.
              </p>

              <div className="rx-form-group">
                <label className="rx-label">
                  Reason for Cancellation<span className="required">*</span>
                </label>
                <select
                  className="rx-select"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                >
                  <option value="Change in clinical presentation or management plan">
                    Change in clinical presentation or management plan
                  </option>
                  <option value="Duplicate investigation request">
                    Duplicate investigation request
                  </option>
                  <option value="Investigation ordered on wrong encounter or patient">
                    Investigation ordered on wrong encounter or patient
                  </option>
                  <option value="Sample collection unfeasible or refused">
                    Sample collection unfeasible or refused
                  </option>
                  <option value="Patient transferred to specialized center">
                    Patient transferred to specialized center
                  </option>
                </select>
              </div>
            </div>
            <div className="lab-modal-foot">
              <Button className="button secondary" onClick={() => setRequestToCancel(null)}>
                Keep Requisition
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)", borderColor: "var(--emergency)" }}
                onClick={handleConfirmCancellation}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── REQUISITION DETAILS MODAL ── */}
      {detailsRequest && (
        <div className="lab-modal-overlay" role="dialog" aria-modal="true">
          <div className="lab-modal-dialog" style={{ maxWidth: "680px" }}>
            <div className="lab-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 className="lab-modal-title">Requisition Details: {detailsRequest.id}</h2>
                <span
                  className={`lab-status-badge lab-status-${detailsRequest.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {detailsRequest.status}
                </span>
              </div>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setDetailsRequest(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="lab-modal-body">
              {/* Context Summary Bar */}
              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  fontSize: "12px",
                }}
              >
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Patient:</span>
                  <strong style={{ color: "var(--navy)" }}>
                    {patient.fullName} ({patient.mrn})
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Encounter:</span>
                  <strong style={{ color: "var(--navy)" }}>{detailsRequest.encounterId}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Priority:</span>
                  <span
                    className={`lab-priority-pill ${
                      detailsRequest.priority === "Urgent (STAT)"
                        ? "lab-priority-urgent"
                        : "lab-priority-routine"
                    }`}
                  >
                    {detailsRequest.priority}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Ordered By:</span>
                  <strong style={{ color: "var(--navy)" }}>{detailsRequest.orderedBy}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Order Date &amp; Time:</span>
                  <strong style={{ color: "var(--navy)" }}>
                    {detailsRequest.orderedDate} · {detailsRequest.orderedTime}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Collection Timing:</span>
                  <strong style={{ color: "var(--navy)" }}>
                    {detailsRequest.requestedCollectionTiming}
                  </strong>
                </div>
              </div>

              {/* Tests Included */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Ordered Investigations ({detailsRequest.tests.length})
                </h4>
                <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                  <table className="lab-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Investigation</th>
                        <th>Category</th>
                        <th>Specimen Type</th>
                        <th>Est. TAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsRequest.tests.map((test) => (
                        <tr key={test.id}>
                          <td><strong>{test.code}</strong></td>
                          <td>{test.name}</td>
                          <td>{test.category}</td>
                          <td>{test.specimenType}</td>
                          <td>{test.turnaroundTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinical Indication & Notes */}
              <div style={{ marginBottom: "16px" }}>
                <div className="lab-indication-box" style={{ margin: 0 }}>
                  <div className="lab-indication-title">
                    <Icon name="info" size={12} />
                    Clinical Indication
                  </div>
                  <p className="lab-indication-text">{detailsRequest.clinicalIndication}</p>
                  {detailsRequest.notesForLab && (
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px", fontStyle: "italic" }}>
                      <strong>Laboratory Notes:</strong> {detailsRequest.notesForLab}
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation info if cancelled */}
              {detailsRequest.status === "Cancelled" && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <strong>Cancellation Reason:</strong> {detailsRequest.cancellationReason}
                  <div style={{ fontSize: "11px", marginTop: "3px" }}>
                    Cancelled by {detailsRequest.cancelledBy} on {detailsRequest.cancelledAt}
                  </div>
                </div>
              )}

              {/* Workflow Audit Trail */}
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Requisition Audit Trail
                </h4>
                <div className="lab-timeline">
                  {detailsRequest.history.map((step, idx) => (
                    <div key={idx} className="lab-timeline-step">
                      <span className="lab-timeline-dot" />
                      <div style={{ fontWeight: 700, color: "var(--navy)" }}>{step.status}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {step.timestamp} · {step.actor}
                      </div>
                      {step.note && (
                        <div style={{ fontSize: "12px", color: "var(--teal-dark)", marginTop: "3px" }}>
                          {step.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lab-modal-foot">
              <div style={{ display: "flex", gap: "8px" }}>
                <Button className="button secondary" onClick={() => setDetailsRequest(null)}>
                  Close
                </Button>
                <Button className="button secondary" onClick={() => window.print()}>
                  Print Requisition Slip
                </Button>
              </div>
              {detailsRequest.status === "Result Available" && detailsRequest.resultReport && (
                <Button
                  className="button"
                  style={{ background: "#15803d", borderColor: "#15803d" }}
                  onClick={() => {
                    const req = detailsRequest
                    setDetailsRequest(null)
                    setViewingResultRequest(req)
                  }}
                >
                  <Icon name="check" size={13} /> View Laboratory Results
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
