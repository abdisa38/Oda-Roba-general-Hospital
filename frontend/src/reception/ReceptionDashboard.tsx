import { useEffect, useRef, useState } from "react"
import Icon from "../Icon"
import { Button, Heading, Input, Text } from "../permissions/ui"
import PreviewDialog from "../permissions/PreviewDialog"
import {
  actionFor,
  appointments,
  initialActivity,
  initialQueue,
  type Activity,
  type Appointment,
  type QueuePatient,
  type ReceptionStatus,
} from "./model"
import {
  AppointmentPreview,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  PatientStatusBadge,
  ReceptionPageHeader,
  ReceptionQueueTable,
  ReceptionQuickActions,
  ReceptionSessionExpired,
  ReceptionSummaryCard,
  RecentReceptionActivity,
} from "./components"
import "./reception.css"

type Filter = "All" | "Needs attention" | "Expected" | "Checked In" | "Waiting"
type DashboardState = "ready" | "loading" | "empty" | "error" | "restricted" | "no-appointments" | "no-matches" | "expired"
type Dialog = {
  kind: "patient"
  patient: QueuePatient
} | {
  kind: "appointment"
  appointment: Appointment
} | null
export default function ReceptionDashboard({
  state,
  onRetry,
  onClearState,
  onNavigate,
  permissions,
}: {
  state: DashboardState
  onRetry: () => void
  onClearState: () => void
  onNavigate: (id: string) => void
  permissions: Set<string>
}) {
  const [patients, setPatients] = useState(initialQueue)
  const [activities, setActivities] = useState<Activity[]>(initialActivity)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("All")
  const [dialog, setDialog] = useState<Dialog>(null)
  const [confirmation, setConfirmation] = useState("")
  const upcomingRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setDialog(null)
    setConfirmation("")
  }, [state])
  const emptyQueue = state === "empty"
  const query = state === "no-matches" ? "no-example-match" : search
  const queue = emptyQueue ? [] : patients
  const matched = queue.filter((patient) => {
    const matchesSearch =
      `${patient.id} ${patient.name} ${patient.reference || ""}`
        .toLowerCase()
        .includes(query.toLowerCase().trim())
    const matchesFilter =
      filter === "All" ||
      (filter === "Needs attention"
        ? ["Registration Required", "Needs Attention"].includes(patient.status)
        : filter === "Checked In"
          ? ["Checked In", "Waiting"].includes(patient.status)
          : patient.status === filter)
    return matchesSearch && matchesFilter
  })
  const count = (statuses: ReceptionStatus[]) =>
    queue.filter((patient) => statuses.includes(patient.status)).length
  const attention = count(["Registration Required", "Needs Attention"])
  const sampleAppointments = state === "no-appointments" ? [] : appointments
  function clear() {
    setSearch("")
    setFilter("All")
    onClearState()
  }
  function selectFilter(next: Filter) {
    setFilter(next)
    setSearch("")
    onClearState()
  }
  function openAppointments() {
    upcomingRef.current?.scrollIntoView({ behavior: "auto", block: "center" })
    upcomingRef.current?.focus()
  }
  function onPatientAction(patient: QueuePatient) {
    if (!permissions.has(actionFor(patient.status).permission)) return
    if (patient.status === "Waiting" || patient.status === "Checked In")
      onNavigate("queue")
    else if (patient.status === "Registration Required")
      onNavigate("registration")
    else setDialog({ kind: "patient", patient })
  }
  function checkIn(patient: QueuePatient) {
    if (!permissions.has("appointments") || patient.status !== "Expected")
      return
    setPatients((current) =>
      current.map((item) =>
        item.id === patient.id
          ? { ...item, status: "Checked In", time: "08:45" }
          : item,
      ),
    )
    setActivities((current) => [
      {
        id: `checkin-${patient.id}`,
        text: "Demo check-in completed",
        time: "08:45",
        context: `${patient.reference} · Local preview only`,
      },
      ...current,
    ])
    setDialog(null)
    setConfirmation(
      `Demo check-in completed for ${patient.id}. Expected → Checked In at the illustrative 08:45 time. No real record was saved.`,
    )
  }
  if (state === "expired") return <ReceptionSessionExpired />
  return (
    <div className="reception-dashboard">
      <ReceptionPageHeader
        permissions={permissions}
        onRegister={() => onNavigate("registration")}
        onFind={() => onNavigate("directory")}
        onAppointments={() => onNavigate("appointments")}
      />
      <div className="reception-demo-strip">
        <span>
          <Icon name="shield" size={14} />
          Reception access · Administrative information only
        </span>
        <span>FICTIONAL RECORDS & VALUES</span>
      </div>
      {confirmation && (
        <div className="reception-confirmation" role="status">
          <Icon name="check" size={18} />
          <span>{confirmation}</span>
          <Button
            className="icon-button"
            aria-label="Dismiss check-in confirmation"
            onClick={() => setConfirmation("")}
          >
            <Icon name="close" size={16} />
          </Button>
        </div>
      )}
      {state === "loading" ? (
        <DashboardLoadingState />
      ) : state === "error" ? (
        <DashboardErrorState onRetry={onRetry} />
      ) : (
        <>
          <div
            className="reception-summary-grid"
            aria-label="Illustrative reception workload"
          >
            {permissions.has("appointments") && (
              <ReceptionSummaryCard
                title="Today's Appointments"
                value={
                  state === "no-appointments"
                    ? patients.filter((p) => p.visit === "Appointment").length
                    : 6
                }
                context="Sample day's scheduled visits"
                icon="calendar"
                onOpen={openAppointments}
              />
            )}
            {permissions.has("queue") && (
              <>
                <ReceptionSummaryCard
                  title="Checked In"
                  value={count(["Checked In", "Waiting"])}
                  context="Includes patients waiting"
                  icon="check"
                  onOpen={() => selectFilter("Checked In")}
                  selected={filter === "Checked In"}
                />
                <ReceptionSummaryCard
                  title="Waiting for Service"
                  value={count(["Waiting"])}
                  context="Reception status only"
                  icon="clock"
                  onOpen={() => selectFilter("Waiting")}
                  selected={filter === "Waiting"}
                />
              </>
            )}
            {permissions.has("registration") && (
              <ReceptionSummaryCard
                title="Registrations Today"
                value={4}
                context="Sample completed daily total"
                icon="user"
                onOpen={() => onNavigate("registration")}
              />
            )}
          </div>
          <div className="reception-work-grid">
            <section className="reception-panel reception-queue">
              <div className="reception-panel-heading">
                <div>
                  <Heading level={2}>
                    Reception Queue{" "}
                    <span className="reception-count">{queue.length}</span>
                  </Heading>
                  <Text>Patients requiring reception attention.</Text>
                </div>
                <span className="reception-attention-count">
                  <Icon name="info" size={14} />
                  {attention} need attention
                </span>
              </div>
              <div className="reception-queue-tools">
                <div
                  className="reception-filter-tabs"
                  aria-label="Reception queue filters"
                >
                  {([
                    "All",
                    "Needs attention",
                    "Expected",
                    "Checked In",
                    "Waiting",
                  ] as Filter[]).map((item) => (
                    <Button
                      key={item}
                      aria-pressed={filter === item}
                      className={filter === item ? "is-active" : ""}
                      onClick={() => {
                        setFilter(item)
                        onClearState()
                      }}
                    >
                      {item}
                      {item === "Needs attention" && attention > 0 && (
                        <span>{attention}</span>
                      )}
                    </Button>
                  ))}
                </div>
                <label className="reception-queue-search">
                  <Icon name="search" size={16} />
                  <Input
                    aria-label="Search reception queue by demo ID, name, or appointment reference"
                    value={query}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      onClearState()
                    }}
                    placeholder="Search name or demo ID"
                  />
                  {query && (
                    <Button
                      className="icon-button"
                      aria-label="Clear queue search"
                      onClick={clear}
                    >
                      <Icon name="close" size={14} />
                    </Button>
                  )}
                </label>
              </div>
              {emptyQueue ? (
                <DashboardEmptyState
                  kind="queue"
                  onAction={() => onNavigate("appointments")}
                />
              ) : matched.length === 0 ? (
                <DashboardEmptyState kind="matches" onAction={clear} />
              ) : (
                <ReceptionQueueTable
                  patients={matched}
                  permissions={permissions}
                  onAction={onPatientAction}
                />
              )}
              <div className="reception-queue-footer">
                <span>
                  Showing {matched.length} of {queue.length} sample entries
                </span>
                {permissions.has("queue") && (
                  <Button onClick={() => onNavigate("queue")}>
                    Manage Queue
                    <Icon name="arrow" size={14} />
                  </Button>
                )}
              </div>
            </section>
            <div className="reception-secondary">
              <div
                ref={upcomingRef}
                tabIndex={-1}
                className="reception-upcoming-focus"
              >
                <AppointmentPreview
                  appointments={sampleAppointments}
                  canManage={permissions.has("appointments")}
                  onOpen={(appointment) =>
                    setDialog({ kind: "appointment", appointment })
                  }
                  onViewAll={() => onNavigate("appointments")}
                />
              </div>
              <ReceptionQuickActions
                permissions={permissions}
                onRegister={() => onNavigate("registration")}
                onNavigate={onNavigate}
              />
            </div>
          </div>
          <RecentReceptionActivity activities={activities} />
          <div className="reception-bottom-note">
            <Icon name="info" size={14} />
            <span>
              All patients and values are fictional. Reception status does not
              confirm triage or consultation. Status labels and identity rules
              require hospital approval.
            </span>
          </div>
        </>
      )}
      {dialog && (
        <PreviewDialog
          title={
            dialog.kind === "appointment"
              ? "Appointment preview"
              : dialog.patient.status === "Expected"
                ? "Confirm demo check-in"
                : "Patient administrative preview"
          }
          onClose={() => setDialog(null)}
        >
          {dialog.kind === "appointment" ? (
            <>
              <div className="reception-dialog-record">
                <Heading level={3}>{dialog.appointment.name}</Heading>
                <span>
                  {dialog.appointment.patientId} · {dialog.appointment.id}
                </span>
                <PatientStatusBadge status={dialog.appointment.status} />
              </div>
              <dl className="reception-dialog-details">
                <div>
                  <dt>Illustrative time</dt>
                  <dd>{dialog.appointment.time}</dd>
                </div>
                <div>
                  <dt>Visit type</dt>
                  <dd>{dialog.appointment.visit}</dd>
                </div>
              </dl>
              <Text>
                {dialog.appointment.status === "Cancelled"
                  ? "This sample appointment is cancelled. Check-in is not offered."
                  : "Review and confirm identity in the authorized appointment workflow before check-in."}
              </Text>
              <div className="permission-boundary">
                <span>CONCEPT ONLY</span>
                <Text>
                  No appointment is booked, changed, or cancelled from this
                  preview.
                </Text>
              </div>
              <Button
                className="button secondary"
                onClick={() => {
                  setDialog(null)
                  onNavigate("appointments")
                }}
              >
                Open appointment workspace concept
                <Icon name="arrow" size={16} />
              </Button>
            </>
          ) : (
            <>
              <div className="reception-dialog-record">
                <Heading level={3}>{dialog.patient.name}</Heading>
                <span>
                  {dialog.patient.id} · {dialog.patient.reference}
                </span>
                <PatientStatusBadge status={dialog.patient.status} />
              </div>
              <Text>{dialog.patient.context}</Text>
              <div className="permission-boundary">
                <span>IDENTITY & RECEPTION SCOPE</span>
                <Text>
                  Confirm the patient using approved identifying attributes, not
                  their name alone. This fictional record is for demonstration
                  only; it contains no clinical information.
                </Text>
              </div>
              {dialog.patient.status === "Expected" ? (
                <>
                  <Text>
                    The demo transition is Expected → Checked In. It does not
                    advance the patient to triage, consultation, or change
                    service priority.
                  </Text>
                  <div className="reception-dialog-actions">
                    <Button
                      className="button secondary"
                      onClick={() => setDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="button"
                      onClick={() => checkIn(dialog.patient)}
                    >
                      <Icon name="check" size={16} />
                      Confirm demo check-in
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  className="button secondary"
                  onClick={() => {
                    setDialog(null)
                    onNavigate("directory")
                  }}
                >
                  Open patient directory concept
                  <Icon name="arrow" size={16} />
                </Button>
              )}
            </>
          )}
        </PreviewDialog>
      )}
    </div>
  )
}
