import { useState, useMemo } from "react"
import Icon from "../Icon"
import { Button, Heading, Text } from "../permissions/ui"
import { AccessDeniedPage } from "../permissions/components"
import {
  initialNurseQueue,
  initialNurseActivities,
  computeNurseSummary,
  priorityBadgeClass,
  triageStatusBadgeClass,
  type NurseQueuePatient,
  type VitalSigns,
  type TriagePriority,
  type TriageWorkflowStatus,
} from "./model"
import "./nurse-dashboard.css"

export default function NurseDashboardPage({
  state = "ready",
  permissions,
  onNavigate,
}: {
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const [queue, setQueue] = useState<NurseQueuePatient[]>(initialNurseQueue)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("N-Q01")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Modal / Assessment entry state
  const [triageModalOpen, setTriageModalOpen] = useState(false)
  const [triageTarget, setTriageTarget] = useState<NurseQueuePatient | null>(null)
  const [vitalsDraft, setVitalsDraft] = useState<VitalSigns>({})
  const [assessmentNotesDraft, setAssessmentNotesDraft] = useState("")
  const [priorityDraft, setPriorityDraft] = useState<TriagePriority>("Standard")
  const [escalationAlertOpen, setEscalationAlertOpen] = useState(false)

  // Permissions check
  const canAccessNursing = permissions.has("triage") || permissions.has("assigned")

  // Compute operational summary
  const summary = useMemo(() => computeNurseSummary(queue), [queue])

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    if (state === "empty" || state === "no-matches") return []
    return queue.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchPriority = priorityFilter === "all" || item.priority === priorityFilter
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.patientId.toLowerCase().includes(q) ||
        item.queueNumber.toLowerCase().includes(q) ||
        item.chiefComplaint.toLowerCase().includes(q)
      return matchStatus && matchPriority && matchSearch
    })
  }, [queue, statusFilter, priorityFilter, searchQuery, state])

  // Currently selected patient
  const selectedPatient = queue.find((p) => p.id === selectedPatientId) || filteredQueue[0] || null

  // Open Quick Triage Entry
  function handleOpenTriage(patient: NurseQueuePatient) {
    setTriageTarget(patient)
    setVitalsDraft(patient.vitals || {
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      pulseRate: "",
      temperature: "36.8",
      respiratoryRate: "16",
      oxygenSaturation: "98",
      weight: "",
      height: "",
      painScore: "0/10",
    })
    setAssessmentNotesDraft(patient.assessmentNotes || "")
    setPriorityDraft(patient.priority)
    setTriageModalOpen(true)
  }

  // Save Triage Assessment
  function handleSaveTriage(isComplete: boolean = false) {
    if (!triageTarget) return
    const nextStatus: TriageWorkflowStatus = isComplete
      ? priorityDraft === "Urgent / Resuscitation"
        ? "Referred for Urgent Review"
        : "Assessment Completed"
      : "In Assessment"

    const updatedVitals: VitalSigns = {
      ...vitalsDraft,
      recordedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }

    setQueue((prev) =>
      prev.map((item) =>
        item.id === triageTarget.id
          ? {
              ...item,
              status: nextStatus,
              priority: priorityDraft,
              vitals: updatedVitals,
              assessmentNotes: assessmentNotesDraft,
              assignedNurse: "Nurse Rahel",
            }
          : item
      )
    )

    setTriageModalOpen(false)
  }

  // Permission access boundary
  if (!canAccessNursing) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  return (
    <div className="nurse-dashboard-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Workspace</Button>
        <Icon name="chevron" size={11} />
        <span>Clinical Care</span>
        <Icon name="chevron" size={11} />
        <strong>Nurse Dashboard</strong>
      </nav>

      {/* ── Page Header ── */}
      <div className="nurse-header-top">
        <div>
          <Heading level={1}>Nurse Dashboard</Heading>
          <Text>Monitor patient flow, complete nursing assessments, and prioritize care.</Text>
        </div>
        <div className="nurse-header-actions">
          <Button
            className="button"
            onClick={() => onNavigate("triage-assessment")}
          >
            <Icon name="heart" size={16} />
            Assess Next Patient (Triage)
          </Button>
          <Button
            className="button secondary"
            onClick={() => onNavigate("queue")}
          >
            <Icon name="clock" size={16} />
            View Patient Queue
          </Button>
        </div>
      </div>

      {/* ── Operational Summary Cards (4 Cards) ── */}
      <div className="nurse-summary-grid">
        <div
          className={`nurse-summary-card${statusFilter === "Waiting for Assessment" ? " active" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "Waiting for Assessment" ? "all" : "Waiting for Assessment"
            )
          }
        >
          <div className="nurse-summary-icon waiting">
            <Icon name="clock" size={20} />
          </div>
          <div className="nurse-summary-data">
            <strong>{summary.waitingTriage}</strong>
            <span>Waiting for Triage</span>
          </div>
        </div>

        <div
          className={`nurse-summary-card${statusFilter === "In Assessment" ? " active" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "In Assessment" ? "all" : "In Assessment"
            )
          }
        >
          <div className="nurse-summary-icon inassessment">
            <Icon name="edit" size={20} />
          </div>
          <div className="nurse-summary-data">
            <strong>{summary.inAssessment}</strong>
            <span>In Assessment</span>
          </div>
        </div>

        <div
          className={`nurse-summary-card${statusFilter === "Assessment Completed" ? " active" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "Assessment Completed" ? "all" : "Assessment Completed"
            )
          }
        >
          <div className="nurse-summary-icon completed">
            <Icon name="check" size={20} />
          </div>
          <div className="nurse-summary-data">
            <strong>{summary.completedTriage}</strong>
            <span>Triage Completed</span>
          </div>
        </div>

        <div
          className={`nurse-summary-card${statusFilter === "Referred for Urgent Review" ? " active" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "Referred for Urgent Review" ? "all" : "Referred for Urgent Review"
            )
          }
        >
          <div className="nurse-summary-icon urgent">
            <Icon name="warning" size={20} />
          </div>
          <div className="nurse-summary-data">
            <strong>{summary.urgentReview}</strong>
            <span>Requires Urgent Review</span>
          </div>
        </div>
      </div>

      {/* ── Main Split Layout (Queue on Left, Context on Right) ── */}
      <div className="nurse-workspace-split">
        {/* Left Column: Patient Queue Table */}
        <div className="nurse-queue-container">
          <div className="nurse-queue-toolbar">
            <div className="nurse-search-field">
              <Icon name="search" size={16} />
              <input
                placeholder="Search triage queue by patient name, ID, or complaint…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  className="icon-button"
                  style={{ width: "20px", height: "20px" }}
                  onClick={() => setSearchQuery("")}
                >
                  <Icon name="close" size={12} />
                </Button>
              )}
            </div>

            <div className="nurse-filter-selects">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Workflow States</option>
                <option value="Waiting for Assessment">Waiting</option>
                <option value="In Assessment">In Assessment</option>
                <option value="Assessment Completed">Completed</option>
                <option value="Referred for Urgent Review">Urgent Review</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="Urgent / Resuscitation">Urgent</option>
                <option value="High Priority">High Priority</option>
                <option value="Standard">Standard</option>
                <option value="Non-Urgent">Non-Urgent</option>
              </select>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="patient-empty-state">
              <Icon name="heart" size={28} />
              <h3>No patients waiting for assessment</h3>
              <p>There are no triage queue entries matching the current filters.</p>
              <Button
                className="button secondary"
                onClick={() => {
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setSearchQuery("")
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <table className="nurse-queue-table">
              <thead>
                <tr>
                  <th>QUEUE</th>
                  <th>PATIENT</th>
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
                      <span className="queue-pos-badge">{item.queueNumber}</span>
                      <small style={{ display: "block", color: "var(--muted)", marginTop: "2px" }}>
                        {item.arrivalTime}
                      </small>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "monospace" }}>
                        {item.patientId}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "block", maxWidth: "200px", lineHeight: "1.4" }}>
                        {item.chiefComplaint}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${priorityBadgeClass(item.priority)}`}>
                        {item.priority === "Urgent / Resuscitation" && (
                          <Icon name="warning" size={11} />
                        )}
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`triage-status-pill ${triageStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        className="button compact"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenTriage(item)
                        }}
                      >
                        {item.status === "Waiting for Assessment"
                          ? "Start Triage"
                          : item.status === "In Assessment"
                          ? "Resume"
                          : "View"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Column: Selected Patient Clinical Context Panel */}
        <div className="nurse-detail-panel">
          {selectedPatient ? (
            <>
              <div className="nurse-context-card">
                <div className="nurse-context-head">
                  <h3>Clinical Context</h3>
                  <Button
                    className="button secondary compact"
                    onClick={() => onNavigate("patient-profile")}
                  >
                    Full Profile <Icon name="arrow" size={11} />
                  </Button>
                </div>
                <div className="nurse-context-body">
                  <div>
                    <span className="permission-eyebrow" style={{ fontSize: "9px" }}>
                      PATIENT IDENTIFICATION
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--navy)", display: "block" }}>
                      {selectedPatient.name}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>
                      {selectedPatient.patientId} · {selectedPatient.sex} · {selectedPatient.age}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600" }}>
                      CHIEF COMPLAINT:
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--ink)", marginTop: "2px" }}>
                      {selectedPatient.chiefComplaint}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600" }}>
                      KNOWN ALLERGIES:
                    </span>
                    <p
                      style={{
                        fontSize: "12px",
                        color: selectedPatient.allergies === "Not recorded" ? "var(--muted)" : "var(--emergency)",
                        fontWeight: selectedPatient.allergies === "Not recorded" ? "normal" : "600",
                        marginTop: "2px",
                      }}
                    >
                      {selectedPatient.allergies || "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600" }}>
                      RECORDED VITALS:
                    </span>
                    {selectedPatient.vitals ? (
                      <div className="nurse-vitals-grid" style={{ marginTop: "6px" }}>
                        <div className="vital-item">
                          <span>BP</span>
                          <strong>
                            {selectedPatient.vitals.bloodPressureSystolic}/
                            {selectedPatient.vitals.bloodPressureDiastolic} mmHg
                          </strong>
                        </div>
                        <div className="vital-item">
                          <span>PULSE</span>
                          <strong>{selectedPatient.vitals.pulseRate} bpm</strong>
                        </div>
                        <div className="vital-item">
                          <span>TEMP</span>
                          <strong>{selectedPatient.vitals.temperature} °C</strong>
                        </div>
                        <div className="vital-item">
                          <span>SpO2</span>
                          <strong>{selectedPatient.vitals.oxygenSaturation} %</strong>
                        </div>
                        <div className="vital-item">
                          <span>RESP</span>
                          <strong>{selectedPatient.vitals.respiratoryRate} /min</strong>
                        </div>
                        <div className="vital-item">
                          <span>PAIN</span>
                          <strong>{selectedPatient.vitals.painScore}</strong>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic", marginTop: "4px" }}>
                        Vitals have not been recorded yet.
                      </p>
                    )}
                  </div>

                  <div style={{ paddingTop: "6px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Button
                      className="button"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => onNavigate("triage-assessment")}
                    >
                      <Icon name="heart" size={14} />
                      {selectedPatient.status === "Waiting for Assessment"
                        ? "Enter Triage & Vitals"
                        : "Update Triage Record"}
                    </Button>
                    <Button
                      className="button secondary compact"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleOpenTriage(selectedPatient)}
                    >
                      Quick Vitals Modal
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Nursing Activity Feed */}
              <div className="nurse-context-card">
                <div className="nurse-context-head">
                  <h3>Recent Unit Activity</h3>
                </div>
                <div className="nurse-context-body" style={{ padding: "14px 18px" }}>
                  {initialNurseActivities.map((act) => (
                    <div key={act.id} className="nurse-activity-item">
                      <div
                        className={`nurse-activity-dot${act.urgency === "urgent" ? " urgent" : ""}`}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: "11px", color: "var(--navy)", display: "block" }}>
                          {act.text}
                        </strong>
                        <span style={{ fontSize: "10px", color: "var(--muted)", display: "block" }}>
                          {act.detail}
                        </span>
                        <small style={{ fontSize: "9px", color: "var(--muted)" }}>{act.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="patient-empty-state">
              <Icon name="user" size={24} />
              <p>Select a patient row to review clinical context.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK TRIAGE ENTRY MODAL ── */}
      {triageModalOpen && triageTarget && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true">
          <div className="apt-modal-panel" style={{ width: "680px" }}>
            <div className="apt-modal-head">
              <div>
                <h2>Clinical Triage Assessment</h2>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {triageTarget.name} ({triageTarget.patientId}) · Queue: {triageTarget.queueNumber}
                </span>
              </div>
              <Button
                className="icon-button"
                aria-label="Close"
                onClick={() => setTriageModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </Button>
            </div>

            {/* Vitals Signs Input Grid */}
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
              <legend className="patient-section-label">
                <span /> VITAL SIGNS OBSERVATIONS
              </legend>
              <div className="triage-vitals-form-grid">
                <div className="apt-form-group">
                  <label>BP Systolic</label>
                  <div className="triage-field-unit">
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={vitalsDraft.bloodPressureSystolic || ""}
                      onChange={(e) =>
                        setVitalsDraft({ ...vitalsDraft, bloodPressureSystolic: e.target.value })
                      }
                    />
                    <span>mmHg</span>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label>BP Diastolic</label>
                  <div className="triage-field-unit">
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={vitalsDraft.bloodPressureDiastolic || ""}
                      onChange={(e) =>
                        setVitalsDraft({ ...vitalsDraft, bloodPressureDiastolic: e.target.value })
                      }
                    />
                    <span>mmHg</span>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label>Pulse / Heart Rate</label>
                  <div className="triage-field-unit">
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={vitalsDraft.pulseRate || ""}
                      onChange={(e) => setVitalsDraft({ ...vitalsDraft, pulseRate: e.target.value })}
                    />
                    <span>bpm</span>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label>Body Temperature</label>
                  <div className="triage-field-unit">
                    <input
                      type="text"
                      placeholder="e.g. 36.8"
                      value={vitalsDraft.temperature || ""}
                      onChange={(e) => setVitalsDraft({ ...vitalsDraft, temperature: e.target.value })}
                    />
                    <span>°C</span>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label>Respiratory Rate</label>
                  <div className="triage-field-unit">
                    <input
                      type="number"
                      placeholder="e.g. 16"
                      value={vitalsDraft.respiratoryRate || ""}
                      onChange={(e) =>
                        setVitalsDraft({ ...vitalsDraft, respiratoryRate: e.target.value })
                      }
                    />
                    <span>/min</span>
                  </div>
                </div>

                <div className="apt-form-group">
                  <label>Oxygen Saturation</label>
                  <div className="triage-field-unit">
                    <input
                      type="number"
                      placeholder="e.g. 98"
                      value={vitalsDraft.oxygenSaturation || ""}
                      onChange={(e) =>
                        setVitalsDraft({ ...vitalsDraft, oxygenSaturation: e.target.value })
                      }
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Priority & Clinical Findings */}
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
              <legend className="patient-section-label">
                <span /> ASSESSMENT &amp; CLINICAL PRIORITY
              </legend>
              <div className="apt-form-group">
                <label>Assigned Clinical Priority (Triage Classification)</label>
                <select
                  value={priorityDraft}
                  onChange={(e) => setPriorityDraft(e.target.value as TriagePriority)}
                >
                  <option value="Urgent / Resuscitation">Urgent / Resuscitation (Immediate Review)</option>
                  <option value="High Priority">High Priority (Urgent Attention)</option>
                  <option value="Standard">Standard Outpatient Priority</option>
                  <option value="Non-Urgent">Non-Urgent / Routine</option>
                </select>
              </div>

              <div className="apt-form-group">
                <label>Nursing Notes &amp; Initial Clinical Observations</label>
                <textarea
                  rows={3}
                  placeholder="Record symptoms, observed distress, or treatment given (e.g., oxygen, rest, medication)..."
                  value={assessmentNotesDraft}
                  onChange={(e) => setAssessmentNotesDraft(e.target.value)}
                />
              </div>
            </fieldset>

            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setTriageModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="button secondary"
                onClick={() => handleSaveTriage(false)}
              >
                Save Draft
              </Button>
              <Button
                className="button"
                onClick={() => {
                  if (priorityDraft === "Urgent / Resuscitation") {
                    setEscalationAlertOpen(true)
                  } else {
                    handleSaveTriage(true)
                  }
                }}
              >
                Complete Assessment <Icon name="check" size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── URGENT ESCALATION CONFIRMATION DIALOG ── */}
      {escalationAlertOpen && (
        <div className="apt-dialog-overlay" role="dialog" aria-modal="true" style={{ zIndex: 60 }}>
          <div className="apt-modal-panel">
            <div className="apt-modal-head">
              <h2>Confirm Urgent Escalation</h2>
              <Button className="icon-button" onClick={() => setEscalationAlertOpen(false)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <p style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--ink)" }}>
              You have classified this patient as <strong>Urgent / Resuscitation</strong>. This will route
              them immediately to medical officer review and highlight their record across emergency and
              consultation queues.
            </p>
            <div className="apt-dialog-actions">
              <Button className="button secondary" onClick={() => setEscalationAlertOpen(false)}>
                Review Priority
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)" }}
                onClick={() => {
                  setEscalationAlertOpen(false)
                  handleSaveTriage(true)
                }}
              >
                Confirm Urgent Escalation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
