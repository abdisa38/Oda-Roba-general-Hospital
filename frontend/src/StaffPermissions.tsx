import { useCallback, useEffect, useRef, useState } from "react"
import Icon from "./Icon"
import { allowedDestinations, destinations, roles } from "./permissions/model"
import {
  AccessDeniedPage,
  AuthorizedEmptyState,
  MobileNavigationDrawer,
  PermissionAwareAction,
  RoleActionGroup,
  RoleAwarePageHeader,
  RoleAwareSidebar,
  RoleContextIndicator,
  RoleDashboardCard,
  RoleDashboardLayout,
} from "./permissions/components"
import { Button, Heading, Input, Link, Select, Text } from "./permissions/ui"
import "./permissions.css"
import PreviewDialog from "./permissions/PreviewDialog"
import ReceptionDashboard from "./reception/ReceptionDashboard"
import {
  ReceptionReviewNotes,
  ReceptionSessionExpired,
} from "./reception/components"
import PatientRegistrationPage, {
  type RegistrationLeaveGuard,
} from "./registration/PatientRegistrationPage"
import PatientDirectoryPage from "./patient-directory/PatientDirectoryPage"
import PatientProfilePage from "./patient-profile/PatientProfilePage"
import AppointmentManagementPage from "./appointment-management/AppointmentManagementPage"
import QueueManagementPage from "./queue-management/QueueManagementPage"
import NurseDashboardPage from "./nurse-dashboard/NurseDashboardPage"
import TriageAssessmentPage from "./triage-assessment/TriageAssessmentPage"
import DoctorDashboardPage from "./doctor-dashboard/DoctorDashboardPage"
import ClinicalWorkspacePage from "./clinical-workspace/ClinicalWorkspacePage"
import PatientMedicalHistoryPage from "./patient-history/PatientMedicalHistoryPage"
import DiagnosisManagementPage from "./diagnosis-management/DiagnosisManagementPage"
import PrescriptionManagementPage from "./prescription-management/PrescriptionManagementPage"
import LaboratoryOrdersPage from "./laboratory-orders/LaboratoryOrdersPage"
import SpecimenCollectionPage from "./specimen-collection/SpecimenCollectionPage"
import {
  getAuthenticatedUser,
  clearAuthenticatedUser,
  type StaffUser,
} from "./auth/authStore"

type ViewState = "ready" | "loading" | "empty" | "error" | "restricted" | "no-appointments" | "no-matches" | "expired"
type Panel = "search" | "notifications" | "profile" | "help" | "navigation" | "action" | null
function currentDestination(base: string) {
  if (!window.location.pathname.startsWith(`${base}/module/`)) return "home"
  try {
    return decodeURIComponent(
      window.location.pathname.slice(`${base}/module/`.length),
    )
  } catch {
    return "invalid-destination"
  }
}

