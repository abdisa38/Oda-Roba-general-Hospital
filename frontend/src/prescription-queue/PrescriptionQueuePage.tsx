// ORHIMS — Phase 07, Prompt 37: Prescription Queue and Dispensing Workspace
// Oda Roba General Hospital — Main Outpatient Pharmacy (Bale Robe, Ethiopia)

import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoQueuePrescriptions,
  type DispensingPrescription,
  type DispensingStatus,
  type DispensingPriority,
} from "./model"
import "./prescription-queue.css"

interface PrescriptionQueuePageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function PrescriptionQueuePage({
  state = "ready",
  permissions,
  onNavigate,
}: PrescriptionQueuePageProps) {
  // Authorization Check
  const isAuthorized =
    permissions.has("pharmacy") ||
    permissions.has("prescription-queue") ||
    permissions.has("dispensing") ||
    permissions.has("medication-stock")

  // State
  const [prescriptions, setPrescriptions] = useState<DispensingPrescription[]>(demoQueuePrescriptions)
  const [selectedRxId, setSelectedRxId] = useState<string | null>("RX-2026-00125") // Default to STAT order for review
  const [searchQuery, setSearchQuery] = useState("")
  const [deptFilter, setDeptFilter] = useState("All Departments")
  const [priorityFilter, setPriorityFilter] = useState("All Priorities")
  const [statusTab, setStatusTab] = useState<"All" | DispensingStatus>("All")
  const [lastRefreshed, setLastRefreshed] = useState("Today · 11:20 AM")

  // Dispensing Form State for Selected Prescription
  const [dispenseQuantities, setDispenseQuantities] = useState<Record<string, number>>({})
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({})
  const [partialReason, setPartialReason] = useState("Insufficient usable stock in dispensary")
  const [partialNotes, setPartialNotes] = useState("")

  // Checklist
  const [chkPatient, setChkPatient] = useState(false)
  const [chkDosage, setChkDosage] = useState(false)
  const [chkBatch, setChkBatch] = useState(false)
  const [chkCounselling, setChkCounselling] = useState(false)
  const [pharmacistRemarks, setPharmacistRemarks] = useState("")

  // Modals
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [holdModalOpen, setHoldModalOpen] = useState(false)
  const [holdReasonSelection, setHoldReasonSelection] = useState("Prescription clarification required with prescriber")
  const [holdNotes, setHoldNotes] = useState("")
  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null)

  // Currently Selected Prescription
  const selectedRx = useMemo(() => {
    if (!selectedRxId) return null
    return prescriptions.find((p) => p.id === selectedRxId) || null
  }, [prescriptions, selectedRxId])

  // Synchronize form values when selected prescription changes
  function openPrescription(rx: DispensingPrescription) {
    setSelectedRxId(rx.id)
    const initialQty: Record<string, number> = {}
    const initialBatches: Record<string, string> = {}
    rx.medicines.forEach((m) => {
      // Default dispense quantity is the remaining quantity (or 0 if cancelled)
      initialQty[m.id] = rx.dispensingStatus === "Cancelled" ? 0 : m.remainingQuantity
      initialBatches[m.id] = m.selectedBatchId
    })
    setDispenseQuantities(initialQty)
    setSelectedBatches(initialBatches)
    setChkPatient(rx.dispensingStatus === "Dispensed")
    setChkDosage(rx.dispensingStatus === "Dispensed")
    setChkBatch(rx.dispensingStatus === "Dispensed")
    setChkCounselling(rx.dispensingStatus === "Dispensed")
    setPharmacistRemarks(rx.pharmacistNotes || "")
    setPartialReason("Insufficient usable stock in dispensary")
    setPartialNotes("")
  }

  function showToast(message: string, type: "success" | "info" | "warning" = "success") {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  function handleRefresh() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    setLastRefreshed(`Today · ${timeStr}`)
    showToast("Prescription queue refreshed from central pharmacy database.", "info")
  }

  // Check if any medication line has partial dispensing
  const isPartialDispensing = useMemo(() => {
    if (!selectedRx) return false
    return selectedRx.medicines.some((m) => {
      const q = dispenseQuantities[m.id] || 0
      return q > 0 && q < m.remainingQuantity
    })
  }, [selectedRx, dispenseQuantities])

  // Total items being dispensed in this transaction
  const totalItemsDispensing = useMemo(() => {
    if (!selectedRx) return 0
    return selectedRx.medicines.reduce((acc, m) => acc + (dispenseQuantities[m.id] || 0), 0)
  }, [selectedRx, dispenseQuantities])

  // Confirm Dispensing Execution
  function handleExecuteDispensing() {
    if (!selectedRx) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const timestamp = `${dateStr} · ${timeStr}`

    // Determine final status
    const allItemsSatisfied = selectedRx.medicines.every((m) => {
      const q = dispenseQuantities[m.id] || 0
      return m.previouslyDispensed + q >= m.prescribedQuantity
    })

    const newStatus: DispensingStatus = allItemsSatisfied ? "Dispensed" : "Partially Dispensed"

    // Construct new audit items
    const newAuditItems = selectedRx.medicines
      .filter((m) => (dispenseQuantities[m.id] || 0) > 0)
      .map((m, idx) => ({
        transactionRef: `DISP-2026-0038${Math.floor(Math.random() * 90) + 10}`,
        timestamp,
        responsibleUser: "Ato Bekele Tolosa, RPh",
        medicineName: m.name,
        batchNumber: selectedBatches[m.id] || "BATCH-AUTO",
        quantityDispensed: dispenseQuantities[m.id] || 0,
        unit: m.unit,
        outcome: (newStatus === "Dispensed" ? "Fully Dispensed" : "Partially Dispensed") as "Fully Dispensed" | "Partially Dispensed",
        partialReason: isPartialDispensing ? partialReason : undefined,
        notes: pharmacistRemarks || undefined,
      }))

    // Update prescription in state
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== selectedRx.id) return rx
        const updatedMeds = rx.medicines.map((m) => {
          const dispensedNow = dispenseQuantities[m.id] || 0
          const updatedPrev = m.previouslyDispensed + dispensedNow
          const updatedRem = Math.max(0, m.prescribedQuantity - updatedPrev)
          return {
            ...m,
            previouslyDispensed: updatedPrev,
            remainingQuantity: updatedRem,
            dispenseNowQuantity: updatedRem,
          }
        })

        return {
          ...rx,
          dispensingStatus: newStatus,
          assignedPharmacist: "Ato Bekele Tolosa, RPh",
          pharmacistNotes: pharmacistRemarks || rx.pharmacistNotes,
          medicines: updatedMeds,
          auditHistory: [...newAuditItems, ...rx.auditHistory],
        }
      })
    )

    setConfirmModalOpen(false)
    showToast(
      `Dispensing transaction confirmed for ${selectedRx.id} (${selectedRx.patientName}). Status: ${newStatus}.`,
      "success"
    )
  }

  // Put on Hold Execution
  function handleConfirmHold() {
    if (!selectedRx) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const fullTimestamp = `${dateStr} · ${timeStr}`

    const combinedHoldReason = `${holdReasonSelection}${holdNotes ? `: ${holdNotes}` : ""}`

    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === selectedRx.id
          ? {
              ...rx,
              dispensingStatus: "On Hold",
              holdReason: combinedHoldReason,
              holdTimestamp: fullTimestamp,
              holdUser: "Ato Bekele Tolosa, RPh",
              auditHistory: [
                {
                  transactionRef: `HOLD-2026-000${Math.floor(Math.random() * 90) + 10}`,
                  timestamp: fullTimestamp,
                  responsibleUser: "Ato Bekele Tolosa, RPh",
                  medicineName: "Prescription On Hold",
                  batchNumber: "N/A",
                  quantityDispensed: 0,
                  unit: "N/A",
                  outcome: "Partially Dispensed",
                  notes: combinedHoldReason,
                },
                ...rx.auditHistory,
              ],
            }
          : rx
      )
    )

    setHoldModalOpen(false)
    showToast(`Prescription ${selectedRx.id} placed on hold. Reason documented in queue.`, "warning")
  }

  // Resume Dispensing from Hold
  function handleResumeDispensing() {
    if (!selectedRx) return
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === selectedRx.id
          ? {
              ...rx,
              dispensingStatus: "In Progress",
              holdReason: undefined,
              holdTimestamp: undefined,
              holdUser: undefined,
            }
          : rx
      )
    )
    showToast(`Prescription ${selectedRx.id} resumed to "In Progress". Ready for dispensing.`, "info")
  }

  // Filtered Queue Items
  const filteredQueue = useMemo(() => {
    return prescriptions.filter((rx) => {
      // Tab filter
      if (statusTab !== "All" && rx.dispensingStatus !== statusTab) return false

      // Department filter
      if (deptFilter !== "All Departments" && !rx.prescribingDepartment.includes(deptFilter)) return false

      // Priority filter
      if (priorityFilter !== "All Priorities" && rx.priority !== priorityFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const mRx = rx.id.toLowerCase().includes(q)
        const mPt = rx.patientName.toLowerCase().includes(q)
        const mId = rx.patientId.toLowerCase().includes(q)
        const mMeds = rx.medicines.some((m) => m.name.toLowerCase().includes(q))
        if (!mRx && !mPt && !mId && !mMeds) return false
      }

      return true
    })
  }, [prescriptions, statusTab, deptFilter, priorityFilter, searchQuery])

  // Counts for tabs
  const countAll = prescriptions.length
  const countPending = prescriptions.filter((p) => p.dispensingStatus === "Pending").length
  const countInProgress = prescriptions.filter((p) => p.dispensingStatus === "In Progress").length
  const countPartial = prescriptions.filter((p) => p.dispensingStatus === "Partially Dispensed").length
  const countDispensed = prescriptions.filter((p) => p.dispensingStatus === "Dispensed").length
  const countHold = prescriptions.filter((p) => p.dispensingStatus === "On Hold").length
  const countCancelled = prescriptions.filter((p) => p.dispensingStatus === "Cancelled").length

  // Access check state
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="pq-page-wrapper">
        <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Icon name="lock" size={36} />
          <Heading level={2} style={{ marginTop: "12px", color: "var(--navy)" }}>
            Access Restricted: Prescription Queue &amp; Dispensing
          </Heading>
          <Text style={{ maxWidth: "520px", margin: "8px auto", color: "var(--muted)" }}>
            You do not possess the authorized dispensing credentials required to review prescription orders, verify batches, and commit inventory dispensing transactions.
          </Text>
          <Button className="button" style={{ marginTop: "16px" }} onClick={() => onNavigate("home")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pq-page-wrapper">
      {/* ── Header & Breadcrumbs ── */}
      <header className="pq-header">
        <nav className="pq-breadcrumb" aria-label="Breadcrumb">
          <span className="pq-breadcrumb-item" onClick={() => onNavigate("home")}>
            Dashboard
          </span>
          <span>/</span>
          <span className="pq-breadcrumb-item" onClick={() => onNavigate("pharmacy-dashboard")}>
            Pharmacy
          </span>
          <span>/</span>
          <span className="pq-breadcrumb-active">Prescription Queue</span>
        </nav>

        <div className="pq-header-main">
          <div className="pq-header-title">
            <h1>Prescription Queue &amp; Dispensing</h1>
            <p>
              Review prescriptions, verify medicine availability, and record authorized dispensing transactions.
            </p>
          </div>

          <div className="pq-header-actions">
            <span className="pq-header-pill" title="Current Dispensing Store">
              <Icon name="building" size={14} />
              <span>Location:</span>
              <strong>Main Outpatient Pharmacy</strong>
            </span>

            <span className="pq-header-pill" title="Signed in Dispensing Pharmacist">
              <Icon name="user" size={14} />
              <span>Pharmacist:</span>
              <strong>Ato Bekele Tolosa, RPh</strong>
            </span>

            <Button className="button secondary" onClick={handleRefresh}>
              <Icon name="refresh" size={14} />
              Refresh ({lastRefreshed.replace("Today · ", "")})
            </Button>
          </div>
        </div>
      </header>

      {/* ── Toast Notification Banner ── */}
      {notification && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: 500,
            backgroundColor:
              notification.type === "success"
                ? "#e6f4ea"
                : notification.type === "warning"
                ? "#fff7ed"
                : "#e0f2fe",
            color:
              notification.type === "success"
                ? "#137333"
                : notification.type === "warning"
                ? "#9a3412"
                : "#0369a1",
            border: `1px solid ${
              notification.type === "success"
                ? "#b7e1cd"
                : notification.type === "warning"
                ? "#fed7aa"
                : "#bae6fd"
            }`,
          }}
        >
          <Icon name={notification.type === "success" ? "check" : "info"} size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── PRESCRIPTION QUEUE TABLE OR WORKBENCH TOGGLE ── */}
      {!selectedRx ? (
        /* ══════════════════════ 1. PRESCRIPTION QUEUE VIEW ══════════════════════ */
        <>
          <section className="pq-toolbar">
            <div className="pq-toolbar-row">
              <div className="pq-search-box">
                <span className="pq-search-icon">
                  <Icon name="search" size={15} />
                </span>
                <input
                  type="text"
                  className="pq-search-input"
                  placeholder="Search prescription number, patient name, MRN, or medicine…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search prescription queue"
                />
              </div>

              <select
                className="pq-filter-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="All Departments">All Prescribing Departments</option>
                <option value="Emergency Department">Emergency Department</option>
                <option value="Pediatric">Pediatric / Youth</option>
                <option value="Adult OPD-1">Adult OPD-1</option>
                <option value="Adult OPD-2">Adult OPD-2</option>
                <option value="Maternal Health Clinic">Maternal Health (ANC)</option>
                <option value="Non-Communicable Diseases">NCD / Chronic Care</option>
                <option value="Chest / Pulmonary">Chest / Pulmonary Clinic</option>
              </select>

              <select
                className="pq-filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="STAT">STAT / Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </select>
            </div>

            {/* Status Tabs */}
            <div className="pq-status-tabs" role="tablist">
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "All" ? " active" : ""}`}
                onClick={() => setStatusTab("All")}
              >
                All Prescriptions <span className="pq-tab-count">{countAll}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "Pending" ? " active" : ""}`}
                onClick={() => setStatusTab("Pending")}
              >
                Pending <span className="pq-tab-count">{countPending}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "In Progress" ? " active" : ""}`}
                onClick={() => setStatusTab("In Progress")}
              >
                In Progress <span className="pq-tab-count">{countInProgress}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "Partially Dispensed" ? " active" : ""}`}
                onClick={() => setStatusTab("Partially Dispensed")}
              >
                Partially Dispensed <span className="pq-tab-count">{countPartial}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "Dispensed" ? " active" : ""}`}
                onClick={() => setStatusTab("Dispensed")}
              >
                Dispensed <span className="pq-tab-count">{countDispensed}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "On Hold" ? " active" : ""}`}
                onClick={() => setStatusTab("On Hold")}
              >
                On Hold <span className="pq-tab-count">{countHold}</span>
              </button>
              <button
                type="button"
                className={`pq-status-tab-btn${statusTab === "Cancelled" ? " active" : ""}`}
                onClick={() => setStatusTab("Cancelled")}
              >
                Cancelled <span className="pq-tab-count">{countCancelled}</span>
              </button>
            </div>
          </section>

          {/* Table Container */}
          <section className="pq-table-container">
            <div className="pq-table-header-meta">
              <div>
                Showing <strong>{filteredQueue.length}</strong> prescriptions requiring pharmacy attention
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Main Outpatient Pharmacy Dispensing Queue · Bale Robe
              </div>
            </div>

            {filteredQueue.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
                <Icon name="search" size={32} />
                <Heading level={3} style={{ marginTop: "12px", color: "var(--navy)" }}>
                  No prescriptions match the selected filters.
                </Heading>
                <Text style={{ marginTop: "4px" }}>
                  Try resetting the status filter, clearing search keywords, or selecting All Departments.
                </Text>
                <Button
                  className="button secondary"
                  style={{ marginTop: "14px" }}
                  onClick={() => {
                    setSearchQuery("")
                    setDeptFilter("All Departments")
                    setPriorityFilter("All Priorities")
                    setStatusTab("All")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="pq-table-scroll">
                <table className="pq-table">
                  <thead>
                    <tr>
                      <th>Prescription #</th>
                      <th>Patient &amp; MRN</th>
                      <th>Prescribing Dept</th>
                      <th>Items</th>
                      <th>Prescription Time</th>
                      <th>Priority</th>
                      <th>Dispensing Status</th>
                      <th>Assigned Dispenser</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((rx) => (
                      <tr key={rx.id}>
                        <td>
                          <strong style={{ color: "var(--navy)", fontFamily: "monospace" }}>
                            {rx.id}
                          </strong>
                        </td>
                        <td>
                          <div>
                            <strong>{rx.patientName}</strong>
                            <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>
                              {rx.patientId} · {rx.ageGender}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "12.5px" }}>
                          <div>{rx.prescribingDepartment}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{rx.prescribingClinician}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{rx.medicines.length}</span>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}> meds</span>
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {rx.prescriptionDateTime}
                        </td>
                        <td>
                          <span
                            className={`pq-badge ${
                              rx.priority === "STAT"
                                ? "pq-priority-stat"
                                : rx.priority === "Urgent"
                                ? "pq-priority-urgent"
                                : "pq-priority-routine"
                            }`}
                          >
                            {rx.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`pq-badge ${
                              rx.dispensingStatus === "Pending"
                                ? "pq-status-pending"
                                : rx.dispensingStatus === "In Progress"
                                ? "pq-status-inprogress"
                                : rx.dispensingStatus === "Dispensed"
                                ? "pq-status-dispensed"
                                : rx.dispensingStatus === "Partially Dispensed"
                                ? "pq-status-partial"
                                : rx.dispensingStatus === "Cancelled"
                                ? "pq-status-cancelled"
                                : "pq-status-onhold"
                            }`}
                          >
                            {rx.dispensingStatus}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {rx.assignedPharmacist || "Unassigned"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            className="button"
                            style={{ padding: "5px 12px", fontSize: "12px" }}
                            onClick={() => openPrescription(rx)}
                          >
                            Open Prescription
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        /* ══════════════════════ 2. DETAILED SELECTED PRESCRIPTION WORKBENCH ══════════════════════ */
        <section className="pq-workspace">
          {/* Top Bar with Back Action */}
          <div className="pq-workspace-topbar">
            <button
              type="button"
              className="pq-back-btn"
              onClick={() => setSelectedRxId(null)}
              aria-label="Return to prescription queue table"
            >
              <Icon name="arrow" size={16} />
              ← Return to Prescription Queue
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Active Prescription:</span>
              <strong style={{ fontFamily: "monospace", color: "var(--navy)", fontSize: "15px" }}>
                {selectedRx.id}
              </strong>
              <span
                className={`pq-badge ${
                  selectedRx.dispensingStatus === "Pending"
                    ? "pq-status-pending"
                    : selectedRx.dispensingStatus === "In Progress"
                    ? "pq-status-inprogress"
                    : selectedRx.dispensingStatus === "Dispensed"
                    ? "pq-status-dispensed"
                    : selectedRx.dispensingStatus === "Partially Dispensed"
                    ? "pq-status-partial"
                    : selectedRx.dispensingStatus === "Cancelled"
                    ? "pq-status-cancelled"
                    : "pq-status-onhold"
                }`}
              >
                {selectedRx.dispensingStatus}
              </span>
            </div>
          </div>

          {/* Patient & Prescription Context Banner */}
          <div className="pq-patient-banner">
            <div className="pq-banner-col">
              <span className="pq-banner-label">Patient Name</span>
              <span className="pq-banner-val">{selectedRx.patientName}</span>
            </div>
            <div className="pq-banner-col">
              <span className="pq-banner-label">Hospital MRN</span>
              <span className="pq-banner-val" style={{ fontFamily: "monospace" }}>
                {selectedRx.patientId}
              </span>
            </div>
            <div className="pq-banner-col">
              <span className="pq-banner-label">Demographics</span>
              <span className="pq-banner-val">
                {selectedRx.ageGender} ({selectedRx.dob})
              </span>
            </div>
            <div className="pq-banner-col">
              <span className="pq-banner-label">Prescribing Clinician</span>
              <span className="pq-banner-val">{selectedRx.prescribingClinician}</span>
            </div>
            <div className="pq-banner-col">
              <span className="pq-banner-label">Department / Clinic</span>
              <span className="pq-banner-val">{selectedRx.prescribingDepartment}</span>
            </div>
            <div className="pq-banner-col">
              <span className="pq-banner-label">Payment / Insurance</span>
              <span className="pq-banner-val" style={{ color: "#0f766e" }}>
                {selectedRx.paymentStatus}
              </span>
            </div>
          </div>

          {/* Cancelled Banner if applicable */}
          {selectedRx.dispensingStatus === "Cancelled" && (
            <div className="pq-cancelled-banner">
              <Icon name="warning" size={20} />
              <div>
                <strong>Prescription Cancelled — Dispensing Prohibited:</strong>
                <div style={{ marginTop: "2px" }}>
                  {selectedRx.cancellationReason || "This order has been cancelled by attending clinicians."}
                </div>
              </div>
            </div>
          )}

          {/* On Hold Banner if applicable */}
          {selectedRx.dispensingStatus === "On Hold" && (
            <div className="pq-hold-banner">
              <Icon name="clock" size={20} />
              <div style={{ flex: 1 }}>
                <strong>Prescription Currently On Hold:</strong>
                <div style={{ marginTop: "2px" }}>
                  {selectedRx.holdReason} (Logged by {selectedRx.holdUser} on {selectedRx.holdTimestamp})
                </div>
              </div>
              <Button
                className="button secondary"
                style={{ background: "#ffffff", borderColor: "#fde047", fontSize: "12px" }}
                onClick={handleResumeDispensing}
              >
                Resume Dispensing
              </Button>
            </div>
          )}

          {/* Clinical Indication Context */}
          {selectedRx.clinicalIndication && (
            <div style={{ padding: "12px 18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
              <strong style={{ color: "var(--navy)" }}>Clinical Diagnosis / Indication: </strong>
              <span>{selectedRx.clinicalIndication}</span>
              {selectedRx.prescriberNotes && (
                <div style={{ marginTop: "4px", color: "var(--muted)", fontSize: "12px" }}>
                  <em>Prescriber Remarks: {selectedRx.prescriberNotes}</em>
                </div>
              )}
            </div>
          )}

          {/* ── Prescribed Medicines Table & Dispensing Workbench ── */}
          <div className="pq-medicines-card">
            <div className="pq-medicines-card-head">
              <div>
                <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                  Prescribed Medications ({selectedRx.medicines.length})
                </strong>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Verify exact match, select active non-expired batches, and specify dispensing quantities.
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Selected Dispensing: <strong>{totalItemsDispensing}</strong> units
              </div>
            </div>

            <div className="pq-table-scroll">
              <table className="pq-medicines-table">
                <thead>
                  <tr>
                    <th>Medication, Strength &amp; Form</th>
                    <th>Prescribed Instructions</th>
                    <th style={{ textAlign: "center" }}>Prescribed</th>
                    <th style={{ textAlign: "center" }}>Prev Dispensed</th>
                    <th style={{ textAlign: "center" }}>Remaining</th>
                    <th style={{ textAlign: "center" }}>Dispense Now</th>
                    <th>Eligible Batch Selection</th>
                    <th>Stock Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines.map((m) => {
                    const currentQty = dispenseQuantities[m.id] ?? m.remainingQuantity
                    const selectedBatch = m.availableBatches.find((b) => b.id === (selectedBatches[m.id] || m.selectedBatchId)) || m.availableBatches[0]

                    return (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                            {m.strength} · {m.dosageForm} ({m.code})
                          </div>
                        </td>
                        <td style={{ maxWidth: "240px" }}>
                          <div style={{ fontWeight: 600, color: "var(--navy)" }}>{m.route} · {m.frequency}</div>
                          <div style={{ fontSize: "11.5px", color: "#334155" }}>{m.instructions} ({m.duration})</div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <strong>{m.prescribedQuantity}</strong> <small style={{ color: "var(--muted)" }}>{m.unit}</small>
                        </td>
                        <td style={{ textAlign: "center", color: m.previouslyDispensed > 0 ? "#0f766e" : "var(--muted)" }}>
                          <strong>{m.previouslyDispensed}</strong> <small>{m.unit}</small>
                        </td>
                        <td style={{ textAlign: "center", color: m.remainingQuantity > 0 ? "var(--navy)" : "#137333" }}>
                          <strong>{m.remainingQuantity}</strong> <small>{m.unit}</small>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="number"
                            min={0}
                            max={Math.min(m.remainingQuantity, selectedBatch?.usableQuantity || m.remainingQuantity)}
                            value={currentQty}
                            disabled={selectedRx.dispensingStatus === "Cancelled" || selectedRx.dispensingStatus === "Dispensed"}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0)
                              setDispenseQuantities((prev) => ({
                                ...prev,
                                [m.id]: Math.min(val, m.remainingQuantity),
                              }))
                            }}
                            className="pq-quantity-input"
                            aria-label={`Dispense quantity for ${m.name}`}
                          />
                        </td>
                        <td>
                          <select
                            className="pq-batch-select"
                            value={selectedBatches[m.id] || m.selectedBatchId}
                            disabled={selectedRx.dispensingStatus === "Cancelled" || selectedRx.dispensingStatus === "Dispensed"}
                            onChange={(e) => {
                              setSelectedBatches((prev) => ({
                                ...prev,
                                [m.id]: e.target.value,
                              }))
                            }}
                            aria-label={`Select batch for ${m.name}`}
                          >
                            {m.availableBatches.map((b) => (
                              <option key={b.id} value={b.id} disabled={!b.isEligible}>
                                {b.batchNumber} (Usable: {b.usableQuantity} {m.unit} · Exp: {b.expiryDate})
                                {!b.isEligible ? ` — ${b.ineligibilityReason}` : ""}
                              </option>
                            ))}
                          </select>
                          {selectedBatch && (
                            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                              Loc: {selectedBatch.location} · {selectedBatch.daysUntilExpiry} days to expiry
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`pq-badge ${
                              m.matchedStatus === "Exact Match"
                                ? "pq-status-dispensed"
                                : m.matchedStatus === "Stock Out"
                                ? "pq-priority-stat"
                                : "pq-priority-urgent"
                            }`}
                          >
                            {m.matchedStatus}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Partial Dispensing Notice (if user adjusted quantity below remaining) */}
            {isPartialDispensing && selectedRx.dispensingStatus !== "Cancelled" && (
              <div className="pq-partial-box">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#9a3412" }}>
                  <Icon name="warning" size={16} />
                  Partial Dispensing Workflow Active
                </div>
                <div style={{ color: "#451a03" }}>
                  You are dispensing fewer units than the total remaining prescribed quantity. The prescription will remain tracked as <strong>Partially Dispensed</strong>, and outstanding balances will remain available for future fulfillment.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                      Mandatory Partial Dispensing Reason:
                    </label>
                    <select
                      className="pq-filter-select"
                      style={{ width: "100%" }}
                      value={partialReason}
                      onChange={(e) => setPartialReason(e.target.value)}
                    >
                      <option value="Insufficient usable stock in dispensary">Insufficient usable stock in dispensary</option>
                      <option value="Partial availability across eligible batches">Partial availability across eligible batches</option>
                      <option value="Patient requested partial duration supply">Patient requested partial duration supply</option>
                      <option value="Clinical monitoring / dose titration requirement">Clinical monitoring / dose titration requirement</option>
                      <option value="Other (documented in remarks)">Other (documented in remarks)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                      Additional Partial Follow-up Remarks:
                    </label>
                    <input
                      type="text"
                      className="pq-search-input"
                      placeholder="e.g. Balance to be collected upon next shipment arrival..."
                      value={partialNotes}
                      onChange={(e) => setPartialNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pharmacist Safety Verification Checklist */}
          {selectedRx.dispensingStatus !== "Cancelled" && selectedRx.dispensingStatus !== "Dispensed" && (
            <div className="pq-safety-checklist">
              <div className="pq-safety-title">
                <Icon name="shield" size={17} />
                Dispensing Safety &amp; Verification Protocol (Required for Confirmation)
              </div>
              <div className="pq-checklist-grid">
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkPatient}
                    onChange={(e) => setChkPatient(e.target.checked)}
                  />
                  <span>1. Patient identity &amp; MRN confirmed at dispensary window</span>
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkDosage}
                    onChange={(e) => setChkDosage(e.target.checked)}
                  />
                  <span>2. Medicine active ingredient, dose, &amp; route verified</span>
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkBatch}
                    onChange={(e) => setChkBatch(e.target.checked)}
                  />
                  <span>3. Batch container inspected for integrity &amp; expiry validity</span>
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkCounselling}
                    onChange={(e) => setChkCounselling(e.target.checked)}
                  />
                  <span>4. Patient counselled on intake instructions &amp; safe storage</span>
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                  Pharmacist Dispensing Remarks / Specific Counselling Notes
                </label>
                <input
                  type="text"
                  className="pq-search-input"
                  placeholder="Record any clinical notes, verbal counselling advice, or patient interactions..."
                  value={pharmacistRemarks}
                  onChange={(e) => setPharmacistRemarks(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pq-action-bar">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                className="button secondary"
                onClick={() => setLabelModalOpen(true)}
              >
                <Icon name="printer" size={14} />
                Preview Dispensing Label
              </Button>

              {selectedRx.dispensingStatus !== "Cancelled" && selectedRx.dispensingStatus !== "On Hold" && (
                <Button
                  className="button secondary"
                  style={{ color: "#854d0e" }}
                  onClick={() => setHoldModalOpen(true)}
                >
                  <Icon name="clock" size={14} />
                  Place on Hold
                </Button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Button className="button secondary" onClick={() => setSelectedRxId(null)}>
                Close
              </Button>

              {selectedRx.dispensingStatus !== "Cancelled" && selectedRx.dispensingStatus !== "Dispensed" && (
                <Button
                  className="button"
                  style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                  disabled={!chkPatient || !chkDosage || !chkBatch || !chkCounselling || totalItemsDispensing === 0}
                  onClick={() => setConfirmModalOpen(true)}
                  title={
                    !chkPatient || !chkDosage || !chkBatch || !chkCounselling
                      ? "Complete all 4 verification checklist points prior to review."
                      : totalItemsDispensing === 0
                      ? "Specify at least one medicine quantity to dispense."
                      : "Review and commit dispensing transaction"
                  }
                >
                  <Icon name="check" size={14} />
                  Review Dispensing ({totalItemsDispensing} units)
                </Button>
              )}
            </div>
          </div>

          {/* ── Dispensing History & Audit Trail Section ── */}
          <div className="pq-medicines-card" style={{ marginTop: "10px" }}>
            <div className="pq-medicines-card-head">
              <div>
                <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                  Dispensing History &amp; Audit Trail for Prescription {selectedRx.id}
                </strong>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Traceable record of previous dispensary commitments and status modifications.
                </div>
              </div>
            </div>

            {selectedRx.auditHistory.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                No prior dispensing transactions have been recorded for this prescription.
              </div>
            ) : (
              <div className="pq-table-scroll">
                <table className="pq-table">
                  <thead>
                    <tr>
                      <th>Transaction Ref</th>
                      <th>Timestamp</th>
                      <th>Responsible Dispenser</th>
                      <th>Medicine &amp; Batch</th>
                      <th>Quantity Dispensed</th>
                      <th>Outcome</th>
                      <th>Audit Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.auditHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--navy)" }}>
                          {item.transactionRef}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--muted)" }}>{item.timestamp}</td>
                        <td>{item.responsibleUser}</td>
                        <td>
                          <strong>{item.medicineName}</strong>
                          {item.batchNumber !== "N/A" && (
                            <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "4px" }}>
                              ({item.batchNumber})
                            </span>
                          )}
                        </td>
                        <td>
                          <strong>{item.quantityDispensed}</strong> <small>{item.unit}</small>
                        </td>
                        <td>
                          <span
                            className={`pq-badge ${
                              item.outcome === "Fully Dispensed"
                                ? "pq-status-dispensed"
                                : "pq-status-partial"
                            }`}
                          >
                            {item.outcome}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#334155" }}>
                          {item.notes || item.partialReason || "Standard dispensing transaction"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONFIRM DISPENSING TRANSACTION MODAL ── */}
      {confirmModalOpen && selectedRx && (
        <div className="pq-modal-overlay" onClick={() => setConfirmModalOpen(false)}>
          <div
            className="pq-modal"
            style={{ maxWidth: "640px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pq-modal-head">
              <h3>Confirm Dispensing Transaction</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setConfirmModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="pq-modal-body">
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <div><strong>Patient:</strong> {selectedRx.patientName} ({selectedRx.patientId})</div>
                <div><strong>Prescription:</strong> {selectedRx.id} · {selectedRx.prescribingDepartment}</div>
                <div><strong>Clinician:</strong> {selectedRx.prescribingClinician}</div>
              </div>

              <div>
                <strong style={{ fontSize: "13.5px", color: "var(--navy)" }}>
                  Medications Being Dispensed:
                </strong>
                <table className="pq-table" style={{ marginTop: "6px", border: "1px solid var(--border)" }}>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Quantity</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines.map((m) => {
                      const q = dispenseQuantities[m.id] || 0
                      const batch = m.availableBatches.find((b) => b.id === (selectedBatches[m.id] || m.selectedBatchId))
                      const rem = Math.max(0, m.remainingQuantity - q)
                      if (q === 0) return null
                      return (
                        <tr key={m.id}>
                          <td><strong>{m.name}</strong> ({m.strength})</td>
                          <td style={{ fontFamily: "monospace", fontSize: "11.5px" }}>{batch?.batchNumber}</td>
                          <td><strong>{q}</strong> {m.unit}</td>
                          <td style={{ color: rem > 0 ? "#c2410c" : "#137333", fontWeight: 600 }}>
                            {rem > 0 ? `${rem} ${m.unit} (Partial)` : "0 (Fulfilled)"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {isPartialDispensing && (
                <div style={{ padding: "10px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", fontSize: "12px", color: "#9a3412" }}>
                  <strong>Documented Partial Dispensing Reason:</strong> {partialReason}
                  {partialNotes && <div><em>Note: {partialNotes}</em></div>}
                </div>
              )}

              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Dispensing Pharmacist: <strong>Ato Bekele Tolosa, RPh</strong>. By confirming, inventory stock will be deducted and an immutable audit ledger entry created in ORHIMS.
              </div>
            </div>

            <div className="pq-modal-footer">
              <Button className="button secondary" onClick={() => setConfirmModalOpen(false)}>
                Back to Edit
              </Button>
              <Button
                className="button"
                style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                onClick={handleExecuteDispensing}
              >
                <Icon name="check" size={14} />
                Confirm &amp; Authorize Dispense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ON HOLD DIALOG MODAL ── */}
      {holdModalOpen && selectedRx && (
        <div className="pq-modal-overlay" onClick={() => setHoldModalOpen(false)}>
          <div
            className="pq-modal"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pq-modal-head">
              <h3>Place Prescription on Hold</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setHoldModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="pq-modal-body">
              <div>
                Placing prescription <strong>{selectedRx.id}</strong> ({selectedRx.patientName}) on hold halts dispensing until the issue is resolved.
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                  Mandatory Hold Reason:
                </label>
                <select
                  className="pq-filter-select"
                  style={{ width: "100%" }}
                  value={holdReasonSelection}
                  onChange={(e) => setHoldReasonSelection(e.target.value)}
                >
                  <option value="Prescription clarification required with prescriber">
                    Prescription clarification required with prescriber
                  </option>
                  <option value="Medicine out of stock / awaiting central replenishment">
                    Medicine out of stock / awaiting central replenishment
                  </option>
                  <option value="Patient clinical status / allergy query">
                    Patient clinical status / allergy query
                  </option>
                  <option value="Inventory discrepancy / quarantine inspection active">
                    Inventory discrepancy / quarantine inspection active
                  </option>
                  <option value="Other clinical/administrative hold reason">
                    Other clinical/administrative hold reason
                  </option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                  Detailed Hold Explanation &amp; Prescriber Communication Log:
                </label>
                <textarea
                  rows={3}
                  value={holdNotes}
                  onChange={(e) => setHoldNotes(e.target.value)}
                  placeholder="Record specifics of prescriber call, laboratory discrepancy, or expected resolution time..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "12.5px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div className="pq-modal-footer">
              <Button className="button secondary" onClick={() => setHoldModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "#854d0e", borderColor: "#854d0e" }}
                onClick={handleConfirmHold}
              >
                Confirm Hold Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINTABLE THERMAL DISPENSING LABEL MODAL ── */}
      {labelModalOpen && selectedRx && (
        <div className="pq-modal-overlay" onClick={() => setLabelModalOpen(false)}>
          <div
            className="pq-modal"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pq-modal-head">
              <h3>Preview Pharmacy Dispensing Label</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setLabelModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="pq-modal-body">
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Thermal label format for medicine bottle/box dispensing in accordance with Oda Roba Hospital Pharmacy standards.
              </div>

              {selectedRx.medicines.map((m) => {
                const q = dispenseQuantities[m.id] || m.remainingQuantity
                return (
                  <div key={m.id} className="pq-label-sheet" style={{ marginBottom: "12px" }}>
                    <div className="pq-label-header">
                      ODA ROBA GENERAL HOSPITAL — PHARMACY DISPENSARY
                      <div style={{ fontSize: "10px", fontWeight: "normal" }}>Bale Robe, Oromia, Ethiopia · Tel: +251 22 665 0102</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span><strong>Pt:</strong> {selectedRx.patientName}</span>
                      <span><strong>MRN:</strong> {selectedRx.patientId}</span>
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: 700, margin: "6px 0" }}>
                      {m.name} {m.strength} ({m.dosageForm})
                    </div>

                    <div style={{ background: "#f1f5f9", padding: "6px", borderRadius: "3px", margin: "6px 0" }}>
                      <strong>DIRECTIONS: </strong> {m.instructions} ({m.frequency})
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px" }}>
                      <span><strong>Qty Dispensed:</strong> {q} {m.unit}</span>
                      <span><strong>Date:</strong> 16 Oct 2026</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "#475569" }}>
                      <span>Prescriber: {selectedRx.prescribingClinician}</span>
                      <span>Dispenser: Ato Bekele Tolosa, RPh</span>
                    </div>

                    <div style={{ marginTop: "6px", fontSize: "9px", textAlign: "center", borderTop: "1px dotted #000", paddingTop: "4px" }}>
                      Keep all medicines out of reach of children. Store in a cool dry place.
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pq-modal-footer">
              <Button className="button secondary" onClick={() => setLabelModalOpen(false)}>
                Close
              </Button>
              <Button
                className="button"
                style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                onClick={() => {
                  window.print()
                  showToast("Dispensing label print task dispatched to thermal printer.", "success")
                  setLabelModalOpen(false)
                }}
              >
                <Icon name="printer" size={14} />
                Print Labels Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
