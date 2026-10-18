// ORHIMS — Phase 07, Prompt 38: Medicine Inventory Management
// Oda Roba General Hospital — Main Pharmacy & Satellite Stores (Bale Robe, Ethiopia)

import React, { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button } from "../permissions/ui"
import {
  CATEGORIES,
  DEMO_MEDICINES,
  DOSAGE_FORMS,
  LOCATIONS,
  type BatchStatus,
  type MedicineBatchDetail,
  type MedicineItem,
  type MedicineStockMovement,
  type StockStatus,
} from "./model"
import "./medicine-inventory.css"

interface MedicineInventoryPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function MedicineInventoryPage({
  state = "ready",
  permissions,
  onNavigate,
}: MedicineInventoryPageProps) {
  // Authorization check
  const isAuthorized =
    permissions.has("pharmacy") ||
    permissions.has("medication-stock") ||
    permissions.has("prescription-queue") ||
    permissions.has("dispensing")

  // State
  const [medicines, setMedicines] = useState<MedicineItem[]>(DEMO_MEDICINES)
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(null)
  const [drawerTab, setDrawerTab] = useState<"batches" | "movements" | "clinical">("batches")

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDosage, setSelectedDosage] = useState("All Dosage Forms")
  const [selectedLocation, setSelectedLocation] = useState("All Storage Locations")
  const [selectedStatus, setSelectedStatus] = useState<"all" | StockStatus>("all")
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<"all" | "expiring_30" | "expiring_90" | "quarantined">("all")
  const [activeMetricFilter, setActiveMetricFilter] = useState<"all" | "available" | "low_stock" | "out_of_stock" | "expiry_alerts" | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null)
  const [deletingMedicine, setDeletingMedicine] = useState<MedicineItem | null>(null)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleConfirmDeleteMedicine = () => {
    if (!deletingMedicine) return
    const id = deletingMedicine.id
    const name = deletingMedicine.genericName
    setMedicines(medicines.filter((m) => m.id !== id))
    if (selectedMedicine?.id === id) setSelectedMedicine(null)
    setDeletingMedicine(null)
    showToast(`Medicine ${name} (${id}) archived from inventory.`)
  }

  // Add Form State
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newGeneric, setNewGeneric] = useState("")
  const [newCategory, setNewCategory] = useState<MedicineItem["category"]>("Antibiotics")
  const [newDosage, setNewDosage] = useState("Capsule")
  const [newStrength, setNewStrength] = useState("")
  const [newUnit, setNewUnit] = useState("Capsules")
  const [newLocation, setNewLocation] = useState("Dispensary / Shelf A-04")
  const [newStorageCond, setNewStorageCond] = useState("Store below 25°C in a dry place. Protect from moisture.")
  const [newReorderLevel, setNewReorderLevel] = useState("500")
  const [newTargetStock, setNewTargetStock] = useState("1500")
  const [newDescription, setNewDescription] = useState("")
  const [newManufacturer, setNewManufacturer] = useState("EPHARM (Ethiopian Pharmaceuticals Mfg)")
  const [newFormError, setNewFormError] = useState("")

  // Edit Form State
  const [editReorderLevel, setEditReorderLevel] = useState("500")
  const [editTargetStock, setEditTargetStock] = useState("1500")
  const [editStorageCond, setEditStorageCond] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Summary Metrics calculations
  const totalCount = medicines.length
  const availableCount = useMemo(() => medicines.filter((m) => m.stockStatus === "In Stock").length, [medicines])
  const lowStockCount = useMemo(() => medicines.filter((m) => m.stockStatus === "Low Stock").length, [medicines])
  const outOfStockCount = useMemo(
    () => medicines.filter((m) => m.stockStatus === "Out of Stock" || m.stockStatus === "Restricted / Quarantined").length,
    [medicines]
  )
  const expiryAlertsCount = useMemo(
    () =>
      medicines.filter((m) =>
        m.hasExpiredBatch || m.hasExpiringBatch || m.batches.some((b) => b.batchStatus === "Expired" || (b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 90))
      ).length,
    [medicines]
  )

  // Handle clicking metric cards
  const handleMetricCardClick = (metric: "all" | "available" | "low_stock" | "out_of_stock" | "expiry_alerts") => {
    if (activeMetricFilter === metric) {
      setActiveMetricFilter(null)
    } else {
      setActiveMetricFilter(metric)
      setCurrentPage(1)
    }
  }

  // Filtered Medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((item) => {
      // Search query (name, genericName, code, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesQuery =
          item.name.toLowerCase().includes(q) ||
          item.genericName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }

      // Metric card filter
      if (activeMetricFilter === "available" && item.stockStatus !== "In Stock") return false
      if (activeMetricFilter === "low_stock" && item.stockStatus !== "Low Stock") return false
      if (activeMetricFilter === "out_of_stock" && item.stockStatus !== "Out of Stock" && item.stockStatus !== "Restricted / Quarantined") {
        return false
      }
      if (activeMetricFilter === "expiry_alerts") {
        const hasExpiry =
          item.hasExpiredBatch ||
          item.hasExpiringBatch ||
          item.batches.some((b) => b.batchStatus === "Expired" || (b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 90))
        if (!hasExpiry) return false
      }

      // Dropdown status filter (if metric filter is not overriding)
      if (!activeMetricFilter && selectedStatus !== "all" && item.stockStatus !== selectedStatus) {
        return false
      }

      // Category filter
      if (selectedCategory !== "All Categories" && item.category !== selectedCategory) {
        return false
      }

      // Dosage form filter
      if (selectedDosage !== "All Dosage Forms" && item.dosageForm !== selectedDosage) {
        return false
      }

      // Location filter
      if (selectedLocation !== "All Storage Locations") {
        const matchesBatchLocation = item.batches.some((b) =>
          b.storageLocation.toLowerCase().includes(selectedLocation.toLowerCase())
        )
        if (!matchesBatchLocation) return false
      }

      // Expiry filter dropdown
      if (selectedExpiryFilter === "expiring_30") {
        if (!item.batches.some((b) => b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 30)) return false
      } else if (selectedExpiryFilter === "expiring_90") {
        if (!item.batches.some((b) => b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 90)) return false
      } else if (selectedExpiryFilter === "quarantined") {
        if (
          !item.hasExpiredBatch &&
          item.unavailableQuantity === 0 &&
          !item.batches.some((b) => b.batchStatus === "Quarantined" || b.batchStatus === "Expired")
        ) {
          return false
        }
      }

      return true
    })
  }, [
    medicines,
    searchQuery,
    activeMetricFilter,
    selectedStatus,
    selectedCategory,
    selectedDosage,
    selectedLocation,
    selectedExpiryFilter,
  ])

  // Pagination calculation
  const totalPages = Math.ceil(filteredMedicines.length / pageSize) || 1
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMedicines.slice(start, start + pageSize)
  }, [filteredMedicines, currentPage, pageSize])

  // Clear filters
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedDosage !== "All Dosage Forms" ||
    selectedLocation !== "All Storage Locations" ||
    selectedStatus !== "all" ||
    selectedExpiryFilter !== "all" ||
    activeMetricFilter !== null

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setSelectedDosage("All Dosage Forms")
    setSelectedLocation("All Storage Locations")
    setSelectedStatus("all")
    setSelectedExpiryFilter("all")
    setActiveMetricFilter(null)
    setCurrentPage(1)
  }

  // Open Edit Modal
  const handleOpenEdit = (item: MedicineItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingMedicine(item)
    setEditReorderLevel(item.reorderThreshold.toString())
    setEditTargetStock(item.targetStockLevel.toString())
    setEditStorageCond(item.storageConditions)
    setEditDescription(item.description)
    setEditModalOpen(true)
  }

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedicine) return

    const reorder = parseInt(editReorderLevel) || editingMedicine.reorderThreshold
    const target = parseInt(editTargetStock) || editingMedicine.targetStockLevel

    // recalculate stock status based on new reorder level
    let newStatus: StockStatus = editingMedicine.stockStatus
    if (editingMedicine.usableQuantity === 0) {
      newStatus = "Out of Stock"
    } else if (editingMedicine.usableQuantity <= reorder) {
      newStatus = "Low Stock"
    } else {
      newStatus = "In Stock"
    }

    const updated = medicines.map((med) => {
      if (med.id === editingMedicine.id) {
        const updatedItem: MedicineItem = {
          ...med,
          reorderThreshold: reorder,
          targetStockLevel: target,
          storageConditions: editStorageCond,
          description: editDescription,
          stockStatus: newStatus,
        }
        if (selectedMedicine && selectedMedicine.id === med.id) {
          setSelectedMedicine(updatedItem)
        }
        return updatedItem
      }
      return med
    })

    setMedicines(updated)
    setEditModalOpen(false)
    showToast(`Master data for ${editingMedicine.name} updated successfully.`)
  }

  // Save New Medicine
  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newGeneric.trim()) {
      setNewFormError("Trade name and generic name are required.")
      return
    }

    const generatedCode =
      newCode.trim() ||
      `${newGeneric.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    const newMed: MedicineItem = {
      id: `MED-NEW-${Date.now()}`,
      name: newName.trim(),
      genericName: newGeneric.trim(),
      code: generatedCode,
      category: newCategory,
      strength: newStrength.trim() || "Standard",
      dosageForm: newDosage,
      unitOfMeasure: newUnit,
      manufacturer: newManufacturer.trim() || "National Central Medical Depot",
      storageConditions: newStorageCond,
      description: newDescription.trim() || "Registered hospital formulary medicine. Initial stock requires GRN receipt.",
      totalPhysicalStock: 0,
      reservedQuantity: 0,
      unavailableQuantity: 0,
      usableQuantity: 0,
      reorderThreshold: parseInt(newReorderLevel) || 500,
      targetStockLevel: parseInt(newTargetStock) || 1500,
      stockStatus: "Out of Stock",
      hasExpiringBatch: false,
      hasExpiredBatch: false,
      isActive: true,
      lastStockMovement: "Today · Catalog Entry Initialized",
      batches: [],
      movements: [
        {
          id: `MOV-NEW-${Date.now()}`,
          timestamp: "Today · Just now",
          type: "Stock Adjustment",
          quantity: "0",
          batchNumber: "N/A",
          reference: "CATALOG-INIT",
          user: "Ato Bekele Tolosa, RPh",
        },
      ],
    }

    setMedicines([newMed, ...medicines])
    setAddModalOpen(false)
    // reset form
    setNewCode("")
    setNewName("")
    setNewGeneric("")
    setNewStrength("")
    setNewDescription("")
    setNewFormError("")
    showToast(`Medicine ${newMed.name} registered. Awaiting initial GRN receipt.`)
  }

  // Export Confirmation
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [exportScope, setExportScope] = useState<"filtered" | "all">("filtered")
  const handleExecuteExport = () => {
    setExportModalOpen(false)
    const count = exportScope === "filtered" ? filteredMedicines.length : medicines.length
    showToast(
      `Stock export generated: ${count} records downloaded as ${exportFormat.toUpperCase()} (${
        exportFormat === "csv" ? "ORHIMS_Inventory_Export.csv" : "ORHIMS_Stock_Audit.pdf"
      })`
    )
  }

  // Access check state
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="mi-page-wrapper">
        <div className="mi-header">
          <div className="mi-breadcrumb">
            <span className="mi-breadcrumb-item" onClick={() => onNavigate("pharmacy-dashboard")}>
              Pharmacy
            </span>
            <Icon name="chevron" size={12} />
            <span className="mi-breadcrumb-active">Medicine Inventory</span>
          </div>
          <div className="mi-header-main">
            <div className="mi-header-title">
              <h1>Medicine Inventory Management</h1>
              <p>Oda Roba General Hospital — Main Pharmacy &amp; Satellite Stores</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #dbe5e5" }}>
          <Icon name="shield" size={40} style={{ color: "#ac393d", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "18px", color: "#142e42", margin: "0 0 8px" }}>Access Restricted</h2>
          <p style={{ color: "#5a7184", maxWidth: "480px", margin: "0 auto 20px" }}>
            You do not have the required permission (<code>medication-stock</code> or <code>pharmacy</code>) to access the central medicine inventory management module.
          </p>
          <Button className="button" onClick={() => onNavigate("pharmacy-dashboard")}>
            Return to Pharmacy Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mi-page-wrapper">
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
      <header className="mi-header">
        <nav aria-label="Breadcrumbs" className="mi-breadcrumb">
          <span className="mi-breadcrumb-item" onClick={() => onNavigate("pharmacy-dashboard")}>
            Pharmacy
          </span>
          <Icon name="chevron" size={12} />
          <span className="mi-breadcrumb-active">Medicine Inventory</span>
        </nav>

        <div className="mi-header-main">
          <div className="mi-header-title">
            <h1>Medicine Inventory Management</h1>
            <p>Oda Roba General Hospital — Central Dispensary, Emergency Store &amp; Inpatient Satellite</p>
          </div>

          <div className="mi-header-actions">
            <div className="mi-header-pill" title="Store Scope">
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
              Export Inventory
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={() => setAddModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="plus" size={14} />
              Add Medicine
            </button>
          </div>
        </div>
      </header>

      {/* Summary Row (5 Clickable Metric Cards) */}
      <section className="mi-metrics-grid" aria-label="Inventory Metrics Summary">
        {/* Card 1: Total Medicines */}
        <div
          className={`mi-metric-card ${activeMetricFilter === "all" ? "active" : ""}`}
          onClick={() => handleMetricCardClick("all")}
          role="button"
          tabIndex={0}
          aria-pressed={activeMetricFilter === "all"}
        >
          <div className="mi-metric-top">
            <span>Total Catalog</span>
            <Icon name="grid" size={16} />
          </div>
          <div className="mi-metric-count">{totalCount}</div>
          <div className="mi-metric-subtext">Active hospital formulary items</div>
        </div>

        {/* Card 2: Available Medicines */}
        <div
          className={`mi-metric-card ${activeMetricFilter === "available" ? "active" : ""}`}
          onClick={() => handleMetricCardClick("available")}
          role="button"
          tabIndex={0}
          aria-pressed={activeMetricFilter === "available"}
        >
          <div className="mi-metric-top">
            <span style={{ color: "#137333" }}>In Stock</span>
            <Icon name="check" size={16} style={{ color: "#137333" }} />
          </div>
          <div className="mi-metric-count" style={{ color: "#137333" }}>
            {availableCount}
          </div>
          <div className="mi-metric-subtext">Stock exceeds reorder threshold</div>
        </div>

        {/* Card 3: Low Stock */}
        <div
          className={`mi-metric-card ${activeMetricFilter === "low_stock" ? "active" : ""}`}
          onClick={() => handleMetricCardClick("low_stock")}
          role="button"
          tabIndex={0}
          aria-pressed={activeMetricFilter === "low_stock"}
        >
          <div className="mi-metric-top">
            <span style={{ color: "#b45309" }}>Low Stock</span>
            <Icon name="alert-triangle" size={16} style={{ color: "#b45309" }} />
          </div>
          <div className="mi-metric-count" style={{ color: "#b45309" }}>
            {lowStockCount}
          </div>
          <div className="mi-metric-subtext">At or below reorder threshold</div>
        </div>

        {/* Card 4: Out of Stock */}
        <div
          className={`mi-metric-card ${activeMetricFilter === "out_of_stock" ? "active" : ""}`}
          onClick={() => handleMetricCardClick("out_of_stock")}
          role="button"
          tabIndex={0}
          aria-pressed={activeMetricFilter === "out_of_stock"}
        >
          <div className="mi-metric-top">
            <span style={{ color: "#b91c1c" }}>Out of Stock</span>
            <Icon name="x-circle" size={16} style={{ color: "#b91c1c" }} />
          </div>
          <div className="mi-metric-count" style={{ color: "#b91c1c" }}>
            {outOfStockCount}
          </div>
          <div className="mi-metric-subtext">Zero usable units for dispensing</div>
        </div>

        {/* Card 5: Expiry Alerts */}
        <div
          className={`mi-metric-card ${activeMetricFilter === "expiry_alerts" ? "active" : ""}`}
          onClick={() => handleMetricCardClick("expiry_alerts")}
          role="button"
          tabIndex={0}
          aria-pressed={activeMetricFilter === "expiry_alerts"}
        >
          <div className="mi-metric-top">
            <span style={{ color: "#c2410c" }}>Expiry Alerts</span>
            <Icon name="clock" size={16} style={{ color: "#c2410c" }} />
          </div>
          <div className="mi-metric-count" style={{ color: "#c2410c" }}>
            {expiryAlertsCount}
          </div>
          <div className="mi-metric-subtext">Expiring within 90d or quarantined</div>
        </div>
      </section>

      {/* Global Search & Filters Toolbar */}
      <section className="mi-toolbar" aria-label="Inventory Filters">
        <div className="mi-toolbar-row">
          {/* Search box */}
          <div className="mi-search-box">
            <span className="mi-search-icon">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              className="mi-search-input"
              placeholder="Search by trade name, generic name, or item code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            className="mi-filter-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by category"
          >
            <option value="All Categories">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Dosage Form Filter */}
          <select
            className="mi-filter-select"
            value={selectedDosage}
            onChange={(e) => {
              setSelectedDosage(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by dosage form"
          >
            <option value="All Dosage Forms">All Dosage Forms</option>
            {DOSAGE_FORMS.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            className="mi-filter-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as "all" | StockStatus)
              setActiveMetricFilter(null)
              setCurrentPage(1)
            }}
            aria-label="Filter by stock status"
          >
            <option value="all">All Stock Levels</option>
            <option value="In Stock">In Stock (Adequate)</option>
            <option value="Low Stock">Low Stock (Reorder Needed)</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Restricted / Quarantined">Restricted / Quarantined</option>
          </select>

          {/* Expiry Filter */}
          <select
            className="mi-filter-select"
            value={selectedExpiryFilter}
            onChange={(e) => {
              setSelectedExpiryFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            aria-label="Filter by expiry status"
          >
            <option value="all">All Expiry Dates</option>
            <option value="expiring_30">Expiring in &lt; 30 Days</option>
            <option value="expiring_90">Expiring in &lt; 90 Days</option>
            <option value="quarantined">Quarantined / Expired Batches</option>
          </select>

          {/* Location Filter */}
          <select
            className="mi-filter-select"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by storage location"
          >
            <option value="All Storage Locations">All Storage Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="mi-active-chips">
            <span className="mi-active-chips-label">Active Filters:</span>

            {searchQuery.trim() && (
              <span className="mi-chip">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Remove search filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {activeMetricFilter && (
              <span className="mi-chip">
                Metric: {activeMetricFilter.replace("_", " ").toUpperCase()}
                <button type="button" onClick={() => setActiveMetricFilter(null)} aria-label="Remove metric filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== "All Categories" && (
              <span className="mi-chip">
                Category: {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory("All Categories")} aria-label="Remove category filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {selectedDosage !== "All Dosage Forms" && (
              <span className="mi-chip">
                Dosage: {selectedDosage}
                <button type="button" onClick={() => setSelectedDosage("All Dosage Forms")} aria-label="Remove dosage filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {selectedStatus !== "all" && !activeMetricFilter && (
              <span className="mi-chip">
                Status: {selectedStatus}
                <button type="button" onClick={() => setSelectedStatus("all")} aria-label="Remove status filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {selectedExpiryFilter !== "all" && (
              <span className="mi-chip">
                Expiry: {selectedExpiryFilter.replace("_", " ")}
                <button type="button" onClick={() => setSelectedExpiryFilter("all")} aria-label="Remove expiry filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            {selectedLocation !== "All Storage Locations" && (
              <span className="mi-chip">
                Location: {selectedLocation}
                <button type="button" onClick={() => setSelectedLocation("All Storage Locations")} aria-label="Remove location filter">
                  <Icon name="x" size={12} />
                </button>
              </span>
            )}

            <button type="button" className="mi-clear-filters-btn" onClick={clearAllFilters}>
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* Main Inventory Table */}
      <section className="mi-table-container">
        <div className="mi-table-header-meta">
          <div>
            Showing <strong>{filteredMedicines.length}</strong> of <strong>{medicines.length}</strong> medicines
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#137333", marginRight: 4 }} />
              In Stock
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b45309", marginRight: 4 }} />
              Low Stock
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b91c1c", marginRight: 4 }} />
              Out of Stock
            </span>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6b21a8", marginRight: 4 }} />
              Quarantined
            </span>
          </div>
        </div>

        <div className="mi-table-scroll">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Medicine &amp; Formulation</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Physical Stock</th>
                <th style={{ textAlign: "right" }}>Quarantined</th>
                <th style={{ textAlign: "right" }}>Usable for Dispensing</th>
                <th style={{ textAlign: "right" }}>Reorder Threshold</th>
                <th>Nearest Expiry / Batch</th>
                <th>Storage Bay / Shelf</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px 16px", textAlign: "center", color: "#5a7184" }}>
                    <Icon name="search" size={28} style={{ color: "#a0b0b9", marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#142e42" }}>No medicines match the selected criteria</p>
                    <p style={{ margin: 0, fontSize: "12px" }}>Try clearing search keywords or filter dropdowns.</p>
                    <button
                      type="button"
                      className="mi-clear-filters-btn"
                      onClick={clearAllFilters}
                      style={{ marginTop: "12px", display: "inline-block" }}
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((item) => {
                  const activeBatches = item.batches.filter((b) => b.batchStatus === "Available" || b.batchStatus === "Expiring Soon")
                  const nearestBatch = activeBatches.length > 0 ? activeBatches[0] : item.batches[0]
                  const hasQuarantine = item.unavailableQuantity > 0

                  return (
                    <tr
                      key={item.id}
                      className={selectedMedicine?.id === item.id ? "selected" : ""}
                      onClick={() => {
                        setSelectedMedicine(item)
                        setDrawerTab("batches")
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* 1. Medicine Name & Generic */}
                      <td>
                        <div style={{ fontWeight: 600, color: "#142e42" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#5a7184" }}>
                          {item.genericName} · {item.strength}
                        </div>
                        <div style={{ fontSize: "11px", color: "#7a8f9f", fontFamily: "monospace", marginTop: "2px" }}>
                          {item.code} · {item.dosageForm}
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td>
                        <span style={{ fontSize: "12.5px", color: "#334155" }}>{item.category}</span>
                      </td>

                      {/* 3. Physical Total Stock */}
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 600, color: "#142e42" }}>{item.totalPhysicalStock.toLocaleString()}</span>
                        <span style={{ fontSize: "11px", color: "#5a7184", marginLeft: "4px" }}>{item.unitOfMeasure}</span>
                      </td>

                      {/* 4. Quarantined Stock */}
                      <td style={{ textAlign: "right" }}>
                        {item.unavailableQuantity > 0 ? (
                          <span
                            className="mi-badge mi-stock-quarantine"
                            title="Quarantined from dispensing due to expiry or damage inspection"
                          >
                            <Icon name="lock" size={11} />
                            {item.unavailableQuantity.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>0</span>
                        )}
                      </td>

                      {/* 5. Usable for Dispensing */}
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color:
                              item.usableQuantity === 0
                                ? "#b91c1c"
                                : item.usableQuantity <= item.reorderThreshold
                                ? "#b45309"
                                : "#087e83",
                          }}
                        >
                          {item.usableQuantity.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#5a7184" }}>
                          {item.usableQuantity === 0 ? "Depleted" : "Available"}
                        </div>
                      </td>

                      {/* 6. Reorder Threshold */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 500, color: "#475569" }}>{item.reorderThreshold.toLocaleString()}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>Target: {item.targetStockLevel}</div>
                      </td>

                      {/* 7. Nearest Expiry & Batch */}
                      <td>
                        {nearestBatch ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "12px", fontFamily: "monospace" }}>
                              {nearestBatch.batchNumber}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#5a7184" }}>{nearestBatch.expiryDate}</div>
                            {nearestBatch.daysUntilExpiry <= 0 ? (
                              <span className="mi-expiry-warning" style={{ color: "#b91c1c" }}>
                                <Icon name="alert-triangle" size={11} /> Expired
                              </span>
                            ) : nearestBatch.daysUntilExpiry <= 30 ? (
                              <span className="mi-expiry-warning" style={{ color: "#b91c1c" }}>
                                <Icon name="alert-triangle" size={11} /> &lt; 30d remaining
                              </span>
                            ) : nearestBatch.daysUntilExpiry <= 90 ? (
                              <span className="mi-expiry-warning">
                                <Icon name="clock" size={11} /> &lt; 90d remaining
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>No active batch</span>
                        )}
                      </td>

                      {/* 8. Location */}
                      <td>
                        <span style={{ fontSize: "12px", color: "#334155" }}>
                          {nearestBatch ? nearestBatch.storageLocation : "Main Dispensary"}
                        </span>
                      </td>

                      {/* 9. Status Badge */}
                      <td>
                        {item.stockStatus === "In Stock" ? (
                          <span className="mi-badge mi-stock-instock">
                            <Icon name="check" size={11} /> In Stock
                          </span>
                        ) : item.stockStatus === "Low Stock" ? (
                          <span className="mi-badge mi-stock-low">
                            <Icon name="alert-triangle" size={11} /> Low Stock
                          </span>
                        ) : item.stockStatus === "Restricted / Quarantined" ? (
                          <span className="mi-badge mi-stock-quarantine">
                            <Icon name="lock" size={11} /> Quarantined
                          </span>
                        ) : (
                          <span className="mi-badge mi-stock-out">
                            <Icon name="x-circle" size={11} /> Out of Stock
                          </span>
                        )}
                      </td>

                      {/* 10. Actions */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            className="button button-secondary"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMedicine(item)
                              setDrawerTab("batches")
                            }}
                            title="View Stock Details & Batches"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            onClick={(e) => handleOpenEdit(item, e)}
                            title="Edit Reorder Thresholds & Storage"
                          >
                            <Icon name="edit" size={12} />
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            style={{ padding: "4px 8px", fontSize: "12px", color: "var(--emergency)" }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingMedicine(item)
                            }}
                            title="Archive Medicine Record"
                          >
                            <Icon name="x-circle" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="mi-pagination">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
            {filteredMedicines.length} total filtered items)
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

      {/* ── Slide-Over Medicine Details Drawer ── */}
      {selectedMedicine && (
        <div className="mi-drawer-overlay" onClick={() => setSelectedMedicine(null)}>
          <aside className="mi-drawer" onClick={(e) => e.stopPropagation()} aria-label="Medicine Details Drawer">
            {/* Drawer Header */}
            <div className="mi-drawer-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#142e42" }}>
                    {selectedMedicine.name}
                  </h2>
                  {selectedMedicine.stockStatus === "In Stock" ? (
                    <span className="mi-badge mi-stock-instock">In Stock</span>
                  ) : selectedMedicine.stockStatus === "Low Stock" ? (
                    <span className="mi-badge mi-stock-low">Low Stock</span>
                  ) : selectedMedicine.stockStatus === "Restricted / Quarantined" ? (
                    <span className="mi-badge mi-stock-quarantine">Quarantined</span>
                  ) : (
                    <span className="mi-badge mi-stock-out">Out of Stock</span>
                  )}
                </div>
                <div style={{ fontSize: "13px", color: "#5a7184", marginTop: "3px" }}>
                  {selectedMedicine.genericName} · {selectedMedicine.strength} ·{" "}
                  <span style={{ fontFamily: "monospace" }}>{selectedMedicine.code}</span>
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedMedicine(null)}
                aria-label="Close drawer"
                style={{ padding: "6px" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="mi-drawer-tabs">
              <button
                type="button"
                className={`mi-drawer-tab-btn ${drawerTab === "batches" ? "active" : ""}`}
                onClick={() => setDrawerTab("batches")}
              >
                Stock &amp; Batches ({selectedMedicine.batches.length})
              </button>
              <button
                type="button"
                className={`mi-drawer-tab-btn ${drawerTab === "movements" ? "active" : ""}`}
                onClick={() => setDrawerTab("movements")}
              >
                Movement History ({selectedMedicine.movements.length})
              </button>
              <button
                type="button"
                className={`mi-drawer-tab-btn ${drawerTab === "clinical" ? "active" : ""}`}
                onClick={() => setDrawerTab("clinical")}
              >
                Clinical &amp; Storage Notes
              </button>
            </div>

            {/* Drawer Body */}
            <div className="mi-drawer-body">
              {/* TAB 1: Stock & Batches */}
              {drawerTab === "batches" && (
                <>
                  {/* Stock Metrics Breakdown */}
                  <div className="mi-detail-grid">
                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>
                        Usable Dispensing Stock
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          color:
                            selectedMedicine.usableQuantity === 0
                              ? "#b91c1c"
                              : selectedMedicine.usableQuantity <= selectedMedicine.reorderThreshold
                              ? "#b45309"
                              : "#087e83",
                        }}
                      >
                        {selectedMedicine.usableQuantity.toLocaleString()} {selectedMedicine.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>Available to dispense</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>
                        Physical Total Stock
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#142e42" }}>
                        {selectedMedicine.totalPhysicalStock.toLocaleString()} {selectedMedicine.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>All batches in facility</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>
                        Quarantined / Locked
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          color: selectedMedicine.unavailableQuantity > 0 ? "#6b21a8" : "#94a3b8",
                        }}
                      >
                        {selectedMedicine.unavailableQuantity.toLocaleString()} {selectedMedicine.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>Locked from queue</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "#5a7184", textTransform: "uppercase" }}>
                        Reorder Threshold
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#475569" }}>
                        {selectedMedicine.reorderThreshold.toLocaleString()} {selectedMedicine.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5a7184" }}>Target: {selectedMedicine.targetStockLevel}</div>
                    </div>
                  </div>

                  {/* Stock Level Indicator Gauge */}
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbe5e5",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600 }}>Stock Level vs Reorder Point</span>
                      <span style={{ color: selectedMedicine.usableQuantity <= selectedMedicine.reorderThreshold ? "#b45309" : "#137333" }}>
                        {selectedMedicine.usableQuantity === 0
                          ? "Critical: Out of Stock"
                          : selectedMedicine.usableQuantity <= selectedMedicine.reorderThreshold
                          ? "Reorder Required"
                          : "Adequate Reserve"}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "4px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(
                            100,
                            (selectedMedicine.usableQuantity / (selectedMedicine.reorderThreshold * 2 || 1)) * 100
                          )}%`,
                          backgroundColor:
                            selectedMedicine.usableQuantity === 0
                              ? "#ef4444"
                              : selectedMedicine.usableQuantity <= selectedMedicine.reorderThreshold
                              ? "#f59e0b"
                              : "#10b981",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Quarantined Stock Notice (if applicable) */}
                  {selectedMedicine.unavailableQuantity > 0 && (
                    <div
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#fdf4ff",
                        border: "1px solid #e9d5ff",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "12.5px",
                        color: "#6b21a8",
                      }}
                    >
                      <Icon name="lock" size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <strong>Quarantine Notice:</strong>{" "}
                        {selectedMedicine.unavailableQuantity} units are quarantined in a designated segregated area.
                        These items are programmatically locked from the dispensing workspace and cannot be issued to
                        patients.
                      </div>
                    </div>
                  )}

                  {/* Batches Table */}
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 8px", color: "#142e42" }}>
                      Active &amp; Segregated Batches
                    </h3>
                    <div
                      style={{
                        border: "1px solid #dbe5e5",
                        borderRadius: "6px",
                        overflow: "hidden",
                        fontSize: "12.5px",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Batch #</th>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Expiry Date</th>
                            <th style={{ padding: "8px 10px", textAlign: "right" }}>Physical</th>
                            <th style={{ padding: "8px 10px", textAlign: "right" }}>Usable</th>
                            <th style={{ padding: "8px 10px", textAlign: "left" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMedicine.batches.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                                No active batches registered. Initial batch must be received through GRN.
                              </td>
                            </tr>
                          ) : (
                            selectedMedicine.batches.map((batch) => (
                              <tr
                                key={batch.id}
                                style={{
                                  borderBottom: "1px solid #e2e8f0",
                                  backgroundColor: batch.batchStatus === "Expired" ? "#fff5f5" : batch.batchStatus === "Quarantined" ? "#faf5ff" : "#ffffff",
                                }}
                              >
                                <td style={{ padding: "8px 10px", fontWeight: 600, fontFamily: "monospace" }}>
                                  {batch.batchNumber}
                                  <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "sans-serif" }}>
                                    {batch.storageLocation}
                                  </div>
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <div>{batch.expiryDate}</div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                                    {batch.daysUntilExpiry <= 0
                                      ? "Expired"
                                      : `${batch.daysUntilExpiry} days remaining`}
                                  </div>
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                  {batch.physicalQuantity.toLocaleString()}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: batch.eligibleQuantity > 0 ? "#087e83" : "#94a3b8" }}>
                                  {batch.eligibleQuantity.toLocaleString()}
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  {batch.batchStatus === "Available" ? (
                                    <span className="mi-badge mi-stock-instock">Available</span>
                                  ) : batch.batchStatus === "Expiring Soon" ? (
                                    <span className="mi-badge mi-stock-low">Expiring Soon</span>
                                  ) : batch.batchStatus === "Quarantined" ? (
                                    <span className="mi-badge mi-stock-quarantine">Quarantine</span>
                                  ) : (
                                    <span className="mi-badge mi-stock-out">Expired</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: Movement History */}
              {drawerTab === "movements" && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 8px", color: "#142e42" }}>
                    Stock Ledger &amp; Audit Trail
                  </h3>
                  <div
                    style={{
                      border: "1px solid #dbe5e5",
                      borderRadius: "6px",
                      overflow: "hidden",
                      fontSize: "12.5px",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #dbe5e5" }}>
                          <th style={{ padding: "8px 10px", textAlign: "left" }}>Date &amp; Time</th>
                          <th style={{ padding: "8px 10px", textAlign: "left" }}>Type</th>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>Change</th>
                          <th style={{ padding: "8px 10px", textAlign: "left" }}>Reference &amp; Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMedicine.movements.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                              No stock transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          selectedMedicine.movements.map((mov) => {
                            const isPositive = mov.quantity.startsWith("+")
                            const isNegative = mov.quantity.startsWith("-")
                            return (
                              <tr key={mov.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "8px 10px" }}>
                                  <div style={{ fontWeight: 600 }}>{mov.timestamp}</div>
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <span
                                    style={{
                                      textTransform: "capitalize",
                                      fontWeight: 500,
                                      color:
                                        mov.type === "Stock Received"
                                          ? "#137333"
                                          : mov.type === "Dispensed"
                                          ? "#0284c7"
                                          : mov.type === "Quarantine Transfer"
                                          ? "#6b21a8"
                                          : "#475569",
                                    }}
                                  >
                                    {mov.type}
                                  </span>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>Batch: {mov.batchNumber}</div>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                    color: isPositive ? "#137333" : isNegative ? "#b91c1c" : "#64748b",
                                  }}
                                >
                                  {mov.quantity}
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1e293b" }}>
                                    {mov.reference}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>{mov.user}</div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Clinical & Storage Notes */}
              {drawerTab === "clinical" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div
                    style={{
                      padding: "14px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbe5e5",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#142e42", marginBottom: "4px" }}>
                      Storage Conditions
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#087e83", fontWeight: 500 }}>
                      <Icon name="check" size={14} />
                      {selectedMedicine.storageConditions}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbe5e5",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#142e42", marginBottom: "4px" }}>
                      Formulary Category &amp; Manufacturer
                    </div>
                    <div style={{ fontSize: "13px", color: "#1e293b" }}>{selectedMedicine.category}</div>
                    <div style={{ fontSize: "12px", color: "#5a7184", marginTop: "2px" }}>
                      Manufacturer: {selectedMedicine.manufacturer}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbe5e5",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#142e42", marginBottom: "4px" }}>
                      Clinical Description &amp; Dispensing Notes
                    </div>
                    <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                      {selectedMedicine.description || "No specific dispensing warnings recorded."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="mi-drawer-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleOpenEdit(selectedMedicine)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="edit" size={14} />
                Edit Thresholds &amp; Master Data
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => setSelectedMedicine(null)}
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Add Medicine Modal ── */}
      {addModalOpen && (
        <div className="mi-modal-overlay" onClick={() => setAddModalOpen(false)}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add Medicine">
            <div className="mi-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Register New Formulary Medicine
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Formulary Master Data
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAddModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine}>
              <div className="mi-modal-body">
                {/* Notice banner */}
                <div className="mi-notice-box">
                  <strong>Formulary Registration Notice:</strong> Initial catalog registration configures the
                  medicine profile and safety thresholds. In compliance with hospital governance, physical stock must
                  be received through a Goods Received Note (GRN) to ensure verified batch number, manufacture date,
                  and expiry logging.
                </div>

                {newFormError && (
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      color: "#b91c1c",
                      fontSize: "12.5px",
                    }}
                  >
                    {newFormError}
                  </div>
                )}

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">
                      Trade Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., Amoxicillin Capsules"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">
                      Generic Name (INN) <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., Amoxicillin Trihydrate"
                      value={newGeneric}
                      onChange={(e) => setNewGeneric(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">Item Code (Optional)</label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., AMX-500 (auto if blank)"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                    />
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">Strength &amp; Concentration</label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., 500 mg or 20 mg/5ml"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">Formulary Category</label>
                    <select
                      className="mi-filter-select"
                      style={{ width: "100%" }}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">Dosage Form</label>
                    <select
                      className="mi-filter-select"
                      style={{ width: "100%" }}
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                    >
                      {DOSAGE_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">Unit of Measure</label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., Capsules, Tablets, Bottles, Vials"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    />
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">Manufacturer / Supplier</label>
                    <input
                      type="text"
                      className="mi-form-input"
                      placeholder="e.g., EPHARM, Cadila, EPSA Adama"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">Reorder Level Threshold</label>
                    <input
                      type="number"
                      className="mi-form-input"
                      placeholder="e.g., 500"
                      value={newReorderLevel}
                      onChange={(e) => setNewReorderLevel(e.target.value)}
                    />
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">Target Maximum Stock Level</label>
                    <input
                      type="number"
                      className="mi-form-input"
                      placeholder="e.g., 1500"
                      value={newTargetStock}
                      onChange={(e) => setNewTargetStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mi-form-field">
                  <label className="mi-form-label">Storage Conditions</label>
                  <input
                    type="text"
                    className="mi-form-input"
                    placeholder="e.g., Store below 25°C in a dry place. Protect from moisture."
                    value={newStorageCond}
                    onChange={(e) => setNewStorageCond(e.target.value)}
                  />
                </div>

                <div className="mi-form-field">
                  <label className="mi-form-label">Clinical Description &amp; Notes</label>
                  <textarea
                    rows={2}
                    className="mi-form-input"
                    style={{ resize: "vertical" }}
                    placeholder="e.g., Broad-spectrum antibiotic for bacterial infections."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="mi-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  Save &amp; Register Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Medicine Modal ── */}
      {editModalOpen && editingMedicine && (
        <div className="mi-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Edit Medicine">
            <div className="mi-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Edit Medicine Master Data
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  {editingMedicine.name} ({editingMedicine.code})
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="mi-modal-body">
                <div className="mi-notice-box" style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1", color: "#334155" }}>
                  <strong>Master Data Governance:</strong> Cumulative physical stock and historical transaction logs
                  are immutable and cannot be directly manipulated here. Stock additions must be received via verified
                  GRN, and deductions occur via dispensing or documented quarantine adjustments.
                </div>

                <div className="mi-form-row">
                  <div className="mi-form-field">
                    <label className="mi-form-label">Reorder Level Threshold</label>
                    <input
                      type="number"
                      className="mi-form-input"
                      value={editReorderLevel}
                      onChange={(e) => setEditReorderLevel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mi-form-field">
                    <label className="mi-form-label">Target Maximum Stock</label>
                    <input
                      type="number"
                      className="mi-form-input"
                      value={editTargetStock}
                      onChange={(e) => setEditTargetStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mi-form-field">
                  <label className="mi-form-label">Storage Conditions</label>
                  <input
                    type="text"
                    className="mi-form-input"
                    value={editStorageCond}
                    onChange={(e) => setEditStorageCond(e.target.value)}
                    required
                  />
                </div>

                <div className="mi-form-field">
                  <label className="mi-form-label">Clinical Description &amp; Handling Notes</label>
                  <textarea
                    rows={3}
                    className="mi-form-input"
                    style={{ resize: "vertical" }}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="mi-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  Update Master Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Archive Medicine Confirmation Modal ── */}
      {deletingMedicine && (
        <div className="mi-modal-overlay" onClick={() => setDeletingMedicine(null)}>
          <div className="mi-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Archive Medicine">
            <div className="mi-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--emergency)" }}>
                  Archive Medicine Record
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  {deletingMedicine.itemCode} · {deletingMedicine.genericName}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeletingMedicine(null)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="mi-modal-body" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
              <div style={{ color: "var(--emergency)", marginBottom: "1rem" }}>
                <Icon name="x-circle" size={44} />
              </div>
              <h3 style={{ fontSize: "16px", color: "var(--navy)", margin: "0 0 8px" }}>
                Archive {deletingMedicine.genericName}?
              </h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to remove <strong>{deletingMedicine.tradeName || deletingMedicine.genericName}</strong> from active inventory? Historical dispensing and movement ledger entries will remain preserved.
              </p>
            </div>
            <div className="mi-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setDeletingMedicine(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                style={{ background: "var(--emergency)", color: "#fff" }}
                onClick={handleConfirmDeleteMedicine}
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Inventory Modal ── */}
      {exportModalOpen && (
        <div className="mi-modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="mi-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Export Inventory">
            <div className="mi-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#142e42" }}>
                  Export Inventory Data
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#5a7184" }}>
                  Oda Roba General Hospital Pharmacy
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

            <div className="mi-modal-body">
              <div className="mi-form-field">
                <label className="mi-form-label">Export Scope</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === "filtered"}
                      onChange={() => setExportScope("filtered")}
                    />
                    <span>
                      Current Filtered View (<strong>{filteredMedicines.length}</strong> medicines)
                    </span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === "all"}
                      onChange={() => setExportScope("all")}
                    />
                    <span>
                      Complete Formulary Catalog (<strong>{medicines.length}</strong> medicines)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mi-form-field">
                <label className="mi-form-label">Report Format</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === "csv"}
                      onChange={() => setExportFormat("csv")}
                    />
                    <span>CSV / Excel Spreadsheet</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === "pdf"}
                      onChange={() => setExportFormat("pdf")}
                    />
                    <span>PDF Formal Stock Audit</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mi-modal-footer">
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
                onClick={handleExecuteExport}
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
