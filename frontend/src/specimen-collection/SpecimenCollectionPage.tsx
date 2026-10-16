import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoSpecimenRecords,
  type SpecimenRecord,
  type SpecimenStatus,
  type SpecimenType,
  type RejectionReason,
} from "./model"
import "./specimen-collection.css"

interface SpecimenCollectionPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function SpecimenCollectionPage({
  state = "ready",
  permissions,
  onNavigate,
}: SpecimenCollectionPageProps) {
  // Staff authorization check
  const isAuthorized =
    permissions.has("lab") ||
    permissions.has("lab-orders") ||
    permissions.has("specimen-collection") ||
    permissions.has("triage") ||
    permissions.has("consultations")

  // Local state
  const [records, setRecords] = useState<SpecimenRecord[]>(demoSpecimenRecords)
  const [selectedRecordId, setSelectedRecordId] = useState<string>(demoSpecimenRecords[0].id)
  const [activeTab, setActiveTab] = useState<"All" | SpecimenStatus>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All")
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>("All")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Modals state
  const [collectingRecord, setCollectingRecord] = useState<SpecimenRecord | null>(null)
  const [verifyingRecord, setVerifyingRecord] = useState<SpecimenRecord | null>(null)
  const [rejectingRecord, setRejectingRecord] = useState<SpecimenRecord | null>(null)
  const [viewingAuditRecord, setViewingAuditRecord] = useState<SpecimenRecord | null>(null)

  // Collection Form state
  const [confirmPatientIdentity, setConfirmPatientIdentity] = useState(false)
  const [collectionLocation, setCollectionLocation] = useState("Phlebotomy Station 1")
  const [collectorName, setCollectorName] = useState("Sr. Chala Beyene, Phlebotomist")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [collectorNotes, setCollectorNotes] = useState("")
  const [formValidationError, setFormValidationError] = useState<string | null>(null)

  // Verification Form state
  const [verifyLabelMatch, setVerifyLabelMatch] = useState(false)
  const [verifyVolumeAdequate, setVerifyVolumeAdequate] = useState(false)
  const [verifyNoClotHemolysis, setVerifyNoClotHemolysis] = useState(false)
  const [verifierNotes, setVerifierNotes] = useState("")
  const [verifyValidationError, setVerifyValidationError] = useState<string | null>(null)

  // Rejection Form state
  const [rejectionReason, setRejectionReason] = useState<RejectionReason>("Insufficient specimen quantity (QNS)")
  const [rejectionNotes, setRejectionNotes] = useState("")

  // Notification Banner
  const [alertNotice, setAlertNotice] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Currently selected record
  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) || records[0],
    [records, selectedRecordId]
  )

  // Counts
  const countAwaiting = records.filter((r) => r.status === "Awaiting Collection").length
  const countPendingVerification = records.filter(
    (r) => r.status === "Collected — Verification Pending"
  ).length
  const countVerified = records.filter((r) => r.status === "Verified").length
  const countRejected = records.filter((r) => r.status === "Rejected").length

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Tab filter
      const matchTab = activeTab === "All" || rec.status === activeTab

      // Specimen type filter
      const matchType =
        selectedTypeFilter === "All" || rec.requiredSpecimenType === selectedTypeFilter

      // Urgency filter
      const matchUrgency =
        selectedUrgencyFilter === "All" || rec.urgency.startsWith(selectedUrgencyFilter)

      // Search query (Patient Name, Patient ID / MRN, Request ID, Specimen ID)
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        rec.patientName.toLowerCase().includes(q) ||
        rec.patientId.toLowerCase().includes(q) ||
        rec.requestId.toLowerCase().includes(q) ||
        rec.id.toLowerCase().includes(q) ||
        rec.tests.some((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))

      return matchTab && matchType && matchUrgency && matchSearch
    })
  }, [records, activeTab, selectedTypeFilter, selectedUrgencyFilter, searchQuery])

  // Open Collection Modal
  function handleOpenCollection(rec: SpecimenRecord) {
    setCollectingRecord(rec)
    setConfirmPatientIdentity(false)
    setCollectionLocation("Phlebotomy Station 1")
    setCollectorName("Sr. Chala Beyene, Phlebotomist")
    setBarcodeInput(`BAR-${rec.id.replace("SP-", "")}-${rec.requiredSpecimenType.split(" ")[0]}`)
    setCollectorNotes("")
    setFormValidationError(null)
  }

  // Submit Collection Form
  function handleSubmitCollection() {
    if (!collectingRecord) return

    if (!confirmPatientIdentity) {
      setFormValidationError(
        "Mandatory Safety Requirement: Please verify the patient's identity using two identifiers (Full Name & MRN) before submitting collection."
      )
      return
    }

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setRecords((prev) =>
      prev.map((r) =>
        r.id === collectingRecord.id
          ? {
              ...r,
              status: "Collected — Verification Pending" as const,
              collectedAt: fullTimestamp,
              collectedBy: collectorName,
              collectionLocation,
              specimenBarcode: barcodeInput.trim() || undefined,
              collectorNotes: collectorNotes.trim() || undefined,
              auditHistory: [
                ...r.auditHistory,
                {
                  timestamp: timeStr,
                  status: "Collected — Verification Pending" as const,
                  actor: collectorName,
                  role: "Phlebotomist",
                  note: `Specimen collected at ${collectionLocation}. Barcode ${barcodeInput || "affixed"}. Awaiting accession verification.`,
                },
              ],
            }
          : r
      )
    )

    setCollectingRecord(null)
    setAlertNotice({
      message: `Specimen ${collectingRecord.id} recorded for ${collectingRecord.patientName}. Transferred to accession verification queue.`,
      type: "success",
    })
    setTimeout(() => setAlertNotice(null), 5000)
  }

  // Open Verification Modal
  function handleOpenVerification(rec: SpecimenRecord) {
    setVerifyingRecord(rec)
    setVerifyLabelMatch(false)
    setVerifyVolumeAdequate(false)
    setVerifyNoClotHemolysis(false)
    setVerifierNotes("")
    setVerifyValidationError(null)
  }

  // Submit Verification Form
  function handleSubmitVerification() {
    if (!verifyingRecord) return

    if (!verifyLabelMatch || !verifyVolumeAdequate || !verifyNoClotHemolysis) {
      setVerifyValidationError(
        "Accession Verification Incomplete: All three specimen verification criteria must be inspected and confirmed prior to release for analyzer processing."
      )
      return
    }

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setRecords((prev) =>
      prev.map((r) =>
        r.id === verifyingRecord.id
          ? {
              ...r,
              status: "Verified" as const,
              verifiedAt: fullTimestamp,
              verifiedBy: "Sr. Tirhas Wolde, Lab Officer",
              auditHistory: [
                ...r.auditHistory,
                {
                  timestamp: timeStr,
                  status: "Verified" as const,
                  actor: "Sr. Tirhas Wolde",
                  role: "Accession Officer",
                  note: `Specimen verified: Label matched, volume adequate, no hemolysis. ${verifierNotes ? `Notes: ${verifierNotes}` : "Released for laboratory analysis."}`,
                },
              ],
            }
          : r
      )
    )

    setVerifyingRecord(null)
    setAlertNotice({
      message: `Specimen ${verifyingRecord.id} verified and released for laboratory analysis.`,
      type: "success",
    })
    setTimeout(() => setAlertNotice(null), 5000)
  }

  // Open Rejection Dialog
  function handleOpenRejection(rec: SpecimenRecord) {
    setRejectingRecord(rec)
    setRejectionReason("Insufficient specimen quantity (QNS)")
    setRejectionNotes("")
  }

  // Confirm Rejection
  function handleConfirmRejection() {
    if (!rejectingRecord) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    setRecords((prev) =>
      prev.map((r) =>
        r.id === rejectingRecord.id
          ? {
              ...r,
              status: "Rejected" as const,
              rejectedAt: fullTimestamp,
              rejectedBy: "Sr. Tirhas Wolde, Lab Officer",
              rejectionReason,
              rejectionNotes: rejectionNotes.trim() || undefined,
              auditHistory: [
                ...r.auditHistory,
                {
                  timestamp: timeStr,
                  status: "Rejected" as const,
                  actor: "Sr. Tirhas Wolde",
                  role: "Accession Officer",
                  note: `Specimen Rejected: ${rejectionReason}. ${rejectionNotes ? `Details: ${rejectionNotes}` : "Clinician informed for recollection."}`,
                },
              ],
            }
          : r
      )
    )

    setRejectingRecord(null)
    setAlertNotice({
      message: `Specimen ${rejectingRecord.id} flagged as Rejected (${rejectionReason}). Order retained for clinician recollection.`,
      type: "error",
    })
    setTimeout(() => setAlertNotice(null), 6000)
  }

  // Print barcode label simulation
  function handlePrintBarcode(rec: SpecimenRecord) {
    window.alert(
      `[Laboratory Barcode Printer]\nPrinting tube label for ${rec.patientName} (${rec.patientId})\nSpecimen ID: ${rec.id}\nContainer: ${rec.container}\nTests: ${rec.tests.map((t) => t.code).join(", ")}`
    )
  }

  if (state === "loading") {
    return (
      <div className="sp-workspace-page">
        <div className="sp-empty-state" style={{ padding: "80px 20px" }}>
          <Icon name="clock" size={36} />
          <Heading level={2}>Loading Specimen Collection Work Queue...</Heading>
          <Text>Retrieving active diagnostic requests from Central Diagnostic Laboratory database.</Text>
        </div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="sp-workspace-page">
        <div className="sp-empty-state" style={{ padding: "80px 20px" }}>
          <Icon name="warning" size={36} />
          <Heading level={2} style={{ color: "var(--emergency)" }}>
            Unable to Retrieve Laboratory Queue
          </Heading>
          <Text>
            Communication error with Central Laboratory service. Please verify network connection or retry.
          </Text>
          <Button className="button secondary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-workspace-page">
      {/* ── Breadcrumb & Page Header ── */}
      <header className="sp-page-header">
        <nav className="sp-breadcrumb" aria-label="Breadcrumb">
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate("laboratory")}>
            Laboratory
          </span>
          <span>/</span>
          <span className="active">Specimen Collection &amp; Verification</span>
          <span>/</span>
          <span
            style={{ cursor: "pointer", color: "var(--teal)", fontWeight: 600 }}
            onClick={() => onNavigate("result-entry")}
          >
            Result Entry
          </span>
          <span>/</span>
          <span
            style={{ cursor: "pointer", color: "var(--teal)", fontWeight: 600 }}
            onClick={() => onNavigate("result-review")}
          >
            Result Review &amp; Approval
          </span>
          <span>/</span>
          <span
            style={{ cursor: "pointer", color: "var(--teal)", fontWeight: 600 }}
            onClick={() => onNavigate("lab-history")}
          >
            History
          </span>
        </nav>

        <div className="sp-header-main">
          <div className="sp-title-area">
            <h1>Specimen Collection and Verification</h1>
            <p className="sp-title-desc">
              Review incoming diagnostic requests, verify patient identification with two safety identifiers,
              record collection details, and perform laboratory accession verification.
            </p>
          </div>

          <div className="sp-header-controls">
            <span className="sp-demo-pill" title="Demonstration data representative of Oda Roba Hospital">
              <Icon name="flask" size={14} />
              <span>Awaiting Collection:</span>
              <strong>{countAwaiting} Requests</strong>
              <small style={{ color: "var(--muted)", marginLeft: "4px" }}>(Demonstration Data)</small>
            </span>

            <div className="sp-search-box">
              <span className="sp-search-icon">
                <Icon name="search" size={14} />
              </span>
              <input
                type="text"
                className="sp-search-input"
                placeholder="Search patient, MRN, request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search requests"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Notification Banner ── */}
      {alertNotice && (
        <div
          className={`sp-alert-banner ${
            alertNotice.type === "success" ? "sp-alert-success" : "sp-alert-error"
          }`}
          role="status"
        >
          <Icon name={alertNotice.type === "success" ? "check" : "warning"} size={16} />
          <span>{alertNotice.message}</span>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <section className="sp-filter-bar">
        <div className="sp-status-tabs" role="tablist" aria-label="Filter requests by status">
          <button
            type="button"
            className={`sp-tab-btn${activeTab === "All" ? " active" : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All Requests <span className="sp-count-badge">{records.length}</span>
          </button>
          <button
            type="button"
            className={`sp-tab-btn tab-awaiting${activeTab === "Awaiting Collection" ? " active" : ""}`}
            onClick={() => setActiveTab("Awaiting Collection")}
          >
            Awaiting Collection <span className="sp-count-badge">{countAwaiting}</span>
          </button>
          <button
            type="button"
            className={`sp-tab-btn tab-pending${
              activeTab === "Collected — Verification Pending" ? " active" : ""
            }`}
            onClick={() => setActiveTab("Collected — Verification Pending")}
          >
            Verification Pending <span className="sp-count-badge">{countPendingVerification}</span>
          </button>
          <button
            type="button"
            className={`sp-tab-btn tab-verified${activeTab === "Verified" ? " active" : ""}`}
            onClick={() => setActiveTab("Verified")}
          >
            Verified <span className="sp-count-badge">{countVerified}</span>
          </button>
          <button
            type="button"
            className={`sp-tab-btn tab-rejected${activeTab === "Rejected" ? " active" : ""}`}
            onClick={() => setActiveTab("Rejected")}
          >
            Rejected <span className="sp-count-badge">{countRejected}</span>
          </button>
        </div>

        <div className="sp-extra-filters">
          <select
            className="sp-select-filter"
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            aria-label="Filter by specimen type"
          >
            <option value="All">All Specimen Types</option>
            <option value="Whole Blood (EDTA)">Whole Blood (EDTA)</option>
            <option value="Serum (SST)">Serum (SST)</option>
            <option value="Capillary Blood">Capillary Blood</option>
            <option value="Early Morning Sputum">Early Morning Sputum</option>
            <option value="Random Clean-Catch Urine">Clean-Catch Urine</option>
          </select>

          <select
            className="sp-select-filter"
            value={selectedUrgencyFilter}
            onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
            aria-label="Filter by urgency"
          >
            <option value="All">All Priorities</option>
            <option value="STAT">STAT / Urgent Only</option>
            <option value="Routine">Routine Only</option>
          </select>

          <div className="sp-view-toggle">
            <button
              type="button"
              className={`sp-view-btn${viewMode === "table" ? " active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={`sp-view-btn${viewMode === "cards" ? " active" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Two-Column Layout ── */}
      <main className="sp-main-layout">
        {/* Left: Work Queue Table or Cards */}
        <div className="sp-queue-card">
          {filteredRecords.length === 0 ? (
            <div className="sp-empty-state">
              <Icon name="flask" size={32} />
              <Heading level={3}>No Requests Match Criteria</Heading>
              <Text>
                {searchQuery
                  ? `No requests match "${searchQuery}". Clear search or adjust filter tabs.`
                  : "No specimen collection requests in this queue."}
              </Text>
              {(searchQuery || activeTab !== "All" || selectedTypeFilter !== "All") && (
                <Button
                  className="button secondary"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("All")
                    setSelectedTypeFilter("All")
                    setSelectedUrgencyFilter("All")
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : viewMode === "table" ? (
            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Request &amp; Specimen ID</th>
                    <th>Patient Identification</th>
                    <th>Requested Tests</th>
                    <th>Required Specimen &amp; Tube</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec) => {
                    const isSelected = rec.id === selectedRecordId
                    const badgeClass =
                      rec.status === "Awaiting Collection"
                        ? "sp-badge-awaiting"
                        : rec.status === "Collection Started"
                        ? "sp-badge-started"
                        : rec.status === "Collected — Verification Pending"
                        ? "sp-badge-collected"
                        : rec.status === "Verified"
                        ? "sp-badge-verified"
                        : rec.status === "Rejected"
                        ? "sp-badge-rejected"
                        : "sp-badge-cancelled"

                    return (
                      <tr
                        key={rec.id}
                        className={isSelected ? "is-selected" : ""}
                        onClick={() => setSelectedRecordId(rec.id)}
                      >
                        <td>
                          <div className="sp-req-id">{rec.requestId}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            ID: {rec.id}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "var(--navy)", display: "block" }}>
                            {rec.patientName}
                          </strong>
                          <span className="sp-mrn-id">{rec.patientId}</span>
                          <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "4px" }}>
                            · {rec.patientAgeGender}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>
                            {rec.tests.map((t) => t.name).join(" + ")}
                          </strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {rec.requestingDoctor} ({rec.requestedDepartment})
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: "var(--navy)", display: "block" }}>
                            {rec.requiredSpecimenType}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {rec.container}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`sp-urgency-pill ${
                              rec.urgency.startsWith("STAT") ? "sp-urgency-stat" : "sp-urgency-routine"
                            }`}
                          >
                            {rec.urgency}
                          </span>
                        </td>
                        <td>
                          <span className={`sp-status-badge ${badgeClass}`}>
                            {rec.status === "Verified" && <Icon name="check" size={12} />}
                            {rec.status === "Awaiting Collection" && <Icon name="clock" size={12} />}
                            {rec.status === "Rejected" && <Icon name="warning" size={12} />}
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          {rec.status === "Awaiting Collection" ? (
                            <Button
                              className="button"
                              style={{ fontSize: "11px", padding: "4px 10px" }}
                              onClick={() => handleOpenCollection(rec)}
                            >
                              <Icon name="flask" size={12} /> Collect
                            </Button>
                          ) : rec.status === "Collected — Verification Pending" ? (
                            <Button
                              className="button"
                              style={{
                                fontSize: "11px",
                                padding: "4px 10px",
                                background: "#7c3aed",
                                borderColor: "#7c3aed",
                              }}
                              onClick={() => handleOpenVerification(rec)}
                            >
                              <Icon name="shield" size={12} /> Verify
                            </Button>
                          ) : (
                            <Button
                              className="button secondary"
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                              onClick={() => setSelectedRecordId(rec.id)}
                            >
                              Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px" }}>
              {filteredRecords.map((rec) => {
                const isSelected = rec.id === selectedRecordId
                const badgeClass =
                  rec.status === "Awaiting Collection"
                    ? "sp-badge-awaiting"
                    : rec.status === "Collection Started"
                    ? "sp-badge-started"
                    : rec.status === "Collected — Verification Pending"
                    ? "sp-badge-collected"
                    : rec.status === "Verified"
                    ? "sp-badge-verified"
                    : rec.status === "Rejected"
                    ? "sp-badge-rejected"
                    : "sp-badge-cancelled"

                return (
                  <article
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    style={{
                      border: isSelected ? "2px solid var(--teal)" : "1px solid var(--border)",
                      background: isSelected ? "#f0fdfa" : "#ffffff",
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="sp-req-id" style={{ fontSize: "14px" }}>
                          {rec.requestId}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "8px" }}>
                          Specimen: {rec.id}
                        </span>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "15px", color: "var(--navy)" }}>
                          {rec.patientName}
                        </h3>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                          MRN: <strong>{rec.patientId}</strong> · {rec.patientAgeGender} · DOB: {rec.patientDob}
                        </div>
                      </div>
                      <span className={`sp-status-badge ${badgeClass}`}>{rec.status}</span>
                    </div>

                    <div style={{ background: "var(--mist)", padding: "10px", borderRadius: "6px", fontSize: "12px" }}>
                      <strong>Tests: </strong>
                      {rec.tests.map((t) => t.name).join(", ")}
                      <div style={{ marginTop: "4px", color: "var(--teal-dark)" }}>
                        Required: <strong>{rec.requiredSpecimenType}</strong> ({rec.container})
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        className={`sp-urgency-pill ${
                          rec.urgency.startsWith("STAT") ? "sp-urgency-stat" : "sp-urgency-routine"
                        }`}
                      >
                        {rec.urgency}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                        {rec.status === "Awaiting Collection" && (
                          <Button
                            className="button"
                            style={{ fontSize: "12px", padding: "5px 12px" }}
                            onClick={() => handleOpenCollection(rec)}
                          >
                            <Icon name="flask" size={12} /> Start Collection
                          </Button>
                        )}
                        {rec.status === "Collected — Verification Pending" && (
                          <Button
                            className="button"
                            style={{ fontSize: "12px", padding: "5px 12px", background: "#7c3aed", borderColor: "#7c3aed" }}
                            onClick={() => handleOpenVerification(rec)}
                          >
                            <Icon name="shield" size={12} /> Verify Specimen
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Confirmation & Order Details Panel */}
        {selectedRecord && (
          <aside className="sp-details-panel">
            <div className="sp-panel-head">
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Selected Laboratory Order
                </span>
                <div className="sp-req-id" style={{ fontSize: "16px", marginTop: "2px" }}>
                  {selectedRecord.requestId}
                </div>
              </div>
              <span
                className={`sp-status-badge ${
                  selectedRecord.status === "Awaiting Collection"
                    ? "sp-badge-awaiting"
                    : selectedRecord.status === "Collected — Verification Pending"
                    ? "sp-badge-collected"
                    : selectedRecord.status === "Verified"
                    ? "sp-badge-verified"
                    : selectedRecord.status === "Rejected"
                    ? "sp-badge-rejected"
                    : "sp-badge-cancelled"
                }`}
              >
                {selectedRecord.status}
              </span>
            </div>

            {/* Patient Identification Card */}
            <div className="sp-patient-highlight">
              <div className="sp-patient-mrn-row">
                <span className="sp-mrn-id">{selectedRecord.patientId}</span>
                <span
                  className={`sp-urgency-pill ${
                    selectedRecord.urgency.startsWith("STAT") ? "sp-urgency-stat" : "sp-urgency-routine"
                  }`}
                >
                  {selectedRecord.urgency}
                </span>
              </div>
              <h2 className="sp-patient-name">{selectedRecord.patientName}</h2>
              <div className="sp-patient-meta">
                DOB: <strong>{selectedRecord.patientDob}</strong> ({selectedRecord.patientAgeGender})
              </div>
              <div className="sp-patient-meta" style={{ marginTop: "2px" }}>
                Encounter: <strong>{selectedRecord.encounterId}</strong> · {selectedRecord.requestedDepartment}
              </div>
              <div className="sp-patient-meta" style={{ marginTop: "2px" }}>
                Clinician: <strong>{selectedRecord.requestingDoctor}</strong>
              </div>
            </div>

            {/* Requested Investigations */}
            <div>
              <div className="sp-spec-section-title">
                <Icon name="flask" size={13} /> Requested Investigations ({selectedRecord.tests.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedRecord.tests.map((test) => (
                  <div
                    key={test.code}
                    style={{
                      background: "var(--mist)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      fontSize: "12px",
                    }}
                  >
                    <strong style={{ color: "var(--navy)" }}>{test.name}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "2px" }}>
                      Code: {test.code} · Category: {test.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specimen Requirements Box */}
            <div>
              <div className="sp-spec-section-title">
                <Icon name="shield" size={13} /> Specimen Specifications
              </div>
              <div className="sp-spec-box">
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ color: "var(--muted)", display: "block" }}>Required Specimen Type:</span>
                  <strong style={{ color: "var(--navy)" }}>{selectedRecord.requiredSpecimenType}</strong>
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ color: "var(--muted)", display: "block" }}>Primary Container / Tube:</span>
                  <strong style={{ color: "var(--navy)" }}>{selectedRecord.container}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block" }}>Specimen Identifier:</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--teal)" }}>
                    {selectedRecord.specimenBarcode || selectedRecord.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Instructions & Alerts */}
            {selectedRecord.collectionInstructions && (
              <div className="sp-instructions-alert">
                <strong style={{ display: "block", marginBottom: "3px" }}>Collection Guidance:</strong>
                {selectedRecord.collectionInstructions}
                {selectedRecord.specialPrecautions && (
                  <div style={{ marginTop: "6px", fontWeight: 600, color: "var(--emergency)" }}>
                    Precaution: {selectedRecord.specialPrecautions}
                  </div>
                )}
              </div>
            )}

            {/* Rejection Notice if rejected */}
            {selectedRecord.status === "Rejected" && (
              <div className="sp-rejection-warning">
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Specimen Rejected ({selectedRecord.rejectedAt}):
                </strong>
                <div>
                  <strong>Reason: </strong>
                  {selectedRecord.rejectionReason}
                </div>
                {selectedRecord.rejectionNotes && (
                  <div style={{ marginTop: "4px" }}>{selectedRecord.rejectionNotes}</div>
                )}
                <div style={{ fontSize: "11px", marginTop: "6px", color: "var(--muted)" }}>
                  Rejected by: {selectedRecord.rejectedBy}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="sp-panel-actions">
              {selectedRecord.status === "Awaiting Collection" && (
                <Button className="button" onClick={() => handleOpenCollection(selectedRecord)}>
                  <Icon name="flask" size={15} /> Start Specimen Collection
                </Button>
              )}

              {selectedRecord.status === "Collected — Verification Pending" && (
                <Button
                  className="button"
                  style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                  onClick={() => handleOpenVerification(selectedRecord)}
                >
                  <Icon name="shield" size={15} /> Verify Specimen &amp; Release
                </Button>
              )}

              {selectedRecord.status === "Verified" && (
                <Button
                  className="button"
                  style={{ background: "#15803d", borderColor: "#15803d" }}
                  onClick={() => onNavigate("result-entry")}
                >
                  <Icon name="edit" size={15} /> Enter Laboratory Results
                </Button>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <Button
                  className="button secondary"
                  style={{ fontSize: "12px", padding: "6px" }}
                  onClick={() => handlePrintBarcode(selectedRecord)}
                >
                  <Icon name="edit" size={13} /> Print Label
                </Button>

                <Button
                  className="button secondary"
                  style={{ fontSize: "12px", padding: "6px" }}
                  onClick={() => setViewingAuditRecord(selectedRecord)}
                >
                  <Icon name="clock" size={13} /> Audit Trail
                </Button>
              </div>

              {selectedRecord.status !== "Rejected" && selectedRecord.status !== "Cancelled" && (
                <Button
                  className="button secondary"
                  style={{
                    fontSize: "12px",
                    padding: "6px",
                    color: "var(--emergency)",
                    borderColor: "#fca5a5",
                  }}
                  onClick={() => handleOpenRejection(selectedRecord)}
                >
                  <Icon name="close" size={13} /> Flag / Reject Specimen
                </Button>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* ── MODAL 1: SPECIMEN COLLECTION FORM ── */}
      {collectingRecord && (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true">
          <div className="sp-modal-dialog">
            <div className="sp-modal-head">
              <div>
                <h2 className="sp-modal-title">Record Specimen Collection</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Requisition ID: <strong>{collectingRecord.requestId}</strong>
                </div>
              </div>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setCollectingRecord(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              {/* Validation Alert */}
              {formValidationError && (
                <div className="sp-alert-banner sp-alert-error" role="alert">
                  <Icon name="warning" size={16} />
                  <span>{formValidationError}</span>
                </div>
              )}

              {/* 1. Patient Safety Confirmation */}
              <div className="sp-confirm-checkbox-box">
                <input
                  type="checkbox"
                  id="confirm-patient-check"
                  checked={confirmPatientIdentity}
                  onChange={(e) => {
                    setConfirmPatientIdentity(e.target.checked)
                    if (e.target.checked) setFormValidationError(null)
                  }}
                />
                <label htmlFor="confirm-patient-check" className="sp-confirm-checkbox-label">
                  <strong>Patient Identity Verified: </strong>
                  I have actively confirmed the patient’s identity using two identifiers (Full Name:{" "}
                  <em>{collectingRecord.patientName}</em>, MRN: <em>{collectingRecord.patientId}</em>, DOB:{" "}
                  <em>{collectingRecord.patientDob}</em>) prior to drawing or collecting the specimen.
                </label>
              </div>

              {/* 2. Order & Specimen Details */}
              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Requested Investigation:</span>
                    <strong style={{ color: "var(--navy)" }}>
                      {collectingRecord.tests.map((t) => t.name).join(" + ")}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Required Tube / Container:</span>
                    <strong style={{ color: "var(--navy)" }}>{collectingRecord.container}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Collection Information Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="sp-form-group">
                  <label className="sp-label">
                    Collection Location<span className="required">*</span>
                  </label>
                  <select
                    className="sp-select"
                    value={collectionLocation}
                    onChange={(e) => setCollectionLocation(e.target.value)}
                  >
                    <option value="Phlebotomy Station 1">Phlebotomy Station 1 (Main Lab)</option>
                    <option value="Phlebotomy Station 2">Phlebotomy Station 2 (OPD)</option>
                    <option value="Emergency Phlebotomy Bay">Emergency Phlebotomy Bay</option>
                    <option value="MCH Clinic Blood Draw Room">MCH Clinic Blood Draw Room</option>
                    <option value="Inpatient Ward Bedside">Inpatient Ward Bedside</option>
                  </select>
                </div>

                <div className="sp-form-group">
                  <label className="sp-label">
                    Responsible Collector<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="sp-input"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="sp-form-group">
                  <label className="sp-label">
                    Specimen Barcode / Tube ID<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="sp-input"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan or enter barcode..."
                  />
                </div>

                <div className="sp-form-group">
                  <label className="sp-label">Collection Timing</label>
                  <input
                    type="text"
                    className="sp-input"
                    disabled
                    value="Immediate (Current timestamp applied)"
                    style={{ background: "#f8fafc", color: "var(--muted)" }}
                  />
                </div>
              </div>

              <div className="sp-form-group">
                <label className="sp-label">Phlebotomist / Collector Notes (Optional)</label>
                <textarea
                  className="sp-textarea"
                  rows={2}
                  placeholder="e.g. Right antecubital vein venipuncture, clean draw, well-tolerated..."
                  value={collectorNotes}
                  onChange={(e) => setCollectorNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="sp-modal-foot">
              <Button className="button secondary" onClick={() => setCollectingRecord(null)}>
                Cancel
              </Button>
              <Button className="button" onClick={handleSubmitCollection}>
                <Icon name="check" size={14} /> Record Collection (Pending Verification)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SPECIMEN ACCESSION VERIFICATION ── */}
      {verifyingRecord && (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true">
          <div className="sp-modal-dialog">
            <div className="sp-modal-head">
              <div>
                <h2 className="sp-modal-title">Specimen Accession Verification</h2>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Specimen ID: <strong>{verifyingRecord.id}</strong> · Barcode:{" "}
                  <strong>{verifyingRecord.specimenBarcode}</strong>
                </div>
              </div>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setVerifyingRecord(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#166534",
                }}
              >
                <strong>Accession Protocol: </strong>
                Verify that physical specimen container matches electronic requisition details and satisfies
                analytical quality criteria before loading into diagnostic analyzer.
              </div>

              {verifyValidationError && (
                <div className="sp-alert-banner sp-alert-error" role="alert">
                  <Icon name="warning" size={16} />
                  <span>{verifyValidationError}</span>
                </div>
              )}

              {/* Three Mandatory Quality Checks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="sp-confirm-checkbox-box">
                  <input
                    type="checkbox"
                    id="chk-label-match"
                    checked={verifyLabelMatch}
                    onChange={(e) => {
                      setVerifyLabelMatch(e.target.checked)
                      if (e.target.checked && verifyVolumeAdequate && verifyNoClotHemolysis) {
                        setVerifyValidationError(null)
                      }
                    }}
                  />
                  <label htmlFor="chk-label-match" className="sp-confirm-checkbox-label">
                    <strong>1. Label &amp; Patient Match: </strong>
                    Tube label matches patient name (<em>{verifyingRecord.patientName}</em>) and MRN (
                    <em>{verifyingRecord.patientId}</em>) exactly.
                  </label>
                </div>

                <div className="sp-confirm-checkbox-box">
                  <input
                    type="checkbox"
                    id="chk-volume-adequate"
                    checked={verifyVolumeAdequate}
                    onChange={(e) => {
                      setVerifyVolumeAdequate(e.target.checked)
                      if (verifyLabelMatch && e.target.checked && verifyNoClotHemolysis) {
                        setVerifyValidationError(null)
                      }
                    }}
                  />
                  <label htmlFor="chk-volume-adequate" className="sp-confirm-checkbox-label">
                    <strong>2. Specimen Volume Adequate: </strong>
                    Volume meets minimum required filling line for {verifyingRecord.container}.
                  </label>
                </div>

                <div className="sp-confirm-checkbox-box">
                  <input
                    type="checkbox"
                    id="chk-no-clot"
                    checked={verifyNoClotHemolysis}
                    onChange={(e) => {
                      setVerifyNoClotHemolysis(e.target.checked)
                      if (verifyLabelMatch && verifyVolumeAdequate && e.target.checked) {
                        setVerifyValidationError(null)
                      }
                    }}
                  />
                  <label htmlFor="chk-no-clot" className="sp-confirm-checkbox-label">
                    <strong>3. Physical Quality Verified: </strong>
                    Specimen is free of visible gross hemolysis, microclots, leakage, or container defect.
                  </label>
                </div>
              </div>

              <div className="sp-form-group">
                <label className="sp-label">Verification Remarks / Analyzer Assignment (Optional)</label>
                <input
                  type="text"
                  className="sp-input"
                  placeholder="e.g. Centrifuged 10 min 3000 RPM, queued for Cobas c311 chemistry analyzer..."
                  value={verifierNotes}
                  onChange={(e) => setVerifierNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="sp-modal-foot">
              <Button className="button secondary" onClick={() => setVerifyingRecord(null)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "#15803d", borderColor: "#15803d" }}
                onClick={handleSubmitVerification}
              >
                <Icon name="check" size={14} /> Verify &amp; Release for Processing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SPECIMEN REJECTION DIALOG ── */}
      {rejectingRecord && (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true">
          <div className="sp-modal-dialog" style={{ maxWidth: "540px" }}>
            <div className="sp-modal-head">
              <h2 className="sp-modal-title" style={{ color: "var(--emergency)" }}>
                Reject Laboratory Specimen
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setRejectingRecord(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div className="sp-rejection-warning">
                <strong>Attention: </strong> Rejecting this specimen will halt processing in the Central
                Laboratory. The requisition will NOT be deleted; it will be flagged for clinician notification
                and repeat collection.
              </div>

              <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                Patient: <strong>{rejectingRecord.patientName}</strong> ({rejectingRecord.patientId})<br />
                Requisition: <strong>{rejectingRecord.requestId}</strong> (
                {rejectingRecord.tests.map((t) => t.name).join(", ")})
              </div>

              <div className="sp-form-group">
                <label className="sp-label">
                  Primary Rejection Reason<span className="required">*</span>
                </label>
                <select
                  className="sp-select"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                >
                  <option value="Insufficient specimen quantity (QNS)">
                    Insufficient specimen quantity (QNS)
                  </option>
                  <option value="Hemolyzed or clotted blood sample">
                    Hemolyzed or clotted blood sample
                  </option>
                  <option value="Incorrect specimen type or tube">
                    Incorrect specimen type or tube
                  </option>
                  <option value="Specimen container or labelling problem">
                    Specimen container or labelling problem
                  </option>
                  <option value="Damaged or leaking container">
                    Damaged or leaking container
                  </option>
                  <option value="Mismatched patient requisition details">
                    Mismatched patient requisition details
                  </option>
                  <option value="Other documented reason">
                    Other documented reason
                  </option>
                </select>
              </div>

              <div className="sp-form-group">
                <label className="sp-label">Rejection Details &amp; Recollection Guidance</label>
                <textarea
                  className="sp-textarea"
                  rows={3}
                  placeholder="Document specific visual observation and instructions for requesting clinician / ward..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="sp-modal-foot">
              <Button className="button secondary" onClick={() => setRejectingRecord(null)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)", borderColor: "var(--emergency)" }}
                onClick={handleConfirmRejection}
              >
                Confirm Rejection &amp; Alert Clinician
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: AUDIT TRAIL TIMELINE ── */}
      {viewingAuditRecord && (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true">
          <div className="sp-modal-dialog" style={{ maxWidth: "560px" }}>
            <div className="sp-modal-head">
              <h2 className="sp-modal-title">Specimen Audit Trail: {viewingAuditRecord.id}</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setViewingAuditRecord(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div style={{ marginBottom: "14px" }}>
                <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                  {viewingAuditRecord.patientName} ({viewingAuditRecord.patientId})
                </strong>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  Order: {viewingAuditRecord.requestId} · {viewingAuditRecord.tests.map((t) => t.code).join(", ")}
                </div>
              </div>

              <div className="sp-timeline">
                {viewingAuditRecord.auditHistory.map((step, idx) => (
                  <div key={idx} className="sp-timeline-step">
                    <span className="sp-timeline-dot" />
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{step.status}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {step.timestamp} · {step.actor} ({step.role})
                    </div>
                    {step.note && (
                      <div style={{ fontSize: "12px", color: "var(--teal-dark)", marginTop: "2px" }}>
                        {step.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sp-modal-foot">
              <Button className="button secondary" onClick={() => setViewingAuditRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
