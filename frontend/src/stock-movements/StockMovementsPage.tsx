// ORHIMS — Phase 07, Prompt 39: Stock Movements and Stock Receiving
// Oda Roba General Hospital — Main Pharmacy & Central Medical Store (Bale Robe, Ethiopia)

import React, { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button } from "../permissions/ui"
import {
  ADJUSTMENT_REASONS,
  DEMO_STOCK_MOVEMENTS,
  STORAGE_LOCATIONS,
  SUPPLIERS_SOURCES,
  type MovementStatus,
  type MovementType,
  type StockMovementLineItem,
  type StockMovementRecord,
} from "./model"
import { DEMO_MEDICINES } from "../medicine-inventory/model"
import "./stock-movements.css"

interface StockMovementsPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function StockMovementsPage({
  state = "ready",
  permissions,
  onNavigate,
}: StockMovementsPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("pharmacy") ||
    permissions.has("stock-movements") ||
    permissions.has("medication-stock") ||
    permissions.has("dispensing")

  // State
  const [movements, setMovements] = useState<StockMovementRecord[]>(DEMO_STOCK_MOVEMENTS)
  const [selectedRecord, setSelectedRecord] = useState<StockMovementRecord | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "receiving" | "adjustments">("all")
  const [drawerActiveTab, setDrawerActiveTab] = useState<"items" | "audit">("items")

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All Types")
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses")
  const [medicineFilter, setMedicineFilter] = useState<string>("All Medicines")
  const [locationFilter, setLocationFilter] = useState<string>("All Locations")
  const [dateFilter, setDateFilter] = useState<string>("All Dates")
  const [activeSummaryMetric, setActiveSummaryMetric] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [receiveStep, setReceiveStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false)
  const [postedSuccessRecord, setPostedSuccessRecord] = useState<StockMovementRecord | null>(null)

  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // ── Receive Stock Form State ──
  const [grnReference, setGrnReference] = useState(`GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  const [receiptDate] = useState("16 Oct 2026 · 11:30 AM")
  const [supplier, setSupplier] = useState(SUPPLIERS_SOURCES[0])
  const [deliveryNote, setDeliveryNote] = useState("DN-EPSA-99412-B")
  const [receivingLocation, setReceivingLocation] = useState(STORAGE_LOCATIONS[0])
  const [receivedBy] = useState("Ato Bekele Tolosa, RPh")
  const [consignmentNotes, setConsignmentNotes] = useState("Routine essential medicine consignment. Cold chain packaging verified intact.")
  const [step1Error, setStep1Error] = useState("")

  // Line items for receiving
  const [lineItems, setLineItems] = useState<StockMovementLineItem[]>([
    {
      id: "TEMP-1",
      medicineId: "MED-0104",
      medicineName: "Amoxicillin 500mg Capsules",
      genericName: "Amoxicillin Trihydrate",
      medicineCode: "AMX-500",
      strength: "500 mg",
      dosageForm: "Capsule",
      batchNumber: "LOT-AMX-2026-03",
      manufactureDate: "15 Aug 2026",
      expiryDate: "20 Aug 2028",
      quantity: 500,
      unitOfMeasure: "Capsules",
      storageLocation: "Dispensary / Shelf A-04",
      unitCostETB: 4.8,
      notes: "Sealed box of 500 capsules.",
    },
  ])

  // New line item inputs
  const [selectedMedCode, setSelectedMedCode] = useState(DEMO_MEDICINES[0].code)
  const [lineBatch, setLineBatch] = useState("")
  const [lineExpiry, setLineExpiry] = useState("2028-06-30")
  const [lineMfg, setLineMfg] = useState("2026-06-01")
  const [lineQuantity, setLineQuantity] = useState("200")
  const [lineStorage, setLineStorage] = useState(STORAGE_LOCATIONS[1])
  const [lineCost, setLineCost] = useState("12.00")
  const [lineNotes, setLineNotes] = useState("")
  const [lineError, setLineError] = useState("")

  // ── Adjustment Form State ──
  const [adjMedCode, setAdjMedCode] = useState(DEMO_MEDICINES[0].code)
  const [adjBatch, setAdjBatch] = useState("LOT-AMX-2025-01")
  const [adjReason, setAdjReason] = useState(ADJUSTMENT_REASONS[0])
  const [adjQuantity, setAdjQuantity] = useState("10")
  const [adjIsAddition, setAdjIsAddition] = useState(true)
  const [adjNotes, setAdjNotes] = useState("")
  const [adjRef, setAdjRef] = useState(`AUDIT-ADJ-${Date.now().toString().slice(-4)}`)

  // ── Metric Calculations ──
  const totalMovementsCount = movements.length
  const incomingCount = useMemo(() => movements.filter((m) => m.movementType === "Stock Received").length, [movements])
  const outgoingCount = useMemo(() => movements.filter((m) => m.movementType === "Dispensed").length, [movements])
  const adjustmentCount = useMemo(
    () => movements.filter((m) => m.movementType === "Adjustment" || m.movementType === "Quarantined" || m.movementType === "Transferred" || m.movementType === "Returned").length,
    [movements]
  )
  const underReviewCount = useMemo(() => movements.filter((m) => m.status === "Under Review").length, [movements])

  // ── Tab Counts ──
  const receivingTabCount = useMemo(() => movements.filter((m) => m.movementType === "Stock Received").length, [movements])
  const adjustmentsTabCount = useMemo(
    () => movements.filter((m) => m.movementType !== "Stock Received").length,
    [movements]
  )

  // ── Summary Metric Card Click ──
  const handleSummaryMetricClick = (metric: string) => {
    if (activeSummaryMetric === metric) {
      setActiveSummaryMetric(null)
    } else {
      setActiveSummaryMetric(metric)
      setCurrentPage(1)
    }
  }

  // ── Filtered Records ──
  const filteredMovements = useMemo(() => {
    return movements.filter((rec) => {
      // Tab filter
      if (activeTab === "receiving" && rec.movementType !== "Stock Received") return false
      if (activeTab === "adjustments" && rec.movementType === "Stock Received") return false

      // Summary metric filter
      if (activeSummaryMetric === "incoming" && rec.movementType !== "Stock Received") return false
      if (activeSummaryMetric === "outgoing" && rec.movementType !== "Dispensed") return false
      if (activeSummaryMetric === "adjustments" && rec.movementType !== "Adjustment" && rec.movementType !== "Quarantined") {
        return false
      }
      if (activeSummaryMetric === "review" && rec.status !== "Under Review") return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesRef = rec.referenceNumber.toLowerCase().includes(q) || rec.id.toLowerCase().includes(q)
        const matchesUser = rec.performedBy.toLowerCase().includes(q)
        const matchesSupplier = rec.receivingDetails?.supplierOrSource.toLowerCase().includes(q)
        const matchesItem = rec.items.some(
          (it) =>
            it.medicineName.toLowerCase().includes(q) ||
            it.genericName.toLowerCase().includes(q) ||
            it.medicineCode.toLowerCase().includes(q) ||
            it.batchNumber.toLowerCase().includes(q)
        )
        if (!matchesRef && !matchesUser && !matchesSupplier && !matchesItem) return false
      }

      // Movement Type filter
      if (typeFilter !== "All Types" && rec.movementType !== typeFilter) return false

      // Status filter
      if (statusFilter !== "All Statuses" && rec.status !== statusFilter) return false

      // Medicine filter
      if (medicineFilter !== "All Medicines") {
        const hasMed = rec.items.some((it) => it.medicineName === medicineFilter || it.medicineCode === medicineFilter)
        if (!hasMed) return false
      }

      // Location filter
      if (locationFilter !== "All Locations") {
        const hasLoc =
          rec.receivingDetails?.receivingStore.includes(locationFilter) ||
          rec.items.some((it) => it.storageLocation.includes(locationFilter))
        if (!hasLoc) return false
      }

      // Date filter
      if (dateFilter === "Today" && rec.date !== "2026-10-16") return false
      if (dateFilter === "Past 7 Days" && !rec.date.startsWith("2026-10")) return false

      return true
    })
  }, [
    movements,
    activeTab,
    activeSummaryMetric,
    searchQuery,
    typeFilter,
    statusFilter,
    medicineFilter,
    locationFilter,
    dateFilter,
  ])

  // Pagination calculation
  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMovements.slice(start, start + pageSize)
  }, [filteredMovements, currentPage, pageSize])

  // Clear filters
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "All Types" ||
    statusFilter !== "All Statuses" ||
    medicineFilter !== "All Medicines" ||
    locationFilter !== "All Locations" ||
    dateFilter !== "All Dates" ||
    activeSummaryMetric !== null

  const clearAllFilters = () => {
    setSearchQuery("")
    setTypeFilter("All Types")
    setStatusFilter("All Statuses")
    setMedicineFilter("All Medicines")
    setLocationFilter("All Locations")
    setDateFilter("All Dates")
    setActiveSummaryMetric(null)
    setCurrentPage(1)
  }

  // ── Receive Stock Handlers ──
  const handleOpenReceiveModal = () => {
    setGrnReference(`GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`)
    setReceiveStep(1)
    setStep1Error("")
    setLineError("")
    setReceiveModalOpen(true)
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplier.trim() || !deliveryNote.trim()) {
      setStep1Error("Supplier and delivery note / waybill reference are required.")
      return
    }
    setStep1Error("")
    setReceiveStep(2)
  }

  const handleAddLineItem = () => {
    setLineError("")
    const med = DEMO_MEDICINES.find((m) => m.code === selectedMedCode)
    if (!med) return

    if (!lineBatch.trim()) {
      setLineError("Batch / lot number is required.")
      return
    }

    const qty = parseInt(lineQuantity)
    if (isNaN(qty) || qty <= 0) {
      setLineError("Quantity received must be greater than zero.")
      return
    }

    // Expiry date validation: Must be in future
    if (lineExpiry) {
      const expDate = new Date(lineExpiry)
      const today = new Date("2026-10-16")
      if (expDate <= today) {
        setLineError("Safety Validation: Cannot receive expired medicine. Expiry date must be in the future.")
        return
      }
    }

    const newItem: StockMovementLineItem = {
      id: `TEMP-${Date.now()}`,
      medicineId: med.id,
      medicineName: med.name,
      genericName: med.genericName,
      medicineCode: med.code,
      strength: med.strength,
      dosageForm: med.dosageForm,
      batchNumber: lineBatch.trim().toUpperCase(),
      manufactureDate: lineMfg,
      expiryDate: lineExpiry,
      quantity: qty,
      unitOfMeasure: med.unitOfMeasure,
      storageLocation: lineStorage,
      unitCostETB: parseFloat(lineCost) || 0,
      notes: lineNotes.trim(),
    }

    setLineItems([...lineItems, newItem])
    setLineBatch("")
    setLineQuantity("100")
    setLineNotes("")
    showToast(`Added ${med.name} (${lineBatch || "batch"}) to consignment lines.`)
  }

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((i) => i.id !== id))
  }

  const handleConfirmAndPostReceipt = () => {
    if (lineItems.length === 0) {
      setLineError("Consignment must contain at least one medicine line item.")
      setReceiveStep(2)
      return
    }

    setIsSubmittingReceive(true)
    setTimeout(() => {
      const newRecord: StockMovementRecord = {
        id: `TXN-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        referenceNumber: grnReference,
        movementType: "Stock Received",
        status: "Posted",
        timestamp: "16 Oct 2026 · 11:35 AM",
        date: "2026-10-16",
        performedBy: receivedBy,
        receivingDetails: {
          supplierOrSource: supplier,
          deliveryNoteNumber: deliveryNote,
          receivingStore: receivingLocation,
          verifiedBy: receivedBy,
        },
        items: lineItems.map((li) => ({
          ...li,
          previousQuantity: 0,
          resultingQuantity: li.quantity,
        })),
        summaryNotes: consignmentNotes,
        auditEvents: [
          {
            timestamp: "16 Oct 2026 · 11:32 AM",
            action: "Goods Inspected & Count Verified",
            actor: receivedBy,
            notes: `Delivery Note ${deliveryNote} checked against physical cartons.`,
          },
          {
            timestamp: "16 Oct 2026 · 11:35 AM",
            action: "Stock Receipt Posted to Inventory",
            actor: receivedBy,
            notes: `${lineItems.length} lines committed. Usable stock increased.`,
          },
        ],
      }

      setMovements([newRecord, ...movements])
      setPostedSuccessRecord(newRecord)
      setIsSubmittingReceive(false)
      setReceiveStep(4)
      showToast(`Stock Receipt ${grnReference} posted successfully.`)
    }, 900)
  }

  // ── Stock Adjustment Handlers ──
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    const med = DEMO_MEDICINES.find((m) => m.code === adjMedCode)
    if (!med) return

    const qtyNumber = parseInt(adjQuantity)
    if (isNaN(qtyNumber) || qtyNumber <= 0) return

    const netChange = adjIsAddition ? qtyNumber : -qtyNumber

    const newRecord: StockMovementRecord = {
      id: `TXN-ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceNumber: adjRef || `ADJ-2026-${Date.now().toString().slice(-4)}`,
      movementType: "Adjustment",
      status: "Posted",
      timestamp: "16 Oct 2026 · 11:40 AM",
      date: "2026-10-16",
      performedBy: "Ato Bekele Tolosa, RPh",
      adjustmentDetails: {
        reason: adjReason,
        approvalRef: adjRef,
      },
      items: [
        {
          id: `LINE-ADJ-${Date.now()}`,
          medicineId: med.id,
          medicineName: med.name,
          genericName: med.genericName,
          medicineCode: med.code,
          strength: med.strength,
          dosageForm: med.dosageForm,
          batchNumber: adjBatch,
          expiryDate: "2027-12-31",
          quantity: netChange,
          unitOfMeasure: med.unitOfMeasure,
          storageLocation: "Dispensary / Shelf A-04",
          notes: adjNotes,
        },
      ],
      summaryNotes: `Authorized stock adjustment: ${adjReason}`,
      auditEvents: [
        {
          timestamp: "16 Oct 2026 · 11:40 AM",
          action: "Authorized Adjustment Committed",
          actor: "Ato Bekele Tolosa, RPh",
          notes: adjNotes || adjReason,
        },
      ],
    }

    setMovements([newRecord, ...movements])
    setAdjustmentModalOpen(false)
    showToast(`Stock adjustment committed for ${med.name} (${netChange > 0 ? `+${netChange}` : netChange}).`)
  }

  // ── Access check state ──
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="sm-page-wrapper">
        <div className="sm-header">
          <div className="sm-breadcrumb">
            <span className="sm-breadcrumb-item" onClick={() => onNavigate("pharmacy-dashboard")}>
              Pharmacy
            </span>
            <Icon name="chevron" size={12} />
            <span className="sm-breadcrumb-item" onClick={() => onNavigate("medication-stock")}>
              Inventory
            </span>
            <Icon name="chevron" size={12} />
            <span className="sm-breadcrumb-active">Stock Movements</span>
          </div>
          <div className="sm-header-main">
            <div className="sm-header-title">
              <h1>Stock Movements</h1>
              <p>Record incoming medicine stock and review inventory transactions.</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #dbe5e5" }}>
          <Icon name="shield" size={40} style={{ color: "#ac393d", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "18px", color: "#142e42", margin: "0 0 8px" }}>Access Restricted</h2>
          <p style={{ color: "#5a7184", maxWidth: "480px", margin: "0 auto 20px" }}>
            You do not have the required permission (<code>stock-movements</code> or <code>pharmacy</code>) to record stock receiving or inspect inventory ledger movements.
          </p>
          <Button className="button" onClick={() => onNavigate("pharmacy-dashboard")}>
            Return to Pharmacy Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="sm-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#142e42",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "6px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
          }}
        >
          <Icon name="check" size={16} style={{ color: "#10b981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <header className="sm-header">
        <nav aria-label="Breadcrumbs" className="sm-breadcrumb">
          <span className="sm-breadcrumb-item" onClick={() => onNavigate("pharmacy-dashboard")}>
            Pharmacy
          </span>
          <Icon name="chevron" size={12} />
          <span className="sm-breadcrumb-item" onClick={() => onNavigate("medication-stock")}>
            Inventory
          </span>
          <Icon name="chevron" size={12} />
          <span className="sm-breadcrumb-active">Stock Movements</span>
        </nav>

        <div className="sm-header-main">
          <div className="sm-header-title">
            <h1>Stock Movements</h1>
            <p>Record incoming medicine stock and review inventory transactions.</p>
          </div>

          <div className="sm-header-actions">
            <div className="sm-header-pill" title="Store Scope">
              <Icon name="building" size={14} />
              <span>Oda Roba Pharmacy · Bale Robe</span>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => setExportModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="download" size={14} />
              Export
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => setAdjustmentModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Record an authorized manual count adjustment or breakage write-off"
            >
              <Icon name="edit" size={14} />
              Record Adjustment
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={handleOpenReceiveModal}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="plus" size={14} />
              Receive Stock
            </button>
          </div>
        </div>
      </header>

      {/* Summary Row (4 Restrained Operational Information Cards) */}
      <section className="sm-summary-grid" aria-label="Inventory Activity Summary">
        {/* Card 1: Total Movements */}
        <div
          className={`sm-summary-card ${activeSummaryMetric === "all" ? "active" : ""}`}
          onClick={() => handleSummaryMetricClick("all")}
          role="button"
          tabIndex={0}
          aria-pressed={activeSummaryMetric === "all"}
        >
          <div className="sm-summary-top">
            <span>Recorded Movements</span>
            <Icon name="grid" size={16} />
          </div>
          <div className="sm-summary-count">{totalMovementsCount}</div>
          <div className="sm-summary-subtext">Ledger transactions in current view</div>
        </div>

        {/* Card 2: Incoming Stock Receipts */}
        <div
          className={`sm-summary-card ${activeSummaryMetric === "incoming" ? "active" : ""}`}
          onClick={() => handleSummaryMetricClick("incoming")}
          role="button"
          tabIndex={0}
          aria-pressed={activeSummaryMetric === "incoming"}
        >
          <div className="sm-summary-top">
            <span style={{ color: "#137333" }}>Stock Receipts (GRNs)</span>
            <Icon name="inbox" size={16} style={{ color: "#137333" }} />
          </div>
          <div className="sm-summary-count" style={{ color: "#137333" }}>
            {incomingCount}
          </div>
          <div className="sm-summary-subtext">Incoming consignments committed</div>
        </div>

        {/* Card 3: Outgoing Dispensed */}
        <div
          className={`sm-summary-card ${activeSummaryMetric === "outgoing" ? "active" : ""}`}
          onClick={() => handleSummaryMetricClick("outgoing")}
          role="button"
          tabIndex={0}
          aria-pressed={activeSummaryMetric === "outgoing"}
        >
          <div className="sm-summary-top">
            <span style={{ color: "#0369a1" }}>Dispensed Issues</span>
            <Icon name="pill" size={16} style={{ color: "#0369a1" }} />
          </div>
          <div className="sm-summary-count" style={{ color: "#0369a1" }}>
            {outgoingCount}
          </div>
          <div className="sm-summary-subtext">Prescription deductions posted</div>
        </div>

        {/* Card 4: Adjustments & Quarantine */}
        <div
          className={`sm-summary-card ${activeSummaryMetric === "adjustments" ? "active" : ""}`}
          onClick={() => handleSummaryMetricClick("adjustments")}
          role="button"
          tabIndex={0}
          aria-pressed={activeSummaryMetric === "adjustments"}
        >
          <div className="sm-summary-top">
            <span style={{ color: "#b45309" }}>Adjustments &amp; Transfers</span>
            <Icon name="arrow" size={16} style={{ color: "#b45309" }} />
          </div>
          <div className="sm-summary-count" style={{ color: "#b45309" }}>
            {adjustmentCount}
          </div>
          <div className="sm-summary-subtext">Count reconciliations &amp; quarantines</div>
        </div>
      </section>

      {/* Tabs Row */}
      <div className="sm-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          className={`sm-tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("all")
            setCurrentPage(1)
          }}
        >
          All Movements
          <span className="sm-tab-count">{movements.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "receiving"}
          className={`sm-tab-button ${activeTab === "receiving" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("receiving")
            setCurrentPage(1)
          }}
        >
          Stock Receiving (GRNs)
          <span className="sm-tab-count">{receivingTabCount}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "adjustments"}
          className={`sm-tab-button ${activeTab === "adjustments" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("adjustments")
            setCurrentPage(1)
          }}
        >
          Adjustments &amp; Other Movements
          <span className="sm-tab-count">{adjustmentsTabCount}</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <section className="sm-toolbar" aria-label="Transaction Search & Filters">
        <div className="sm-toolbar-row">
          {/* Search box */}
          <div className="sm-search-box">
            <span className="sm-search-icon">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              className="sm-search-input"
              placeholder="Search medicine, batch number, transaction reference, or user…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Movement Type Filter */}
          <select
            className="sm-filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by movement type"
          >
            <option value="All Types">All Movement Types</option>
            <option value="Stock Received">Stock Received</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Returned">Returned</option>
            <option value="Transferred">Transferred</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Released from Quarantine">Released from Quarantine</option>
            <option value="Expired or Removed from Usable Stock">Expired or Removed</option>
          </select>

          {/* Medicine Filter */}
          <select
            className="sm-filter-select"
            value={medicineFilter}
            onChange={(e) => {
              setMedicineFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by medicine"
          >
            <option value="All Medicines">All Medicines</option>
            {DEMO_MEDICINES.map((m) => (
              <option key={m.code} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="sm-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by status"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Posted">Posted (Committed)</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Reversed">Reversed</option>
          </select>

          {/* Date Filter */}
          <select
            className="sm-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by date range"
          >
            <option value="All Dates">All Recorded Dates</option>
            <option value="Today">Today (16 Oct 2026)</option>
            <option value="Past 7 Days">Past 7 Days</option>
          </select>

          {/* Location Filter */}
          <select
            className="sm-filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by storage location"
          >
            <option value="All Locations">All Storage Locations</option>
            {STORAGE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Active Chips Row */}
        {hasActiveFilters && (
          <div className="sm-active-chips">
            <span className="sm-active-chips-label">Active Filters:</span>

            {searchQuery.trim() && (
              <span className="sm-chip">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {activeSummaryMetric && (
              <span className="sm-chip">
                Metric: {activeSummaryMetric.toUpperCase()}
                <button type="button" onClick={() => setActiveSummaryMetric(null)} aria-label="Clear metric filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {typeFilter !== "All Types" && (
              <span className="sm-chip">
                Type: {typeFilter}
                <button type="button" onClick={() => setTypeFilter("All Types")} aria-label="Clear type filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {medicineFilter !== "All Medicines" && (
              <span className="sm-chip">
                Medicine: {medicineFilter}
                <button type="button" onClick={() => setMedicineFilter("All Medicines")} aria-label="Clear medicine filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {statusFilter !== "All Statuses" && (
              <span className="sm-chip">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter("All Statuses")} aria-label="Clear status filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {dateFilter !== "All Dates" && (
              <span className="sm-chip">
                Date: {dateFilter}
                <button type="button" onClick={() => setDateFilter("All Dates")} aria-label="Clear date filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {locationFilter !== "All Locations" && (
              <span className="sm-chip">
                Location: {locationFilter}
                <button type="button" onClick={() => setLocationFilter("All Locations")} aria-label="Clear location filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            <button type="button" className="sm-clear-filters-btn" onClick={clearAllFilters}>
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* Main Stock Movement Table */}
      <section className="sm-table-container">
        <div className="sm-table-header-meta">
          <div>
            Showing <strong>{filteredMovements.length}</strong> of <strong>{movements.length}</strong> stock movements
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#137333", marginRight: 4 }} />
              Stock Received
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#0369a1", marginRight: 4 }} />
              Dispensed
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b45309", marginRight: 4 }} />
              Adjustment
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6b21a8", marginRight: 4 }} />
              Quarantined
            </span>
          </div>
        </div>

        <div className="sm-table-scroll">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>Date &amp; Time</th>
                <th>Medicine Formulation</th>
                <th>Batch / Lot</th>
                <th>Movement Type</th>
                <th style={{ textAlign: "right" }}>Quantity Change</th>
                <th style={{ textAlign: "right" }}>Balance (Prev → New)</th>
                <th>Performed By</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px 16px", textAlign: "center", color: "#5a7184" }}>
                    <Icon name="search" size={28} style={{ color: "#a0b0b9", marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#142e42" }}>No stock movements match the criteria</p>
                    <p style={{ margin: 0, fontSize: "12px" }}>Try clearing search keywords or active filters.</p>
                    <button
                      type="button"
                      className="sm-clear-filters-btn"
                      onClick={clearAllFilters}
                      style={{ marginTop: "12px", display: "inline-block" }}
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((rec) => {
                  const isMulti = rec.items.length > 1
                  const firstItem = rec.items[0]

                  // Quantity calculation
                  const totalNetChange = rec.items.reduce((acc, curr) => acc + curr.quantity, 0)
                  const isPositive = totalNetChange > 0
                  const isNegative = totalNetChange < 0

                  return (
                    <tr
                      key={rec.id}
                      className={selectedRecord?.id === rec.id ? "selected" : ""}
                      onClick={() => {
                        setSelectedRecord(rec)
                        setDrawerActiveTab("items")
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* 1. Transaction Ref */}
                      <td>
                        <div style={{ fontWeight: 700, color: "#142e42", fontFamily: "monospace" }}>
                          {rec.referenceNumber}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{rec.id}</div>
                      </td>

                      {/* 2. Date & Time */}
                      <td>
                        <div style={{ fontWeight: 500 }}>{rec.timestamp}</div>
                      </td>

                      {/* 3. Medicine Formulation */}
                      <td>
                        {isMulti ? (
                          <div>
                            <div style={{ fontWeight: 600, color: "#087e83" }}>
                              {rec.items.length} Medicines in Consignment
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#5a7184" }}>
                              {firstItem.medicineName} (+{rec.items.length - 1} more)
                            </div>
                          </div>
                        ) : firstItem ? (
                          <div>
                            <div style={{ fontWeight: 600, color: "#142e42" }}>{firstItem.medicineName}</div>
                            <div style={{ fontSize: "11px", color: "#5a7184" }}>
                              {firstItem.strength} · {firstItem.dosageForm}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>

                      {/* 4. Batch / Lot */}
                      <td>
                        {isMulti ? (
                          <span style={{ fontSize: "12px", color: "#64748b" }}>Multi-batch</span>
                        ) : firstItem ? (
                          <div>
                            <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 600 }}>
                              {firstItem.batchNumber}
                            </span>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Exp: {firstItem.expiryDate}</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* 5. Movement Type */}
                      <td>
                        {rec.movementType === "Stock Received" ? (
                          <span className="sm-badge sm-type-received">
                            <Icon name="inbox" size={11} /> Stock Received
                          </span>
                        ) : rec.movementType === "Dispensed" ? (
                          <span className="sm-badge sm-type-dispensed">
                            <Icon name="pill" size={11} /> Dispensed
                          </span>
                        ) : rec.movementType === "Quarantined" ? (
                          <span className="sm-badge sm-type-quarantined">
                            <Icon name="lock" size={11} /> Quarantined
                          </span>
                        ) : rec.movementType === "Adjustment" ? (
                          <span className="sm-badge sm-type-adjustment">
                            <Icon name="edit" size={11} /> Adjustment
                          </span>
                        ) : rec.movementType === "Transferred" ? (
                          <span className="sm-badge sm-type-transferred">
                            <Icon name="arrow" size={11} /> Transferred
                          </span>
                        ) : (
                          <span className="sm-badge sm-type-returned">
                            <Icon name="check" size={11} /> {rec.movementType}
                          </span>
                        )}
                      </td>

                      {/* 6. Quantity Change */}
                      <td style={{ textAlign: "right" }}>
                        <div
                          className={
                            isPositive
                              ? "sm-qty-positive"
                              : isNegative
                              ? "sm-qty-negative"
                              : "sm-qty-neutral"
                          }
                          style={{ fontSize: "13.5px" }}
                        >
                          {isPositive ? `+${totalNetChange.toLocaleString()}` : totalNetChange.toLocaleString()}{" "}
                          <span style={{ fontSize: "11px", fontWeight: 400, color: "#64748b" }}>
                            {firstItem?.unitOfMeasure || "units"}
                          </span>
                        </div>
                      </td>

                      {/* 7. Balance (Prev -> New) */}
                      <td style={{ textAlign: "right" }}>
                        {firstItem && firstItem.previousQuantity !== undefined && firstItem.resultingQuantity !== undefined ? (
                          <div style={{ fontSize: "12px" }}>
                            <span style={{ color: "#64748b" }}>{firstItem.previousQuantity.toLocaleString()}</span>
                            <span style={{ color: "#94a3b8", margin: "0 4px" }}>→</span>
                            <span style={{ fontWeight: 700, color: "#142e42" }}>
                              {firstItem.resultingQuantity.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>N/A (Multi)</span>
                        )}
                      </td>

                      {/* 8. Performed By */}
                      <td>
                        <div style={{ fontSize: "12.5px", color: "#1e293b" }}>{rec.performedBy}</div>
                        {rec.receivingDetails && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Src: {rec.receivingDetails.supplierOrSource.split(" ")[0]}
                          </div>
                        )}
                      </td>

                      {/* 9. Status */}
                      <td>
                        {rec.status === "Posted" ? (
                          <span className="sm-badge sm-status-posted">
                            <Icon name="check" size={11} /> Posted
                          </span>
                        ) : rec.status === "Under Review" ? (
                          <span className="sm-badge sm-status-review">
                            <Icon name="clock" size={11} /> Under Review
                          </span>
                        ) : (
                          <span className="sm-badge sm-status-draft">{rec.status}</span>
                        )}
                      </td>

                      {/* 10. Actions */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRecord(rec)
                            setDrawerActiveTab("items")
                          }}
                          title="Inspect movement details & audit trail"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="sm-pagination">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredMovements.length} total filtered transactions)
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className="button button-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* ── Slide-Over Transaction Details Drawer ── */}
      {selectedRecord && (
        <div className="sm-drawer-overlay" onClick={() => setSelectedRecord(null)}>
          <aside className="sm-drawer" onClick={(e) => e.stopPropagation()} aria-label="Transaction Details Drawer">
            {/* Drawer Head */}
            <div className="sm-drawer-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#142e42", fontFamily: "monospace" }}>
                    {selectedRecord.referenceNumber}
                  </h2>
                  <span className="sm-badge sm-status-posted">{selectedRecord.status}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#5a7184", marginTop: "3px" }}>
                  {selectedRecord.movementType} · {selectedRecord.timestamp}
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close drawer"
                style={{ padding: "6px" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="sm-drawer-tabs">
              <button
                type="button"
                className={`sm-drawer-tab-btn ${drawerActiveTab === "items" ? "active" : ""}`}
                onClick={() => setDrawerActiveTab("items")}
              >
                Line Items &amp; Details ({selectedRecord.items.length})
              </button>
              <button
                type="button"
                className={`sm-drawer-tab-btn ${drawerActiveTab === "audit" ? "active" : ""}`}
                onClick={() => setDrawerActiveTab("audit")}
              >
                Audit Trail ({selectedRecord.auditEvents.length})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="sm-drawer-body">
              {drawerActiveTab === "items" && (
                <>
                  {/* Transaction Overview Cards */}
                  <div className="sm-detail-grid">
                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Movement Type</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#142e42", marginTop: "2px" }}>
                        {selectedRecord.movementType}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>Transaction: {selectedRecord.id}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Performed By</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#142e42", marginTop: "2px" }}>
                        {selectedRecord.performedBy}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>Authorized Pharmacist</div>
                    </div>

                    {selectedRecord.receivingDetails && (
                      <>
                        <div>
                          <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Supplier / Source</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#087e83", marginTop: "2px" }}>
                            {selectedRecord.receivingDetails.supplierOrSource}
                          </div>
                          <div style={{ fontSize: "11px", color: "#5a7184" }}>
                            DN: {selectedRecord.receivingDetails.deliveryNoteNumber}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Receiving Store</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#142e42", marginTop: "2px" }}>
                            {selectedRecord.receivingDetails.receivingStore}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedRecord.transferDetails && (
                      <div>
                        <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Transfer Path</div>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#142e42", marginTop: "2px" }}>
                          {selectedRecord.transferDetails.sourceLocation} → {selectedRecord.transferDetails.destinationLocation}
                        </div>
                      </div>
                    )}

                    {selectedRecord.adjustmentDetails && (
                      <div>
                        <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Adjustment Reason</div>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#b45309", marginTop: "2px" }}>
                          {selectedRecord.adjustmentDetails.reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Notes */}
                  {selectedRecord.summaryNotes && (
                    <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", border: "1px solid #dbe5e5", borderRadius: "6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#142e42", marginBottom: "4px" }}>
                        Clinical / Transaction Notes
                      </div>
                      <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>{selectedRecord.summaryNotes}</div>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 8px", color: "#142e42" }}>
                      Stock Movement Line Items
                    </h3>
                    <div style={{ border: "1px solid #dbe5e5", borderRadius: "6px", overflow: "hidden", fontSize: "12.5px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Medicine</th>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Batch &amp; Expiry</th>
                            <th style={{ padding: "8px 10px", textAlign: "right" }}>Quantity</th>
                            <th style={{ padding: "8px 10px", textAlign: "right" }}>Balance</th>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Storage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecord.items.map((item) => {
                            const isPos = item.quantity > 0
                            return (
                              <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "8px 10px" }}>
                                  <div style={{ fontWeight: 600 }}>{item.medicineName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                                    {item.strength} · {item.dosageForm}
                                  </div>
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <div style={{ fontFamily: "monospace", fontWeight: 600 }}>{item.batchNumber}</div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>Exp: {item.expiryDate}</div>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                    color: isPos ? "#137333" : "#b91c1c",
                                  }}
                                >
                                  {isPos ? `+${item.quantity}` : item.quantity} {item.unitOfMeasure}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontSize: "11.5px" }}>
                                  {item.previousQuantity !== undefined && item.resultingQuantity !== undefined ? (
                                    <span>
                                      {item.previousQuantity} → <strong>{item.resultingQuantity}</strong>
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td style={{ padding: "8px 10px", fontSize: "11.5px", color: "#475569" }}>
                                  {item.storageLocation}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {drawerActiveTab === "audit" && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px", color: "#142e42" }}>
                    Traceable Audit Timeline
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedRecord.auditEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "10px 14px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#e0f2fe",
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <Icon name="check" size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                            <strong style={{ color: "#142e42" }}>{evt.action}</strong>
                            <span style={{ color: "#64748b" }}>{evt.timestamp}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#087e83", fontWeight: 500, marginTop: "2px" }}>
                            {evt.actor}
                          </div>
                          {evt.notes && (
                            <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px", lineHeight: 1.4 }}>
                              {evt.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="sm-drawer-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => showToast(`Voucher for ${selectedRecord.referenceNumber} sent to printer.`)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="printer" size={14} />
                Print Voucher
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => setSelectedRecord(null)}
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Receive Stock Guided Multi-Step Wizard Modal ── */}
      {receiveModalOpen && (
        <div className="sm-modal-overlay" onClick={() => !isSubmittingReceive && setReceiveModalOpen(false)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Receive Stock Consignment">
            {/* Modal Head */}
            <div className="sm-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Receive Medicine Stock Consignment
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Goods Received Note (GRN) Entry — Oda Roba Pharmacy
                </p>
              </div>
              {!isSubmittingReceive && (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setReceiveModalOpen(false)}
                  aria-label="Close modal"
                >
                  <Icon name="x" size={18} />
                </button>
              )}
            </div>

            {/* Stepper Header */}
            <div className="sm-stepper">
              <div className={`sm-step ${receiveStep === 1 ? "active" : receiveStep > 1 ? "completed" : ""}`}>
                <span className="sm-step-number">1</span>
                <span>Receipt Info</span>
              </div>
              <div className="sm-step-divider" />
              <div className={`sm-step ${receiveStep === 2 ? "active" : receiveStep > 2 ? "completed" : ""}`}>
                <span className="sm-step-number">2</span>
                <span>Medicine Batches ({lineItems.length})</span>
              </div>
              <div className="sm-step-divider" />
              <div className={`sm-step ${receiveStep === 3 ? "active" : receiveStep > 3 ? "completed" : ""}`}>
                <span className="sm-step-number">3</span>
                <span>Review &amp; Post</span>
              </div>
            </div>

            {/* STEP 1: Receipt Information */}
            {receiveStep === 1 && (
              <form onSubmit={handleStep1Next}>
                <div className="sm-modal-body">
                  <div className="sm-notice-box">
                    <strong>Goods Received Protocol:</strong> All incoming pharmaceuticals delivered to Oda Roba General Hospital
                    must be verified against the official supplier delivery note. Batch numbers, manufacture dates, and cold chain
                    indicators must be inspected prior to posting.
                  </div>

                  {step1Error && (
                    <div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px" }}>
                      {step1Error}
                    </div>
                  )}

                  <div className="sm-form-row">
                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        GRN Reference <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="sm-form-input"
                        value={grnReference}
                        onChange={(e) => setGrnReference(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">Receiving Date &amp; Time</label>
                      <input
                        type="text"
                        className="sm-form-input"
                        value={receiptDate}
                        disabled
                        style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        Supplier / Source <span className="req">*</span>
                      </label>
                      <select
                        className="sm-filter-select"
                        style={{ width: "100%" }}
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                      >
                        {SUPPLIERS_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        Delivery Note / Waybill Ref <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="sm-form-input"
                        placeholder="e.g., DN-EPSA-99412-B"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-field">
                      <label className="sm-form-label">Receiving Store / Destination</label>
                      <select
                        className="sm-filter-select"
                        style={{ width: "100%" }}
                        value={receivingLocation}
                        onChange={(e) => setReceivingLocation(e.target.value)}
                      >
                        {STORAGE_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">Received By (Pharmacist)</label>
                      <input
                        type="text"
                        className="sm-form-input"
                        value={receivedBy}
                        disabled
                        style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  <div className="sm-form-field">
                    <label className="sm-form-label">Consignment Inspection Notes</label>
                    <textarea
                      rows={2}
                      className="sm-form-input"
                      style={{ resize: "vertical" }}
                      placeholder="Notes on carton conditions, temperature monitoring strips, tamper seals..."
                      value={consignmentNotes}
                      onChange={(e) => setConsignmentNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm-modal-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setReceiveModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Next: Add Medicine Line Items
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Medicine and Batch Details */}
            {receiveStep === 2 && (
              <div className="sm-modal-body">
                {lineError && (
                  <div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px" }}>
                    {lineError}
                  </div>
                )}

                {/* Sub-card to add line item */}
                <div style={{ padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #dbe5e5", borderRadius: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#142e42", marginBottom: "10px" }}>
                    Add Medicine &amp; Batch Line Item
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-field">
                      <label className="sm-form-label">Select Medicine from Formulary</label>
                      <select
                        className="sm-filter-select"
                        style={{ width: "100%" }}
                        value={selectedMedCode}
                        onChange={(e) => setSelectedMedCode(e.target.value)}
                      >
                        {DEMO_MEDICINES.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        Batch / Lot Number <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="sm-form-input"
                        placeholder="e.g., LOT-AMX-2026-04"
                        value={lineBatch}
                        onChange={(e) => setLineBatch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sm-form-row" style={{ marginTop: "10px" }}>
                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        Expiry Date <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        className="sm-form-input"
                        value={lineExpiry}
                        onChange={(e) => setLineExpiry(e.target.value)}
                      />
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">
                        Quantity Received <span className="req">*</span>
                      </label>
                      <input
                        type="number"
                        className="sm-form-input"
                        placeholder="e.g., 500"
                        value={lineQuantity}
                        onChange={(e) => setLineQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sm-form-row" style={{ marginTop: "10px" }}>
                    <div className="sm-form-field">
                      <label className="sm-form-label">Storage Location</label>
                      <select
                        className="sm-filter-select"
                        style={{ width: "100%" }}
                        value={lineStorage}
                        onChange={(e) => setLineStorage(e.target.value)}
                      >
                        {STORAGE_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm-form-field">
                      <label className="sm-form-label">Unit Cost (ETB)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="sm-form-input"
                        value={lineCost}
                        onChange={(e) => setLineCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handleAddLineItem}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Icon name="plus" size={14} />
                      Add to Consignment Lines
                    </button>
                  </div>
                </div>

                {/* Added Line Items Table */}
                <div className="sm-line-items-box">
                  <div className="sm-line-items-head">
                    <span style={{ fontWeight: 700, color: "#142e42" }}>
                      Consignment Lines ({lineItems.length} items added)
                    </span>
                    <span style={{ fontSize: "12px", color: "#5a7184" }}>
                      Total Units: {lineItems.reduce((acc, c) => acc + c.quantity, 0).toLocaleString()}
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Medicine</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Batch #</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Expiry Date</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Quantity</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Location</th>
                        <th style={{ padding: "8px 10px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                            No line items added yet. Fill the form above and click "Add to Consignment Lines".
                          </td>
                        </tr>
                      ) : (
                        lineItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 600 }}>{item.medicineName}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{item.batchNumber}</td>
                            <td style={{ padding: "8px 10px" }}>{item.expiryDate}</td>
                            <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#137333" }}>
                              +{item.quantity} {item.unitOfMeasure}
                            </td>
                            <td style={{ padding: "8px 10px", fontSize: "11.5px", color: "#475569" }}>
                              {item.storageLocation}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              <button
                                type="button"
                                className="icon-button"
                                onClick={() => handleRemoveLineItem(item.id)}
                                title="Remove line item"
                                style={{ color: "#b91c1c" }}
                              >
                                <Icon name="close" size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="sm-modal-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setReceiveStep(1)}
                  >
                    Back: Consignment Info
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={lineItems.length === 0}
                    onClick={() => setReceiveStep(3)}
                  >
                    Review &amp; Confirm ({lineItems.length} lines)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Confirm */}
            {receiveStep === 3 && (
              <div className="sm-modal-body">
                <div className="sm-warning-box">
                  <strong>Posting Confirmation Disclaimer:</strong> Confirming this receipt will permanently record
                  transaction <strong>{grnReference}</strong> into the hospital stock ledger and immediately increment
                  usable dispensing inventory for the specified batches.
                </div>

                {/* Consignment summary box */}
                <div className="sm-detail-grid">
                  <div>
                    <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>GRN Reference</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", color: "#142e42" }}>
                      {grnReference}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Supplier / Source</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#087e83" }}>{supplier}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Delivery Note #</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{deliveryNote}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>Receiving Store</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{receivingLocation}</div>
                  </div>
                </div>

                {/* Final line items table */}
                <div className="sm-line-items-box">
                  <div className="sm-line-items-head">
                    <span style={{ fontWeight: 700, color: "#142e42" }}>Line Items to be Committed</span>
                    <span style={{ fontSize: "12px", color: "#137333", fontWeight: 700 }}>
                      Total Units: {lineItems.reduce((acc, c) => acc + c.quantity, 0).toLocaleString()}
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Medicine Formulation</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Batch Number</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Expiry Date</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Quantity</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Target Shelf</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{item.medicineName}</td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{item.batchNumber}</td>
                          <td style={{ padding: "8px 10px" }}>{item.expiryDate}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#137333" }}>
                            +{item.quantity.toLocaleString()} {item.unitOfMeasure}
                          </td>
                          <td style={{ padding: "8px 10px", fontSize: "11.5px", color: "#475569" }}>
                            {item.storageLocation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm-modal-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={isSubmittingReceive}
                    onClick={() => setReceiveStep(2)}
                  >
                    Back to Edit Lines
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={isSubmittingReceive}
                    onClick={handleConfirmAndPostReceipt}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {isSubmittingReceive ? (
                      <>
                        <Icon name="refresh" size={14} />
                        Committing to Stock Ledger...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        Confirm &amp; Post Receipt
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success Confirmation */}
            {receiveStep === 4 && postedSuccessRecord && (
              <div className="sm-modal-body" style={{ textAlign: "center", padding: "36px 24px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#e6f4ea",
                    color: "#137333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Icon name="check" size={32} />
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#142e42", margin: "0 0 6px" }}>
                  Stock Receipt Confirmed &amp; Committed
                </h3>
                <p style={{ color: "#5a7184", margin: "0 0 20px", fontSize: "13.5px" }}>
                  Goods Received Note <strong>{postedSuccessRecord.referenceNumber}</strong> has been committed to the
                  authoritative stock ledger. Usable dispensing inventory has been updated.
                </p>

                <div
                  style={{
                    maxWidth: "460px",
                    margin: "0 auto 24px",
                    padding: "14px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #dbe5e5",
                    borderRadius: "6px",
                    textAlign: "left",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#5a7184" }}>Transaction ID:</span>
                    <strong style={{ fontFamily: "monospace" }}>{postedSuccessRecord.id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#5a7184" }}>Consignment Supplier:</span>
                    <strong>{postedSuccessRecord.receivingDetails?.supplierOrSource}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#5a7184" }}>Committed Line Items:</span>
                    <strong>{postedSuccessRecord.items.length} Medicines</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#5a7184" }}>Total Units Added:</span>
                    <strong style={{ color: "#137333" }}>
                      +{postedSuccessRecord.items.reduce((acc, c) => acc + c.quantity, 0).toLocaleString()} Units
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setReceiveModalOpen(false)
                      setSelectedRecord(postedSuccessRecord)
                      setDrawerActiveTab("items")
                    }}
                  >
                    View Receipt Details
                  </button>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setReceiveModalOpen(false)
                      onNavigate("medication-stock")
                    }}
                  >
                    View Updated Inventory
                  </button>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleOpenReceiveModal}
                  >
                    Receive Another Consignment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Record Stock Adjustment Modal ── */}
      {adjustmentModalOpen && (
        <div className="sm-modal-overlay" onClick={() => setAdjustmentModalOpen(false)}>
          <div className="sm-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Record Stock Adjustment">
            <div className="sm-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Record Authorized Stock Adjustment
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Inventory Reconciliation &amp; Damage Write-off
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAdjustmentModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div className="sm-modal-body">
                <div className="sm-warning-box">
                  <strong>Restricted Audit Procedure:</strong> Stock adjustments require documented justification
                  (physical cycle count reconciliation, damaged ampoules, or quarantine write-offs). All adjustments
                  are logged with the authenticated pharmacist identity.
                </div>

                <div className="sm-form-field">
                  <label className="sm-form-label">
                    Medicine <span className="req">*</span>
                  </label>
                  <select
                    className="sm-filter-select"
                    style={{ width: "100%" }}
                    value={adjMedCode}
                    onChange={(e) => setAdjMedCode(e.target.value)}
                  >
                    {DEMO_MEDICINES.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm-form-row">
                  <div className="sm-form-field">
                    <label className="sm-form-label">
                      Batch / Lot Number <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="sm-form-input"
                      value={adjBatch}
                      onChange={(e) => setAdjBatch(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm-form-field">
                    <label className="sm-form-label">Adjustment Direction</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
                        <input
                          type="radio"
                          name="adjDir"
                          checked={adjIsAddition}
                          onChange={() => setAdjIsAddition(true)}
                        />
                        <span style={{ color: "#137333", fontWeight: 600 }}>+ Increase (Gain)</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
                        <input
                          type="radio"
                          name="adjDir"
                          checked={!adjIsAddition}
                          onChange={() => setAdjIsAddition(false)}
                        />
                        <span style={{ color: "#b91c1c", fontWeight: 600 }}>- Decrease (Loss)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sm-form-row">
                  <div className="sm-form-field">
                    <label className="sm-form-label">
                      Quantity to Adjust <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      className="sm-form-input"
                      value={adjQuantity}
                      onChange={(e) => setAdjQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm-form-field">
                    <label className="sm-form-label">Authorization / Audit Ref</label>
                    <input
                      type="text"
                      className="sm-form-input"
                      value={adjRef}
                      onChange={(e) => setAdjRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm-form-field">
                  <label className="sm-form-label">
                    Documented Reason <span className="req">*</span>
                  </label>
                  <select
                    className="sm-filter-select"
                    style={{ width: "100%" }}
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                  >
                    {ADJUSTMENT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm-form-field">
                  <label className="sm-form-label">Supporting Notes</label>
                  <textarea
                    rows={2}
                    className="sm-form-input"
                    placeholder="Provide details on batch count or damage cause..."
                    value={adjNotes}
                    onChange={(e) => setAdjNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setAdjustmentModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Export Transactions Modal ── */}
      {exportModalOpen && (
        <div className="sm-modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="sm-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Export Transactions">
            <div className="sm-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Export Stock Movements
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Stock Ledger
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setExportModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-form-field">
                <label className="sm-form-label">Export Scope</label>
                <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "13px" }}>
                  Currently filtered view: <strong>{filteredMovements.length}</strong> transactions selected.
                </div>
              </div>

              <div className="sm-form-field">
                <label className="sm-form-label">Report Format</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "13px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="expFmt" defaultChecked />
                    <span>CSV / Excel Ledger</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input type="radio" name="expFmt" />
                    <span>PDF Official Stock Audit</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sm-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setExportModalOpen(false)
                  showToast(`Export generated: ${filteredMovements.length} records downloaded as ORHIMS_Stock_Movements.csv`)
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="download" size={14} />
                Generate &amp; Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
