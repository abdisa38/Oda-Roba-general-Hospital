import { useEffect, useRef, useState } from "react"
import Icon from "../Icon"
import { AccessDeniedPage } from "../permissions/components"
import { Button, Heading, Text } from "../permissions/ui"
import {
  demoActivity,
  demoAppointments,
  demoEncounters,
  demoInvoices,
  demoLabOrders,
  demoPrescriptions,
  demoPatient,
  incompletePatient,
  duplicateWarningPatient,
  appointmentStatusLabel,
  encounterStatusLabel,
  formatDate,
  labStatusLabel,
  statusLabel,
  type ActivityEvent,
  type AppointmentEntry,
  type EncounterEntry,
  type LabOrder,
  type PatientProfile,
  type PrescriptionEntry,
  type RecordStatus,
} from "./model"
import "./patient-profile.css"

type Tab =
  | "overview"
  | "demographics"
  | "appointments"
  | "encounters"
  | "clinical"
  | "laboratory"
  | "prescriptions"
  | "billing"

type ProfileState =
  | "ready"
  | "loading"
  | "error"
  | "not-found"
  | "edit"
  | "saving"
  | "save-success"
  | "save-error"
  | "confirm-leave"

// ─── Small reusable pieces ────────────────────────────────────────────────────

function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return (
    <span className={`patient-status-badge ${status}`}>
      {statusLabel(status).toUpperCase()}
    </span>
  )
}

function FieldRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  const absent = !value || value === "Not recorded"
  return (
    <div className="patient-field-row">
      <span className="patient-field-label">{label}</span>
      <span className={`patient-field-value${absent ? " not-recorded" : ""}`}>
        {absent ? "Not recorded" : value}
      </span>
    </div>
  )
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="patient-info-section">
      <div className="patient-info-section-head">
        <h3>{title}</h3>
        {onEdit && (
          <Button className="button secondary" onClick={onEdit}>
            <Icon name="edit" size={13} /> Edit
          </Button>
        )}
      </div>
      <div className="patient-info-section-body">{children}</div>
    </div>
  )
}

function StatusPill({
  status,
  label,
}: {
  status: string
  label: string
}) {
  return (
    <span className={`patient-status-pill ${status}`}>{label}</span>
  )
}

