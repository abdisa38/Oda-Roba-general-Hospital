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
import LaboratoryResultEntryPage from "./laboratory-result-entry/LaboratoryResultEntryPage"
import LaboratoryResultReviewPage from "./laboratory-result-review/LaboratoryResultReviewPage"
import LaboratoryHistoryPage from "./laboratory-history/LaboratoryHistoryPage"
import PharmacyDashboardPage from "./pharmacy-dashboard/PharmacyDashboardPage"
import PrescriptionQueuePage from "./prescription-queue/PrescriptionQueuePage"
import MedicineInventoryPage from "./medicine-inventory/MedicineInventoryPage"
import StockMovementsPage from "./stock-movements/StockMovementsPage"
import HospitalBillingPage from "./hospital-billing/HospitalBillingPage"
import InpatientEmergencyPage from "./inpatient-emergency/InpatientEmergencyPage"
import AdministrationPage from "./administration/AdministrationPage"
import AnalyticsPage from "./analytics/AnalyticsPage"
import UXQualityRefinementPage from "./ux-refinement/UXQualityRefinementPage"
import {
  getAuthenticatedUser,
  clearAuthenticatedUser,
  ensureAuthenticatedForRole,
  type StaffUser,
} from "./auth/authStore"

type ViewState = "ready" | "loading" | "empty" | "error" | "restricted" | "no-appointments" | "no-matches" | "expired"
type Panel = "search" | "notifications" | "profile" | "help" | "navigation" | "action" | null

