import { useState, useMemo, useEffect } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import { api } from "../api/client"
import {
  initialQueueEntries,
  queueServices,
  computeQueueSummary,
  formatWaitingDuration,
  queueStatusPillClass,
  queueStatusLabel,
  type QueueEntry,
  type QueueStatus,
} from "./model"
import { patients as directoryPatients } from "../patient-directory/model"
import { sampleAppointments } from "../appointment-management/model"
import "./queue-management.css"

type ModalAction =
  | null
  | "add-to-queue"
  | "entry-details"
  | "confirm-transition"
  | "confirm-cancel"
  | "confirm-left"

export default function QueueManagementPage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState("2026-10-14")
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>(initialQueueEntries)

  useEffect(() => {
    let mounted = true
    api.getQueue()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setQueueEntries(
            data.map((d: any) => ({
              id: d.id,
              queueNumber: d.ticketNumber || d.queueNumber || "Q-01",
              patientId: d.patientId,
              patientName: d.patientName,
              patientPhone: d.patientPhone || "+251 91 000 0000",
              date: d.date ? d.date.slice(0, 10) : "2026-10-14",
              arrivalTime: d.arrivalTime || "08:30",
              service: d.department || d.service || "General Outpatient Consultation",
              status: (d.status === "in_consultation" ? "in-service" : d.status) || "waiting",
              waitingMinutes: d.waitingMinutes || 10,
              assignedStaff: d.assignedDoctor || d.assignedStaff || null,
              appointmentId: d.appointmentId || null,
              isWalkIn: d.isWalkIn ?? true,
              clinicalPriority: d.priority === "high" || d.priority === "emergency" ? "Priority / Review" : "Routine",
            }))
          )
        }
      })
      .catch((err) => console.error("Database queue fetch notice:", err))
    return () => {
      mounted = false
    }
  }, [])

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")

  // Modal and contextual target
  const [activeModal, setActiveModal] = useState<ModalAction>(null)
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null)
  const [pendingNextStatus, setPendingNextStatus] = useState<QueueStatus | null>(null)

  // Add to Queue form workflow
  const [addStep, setAddStep] = useState<1 | 2>(1)
  const [patientSearch, setPatientSearch] = useState("")
  const [chosenPatient, setChosenPatient] = useState<{ id: string; name: string; phone?: string } | null>(null)
  const [associatedAppointmentId, setAssociatedAppointmentId] = useState<string>("")
  const [targetService, setTargetService] = useState<string>(queueServices[0])
  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false)

  // Security & permissions check
  const canManageQueue = permissions.has("queue")
  const canRegisterPatient = permissions.has("registration")

  // Summary counts
  const summary = useMemo(
    () => computeQueueSummary(queueEntries, selectedDate, serviceFilter),
    [queueEntries, selectedDate, serviceFilter]
  )

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    if (state === "empty" || state === "no-matches") return []
    return queueEntries.filter((entry) => {
      const matchDate = entry.date === selectedDate
      const matchStatus = statusFilter === "all" || entry.status === statusFilter
      const matchService = serviceFilter === "all" || entry.service === serviceFilter
      const normalized = searchQuery.trim().toLowerCase()
      const matchSearch =
        !normalized ||
        entry.patientName.toLowerCase().includes(normalized) ||
        entry.patientId.toLowerCase().includes(normalized) ||
        entry.queueNumber.toLowerCase().includes(normalized) ||
        entry.id.toLowerCase().includes(normalized)
      return matchDate && matchStatus && matchService && matchSearch
    })
  }, [queueEntries, selectedDate, statusFilter, serviceFilter, searchQuery, state])

  // Date shifting
  function shiftDate(days: number) {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const cur = new Date(Date.UTC(y, m - 1, d))
    cur.setUTCDate(cur.getUTCDate() + days)
    setSelectedDate(cur.toISOString().slice(0, 10))
  }

  // Open "Register Arrival / Add to Queue" modal
  function handleOpenAdd() {
    setAddStep(1)
    setPatientSearch("")
    setChosenPatient(null)
    setAssociatedAppointmentId("")
    setTargetService(queueServices[0])
    setDuplicateWarning(false)
    setActiveModal("add-to-queue")
  }

  // Select patient in Add step 1
  function handleSelectPatient(p: { id: string; name: string; contact?: string }) {
    setChosenPatient({ id: p.id, name: p.name, phone: p.contact })
    // Check if there is an existing active entry
    const hasActive = queueEntries.some(
      (e) =>
        e.patientId === p.id &&
        (e.status === "waiting" || e.status === "called" || e.status === "in-service")
    )
    setDuplicateWarning(hasActive)

    // Check if patient has appointment today
    const appt = sampleAppointments.find((a) => a.patientId === p.id && a.date === selectedDate)
    if (appt) {
      setAssociatedAppointmentId(appt.id)
    }
    setAddStep(2)
  }

  // Confirm Add to Queue
  async function handleConfirmAdd() {
    if (!chosenPatient) return
    const nextNum = `Q-${String(queueEntries.length + 1).padStart(2, "0")}`
    const newEntry: QueueEntry = {
      id: `QE-2026-${Math.floor(200 + Math.random() * 800)}`,
      queueNumber: nextNum,
      patientId: chosenPatient.id,
      patientName: chosenPatient.name,
      patientPhone: chosenPatient.phone || "+251 91 123 4589",
      date: selectedDate,
      arrivalTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      service: targetService,
      status: "waiting",
      waitingMinutes: 0,
      appointmentId: associatedAppointmentId || null,
      isWalkIn: !associatedAppointmentId,
      clinicalPriority: "Routine",
    }

    try {
      await api.createQueueTicket({
        id: newEntry.id,
        ticketNumber: newEntry.queueNumber,
        patientId: newEntry.patientId,
        patientName: newEntry.patientName,
        patientPhone: newEntry.patientPhone,
        department: newEntry.service,
        date: newEntry.date,
        arrivalTime: newEntry.arrivalTime,
        status: newEntry.status,
        waitingMinutes: newEntry.waitingMinutes,
        isWalkIn: newEntry.isWalkIn,
      })
    } catch (err) {
      console.warn("Queue creation backend note:", err)
    }

    setQueueEntries([newEntry, ...queueEntries])
    setActiveModal(null)
  }

  // Status transitions
  function handleRequestTransition(entry: QueueEntry, next: QueueStatus) {
    setSelectedEntry(entry)
    setPendingNextStatus(next)
    setActiveModal("confirm-transition")
  }

  async function handleExecuteTransition() {
    if (!selectedEntry || !pendingNextStatus) return
    try {
      await api.updateQueueTicket(selectedEntry.id, {
        status: pendingNextStatus === "in-service" ? "in_consultation" : pendingNextStatus,
      })
    } catch (err) {
      console.warn("Queue update backend note:", err)
    }

    setQueueEntries((prev) =>
      prev.map((e) => (e.id === selectedEntry.id ? { ...e, status: pendingNextStatus } : e))
    )
    setActiveModal(null)
  }

  // Left Before Service
  async function handleConfirmLeftBeforeService() {
    if (!selectedEntry) return
    try {
      await api.updateQueueTicket(selectedEntry.id, { status: "left-before-service" })
    } catch (err) {
      console.warn("Queue update backend note:", err)
    }

    setQueueEntries((prev) =>
      prev.map((e) => (e.id === selectedEntry.id ? { ...e, status: "left-before-service" } : e))
    )
    setActiveModal(null)
  }

  // Cancel Queue Entry
  async function handleConfirmCancelQueue() {
    if (!selectedEntry) return
    try {
      await api.updateQueueTicket(selectedEntry.id, { status: "cancelled" })
    } catch (err) {
      console.warn("Queue update backend note:", err)
    }

    setQueueEntries((prev) =>
      prev.map((e) => (e.id === selectedEntry.id ? { ...e, status: "cancelled" } : e))
    )
    setActiveModal(null)
  }

  // Permission access check
  if (!canManageQueue) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  const patientMatches = directoryPatients.filter((p) => {
    const q = patientSearch.trim().toLowerCase()
    if (!q) return false
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  return (
    <div className="queue-mgmt-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Workspace</Button>
        <Icon name="chevron" size={11} />
        <span>Patient Operations</span>
        <Icon name="chevron" size={11} />
        <strong>Queue Management</strong>
      </nav>

      {/* ── Page Header ── */}
      <div className="queue-mgmt-header">
        <div>
          <Heading level={1}>Queue Management</Heading>
          <Text>Monitor arrivals and coordinate patient flow.</Text>
        </div>
        <Button className="button" onClick={handleOpenAdd}>
          <Icon name="user" size={16} />
          Register Arrival / Add to Queue
        </Button>
      </div>

      {/* ── Summary Cards (5 Operational Cards) ── */}
      <div className="queue-summary-grid">
        <div
          className={`queue-summary-card${statusFilter === "waiting" ? " active" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "waiting" ? "all" : "waiting")}
        >
          <div className="queue-summary-icon waiting">
            <Icon name="clock" size={20} />
          </div>
          <div className="queue-summary-data">
            <strong>{summary.waiting}</strong>
            <span>Waiting</span>
          </div>
        </div>

        <div
          className={`queue-summary-card${statusFilter === "called" ? " active" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "called" ? "all" : "called")}
        >
          <div className="queue-summary-icon called">
            <Icon name="arrow" size={20} />
          </div>
          <div className="queue-summary-data">
            <strong>{summary.called}</strong>
            <span>Called</span>
          </div>
        </div>

        <div
          className={`queue-summary-card${statusFilter === "in-service" ? " active" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "in-service" ? "all" : "in-service")}
        >
          <div className="queue-summary-icon inservice">
            <Icon name="check" size={20} />
          </div>
          <div className="queue-summary-data">
            <strong>{summary.inService}</strong>
            <span>In Service</span>
          </div>
        </div>

        <div
          className={`queue-summary-card${statusFilter === "completed" ? " active" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
        >
          <div className="queue-summary-icon completed">
            <Icon name="shield" size={20} />
          </div>
          <div className="queue-summary-data">
            <strong>{summary.completed}</strong>
            <span>Completed</span>
          </div>
        </div>

        <div
          className="queue-summary-card"
          onClick={() => {
            // Filter long waits or duplicate warnings
            setStatusFilter("all")
          }}
        >
          <div className="queue-summary-icon review">
            <Icon name="warning" size={20} />
          </div>
          <div className="queue-summary-data">
            <strong>{summary.requiresReview}</strong>
            <span>Requires Review</span>
          </div>
        </div>
      </div>

      {/* ── Date Navigator Toolbar ── */}
      <div className="queue-date-toolbar">
        <div className="queue-date-controls">
          <Button className="button secondary" onClick={() => shiftDate(-1)}>
            <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
              <Icon name="arrow" size={14} />
            </span>
            Previous
          </Button>
          <Button
            className="button secondary"
            onClick={() => setSelectedDate("2026-10-14")}
          >
            Today
          </Button>
          <Button className="button secondary" onClick={() => shiftDate(1)}>
            Next
            <Icon name="arrow" size={14} />
          </Button>
          <input
            type="date"
            className="permission-input"
            style={{ width: "auto", minHeight: "36px", padding: "4px 8px" }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <span className="queue-current-date">{selectedDate}</span>
        </div>

        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
          Showing active queue entries for selected operations.
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="queue-filters-bar">
        <div className="queue-search-box">
          <Icon name="search" size={16} />
          <input
            placeholder="Search by patient name, ID, or queue number…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              className="icon-button"
              style={{ width: "24px", height: "24px" }}
              onClick={() => setSearchQuery("")}
            >
              <Icon name="close" size={14} />
            </Button>
          )}
        </div>

        <div className="queue-filter-selects">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Queue Statuses</option>
            <option value="waiting">Waiting</option>
            <option value="called">Called</option>
            <option value="in-service">In Service</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="left-before-service">Left Before Service</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="all">All Queue Destinations</option>
            {queueServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          {(statusFilter !== "all" || serviceFilter !== "all" || searchQuery) && (
            <Button
              className="patient-text-button"
              onClick={() => {
                setStatusFilter("all")
                setServiceFilter("all")
                setSearchQuery("")
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* ── Desktop Queue Table ── */}
      <div className="queue-table-container">
        {filteredQueue.length === 0 ? (
          <div className="patient-empty-state">
            <Icon name="clock" size={28} />
            <h3>No patients currently in this queue</h3>
            <Text>No patients match the selected operational filters for this date.</Text>
            <Button className="button secondary" onClick={handleOpenAdd}>
              <Icon name="user" size={14} /> Register arrival
            </Button>
          </div>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>PATIENT</th>
                <th>ARRIVAL</th>
                <th>DESTINATION SERVICE</th>
                <th>WAITING DURATION</th>
                <th>QUEUE STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="queue-pos-badge">{item.queueNumber}</span>
                  </td>
                  <td className="queue-patient-cell">
                    <strong>{item.patientName}</strong>
                    <span>{item.patientId}</span>
                    {item.clinicalPriority && (
                      <div className="queue-priority-badge">
                        <Icon name="heart" size={11} /> {item.clinicalPriority}
                      </div>
                    )}
                    {item.hasDuplicateWarning && (
                      <div className="apt-conflict-badge">
                        <Icon name="warning" size={11} /> Duplicate review
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{item.arrivalTime}</strong>
                    <small style={{ display: "block", color: "var(--muted)" }}>
                      {item.isWalkIn ? "Walk-in" : "Appointment"}
                    </small>
                  </td>
                  <td>
                    <span>{item.service}</span>
                    {item.assignedStaff && (
                      <small style={{ display: "block", color: "var(--muted)" }}>
                        Staff: {item.assignedStaff}
                      </small>
                    )}
                  </td>
                  <td>
                    <span
                      className={`queue-duration-text${
                        item.waitingMinutes > 40 && item.status === "waiting"
                          ? " long-wait"
                          : ""
                      }`}
                    >
                      {formatWaitingDuration(item.waitingMinutes)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`queue-status-pill ${queueStatusPillClass(item.status)}`}
                    >
                      {queueStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className="queue-actions">
                      {item.status === "waiting" && (
                        <Button
                          className="button compact"
                          onClick={() => handleRequestTransition(item, "called")}
                        >
                          Call Patient
                        </Button>
                      )}
                      {item.status === "called" && (
                        <Button
                          className="button compact"
                          onClick={() => handleRequestTransition(item, "in-service")}
                        >
                          Start Service
                        </Button>
                      )}
                      {item.status === "in-service" && (
                        <Button
                          className="button compact"
                          onClick={() => handleRequestTransition(item, "completed")}
                        >
                          Complete Step
                        </Button>
                      )}

                      <Button
                        className="button secondary compact"
                        onClick={() => {
                          setSelectedEntry(item)
                          setActiveModal("entry-details")
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Mobile Queue Cards (Below 800px) ── */}
      <div className="queue-mobile-list">
        {filteredQueue.map((item) => (
          <div key={item.id} className="queue-card-mobile">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="queue-pos-badge">{item.queueNumber}</span>
              <span className={`queue-status-pill ${queueStatusPillClass(item.status)}`}>
                {queueStatusLabel(item.status)}
              </span>
            </div>
            <div>
              <strong style={{ fontSize: "14px", color: "var(--navy)" }}>{item.patientName}</strong>
              <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                {item.patientId} · Arrived {item.arrivalTime}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--ink)" }}>
              <strong>Destination:</strong> {item.service}
            </div>
            <div style={{ fontSize: "11px" }}>
              <strong>Wait Time:</strong>{" "}
              <span className={item.waitingMinutes > 40 ? "queue-duration-text long-wait" : ""}>
                {formatWaitingDuration(item.waitingMinutes)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <Button
                className="button compact"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedEntry(item)
                  setActiveModal("entry-details")
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL 1: Register Arrival / Add to Queue ── */}
      {activeModal === "add-to-queue" && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Register Arrival / Add to Queue</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>

            {addStep === 1 && (
              <div>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
                  Find the patient to place in the operational queue.
                </p>
                <div className="apt-form-group">
                  <label>Search Existing Patients</label>
                  <input
                    placeholder="Search by name or patient ID…"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>

                {patientSearch && (
                  <div className="apt-patient-selector">
                    {patientMatches.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                          No patient matches “{patientSearch}”.
                        </span>
                        {canRegisterPatient && (
                          <Button
                            className="patient-text-button"
                            style={{ margin: "8px auto 0" }}
                            onClick={() => {
                              setActiveModal(null)
                              onNavigate("registration")
                            }}
                          >
                            Go to Registration <Icon name="arrow" size={12} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      patientMatches.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid var(--line)",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "12px", color: "var(--navy)" }}>{p.name}</strong>
                            <small style={{ display: "block", color: "var(--muted)" }}>{p.id}</small>
                          </div>
                          <Button
                            className="button secondary compact"
                            onClick={() => handleSelectPatient(p)}
                          >
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="apt-dialog-actions">
                  <Button className="button secondary" onClick={() => setActiveModal(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {addStep === 2 && chosenPatient && (
              <div>
                {duplicateWarning && (
                  <div className="patient-duplicate-notice" style={{ marginBottom: "16px" }}>
                    <Icon name="warning" size={18} />
                    <div className="patient-duplicate-notice-content">
                      <strong>Active Queue Entry Exists</strong>
                      <p>This patient already has an active status in the hospital queue today.</p>
                    </div>
                  </div>
                )}

                <div className="apt-selected-patient-box" style={{ marginBottom: "16px" }}>
                  <div>
                    <strong>{chosenPatient.name}</strong>
                    <span>{chosenPatient.id}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: "600" }}>
                    Confirmed
                  </span>
                </div>

                <div className="apt-form-group">
                  <label>Arrival Type &amp; Appointment Association</label>
                  <select
                    value={associatedAppointmentId}
                    onChange={(e) => setAssociatedAppointmentId(e.target.value)}
                  >
                    <option value="">Walk-in (No Scheduled Appointment)</option>
                    {sampleAppointments
                      .filter((a) => a.patientId === chosenPatient.id)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          Linked Booking: {a.id} ({a.time} - {a.department})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="apt-form-group">
                  <label>Destination Service</label>
                  <select
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                  >
                    {queueServices.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="apt-dialog-actions">
                  <Button className="button secondary" onClick={() => setAddStep(1)}>
                    Back
                  </Button>
                  <Button className="button" onClick={handleConfirmAdd}>
                    Place in Queue <Icon name="check" size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: Queue Entry Details ── */}
      {activeModal === "entry-details" && selectedEntry && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Queue Entry — {selectedEntry.queueNumber}</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "var(--ink)" }}>
              <p><strong>Patient Name:</strong> {selectedEntry.patientName}</p>
              <p><strong>Patient ID:</strong> {selectedEntry.patientId}</p>
              <p><strong>Arrival Timestamp:</strong> {selectedEntry.arrivalTime} ({selectedEntry.date})</p>
              <p><strong>Queue Order:</strong> {selectedEntry.queueNumber}</p>
              <p><strong>Destination:</strong> {selectedEntry.service}</p>
              <p><strong>Current Status:</strong> {queueStatusLabel(selectedEntry.status)}</p>
              <p><strong>Waiting Time:</strong> {formatWaitingDuration(selectedEntry.waitingMinutes)}</p>
              <p><strong>Type:</strong> {selectedEntry.isWalkIn ? "Walk-in Visit" : "Pre-booked Arrival"}</p>
              {selectedEntry.notes && <p><strong>Notes:</strong> {selectedEntry.notes}</p>}
            </div>

            <div className="apt-dialog-actions">
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveModal(null)
                  onNavigate("patient-profile")
                }}
              >
                Open Patient Profile <Icon name="arrow" size={12} />
              </Button>
              {selectedEntry.status === "waiting" && (
                <Button
                  className="button secondary"
                  style={{ color: "var(--emergency)" }}
                  onClick={() => setActiveModal("confirm-left")}
                >
                  Mark Left Before Service
                </Button>
              )}
              <Button className="button" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Status Transition Confirmation ── */}
      {activeModal === "confirm-transition" && selectedEntry && pendingNextStatus && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Confirm Status Transition</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--ink)" }}>
              Advance <strong>{selectedEntry.patientName}</strong> ({selectedEntry.queueNumber}) from{" "}
              <strong>{queueStatusLabel(selectedEntry.status)}</strong> to{" "}
              <strong>{queueStatusLabel(pendingNextStatus)}</strong>?
            </p>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button className="button" onClick={handleExecuteTransition}>
                Confirm Transition <Icon name="check" size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Left Before Service Confirmation ── */}
      {activeModal === "confirm-left" && selectedEntry && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Record Patient Departure</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--ink)", lineHeight: "1.6" }}>
              Record that <strong>{selectedEntry.patientName}</strong> ({selectedEntry.queueNumber}) left before
              receiving service? This will remove them from the active waiting queue.
            </p>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setActiveModal(null)}>
                Keep Waiting
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)" }}
                onClick={handleConfirmLeftBeforeService}
              >
                Confirm Departure
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
