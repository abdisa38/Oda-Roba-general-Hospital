// Oda Roba Hospital Information Management System (ORHIMS)
// Phase 10: Complete Administration & System Management Workspace
// Fulfills all requirements: Zero emojis, Figma navy/teal palette, Lucide line icons,
// User Management, Roles & Permissions Matrix, Department Management, Hospital Configuration,
// Read-only Audit Logs with Diffs, and System Settings.

import { useState, useMemo } from "react"
import Icon from "../Icon"
import {
  AdminUser,
  AdminUserStatus,
  AdminRole,
  AdminDepartment,
  HospitalProfile,
  LocalizationSettings,
  OperationalNumbering,
  AuditLogEntry,
  SystemSettings,
  PERMISSION_MODULES,
  PermissionAction,
  DEMO_ADMIN_USERS,
  DEMO_ADMIN_ROLES,
  DEMO_ADMIN_DEPARTMENTS,
  DEMO_HOSPITAL_PROFILE,
  DEMO_LOCALIZATION_SETTINGS,
  DEMO_OPERATIONAL_NUMBERING,
  DEMO_AUDIT_LOGS,
  DEMO_SYSTEM_SETTINGS,
} from "./model"
import "./administration.css"

export type AdminTab =
  | "admin-overview"
  | "user-management"
  | "roles-permissions"
  | "department-management"
  | "hospital-configuration"
  | "audit-logs"
  | "system-settings"

interface AdministrationPageProps {
  initialTab?: AdminTab
  permissions?: Set<string>
  onNavigate?: (destination: string) => void
  state?: string
}

