// ORHIMS — Phase 06, Prompt 35: Laboratory History and Record Retrieval Workspace
// Bale Robe, Ethiopia — Central Diagnostic Laboratory

import { useMemo, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoHistoricalOrders,
  type HistoricalOrder,
  type HistoricalPriority,
  type HistoricalOrderStatus,
  type HistoricalResultStatus,
} from "./model"
import "./laboratory-history.css"

interface LaboratoryHistoryPageProps {
  state?: "ready" | "loading" | "empty" | "error" | "restricted"
  permissions: Set<string>
  onNavigate: (destinationId: string) => void
}

export default function LaboratoryHistoryPage({
  state = "ready",
  permissions,
  onNavigate,
}: LaboratoryHistoryPageProps) {
  // Authorization Check
  const isAuthorized =
    permissions.has("lab") ||
    permissions.has("lab-history") ||
    permissions.has("result-review") ||
    permissions.has("result-entry") ||
    permissions.has("lab-orders")

  // State
  const [orders, setOrders] = useState<HistoricalOrder[]>(demoHistoricalOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<"results" | "auth" | "corrections" | "timeline" | "trends">("results")
  
  // Modals
  const [printOrder, setPrintOrder] = useState<HistoricalOrder | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV")
  const [lastRefreshed, setLastRefreshed] = useState<string>("16 Oct 2026 · 10:45 AM")
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("All Dates")
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories")
  const [deptFilter, setDeptFilter] = useState<string>("All Departments")
  const [priorityFilter, setPriorityFilter] = useState<string>("All Priorities")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All Statuses")
  const [resultStatusFilter, setResultStatusFilter] = useState<string>("All Result Statuses")
  const [onlyCorrected, setOnlyCorrected] = useState<boolean>(false)

  // Active Metric filter shortcut
  const [metricFilter, setMetricFilter] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Notification helper
  function showToast(message: string, type: "success" | "info" | "warning" = "success") {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  // Refresh data action
  function handleRefresh() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    setLastRefreshed(`${dateStr} · ${timeStr}`)
    showToast("Laboratory history records refreshed from audit database.", "info")
  }

  // Clear all filters
  function handleClearFilters() {
    setSearchQuery("")
    setDateRangeFilter("All Dates")
    setCategoryFilter("All Categories")
    setDeptFilter("All Departments")
    setPriorityFilter("All Priorities")
    setOrderStatusFilter("All Statuses")
    setResultStatusFilter("All Result Statuses")
    setOnlyCorrected(false)
    setMetricFilter(null)
    setCurrentPage(1)
  }

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Metric card shortcut filter
      if (metricFilter === "completed" && order.orderStatus !== "Completed") return false
      if (metricFilter === "released" && !order.isReleased) return false
      if (metricFilter === "corrected" && !order.hasCorrection) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = order.patientName.toLowerCase().includes(q)
        const matchesId = order.patientId.toLowerCase().includes(q)
        const matchesOrder = order.orderNumber.toLowerCase().includes(q)
        const matchesTest = order.testSummary.toLowerCase().includes(q)
        const matchesDept = order.orderingDepartment.toLowerCase().includes(q)
        if (!matchesName && !matchesId && !matchesOrder && !matchesTest && !matchesDept) {
          return false
        }
      }

      // Date Range Filter
      if (dateRangeFilter === "October 2026" && !order.orderDateTime.includes("Oct 2026")) return false
      if (dateRangeFilter === "September 2026" && !order.orderDateTime.includes("Sep 2026")) return false
      if (dateRangeFilter === "August 2026" && !order.orderDateTime.includes("Aug 2026")) return false

      // Category
      if (categoryFilter !== "All Categories" && order.testCategory !== categoryFilter) return false

      // Department
      if (deptFilter !== "All Departments" && !order.wardDepartment.includes(deptFilter)) return false

      // Priority
      if (priorityFilter !== "All Priorities" && order.priority !== priorityFilter) return false

      // Order Status
      if (orderStatusFilter !== "All Statuses" && order.orderStatus !== orderStatusFilter) return false

      // Result Status
      if (resultStatusFilter !== "All Result Statuses" && order.resultStatus !== resultStatusFilter) return false

      // Only Corrected toggle
      if (onlyCorrected && !order.hasCorrection) return false

      return true
    })
  }, [
    orders,
    metricFilter,
    searchQuery,
    dateRangeFilter,
    categoryFilter,
    deptFilter,
    priorityFilter,
    orderStatusFilter,
    resultStatusFilter,
    onlyCorrected,
  ])

  // Summary counts calculated from actual records
  const totalCompleted = useMemo(() => orders.filter((o) => o.orderStatus === "Completed").length, [orders])
  const totalReleased = useMemo(() => orders.filter((o) => o.isReleased).length, [orders])
  const totalCorrected = useMemo(() => orders.filter((o) => o.hasCorrection).length, [orders])
  const totalInPeriod = filteredOrders.length

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  // Active detail order
  const activeDetailOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find((o) => o.id === selectedOrderId) || null
  }, [orders, selectedOrderId])

  // Export execution
  function handleConfirmExport() {
    setExportModalOpen(false)
    showToast(
      `Authorized export generated successfully: ${filteredOrders.length} records exported in ${exportFormat} format. Download initiated.`,
      "success"
    )
  }

  // Access check state
  if (!isAuthorized || state === "restricted") {
    return (
      <div className="lh-page-wrapper">
        <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Icon name="lock" size={36} />
          <Heading level={2} style={{ marginTop: "12px", color: "var(--navy)" }}>
            Access Restricted: Laboratory History
          </Heading>
          <Text style={{ maxWidth: "540px", margin: "8px auto", color: "var(--muted)" }}>
            You do not possess the required clinical authorization or laboratory diagnostic permissions to inspect historical laboratory records and audit amendments.
          </Text>
          <Button className="button" style={{ marginTop: "16px" }} onClick={() => onNavigate("laboratory")}>
            Return to Laboratory Workspace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="lh-page-wrapper">
      {/* ── Breadcrumb & Page Header ── */}
      <header className="lh-header">
        <nav className="lh-breadcrumb" aria-label="Breadcrumb">
          <span className="lh-breadcrumb-item" onClick={() => onNavigate("laboratory")}>
            Dashboard
          </span>
          <span>/</span>
          <span className="lh-breadcrumb-item" onClick={() => onNavigate("laboratory")}>
            Laboratory
          </span>
          <span>/</span>
          <span
            className="lh-breadcrumb-item"
            onClick={() => onNavigate("specimen-collection")}
          >
            Specimen Collection
          </span>
          <span>/</span>
          <span
            className="lh-breadcrumb-item"
            onClick={() => onNavigate("result-entry")}
          >
            Result Entry
          </span>
          <span>/</span>
          <span
            className="lh-breadcrumb-item"
            onClick={() => onNavigate("result-review")}
          >
            Result Review
          </span>
          <span>/</span>
          <span className="lh-breadcrumb-active">History</span>
        </nav>

        <div className="lh-header-main">
          <div className="lh-header-title">
            <h1>Laboratory History</h1>
            <p>
              Search historical laboratory orders, review finalized results, and trace recorded changes.
            </p>
          </div>

          <div className="lh-header-actions">
            <span className="lh-header-pill" title="Audit timestamp of latest database synchronization">
              <Icon name="clock" size={14} />
              <span>Last Refreshed:</span>
              <strong>{lastRefreshed}</strong>
            </span>

            <Button className="button secondary" onClick={handleRefresh}>
              <Icon name="refresh" size={14} />
              Refresh
            </Button>

            <Button
              className="button"
              style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
              onClick={() => setExportModalOpen(true)}
            >
              <Icon name="download" size={14} />
              Export Records
            </Button>
          </div>
        </div>

        <div className="lh-permission-notice">
          <Icon name="shield" size={16} />
          <span>
            <strong>Access Integrity Notice:</strong> Historical records and finalized diagnostic findings are displayed according to institutional access policies for Oda Roba Hospital. Completed records cannot be silently modified.
          </span>
        </div>
      </header>

      {/* ── Toast Notification ── */}
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

      {/* ── Summary Metrics ── */}
      <section className="lh-metrics-grid" aria-label="Historical Summary Metrics">
        <button
          type="button"
          className={`lh-metric-card${metricFilter === "completed" ? " active" : ""}`}
          onClick={() => {
            setMetricFilter((prev) => (prev === "completed" ? null : "completed"))
            setCurrentPage(1)
          }}
          title="Click to filter completed orders"
        >
          <div className="lh-metric-header">
            <span>Completed Orders</span>
            <Icon name="check" size={16} />
          </div>
          <div className="lh-metric-value">{totalCompleted}</div>
          <div className="lh-metric-subtext">Finalized laboratory runs</div>
        </button>

        <button
          type="button"
          className={`lh-metric-card${metricFilter === "released" ? " active" : ""}`}
          onClick={() => {
            setMetricFilter((prev) => (prev === "released" ? null : "released"))
            setCurrentPage(1)
          }}
          title="Click to filter released orders"
        >
          <div className="lh-metric-header">
            <span>Results Released</span>
            <Icon name="flask" size={16} />
          </div>
          <div className="lh-metric-value">{totalReleased}</div>
          <div className="lh-metric-subtext">Dispatched to attending clinicians</div>
        </button>

        <button
          type="button"
          className={`lh-metric-card${metricFilter === "corrected" ? " active" : ""}`}
          onClick={() => {
            setMetricFilter((prev) => (prev === "corrected" ? null : "corrected"))
            setCurrentPage(1)
          }}
          title="Click to filter amended records"
        >
          <div className="lh-metric-header">
            <span>Corrected / Amended</span>
            <Icon name="edit" size={16} />
          </div>
          <div className="lh-metric-value" style={{ color: "#c2410c" }}>{totalCorrected}</div>
          <div className="lh-metric-subtext">Traceable audited adjustments</div>
        </button>

        <button
          type="button"
          className={`lh-metric-card${metricFilter === null ? " active" : ""}`}
          onClick={() => {
            setMetricFilter(null)
            setCurrentPage(1)
          }}
          title="Total records matching active filters"
        >
          <div className="lh-metric-header">
            <span>Filtered Period Records</span>
            <Icon name="calendar" size={16} />
          </div>
          <div className="lh-metric-value">{totalInPeriod}</div>
          <div className="lh-metric-subtext">Active filter results count</div>
        </button>
      </section>

      {/* ── Search and Filter Toolbar ── */}
      <section className="lh-toolbar" aria-label="Search and filter toolbar">
        <div className="lh-search-row">
          <div className="lh-search-input-wrapper">
            <span className="lh-search-icon">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              className="lh-search-input"
              placeholder="Search patient name, patient ID, order number, or test…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Search historical laboratory orders"
            />
          </div>

          <select
            className="lh-filter-select"
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by date range"
          >
            <option value="All Dates">All Date Periods</option>
            <option value="October 2026">October 2026 (Current Month)</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
          </select>

          <select
            className="lh-filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by laboratory department category"
          >
            <option value="All Categories">All Categories</option>
            <option value="Hematology">Hematology</option>
            <option value="Clinical Chemistry">Clinical Chemistry</option>
            <option value="Parasitology">Parasitology</option>
            <option value="Urinalysis">Urinalysis</option>
            <option value="Microbiology / TB">Microbiology / TB</option>
          </select>

          <select
            className="lh-filter-select"
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by hospital department"
          >
            <option value="All Departments">All Departments</option>
            <option value="Adult OPD-1">Adult OPD-1</option>
            <option value="Adult OPD-2">Adult OPD-2</option>
            <option value="Emergency Department">Emergency Department</option>
            <option value="Maternal Health Clinic">Maternal Health (ANC)</option>
            <option value="Pediatric">Pediatric / Youth</option>
            <option value="Chest / TB">Chest / TB Clinic</option>
            <option value="Chronic Care Clinic">Chronic Care (NCD)</option>
          </select>
        </div>

        <div className="lh-filters-row">
          <select
            className="lh-filter-select"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by clinical priority"
          >
            <option value="All Priorities">All Priorities</option>
            <option value="Routine">Routine</option>
            <option value="Urgent">Urgent</option>
            <option value="STAT">STAT / Emergency</option>
          </select>

          <select
            className="lh-filter-select"
            value={orderStatusFilter}
            onChange={(e) => {
              setOrderStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by order status"
          >
            <option value="All Statuses">All Order Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            className="lh-filter-select"
            value={resultStatusFilter}
            onChange={(e) => {
              setResultStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter by result status"
          >
            <option value="All Result Statuses">All Result Statuses</option>
            <option value="Released">Released</option>
            <option value="Approved">Approved</option>
            <option value="Corrected or Amended">Corrected or Amended</option>
          </select>

          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", marginLeft: "4px" }}>
            <input
              type="checkbox"
              checked={onlyCorrected}
              onChange={(e) => {
                setOnlyCorrected(e.target.checked)
                setCurrentPage(1)
              }}
            />
            <span>Show Only Amended Records</span>
          </label>
        </div>

        {/* Active Filter Chips */}
        {(searchQuery ||
          dateRangeFilter !== "All Dates" ||
          categoryFilter !== "All Categories" ||
          deptFilter !== "All Departments" ||
          priorityFilter !== "All Priorities" ||
          orderStatusFilter !== "All Statuses" ||
          resultStatusFilter !== "All Result Statuses" ||
          onlyCorrected ||
          metricFilter) && (
          <div className="lh-active-chips">
            <span className="lh-active-chips-label">Active Filters:</span>
            {searchQuery && (
              <span className="lh-chip">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery("")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {dateRangeFilter !== "All Dates" && (
              <span className="lh-chip">
                Period: {dateRangeFilter}
                <button type="button" onClick={() => setDateRangeFilter("All Dates")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {categoryFilter !== "All Categories" && (
              <span className="lh-chip">
                Category: {categoryFilter}
                <button type="button" onClick={() => setCategoryFilter("All Categories")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {deptFilter !== "All Departments" && (
              <span className="lh-chip">
                Dept: {deptFilter}
                <button type="button" onClick={() => setDeptFilter("All Departments")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {priorityFilter !== "All Priorities" && (
              <span className="lh-chip">
                Priority: {priorityFilter}
                <button type="button" onClick={() => setPriorityFilter("All Priorities")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {orderStatusFilter !== "All Statuses" && (
              <span className="lh-chip">
                Order: {orderStatusFilter}
                <button type="button" onClick={() => setOrderStatusFilter("All Statuses")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {resultStatusFilter !== "All Result Statuses" && (
              <span className="lh-chip">
                Result: {resultStatusFilter}
                <button type="button" onClick={() => setResultStatusFilter("All Result Statuses")}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {onlyCorrected && (
              <span className="lh-chip">
                Amended Only
                <button type="button" onClick={() => setOnlyCorrected(false)}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            {metricFilter && (
              <span className="lh-chip">
                Shortcut: {metricFilter.toUpperCase()}
                <button type="button" onClick={() => setMetricFilter(null)}>
                  <Icon name="close" size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              className="lh-clear-filters-btn"
              onClick={handleClearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* ── Historical Records Table ── */}
      <section className="lh-table-container">
        <div className="lh-table-header-meta">
          <div>
            Showing <strong>{filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong>{Math.min(currentPage * pageSize, filteredOrders.length)}</strong> of{" "}
            <strong>{filteredOrders.length}</strong> historical records
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
            Hospital Audit Scope · Central Diagnostic Laboratory
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
            <Icon name="search" size={32} />
            <Heading level={3} style={{ marginTop: "12px", color: "var(--navy)" }}>
              No laboratory records match the selected filters.
            </Heading>
            <Text style={{ marginTop: "4px" }}>
              Try broadening your date range, adjusting category choices, or clearing search keywords.
            </Text>
            <Button
              className="button secondary"
              style={{ marginTop: "14px" }}
              onClick={handleClearFilters}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="lh-table-scroll">
            <table className="lh-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Patient &amp; MRN</th>
                  <th>Test Summary</th>
                  <th>Ordering Dept</th>
                  <th>Order Date</th>
                  <th>Completion Date</th>
                  <th>Priority</th>
                  <th>Order Status</th>
                  <th>Result Status</th>
                  <th>History Indicator</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={selectedOrderId === order.id ? "selected" : ""}
                  >
                    <td>
                      <strong style={{ color: "var(--navy)", fontFamily: "monospace" }}>
                        {order.orderNumber}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <strong>{order.patientName}</strong>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>
                          {order.patientId} · {order.ageGender}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: "230px" }}>
                        <strong>{order.testSummary}</strong>
                        <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                          {order.testCategory} ({order.analytes.length} analytes)
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px" }}>{order.wardDepartment}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {order.orderDateTime}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {order.completionDateTime}
                    </td>
                    <td>
                      <span
                        className={`lh-badge ${
                          order.priority === "STAT"
                            ? "lh-priority-stat"
                            : order.priority === "Urgent"
                            ? "lh-priority-urgent"
                            : "lh-priority-routine"
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`lh-badge ${
                          order.orderStatus === "Completed"
                            ? "lh-status-released"
                            : "lh-status-cancelled"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`lh-badge ${
                          order.resultStatus === "Released"
                            ? "lh-status-released"
                            : order.resultStatus === "Corrected or Amended"
                            ? "lh-status-corrected"
                            : "lh-status-approved"
                        }`}
                      >
                        {order.resultStatus}
                      </span>
                    </td>
                    <td>
                      {order.hasCorrection ? (
                        <span className="lh-version-indicator" title="Audited correction present">
                          <Icon name="edit" size={11} /> Amended v{order.recordVersion}
                        </span>
                      ) : (
                        <span className="lh-clean-version">Clean v{order.recordVersion}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Button
                          className="button secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setDetailTab("results")
                          }}
                        >
                          <Icon name="eye" size={13} />
                          View Record
                        </Button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Print official laboratory report slip"
                          onClick={() => setPrintOrder(order)}
                          style={{ padding: "5px 8px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", color: "var(--muted)" }}
                        >
                          <Icon name="printer" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table Pagination ── */}
        <div className="lh-pagination">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="lh-page-buttons">
            <Button
              className="button secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              className="button secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* ── Detailed Record Inspector Modal ── */}
      {activeDetailOrder && (
        <div className="lh-modal-overlay" onClick={() => setSelectedOrderId(null)}>
          <div
            className="lh-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lh-detail-title"
          >
            {/* Header */}
            <div className="lh-detail-header">
              <div className="lh-detail-header-left">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 id="lh-detail-title">{activeDetailOrder.testSummary}</h2>
                  <span
                    className={`lh-badge ${
                      activeDetailOrder.resultStatus === "Released"
                        ? "lh-status-released"
                        : activeDetailOrder.resultStatus === "Corrected or Amended"
                        ? "lh-status-corrected"
                        : "lh-status-approved"
                    }`}
                  >
                    {activeDetailOrder.resultStatus}
                  </span>
                </div>
                <div className="lh-detail-badges">
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--navy)" }}>
                    {activeDetailOrder.orderNumber}
                  </span>
                  <span>·</span>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Encounter: {activeDetailOrder.encounterId}
                  </span>
                  <span>·</span>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Completed: {activeDetailOrder.completionDateTime}
                  </span>
                </div>
              </div>

              <div className="lh-detail-actions">
                <Button
                  className="button secondary"
                  onClick={() => setPrintOrder(activeDetailOrder)}
                >
                  <Icon name="printer" size={14} />
                  Print Record
                </Button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setSelectedOrderId(null)}
                  aria-label="Close record details"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="lh-detail-tabs" style={{ padding: "0 24px", backgroundColor: "#ffffff" }}>
              <button
                type="button"
                className={`lh-detail-tab-btn${detailTab === "results" ? " active" : ""}`}
                onClick={() => setDetailTab("results")}
              >
                Test Results &amp; Context
              </button>
              <button
                type="button"
                className={`lh-detail-tab-btn${detailTab === "auth" ? " active" : ""}`}
                onClick={() => setDetailTab("auth")}
              >
                Approval &amp; Release
              </button>
              <button
                type="button"
                className={`lh-detail-tab-btn${detailTab === "corrections" ? " active" : ""}`}
                onClick={() => setDetailTab("corrections")}
              >
                Corrections &amp; Amendments {activeDetailOrder.hasCorrection && "(1)"}
              </button>
              <button
                type="button"
                className={`lh-detail-tab-btn${detailTab === "timeline" ? " active" : ""}`}
                onClick={() => setDetailTab("timeline")}
              >
                Audit Timeline ({activeDetailOrder.auditTimeline.length})
              </button>
              {activeDetailOrder.comparisons && activeDetailOrder.comparisons.length > 0 && (
                <button
                  type="button"
                  className={`lh-detail-tab-btn${detailTab === "trends" ? " active" : ""}`}
                  onClick={() => setDetailTab("trends")}
                >
                  Longitudinal Comparison
                </button>
              )}
            </div>

            {/* Body */}
            <div className="lh-detail-body">
              {/* Patient Banner */}
              <div className="lh-patient-banner">
                <div className="lh-banner-col">
                  <span className="lh-banner-label">Patient Name</span>
                  <span className="lh-banner-val">{activeDetailOrder.patientName}</span>
                </div>
                <div className="lh-banner-col">
                  <span className="lh-banner-label">Hospital MRN</span>
                  <span className="lh-banner-val" style={{ fontFamily: "monospace" }}>
                    {activeDetailOrder.patientId}
                  </span>
                </div>
                <div className="lh-banner-col">
                  <span className="lh-banner-label">Age / Gender / DOB</span>
                  <span className="lh-banner-val">
                    {activeDetailOrder.ageGender} ({activeDetailOrder.dob})
                  </span>
                </div>
                <div className="lh-banner-col">
                  <span className="lh-banner-label">Ordering Clinician</span>
                  <span className="lh-banner-val">{activeDetailOrder.orderingClinician}</span>
                </div>
                <div className="lh-banner-col">
                  <span className="lh-banner-label">Ward / Department</span>
                  <span className="lh-banner-val">{activeDetailOrder.wardDepartment}</span>
                </div>
              </div>

              {/* TAB 1: Results & Specimen */}
              {detailTab === "results" && (
                <>
                  {/* Specimen Box */}
                  <div className="lh-section-box">
                    <div className="lh-section-title">
                      <Icon name="flask" size={16} />
                      Specimen &amp; Accession Integrity Context
                    </div>
                    <div className="lh-specimen-grid">
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "11.5px", textTransform: "uppercase" }}>Specimen Type:</span>
                        <div><strong>{activeDetailOrder.specimenType}</strong></div>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "11.5px", textTransform: "uppercase" }}>Specimen Barcode ID:</span>
                        <div><strong style={{ fontFamily: "monospace" }}>{activeDetailOrder.specimenId}</strong></div>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "11.5px", textTransform: "uppercase" }}>Collection Timestamp:</span>
                        <div>{activeDetailOrder.collectionDateTime}</div>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "11.5px", textTransform: "uppercase" }}>Receipt &amp; Accession:</span>
                        <div>{activeDetailOrder.receiptDateTime}</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span style={{ color: "var(--muted)", fontSize: "11.5px", textTransform: "uppercase" }}>Accession Status &amp; Integrity Verification:</span>
                        <div style={{ color: "#0b5054", fontWeight: 500 }}>{activeDetailOrder.accessionStatus}</div>
                      </div>
                    </div>
                  </div>

                  {/* Analytes Table */}
                  <div className="lh-section-box">
                    <div className="lh-section-title">
                      <Icon name="check" size={16} />
                      Finalized Test Analytes &amp; Reference Intervals
                    </div>

                    {activeDetailOrder.analytes.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>
                        No individual analytes were quantified for this order (Order {activeDetailOrder.orderStatus}).
                      </div>
                    ) : (
                      <table className="lh-analytes-table">
                        <thead>
                          <tr>
                            <th>Analyte / Parameter</th>
                            <th>Code</th>
                            <th>Final Result</th>
                            <th>Unit</th>
                            <th>Applicable Reference Range</th>
                            <th>Severity Flag</th>
                            <th>Clinical Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDetailOrder.analytes.map((item) => (
                            <tr key={item.code}>
                              <td>
                                <strong>{item.name}</strong>
                                {item.technicalComment && (
                                  <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                                    {item.technicalComment}
                                  </div>
                                )}
                              </td>
                              <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--muted)" }}>
                                {item.code}
                              </td>
                              <td>
                                <strong style={{ fontSize: "14px", color: "var(--navy)" }}>
                                  {item.value}
                                </strong>
                              </td>
                              <td style={{ color: "var(--muted)" }}>{item.unit}</td>
                              <td>{item.referenceInterval}</td>
                              <td>
                                <span
                                  className={`lh-flag-pill ${
                                    item.flag === "Normal"
                                      ? "lh-flag-normal"
                                      : item.flag === "Low"
                                      ? "lh-flag-low"
                                      : item.flag === "High"
                                      ? "lh-flag-high"
                                      : item.flag === "Critical"
                                      ? "lh-flag-critical"
                                      : "lh-flag-abnormal"
                                  }`}
                                >
                                  {item.flag}
                                </span>
                              </td>
                              <td style={{ fontSize: "12px", color: "#334155" }}>
                                {item.interpretation || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: Approval & Release */}
              {detailTab === "auth" && (
                <div className="lh-section-box">
                  <div className="lh-section-title">
                    <Icon name="shield" size={16} />
                    Distinct Approval and Release Authority
                  </div>
                  <Text style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Institutional policy requires strict separation of supervisory review, pathologist approval, and final electronic dispatch to patient records.
                  </Text>

                  <div className="lh-approval-release-grid" style={{ marginTop: "8px" }}>
                    {/* Review & Approval Card */}
                    <div className="lh-auth-card">
                      <div className="lh-auth-card-title">Supervisory Validation &amp; Approval</div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "12px" }}>Reviewed by:</span>{" "}
                        <strong>{activeDetailOrder.reviewedBy}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "12px" }}>Review Timestamp:</span>{" "}
                        {activeDetailOrder.reviewedAt}
                      </div>
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
                        <span style={{ color: "var(--muted)", fontSize: "12px" }}>Final Approval Authority:</span>{" "}
                        <strong>{activeDetailOrder.approvedBy}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)", fontSize: "12px" }}>Approval Timestamp:</span>{" "}
                        {activeDetailOrder.approvedAt}
                      </div>
                      <div style={{ marginTop: "4px" }}>
                        <span className="lh-badge lh-status-approved">Formally Approved</span>
                      </div>
                    </div>

                    {/* Electronic Release Card */}
                    <div className="lh-auth-card">
                      <div className="lh-auth-card-title">Electronic Release to Care Teams</div>
                      {activeDetailOrder.isReleased ? (
                        <>
                          <div>
                            <span style={{ color: "var(--muted)", fontSize: "12px" }}>Released by:</span>{" "}
                            <strong>{activeDetailOrder.releasedBy || "Automated Hospital Gateway"}</strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--muted)", fontSize: "12px" }}>Release Timestamp:</span>{" "}
                            {activeDetailOrder.releasedAt}
                          </div>
                          <div>
                            <span style={{ color: "var(--muted)", fontSize: "12px" }}>Destination Target:</span>{" "}
                            <strong>{activeDetailOrder.wardDepartment}</strong>
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <span className="lh-badge lh-status-released">Dispatched &amp; Visible</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "var(--muted)", padding: "10px 0" }}>
                          This order has not been electronically released (Status: {activeDetailOrder.orderStatus}).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Corrections & Amendments */}
              {detailTab === "corrections" && (
                <div className="lh-section-box">
                  <div className="lh-section-title">
                    <Icon name="edit" size={16} />
                    Correction and Amendment Audit Records
                  </div>

                  {activeDetailOrder.corrections && activeDetailOrder.corrections.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {activeDetailOrder.corrections.map((corr) => (
                        <div key={corr.auditReference} className="lh-correction-box">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>
                              {corr.analyteName} — Amendment Reference: {corr.auditReference}
                            </strong>
                            <span className="lh-badge lh-status-corrected">Audited Correction</span>
                          </div>

                          <div className="lh-correction-compare">
                            <div className="lh-correction-col">
                              <span style={{ fontSize: "12px", color: "#9a3412", fontWeight: 600 }}>
                                Original Recorded Value (Superseded)
                              </span>
                              <div className="lh-original-val">
                                {corr.originalValue} {corr.unit}
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                                Ref: {corr.referenceInterval}
                              </span>
                            </div>

                            <div className="lh-correction-col">
                              <span style={{ fontSize: "12px", color: "#0b5054", fontWeight: 600 }}>
                                Corrected Official Value (Current Authorized)
                              </span>
                              <div className="lh-corrected-val">
                                {corr.correctedValue} {corr.unit}
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                                Ref: {corr.referenceInterval}
                              </span>
                            </div>
                          </div>

                          <div style={{ fontSize: "13px", color: "#334155" }}>
                            <strong>Documented Clinical/Technical Reason:</strong>
                            <div style={{ marginTop: "4px", padding: "8px 12px", background: "#ffffff", borderRadius: "4px", border: "1px solid #fed7aa" }}>
                              {corr.correctionReason}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                            <span>Adjusted by: <strong>{corr.correctedBy}</strong> at {corr.correctedAt}</span>
                            <span>Authorized by: <strong>{corr.authorizedBy}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>
                      <Icon name="check" size={24} />
                      <Heading level={3} style={{ marginTop: "8px", color: "var(--navy)" }}>
                        No corrections or amendments are recorded for this order.
                      </Heading>
                      <Text style={{ marginTop: "2px" }}>
                        Initial analytical entry was approved and finalized under Version 1 without revisions.
                      </Text>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Audit Timeline */}
              {detailTab === "timeline" && (
                <div className="lh-section-box">
                  <div className="lh-section-title">
                    <Icon name="clock" size={16} />
                    Chronological Chain-of-Custody Timeline
                  </div>

                  <div className="lh-timeline" style={{ marginTop: "12px" }}>
                    {activeDetailOrder.auditTimeline.map((item, idx) => (
                      <div key={idx} className="lh-timeline-item">
                        <div className="lh-timeline-dot" />
                        <div className="lh-timeline-item-header">
                          <span className="lh-timeline-event">{item.event}</span>
                          <span className="lh-timeline-time">{item.timestamp}</span>
                        </div>
                        <div className="lh-timeline-meta">
                          Responsible: <strong>{item.user}</strong> ({item.role})
                        </div>
                        {item.details && (
                          <div className="lh-timeline-notes">{item.details}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Longitudinal Comparison */}
              {detailTab === "trends" && activeDetailOrder.comparisons && (
                <div className="lh-section-box">
                  <div className="lh-section-title">
                    <Icon name="arrow" size={16} />
                    Historical Longitudinal Trend
                  </div>
                  <Text style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Comparative findings for {activeDetailOrder.patientName} across hospital visits. Note: Methods and reference intervals must be strictly verified before longitudinal interpretation.
                  </Text>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                    {activeDetailOrder.comparisons.map((comp) => (
                      <div key={comp.analyteName} className="lh-trend-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>{comp.analyteName}</strong>
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                            Ref: {comp.referenceInterval} {comp.unit}
                          </span>
                        </div>

                        <div className="lh-trend-points">
                          {comp.previousPoints.map((prev, pIdx) => (
                            <div key={pIdx} className="lh-trend-point">
                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{prev.date}</span>
                              <strong style={{ fontSize: "15px" }}>{prev.value} {prev.unit}</strong>
                              <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>Order: {prev.orderNumber}</span>
                            </div>
                          ))}
                          <div className="lh-trend-point" style={{ borderColor: "var(--teal)", backgroundColor: "#f0fdfa" }}>
                            <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 700 }}>
                              Current ({comp.currentDate})
                            </span>
                            <strong style={{ fontSize: "16px", color: "var(--teal)" }}>
                              {comp.currentValue} {comp.unit}
                            </strong>
                            <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>Order: {activeDetailOrder.orderNumber}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: "12.5px", color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: "4px" }}>
                          <strong>Longitudinal Note:</strong> {comp.trendInterpretation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="lh-detail-footer">
              <Button className="button secondary" onClick={() => setSelectedOrderId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print Official Record Modal ── */}
      {printOrder && (
        <div className="lh-modal-overlay" onClick={() => setPrintOrder(null)}>
          <div
            className="lh-small-modal"
            style={{ maxWidth: "720px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="lh-small-modal-head">
              <h3>Print Official Diagnostic Report</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPrintOrder(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="lh-small-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Printable Document Preview */}
              <div className="lh-print-sheet">
                <div className="lh-print-header">
                  <div>
                    <div className="lh-print-hospital-title">ODA ROBA GENERAL HOSPITAL</div>
                    <div className="lh-print-hospital-sub">
                      Central Diagnostic Laboratory · Bale Robe, Oromia, Ethiopia
                    </div>
                    <div className="lh-print-hospital-sub">
                      Official Medical Diagnostic Report · ISO 15189 Aligned
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "12px" }}>
                    <div><strong>Order ID:</strong> {printOrder.orderNumber}</div>
                    <div><strong>Encounter:</strong> {printOrder.encounterId}</div>
                    <div><strong>Completed:</strong> {printOrder.completionDateTime}</div>
                  </div>
                </div>

                {/* Patient Header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "12px" }}>
                  <div>
                    <div><strong>Patient:</strong> {printOrder.patientName}</div>
                    <div><strong>MRN:</strong> {printOrder.patientId}</div>
                    <div><strong>Demographics:</strong> {printOrder.ageGender} (DOB: {printOrder.dob})</div>
                  </div>
                  <div>
                    <div><strong>Clinician:</strong> {printOrder.orderingClinician}</div>
                    <div><strong>Department:</strong> {printOrder.wardDepartment}</div>
                    <div><strong>Specimen:</strong> {printOrder.specimenType} ({printOrder.specimenId})</div>
                  </div>
                </div>

                {/* Tests Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "16px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #000" }}>
                      <th style={{ textAlign: "left", padding: "6px" }}>Test Parameter</th>
                      <th style={{ textAlign: "left", padding: "6px" }}>Result</th>
                      <th style={{ textAlign: "left", padding: "6px" }}>Units</th>
                      <th style={{ textAlign: "left", padding: "6px" }}>Reference Range</th>
                      <th style={{ textAlign: "left", padding: "6px" }}>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printOrder.analytes.map((a) => (
                      <tr key={a.code} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "6px" }}>{a.name}</td>
                        <td style={{ padding: "6px" }}><strong>{a.value}</strong></td>
                        <td style={{ padding: "6px" }}>{a.unit}</td>
                        <td style={{ padding: "6px" }}>{a.referenceInterval}</td>
                        <td style={{ padding: "6px" }}>{a.flag === "Normal" ? "" : a.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sign-off Block */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid #ccc", paddingTop: "12px", fontSize: "11.5px" }}>
                  <div>
                    <div><strong>Validated by:</strong> {printOrder.reviewedBy}</div>
                    <div><strong>Date &amp; Time:</strong> {printOrder.reviewedAt}</div>
                  </div>
                  <div>
                    <div><strong>Approved by:</strong> {printOrder.approvedBy}</div>
                    <div><strong>Date &amp; Time:</strong> {printOrder.approvedAt}</div>
                  </div>
                </div>

                <div style={{ marginTop: "16px", fontSize: "10px", color: "#666", textAlign: "center", borderTop: "1px dashed #ccc", paddingTop: "8px" }}>
                  Confidential Medical Record. This laboratory record is intended solely for the authorized clinical care of the named patient at Oda Roba General Hospital.
                </div>
              </div>
            </div>

            <div className="lh-detail-footer">
              <Button className="button secondary" onClick={() => setPrintOrder(null)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                onClick={() => {
                  window.print()
                  showToast(`Print spooler initialized for ${printOrder.orderNumber}.`, "success")
                  setPrintOrder(null)
                }}
              >
                <Icon name="printer" size={14} />
                Print Official Slip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Filtered Records Modal ── */}
      {exportModalOpen && (
        <div className="lh-modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div
            className="lh-small-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="lh-small-modal-head">
              <h3>Export Historical Laboratory Records</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setExportModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="lh-small-modal-body">
              <div className="lh-advisory-box">
                <Icon name="warning" size={18} />
                <div>
                  <strong>Protected Health Information Warning:</strong>
                  <div>
                    Exported records contain confidential patient identifiers and diagnostic data. Handle according to Oda Roba Hospital data governance policy.
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Records to be exported:</span>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                  {filteredOrders.length} records matching current filters
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  Selected Period: <strong>{dateRangeFilter}</strong> · Category: <strong>{categoryFilter}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "6px" }}>
                  Export File Format:
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="exportFmt"
                      checked={exportFormat === "CSV"}
                      onChange={() => setExportFormat("CSV")}
                    />
                    <span>CSV (Comma Separated Values)</span>
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="exportFmt"
                      checked={exportFormat === "PDF"}
                      onChange={() => setExportFormat("PDF")}
                    />
                    <span>PDF (Audit Summary Report)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lh-detail-footer">
              <Button className="button secondary" onClick={() => setExportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button"
                style={{ background: "var(--teal)", borderColor: "var(--teal)" }}
                onClick={handleConfirmExport}
              >
                <Icon name="download" size={14} />
                Confirm &amp; Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