export default function StaffPermissions({
  reception = false,
  dedicatedRole,
}: {
  reception?: boolean
  dedicatedRole?: "nurse" | "reception" | "doctor" | "lab" | "pharmacy" | "management"
}) {
  const sessionUser = getAuthenticatedUser()
  const effectiveRole = dedicatedRole || (reception ? "reception" : sessionUser?.role || "reception")
  const base =
    effectiveRole === "nurse"
      ? "/staff/nurse"
      : effectiveRole === "doctor"
      ? "/staff/doctor"
      : effectiveRole === "lab"
      ? "/staff/lab"
      : effectiveRole === "reception" || reception
      ? "/staff/reception"
      : "/staff/permissions"

  const [roleId, setRoleId] = useState<string>(effectiveRole)
  const role = roles.find((item) => item.id === roleId) || roles[0]
  const [revoked, setRevoked] = useState(false)
  const [review, setReview] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState(() => currentDestination(base))
  const [view, setView] = useState<ViewState>("ready")
  const [panel, setPanel] = useState<Panel>(null)
  const [query, setQuery] = useState("")
  const [notice, setNotice] = useState("")
  const [action, setAction] = useState("")
  const [compact, setCompact] = useState(false)
  const [read, setRead] = useState(false)
  const lastDestination = useRef("home")
  const registrationGuard = useRef<RegistrationLeaveGuard | null>(null)
  const registerGuard = useCallback((guard: RegistrationLeaveGuard | null) => {
    registrationGuard.current = guard
  }, [])
  const currentPath = useRef(window.location.pathname)
  const permissions = new Set(revoked ? [] : role.grants)
  const items = allowedDestinations(permissions)
  const destination = destinations.find((item) => item.id === active)
  const denied =
    (active !== "home" && !permissions.has(active)) || (reception && revoked)
  const searchResults = items.filter((item) =>
    `${item.label} ${item.action}`.toLowerCase().includes(query.toLowerCase()),
  )
  useEffect(() => {
    document.title =
      active === "specimen-collection" || (roleId === "lab" && active === "home")
        ? "Specimen Collection & Verification | ORHIMS Design Preview"
        : active === "diagnosis-management"
        ? "Diagnosis Management | ORHIMS Design Preview"
        : active === "medical-history"
        ? "Patient Medical History | ORHIMS Design Preview"
        : active === "clinical-workspace"
        ? "Clinical Workspace | ORHIMS Design Preview"
        : active === "consultations" || (roleId === "doctor" && active === "home")
          ? "Doctor Dashboard | ORHIMS Design Preview"
        : active === "triage-assessment"
        ? "Triage Assessment Workspace | ORHIMS Design Preview"
        : active === "triage" || (roleId === "nurse" && active === "home")
          ? "Nurse Dashboard | ORHIMS Design Preview"
        : active === "queue"
          ? "Queue Management | ORHIMS Design Preview"
        : active === "appointments"
          ? "Appointment Management | ORHIMS Design Preview"
        : active === "patient-profile"
          ? "Patient Profile | ORHIMS Design Preview"
          : active === "registration"
            ? "Register Patient | ORHIMS Design Preview"
            : active === "directory"
              ? "Patient Directory | ORHIMS Design Preview"
              : reception
                ? "Reception Overview | ORHIMS Design Preview"
                : "Role-Based Navigation & Permissions | ORHIMS Design Preview"
    const onPop = () => {
      const target = window.location.pathname
      const destination = currentDestination(base)
      if (registrationGuard.current) {
        window.history.pushState({}, "", currentPath.current)
        registrationGuard.current(() => {
          window.history.replaceState({}, "", target)
          currentPath.current = target
          setActive(destination)
          setPanel(null)
        })
      } else {
        currentPath.current = target
        setActive(destination)
        setPanel(null)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [base, reception, active])
  function navigate(id: string) {
    if (id === active) {
      setPanel(null)
      return
    }
    setPanel(null)
    const leave = () => performNavigation(id)
    if (registrationGuard.current) registrationGuard.current(leave)
    else leave()
  }
  function performNavigation(id: string) {
    lastDestination.current = active
    window.history.pushState(
      {},
      "",
      id === "home" ? base : `${base}/module/${encodeURIComponent(id)}`,
    )
    setActive(id)
    currentPath.current = window.location.pathname
    setPanel(null)
    setReview(false)
    requestAnimationFrame(() => {
      if (id === "registration" || id === "directory") {
        window.scrollTo({ top: 0 })
        document
          .getElementById("permission-main")
          ?.focus({ preventScroll: true })
      } else document.getElementById("permission-main")?.focus()
    })
  }
  function switchScenario(id: string) {
    setRoleId(id)
    setRevoked(false)
    setPanel(null)
    setQuery("")
    setRead(false)
    setView("ready")
    setActive("home")
    setNotice(
      `Switched to ${roles.find((r) => r.id === id)?.role || id} workspace.`,
    )
  }
  function changePermissions() {
    setRevoked(!revoked)
    setPanel(null)
    setQuery("")
    setNotice(
      revoked
        ? "Demonstration permissions refreshed. Authorized destinations are available again."
        : "Demonstration permissions changed. Operational access has been removed; navigation, search, and notifications were refreshed.",
    )
  }
  function previewAction(label: string) {
    setAction(label)
    setPanel("action")
  }
  const sidebar = (
    <RoleAwareSidebar
      role={role}
      items={items}
      active={active}
      collapsed={false}
      onOpen={navigate}
      onCollapse={() => setPanel(null)}
    />
  )
  return (
    <div
      className={`permission-app${reception ? " reception-app" : ""}${
        collapsed ? " sidebar-collapsed" : ""
      }${compact ? " compact-workspace" : ""}`}
    >
      <Link href="#permission-main" className="skip-link">
        Skip to workspace
      </Link>
      <aside className="permission-sidebar">
        <RoleAwareSidebar
          role={role}
          items={items}
          active={active}
          collapsed={collapsed}
          onOpen={navigate}
          onCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>
      <div className="permission-workspace">
        <header className="permission-header">
          <Button
            className="icon-button permission-toggle"
            aria-label="Toggle navigation"
            onClick={() =>
              window.matchMedia("(max-width: 900px)").matches
                ? setPanel("navigation")
                : setCollapsed(!collapsed)
            }
          >
            <Icon name="menu" />
          </Button>
          <div className="permission-breadcrumb">
            <span>
              {reception &&
              (active === "registration" || active === "directory")
                ? "Reception"
                : "Workspace"}
            </span>
            <Icon name="chevron" size={12} />
            <strong>
              {review
                ? "Design review"
                : denied
                  ? "Restricted page"
                  : active === "home"
                    ? role.home
                    : destination?.label}
            </strong>
          </div>
          <Button
            className="permission-search-button"
            onClick={() => {
              setQuery("")
              setPanel("search")
            }}
            aria-label="Search authorized workspace"
          >
            <Icon name="search" size={18} />
            <span>Search your workspace</span>
            <small>Search</small>
          </Button>
          <div className="permission-header-controls">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--mist)",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase" }}>
                Role:
              </span>
              <select
                value={roleId}
                onChange={(e) => switchScenario(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--teal)",
                  outline: "none",
                  cursor: "pointer",
                }}
                aria-label="Switch staff role workspace"
              >
                <option value="reception">Receptionist</option>
                <option value="lab">Laboratory Technician</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="radiology">Radiology Staff</option>
                <option value="pharmacy">Pharmacy Staff</option>
                <option value="management">Hospital Management</option>
              </select>
            </div>

            <Button
              className="icon-button permission-notification-button"
              aria-label="Open notifications"
              onClick={() => setPanel("notifications")}
            >
              <Icon name="mail" />
              {items.length > 0 && !read && (
                <span className="permission-notification-dot" />
              )}
            </Button>
            <Button
              className="icon-button"
              aria-label="Help and access guidance"
              onClick={() => setPanel("help")}
            >
              <Icon name="info" />
            </Button>
            <Button
              className="permission-profile-button"
              aria-label={`Open profile for ${sessionUser?.name || "Demo Staff"}`}
              onClick={() => setPanel("profile")}
            >
              <span className="permission-avatar">
                {sessionUser?.avatarInitials || (roleId === "nurse" ? "RK" : roleId === "doctor" ? "DA" : "AT")}
              </span>
              <span>
                <strong>{sessionUser?.name || (roleId === "nurse" ? "Nurse Rahel" : "Demo Staff")}</strong>
                <small>{role.role}</small>
              </span>
              <Icon name="chevron" size={14} />
            </Button>
          </div>
        </header>
        <main id="permission-main" tabIndex={-1} className="permission-main">
          {notice && (
            <div className="permission-update" role="status">
              <Icon name="info" size={18} />
              <span>{notice}</span>
              <Button
                className="icon-button"
                aria-label="Dismiss update"
                onClick={() => setNotice("")}
              >
                <Icon name="close" size={16} />
              </Button>
            </div>
          )}
          {review ? (
            reception ? (
              <ReceptionReviewNotes />
            ) : (
              <ReviewMatrix />
            )
          ) : reception && view === "expired" ? (
            <ReceptionSessionExpired />
          ) : denied || view === "restricted" ? (
            <AccessDeniedPage
              onBack={() => {
                setView("ready")
                navigate(
                  permissions.has(lastDestination.current)
                    ? lastDestination.current
                    : "home",
                )
              }}
              onHome={() => {
                setView("ready")
                navigate("home")
              }}
            />
          ) : active === "directory" ? (
            <PatientDirectoryPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              onReady={() => setView("ready")}
            />
          ) : active === "patient-profile" ? (
            <PatientProfilePage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              patientVariant={
                view === "empty" ? "incomplete"
                : view === "error" ? "duplicate"
                : "default"
              }
            />
          ) : active === "appointments" ? (
            <AppointmentManagementPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "queue" ? (
            <QueueManagementPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "registration" ? (
            <PatientRegistrationPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              onReady={() => setView("ready")}
              onGuard={registerGuard}
            />
          ) : active === "triage-assessment" ? (
            <TriageAssessmentPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "triage" || (roleId === "nurse" && active === "home") ? (
            <NurseDashboardPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "consultations" || (roleId === "doctor" && active === "home") ? (
            <DoctorDashboardPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "clinical-workspace" ? (
            <ClinicalWorkspacePage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "medical-history" ? (
            <PatientMedicalHistoryPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "diagnosis-management" ? (
            <DiagnosisManagementPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "prescription-management" || active === "prescriptions" ? (
            <PrescriptionManagementPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "orders" || active === "laboratory" || active === "lab-orders" || active === "laboratory-orders" ? (
            <LaboratoryOrdersPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "specimen-collection" || active === "specimen" || (roleId === "lab" && active === "home") ? (
            <SpecimenCollectionPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : (reception || roleId === "reception") && active === "home" ? (
            <ReceptionDashboard
              state={view}
              onRetry={() => setView("ready")}
              onClearState={() => setView("ready")}
              onNavigate={navigate}
              permissions={permissions}
            />
          ) : (
            <>
              <RoleAwarePageHeader
                title={
                  active === "home"
                    ? role.home
                    : destination?.label || "Workspace"
                }
                description={
                  active === "home"
                    ? role.description
                    : "Permission-aware module concept. Detailed operational workflows are outside this preview."
                }
              >
                {items[0] && (
                  <PermissionAwareAction
                    allowed={permissions.has(
                      active === "home" ? items[0].id : active,
                    )}
                    label={
                      active === "home"
                        ? items[0].action
                        : destination?.action || "Open workspace"
                    }
                    onClick={() =>
                      previewAction(
                        active === "home"
                          ? items[0].action
                          : destination?.action || "",
                      )
                    }
                  />
                )}
                {active === "directory" && permissions.has("registration") && (
                  <Button
                    className="button"
                    onClick={() => navigate("registration")}
                  >
                    <Icon name="user" size={16} />
                    Register Patient
                  </Button>
                )}
              </RoleAwarePageHeader>
              <div className="permission-context-row">
                <span>
                  <Icon name="shield" size={15} />
                  {role.role} workspace
                  <span className="permission-context-divider">/</span>
                  {role.id === "head"
                    ? "Department Scope"
                    : role.id === "management"
                      ? "Reporting Scope"
                      : "Authorized Scope"}
                </span>
              </div>
              <div className="permission-shortcut-section">
                <div className="permission-section-label">
                  Quick Actions
                </div>
                <RoleActionGroup>
                  {items.slice(0, 4).map((item) => (
                    <Button
                      key={item.id}
                      className="permission-shortcut"
                      onClick={() => navigate(item.id)}
                    >
                      <span className="permission-shortcut-icon">
                        <Icon name={item.icon} size={21} />
                      </span>
                      <span>
                        <strong>{item.action}</strong>
                        <small>{item.label}</small>
                      </span>
                      <Icon name="arrow" size={16} />
                    </Button>
                  ))}
                </RoleActionGroup>
                {items.length === 0 && (
                  <Text>
                    No operational shortcuts are configured. Contact your
                    administrator for guidance.
                  </Text>
                )}
              </div>
              <RoleDashboardLayout>
                <RoleDashboardCard
                  title="Your work queue"
                  className="permission-queue-card"
                >
                  <div className="permission-card-subhead">
                    <Text>
                      Assigned operational queue tasks.
                    </Text>
                  </div>
                  <div className="permission-queue-summary">
                    <span>
                      <Icon name="clock" size={17} />
                      {revoked
                        ? "No configured workflow"
                        : `${role.tasks.length} active tasks`}
                    </span>
                  </div>
                  {view === "loading" ? (
                    <div
                      className="permission-loading"
                      role="status"
                      aria-busy="true"
                    >
                      <Icon name="clock" size={24} />
                      <Text>Loading authorized work…</Text>
                      <div />
                      <div />
                      <div />
                    </div>
                  ) : view === "empty" || revoked ? (
                    <AuthorizedEmptyState />
                  ) : view === "error" ? (
                    <AuthorizedEmptyState
                      error
                      onRetry={() => setView("ready")}
                    />
                  ) : (
                    <div className="permission-task-list">
                      <div className="permission-task-heading">
                        <span>TASK / WORKFLOW</span>
                        <span>NEXT STEP</span>
                        <span />
                      </div>
                      {role.tasks.map(([title, module, status], index) => {
                        const target = items.find(
                          (item) => item.label === module,
                        )
                        return (
                          target && (
                            <div className="permission-task-row" key={title}>
                              <span className="permission-task-number">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <strong>{title}</strong>
                                <small>
                                  {module} · DEMO-
                                  {String(index + 1).padStart(3, "0")}
                                </small>
                              </div>
                              <span
                                className={`permission-task-status${
                                  index === 0 ? " emphasized" : ""
                                }`}
                              >
                                {status}
                              </span>
                              <Button
                                className="icon-button"
                                aria-label={`Open ${title}`}
                                onClick={() => navigate(target.id)}
                              >
                                <Icon name="arrow" size={17} />
                              </Button>
                            </div>
                          )
                        )
                      })}
                    </div>
                  )}
                  <div className="permission-queue-footer">
                    <Icon name="shield" size={14} />
                    <span>
                      No patient identities, clinical details, or financial
                      values are displayed.
                    </span>
                  </div>
                </RoleDashboardCard>
                <RoleDashboardCard
                  title="Your access at a glance"
                  className="permission-access-card"
                >
                  <div className="permission-access-identity">
                    <span className="permission-access-icon">
                      <Icon name="shield" size={25} />
                    </span>
                    <RoleContextIndicator role={role} />
                  </div>
                  <Text>
                    Effective permissions determine what you can see and do, not
                    your job title alone.
                  </Text>
                  <div className="permission-access-count">
                    <strong>{items.length}</strong>
                    <span>
                      authorized destinations
                      <small>Illustrative configuration</small>
                    </span>
                  </div>
                  <div className="permission-boundary">
                    <span>ACCESS BOUNDARY</span>
                    <Text>{role.boundary}</Text>
                  </div>
                  <Button
                    className="permission-text-button"
                    onClick={() => setReview(true)}
                  >
                    Review proposed permissions
                    <Icon name="arrow" size={15} />
                  </Button>
                </RoleDashboardCard>
                <RoleDashboardCard
                  title="Workflow guidance"
                  className="permission-guidance-card"
                >
                  <div className="permission-guidance">
                    <span className="permission-guidance-icon">
                      <Icon name="directions" size={25} />
                    </span>
                    <div>
                      <Heading level={3}>
                        The right work. The right access.
                      </Heading>
                      <Text>
                        Use your assigned queue to open authorized work. Access
                        is checked again when a destination is opened.
                      </Text>
                    </div>
                  </div>
                  {role.id === "lab" ? (
                    <PermissionAwareAction
                      allowed={
                        permissions.has("result-validate") &&
                        permissions.has("result-release")
                      }
                      label="Validate & release result"
                      explanation="Result entry is allowed in this scenario. Validation and release need separate hospital-approved permissions."
                      onClick={() => previewAction("Validate & release result")}
                    />
                  ) : (
                    <Button
                      className="button secondary"
                      onClick={() => navigate("restricted-example")}
                    >
                      <Icon name="lock" size={16} />
                      Preview a restricted destination
                    </Button>
                  )}
                  <PermissionAwareAction
                    allowed={permissions.has("permissions")}
                    label="Review access configuration"
                    onClick={() => navigate("permissions")}
                    hide
                  />
                </RoleDashboardCard>
              </RoleDashboardLayout>
            </>
          )}
        </main>
        <div className="permission-bottom-line">
          <span>
            ORHIMS <span>·</span> Oda Roba General Hospital
          </span>
          <span>Hospital Information Management System</span>
        </div>
      </div>
      {panel && (
        <PreviewDialog
          title={
            panel === "search"
              ? "Search your workspace"
              : panel === "notifications"
                ? "Notifications"
                : panel === "profile"
                  ? "Staff profile"
                  : panel === "help"
                    ? "Help & access guidance"
                    : panel === "navigation"
                      ? "Workspace navigation"
                      : action
          }
          onClose={() => setPanel(null)}
          wide={panel === "navigation"}
        >
          {panel === "navigation" && (
            <MobileNavigationDrawer>{sidebar}</MobileNavigationDrawer>
          )}
          {panel === "search" && (
            <>
              <Text>
                Search authorized workspaces, services, and tasks.
              </Text>
              <label
                className="permission-field-label"
                htmlFor="permission-search"
              >
                Destination or task
              </label>
              <Input
                id="permission-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your authorized workspace"
                className="permission-input"
              />
              <div className="permission-dialog-results">
                {searchResults.length ? (
                  searchResults.map((item) => (
                    <Button
                      key={item.id}
                      className="permission-dialog-result"
                      onClick={() => navigate(item.id)}
                    >
                      <Icon name={item.icon} size={20} />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.action}</small>
                      </span>
                      <Icon name="arrow" size={16} />
                    </Button>
                  ))
                ) : (
                  <Text>No authorized destinations match your search.</Text>
                )}
              </div>
            </>
          )}
          {panel === "notifications" && (
            <>
              <Text>
                Operational workflow updates and departmental notices.
              </Text>
              {items.length ? (
                <>
                  <Button
                    className="permission-dialog-result"
                    onClick={() => {
                      setRead(true)
                      navigate(items[0].id)
                    }}
                  >
                    <Icon name="mail" size={22} />
                    <span>
                      <strong>Workflow Reminder</strong>
                      <small>
                        {items[0].label} · {read ? "Read" : "Unread"}
                      </small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </Button>
                  <Button
                    className="permission-text-button"
                    onClick={() => setRead(true)}
                  >
                    Mark as read
                    <Icon name="check" size={15} />
                  </Button>
                </>
              ) : (
                <AuthorizedEmptyState />
              )}
            </>
          )}
          {panel === "profile" && (
            <>
              <div className="permission-profile-identity">
                <span className="permission-avatar">
                  {sessionUser?.avatarInitials || (roleId === "nurse" ? "RK" : roleId === "doctor" ? "DA" : "AT")}
                </span>
                <div>
                  <Heading level={3}>
                    {sessionUser?.name || (roleId === "nurse" ? "Nurse Rahel Kebede" : "Demo Staff")}
                  </Heading>
                  <RoleContextIndicator role={role} />
                  <small>
                    {sessionUser?.staffId || "ORH-NR-042"} · {sessionUser?.department || "Hospital Staff"}
                  </small>
                </div>
              </div>
              <Text>
                {sessionUser?.email ? `Signed in as ${sessionUser.email}` : "Role-based authenticated workspace."}
              </Text>
              <label className="permission-checkbox">
                <Input
                  type="checkbox"
                  checked={compact}
                  onChange={(event) => setCompact(event.target.checked)}
                />
                Use compact workspace spacing{" "}
                <small>Session preference</small>
              </label>
              <div className="permission-boundary">
                <span>ACCOUNT &amp; SESSION</span>
                <Text>
                  Active session provisioned for {role.role} workflows in Oda Roba Hospital Information System.
                </Text>
              </div>

              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                  Switch Workspace Role
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <Button
                    className={`button ${roleId === "lab" ? "" : "secondary"}`}
                    style={{ fontSize: "12px", padding: "8px" }}
                    onClick={() => switchScenario("lab")}
                  >
                    <Icon name="flask" size={14} /> Laboratory Tech
                  </Button>
                  <Button
                    className={`button ${roleId === "doctor" ? "" : "secondary"}`}
                    style={{ fontSize: "12px", padding: "8px" }}
                    onClick={() => switchScenario("doctor")}
                  >
                    <Icon name="cross" size={14} /> Doctor
                  </Button>
                  <Button
                    className={`button ${roleId === "nurse" ? "" : "secondary"}`}
                    style={{ fontSize: "12px", padding: "8px" }}
                    onClick={() => switchScenario("nurse")}
                  >
                    <Icon name="heart" size={14} /> Nurse
                  </Button>
                  <Button
                    className={`button ${roleId === "reception" ? "" : "secondary"}`}
                    style={{ fontSize: "12px", padding: "8px" }}
                    onClick={() => switchScenario("reception")}
                  >
                    <Icon name="user" size={14} /> Receptionist
                  </Button>
                </div>
              </div>
              <Button
                className="button"
                style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}
                onClick={() => {
                  clearAuthenticatedUser()
                  window.location.href = "/staff/sign-in"
                }}
              >
                <Icon name="lock" size={16} /> Sign Out of Account
              </Button>
            </>
          )}
          {panel === "help" && (
            <>
              <Text>
                If you believe you need access, contact your system
                administrator through the hospital’s approved process. No
                support ticket or access request is sent from this prototype.
              </Text>
              <div className="permission-boundary">
                <span>ACCESS IS NOT SELF-SERVICE</span>
                <Text>
                  Role assignment, authorization, reauthentication, and audit
                  logging must be implemented and enforced by backend services.
                </Text>
              </div>
              <Button
                className="button secondary"
                onClick={() => {
                  setPanel(null)
                  setReview(true)
                }}
              >
                View open decisions
                <Icon name="arrow" size={17} />
              </Button>
            </>
          )}
          {panel === "action" && (
            <>
              <div className="permission-dialog-action-icon">
                <Icon name="check" size={28} />
              </div>
              <Heading level={3}>Authorized action concept</Heading>
              <Text>
                “{action}” is available in the selected demonstration
                configuration. This preview does not create, modify, or submit
                any operational records.
              </Text>
              <div className="permission-boundary">
                <span>BACKEND DEPENDENCY</span>
                <Text>
                  The server must independently authorize every request against
                  current grants, record scope, and hospital policy.
                </Text>
              </div>
              <Button className="button" onClick={() => setPanel(null)}>
                Return to workspace
              </Button>
            </>
          )}
        </PreviewDialog>
      )}
    </div>
  )
}

function ReviewMatrix() {
  return (
    <div className="permission-review-page">
      <RoleAwarePageHeader
        title="Role & permission review"
        description="One shared shell. Configurable permissions. A proposed design model for hospital review—not a finalized authorization policy."
      />
      <div className="permission-review-intro">
        <Icon name="shield" size={24} />
        <div>
          <Heading level={3}>Job titles are not access grants</Heading>
          <Text>
            These scenarios illustrate potential access. Every destination,
            action, search result, and notification must use effective
            permissions and record-level scope enforced by the backend.
          </Text>
        </div>
      </div>
      <RoleDashboardCard title="Proposed role and permission matrix">
        <Text>
          Thirteen staff scenarios. The patient portal is a separate future
          experience, not an internal sidebar destination.
        </Text>
        <div
          className="permission-matrix-scroll"
          tabIndex={0}
          aria-label="Scrollable proposed role permission matrix"
        >
          <table className="permission-matrix">
            <caption>
              Design-review model · fictional configuration · hospital approval
              required
            </caption>
            <thead>
              <tr>
                {[
                  "Role",
                  "Primary workspace",
                  "Main navigation groups",
                  "Example permitted actions",
                  "Important access boundaries",
                  "Hospital approval required",
                ].map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const permitted = allowedDestinations(new Set(role.grants))
                return (
                  <tr key={role.id}>
                    <th scope="row">{role.role}</th>
                    <td>{role.home}</td>
                    <td>
                      {[...new Set(permitted.map((item) => item.group))].join(
                        " · ",
                      )}
                    </td>
                    <td>
                      {permitted
                        .slice(0, 2)
                        .map((item) => item.action)
                        .join(" · ")}
                    </td>
                    <td>{role.boundary}</td>
                    <td>{role.decision}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </RoleDashboardCard>
      <div className="permission-review-columns">
        <RoleDashboardCard title="Permission-aware interaction contract">
          <ul>
            <li>
              <strong>Authorized:</strong> destination and contextual action are
              available from effective grants.
            </li>
            <li>
              <strong>Disabled:</strong> laboratory validation explains the need
              for separate authority.
            </li>
            <li>
              <strong>Hidden:</strong> administration shortcuts are absent from
              ordinary clinical scenarios.
            </li>
            <li>
              <strong>Direct access:</strong> unauthorized URLs show “Access
              restricted” without record details.
            </li>
            <li>
              <strong>Access changes:</strong> simulation removes operational
              navigation, clears search/dialogs, and rechecks the open page.
            </li>
            <li>
              <strong>Distinct states:</strong> loading, no authorized tasks,
              and network errors remain separate from access denial and expired
              authentication.
            </li>
          </ul>
        </RoleDashboardCard>
        <RoleDashboardCard title="Open decisions & backend dependencies">
          <ul>
            <li>
              Approve roles, individual grants, assignment rules, department
              boundaries, and permitted data fields.
            </li>
            <li>
              Define clinical exceptions, emergency access, delegation, result
              validation, and release authority.
            </li>
            <li>
              Confirm session expiry, permission-refresh timing,
              reauthentication triggers, and treatment of unsaved work.
            </li>
            <li>
              Define server-authorized search indexes, notification audiences,
              and record-opening checks.
            </li>
            <li>
              Confirm audit retention, support channels, staff provisioning,
              password policy, and session sign-out.
            </li>
            <li>
              Connect authentication and authorization services. Client-side
              visibility and disabled controls are not security.
            </li>
          </ul>
        </RoleDashboardCard>
      </div>
      <RoleDashboardCard title="Reusable architecture & responsive review">
        <Text>
          RoleAwareSidebar, NavigationGroup, NavigationItem,
          CollapsedNavigationTooltip, MobileNavigationDrawer,
          RoleAwarePageHeader, RoleDashboardLayout, RoleActionGroup,
          PermissionAwareAction, AccessDeniedPage, RestrictedActionHint,
          RoleContextIndicator, AuthorizedEmptyState, and RoleDashboardCard
          share the existing ORHIMS foundation.
        </Text>
        <div className="permission-review-breakpoints">
          <span>
            <strong>1440 / 1280</strong>Expanded or collapsed navigation
          </span>
          <span>
            <strong>768</strong>Modal navigation drawer, stacked workspace
          </span>
          <span>
            <strong>390</strong>Compact header, touch-friendly task lists
          </span>
        </div>
        <Text>
          Use the design-review scenario controls to inspect each role. These
          controls are prototype tools, never a staff role switcher.
        </Text>
      </RoleDashboardCard>
    </div>
  )
}
