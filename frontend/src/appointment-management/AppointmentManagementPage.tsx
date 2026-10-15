import { useState, useMemo } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  sampleAppointments,
  sampleDepartments,
  sampleClinicians,
  computeSummary,
  formatFriendlyDate,
  statusBadgeClass,
  statusDisplayLabel,
  type StaffAppointment,
  type AppointmentStatus,
  type CalendarViewMode,
} from "./model"
import { patients as directoryPatients } from "../patient-directory/model"
import "./appointment-management.css"

type ModalMode =
  | null
  | "create"
  | "reschedule"
  | "cancel"
  | "details"

export default function AppointmentManagementPage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  // Working date selection
  const [selectedDate, setSelectedDate] = useState("2026-10-14")
  const [appointmentsList, setAppointmentsList] = useState<StaffAppointment[]>(sampleAppointments)
  const [viewMode, setViewMode] = useState<CalendarViewMode>("list")

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")

  // Modal interaction state
  const [activeModal, setActiveModal] = useState<ModalMode>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<StaffAppointment | null>(null)

  // Scheduling Workflow Form State
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [patientSearch, setPatientSearch] = useState("")
  const [chosenPatient, setChosenPatient] = useState<{ id: string; name: string; phone?: string } | null>(null)
  const [bookingForm, setBookingForm] = useState({
    date: "2026-10-14",
    time: "09:00",
    department: sampleDepartments[0],
    clinician: sampleClinicians[0],
    reason: "",
    notes: "",
  })

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    clinician: "",
  })

  // Cancellation Form State
  const [cancelReason, setCancelReason] = useState("")

  // Security & permissions check
  const canManageAppointments = permissions.has("appointments")
  const canRegisterPatient = permissions.has("registration")

  // Summary counts based on selected date
  const summary = useMemo(
    () => computeSummary(appointmentsList, selectedDate),
    [appointmentsList, selectedDate]
  )

  // Filtered appointment records
  const filteredAppointments = useMemo(() => {
    if (state === "empty" || state === "no-matches") return []
    return appointmentsList.filter((apt) => {
      const matchDate = apt.date === selectedDate
      const matchStatus = statusFilter === "all" || apt.status === statusFilter
      const matchDept = departmentFilter === "all" || apt.department === departmentFilter
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchSearch =
        !normalizedQuery ||
        apt.patientName.toLowerCase().includes(normalizedQuery) ||
        apt.patientId.toLowerCase().includes(normalizedQuery) ||
        apt.id.toLowerCase().includes(normalizedQuery)
      return matchDate && matchStatus && matchDept && matchSearch
    })
  }, [appointmentsList, selectedDate, statusFilter, departmentFilter, searchQuery, state])

  // Date shifting
  function shiftDate(days: number) {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const current = new Date(Date.UTC(y, m - 1, d))
    current.setUTCDate(current.getUTCDate() + days)
    const newStr = current.toISOString().slice(0, 10)
    setSelectedDate(newStr)
  }

  // Open Scheduling Modal
  function handleOpenCreate() {
    setStep(1)
    setPatientSearch("")
    setChosenPatient(null)
    setBookingForm({
      date: selectedDate,
      time: "09:00",
      department: sampleDepartments[0],
      clinician: sampleClinicians[0],
      reason: "",
      notes: "",
    })
    setActiveModal("create")
  }

  // Confirm booking
  function handleConfirmCreate() {
    if (!chosenPatient) return
    const newApt: StaffAppointment = {
      id: `APT-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: chosenPatient.id,
      patientName: chosenPatient.name,
      patientPhone: chosenPatient.phone || "••• ••• 0199",
      date: bookingForm.date,
      time: bookingForm.time,
      duration: 30,
      department: bookingForm.department,
      clinician: bookingForm.clinician,
      reason: bookingForm.reason || "Scheduled Consultation",
      notes: bookingForm.notes,
      status: "scheduled",
      createdDate: new Date().toISOString().slice(0, 10),
    }
    setAppointmentsList([newApt, ...appointmentsList])
    setActiveModal(null)
  }

  // Open Reschedule Modal
  function handleOpenReschedule(apt: StaffAppointment) {
    setSelectedAppointment(apt)
    setRescheduleData({
      date: apt.date,
      time: apt.time,
      clinician: apt.clinician || sampleClinicians[0],
    })
    setActiveModal("reschedule")
  }

  // Confirm Reschedule
  function handleConfirmReschedule() {
    if (!selectedAppointment) return
    setAppointmentsList((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              date: rescheduleData.date,
              time: rescheduleData.time,
              clinician: rescheduleData.clinician,
              status: "scheduled",
            }
          : item
      )
    )
    setActiveModal(null)
  }

  // Open Cancel Modal
  function handleOpenCancel(apt: StaffAppointment) {
    setSelectedAppointment(apt)
    setCancelReason("")
    setActiveModal("cancel")
  }

  // Confirm Cancel
  function handleConfirmCancel() {
    if (!selectedAppointment) return
    setAppointmentsList((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              status: "cancelled",
              notes: cancelReason ? `Cancelled: ${cancelReason}` : item.notes,
            }
          : item
      )
    )
    setActiveModal(null)
  }

  // Mark Arrival / Check In
  function handleCheckIn(apt: StaffAppointment) {
    setAppointmentsList((prev) =>
      prev.map((item) => (item.id === apt.id ? { ...item, status: "arrived" } : item))
    )
  }

  // Permission access boundary
  if (!canManageAppointments) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  // Patient search matches during booking
  const patientMatches = directoryPatients.filter((p) => {
    const q = patientSearch.trim().toLowerCase()
    if (!q) return false
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  return (
    <div className="appointment-mgmt-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Workspace</Button>
        <Icon name="chevron" size={11} />
        <span>Patient Operations</span>
        <Icon name="chevron" size={11} />
        <strong>Appointment Management</strong>
      </nav>

      {/* ── Top Header ── */}
      <div className="appointment-mgmt-header">
        <div>
          <Heading level={1}>Appointment Management</Heading>
          <Text>Schedule, review, and manage patient appointments.</Text>
        </div>
        <Button className="button" onClick={handleOpenCreate}>
          <Icon name="calendar" size={16} />
          Schedule Appointment
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="appointment-summary-grid">
        <div className="appointment-summary-card">
          <div className="appointment-summary-icon">
            <Icon name="calendar" size={20} />
          </div>
          <div className="appointment-summary-data">
            <strong>{summary.total}</strong>
            <span>Total Scheduled</span>
          </div>
        </div>

        <div className="appointment-summary-card">
          <div className="appointment-summary-icon confirmed">
            <Icon name="check" size={20} />
          </div>
          <div className="appointment-summary-data">
            <strong>{summary.confirmed}</strong>
            <span>Confirmed</span>
          </div>
        </div>

        <div className="appointment-summary-card">
          <div className="appointment-summary-icon arrived">
            <Icon name="user" size={20} />
          </div>
          <div className="appointment-summary-data">
            <strong>{summary.arrived}</strong>
            <span>Arrived / Checked In</span>
          </div>
        </div>

        <div className="appointment-summary-card">
          <div className="appointment-summary-icon cancelled">
            <Icon name="close" size={20} />
          </div>
          <div className="appointment-summary-data">
            <strong>{summary.cancelled}</strong>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* ── Date Navigator & View Switch ── */}
      <div className="appointment-date-toolbar">
        <div className="appointment-date-controls">
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
          <span className="appointment-current-date">
            {formatFriendlyDate(selectedDate)}
          </span>
        </div>

        <div className="appointment-view-toggle">
          <button
            type="button"
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            <Icon name="menu" size={14} /> List
          </button>
          <button
            type="button"
            className={viewMode === "calendar" ? "active" : ""}
            onClick={() => setViewMode("calendar")}
          >
            <Icon name="calendar" size={14} /> Timeline
          </button>
        </div>
      </div>

      {/* ── Search & Filters Toolbar ── */}
      <div className="appointment-filters-bar">
        <div className="appointment-search-box">
          <Icon name="search" size={16} />
          <input
            placeholder="Search by patient name, ID, or appointment number…"
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

        <div className="appointment-filter-selects">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {sampleDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {(statusFilter !== "all" || departmentFilter !== "all" || searchQuery) && (
            <Button
              className="patient-text-button"
              onClick={() => {
                setStatusFilter("all")
                setDepartmentFilter("all")
                setSearchQuery("")
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* ── Main View Area ── */}
      {viewMode === "list" ? (
        <div className="appointment-table-container">
          {filteredAppointments.length === 0 ? (
            <div className="patient-empty-state">
              <Icon name="calendar" size={28} />
              <h3>No appointments scheduled</h3>
              <p>
                There are no appointment records matching the selected date and filters.
              </p>
              <Button className="button secondary" onClick={handleOpenCreate}>
                <Icon name="calendar" size={14} /> Schedule an appointment
              </Button>
            </div>
          ) : (
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>PATIENT</th>
                  <th>SERVICE / DEPT</th>
                  <th>ASSIGNED CLINICIAN</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="apt-time-col">
                      <strong>{apt.time}</strong>
                      <small>{apt.duration} min</small>
                    </td>
                    <td className="apt-patient-col">
                      <strong>{apt.patientName}</strong>
                      <span>{apt.patientId}</span>
                      {apt.hasConflict && (
                        <div className="apt-conflict-badge">
                          <Icon name="warning" size={12} /> Potential conflict
                        </div>
                      )}
                    </td>
                    <td>
                      <span>{apt.department}</span>
                      <small style={{ display: "block", color: "var(--muted)" }}>
                        {apt.reason}
                      </small>
                    </td>
                    <td>
                      <span style={{ color: apt.clinician ? "var(--ink)" : "var(--muted)" }}>
                        {apt.clinician || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <span className={`apt-status-pill ${statusBadgeClass(apt.status)}`}>
                        {statusDisplayLabel(apt.status)}
                      </span>
                    </td>
                    <td>
                      <div className="apt-actions">
                        {apt.status === "scheduled" || apt.status === "confirmed" ? (
                          <>
                            <Button
                              className="button compact"
                              onClick={() => handleCheckIn(apt)}
                            >
                              Check In
                            </Button>
                            <Button
                              className="button secondary compact"
                              onClick={() => handleOpenReschedule(apt)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              className="button secondary compact"
                              onClick={() => handleOpenCancel(apt)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="button secondary compact"
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setActiveModal("details")
                            }}
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Timeline / Calendar View */
        <div className="appointment-calendar-grid">
          <div className="calendar-time-slots">
            {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map((hour) => {
              const matches = filteredAppointments.filter((a) => a.time.startsWith(hour.slice(0, 2)))
              return (
                <div key={hour} className="calendar-slot-row">
                  <div className="calendar-slot-time">{hour}</div>
                  <div className="calendar-slot-content">
                    {matches.length === 0 ? (
                      <span style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic", padding: "6px 0" }}>
                        No appointments booked
                      </span>
                    ) : (
                      matches.map((item) => (
                        <div
                          key={item.id}
                          className={`calendar-card${item.hasConflict ? " has-conflict" : ""}`}
                          onClick={() => {
                            setSelectedAppointment(item)
                            setActiveModal("details")
                          }}
                        >
                          <strong>{item.time} · {item.patientName}</strong>
                          <span>{item.department}</span>
                          <span style={{ color: "var(--teal-dark)", fontWeight: "600" }}>
                            {statusDisplayLabel(item.status)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODAL 1: Schedule Appointment (3 Steps) ── */}
      {activeModal === "create" && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Schedule Appointment — Step {step} of 3</h2>
              <Button
                className="icon-button"
                aria-label="Close"
                onClick={() => setActiveModal(null)}
              >
                <Icon name="close" size={18} />
              </Button>
            </div>

            {/* Step 1: Select Patient */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
                  Search and confirm an existing registered patient record before scheduling.
                </p>
                <div className="apt-form-group">
                  <label>Find existing patient</label>
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
                          No registered patient matches “{patientSearch}”.
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
                            Register New Patient <Icon name="arrow" size={12} />
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
                            onClick={() => setChosenPatient({ id: p.id, name: p.name, phone: p.contact })}
                          >
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {chosenPatient && (
                  <div className="apt-selected-patient-box">
                    <div>
                      <strong>{chosenPatient.name}</strong>
                      <span>{chosenPatient.id} · {chosenPatient.phone || "No phone"}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: "600" }}>
                      Selected
                    </span>
                  </div>
                )}

                <div className="apt-dialog-actions">
                  <Button className="button secondary" onClick={() => setActiveModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="button"
                    disabled={!chosenPatient}
                    onClick={() => setStep(2)}
                  >
                    Continue to Details <Icon name="arrow" size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Appointment Details */}
            {step === 2 && (
              <div>
                <div className="apt-form-group">
                  <label>Appointment Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div className="apt-form-group">
                  <label>Appointment Time</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  >
                    {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apt-form-group">
                  <label>Department / Service</label>
                  <select
                    value={bookingForm.department}
                    onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
                  >
                    {sampleDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apt-form-group">
                  <label>Assigned Clinician</label>
                  <select
                    value={bookingForm.clinician}
                    onChange={(e) => setBookingForm({ ...bookingForm, clinician: e.target.value })}
                  >
                    {sampleClinicians.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apt-form-group">
                  <label>Reason / Booking Notes</label>
                  <input
                    placeholder="e.g., Follow-up, consultation, or review"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  />
                </div>

                <div className="apt-dialog-actions">
                  <Button className="button secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="button" onClick={() => setStep(3)}>
                    Review Summary <Icon name="arrow" size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div>
                <div
                  style={{
                    background: "var(--mist)",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "12px",
                    lineHeight: "1.8",
                    marginBottom: "16px",
                  }}
                >
                  <p><strong>Patient:</strong> {chosenPatient?.name} ({chosenPatient?.id})</p>
                  <p><strong>Date &amp; Time:</strong> {bookingForm.date} at {bookingForm.time}</p>
                  <p><strong>Department:</strong> {bookingForm.department}</p>
                  <p><strong>Clinician:</strong> {bookingForm.clinician}</p>
                  <p><strong>Reason:</strong> {bookingForm.reason || "General review"}</p>
                </div>

                <div className="apt-dialog-actions">
                  <Button className="button secondary" onClick={() => setStep(2)}>
                    Edit Details
                  </Button>
                  <Button className="button" onClick={handleConfirmCreate}>
                    Confirm Appointment <Icon name="check" size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: Reschedule Workflow ── */}
      {activeModal === "reschedule" && selectedAppointment && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Reschedule Appointment</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
              Rescheduling for <strong>{selectedAppointment.patientName}</strong> ({selectedAppointment.patientId}).
            </p>
            <div className="apt-form-group">
              <label>New Date</label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
            </div>
            <div className="apt-form-group">
              <label>New Time</label>
              <select
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              >
                {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="apt-form-group">
              <label>Clinician</label>
              <select
                value={rescheduleData.clinician}
                onChange={(e) => setRescheduleData({ ...rescheduleData, clinician: e.target.value })}
              >
                {sampleClinicians.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setActiveModal(null)}>
                Keep Current
              </Button>
              <Button className="button" onClick={handleConfirmReschedule}>
                Save Reschedule <Icon name="check" size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Cancellation Confirmation ── */}
      {activeModal === "cancel" && selectedAppointment && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Confirm Appointment Cancellation</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--ink)", lineHeight: "1.6" }}>
              Are you sure you want to cancel the booking for{" "}
              <strong>{selectedAppointment.patientName}</strong> on {selectedAppointment.date} at {selectedAppointment.time}?
            </p>
            <div className="apt-form-group" style={{ marginTop: "16px" }}>
              <label>Reason for cancellation (optional)</label>
              <input
                placeholder="e.g., Patient requested cancellation, transport delay, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setActiveModal(null)}>
                Keep Appointment
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)" }}
                onClick={handleConfirmCancel}
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Appointment Details View ── */}
      {activeModal === "details" && selectedAppointment && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Appointment Details</h2>
              <Button className="icon-button" onClick={() => setActiveModal(null)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "var(--ink)" }}>
              <p><strong>Appointment ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Patient:</strong> {selectedAppointment.patientName} ({selectedAppointment.patientId})</p>
              <p><strong>Date &amp; Time:</strong> {selectedAppointment.date} at {selectedAppointment.time} ({selectedAppointment.duration} min)</p>
              <p><strong>Department:</strong> {selectedAppointment.department}</p>
              <p><strong>Clinician:</strong> {selectedAppointment.clinician || "Unassigned"}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              {selectedAppointment.notes && (
                <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
              )}
              <p><strong>Status:</strong> {statusDisplayLabel(selectedAppointment.status)}</p>
            </div>
            <div className="apt-dialog-actions">
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveModal(null)
                  onNavigate("patient-profile")
                }}
              >
                View Patient Profile <Icon name="arrow" size={12} />
              </Button>
              <Button className="button" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
