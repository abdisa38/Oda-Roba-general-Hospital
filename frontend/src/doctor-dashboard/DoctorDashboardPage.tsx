import { useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  initialDoctorQueue,
  initialClinicalTasks,
  initialDoctorSchedule,
  type DoctorPatientQueueItem,
  type ConsultationWorkflowStatus,
  type ClinicalPriority,
  type ClinicalTaskItem,
} from "./model"
import "./doctor-dashboard.css"

export default function DoctorDashboardPage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const [queue, setQueue] = useState<DoctorPatientQueueItem[]>(initialDoctorQueue)
  const [clinicalTasks, setClinicalTasks] = useState<ClinicalTaskItem[]>(initialClinicalTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialDoctorQueue[0].id)
  const [activeModalPatient, setActiveModalPatient] = useState<DoctorPatientQueueItem | null>(null)
  const [reviewTaskSuccessNotice, setReviewTaskSuccessNotice] = useState<string>("")

  // Security check: Doctor role or consultations permission
  const canAccessDoctor = permissions.has("consultations") || permissions.has("assigned")

  if (!canAccessDoctor) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  // Summary counts
  const waitingCount = queue.filter((p) => p.status === "Waiting").length
  const inConsultationCount = queue.filter((p) => p.status === "In Consultation").length
  const readyForReviewCount = queue.filter((p) => p.status === "Ready for Review").length
  const completedCount = queue.filter((p) => p.status === "Completed").length

  // Filtered queue calculation
  const filteredQueue = queue.filter((p) => {
    // Search query matches name, ID, or encounter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.encounterId.toLowerCase().includes(q) ||
        p.chiefComplaint.toLowerCase().includes(q)
      if (!match) return false
    }

    // Status filter
    if (selectedStatus !== "all" && p.status !== selectedStatus) {
      return false
    }

    // Priority filter
    if (selectedPriority !== "all" && p.priority !== selectedPriority) {
      return false
    }

    // Assigned to me filter
    if (assignedToMeOnly && !p.isAssignedToMe) {
      return false
    }

    return true
  })

  const selectedPatient = queue.find((p) => p.id === selectedPatientId) || filteredQueue[0] || null

  // Handle Mark Clinical Task Reviewed
  function handleReviewTask(taskId: string, description: string) {
    setClinicalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, reviewed: true, status: "Pending Review" } : t))
    )
    setReviewTaskSuccessNotice(`Marked reviewed: ${description}`)
    setTimeout(() => setReviewTaskSuccessNotice(""), 3500)
  }

  // Priority badge class
  function priorityClass(priority: ClinicalPriority) {
    switch (priority) {
      case "Urgent":
        return "urgent"
      case "Priority":
        return "priority"
      case "Standard":
        return "standard"
      default:
        return "non-urgent"
    }
  }

  // Status badge class
  function statusClass(status: ConsultationWorkflowStatus) {
    switch (status) {
      case "Waiting":
        return "waiting"
      case "In Consultation":
        return "inconsultation"
      case "Awaiting Results":
        return "awaitingresults"
      case "Ready for Review":
        return "readyforreview"
      case "Completed":
        return "completed"
    }
  }

  // Row action label
  function actionLabel(status: ConsultationWorkflowStatus) {
    switch (status) {
      case "Waiting":
        return "Start Consultation"
      case "In Consultation":
        return "Continue Consultation"
      case "Awaiting Results":
        return "View Encounter"
      case "Ready for Review":
        return "Review Results"
      case "Completed":
        return "View Record"
    }
  }

  // Clear all filters
  function handleClearFilters() {
    setSearchQuery("")
    setSelectedStatus("all")
    setSelectedPriority("all")
    setAssignedToMeOnly(false)
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    !assignedToMeOnly

  return (
    <div className="doctor-dashboard-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <span>Clinical Care</span>
        <Icon name="chevron" size={11} />
        <strong>Doctor Dashboard</strong>
      </nav>

      {/* ── Page Header ── */}
      <div className="doctor-header-top">
        <div>
          <Heading level={1}>Doctor Dashboard</Heading>
          <Text>Your patient queue, active consultations, and diagnostic follow-up.</Text>
        </div>
        <div className="doctor-header-actions">
          <Button
            className="button"
            onClick={() => onNavigate("clinical-workspace")}
          >
            <Icon name="user" size={16} />
            Next Waiting Patient
          </Button>
          <Button
            className="button secondary"
            onClick={() => onNavigate("patient-profile")}
          >
            <Icon name="search" size={16} />
            Patient Lookup
          </Button>
        </div>
      </div>

      {/* ── Feedback Notification ── */}
      {reviewTaskSuccessNotice && (
        <div className="patient-save-success" role="status">
          <Icon name="check" size={16} /> {reviewTaskSuccessNotice}
        </div>
      )}

      {/* ── Summary Cards Row ── */}
      <div className="doctor-summary-grid">
        <div
          className={`doctor-summary-card${selectedStatus === "Waiting" ? " active" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "Waiting" ? "all" : "Waiting")}
          role="button"
          tabIndex={0}
        >
          <div className="doctor-summary-icon waiting">
            <Icon name="clock" size={22} />
          </div>
          <div className="doctor-summary-info">
            <small>Waiting Consultation</small>
            <strong>{waitingCount}</strong>
          </div>
        </div>

        <div
          className={`doctor-summary-card${selectedStatus === "In Consultation" ? " active" : ""}`}
          onClick={() =>
            setSelectedStatus(selectedStatus === "In Consultation" ? "all" : "In Consultation")
          }
          role="button"
          tabIndex={0}
        >
          <div className="doctor-summary-icon inconsultation">
            <Icon name="user" size={22} />
          </div>
          <div className="doctor-summary-info">
            <small>In Consultation</small>
            <strong>{inConsultationCount}</strong>
          </div>
        </div>

        <div
          className={`doctor-summary-card${selectedStatus === "Ready for Review" ? " active" : ""}`}
          onClick={() =>
            setSelectedStatus(selectedStatus === "Ready for Review" ? "all" : "Ready for Review")
          }
          role="button"
          tabIndex={0}
        >
          <div className="doctor-summary-icon readyreview">
            <Icon name="flask" size={22} />
          </div>
          <div className="doctor-summary-info">
            <small>Results for Review</small>
            <strong>{readyForReviewCount}</strong>
          </div>
        </div>

        <div
          className={`doctor-summary-card${selectedStatus === "Completed" ? " active" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "Completed" ? "all" : "Completed")}
          role="button"
          tabIndex={0}
        >
          <div className="doctor-summary-icon completed">
            <Icon name="check" size={22} />
          </div>
          <div className="doctor-summary-info">
            <small>Completed Today</small>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filter Bar ── */}
      <div className="doctor-toolbar">
        <div className="doctor-toolbar-left">
          <div className="doctor-search-box">
            <Icon name="search" size={15} />
            <input
              type="text"
              placeholder="Search by patient name, MRN, or encounter ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search patient queue"
            />
          </div>

          <button
            type="button"
            className={`doctor-filter-toggle${assignedToMeOnly ? " active" : ""}`}
            onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
            title="Toggle between my assigned patients and all OPD patients"
          >
            <Icon name="user" size={14} />
            {assignedToMeOnly ? "My Patients Only" : "All OPD Patients"}
          </button>
        </div>

        <div className="doctor-toolbar-right">
          <select
            className="doctor-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by encounter status"
          >
            <option value="all">All Workflow Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Awaiting Results">Awaiting Results</option>
            <option value="Ready for Review">Ready for Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="doctor-filter-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            aria-label="Filter by clinical priority"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="Priority">Priority</option>
            <option value="Standard">Standard</option>
            <option value="Non-Urgent">Non-Urgent</option>
          </select>

          {hasActiveFilters && (
            <Button className="button secondary compact" onClick={handleClearFilters}>
              <Icon name="close" size={13} />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Two Column Layout ── */}
      <div className="doctor-layout-grid">
        {/* Left Column: Main Patient Queue Table */}
        <div className="doctor-table-card">
          <div className="doctor-table-header">
            <div>
              <h2>Patient Consultation Queue</h2>
              <span>
                Showing {filteredQueue.length} patient{filteredQueue.length === 1 ? "" : "s"}
                {assignedToMeOnly ? " assigned to Dr. Daniel Abate" : " across OPD clinic"}
              </span>
            </div>
            {selectedStatus !== "all" && (
              <span className="doctor-encounter-chip">Filter: {selectedStatus}</span>
            )}
          </div>

          {filteredQueue.length === 0 ? (
            <div className="patient-empty-state" style={{ padding: "40px 20px" }}>
              <Icon name="user" size={32} />
              <Heading level={3}>No patients match your criteria</Heading>
              <Text>
                Try clearing active filters or searching with a different name or patient ID.
              </Text>
              <Button className="button secondary" onClick={handleClearFilters}>
                Reset all filters
              </Button>
            </div>
          ) : (
            <table className="doctor-queue-table" aria-label="Doctor patient queue table">
              <thead>
                <tr>
                  <th>WAIT / TIME</th>
                  <th>PATIENT IDENTIFICATION</th>
                  <th>ENCOUNTER</th>
                  <th>CHIEF COMPLAINT</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedPatient?.id === item.id ? "selected" : ""}
                    onClick={() => setSelectedPatientId(item.id)}
                  >
                    <td>
                      <div className="doctor-wait-pill">
                        <Icon name="clock" size={12} />
                        <strong>{item.waitingDuration}</strong>
                      </div>
                      <small style={{ color: "var(--muted)", display: "block" }}>
                        Arr: {item.arrivalTime}
                      </small>
                    </td>

                    <td>
                      <strong>{item.name}</strong>
                      <span className="doctor-patient-meta">
                        {item.patientId} · {item.sex} · {item.age}
                      </span>
                    </td>

                    <td>
                      <span className="doctor-encounter-chip">{item.encounterId}</span>
                      <small style={{ display: "block", color: "var(--muted)", marginTop: "2px" }}>
                        {item.encounterType}
                      </small>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "block",
                          maxWidth: "220px",
                          lineHeight: "1.4",
                          color: "var(--ink)",
                        }}
                      >
                        {item.chiefComplaint}
                      </span>
                    </td>

                    <td>
                      <span className={`doctor-priority-badge ${priorityClass(item.priority)}`}>
                        {item.priority === "Urgent" && <Icon name="warning" size={11} />}
                        {item.priority}
                      </span>
                    </td>

                    <td>
                      <span className={`doctor-status-badge ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Button
                        className="button compact"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveModalPatient(item)
                        }}
                      >
                        {actionLabel(item.status)}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Consultation Action Preview Modal ── */}
      {activeModalPatient && (
        <div
          className="doctor-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultation-modal-title"
        >
          <div className="doctor-modal-dialog">
            <div className="doctor-modal-header">
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
                  Encounter {activeModalPatient.encounterId}
                </span>
                <h3 id="consultation-modal-title">
                  {actionLabel(activeModalPatient.status)} — {activeModalPatient.name}
                </h3>
              </div>
              <Button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setActiveModalPatient(null)}
              >
                <Icon name="close" size={16} />
              </Button>
            </div>

            <div className="doctor-modal-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--mist)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <div>
                  <strong>{activeModalPatient.name}</strong> ({activeModalPatient.sex},{" "}
                  {activeModalPatient.age})
                  <span style={{ display: "block", color: "var(--muted)", fontFamily: "monospace" }}>
                    MRN: {activeModalPatient.patientId}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`doctor-priority-badge ${priorityClass(
                      activeModalPatient.priority
                    )}`}
                  >
                    {activeModalPatient.priority}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted)",
                      marginTop: "3px",
                    }}
                  >
                    Status: {activeModalPatient.status}
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "var(--navy)" }}>
                  Chief Complaint:
                </strong>
                <p style={{ fontSize: "13px", color: "var(--ink)", marginTop: "4px" }}>
                  {activeModalPatient.chiefComplaint}
                </p>
              </div>

              {activeModalPatient.triageNotes && (
                <div
                  style={{
                    background: "#f4faf9",
                    borderLeft: "3px solid var(--teal)",
                    padding: "10px 12px",
                    fontSize: "12px",
                  }}
                >
                  <strong style={{ color: "var(--teal)", display: "block", marginBottom: "2px" }}>
                    Triage Nurse Handoff Notes:
                  </strong>
                  <span>{activeModalPatient.triageNotes}</span>
                </div>
              )}

              {activeModalPatient.vitals && (
                <div>
                  <strong style={{ fontSize: "12px", color: "var(--navy)", display: "block", marginBottom: "6px" }}>
                    Triage Vital Signs:
                  </strong>
                  <div className="doctor-vitals-grid">
                    <div className="doctor-vital-item">
                      <span>Blood Pressure</span>
                      <strong>{activeModalPatient.vitals.bloodPressure}</strong>
                    </div>
                    <div className="doctor-vital-item">
                      <span>Pulse Rate</span>
                      <strong>{activeModalPatient.vitals.pulseRate}</strong>
                    </div>
                    <div className="doctor-vital-item">
                      <span>Temperature</span>
                      <strong>{activeModalPatient.vitals.temperature}</strong>
                    </div>
                    <div className="doctor-vital-item">
                      <span>Oxygen Saturation</span>
                      <strong>{activeModalPatient.vitals.oxygenSaturation}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "var(--muted)",
                  lineHeight: "1.6",
                }}
              >
                <span style={{ verticalAlign: "middle", marginRight: "6px", display: "inline-flex" }}>
                  <Icon name="info" size={14} />
                </span>
                Proceeding will launch the clinical consultation documentation workspace where subjective history, objective examination, diagnostic orders, and prescriptions are recorded.
              </div>
            </div>

            <div className="doctor-modal-footer">
              <Button
                className="button secondary"
                onClick={() => setActiveModalPatient(null)}
              >
                Return to Dashboard
              </Button>
              <Button
                className="button secondary"
                onClick={() => {
                  setActiveModalPatient(null)
                  onNavigate("patient-profile")
                }}
              >
                <Icon name="user" size={14} />
                Patient Profile
              </Button>
              <Button
                className="button"
                onClick={() => {
                  setActiveModalPatient(null)
                  onNavigate("clinical-workspace")
                }}
              >
                <Icon name="arrow" size={15} />
                Launch Clinical Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