export default function AdministrationPage({
  initialTab = "admin-overview",
  onNavigate,
}: AdministrationPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab)

  // -------------------------------------------------------------
  // STATE MANAGEMENT FOR ADMIN MODULES
  // -------------------------------------------------------------
  const [users, setUsers] = useState<AdminUser[]>(DEMO_ADMIN_USERS)
  const [roles, setRoles] = useState<AdminRole[]>(DEMO_ADMIN_ROLES)
  const [departments, setDepartments] = useState<AdminDepartment[]>(DEMO_ADMIN_DEPARTMENTS)
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(DEMO_HOSPITAL_PROFILE)
  const [localization, setLocalization] = useState<LocalizationSettings>(DEMO_LOCALIZATION_SETTINGS)
  const [numbering, setNumbering] = useState<OperationalNumbering>(DEMO_OPERATIONAL_NUMBERING)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEMO_AUDIT_LOGS)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEMO_SYSTEM_SETTINGS)

  // Notifications / Feedback toast
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "warning" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "warning" | "error" = "success") => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // -------------------------------------------------------------
  // USER MANAGEMENT STATE & MODALS
  // -------------------------------------------------------------
  const [userSearch, setUserSearch] = useState("")
  const [userDeptFilter, setUserDeptFilter] = useState("all")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  // Edit User Form State
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserPhone, setEditUserPhone] = useState("")
  const [editUserDept, setEditUserDept] = useState("DEP-MED")
  const [editUserRole, setEditUserRole] = useState("role-doctor")
  const [editUserStatus, setEditUserStatus] = useState<AdminUserStatus>("active")

  // Create User Form State
  const [newUserName, setNewUserName] = useState("")
  const [newUserUsername, setNewUserUsername] = useState("")
  const [newUserStaffId, setNewUserStaffId] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPhone, setNewUserPhone] = useState("+251 ")
  const [newUserDept, setNewUserDept] = useState("DEP-MED")
  const [newUserRole, setNewUserRole] = useState("role-doctor")
  const [newUserSetupMethod, setNewUserSetupMethod] = useState<"invitation" | "temporary" | "manual">("invitation")
  const [newUserNotes, setNewUserNotes] = useState("")

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.staffId.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      const matchDept = userDeptFilter === "all" || u.departmentId === userDeptFilter
      const matchRole = userRoleFilter === "all" || u.roleId === userRoleFilter
      const matchStatus = userStatusFilter === "all" || u.status === userStatusFilter
      return matchSearch && matchDept && matchRole && matchStatus
    })
  }, [users, userSearch, userDeptFilter, userRoleFilter, userStatusFilter])

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserStaffId.trim()) {
      showToast("Please fill in all mandatory staff account fields.", "warning")
      return
    }

    const deptObj = departments.find((d) => d.id === newUserDept)
    const roleObj = roles.find((r) => r.id === newUserRole)

    const created: AdminUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      staffId: newUserStaffId.trim().toUpperCase(),
      email: newUserEmail.trim() || `${newUserUsername.trim().toLowerCase()}@orhims.et`,
      phone: newUserPhone.trim(),
      departmentId: newUserDept,
      departmentName: deptObj?.name || "General Department",
      roleId: newUserRole,
      roleName: roleObj?.name || "General Staff",
      status: "active",
      lastLogin: "Never (Pending initial setup)",
      createdAt: "Today",
      twoFactorEnabled: false,
      notes: newUserNotes.trim() || `Setup method: ${newUserSetupMethod}. Provisioned by Dr. Yohannes Haile.`,
    }

    setUsers([created, ...users])
    // Log audit event
    const audit: AuditLogEntry = {
      id: `AUD-${Math.floor(90000 + Math.random() * 9999)}`,
      timestamp: "Just now",
      actor: "Dr. Yohannes Haile (admin)",
      actorRole: "System & Hospital Administrator",
      ipAddress: "10.12.4.15 (Terminal Admin-01)",
      module: "User Management",
      action: "Staff Account Provisioned",
      recordType: "Staff User",
      recordReference: `${created.id} (${created.name})`,
      outcome: "success",
      details: `Created new staff account with ${created.roleName} in ${created.departmentName}.`,
    }
    setAuditLogs([audit, ...auditLogs])

    setShowCreateUserModal(false)
    setNewUserName("")
    setNewUserUsername("")
    setNewUserStaffId("")
    setNewUserEmail("")
    showToast(`Staff account for ${created.name} successfully created.`, "success")
  }

  const handleToggleUserStatus = (user: AdminUser) => {
    if (user.isProtectedAdmin) {
      showToast("Protected administrative account cannot be deactivated.", "warning")
      return
    }
    const newStatus: AdminUserStatus = user.status === "active" ? "inactive" : "active"
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, status: newStatus })
    }
  }

  const handleOpenEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setEditUserName(user.name)
    setEditUserEmail(user.email)
    setEditUserPhone(user.phone || "")
    setEditUserDept(user.departmentId)
    setEditUserRole(user.roleId)
    setEditUserStatus(user.status)
    setShowEditUserModal(true)
  }

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!editUserName.trim()) {
      showToast("Please enter staff member full name.", "warning")
      return
    }
    const deptObj = departments.find((d) => d.id === editUserDept)
    const roleObj = roles.find((r) => r.id === editUserRole)
    const updated: AdminUser = {
      ...selectedUser,
      name: editUserName.trim(),
      email: editUserEmail.trim() || selectedUser.email,
      phone: editUserPhone.trim(),
      departmentId: editUserDept,
      departmentName: deptObj?.name || selectedUser.departmentName,
      roleId: editUserRole,
      roleName: roleObj?.name || selectedUser.roleName,
      status: editUserStatus,
    }
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
    setShowEditUserModal(false)
    setSelectedUser(null)
    showToast(`Staff account for ${updated.name} updated successfully.`, "success")
  }

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return
    const id = deletingUser.id
    const name = deletingUser.name
    setUsers(users.filter((u) => u.id !== id))
    if (selectedUser?.id === id) setSelectedUser(null)
    setDeletingUser(null)
    showToast(`Staff account ${name} (${id}) has been removed.`, "info")
  }

  // -------------------------------------------------------------
  // ROLES & PERMISSIONS STATE
  // -------------------------------------------------------------
  const [selectedRole, setSelectedRole] = useState<AdminRole>(roles[0])
  const [rolePermissionsDraft, setRolePermissionsDraft] = useState<Record<string, PermissionAction[]>>(
    roles[0].permissions
  )
  const [isPermChanged, setIsPermChanged] = useState(false)
  const [showRoleConfirmModal, setShowRoleConfirmModal] = useState(false)

  const handleSelectRole = (r: AdminRole) => {
    setSelectedRole(r)
    setRolePermissionsDraft(r.permissions)
    setIsPermChanged(false)
  }

  const handleTogglePermission = (moduleKey: string, action: PermissionAction) => {
    const currentActions = rolePermissionsDraft[moduleKey] || []
    let updatedActions: PermissionAction[]
    if (currentActions.includes(action)) {
      updatedActions = currentActions.filter((a) => a !== action)
    } else {
      updatedActions = [...currentActions, action]
    }
    setRolePermissionsDraft({
      ...rolePermissionsDraft,
      [moduleKey]: updatedActions,
    })
    setIsPermChanged(true)
  }

  const handleToggleModuleAll = (moduleKey: string, supportedActions: PermissionAction[]) => {
    const currentActions = rolePermissionsDraft[moduleKey] || []
    const allSelected = supportedActions.every((a) => currentActions.includes(a))
    setRolePermissionsDraft({
      ...rolePermissionsDraft,
      [moduleKey]: allSelected ? [] : [...supportedActions],
    })
    setIsPermChanged(true)
  }

  const handleSaveRolePermissions = () => {
    if (selectedRole.isSystemProtected && selectedRole.id === "role-admin") {
      // Safety check: ensure user_admin and hospital_config view privileges remain
      if (!rolePermissionsDraft.user_admin?.includes("view")) {
        showToast("System Administrator role must retain user administration permissions.", "error")
        return
      }
    }
    setRoles(
      roles.map((r) =>
        r.id === selectedRole.id
          ? { ...r, permissions: rolePermissionsDraft, lastUpdated: "Today" }
          : r
      )
    )
    setSelectedRole({ ...selectedRole, permissions: rolePermissionsDraft, lastUpdated: "Today" })
    setIsPermChanged(false)
    setShowRoleConfirmModal(false)

    // Audit log entry
    const audit: AuditLogEntry = {
      id: `AUD-${Math.floor(90000 + Math.random() * 9999)}`,
      timestamp: "Just now",
      actor: "Dr. Yohannes Haile (admin)",
      actorRole: "System & Hospital Administrator",
      ipAddress: "10.12.4.15 (Terminal Admin-01)",
      module: "Roles & Permissions",
      action: "Role Permission Matrix Modified",
      recordType: "Role Definition",
      recordReference: `${selectedRole.id} (${selectedRole.name})`,
      outcome: "success",
      details: `Updated permission grants for ${selectedRole.name}. Affects ${selectedRole.userCount} assigned staff.`,
    }
    setAuditLogs([audit, ...auditLogs])
    showToast(`Permissions for role "${selectedRole.name}" updated successfully.`, "success")
  }

  // -------------------------------------------------------------
  // DEPARTMENT MANAGEMENT STATE
  // -------------------------------------------------------------
  const [deptSearch, setDeptSearch] = useState("")
  const [deptTypeFilter, setDeptTypeFilter] = useState("all")
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false)
  const [selectedDept, setSelectedDept] = useState<AdminDepartment | null>(null)

  // New Department Form
  const [newDeptCode, setNewDeptCode] = useState("")
  const [newDeptName, setNewDeptName] = useState("")
  const [newDeptType, setNewDeptType] = useState<AdminDepartment["type"]>("clinical")
  const [newDeptHead, setNewDeptHead] = useState("")
  const [newDeptLocation, setNewDeptLocation] = useState("")
  const [newDeptPhone, setNewDeptPhone] = useState("+251 22 665 01")
  const [newDeptDesc, setNewDeptDesc] = useState("")

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.code.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.headOfDepartment.toLowerCase().includes(deptSearch.toLowerCase())
      const matchType = deptTypeFilter === "all" || d.type === deptTypeFilter
      return matchSearch && matchType
    })
  }, [departments, deptSearch, deptTypeFilter])

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptCode.trim() || !newDeptName.trim()) {
      showToast("Department code and name are required.", "warning")
      return
    }

    const codeExists = departments.some((d) => d.code.toUpperCase() === newDeptCode.trim().toUpperCase())
    if (codeExists) {
      showToast(`Department code "${newDeptCode.toUpperCase()}" already exists. Codes must be unique.`, "error")
      return
    }

    const created: AdminDepartment = {
      id: `DEP-${newDeptCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5)}`,
      code: newDeptCode.trim().toUpperCase(),
      name: newDeptName.trim(),
      type: newDeptType,
      headOfDepartment: newDeptHead.trim() || "Unassigned",
      staffCount: 1,
      location: newDeptLocation.trim() || "Main Hospital Complex",
      phone: newDeptPhone.trim(),
      status: "active",
      establishedDate: "Today",
      description: newDeptDesc.trim() || "Hospital organizational department.",
    }

    setDepartments([...departments, created])
    setShowCreateDeptModal(false)
    setNewDeptCode("")
    setNewDeptName("")
    setNewDeptHead("")
    setNewDeptLocation("")
    setNewDeptDesc("")
    showToast(`Department "${created.name}" created successfully.`, "success")
  }

  // -------------------------------------------------------------
  // HOSPITAL CONFIGURATION STATE
  // -------------------------------------------------------------
  const [profileDraft, setProfileDraft] = useState<HospitalProfile>(hospitalProfile)
  const [localDraft, setLocalDraft] = useState<LocalizationSettings>(localization)
  const [numDraft, setNumDraft] = useState<OperationalNumbering>(numbering)
  const [showConfigConfirmModal, setShowConfigConfirmModal] = useState(false)

  const handleSaveHospitalConfig = () => {
    setHospitalProfile(profileDraft)
    setLocalization(localDraft)
    setNumbering(numDraft)
    setShowConfigConfirmModal(false)

    const audit: AuditLogEntry = {
      id: `AUD-${Math.floor(90000 + Math.random() * 9999)}`,
      timestamp: "Just now",
      actor: "Dr. Yohannes Haile (admin)",
      actorRole: "System & Hospital Administrator",
      ipAddress: "10.12.4.15 (Terminal Admin-01)",
      module: "Hospital Configuration",
      action: "Hospital Profile & Regional Configuration Saved",
      recordType: "Institutional Configuration",
      recordReference: "Hospital Master Record",
      outcome: "success",
      details: "Updated hospital facility profile, emergency contact lines, and localization preferences.",
    }
    setAuditLogs([audit, ...auditLogs])
    showToast("Hospital profile and operational configuration successfully saved.", "success")
  }

  // -------------------------------------------------------------
  // AUDIT LOGS STATE
  // -------------------------------------------------------------
  const [auditSearch, setAuditSearch] = useState("")
  const [auditModuleFilter, setAuditModuleFilter] = useState("all")
  const [auditOutcomeFilter, setAuditOutcomeFilter] = useState("all")
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null)

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((a) => {
      const matchSearch =
        a.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.recordReference.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.details.toLowerCase().includes(auditSearch.toLowerCase())
      const matchModule = auditModuleFilter === "all" || a.module === auditModuleFilter
      const matchOutcome = auditOutcomeFilter === "all" || a.outcome === auditOutcomeFilter
      return matchSearch && matchModule && matchOutcome
    })
  }, [auditLogs, auditSearch, auditModuleFilter, auditOutcomeFilter])

  // -------------------------------------------------------------
  // SYSTEM SETTINGS STATE
  // -------------------------------------------------------------
  const [settingsDraft, setSettingsDraft] = useState<SystemSettings>(systemSettings)
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSystemSettings(settingsDraft)
    setIsSettingsChanged(false)

    const audit: AuditLogEntry = {
      id: `AUD-${Math.floor(90000 + Math.random() * 9999)}`,
      timestamp: "Just now",
      actor: "Dr. Yohannes Haile (admin)",
      actorRole: "System & Hospital Administrator",
      ipAddress: "10.12.4.15 (Terminal Admin-01)",
      module: "Hospital Configuration",
      action: "System Security & Session Parameters Updated",
      recordType: "System Settings",
      recordReference: "Security Policy",
      outcome: "success",
      details: `Session idle timeout set to ${settingsDraft.sessionTimeoutMinutes} min. Lockout attempts: ${settingsDraft.accountLockoutAttempts}.`,
    }
    setAuditLogs([audit, ...auditLogs])
    showToast("System settings and security policy updated successfully.", "success")
  }

  return (
    <div className="admin-workspace">
      {/* Toast Feedback */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 2000,
            backgroundColor:
              feedback.type === "success"
                ? "#065f46"
                : feedback.type === "warning"
                ? "#92400e"
                : "#991b1b",
            color: "#ffffff",
            padding: "0.75rem 1.25rem",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon name={feedback.type === "success" ? "check" : "alert-triangle"} size={18} />
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-title">
          <div className="admin-kpi-icon" style={{ width: 40, height: 40 }}>
            <Icon name="shield" size={22} />
          </div>
          <div>
            <h1>Administration</h1>
          </div>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setActiveTab("audit-logs")
              showToast("Switched to Audit Logs view.", "success")
            }}
          >
            <Icon name="clock" size={16} />
            Audit Trail
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateUserModal(true)}
          >
            <Icon name="user-plus" size={16} />
            New Staff User
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <nav className="admin-tabs" aria-label="Administration Modules">
        <button
          className={`admin-tab ${activeTab === "admin-overview" ? "active" : ""}`}
          onClick={() => setActiveTab("admin-overview")}
        >
          <Icon name="grid" size={16} />
          Administration Overview
        </button>
        <button
          className={`admin-tab ${activeTab === "user-management" ? "active" : ""}`}
          onClick={() => setActiveTab("user-management")}
        >
          <Icon name="user" size={16} />
          User Management ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "roles-permissions" ? "active" : ""}`}
          onClick={() => setActiveTab("roles-permissions")}
        >
          <Icon name="shield" size={16} />
          Roles & Permissions ({roles.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "department-management" ? "active" : ""}`}
          onClick={() => setActiveTab("department-management")}
        >
          <Icon name="building" size={16} />
          Department Management ({departments.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "hospital-configuration" ? "active" : ""}`}
          onClick={() => setActiveTab("hospital-configuration")}
        >
          <Icon name="sliders" size={16} />
          Hospital Configuration
        </button>
        <button
          className={`admin-tab ${activeTab === "audit-logs" ? "active" : ""}`}
          onClick={() => setActiveTab("audit-logs")}
        >
          <Icon name="shield" size={16} />
          Audit Logs ({auditLogs.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "system-settings" ? "active" : ""}`}
          onClick={() => setActiveTab("system-settings")}
        >
          <Icon name="settings" size={16} />
          System Settings
        </button>
      </nav>

      {/* ========================================================= */}
      {/* 1. ADMINISTRATION OVERVIEW DASHBOARD                     */}
      {/* ========================================================= */}
      {activeTab === "admin-overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* KPI Summary Cards */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Icon name="user" size={22} />
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-value">{users.length}</span>
                <span className="admin-kpi-label">Staff Users</span>
                <span className="admin-kpi-sub">
                  {users.filter((u) => u.status === "active").length} Active
                </span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Icon name="building" size={22} />
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-value">{departments.length}</span>
                <span className="admin-kpi-label">Departments</span>
                <span className="admin-kpi-sub">
                  {departments.filter((d) => d.status === "active").length} Active
                </span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon">
                <Icon name="shield" size={22} />
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-value">{roles.length}</span>
                <span className="admin-kpi-label">Roles</span>
                <span className="admin-kpi-sub">Role profiles</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon kpi-success">
                <Icon name="database" size={22} />
              </div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-value">1,482</span>
                <span className="admin-kpi-label">Audit Events</span>
                <span className="admin-kpi-sub">Logged events</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="grid" size={18} />
                  Quick Actions
                </h3>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", height: "auto" }}
                onClick={() => setShowCreateUserModal(true)}
              >
                <div className="admin-kpi-icon" style={{ width: 32, height: 32 }}>
                  <Icon name="user-plus" size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, color: "#142e42" }}>Provision User</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Create staff credentials</div>
                </div>
              </button>

              <button
                className="admin-btn admin-btn-secondary"
                style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", height: "auto" }}
                onClick={() => setActiveTab("roles-permissions")}
              >
                <div className="admin-kpi-icon" style={{ width: 32, height: 32 }}>
                  <Icon name="shield" size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, color: "#142e42" }}>Configure Roles</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Access control matrix</div>
                </div>
              </button>

              <button
                className="admin-btn admin-btn-secondary"
                style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", height: "auto" }}
                onClick={() => setActiveTab("department-management")}
              >
                <div className="admin-kpi-icon" style={{ width: 32, height: 32 }}>
                  <Icon name="building" size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, color: "#142e42" }}>Manage Departments</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Units & department heads</div>
                </div>
              </button>

              <button
                className="admin-btn admin-btn-secondary"
                style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", height: "auto" }}
                onClick={() => setActiveTab("hospital-configuration")}
              >
                <div className="admin-kpi-icon" style={{ width: 32, height: 32 }}>
                  <Icon name="sliders" size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, color: "#142e42" }}>Hospital Profile</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Facility & localization</div>
                </div>
              </button>

              <button
                className="admin-btn admin-btn-secondary"
                style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", height: "auto" }}
                onClick={() => setActiveTab("audit-logs")}
              >
                <div className="admin-kpi-icon" style={{ width: 32, height: 32 }}>
                  <Icon name="shield" size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, color: "#142e42" }}>Audit Logs</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Inspect security history</div>
                </div>
              </button>
            </div>
          </div>

          {/* Staff Accounts Overview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="user" size={18} />
                  Active Staff Accounts Overview
                </h3>
              </div>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                onClick={() => setActiveTab("user-management")}
              >
                View All Users
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 6).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#142e42" }}>{u.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {u.staffId} · @{u.username}
                        </div>
                      </td>
                      <td>{u.departmentName}</td>
                      <td>
                        <span className="admin-badge admin-badge-info">{u.roleName}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            u.status === "active"
                              ? "admin-badge-active"
                              : u.status === "inactive"
                              ? "admin-badge-inactive"
                              : "admin-badge-suspended"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. USER MANAGEMENT WORKSPACE                              */}
      {/* ========================================================= */}
      {activeTab === "user-management" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-search-input">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search staff by name, staff ID, username, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button
                  className="admin-icon-btn"
                  onClick={() => setUserSearch("")}
                  title="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            <select
              className="admin-select"
              value={userDeptFilter}
              onChange={(e) => setUserDeptFilter(e.target.value)}
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="admin-select"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="all">All Roles ({roles.length})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              className="admin-select"
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowCreateUserModal(true)}
              style={{ marginLeft: "auto" }}
            >
              <Icon name="user-plus" size={16} />
              Add Staff Member
            </button>
          </div>

          {/* User Directory Table */}
          <div className="admin-card">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Staff ID & Username</th>
                    <th>Department</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Last Login</th>
                    <th>2FA</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b" }}>
                        <Icon name="search" size={24} />
                        <div style={{ marginTop: "0.5rem", fontWeight: 600 }}>No staff accounts match your filters.</div>
                        <p style={{ fontSize: "0.8rem", margin: "0.25rem 0 0 0" }}>
                          Try clearing the search query or resetting department and status filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: "#142e42" }}>{user.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{user.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#087e83" }}>{user.staffId}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>@{user.username}</div>
                        </td>
                        <td>{user.departmentName}</td>
                        <td>
                          <span className="admin-badge admin-badge-info">{user.roleName}</span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${
                              user.status === "active"
                                ? "admin-badge-active"
                                : user.status === "inactive"
                                ? "admin-badge-inactive"
                                : "admin-badge-suspended"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{user.lastLogin}</td>
                        <td>
                          {user.twoFactorEnabled ? (
                            <span style={{ color: "#059669", fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                              <Icon name="check" size={14} /> Enabled
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Optional</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="admin-icon-btn"
                              title="Inspect user details and permissions"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Icon name="eye" size={16} />
                            </button>
                            <button
                              className="admin-icon-btn"
                              title="Edit user details"
                              onClick={() => handleOpenEditUser(user)}
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            {!user.isProtectedAdmin && (
                              <>
                                <button
                                  className={`admin-icon-btn ${user.status === "active" ? "danger" : ""}`}
                                  title={user.status === "active" ? "Deactivate staff account" : "Reactivate staff account"}
                                  onClick={() => handleToggleUserStatus(user)}
                                >
                                  <Icon name={user.status === "active" ? "x-circle" : "check"} size={16} />
                                </button>
                                <button
                                  className="admin-icon-btn danger"
                                  title="Delete staff account"
                                  onClick={() => setDeletingUser(user)}
                                >
                                  <Icon name="x" size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ROLES & PERMISSIONS WORKSPACE                          */}
      {/* ========================================================= */}
      {activeTab === "roles-permissions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="admin-notice admin-notice-info">
            <Icon name="info" size={20} />
            <div>
              <strong>Principle of Least Privilege Enforcement:</strong> Roles define granular access to clinical records,
              laboratory tests, pharmacy dispensing, billing, and system administration. Modifying a role applies instantly across all assigned staff accounts.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "flex-start" }}>
            {/* Roles Sidebar / Directory */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3>
                    <Icon name="shield" size={18} />
                    Configured Roles ({roles.length})
                  </h3>
                  <p>Select a role to inspect or edit permissions</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {roles.map((r) => {
                  const isSelected = selectedRole.id === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRole(r)}
                      style={{
                        padding: "1rem 1.25rem",
                        textAlign: "left",
                        border: "none",
                        borderBottom: "1px solid #eef3f3",
                        background: isSelected ? "#e6f3f3" : "#ffffff",
                        borderLeft: isSelected ? "4px solid #087e83" : "4px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#142e42", fontSize: "0.9rem" }}>{r.name}</span>
                        <span className="admin-badge admin-badge-info" style={{ fontSize: "0.7rem" }}>
                          {r.userCount} staff
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.3rem 0 0 0", lineHeight: 1.35 }}>
                        {r.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Role Permission Matrix Editor */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3>{selectedRole.name}</h3>
                    {selectedRole.isSystemProtected && (
                      <span className="admin-badge admin-badge-warning" style={{ fontSize: "0.7rem" }}>
                        Protected System Role
                      </span>
                    )}
                  </div>
                  <p>{selectedRole.description}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {isPermChanged && (
                    <span style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: 600 }}>
                      Unsaved permission changes
                    </span>
                  )}
                  <button
                    className="admin-btn admin-btn-secondary"
                    disabled={!isPermChanged}
                    onClick={() => {
                      setRolePermissionsDraft(selectedRole.permissions)
                      setIsPermChanged(false)
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="admin-btn admin-btn-primary"
                    disabled={!isPermChanged}
                    onClick={() => setShowRoleConfirmModal(true)}
                  >
                    <Icon name="check" size={16} />
                    Save Permissions Matrix
                  </button>
                </div>
              </div>

              <div className="admin-card-body" style={{ padding: 0 }}>
                <div className="admin-perm-matrix">
                  <table className="admin-perm-table">
                    <thead>
                      <tr>
                        <th style={{ width: "35%" }}>Functional Module</th>
                        <th>View</th>
                        <th>Create</th>
                        <th>Edit</th>
                        <th>Approve</th>
                        <th>Complete</th>
                        <th>Export</th>
                        <th>Configure</th>
                        <th>Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_MODULES.map((mod) => {
                        const currentActions = rolePermissionsDraft[mod.key] || []
                        const allSelected = mod.supportedActions.every((a) => currentActions.includes(a))

                        return (
                          <tr key={mod.key}>
                            <td>
                              <div style={{ fontWeight: 700, color: "#142e42" }}>{mod.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{mod.description}</div>
                            </td>
                            {(["view", "create", "edit", "approve", "complete", "export", "configure"] as PermissionAction[]).map(
                              (action) => {
                                const isSupported = mod.supportedActions.includes(action)
                                const isChecked = currentActions.includes(action)

                                return (
                                  <td key={action}>
                                    {isSupported ? (
                                      <input
                                        type="checkbox"
                                        className="admin-perm-checkbox"
                                        checked={isChecked}
                                        onChange={() => handleTogglePermission(mod.key, action)}
                                        aria-label={`${action} in ${mod.name}`}
                                      />
                                    ) : (
                                      <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>
                                    )}
                                  </td>
                                )
                              }
                            )}
                            <td>
                              <button
                                className="admin-btn admin-btn-secondary"
                                style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                                onClick={() => handleToggleModuleAll(mod.key, mod.supportedActions)}
                              >
                                {allSelected ? "Clear" : "All"}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DEPARTMENT MANAGEMENT WORKSPACE                        */}
      {/* ========================================================= */}
      {activeTab === "department-management" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-search-input">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search departments by name, code, or department head..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
              />
              {deptSearch && (
                <button
                  className="admin-icon-btn"
                  onClick={() => setDeptSearch("")}
                  title="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            <select
              className="admin-select"
              value={deptTypeFilter}
              onChange={(e) => setDeptTypeFilter(e.target.value)}
            >
              <option value="all">All Department Types</option>
              <option value="clinical">Clinical Units</option>
              <option value="inpatient">Inpatient Wards</option>
              <option value="diagnostic">Diagnostic & Labs</option>
              <option value="support">Support & Pharmacy</option>
              <option value="administrative">Administrative & Finance</option>
            </select>

            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowCreateDeptModal(true)}
              style={{ marginLeft: "auto" }}
            >
              <Icon name="plus" size={16} />
              Create Department
            </button>
          </div>

          {/* Department Directory Table */}
          <div className="admin-card">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Classification</th>
                    <th>Department Head</th>
                    <th>Staff Count</th>
                    <th>Physical Location</th>
                    <th>Contact Ext.</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#142e42" }}>{dept.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{dept.description}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#087e83" }}>
                          {dept.code}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-info">{dept.type}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{dept.headOfDepartment}</td>
                      <td>{dept.staffCount} staff</td>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{dept.location}</td>
                      <td style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>{dept.phone}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            dept.status === "active" ? "admin-badge-active" : "admin-badge-inactive"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="admin-icon-btn"
                            title="View department details"
                            onClick={() => setSelectedDept(dept)}
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <button
                            className="admin-icon-btn"
                            title="Edit department info"
                            onClick={() => {
                              setSelectedDept(dept)
                              showToast(`Editing ${dept.name}`, "info" as any)
                            }}
                          >
                            <Icon name="edit" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. HOSPITAL CONFIGURATION WORKSPACE                       */}
      {/* ========================================================= */}
      {activeTab === "hospital-configuration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Hospital Profile Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="building" size={18} />
                  Institutional Hospital Profile
                </h3>
                <p>Official legal identity and communication credentials for Oda Roba General Hospital</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Official Hospital Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.name}
                    onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Facility Classification</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.institutionType}
                    onChange={(e) => setProfileDraft({ ...profileDraft, institutionType: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Geographic Location & Region</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.location}
                    onChange={(e) => setProfileDraft({ ...profileDraft, location: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Postal / Mailing Address</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.postalAddress}
                    onChange={(e) => setProfileDraft({ ...profileDraft, postalAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Telephone Exchange</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Emergency & Trauma Hotline</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.emergencyHotline}
                    onChange={(e) => setProfileDraft({ ...profileDraft, emergencyHotline: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>MOH Facility Code</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={profileDraft.mohFacilityCode}
                    onChange={(e) => setProfileDraft({ ...profileDraft, mohFacilityCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional & Localization Settings */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="sliders" size={18} />
                  Regional, Language & Localization Configuration
                </h3>
                <p>Date format, calendar handling, Ethiopian context, and currency display standards</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Hospital Operational Time Zone</label>
                  <select
                    className="admin-form-select"
                    value={localDraft.timeZone}
                    onChange={(e) => setLocalDraft({ ...localDraft, timeZone: e.target.value })}
                  >
                    <option value="Africa/Addis_Ababa (EAT UTC+3)">Africa/Addis_Ababa (EAT UTC+3) — Standard</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Primary Clinical Documentation Language</label>
                  <select
                    className="admin-form-select"
                    value={localDraft.primaryLanguage}
                    onChange={(e) => setLocalDraft({ ...localDraft, primaryLanguage: e.target.value })}
                  >
                    <option value="English (Clinical Documentation Standard)">English (Clinical Documentation Standard)</option>
                    <option value="Afaan Oromoo">Afaan Oromoo</option>
                    <option value="Amharic">Amharic</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Standard Date Format</label>
                  <select
                    className="admin-form-select"
                    value={localDraft.dateFormat}
                    onChange={(e) => setLocalDraft({ ...localDraft, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/10/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Time Format</label>
                  <select
                    className="admin-form-select"
                    value={localDraft.timeFormat}
                    onChange={(e) => setLocalDraft({ ...localDraft, timeFormat: e.target.value })}
                  >
                    <option value="24-Hour (Hospital Standard)">24-Hour (Hospital Standard e.g. 17:45)</option>
                    <option value="12-Hour AM/PM">12-Hour AM/PM (e.g. 05:45 PM)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Billing & Accounting Currency</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={localDraft.currency}
                    readOnly
                    style={{ backgroundColor: "#f8fafb" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Identifier Sequences */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="file-text" size={18} />
                  Operational Identifier Formats & Prefix Patterns
                </h3>
                <p>Governs sequential numbers generated across patients, visits, admissions, and financial receipts</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Patient MRN Format</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={numDraft.patientMrnPattern}
                    onChange={(e) => setNumDraft({ ...numDraft, patientMrnPattern: e.target.value })}
                  />
                  <span className="admin-form-help">Format pattern for medical record numbers</span>
                </div>
                <div className="admin-form-group">
                  <label>Admission Sequence Prefix</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={numDraft.admissionPrefix}
                    onChange={(e) => setNumDraft({ ...numDraft, admissionPrefix: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Invoice Prefix</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={numDraft.invoicePrefix}
                    onChange={(e) => setNumDraft({ ...numDraft, invoicePrefix: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => setShowConfigConfirmModal(true)}
                >
                  <Icon name="check" size={16} />
                  Review & Save Hospital Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. AUDIT LOGS & ACTIVITY MONITORING                       */}
      {/* ========================================================= */}
      {activeTab === "audit-logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Header Notice */}
          <div className="admin-notice admin-notice-info">
            <Icon name="lock" size={20} />
            <div>
              <strong>Immutable System Audit Trail:</strong> Audit events are recorded chronologically and cannot be
              altered, overwritten, or deleted. All logins, clinical approvals, bed reassignments, billing actions, and administrative changes are captured.
            </div>
          </div>

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-search-input">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, record reference, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
              {auditSearch && (
                <button
                  className="admin-icon-btn"
                  onClick={() => setAuditSearch("")}
                  title="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            <select
              className="admin-select"
              value={auditModuleFilter}
              onChange={(e) => setAuditModuleFilter(e.target.value)}
            >
              <option value="all">All Modules</option>
              <option value="User Management">User Management</option>
              <option value="Roles & Permissions">Roles & Permissions</option>
              <option value="Inpatient & Emergency">Inpatient & Emergency</option>
              <option value="Billing & Finance">Billing & Finance</option>
              <option value="Hospital Configuration">Hospital Configuration</option>
            </select>

            <select
              className="admin-select"
              value={auditOutcomeFilter}
              onChange={(e) => setAuditOutcomeFilter(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </select>

            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => showToast("Exporting signed audit trail CSV...", "success")}
              style={{ marginLeft: "auto" }}
            >
              <Icon name="download" size={16} />
              Export Audit Trail (CSV)
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="admin-card">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor Identity</th>
                    <th>Action Performed</th>
                    <th>Module</th>
                    <th>Record Reference</th>
                    <th>Workstation IP</th>
                    <th>Outcome</th>
                    <th style={{ textAlign: "right" }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {log.timestamp}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#142e42" }}>{log.actor}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{log.actorRole}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#087e83" }}>{log.action}</td>
                      <td>
                        <span className="admin-badge admin-badge-info">{log.module}</span>
                      </td>
                      <td style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>{log.recordReference}</td>
                      <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{log.ipAddress}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            log.outcome === "success"
                              ? "admin-badge-active"
                              : log.outcome === "warning"
                              ? "admin-badge-warning"
                              : "admin-badge-suspended"
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="admin-icon-btn"
                          title="View complete audit event payload"
                          onClick={() => setSelectedAuditLog(log)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. SYSTEM SETTINGS WORKSPACE                              */}
      {/* ========================================================= */}
      {activeTab === "system-settings" && (
        <form onSubmit={handleSaveSystemSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Security & Access Policy */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="lock" size={18} />
                  Authentication, Passwords & Access Policy
                </h3>
                <p>Governs session persistence, brute-force lockouts, and multi-factor authentication</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Session Idle Timeout (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    className="admin-form-input"
                    value={settingsDraft.sessionTimeoutMinutes}
                    onChange={(e) => {
                      setSettingsDraft({ ...settingsDraft, sessionTimeoutMinutes: Number(e.target.value) })
                      setIsSettingsChanged(true)
                    }}
                  />
                  <span className="admin-form-help">Clinical workstations automatically lock after inactivity</span>
                </div>
                <div className="admin-form-group">
                  <label>Minimum Password Length</label>
                  <input
                    type="number"
                    min="8"
                    max="32"
                    className="admin-form-input"
                    value={settingsDraft.passwordMinLength}
                    onChange={(e) => {
                      setSettingsDraft({ ...settingsDraft, passwordMinLength: Number(e.target.value) })
                      setIsSettingsChanged(true)
                    }}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Account Lockout Threshold</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    className="admin-form-input"
                    value={settingsDraft.accountLockoutAttempts}
                    onChange={(e) => {
                      setSettingsDraft({ ...settingsDraft, accountLockoutAttempts: Number(e.target.value) })
                      setIsSettingsChanged(true)
                    }}
                  />
                  <span className="admin-form-help">Failed attempts before account is temporarily locked</span>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Multi-Factor Authentication (MFA) Policy</label>
                  <select
                    className="admin-form-select"
                    value={settingsDraft.mfaEnforcement}
                    onChange={(e) => {
                      setSettingsDraft({
                        ...settingsDraft,
                        mfaEnforcement: e.target.value as SystemSettings["mfaEnforcement"],
                      })
                      setIsSettingsChanged(true)
                    }}
                  >
                    <option value="admin_only">Mandatory for Administrators Only (Recommended)</option>
                    <option value="all_staff">Mandatory for All Staff</option>
                    <option value="disabled">Optional / Hospital Discretion</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>HIT Support Helpdesk Contact</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    value={settingsDraft.supportContactEmail}
                    onChange={(e) => {
                      setSettingsDraft({ ...settingsDraft, supportContactEmail: e.target.value })
                      setIsSettingsChanged(true)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention & Backup */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="database" size={18} />
                  Medical Record Retention & Automated Database Backup
                </h3>
                <p>Ensures compliance with Ethiopian Ministry of Health clinical data archiving rules</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Clinical Record Retention Period</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={`${settingsDraft.clinicalRecordRetentionYears} Years (Statutory Requirement)`}
                    readOnly
                    style={{ backgroundColor: "#f8fafb" }}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Audit Log Retention Period</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={`${settingsDraft.auditLogRetentionYears} Years`}
                    readOnly
                    style={{ backgroundColor: "#f8fafb" }}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Automated Nightly Backup Schedule</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={settingsDraft.automatedDailyBackupTime}
                    readOnly
                    style={{ backgroundColor: "#f8fafb" }}
                  />
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#065f46", background: "#ecfdf5", padding: "0.75rem", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                <strong>Last Verified Backup Snapshot:</strong> {settingsDraft.lastBackupTimestamp}
              </div>
            </div>
          </div>

          {/* Maintenance & System Status */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Icon name="activity" size={18} />
                  Maintenance & System Runtime Health
                </h3>
                <p>Software release version, database engine, and connection pool telemetry</p>
              </div>
            </div>
            <div className="admin-card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div>
                <span className="admin-kpi-label">Software Version</span>
                <div style={{ fontWeight: 700, color: "#142e42", marginTop: "0.2rem" }}>
                  {settingsDraft.applicationVersion}
                </div>
              </div>
              <div>
                <span className="admin-kpi-label">Database Infrastructure</span>
                <div style={{ fontWeight: 700, color: "#142e42", marginTop: "0.2rem" }}>
                  {settingsDraft.databaseEngine}
                </div>
              </div>
              <div>
                <span className="admin-kpi-label">Cluster Status</span>
                <div style={{ fontWeight: 700, color: "#059669", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span className="admin-pulse-dot" /> {settingsDraft.systemStatus}
                </div>
              </div>
              <div>
                <span className="admin-kpi-label">Active Terminal Sessions</span>
                <div style={{ fontWeight: 700, color: "#142e42", marginTop: "0.2rem" }}>
                  {settingsDraft.activeConnections} Workstations
                </div>
              </div>
            </div>
            <div className="admin-card-header" style={{ justifyContent: "flex-end", borderTop: "1px solid #d2e1e1" }}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={!isSettingsChanged}
              >
                <Icon name="check" size={16} />
                Save System Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MODALS & DRAWERS                                          */}
      {/* ========================================================= */}

      {/* 1. CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateUserModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <Icon name="user-plus" size={18} />
                Provision New Staff Account
              </h3>
              <button className="admin-icon-btn" onClick={() => setShowCreateUserModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="admin-notice admin-notice-info">
                  <Icon name="info" size={18} />
                  <span>
                    New accounts are configured without exposing plain passwords. Initial activation instructions are issued securely.
                  </span>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Full Staff Name <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Aster Lemma, MD"
                      className="admin-form-input"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Login Username <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. aster.l"
                      className="admin-form-input"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Hospital Staff ID <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ORH-EM-011"
                      className="admin-form-input"
                      value={newUserStaffId}
                      onChange={(e) => setNewUserStaffId(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Official Work Email</label>
                    <input
                      type="email"
                      placeholder="e.g. aster.l@orhims.et"
                      className="admin-form-input"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Assigned Department <span className="required">*</span></label>
                    <select
                      className="admin-form-select"
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Assigned Role & Permissions <span className="required">*</span></label>
                    <select
                      className="admin-form-select"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Initial Activation & Invitation Method</label>
                  <select
                    className="admin-form-select"
                    value={newUserSetupMethod}
                    onChange={(e) => setNewUserSetupMethod(e.target.value as any)}
                  >
                    <option value="invitation">Send Secure Activation Link to Staff Work Email</option>
                    <option value="temporary">Issue Secure One-Time Temporary Setup Token</option>
                    <option value="manual">Manual In-Person Password Registration with HIT Officer</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Administrative Notes & Justification</label>
                  <textarea
                    rows={2}
                    className="admin-form-textarea"
                    placeholder="Enter onboarding approval note or departmental assignment reference..."
                    value={newUserNotes}
                    onChange={(e) => setNewUserNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Icon name="check" size={16} />
                  Provision Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT USER MODAL */}
      {showEditUserModal && selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditUserModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <Icon name="edit" size={18} />
                Edit Staff Account ({selectedUser.staffId})
              </h3>
              <button className="admin-icon-btn" onClick={() => setShowEditUserModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Full Staff Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="admin-form-group">
                    <label>Official Work Email</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={editUserEmail}
                      onChange={(e) => setEditUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      className="admin-form-input"
                      value={editUserPhone}
                      onChange={(e) => setEditUserPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="admin-form-group">
                    <label>Assigned Department</label>
                    <select
                      className="admin-form-select"
                      value={editUserDept}
                      onChange={(e) => setEditUserDept(e.target.value)}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Security Role</label>
                    <select
                      className="admin-form-select"
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Account Status</label>
                  <select
                    className="admin-form-select"
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as AdminUserStatus)}
                  >
                    <option value="active">Active (Full operational access)</option>
                    <option value="inactive">Inactive (Account temporarily disabled)</option>
                    <option value="suspended">Suspended (Access blocked)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowEditUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Icon name="check" size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="admin-modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="admin-modal-container" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#dc2626" }}>
                <Icon name="x-circle" size={18} />
                Delete Staff Account
              </h3>
              <button className="admin-icon-btn" onClick={() => setDeletingUser(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
              <div style={{ color: "#dc2626", marginBottom: "1rem" }}>
                <Icon name="x-circle" size={48} />
              </div>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", color: "#142e42" }}>
                De-provision {deletingUser.name}?
              </h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>
                Are you sure you want to permanently delete staff account <strong>{deletingUser.staffId}</strong> (@{deletingUser.username})? This user will no longer be able to access the hospital system.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ background: "#dc2626", color: "#fff" }}
                onClick={handleConfirmDeleteUser}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. USER DETAILS SIDE DRAWER */}
      {selectedUser && !showEditUserModal && (
        <div className="admin-drawer-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#142e42" }}>{selectedUser.name}</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {selectedUser.staffId} · @{selectedUser.username}
                </span>
              </div>
              <button className="admin-icon-btn" onClick={() => setSelectedUser(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="admin-drawer-body">
              <div>
                <span className="admin-kpi-label">Account Status</span>
                <div style={{ marginTop: "0.25rem" }}>
                  <span
                    className={`admin-badge ${
                      selectedUser.status === "active"
                        ? "admin-badge-active"
                        : selectedUser.status === "inactive"
                        ? "admin-badge-inactive"
                        : "admin-badge-suspended"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                  {selectedUser.isProtectedAdmin && (
                    <span className="admin-badge admin-badge-warning" style={{ marginLeft: "0.5rem" }}>
                      Protected Admin
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Assigned Department</span>
                <div style={{ fontWeight: 600, color: "#142e42", marginTop: "0.2rem" }}>
                  {selectedUser.departmentName}
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Security Role</span>
                <div style={{ fontWeight: 600, color: "#087e83", marginTop: "0.2rem" }}>
                  {selectedUser.roleName}
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Contact Details</span>
                <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  <div>Email: {selectedUser.email}</div>
                  <div>Phone: {selectedUser.phone}</div>
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Authentication History</span>
                <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  <div>Last Sign-In: {selectedUser.lastLogin}</div>
                  <div>Account Provisioned: {selectedUser.createdAt}</div>
                  <div>Two-Factor Auth: {selectedUser.twoFactorEnabled ? "Active" : "Disabled"}</div>
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Administrative Notes</span>
                <p style={{ fontSize: "0.8rem", color: "#475569", background: "#f8fafb", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", margin: "0.3rem 0 0 0" }}>
                  {selectedUser.notes}
                </p>
              </div>
            </div>
            <div className="admin-drawer-footer">
              {!selectedUser.isProtectedAdmin && (
                <button
                  className={`admin-btn ${selectedUser.status === "active" ? "admin-btn-danger" : "admin-btn-primary"}`}
                  onClick={() => handleToggleUserStatus(selectedUser)}
                >
                  <Icon name={selectedUser.status === "active" ? "x-circle" : "check"} size={16} />
                  {selectedUser.status === "active" ? "Deactivate Account" : "Reactivate Account"}
                </button>
              )}
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOG DETAIL DRAWER */}
      {selectedAuditLog && (
        <div className="admin-drawer-backdrop" onClick={() => setSelectedAuditLog(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#142e42" }}>Audit Event {selectedAuditLog.id}</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{selectedAuditLog.timestamp}</span>
              </div>
              <button className="admin-icon-btn" onClick={() => setSelectedAuditLog(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-notice admin-notice-info">
                <Icon name="lock" size={18} />
                <span>Cryptographically verified read-only audit log entry from Oda Roba Hospital ledger.</span>
              </div>

              <div>
                <span className="admin-kpi-label">Actor & Terminal</span>
                <div style={{ fontWeight: 600, color: "#142e42", marginTop: "0.2rem" }}>
                  {selectedAuditLog.actor}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {selectedAuditLog.actorRole} · {selectedAuditLog.ipAddress}
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Action & Outcome</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                  <span style={{ fontWeight: 700, color: "#087e83" }}>{selectedAuditLog.action}</span>
                  <span
                    className={`admin-badge ${
                      selectedAuditLog.outcome === "success"
                        ? "admin-badge-active"
                        : selectedAuditLog.outcome === "warning"
                        ? "admin-badge-warning"
                        : "admin-badge-suspended"
                    }`}
                  >
                    {selectedAuditLog.outcome}
                  </span>
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Target Record & Reference</span>
                <div style={{ fontSize: "0.85rem", marginTop: "0.2rem", fontFamily: "monospace" }}>
                  {selectedAuditLog.recordType}: {selectedAuditLog.recordReference}
                </div>
              </div>

              <div>
                <span className="admin-kpi-label">Event Details</span>
                <div style={{ fontSize: "0.85rem", color: "#334155", background: "#f8fafb", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: "0.2rem" }}>
                  {selectedAuditLog.details}
                </div>
              </div>

              {selectedAuditLog.diff && (
                <div>
                  <span className="admin-kpi-label">Before / After Differential State</span>
                  <div className="admin-diff-box" style={{ marginTop: "0.3rem" }}>
                    {selectedAuditLog.diff.map((d, i) => (
                      <div key={i} className="admin-diff-row">
                        <span style={{ fontWeight: 700, minWidth: "90px" }}>{d.field}:</span>
                        <span className="admin-diff-before">{d.before}</span>
                        <span>&rarr;</span>
                        <span className="admin-diff-after">{d.after}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-drawer-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedAuditLog(null)}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONFIRM ROLE PERMISSIONS MODAL */}
      {showRoleConfirmModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowRoleConfirmModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <Icon name="shield" size={18} />
                Confirm Role Permission Updates
              </h3>
              <button className="admin-icon-btn" onClick={() => setShowRoleConfirmModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-notice admin-notice-warning">
                <Icon name="alert-triangle" size={20} />
                <div>
                  <strong>Impact Warning:</strong> You are modifying the permission matrix for{" "}
                  <strong>{selectedRole.name}</strong>. This role currently applies to{" "}
                  <strong>{selectedRole.userCount} active staff members</strong> across Oda Roba General Hospital.
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#334155" }}>
                Staff members currently logged in with this role will see their active workspace permissions synchronized immediately.
                Ensure clinical workflows (such as emergency triage, prescription validation, and lab verification) remain compliant with your hospital policies.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowRoleConfirmModal(false)}
              >
                Cancel & Review
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveRolePermissions}
              >
                <Icon name="check" size={16} />
                Confirm & Apply Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE DEPARTMENT MODAL */}
      {showCreateDeptModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateDeptModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <Icon name="building" size={18} />
                Create Hospital Department
              </h3>
              <button className="admin-icon-btn" onClick={() => setShowCreateDeptModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Department Code <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CLN-PED"
                      className="admin-form-input"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                    />
                    <span className="admin-form-help">Unique uppercase department code</span>
                  </div>
                  <div className="admin-form-group">
                    <label>Department Name <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pediatrics & Child Health"
                      className="admin-form-input"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Department Classification</label>
                    <select
                      className="admin-form-select"
                      value={newDeptType}
                      onChange={(e) => setNewDeptType(e.target.value as any)}
                    >
                      <option value="clinical">Clinical Unit</option>
                      <option value="inpatient">Inpatient Ward</option>
                      <option value="diagnostic">Diagnostic & Laboratory</option>
                      <option value="support">Pharmacy & Support Service</option>
                      <option value="administrative">Administrative & Financial</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Head of Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Daniel Abate, MD"
                      className="admin-form-input"
                      value={newDeptHead}
                      onChange={(e) => setNewDeptHead(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Physical Location / Room</label>
                    <input
                      type="text"
                      placeholder="e.g. Pavilion B, Level 1"
                      className="admin-form-input"
                      value={newDeptLocation}
                      onChange={(e) => setNewDeptLocation(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Internal Phone Extension</label>
                    <input
                      type="text"
                      placeholder="+251 22 665 01XX"
                      className="admin-form-input"
                      value={newDeptPhone}
                      onChange={(e) => setNewDeptPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Department Scope & Description</label>
                  <textarea
                    rows={2}
                    className="admin-form-textarea"
                    placeholder="Enter care services or operational responsibilities..."
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowCreateDeptModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Icon name="check" size={16} />
                  Register Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CONFIRM HOSPITAL CONFIG MODAL */}
      {showConfigConfirmModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowConfigConfirmModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <Icon name="sliders" size={18} />
                Save Institutional Configuration
              </h3>
              <button className="admin-icon-btn" onClick={() => setShowConfigConfirmModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-notice admin-notice-warning">
                <Icon name="alert-triangle" size={20} />
                <div>
                  <strong>Important Configuration Review:</strong> Modifying operational prefixes or numbering sequences
                  will affect all future generated patient cards, admissions, and financial invoices. Historical records retain their original references.
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#334155" }}>
                Confirm that the hospital profile, official emergency hotline ({profileDraft.emergencyHotline}), and localization parameters meet Oda Roba General Hospital governance standards.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowConfigConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveHospitalConfig}
              >
                <Icon name="check" size={16} />
                Save & Update Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