function EmptyState({
  title,
  description,
  icon = "clock",
}: {
  title: string
  description: string
  icon?: "clock" | "calendar" | "shield" | "flask" | "pill" | "edit"
}) {
  return (
    <div className="patient-empty-state">
      <Icon name={icon} size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function RestrictedSection() {
  return (
    <div className="patient-restricted-state">
      <div className="patient-restricted-icon">
        <Icon name="lock" size={22} />
      </div>
      <h3>Access restricted</h3>
      <Text>
        You do not have permission to view this section. Contact your
        administrator if you require access.
      </Text>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="patient-loading-state">
      {[80, 60, 90, 50, 70].map((w, i) => (
        <div
          key={i}
          className="patient-skeleton"
          style={{ height: 18, width: `${w}%` }}
        />
      ))}
    </div>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="patient-activity-section">
      <div className="patient-activity-head">
        <h3>Recent activity</h3>
      </div>
      {events.map((ev) => (
        <div key={ev.id} className="patient-activity-item">
          <div className={`patient-activity-dot ${ev.type}`} />
          <div className="patient-activity-content">
            <div className="patient-activity-label">{ev.label}</div>
            <div className="patient-activity-meta">
              {ev.detail && <span>{ev.detail} · </span>}
              <span>{ev.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  patient,
  onEditDemographics,
  onSchedule,
}: {
  patient: PatientProfile
  onEditDemographics: () => void
  onSchedule: () => void
}) {
  const dobDisplay = patient.dob
    ? formatDate(patient.dob)
    : patient.estimatedAge !== null
      ? `${patient.estimatedAge} years (estimated)`
      : null

  const filled = [
    patient.dob ?? patient.estimatedAge,
    patient.sex,
    patient.phone,
    patient.residence,
    patient.emergencyContact,
  ].filter(Boolean).length
  const completeness = Math.round((filled / 5) * 100)
  const completenessClass =
    completeness < 40 ? "low" : completeness < 80 ? "medium" : ""

  return (
    <div className="patient-tab-content">
      <div className="patient-overview-layout">
        {/* Left column */}
        <div>
          <SectionCard title="Demographic information" onEdit={onEditDemographics}>
            <FieldRow label="Full name" value={patient.name} />
            <FieldRow label="Date of birth" value={dobDisplay} />
            <FieldRow label="Sex" value={patient.sex} />
            <FieldRow label="Primary phone" value={patient.phone} />
            <FieldRow label="Alternate phone" value={patient.alternatePhone} />
            <FieldRow label="Email" value={patient.email} />
            <FieldRow label="Place of residence" value={patient.residence} />
            <div className="patient-completeness">
              <span>Data completeness</span>
              <div className="patient-completeness-bar">
                <div
                  className={`patient-completeness-fill ${completenessClass}`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span>{completeness}%</span>
            </div>
          </SectionCard>

          <SectionCard title="Registration information">
            <FieldRow label="Patient ID" value={patient.id} />
            <FieldRow label="Registration date" value={formatDate(patient.registeredDate)} />
            <FieldRow label="Registered by" value={patient.registeredBy} />
            <FieldRow label="Record status" value={statusLabel(patient.recordStatus)} />
          </SectionCard>

          {patient.emergencyContact && (
            <SectionCard title="Emergency contact">
              <FieldRow label="Name" value={patient.emergencyContact.name} />
              <FieldRow label="Relationship" value={patient.emergencyContact.relationship} />
              <FieldRow label="Phone" value={patient.emergencyContact.phone} />
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <ActivityFeed events={demoActivity} />
      </div>
    </div>
  )
}

// ─── Demographics tab ─────────────────────────────────────────────────────────

function DemographicsTab({
  patient,
  state,
  onEdit,
}: {
  patient: PatientProfile
  state: ProfileState
  onEdit: () => void
}) {
  const dobDisplay = patient.dob
    ? formatDate(patient.dob)
    : patient.estimatedAge !== null
      ? `${patient.estimatedAge} years (estimated)`
      : null

  if (state === "loading") {
    return (
      <div className="patient-tab-content">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="patient-tab-content patient-demographics-layout">
      {state === "save-success" && (
        <div className="patient-save-success" role="status">
          <Icon name="check" size={16} /> Demographics saved successfully.
        </div>
      )}
      {state === "save-error" && (
        <div className="patient-save-error" role="alert">
          <Icon name="warning" size={16} /> Save failed. Please try again.
        </div>
      )}

      <SectionCard title="Identity" onEdit={onEdit}>
        <FieldRow label="Given / primary name" value={patient.given} />
        <FieldRow label="Family name" value={patient.family} />
        <FieldRow label="Full name" value={patient.name} />
      </SectionCard>

      <SectionCard title="Demographic information">
        <FieldRow label="Date of birth" value={dobDisplay} />
        <FieldRow label="Sex" value={patient.sex} />
      </SectionCard>

      <SectionCard title="Contact information">
        <FieldRow label="Primary phone" value={patient.phone} />
        <FieldRow label="Alternate phone" value={patient.alternatePhone} />
        <FieldRow label="Email address" value={patient.email} />
      </SectionCard>

      <SectionCard title="Address / locality">
        <FieldRow label="Place of residence" value={patient.residence} />
      </SectionCard>

      {patient.emergencyContact ? (
        <SectionCard title="Emergency contact">
          <FieldRow label="Name" value={patient.emergencyContact.name} />
          <FieldRow label="Relationship" value={patient.emergencyContact.relationship} />
          <FieldRow label="Phone" value={patient.emergencyContact.phone} />
        </SectionCard>
      ) : (
        <SectionCard title="Emergency contact">
          <div className="patient-empty-state" style={{ padding: "24px 0" }}>
            <Icon name="user" size={22} />
            <p>No emergency contact recorded.</p>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Registration metadata">
        <FieldRow label="Patient ID" value={patient.id} />
        <FieldRow label="Registration date" value={formatDate(patient.registeredDate)} />
        <FieldRow label="Registered by" value={patient.registeredBy} />
      </SectionCard>
    </div>
  )
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditDemographicsForm({
  patient,
  state,
  onSave,
  onCancel,
}: {
  patient: PatientProfile
  state: ProfileState
  onSave: () => void
  onCancel: () => void
}) {
  const [given, setGiven] = useState(patient.given)
  const [family, setFamily] = useState(patient.family)
  const [phone, setPhone] = useState(patient.phone ?? "")
  const [residence, setResidence] = useState(patient.residence ?? "")
  const [givenError, setGivenError] = useState("")
  const isSaving = state === "saving"

  function validate() {
    let valid = true
    if (!given.trim()) {
      setGivenError("Enter the patient's given name.")
      valid = false
    } else {
      setGivenError("")
    }
    return valid
  }

  function handleSave() {
    if (!validate()) return
    onSave()
  }

  return (
    <div className="patient-edit-form">
      {state === "save-error" && (
        <div className="patient-save-error" role="alert">
          <Icon name="warning" size={16} /> Save failed. Please try again.
        </div>
      )}
      <div className="patient-unsaved-notice" role="status">
        <Icon name="info" size={15} /> You have unsaved changes.
      </div>

      <fieldset
        className="patient-edit-field-group"
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <legend className="patient-section-label">
          <span /> IDENTITY
        </legend>
        <div className="patient-edit-row">
          <div>
            <label className="patient-edit-label">
              Given / primary name <span className="required">*</span>
            </label>
            <input
              className={`patient-edit-input${givenError ? " has-error" : ""}`}
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              disabled={isSaving}
              aria-required="true"
              aria-describedby={givenError ? "given-error" : undefined}
            />
            {givenError && (
              <p className="patient-edit-error" id="given-error">
                {givenError}
              </p>
            )}
          </div>
          <div>
            <label className="patient-edit-label">Family name</label>
            <input
              className="patient-edit-input"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
      </fieldset>

      <fieldset
        className="patient-edit-field-group"
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <legend className="patient-section-label">
          <span /> CONTACT INFORMATION
        </legend>
        <div className="patient-edit-row">
          <div>
            <label className="patient-edit-label">Primary phone</label>
            <input
              className="patient-edit-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              placeholder="Not recorded"
            />
          </div>
          <div>
            <label className="patient-edit-label">Place of residence</label>
            <input
              className="patient-edit-input"
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              disabled={isSaving}
              placeholder="Not recorded"
            />
          </div>
        </div>
      </fieldset>

      <div className="patient-edit-actions">
        <Button
          className="button secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
          {!isSaving && <Icon name="check" size={15} />}
        </Button>
      </div>
    </div>
  )
}

// ─── Appointments tab ─────────────────────────────────────────────────────────

function AppointmentsTab({
  appointments,
  state,
  onSchedule,
}: {
  appointments: AppointmentEntry[]
  state: string
  onSchedule: () => void
}) {
  if (state === "loading")
    return (
      <div className="patient-tab-content">
        <LoadingSkeleton />
      </div>
    )

  if (appointments.length === 0)
    return (
      <div className="patient-tab-content">
        <EmptyState
          icon="calendar"
          title="No appointments"
          description="No appointment records are associated with this patient."
        />
      </div>
    )

  return (
    <div className="patient-tab-content">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--muted)" }}>
          {appointments.length} record{appointments.length !== 1 ? "s" : ""}
        </span>
        <Button className="button compact" onClick={onSchedule}>
          <Icon name="calendar" size={14} /> Schedule appointment
        </Button>
      </div>
      <div className="patient-info-section">
        <table className="patient-record-table">
          <thead>
            <tr>
              <th>DATE &amp; TIME</th>
              <th>DEPARTMENT</th>
              <th>CLINICIAN</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td>
                  {formatDate(apt.date)}
                  <small>{apt.time}</small>
                </td>
                <td>{apt.department}</td>
                <td>
                  <span
                    style={{ color: "var(--muted)", fontStyle: "italic" }}
                  >
                    {apt.clinician ?? "Not assigned"}
                  </span>
                </td>
                <td>
                  <StatusPill
                    status={apt.status}
                    label={appointmentStatusLabel(apt.status)}
                  />
                </td>
                <td>
                  <Button className="patient-table-action">
                    View <Icon name="arrow" size={11} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Encounters tab ───────────────────────────────────────────────────────────

function EncountersTab({
  encounters,
  state,
}: {
  encounters: EncounterEntry[]
  state: string
}) {
  if (state === "loading")
    return (
      <div className="patient-tab-content">
        <LoadingSkeleton />
      </div>
    )

  if (encounters.length === 0)
    return (
      <div className="patient-tab-content">
        <EmptyState
          icon="clock"
          title="No encounter records"
          description="No visit or encounter records are available for this patient."
        />
      </div>
    )

  return (
    <div className="patient-tab-content">
      <span
        style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 14 }}
      >
        {encounters.length} encounter{encounters.length !== 1 ? "s" : ""}
        {" · "}each record is a separate visit
      </span>
      <div className="patient-info-section">
        <table className="patient-record-table">
          <thead>
            <tr>
              <th>ENCOUNTER ID</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>DEPARTMENT</th>
              <th>CLINICIAN</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {encounters.map((enc) => (
              <tr key={enc.id}>
                <td style={{ fontFamily: "Manrope, sans-serif", fontSize: 10 }}>
                  {enc.id}
                </td>
                <td>{formatDate(enc.date)}</td>
                <td>{enc.type}</td>
                <td>{enc.department}</td>
                <td>
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                    {enc.clinician ?? "Not recorded"}
                  </span>
                </td>
                <td>
                  <StatusPill
                    status={enc.status}
                    label={encounterStatusLabel(enc.status)}
                  />
                </td>
                <td>
                  <Button className="patient-table-action">
                    View <Icon name="arrow" size={11} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 9, color: "var(--muted)", marginTop: 10 }}>
        Each encounter is a distinct visit. Opening an encounter reveals
        information for that visit only.
      </p>
    </div>
  )
}

// ─── Clinical history tab ─────────────────────────────────────────────────────

function ClinicalTab({ allowed }: { allowed: boolean }) {
  if (!allowed) return <RestrictedSection />
  return (
    <div className="patient-tab-content">
      <SectionCard title="Clinical history overview">
        <div className="patient-empty-state" style={{ padding: "28px 0" }}>
          <Icon name="shield" size={24} />
          <h3>No clinical records available</h3>
          <p>
            Clinical information is linked to individual encounters. Open an
            encounter to view authorized clinical details.
          </p>
        </div>
      </SectionCard>
      <p style={{ fontSize: 9, color: "var(--muted)", marginTop: 6 }}>
        No diagnoses, allergies, or assessments are invented for this preview.
      </p>
    </div>
  )
}

// ─── Laboratory tab ───────────────────────────────────────────────────────────

function LaboratoryTab({
  orders,
  allowed,
  state,
}: {
  orders: LabOrder[]
  allowed: boolean
  state: string
}) {
  if (!allowed) return <RestrictedSection />
  if (state === "loading")
    return (
      <div className="patient-tab-content">
        <LoadingSkeleton />
      </div>
    )
  if (orders.length === 0)
    return (
      <div className="patient-tab-content">
        <EmptyState
          icon="flask"
          title="No laboratory records"
          description="No laboratory orders or results are associated with this patient."
        />
      </div>
    )

  return (
    <div className="patient-tab-content">
      <div className="patient-info-section">
        <table className="patient-record-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>DATE</th>
              <th>TEST</th>
              <th>DEPARTMENT</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontFamily: "Manrope, sans-serif", fontSize: 10 }}>
                  {o.id}
                </td>
                <td>{formatDate(o.date)}</td>
                <td>{o.test}</td>
                <td>{o.department}</td>
                <td>
                  <StatusPill status={o.status} label={labStatusLabel(o.status)} />
                </td>
                <td>
                  <Button className="patient-table-action">
                    View <Icon name="arrow" size={11} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 9, color: "var(--muted)", marginTop: 10 }}>
        Orders and results are distinct records. Authorize the laboratory
        workflow to act on them.
      </p>
    </div>
  )
}

// ─── Prescriptions tab ────────────────────────────────────────────────────────

function PrescriptionsTab({
  prescriptions,
  allowed,
}: {
  prescriptions: PrescriptionEntry[]
  allowed: boolean
}) {
  if (!allowed) return <RestrictedSection />
  if (prescriptions.length === 0)
    return (
      <div className="patient-tab-content">
        <EmptyState
          icon="pill"
          title="No prescription records"
          description="No prescription records are associated with this patient."
        />
      </div>
    )

  return (
    <div className="patient-tab-content">
      <div className="patient-info-section">
        <table className="patient-record-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>MEDICATION</th>
              <th>PRESCRIBER</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr key={rx.id}>
                <td>{formatDate(rx.date)}</td>
                <td>
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                    {rx.medication}
                  </span>
                </td>
                <td>
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                    {rx.prescriber ?? "Not recorded"}
                  </span>
                </td>
                <td>
                  <StatusPill status={rx.status} label={rx.status.charAt(0).toUpperCase() + rx.status.slice(1)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 9, color: "var(--muted)", marginTop: 10 }}>
        Medication names and doses are withheld from this design preview.
        Dispensing is a separate workflow.
      </p>
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────

function BillingTab({ allowed }: { allowed: boolean }) {
  if (!allowed) return <RestrictedSection />
  return (
    <div className="patient-tab-content">
      <div className="patient-info-section">
        <table className="patient-record-table">
          <thead>
            <tr>
              <th>INVOICE ID</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {demoInvoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "Manrope, sans-serif", fontSize: 10 }}>
                  {inv.id}
                </td>
                <td>{formatDate(inv.date)}</td>
                <td>
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                    {inv.amount}
                  </span>
                </td>
                <td>
                  <StatusPill status={inv.status} label={inv.status.charAt(0).toUpperCase() + inv.status.slice(1)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 9, color: "var(--muted)", marginTop: 10 }}>
        Amounts and tariffs are withheld from this preview. Financial records
        require authorized cashier workflow.
      </p>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function PatientProfilePage({
  patientVariant = "default",
  state: externalState = "ready",
  permissions,
  onNavigate,
}: {
  patientVariant?: "default" | "incomplete" | "duplicate"
  state?: string
  permissions: Set<string>
  onNavigate: (id: string) => void
}) {
  const patient =
    patientVariant === "incomplete"
      ? incompletePatient
      : patientVariant === "duplicate"
        ? duplicateWarningPatient
        : demoPatient

  const [tab, setTab] = useState<Tab>("overview")
  const [profileState, setProfileState] = useState<ProfileState>(
    externalState === "loading" ? "loading" : "ready",
  )
  const [confirmLeave, setConfirmLeave] = useState<Tab | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    },
    [],
  )

  // Permission checks
  const canEdit = permissions.has("registration")
  const canViewClinical = permissions.has("records") || permissions.has("consultations")
  const canViewLab = permissions.has("orders") || permissions.has("lab-orders") || permissions.has("result-review")
  const canViewPrescriptions = permissions.has("prescriptions") || permissions.has("prescription-queue")
  const canViewBilling = permissions.has("invoices") || permissions.has("payments")

  const isEditing =
    profileState === "edit" ||
    profileState === "saving" ||
    profileState === "save-error"

  const isLoading = externalState === "loading" || profileState === "loading"
  const isError = externalState === "error"
  const isNotFound = externalState === "not-found"

  function switchTab(next: Tab) {
    if (isEditing) {
      setConfirmLeave(next)
      return
    }
    setTab(next)
  }

  function confirmTabLeave() {
    if (confirmLeave) {
      setTab(confirmLeave)
      setConfirmLeave(null)
      setProfileState("ready")
    }
  }

  function startEdit() {
    setProfileState("edit")
    setTab("demographics")
  }

  function handleSave() {
    setProfileState("saving")
    saveTimer.current = setTimeout(() => {
      // Demo: simulate success
      setProfileState("save-success")
      setTimeout(() => setProfileState("ready"), 2500)
    }, 1200)
  }

  function handleCancelEdit() {
    setProfileState("ready")
  }

  if (!permissions.has("directory"))
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("directory")}
        onHome={() => onNavigate("home")}
      />
    )

  const tabs: { id: Tab; label: string; restricted?: boolean }[] = [
    { id: "overview", label: "Overview" },
    { id: "demographics", label: "Demographics" },
    { id: "appointments", label: "Appointments" },
    { id: "encounters", label: "Encounters" },
    { id: "clinical", label: "Clinical history", restricted: !canViewClinical },
    { id: "laboratory", label: "Laboratory", restricted: !canViewLab },
    { id: "prescriptions", label: "Prescriptions", restricted: !canViewPrescriptions },
    { id: "billing", label: "Billing", restricted: !canViewBilling },
  ]

  return (
    <div className="patient-profile-page">
      {/* ── Breadcrumb ── */}
      <nav className="patient-profile-breadcrumb" aria-label="Page location">
        <Button onClick={() => onNavigate("home")}>Workspace</Button>
        <Icon name="chevron" size={11} />
        <span>Patient Operations</span>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("directory")}>Patient Directory</Button>
        <Icon name="chevron" size={11} />
        <strong>Patient Profile</strong>
      </nav>

      {/* ── Error / not-found states ── */}
      {isError && (
        <div className="patient-info-section" style={{ marginBottom: 16 }}>
          <div className="patient-empty-state">
            <Icon name="warning" size={28} />
            <h3>Unable to load patient record</h3>
            <p>A network error occurred. Please try again.</p>
            <Button className="button secondary" onClick={() => onNavigate("directory")}>
              Return to directory
            </Button>
          </div>
        </div>
      )}
      {isNotFound && (
        <div className="patient-info-section" style={{ marginBottom: 16 }}>
          <div className="patient-empty-state">
            <Icon name="search" size={28} />
            <h3>Patient not found</h3>
            <p>No record matches this patient identifier.</p>
            <Button className="button secondary" onClick={() => onNavigate("directory")}>
              Return to directory
            </Button>
          </div>
        </div>
      )}

      {!isError && !isNotFound && (
        <>
          {/* ── Duplicate warning ── */}
          {patient.hasDuplicateWarning && (
            <div className="patient-duplicate-notice" role="alert">
              <Icon name="warning" size={20} />
              <div className="patient-duplicate-notice-content">
                <strong>Possible duplicate record detected</strong>
                <p>
                  Another record may share this patient's details. Review before
                  making changes. Records are never merged automatically.
                </p>
              </div>
              <Button className="button">
                Review <Icon name="arrow" size={13} />
              </Button>
            </div>
          )}

          {/* ── Identity header ── */}
          <div className="patient-identity-header">
            <div
              className="patient-avatar"
              aria-label={`Initials for ${patient.name}`}
            >
              {patient.initials}
            </div>
            <div className="patient-identity-main">
              <div className="patient-identity-name-row">
                {isLoading ? (
                  <div
                    className="patient-skeleton"
                    style={{ width: 200, height: 24, borderRadius: 4 }}
                  />
                ) : (
                  <>
                    <span className="patient-identity-name">{patient.name}</span>
                    <span className="patient-id-badge">{patient.id}</span>
                    <RecordStatusBadge status={patient.recordStatus} />
                  </>
                )}
              </div>
              {!isLoading && (
                <div className="patient-identity-meta">
                  {(patient.dob || patient.estimatedAge !== null) && (
                    <span>
                      <Icon name="calendar" size={13} />
                      {patient.dob
                        ? formatDate(patient.dob)
                        : `${patient.estimatedAge} yrs (est.)`}
                    </span>
                  )}
                  {patient.sex && (
                    <span>
                      <Icon name="user" size={13} />
                      {patient.sex}
                    </span>
                  )}
                  {patient.phone && (
                    <span>
                      <Icon name="phone" size={13} />
                      {patient.phone}
                    </span>
                  )}
                  <span>
                    <Icon name="building" size={13} />
                    Registered {formatDate(patient.registeredDate)}
                  </span>
                </div>
              )}
            </div>
            <div className="patient-header-actions">
              {canEdit && (
                <Button className="button secondary" onClick={startEdit}>
                  <Icon name="edit" size={14} /> Edit
                </Button>
              )}
              <Button
                className="button compact"
                onClick={() => onNavigate("appointments")}
              >
                <Icon name="calendar" size={14} /> Schedule
              </Button>
            </div>
          </div>

          {/* ── Unsaved-changes confirmation ── */}
          {confirmLeave && (
            <div
              className="patient-duplicate-notice"
              style={{
                background: "#fff8e6",
                borderColor: "#f0d98a",
                marginBottom: 2,
              }}
              role="alertdialog"
            >
              <Icon name="warning" size={18} />
              <div className="patient-duplicate-notice-content">
                <strong style={{ color: "#6a5400" }}>Unsaved changes</strong>
                <p style={{ color: "#7a6010" }}>
                  You have unsaved edits. Leave without saving?
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <Button
                  className="button secondary"
                  style={{ fontSize: 10, padding: "7px 12px", minHeight: 34 }}
                  onClick={() => setConfirmLeave(null)}
                >
                  Stay
                </Button>
                <Button
                  className="button"
                  style={{
                    fontSize: 10,
                    padding: "7px 12px",
                    minHeight: 34,
                    background: "#d4a020",
                  }}
                  onClick={confirmTabLeave}
                >
                  Leave
                </Button>
              </div>
            </div>
          )}

          {/* ── Profile tabs ── */}
          <div className="patient-profile-tabs">
            <div className="patient-profile-tab-list" role="tablist">
              {tabs.map((t) => (
                <Button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`patient-profile-tab-btn${tab === t.id ? " is-active" : ""}${t.restricted ? " is-restricted" : ""}`}
                  onClick={() => switchTab(t.id)}
                >
                  {t.restricted ? (
                    <span className="patient-tab-lock">
                      <Icon name="lock" size={11} /> {t.label}
                    </span>
                  ) : (
                    t.label
                  )}
                </Button>
              ))}
            </div>

            {/* ── Tab panels ── */}
            {isEditing ? (
              <EditDemographicsForm
                patient={patient}
                state={profileState}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {tab === "overview" && (
                  <OverviewTab
                    patient={patient}
                    onEditDemographics={startEdit}
                    onSchedule={() => onNavigate("appointments")}
                  />
                )}
                {tab === "demographics" && (
                  <DemographicsTab
                    patient={patient}
                    state={profileState}
                    onEdit={startEdit}
                  />
                )}
                {tab === "appointments" && (
                  <AppointmentsTab
                    appointments={demoAppointments}
                    state={externalState}
                    onSchedule={() => onNavigate("appointments")}
                  />
                )}
                {tab === "encounters" && (
                  <EncountersTab
                    encounters={demoEncounters}
                    state={externalState}
                  />
                )}
                {tab === "clinical" && (
                  <ClinicalTab allowed={canViewClinical} />
                )}
                {tab === "laboratory" && (
                  <LaboratoryTab
                    orders={demoLabOrders}
                    allowed={canViewLab}
                    state={externalState}
                  />
                )}
                {tab === "prescriptions" && (
                  <PrescriptionsTab
                    prescriptions={demoPrescriptions}
                    allowed={canViewPrescriptions}
                  />
                )}
                {tab === "billing" && (
                  <BillingTab allowed={canViewBilling} />
                )}
              </>
            )}
          </div>

          {/* ── Demo notice ── */}
          <p
            style={{
              fontSize: 9,
              color: "var(--muted)",
              marginTop: 6,
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Icon name="shield" size={12} />
            Confidential medical record · {patient.id}
          </p>
        </>
      )}
    </div>
  )
}
