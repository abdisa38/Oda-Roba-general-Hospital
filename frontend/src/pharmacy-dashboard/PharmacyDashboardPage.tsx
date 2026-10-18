// ORHIMS — Phase 07, Prompt 36: Pharmacy Dashboard Workspace
// Oda Roba General Hospital — Main Outpatient Pharmacy (Bale Robe, Ethiopia)

import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoPrescriptions,
  demoInventoryAlerts,
  demoExpiryBatches,
  demoStockMovements,
  demoPharmacyAlerts,
  type PharmacyPrescription,
  type MedicineInventoryAlert,
  type ExpiryBatch,
  type PrescriptionDispenseStatus,
} from "./model"
import "./pharmacy-dashboard.css"

interface PharmacyDashboardPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function PharmacyDashboardPage({
  state = "ready",
  permissions,
  onNavigate,
}: PharmacyDashboardPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("pharmacy") ||
    permissions.has("pharmacy-dashboard") ||
    permissions.has("prescription-queue") ||
    permissions.has("dispensing") ||
    permissions.has("medication-stock")

  // State
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(demoPrescriptions)
  const [inventory] = useState<MedicineInventoryAlert[]>(demoInventoryAlerts)
  const [expiryBatches] = useState<ExpiryBatch[]>(demoExpiryBatches)
  const [movements] = useState(demoStockMovements)
  const [alerts] = useState(demoPharmacyAlerts)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [queueTab, setQueueTab] = useState<"All" | PrescriptionDispenseStatus>("All")
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState("Today · 10:55 AM")

  // Modals
  const [selectedPrescription, setSelectedPrescription] = useState<PharmacyPrescription | null>(null)
  const [inspectStockItem, setInspectStockItem] = useState<MedicineInventoryAlert | null>(null)
  const [inspectBatch, setInspectBatch] = useState<ExpiryBatch | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null)

  // Verification Checklist State inside modal
  const [verifyRightPatient, setVerifyRightPatient] = useState(false)
  const [verifyRightDose, setVerifyRightDose] = useState(false)
  const [verifyStockAvailability, setVerifyStockAvailability] = useState(false)
  const [dispenseNotes, setDispenseNotes] = useState("")

  function showToast(message: string, type: "success" | "info" | "warning" = "success") {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  function handleRefresh() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    setLastRefreshed(`Today · ${timeStr}`)
    showToast("Pharmacy dashboard data and stock availability refreshed.", "info")
  }

  // Open Prescription Modal
  function handleOpenPrescription(rx: PharmacyPrescription) {
    setSelectedPrescription(rx)
    setVerifyRightPatient(rx.dispensingStatus === "Dispensed")
    setVerifyRightDose(rx.dispensingStatus === "Dispensed")
    setVerifyStockAvailability(rx.dispensingStatus === "Dispensed")
    setDispenseNotes(rx.pharmacistNotes || "")
  }

  // Update Dispensing Status
  function handleUpdateDispenseStatus(newStatus: PrescriptionDispenseStatus) {
    if (!selectedPrescription) return

    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === selectedPrescription.id
          ? {
              ...rx,
              dispensingStatus: newStatus,
              pharmacistNotes: dispenseNotes.trim() || rx.pharmacistNotes,
              pharmacistAssigned: "Ato Bekele Tolosa, RPh",
            }
          : rx
      )
    )

    showToast(
      `Prescription ${selectedPrescription.id} (${selectedPrescription.patientName}) updated to "${newStatus}".`,
      "success"
    )
    setSelectedPrescription(null)
  }

  // Filtered Prescriptions Queue
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      // Metric shortcut filter
      if (activeMetricFilter === "pending" && rx.dispensingStatus !== "Pending") return false
      if (activeMetricFilter === "inprogress" && rx.dispensingStatus !== "In Progress") return false
      if (activeMetricFilter === "dispensed" && rx.dispensingStatus !== "Dispensed") return false

      // Tab filter
      if (queueTab !== "All" && rx.dispensingStatus !== queueTab) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchRx = rx.id.toLowerCase().includes(q)
        const matchPt = rx.patientName.toLowerCase().includes(q)
        const matchId = rx.patientId.toLowerCase().includes(q)
        const matchMeds = rx.medicines.some((m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
        if (!matchRx && !matchPt && !matchId && !matchMeds) return false
      }

      return true
    })
  }, [prescriptions, activeMetricFilter, queueTab, searchQuery])

  // Summary Metrics calculations
  const countPending = useMemo(() => prescriptions.filter((p) => p.dispensingStatus === "Pending").length, [prescriptions])
  const countInProgress = useMemo(() => prescriptions.filter((p) => p.dispensingStatus === "In Progress").length, [prescriptions])
  const countDispensedToday = 34 // Fictional daily calendar baseline + current
  const countLowStock = useMemo(() => inventory.filter((i) => i.stockStatus === "Low Stock").length, [inventory])
  const countOutOfStock = useMemo(() => inventory.filter((i) => i.stockStatus === "Out of Stock" || i.stockStatus === "Restricted / Quarantined").length, [inventory])
  const countExpiryAlerts = useMemo(() => expiryBatches.length, [expiryBatches])

  // Access check state
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="ph-page-wrapper">
        <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Icon name="lock" size={36} />
          <Heading level={2} style={{ marginTop: "12px", color: "var(--navy)" }}>
            Access Restricted: Pharmacy Operations
          </Heading>
          <Text style={{ maxWidth: "520px", margin: "8px auto", color: "var(--muted)" }}>
            You do not hold authorized pharmacist or dispenser credentials to review prescriptions, manage medicine inventory, or record dispensing transactions.
          </Text>
          <Button className="button" style={{ marginTop: "16px" }} onClick={() => onNavigate("home")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="ph-page-wrapper">
      {/* ── Breadcrumb & Header ── */}
      <header className="ph-header">
        <nav className="ph-breadcrumb" aria-label="Breadcrumb">
          <span className="ph-breadcrumb-item" onClick={() => onNavigate("home")}>
            Dashboard
          </span>
          <span>/</span>
          <span className="ph-breadcrumb-active">Pharmacy</span>
        </nav>

        <div className="ph-header-main">
          <div className="ph-header-title">
            <h1>Pharmacy Dashboard</h1>
          </div>

          <div className="ph-header-actions">
            <Button className="button secondary" onClick={handleRefresh}>
              <Icon name="refresh" size={14} />
              Refresh
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

      {/* ── Search Bar ── */}
      <section className="ph-nav-toolbar" aria-label="Pharmacy search">
        <div className="ph-search-input-wrapper">
          <span className="ph-search-icon">
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            className="ph-search-input"
            placeholder="Search prescription, patient name, or medicine…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search pharmacy records"
          />
        </div>
      </section>

      {/* ── Operational Metric Cards (4 cards) ── */}
      <section className="ph-metrics-grid" aria-label="Summary Metrics">
        {/* Card 1: Pending */}
        <button
          type="button"
          className={`ph-metric-card${activeMetricFilter === "pending" ? " active" : ""}`}
          onClick={() => {
            setActiveMetricFilter((prev) => (prev === "pending" ? null : "pending"))
            setQueueTab("All")
          }}
          title="Filter pending prescriptions"
        >
          <div className="ph-metric-top">
            <span>Pending</span>
            <Icon name="clock" size={16} />
          </div>
          <div className="ph-metric-count">{countPending}</div>
        </button>

        {/* Card 2: In Progress */}
        <button
          type="button"
          className={`ph-metric-card${activeMetricFilter === "inprogress" ? " active" : ""}`}
          onClick={() => {
            setActiveMetricFilter((prev) => (prev === "inprogress" ? null : "inprogress"))
            setQueueTab("All")
          }}
          title="Filter in-progress prescriptions"
        >
          <div className="ph-metric-top">
            <span>In Progress</span>
            <Icon name="edit" size={16} />
          </div>
          <div className="ph-metric-count" style={{ color: "#0369a1" }}>{countInProgress}</div>
        </button>

        {/* Card 3: Dispensed Today */}
        <button
          type="button"
          className={`ph-metric-card${activeMetricFilter === "dispensed" ? " active" : ""}`}
          onClick={() => {
            setActiveMetricFilter((prev) => (prev === "dispensed" ? null : "dispensed"))
            setQueueTab("All")
          }}
          title="Filter dispensed prescriptions"
        >
          <div className="ph-metric-top">
            <span>Dispensed Today</span>
            <Icon name="check" size={16} />
          </div>
          <div className="ph-metric-count" style={{ color: "#137333" }}>{countDispensedToday}</div>
        </button>

        {/* Card 4: Low Stock */}
        <button
          type="button"
          className="ph-metric-card"
          onClick={() => onNavigate("medication-stock")}
          title="Low stock medicines"
        >
          <div className="ph-metric-top">
            <span>Low Stock</span>
            <Icon name="warning" size={16} />
          </div>
          <div className="ph-metric-count" style={{ color: "#b45309" }}>{countLowStock}</div>
        </button>
      </section>

      {/* ── Main Two-Column Dashboard Layout ── */}
      <div className="ph-dashboard-layout">
        {/* Left Column: Work Queue & Inventory Attention */}
        <div className="ph-layout-col">
          {/* 1. Prescription Work Queue */}
          <section className="ph-section-card" aria-label="Prescription Queue">
            <div className="ph-section-head">
              <div className="ph-section-head-title">
                <h2>
                  <Icon name="pill" size={16} />
                  Prescription Queue
                </h2>
                <p>Review prescriptions that require pharmacy attention.</p>
              </div>

              <div className="ph-filter-tabs" role="tablist">
                {(["All", "Pending", "In Progress", "Partially Dispensed", "Dispensed", "On Hold"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`ph-filter-tab-btn${queueTab === tab ? " active" : ""}`}
                    onClick={() => {
                      setQueueTab(tab)
                      setActiveMetricFilter(null)
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredPrescriptions.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
                <Icon name="check" size={28} />
                <Heading level={3} style={{ marginTop: "8px", color: "var(--navy)" }}>
                  No prescriptions currently require pharmacy attention.
                </Heading>
                <Text style={{ marginTop: "2px" }}>
                  All prescriptions for the selected filter have been processed or moved to history.
                </Text>
              </div>
            ) : (
              <div className="ph-table-scroll">
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Prescription #</th>
                      <th>Patient &amp; MRN</th>
                      <th>Department</th>
                      <th>Prescriber</th>
                      <th>Time</th>
                      <th>Priority</th>
                      <th>Dispensing Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map((rx) => (
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
                        <td style={{ fontSize: "12.5px" }}>{rx.prescribingDepartment}</td>
                        <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {rx.prescribingClinician}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {rx.prescriptionTime}
                        </td>
                        <td>
                          <span
                            className={`ph-badge ${
                              rx.priority === "STAT"
                                ? "ph-priority-stat"
                                : rx.priority === "Urgent"
                                ? "ph-priority-urgent"
                                : "ph-priority-routine"
                            }`}
                          >
                            {rx.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`ph-badge ${
                              rx.dispensingStatus === "Pending"
                                ? "ph-status-pending"
                                : rx.dispensingStatus === "In Progress"
                                ? "ph-status-inprogress"
                                : rx.dispensingStatus === "Dispensed"
                                ? "ph-status-dispensed"
                                : rx.dispensingStatus === "Partially Dispensed"
                                ? "ph-status-partial"
                                : "ph-status-onhold"
                            }`}
                          >
                            {rx.dispensingStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            className="button secondary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => handleOpenPrescription(rx)}
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

            <div style={{ padding: "10px 18px", background: "#fafcfc", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--muted)" }}>
              <span>Demonstration Prescriptions for Oda Roba Hospital</span>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontWeight: 600 }}
                onClick={() => onNavigate("prescription-queue")}
              >
                View Complete Queue →
              </button>
            </div>
          </section>

          {/* 2. Medicine Inventory Requiring Attention */}
          <section className="ph-section-card" aria-label="Inventory Requiring Attention">
            <div className="ph-section-head">
              <div className="ph-section-head-title">
                <h2>
                  <Icon name="warning" size={16} />
                  Inventory Requiring Attention
                </h2>
                <p>Items below reorder thresholds or restricted in quarantine.</p>
              </div>

              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                onClick={() => onNavigate("medication-stock")}
              >
                View Full Inventory →
              </button>
            </div>

            <div className="ph-table-scroll">
              <table className="ph-table">
                <thead>
                  <tr>
                    <th>Medicine Name &amp; Code</th>
                    <th>Dosage &amp; Form</th>
                    <th>Usable Stock</th>
                    <th>Reorder Level</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>
                          {item.code} · {item.category}
                        </div>
                      </td>
                      <td>
                        {item.strength} {item.dosageForm}
                      </td>
                      <td>
                        <strong
                          style={{
                            color:
                              item.usableQuantity === 0
                                ? "var(--emergency)"
                                : item.usableQuantity <= item.reorderThreshold
                                ? "#b45309"
                                : "var(--navy)",
                          }}
                        >
                          {item.usableQuantity} {item.unit}
                        </strong>
                        {item.quarantinedQuantity > 0 && (
                          <div style={{ fontSize: "11px", color: "#6b21a8" }}>
                            ({item.quarantinedQuantity} in quarantine)
                          </div>
                        )}
                      </td>
                      <td style={{ color: "var(--muted)" }}>
                        {item.reorderThreshold} {item.unit}
                      </td>
                      <td>
                        <span
                          className={`ph-badge ${
                            item.stockStatus === "Out of Stock"
                              ? "ph-stock-out"
                              : item.stockStatus === "Low Stock"
                              ? "ph-stock-low"
                              : item.stockStatus === "Restricted / Quarantined"
                              ? "ph-stock-quarantine"
                              : "ph-stock-instock"
                          }`}
                        >
                          {item.stockStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          className="button secondary"
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                          onClick={() => setInspectStockItem(item)}
                        >
                          Inspect Stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Operations, Alerts, Expiry, Movements */}
        <div className="ph-layout-col">
          {/* 3. Priority Alerts */}
          <section className="ph-section-card" aria-label="Pharmacy Alerts">
            <div className="ph-section-head">
              <div className="ph-section-head-title">
                <h2>
                  <Icon name="warning" size={16} />
                  Pharmacy Alerts
                </h2>
                <p>Prioritized operational and clinical safety notifications.</p>
              </div>
            </div>

            <div className="ph-alerts-list">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`ph-alert-item severity-${alt.severity.toLowerCase()}`}
                >
                  <div className="ph-alert-content">
                    <div className="ph-alert-title-row">
                      <span>{alt.title}</span>
                      <span
                        className={`ph-badge ${
                          alt.severity === "High"
                            ? "ph-priority-stat"
                            : alt.severity === "Medium"
                            ? "ph-priority-urgent"
                            : "ph-priority-routine"
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </div>
                    <div className="ph-alert-desc">{alt.explanation}</div>
                    <div className="ph-alert-foot">
                      <span>Ref: {alt.reference} · {alt.timestamp}</span>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--teal)",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "11.5px",
                        }}
                        onClick={() => {
                          if (alt.reference.startsWith("RX-")) {
                            const found = prescriptions.find((p) => p.id === alt.reference)
                            if (found) handleOpenPrescription(found)
                          } else if (alt.reference.startsWith("MED-")) {
                            const found = inventory.find((i) => i.id === alt.reference)
                            if (found) setInspectStockItem(found)
                          } else if (alt.reference.startsWith("LOT-")) {
                            const found = expiryBatches.find((b) => b.batchNumber === alt.reference)
                            if (found) setInspectBatch(found)
                          }
                        }}
                      >
                        {alt.actionLabel} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Expiry Monitoring */}
          <section className="ph-section-card" aria-label="Expiry Monitoring">
            <div className="ph-section-head">
              <div className="ph-section-head-title">
                <h2>
                  <Icon name="clock" size={16} />
                  Expiry Monitoring
                </h2>
                <p>Batches requiring timely quarantine or stock rotation.</p>
              </div>

              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                onClick={() => onNavigate("expiry-monitoring")}
              >
                All Batches →
              </button>
            </div>

            <div className="ph-expiry-list">
              {expiryBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`ph-expiry-item${batch.status === "Expired" ? " expired" : ""}`}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <strong style={{ fontSize: "13px" }}>{batch.medicineName}</strong>
                    <div style={{ fontSize: "11.5px", color: "var(--muted)", fontFamily: "monospace" }}>
                      Batch: {batch.batchNumber} · Qty: {batch.quantity} {batch.unit}
                    </div>
                    <div style={{ fontSize: "11px", color: batch.status === "Expired" ? "var(--emergency)" : "#b45309" }}>
                      {batch.status === "Expired"
                        ? `Expired ${Math.abs(batch.daysRemaining)} days ago (${batch.expiryDate})`
                        : `Expires in ${batch.daysRemaining} days (${batch.expiryDate})`}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`ph-badge ${
                        batch.status === "Expired"
                          ? "ph-stock-out"
                          : "ph-stock-low"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Recent Stock Movements */}
          <section className="ph-section-card" aria-label="Recent Stock Movements">
            <div className="ph-section-head">
              <div className="ph-section-head-title">
                <h2>
                  <Icon name="arrow" size={16} />
                  Recent Stock Movements
                </h2>
                <p>Audited ledger transactions from dispensary.</p>
              </div>

              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                onClick={() => onNavigate("stock-movements")}
              >
                View Ledger →
              </button>
            </div>

            <div className="ph-movements-list">
              {movements.map((mov) => (
                <div key={mov.id} className="ph-movement-item">
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <strong>{mov.medicineName}</strong>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {mov.type} · Ref: {mov.referenceDocument}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong
                      style={{
                        fontFamily: "monospace",
                        color: mov.quantity.startsWith("+") ? "#137333" : "var(--navy)",
                      }}
                    >
                      {mov.quantity}
                    </strong>
                    <div style={{ fontSize: "10.5px", color: "var(--muted)" }}>
                      {mov.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Prescription Detail & Dispensing Modal ── */}
      {selectedPrescription && (
        <div className="ph-modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div
            className="ph-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rx-detail-title"
          >
            {/* Modal Head */}
            <div className="ph-modal-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 id="rx-detail-title" style={{ margin: 0, fontSize: "19px", color: "var(--navy)" }}>
                    Prescription {selectedPrescription.id}
                  </h2>
                  <span
                    className={`ph-badge ${
                      selectedPrescription.priority === "STAT"
                        ? "ph-priority-stat"
                        : selectedPrescription.priority === "Urgent"
                        ? "ph-priority-urgent"
                        : "ph-priority-routine"
                    }`}
                  >
                    {selectedPrescription.priority}
                  </span>
                  <span
                    className={`ph-badge ${
                      selectedPrescription.dispensingStatus === "Pending"
                        ? "ph-status-pending"
                        : selectedPrescription.dispensingStatus === "In Progress"
                        ? "ph-status-inprogress"
                        : selectedPrescription.dispensingStatus === "Dispensed"
                        ? "ph-status-dispensed"
                        : "ph-status-onhold"
                    }`}
                  >
                    {selectedPrescription.dispensingStatus}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                  Prescribed: {selectedPrescription.prescriptionTime} · Payment: {selectedPrescription.paymentStatus}
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedPrescription(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="ph-modal-body">
              {/* Patient Banner */}
              <div className="ph-modal-patient-card">
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Patient Name</span>
                  <div><strong>{selectedPrescription.patientName}</strong></div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Hospital MRN</span>
                  <div style={{ fontFamily: "monospace" }}><strong>{selectedPrescription.patientId}</strong></div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Age / Gender / DOB</span>
                  <div>{selectedPrescription.ageGender} ({selectedPrescription.dob})</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Prescribing Clinician</span>
                  <div><strong>{selectedPrescription.prescribingClinician}</strong></div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Department / Clinic</span>
                  <div>{selectedPrescription.prescribingDepartment}</div>
                </div>
              </div>

              {/* Clinical Context */}
              {selectedPrescription.clinicalDiagnosisSummary && (
                <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px" }}>
                  <strong style={{ color: "var(--navy)" }}>Clinical Indication: </strong>
                  <span>{selectedPrescription.clinicalDiagnosisSummary}</span>
                  {selectedPrescription.prescriberNotes && (
                    <div style={{ marginTop: "4px", color: "#475569", fontSize: "12px" }}>
                      <em>Prescriber Remarks: {selectedPrescription.prescriberNotes}</em>
                    </div>
                  )}
                </div>
              )}

              {/* Prescribed Medicines Table */}
              <div>
                <Heading level={3} style={{ fontSize: "14px", marginBottom: "8px", color: "var(--navy)" }}>
                  Prescribed Medications ({selectedPrescription.medicines.length})
                </Heading>
                <table className="ph-table" style={{ border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <thead>
                    <tr>
                      <th>Medication &amp; Form</th>
                      <th>Dose &amp; Frequency</th>
                      <th>Duration</th>
                      <th>Qty Prescribed</th>
                      <th>Usable Stock</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines.map((m, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{m.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{m.dosageForm}</div>
                        </td>
                        <td>
                          <strong>{m.dose}</strong>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{m.frequency}</div>
                        </td>
                        <td>{m.duration}</td>
                        <td>
                          <strong>{m.quantityPrescribed} {m.unit}</strong>
                        </td>
                        <td>
                          <span
                            className={`ph-badge ${
                              m.stockStatus === "In Stock"
                                ? "ph-stock-instock"
                                : m.stockStatus === "Low Stock"
                                ? "ph-stock-low"
                                : "ph-stock-out"
                            }`}
                          >
                            {m.stockAvailable} {m.unit}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#334155" }}>{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dispensing Safety Verification Checklist */}
              <div style={{ padding: "12px 16px", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "13px", color: "#0f766e", marginBottom: "8px" }}>
                  <Icon name="shield" size={16} />
                  Pharmacist Safety &amp; Verification Checklist
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12.5px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={verifyRightPatient}
                      onChange={(e) => setVerifyRightPatient(e.target.checked)}
                    />
                    <span>1. Patient identity &amp; MRN verified</span>
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={verifyRightDose}
                      onChange={(e) => setVerifyRightDose(e.target.checked)}
                    />
                    <span>2. Dosage &amp; contraindications checked</span>
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={verifyStockAvailability}
                      onChange={(e) => setVerifyStockAvailability(e.target.checked)}
                    />
                    <span>3. Physical batch &amp; expiry verified</span>
                  </label>
                  <div style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center" }}>
                    Dispenser: <strong>Ato Bekele Tolosa, RPh</strong>
                  </div>
                </div>
              </div>

              {/* Pharmacist Documentation Notes */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--navy)", marginBottom: "4px" }}>
                  Pharmacist Dispensing Remarks / Patient Counselling Notes
                </label>
                <textarea
                  rows={2}
                  value={dispenseNotes}
                  onChange={(e) => setDispenseNotes(e.target.value)}
                  placeholder="Record patient counselling on food intake, allergy review, or partial dispensing reasons..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="ph-modal-footer">
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  className="button secondary"
                  onClick={() => {
                    window.alert(`[Printing Pharmacy Label]\nPrinting barcode dispensing label for ${selectedPrescription.patientName} (${selectedPrescription.id})`)
                    showToast("Label dispatched to thermal dispensary printer.", "info")
                  }}
                >
                  <Icon name="printer" size={14} />
                  Print Label
                </Button>
                {selectedPrescription.dispensingStatus !== "On Hold" && (
                  <Button
                    className="button secondary"
                    onClick={() => handleUpdateDispenseStatus("On Hold")}
                  >
                    Place On Hold
                  </Button>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button className="button secondary" onClick={() => setSelectedPrescription(null)}>
                  Close
                </Button>

                {selectedPrescription.dispensingStatus === "Pending" && (
                  <Button
                    className="button"
                    style={{ background: "#0369a1", borderColor: "#0369a1" }}
                    onClick={() => handleUpdateDispenseStatus("In Progress")}
                  >
                    Start Dispensing
                  </Button>
                )}

                {selectedPrescription.dispensingStatus !== "Dispensed" && (
                  <Button
                    className="button"
                    style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                    disabled={!verifyRightPatient || !verifyRightDose || !verifyStockAvailability}
                    onClick={() => handleUpdateDispenseStatus("Dispensed")}
                    title={
                      !verifyRightPatient || !verifyRightDose || !verifyStockAvailability
                        ? "Complete all 3 verification checklist items before final dispense."
                        : "Authorize and record completed dispensing"
                    }
                  >
                    <Icon name="check" size={14} />
                    Complete Dispensing
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Inspect Stock Item Modal ── */}
      {inspectStockItem && (
        <div className="ph-modal-overlay" onClick={() => setInspectStockItem(null)}>
          <div
            className="ph-detail-modal"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ph-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", color: "var(--navy)" }}>
                  {inspectStockItem.name}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "monospace" }}>
                  {inspectStockItem.code} · {inspectStockItem.strength} {inspectStockItem.dosageForm}
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setInspectStockItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="ph-modal-body" style={{ gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Usable Dispensing Stock</span>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: inspectStockItem.usableQuantity === 0 ? "var(--emergency)" : "var(--navy)" }}>
                    {inspectStockItem.usableQuantity} {inspectStockItem.unit}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Minimum Reorder Point</span>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)" }}>
                    {inspectStockItem.reorderThreshold} {inspectStockItem.unit}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Quarantined / Expired</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#6b21a8" }}>
                    {inspectStockItem.quarantinedQuantity} {inspectStockItem.unit}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Storage Location</span>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{inspectStockItem.location}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Primary Supplier / Supply Chain Source:</span>
                <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                  {inspectStockItem.supplierRef}
                </div>
              </div>

              <div style={{ padding: "8px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", fontSize: "12px", color: "#9a3412" }}>
                <strong>Inventory Policy Notice:</strong> Physical stock is automatically segregated from usable stock. Expired or quarantined units are locked from routine dispensing transactions.
              </div>
            </div>

            <div className="ph-modal-footer">
              <Button className="button secondary" onClick={() => setInspectStockItem(null)}>
                Close
              </Button>
              <Button
                className="button"
                style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                onClick={() => {
                  showToast(`Electronic stock requisition created for ${inspectStockItem.name}. Forwarded to EPSA hub store.`, "success")
                  setInspectStockItem(null)
                }}
              >
                Create Requisition
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inspect Batch Quarantine Modal ── */}
      {inspectBatch && (
        <div className="ph-modal-overlay" onClick={() => setInspectBatch(null)}>
          <div
            className="ph-detail-modal"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ph-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", color: "var(--navy)" }}>
                  Batch Inspection: {inspectBatch.batchNumber}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {inspectBatch.medicineName}
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setInspectBatch(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="ph-modal-body" style={{ gap: "12px" }}>
              <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#991b1b", fontSize: "13px" }}>
                <strong>Quarantine Lockdown Active:</strong> This batch reached shelf-life expiry on {inspectBatch.expiryDate}. Dispensing is blocked.
              </div>

              <div style={{ fontSize: "13px" }}>
                <div><strong>Batch Quantity:</strong> {inspectBatch.quantity} {inspectBatch.unit}</div>
                <div><strong>Location:</strong> {inspectBatch.location}</div>
                {inspectBatch.quarantineReason && (
                  <div style={{ marginTop: "6px", color: "#475569" }}>
                    <strong>Protocol Log:</strong> {inspectBatch.quarantineReason}
                  </div>
                )}
              </div>
            </div>

            <div className="ph-modal-footer">
              <Button className="button secondary" onClick={() => setInspectBatch(null)}>
                Close
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)", borderColor: "var(--emergency)" }}
                onClick={() => {
                  showToast(`Batch ${inspectBatch.batchNumber} scheduled for formal hospital disposal audit.`, "info")
                  setInspectBatch(null)
                }}
              >
                Schedule Disposal Survey
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
