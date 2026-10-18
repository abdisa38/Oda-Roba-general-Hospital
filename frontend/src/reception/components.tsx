import type { ReactNode } from "react"
import Icon, { type IconName } from "../Icon"
import { Button, Heading, Link, Text } from "../permissions/ui"
import { RoleDashboardCard } from "../permissions/components"
import {
  actionFor,
  type Activity,
  type Appointment,
  type QueuePatient,
} from "./model"

export function PatientStatusBadge({ status }: { status: string }) {
  const tone =
    status === "Needs Attention" || status === "Registration Required"
      ? "attention"
      : status === "Checked In" || status === "Confirmed"
        ? "confirmed"
        : "neutral"
  return (
    <span className={`reception-status ${tone}`}>
      <Icon
        name={
          tone === "attention"
            ? "info"
            : tone === "confirmed"
              ? "check"
              : status === "Cancelled"
                ? "close"
                : "clock"
        }
        size={12}
      />
      {status}
    </span>
  )
}
export function ReceptionPageHeader({
  onRegister,
  onFind,
  onAppointments,
  permissions,
}: {
  onRegister: () => void
  onFind: () => void
  onAppointments: () => void
  permissions: Set<string>
}) {
  return (
    <div className="reception-page-header">
      <div>
        <Heading level={1}>Reception</Heading>
      </div>
      <div className="reception-header-actions">
        {permissions.has("directory") && (
          <Button className="button secondary" onClick={onFind}>
            <Icon name="search" size={16} />
            Search Patient
          </Button>
        )}
        {permissions.has("appointments") && (
          <Button className="button secondary" onClick={onAppointments}>
            <Icon name="calendar" size={16} />
            Appointments
          </Button>
        )}
        {permissions.has("registration") && (
          <Button className="button" onClick={onRegister}>
            <Icon name="user" size={16} />
            New Patient
          </Button>
        )}
      </div>
    </div>
  )
}
export function ReceptionSummaryCard({
  title,
  value,
  context,
  icon,
  onOpen,
  selected,
}: {
  title: string
  value: number
  context: string
  icon: IconName
  onOpen: () => void
  selected?: boolean
}) {
  return (
    <Button
      className={`reception-summary-card${selected ? " is-selected" : ""}`}
      onClick={onOpen}
      aria-label={`${title}: ${value}. ${context}. View related work.`}
    >
      <span className="reception-summary-top">
        {title}
        <Icon name={icon} size={18} />
      </span>
      <span className="reception-summary-bottom">
        <strong>{value.toString().padStart(2, "0")}</strong>
        <span>{context}</span>
        <Icon name="arrow" size={15} />
      </span>
    </Button>
  )
}
export function ReceptionActionMenu({
  patient,
  permissions,
  onAction,
}: {
  patient: QueuePatient
  permissions: Set<string>
  onAction: (patient: QueuePatient) => void
}) {
  const action = actionFor(patient.status)
  return permissions.has(action.permission) ? (
    <Button
      className="reception-row-action"
      aria-label={`${action.label} for ${patient.name}, ${patient.id}`}
      onClick={() => onAction(patient)}
    >
      {action.label}
      <Icon name="arrow" size={13} />
    </Button>
  ) : (
    <span className="reception-restricted-action">
      <Icon name="lock" size={14} />
      Restricted action
    </span>
  )
}
export function ReceptionQueueItem({
  patient,
  permissions,
  onAction,
}: {
  patient: QueuePatient
  permissions: Set<string>
  onAction: (patient: QueuePatient) => void
}) {
  return (
    <tr>
      <td data-label="Patient">
        <span className="reception-patient-name">{patient.name}</span>
        <span className="reception-patient-id">{patient.id}</span>
      </td>
      <td data-label="Visit type">
        <span>{patient.visit}</span>
        {patient.reference && <small>{patient.reference}</small>}
      </td>
      <td data-label="Check-in">
        {patient.time || (
          <span className="reception-not-checked">Not checked in</span>
        )}
      </td>
      <td data-label="Reception status">
        <PatientStatusBadge status={patient.status} />
      </td>
      <td data-label="Next action">
        <ReceptionActionMenu
          patient={patient}
          permissions={permissions}
          onAction={onAction}
        />
      </td>
    </tr>
  )
}
export function ReceptionQueueTable({
  patients,
  permissions,
  onAction,
}: {
  patients: QueuePatient[]
  permissions: Set<string>
  onAction: (patient: QueuePatient) => void
}) {
  return (
    <table className="reception-queue-table">
      <caption className="permission-sr-only">
        Fictional reception queue. These are reception states, not clinical
        states.
      </caption>
      <thead>
        <tr>
          <th scope="col">Patient / demo ID</th>
          <th scope="col">Visit type</th>
          <th scope="col">Check-in</th>
          <th scope="col">Reception status</th>
          <th scope="col">Next action</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <ReceptionQueueItem
            key={patient.id}
            patient={patient}
            permissions={permissions}
            onAction={onAction}
          />
        ))}
      </tbody>
    </table>
  )
}
export function AppointmentPreview({
  appointments,
  onOpen,
  onViewAll,
  canManage,
}: {
  appointments: Appointment[]
  onOpen: (appointment: Appointment) => void
  onViewAll: () => void
  canManage: boolean
}) {
  return (
    <section className="reception-panel reception-appointments">
      <div className="reception-panel-heading">
        <div>
          <Heading level={2}>Upcoming Appointments</Heading>
          <Text>Later in the sample day</Text>
        </div>
        <Icon name="calendar" size={19} />
      </div>
      {appointments.length ? (
        <div className="reception-appointment-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="reception-appointment">
              <span className="reception-appointment-time">
                {appointment.time}
              </span>
              <div>
                <strong>{appointment.name}</strong>
                <small>
                  {appointment.patientId} · {appointment.id}
                </small>
                <PatientStatusBadge status={appointment.status} />
              </div>
              {canManage && (
                <Button
                  className="icon-button"
                  aria-label={`View ${appointment.status.toLowerCase()} appointment ${appointment.id}`}
                  onClick={() => onOpen(appointment)}
                >
                  <Icon name="arrow" size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <DashboardEmptyState kind="appointments" onAction={onViewAll} />
      )}
      {canManage && (
        <Button className="reception-panel-link" onClick={onViewAll}>
          View All Appointments
          <Icon name="arrow" size={14} />
        </Button>
      )}
    </section>
  )
}
export function ReceptionQuickActions({
  onRegister,
  onNavigate,
  permissions,
}: {
  onRegister: () => void
  onNavigate: (id: string) => void
  permissions: Set<string>
}) {
  const actions: {
    label: string
    icon: IconName
    permission: string
    action: () => void
  }[] = [
    {
      label: "Register Patient",
      icon: "user",
      permission: "registration",
      action: onRegister,
    },
    {
      label: "Find Existing Patient",
      icon: "search",
      permission: "directory",
      action: () => onNavigate("directory"),
    },
    {
      label: "Schedule Appointment",
      icon: "calendar",
      permission: "appointments",
      action: () => onNavigate("appointments"),
    },
    {
      label: "Manage Queue",
      icon: "clock",
      permission: "queue",
      action: () => onNavigate("queue"),
    },
  ]
  return (
    <section className="reception-panel reception-quick-actions">
      <Heading level={2}>Quick Actions</Heading>
      <div>
        {actions
          .filter((item) => permissions.has(item.permission))
          .map((item) => (
            <Button key={item.label} onClick={item.action}>
              <Icon name={item.icon} size={17} />
              {item.label}
              <Icon name="arrow" size={13} />
            </Button>
          ))}
      </div>
      <Text>Look up an existing record before creating a new one.</Text>
    </section>
  )
}
export function RecentReceptionActivity({
  activities,
}: {
  activities: Activity[]
}) {
  return (
    <section className="reception-panel reception-activity">
      <div className="reception-activity-heading">
        <Heading level={2}>Recent Reception Activity</Heading>
        <span>Illustrative feed · not an audit log</span>
      </div>
      <div className="reception-activity-list">
        {activities.slice(0, 3).map((activity) => (
          <div key={activity.id}>
            <span className="reception-activity-icon">
              <Icon name="check" size={14} />
            </span>
            <div>
              <strong>{activity.text}</strong>
              <small>{activity.context}</small>
            </div>
            <time>{activity.time}</time>
          </div>
        ))}
      </div>
    </section>
  )
}
export function DashboardEmptyState({
  kind,
  onAction,
}: {
  kind: "queue" | "appointments" | "matches"
  onAction: () => void
}) {
  return (
    <div className="reception-empty">
      <Icon
        name={
          kind === "matches"
            ? "search"
            : kind === "queue"
              ? "check"
              : "calendar"
        }
        size={26}
      />
      <Heading level={3}>
        {kind === "queue"
          ? "No patients are currently waiting in the reception queue."
          : kind === "appointments"
            ? "No upcoming appointments"
            : "No patients match your search or filters"}
      </Heading>
      <Text>
        {kind === "queue"
          ? "You can review expected appointments or begin patient registration."
          : kind === "appointments"
            ? "There are no upcoming appointments in this sample view."
            : "Try a different demo identifier or name, or clear your filters."}
      </Text>
      <Button className="button secondary" onClick={onAction}>
        {kind === "matches" ? "Clear search & filters" : "View Appointments"}
      </Button>
    </div>
  )
}
export function DashboardLoadingState() {
  return (
    <div role="status" aria-busy="true" className="reception-loading">
      <span className="permission-sr-only">Loading reception information…</span>
      <div className="reception-summary-grid">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="reception-skeleton-card">
            <div />
            <div />
          </div>
        ))}
      </div>
      <div className="reception-work-grid">
        <div className="reception-skeleton-panel">
          {[1, 2, 3, 4, 5].map((id) => (
            <div key={id} />
          ))}
        </div>
        <div className="reception-skeleton-panel">
          {[1, 2, 3].map((id) => (
            <div key={id} />
          ))}
        </div>
      </div>
    </div>
  )
}
export function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="reception-error" role="alert">
      <Icon name="warning" size={28} />
      <Heading level={2}>Reception information couldn't be loaded.</Heading>
      <Text>
        This is a demonstration retrieval error. No patient information is
        available in this state.
      </Text>
      <Button className="button secondary" onClick={onRetry}>
        <Icon name="arrow" size={15} />
        Retry
      </Button>
    </div>
  )
}
export function ReceptionSessionExpired() {
  return (
    <div className="reception-error">
      <Icon name="lock" size={28} />
      <Heading level={2}>Your session has expired</Heading>
      <Text>
        Sign in again to return to an authorized workspace. Patient details are
        hidden in this session-expiry preview.
      </Text>
      <Link href="/staff/sign-in" className="button">
        Return to staff sign-in
        <Icon name="arrow" size={15} />
      </Link>
    </div>
  )
}
export function ReceptionReviewNotes() {
  const Panel = ({
    title,
    children,
  }: {
    title: string
    children: ReactNode
  }) => <RoleDashboardCard title={title}>{children}</RoleDashboardCard>
  return (
    <div className="reception-review">
      <span className="permission-eyebrow">
        04 — RECEPTION & PATIENT OPERATIONS
      </span>
      <Heading level={1}>Prompt 17 — Reception Dashboard</Heading>
      <Text>
        A reusable dashboard design preview. No backend or hospital-approved
        workflow is represented.
      </Text>
      <Panel title="Interaction notes">
        <ul>
          <li>
            Register Patient opens the Prompt 18 existing-patient check and
            grouped registration form. Names alone never confirm identity.
          </li>
          <li>
            Queue actions depend on reception status: complete registration,
            check in, view administrative context, or open the queue concept.
          </li>
          <li>
            Confirm demo check-in changes Expected → Checked In, records the
            illustrative 08:45 time, updates the checked-in summary, and adds a
            local activity entry. It does not move the patient to triage or
            consultation.
          </li>
          <li>
            Checked In and Waiting summaries filter relevant work; Today's
            Appointments focuses upcoming appointments. Registrations Today and
            the appointments link open existing module concepts.
          </li>
          <li>
            Search matches fictional identifiers, names, and appointment
            references. Filters combine with search; clearing returns the full
            sample queue.
          </li>
          <li>
            All changes are memory-only and reset when the dashboard is
            unmounted. No patient record is saved, and the activity feed is not
            a formal audit log.
          </li>
        </ul>
      </Panel>
      <Panel title="Reusable states & components">
        <Text>
          Use the shell's Content state selector for Default, Queue Empty, No
          Appointments, Loading, Error, Search/Filter Empty, Access Restricted,
          and Session Expired. A successful check-in is demonstrated through the
          Expected queue entry.
        </Text>
        <Text>
          ReceptionDashboard, ReceptionPageHeader, ReceptionSummaryCard,
          ReceptionQueueTable, ReceptionQueueItem, AppointmentPreview,
          ReceptionQuickActions, RecentReceptionActivity, PatientStatusBadge,
          DashboardLoadingState, DashboardEmptyState, DashboardErrorState, and
          ReceptionActionMenu reuse ORHIMS primitives and dialogs.
        </Text>
        <Text>
          Desktop 1440/1280: summary row, primary queue, secondary appointments.
          Tablet 768: two-column summary and structured queue list. Mobile 390:
          stacked summaries, prominent registration, modal navigation, and no
          horizontal scrolling.
        </Text>
      </Panel>
      <Panel title="Open decisions requiring hospital approval">
        <ul>
          <li>
            Patient identifiers, approved identity-matching attributes,
            duplicate prevention, and record-merging authority.
          </li>
          <li>
            Reception status definitions and permitted state transitions;
            appointment cancellation and missed-visit rules.
          </li>
          <li>
            Check-in authority, time source and timezone, queue routing, and
            service priority. No emergency prioritization is implied.
          </li>
          <li>
            Demographic field visibility, patient assignment, search
            permissions, and appointment/queue scope.
          </li>
          <li>
            Approved departments, visit types, operating hours, dashboard
            summary definitions, and activity-feed visibility.
          </li>
          <li>
            Authentication, session expiry, refreshed permissions, server-side
            record authorization, real data retrieval, and formal audit logging.
          </li>
        </ul>
      </Panel>
      <Panel title="Fictional data & scope">
        <Text>
          Every name contains “Example” and every identifier starts with DEMO.
          Neither is an approved patient-ID format. The sample date is 18 Jun
          2026; all displayed times are illustrative. Initial counters are 6
          appointments (3 represented in the queue and 3 upcoming), 2 checked in
          (including 1 waiting), 1 waiting for service, and 4 registrations
          today (a separate sample daily total, not the number of incomplete
          registrations).
        </Text>
        <Text>
          Queue ordering is a demonstration attention-first presentation, not
          hospital-approved service priority. No clinical notes, results,
          prescriptions, tariffs, or financial reports are displayed. Patient
          registration and directory lookup are separate previews; full patient
          profile, appointment-management, and queue-management workflows are
          not built.
        </Text>
      </Panel>
    </div>
  )
}