function currentDestination(base?: string) {
  if (
    window.location.pathname.includes("ux-quality-refinement") ||
    window.location.pathname === "/staff/refinement" ||
    window.location.pathname.startsWith("/staff/refinement/")
  ) {
    return "ux-quality-refinement"
  }
  const match = window.location.pathname.match(/\/module\/([^/?#]+)/)
  if (match) {
    try {
      return decodeURIComponent(match[1])
    } catch {
      return "invalid-destination"
    }
  }
  if (base && window.location.pathname.startsWith(`${base}/module/`)) {
    try {
      return decodeURIComponent(
        window.location.pathname.slice(`${base}/module/`.length),
      )
    } catch {
      return "invalid-destination"
    }
  }
  return "home"
}

function getRoleFromPath(): string | null {
  const segments = window.location.pathname.split("/").filter(Boolean)
  if (
    segments[0] === "staff" &&
    segments[1] &&
    !["login", "sign-in", "auth", "authentication", "permissions"].includes(segments[1])
  ) {
    return segments[1] === "billing" ? "cashier" : segments[1]
  }
  return null
}

export default function StaffPermissions({
  reception = false,
  dedicatedRole,
}: {
  reception?: boolean
  dedicatedRole?: "nurse" | "reception" | "doctor" | "lab" | "pharmacy" | "management" | "cashier" | "emergency" | "inpatient" | "admin" | "analytics" | string
}) {
  const roleFromUrl = getRoleFromPath()
  const rawSession = getAuthenticatedUser()
  const effectiveRole =
    dedicatedRole ||
    roleFromUrl ||
    (reception ? "reception" : rawSession?.role || "reception")

  // Strict role security check: block cross-role workspace access
  if (
    rawSession &&
    rawSession.role &&
    effectiveRole &&
    rawSession.role !== effectiveRole &&
    !(rawSession.role === "admin" && effectiveRole === "management")
  ) {
    const userDashboard = rawSession.dashboardPath || `/staff/${rawSession.role}`
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--mist)",
          padding: "24px",
          fontFamily: "var(--font-sans, inherit)",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "100%",
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(20, 46, 66, 0.08)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(220, 38, 38, 0.1)",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="shield" size={24} />
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--navy)",
              marginBottom: "8px",
            }}
          >
            Access Restricted
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              marginBottom: "20px",
            }}
          >
            You are currently signed in as <strong>{rawSession.name}</strong> (
            {rawSession.roleTitle}). Cross-role dashboard switching is not
            permitted. Please return to your assigned workspace.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                window.location.href = userDashboard
              }}
              style={{
                background: "var(--teal)",
                color: "#fff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Return to My Dashboard
            </button>
            <button
              onClick={() => {
                clearAuthenticatedUser()
                window.location.href = "/staff/sign-in"
              }}
              style={{
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                padding: "9px 18px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const sessionUser =
    rawSession ||
    ensureAuthenticatedForRole(
      (effectiveRole === "admin" ||
      effectiveRole === "management" ||
      effectiveRole === "analytics"
        ? "admin"
        : effectiveRole === "cashier" ||
        effectiveRole === "pharmacy" ||
        effectiveRole === "lab" ||
        effectiveRole === "doctor" ||
        effectiveRole === "nurse" ||
        effectiveRole === "emergency" ||
        effectiveRole === "inpatient" ||
        effectiveRole === "reception"
          ? effectiveRole
          : "cashier") as any,
    )

  const base =
    effectiveRole === "analytics"
      ? "/staff/analytics"
      : effectiveRole === "admin" || effectiveRole === "management"
      ? "/staff/admin"
      : effectiveRole === "nurse"
      ? "/staff/nurse"
      : effectiveRole === "doctor"
      ? "/staff/doctor"
      : effectiveRole === "lab"
      ? "/staff/lab"
      : effectiveRole === "pharmacy"
      ? "/staff/pharmacy"
      : effectiveRole === "cashier"
      ? "/staff/cashier"
      : effectiveRole === "emergency"
      ? "/staff/emergency"
      : effectiveRole === "inpatient"
      ? "/staff/inpatient"
      : effectiveRole === "reception" || reception
      ? "/staff/reception"
      : "/staff/permissions"

  const [roleId, setRoleId] = useState<string>(effectiveRole)
  const role = roles.find((item) => item.id === roleId) || roles[0]
  const [revoked, setRevoked] = useState(false)
  const [review, setReview] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState(() => {
    const dest = currentDestination(base)
    if (dest && dest !== "home" && dest !== "invalid-destination") {
      return dest
    }
    return "home"
  })
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
      active === "ux-quality-refinement" || active === "refinement"
        ? "UX Quality & Interaction Refinement | ORHIMS · Oda Roba Hospital"
        : active === "emergency-dashboard" || (roleId === "emergency" && active === "home")
        ? "Emergency Dashboard | ORHIMS Design Preview"
        : active === "emergency-triage"
        ? "Emergency Triage | ORHIMS Design Preview"
        : active === "admissions"
        ? "Inpatient Admissions | ORHIMS Design Preview"
        : active === "ward-management" || (roleId === "inpatient" && active === "home")
        ? "Ward Management | ORHIMS Design Preview"
        : active === "bed-management"
        ? "Bed Management | ORHIMS Design Preview"
        : active === "discharges"
        ? "Patient Discharges | ORHIMS Design Preview"
        : active === "billing-overview" || (roleId === "cashier" && active === "home")
        ? "Billing Overview | ORHIMS Design Preview"
        : active === "invoices"
        ? "Invoices | ORHIMS Design Preview"
        : active === "payments"
        ? "Payment Processing | ORHIMS Design Preview"
        : active === "payment-history" || active === "receipts"
        ? "Payment History | ORHIMS Design Preview"
        : active === "financial-reports"
        ? "Financial Reports | ORHIMS Design Preview"
        : active === "stock-movements"
        ? "Stock Movements & Receiving | ORHIMS Design Preview"
        : active === "medication-stock" || active === "medicine-inventory"
        ? "Medicine Inventory Management | ORHIMS Design Preview"
        : active === "prescription-queue" || active === "dispensing"
        ? "Prescription Queue & Dispensing | ORHIMS Design Preview"
        : active === "pharmacy-dashboard" || (roleId === "pharmacy" && active === "home")
        ? "Pharmacy Dashboard | ORHIMS Design Preview"
        : active === "lab-history" || active === "laboratory-history"
        ? "Laboratory History | ORHIMS Design Preview"
        : active === "result-review"
        ? "Laboratory Result Review | ORHIMS Design Preview"
        : active === "result-entry"
        ? "Laboratory Result Entry | ORHIMS Design Preview"
        : active === "specimen-collection" || (roleId === "lab" && active === "home")
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
                gap: "7px",
                background: "rgba(8, 126, 131, 0.08)",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(8, 126, 131, 0.25)",
              }}
              title={`Authenticated as ${sessionUser?.name} (${sessionUser?.roleTitle})`}
            >
              <Icon name="shield" size={13} style={{ color: "var(--teal)" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>
                {role.role}
              </span>
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
                {sessionUser?.avatarInitials || (roleId === "emergency" ? "AL" : roleId === "inpatient" ? "BW" : roleId === "nurse" ? "RK" : roleId === "doctor" ? "DA" : roleId === "cashier" ? "AK" : roleId === "pharmacy" ? "HB" : roleId === "lab" ? "TG" : "AT")}
              </span>
              <span>
                <strong>{sessionUser?.name || (roleId === "emergency" ? "Dr. Aster Lemma" : roleId === "inpatient" ? "Sr. Bethlehem Worku" : roleId === "nurse" ? "Nurse Rahel" : roleId === "cashier" ? "Almaz Kebede" : roleId === "pharmacy" ? "Hiwot Bekele" : roleId === "doctor" ? "Dr. Daniel Abate" : "Demo Staff")}</strong>
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
          ) : active === "result-entry" ? (
            <LaboratoryResultEntryPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "result-review" ? (
            <LaboratoryResultReviewPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "lab-history" || active === "laboratory-history" ? (
            <LaboratoryHistoryPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "prescription-queue" || active === "dispensing" ? (
            <PrescriptionQueuePage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "emergency-dashboard" ||
            active === "emergency-triage" ||
            active === "admissions" ||
            active === "ward-management" ||
            active === "bed-management" ||
            active === "discharges" ||
            (roleId === "emergency" && active === "home") ||
            (roleId === "inpatient" && active === "home") ? (
            <InpatientEmergencyPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              initialTab={
                active === "emergency-triage"
                  ? "emergency-triage"
                  : active === "admissions"
                  ? "admissions"
                  : active === "ward-management"
                  ? "ward-management"
                  : active === "bed-management"
                  ? "bed-management"
                  : active === "discharges"
                  ? "discharges"
                  : roleId === "inpatient"
                  ? "ward-management"
                  : "emergency-dashboard"
              }
            />
          ) : active === "admin-overview" ||
            active === "user-management" ||
            active === "roles-permissions" ||
            active === "department-management" ||
            active === "hospital-configuration" ||
            active === "audit-logs" ||
            active === "system-settings" ||
            active === "users" ||
            active === "permissions" ||
            active === "departments" ||
            active === "audit" ||
            active === "settings" ||
            active === "hospital-settings" ||
            ((roleId === "admin" || roleId === "management") && active === "home") ? (
            <AdministrationPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              initialTab={
                active === "user-management" || active === "users"
                  ? "user-management"
                  : active === "roles-permissions" || active === "permissions"
                  ? "roles-permissions"
                  : active === "department-management" || active === "departments"
                  ? "department-management"
                  : active === "hospital-configuration" || active === "hospital-settings"
                  ? "hospital-configuration"
                  : active === "audit-logs" || active === "audit"
                  ? "audit-logs"
                  : active === "system-settings" || active === "settings"
                  ? "system-settings"
                  : "admin-overview"
              }
            />
          ) : active === "analytics-overview" ||
            active === "hospital-operations" ||
            active === "clinical-reports" ||
            active === "financial-analytics" ||
            active === "report-builder" ||
            active === "export-history" ||
            active === "analytics" ||
            active === "reports" ||
            active === "department-reports" ||
            active === "performance" ||
            (roleId === "analytics" && active === "home") ? (
            <AnalyticsPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              initialTab={
                active === "hospital-operations" || active === "reports" || active === "department-reports" || active === "performance"
                  ? "hospital-operations"
                  : active === "clinical-reports"
                  ? "clinical-reports"
                  : active === "financial-analytics"
                  ? "financial-analytics"
                  : active === "report-builder"
                  ? "report-builder"
                  : active === "export-history"
                  ? "export-history"
                  : "analytics-overview"
              }
            />
          ) : active === "billing-overview" || active === "invoices" || active === "payments" || active === "payment-history" || active === "receipts" || active === "financial-reports" || (roleId === "cashier" && active === "home") ? (
            <HospitalBillingPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
              initialTab={
                active === "invoices"
                  ? "invoices"
                  : active === "payments"
                  ? "payments"
                  : active === "payment-history" || active === "receipts"
                  ? "payment-history"
                  : active === "financial-reports"
                  ? "reports"
                  : "overview"
              }
            />
          ) : active === "stock-movements" ? (
            <StockMovementsPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "medication-stock" || active === "medicine-inventory" ? (
            <MedicineInventoryPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "pharmacy-dashboard" || active === "pharmacy" || active === "expiry-monitoring" || active === "dispensing-history" || (roleId === "pharmacy" && active === "home") ? (
            <PharmacyDashboardPage
              state={view}
              permissions={permissions}
              onNavigate={navigate}
            />
          ) : active === "ux-quality-refinement" || active === "refinement" ? (
            <UXQualityRefinementPage onNavigate={navigate} />
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
                description={role.description}
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
              </div>
              <RoleDashboardLayout>
                <RoleDashboardCard
                  title="Work Queue"
                  className="permission-queue-card"
                >
                  {view === "loading" ? (
                    <div
                      className="permission-loading"
                      role="status"
                      aria-busy="true"
                    >
                      <Icon name="clock" size={24} />
                      <Text>Loading...</Text>
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
                        <span>TASK</span>
                        <span>STATUS</span>
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
                                <small>{module}</small>
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
                  {sessionUser?.avatarInitials || (roleId === "emergency" ? "AL" : roleId === "inpatient" ? "BW" : roleId === "nurse" ? "RK" : roleId === "doctor" ? "DA" : roleId === "cashier" ? "AK" : roleId === "pharmacy" ? "HB" : roleId === "lab" ? "TG" : "AT")}
                </span>
                <div>
                  <Heading level={3}>
                    {sessionUser?.name || (roleId === "emergency" ? "Dr. Aster Lemma" : roleId === "inpatient" ? "Sr. Bethlehem Worku" : roleId === "nurse" ? "Nurse Rahel Kebede" : roleId === "cashier" ? "Almaz Kebede" : roleId === "pharmacy" ? "Hiwot Bekele" : roleId === "doctor" ? "Dr. Daniel Abate" : "Demo Staff")}
                  </Heading>
                  <RoleContextIndicator role={role} />
                  <small>
                    {sessionUser?.staffId || (roleId === "emergency" ? "ORH-EM-011" : roleId === "inpatient" ? "ORH-IP-027" : roleId === "cashier" ? "ORH-CSH-021" : roleId === "pharmacy" ? "ORH-PHARM-007" : "ORH-NR-042")} · {sessionUser?.department || (roleId === "emergency" ? "Emergency Center" : roleId === "inpatient" ? "Inpatient Services" : roleId === "cashier" ? "Finance & Billing" : roleId === "pharmacy" ? "Main Pharmacy" : "Hospital Staff")}
                  </small>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 16px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--teal)" }}
                  checked={compact}
                  onChange={(event) => setCompact(event.target.checked)}
                />
                <span>Compact workspace layout</span>
              </label>

              <div
                style={{
                  background: "var(--mist)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  marginTop: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Icon name="lock" size={14} style={{ color: "var(--teal)" }} />
                  <strong style={{ fontSize: "12px", color: "var(--navy)" }}>Role Security &amp; Access Control</strong>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                  This session is strictly bound to your assigned role ({role.role}). Cross-role switching is disabled. To access another staff workspace, sign out and authenticate with the appropriate credentials.
                </p>
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
                  "Permitted role actions",
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
