import { useState } from "react"
import Icon from "../Icon"
import "./portal.css"
import {
  type PatientProfile,
  type PortalAppointment,
  type DiagnosticResult,
  type MedicalRecord,
  type PortalInvoice,
  type PortalNotification,
  INITIAL_PATIENT,
  INITIAL_APPOINTMENTS,
  INITIAL_DIAGNOSTIC_RESULTS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
} from "./model"

interface PatientPortalPageProps {
  initialTab?: string
  onNavigateHome: () => void
  onSignOut: () => void
}

export default function PatientPortalPage({
  initialTab = "dashboard",
  onNavigateHome,
  onSignOut,
}: PatientPortalPageProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "appointments" | "records" | "results" | "billing" | "profile" | "notifications"
  >(() => {
    if (
      initialTab === "appointments" ||
      initialTab === "records" ||
      initialTab === "results" ||
      initialTab === "billing" ||
      initialTab === "profile" ||
      initialTab === "notifications"
    ) {
      return initialTab
    }
    return "dashboard"
  })

  // State
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT)
  const [appointments, setAppointments] = useState<PortalAppointment[]>(INITIAL_APPOINTMENTS)
  const [results] = useState<DiagnosticResult[]>(INITIAL_DIAGNOSTIC_RESULTS)
  const [records] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS)
  const [invoices, setInvoices] = useState<PortalInvoice[]>(INITIAL_INVOICES)
  const [notifications, setNotifications] = useState<PortalNotification[]>(INITIAL_NOTIFICATIONS)

  // Sub-filters
  const [appointmentFilter, setAppointmentFilter] = useState<"upcoming" | "pending" | "completed" | "all">("upcoming")
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all")

  // Modals
  const [showBookingWizard, setShowBookingWizard] = useState(false)
  const [selectedResult, setSelectedResult] = useState<DiagnosticResult | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<PortalAppointment | null>(null)
  const [cancelModalAppointment, setCancelModalAppointment] = useState<PortalAppointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null)
  const [showFaqModal, setShowFaqModal] = useState(false)

  // Profile Edit State
  const [editPhone, setEditPhone] = useState(patient.phone)
  const [editEmail, setEditEmail] = useState(patient.email)
  const [editEmergencyName, setEditEmergencyName] = useState(patient.emergencyContact.name)
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(patient.emergencyContact.phone)

  // Booking Wizard State
  const [wizardStep, setWizardStep] = useState(1)
  const [bookingDept, setBookingDept] = useState("Internal Medicine")
  const [bookingDoctor, setBookingDoctor] = useState("First Available Specialist")
  const [bookingDate, setBookingDate] = useState("2026-10-25")
  const [bookingSlot, setBookingSlot] = useState("Morning (08:30 - 12:00)")
  const [bookingReason, setBookingReason] = useState("")
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  // Payment Form State
  const [payMethod, setPayMethod] = useState<"telebirr" | "cbe" | "cashier">("telebirr")
  const [payPhone, setPayPhone] = useState("+251 91 234 5678")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Sync tab with URL
  const changeTab = (tab: "dashboard" | "appointments" | "records" | "results" | "billing" | "profile" | "notifications") => {
    setActiveTab(tab)
    window.history.pushState({}, "", `/portal/${tab}`)
  }

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentFilter === "upcoming") return apt.status === "Confirmed"
    if (appointmentFilter === "pending") return apt.status === "Pending Review"
    if (appointmentFilter === "completed") return apt.status === "Completed"
    return true
  })

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Handlers
  const handleCancelAppointment = () => {
    if (!cancelModalAppointment) return
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === cancelModalAppointment.id
          ? { ...apt, status: "Cancelled", canCancel: false, canReschedule: false }
          : apt
      )
    )
    setCancelModalAppointment(null)
    setCancelReason("")
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setPatient((prev) => ({
      ...prev,
      phone: editPhone,
      email: editEmail,
      emergencyContact: {
        ...prev.emergencyContact,
        name: editEmergencyName,
        phone: editEmergencyPhone,
      },
    }))
    setShowEditProfileModal(false)
  }

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const newAppointment: PortalAppointment = {
      id: `apt-${Date.now()}`,
      appointmentNumber: `REQ-2026-0${Math.floor(100 + Math.random() * 900)}`,
      department: bookingDept,
      doctorName: bookingDoctor,
      doctorSpecialty: "Specialist Physician",
      dateTime: `${bookingDate}T09:00:00`,
      room: "Triage & Consultation Hall, Block B",
      status: "Pending Review",
      reason: bookingReason || "Routine clinical consultation",
      prepInstructions: "Please arrive with your patient card 15 minutes prior.",
      canCancel: true,
      canReschedule: false,
    }
    setAppointments([newAppointment, ...appointments])
    setBookingSubmitted(true)
  }

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)
      setPaymentSuccessMsg("Payment verified! Receipt generated successfully.")
      setTimeout(() => {
        setShowPaymentModal(false)
        setPaymentSuccessMsg(null)
      }, 1500)
    }, 1200)
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="portal-root">
      {/* 1. PORTAL HEADER */}
      <header className="portal-header">
        <div className="portal-header-inner">
          <button className="portal-brand" onClick={() => changeTab("dashboard")} aria-label="Portal home">
            <span className="portal-brand-symbol">
              <Icon name="cross" size={24} />
            </span>
            <span className="portal-brand-text">
              <span className="portal-brand-title">ODA ROBA HOSPITAL</span>
              <span className="portal-brand-subtitle">PATIENT ACCESS PORTAL</span>
            </span>
          </button>

          <div className="portal-header-actions">
            {/* User Chip */}
            <div className="portal-user-chip">
              <div className="portal-user-avatar">
                {patient.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="portal-user-meta">
                <span className="portal-user-name">{patient.fullName}</span>
                <span className="portal-user-mrn">{patient.mrn}</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              className="portal-header-btn"
              onClick={() => changeTab("notifications")}
              aria-label="Notifications"
            >
              <Icon name="inbox" size={16} />
              {unreadCount > 0 && <span className="portal-badge-count">{unreadCount}</span>}
            </button>

            {/* Help / FAQ */}
            <button
              className="portal-header-btn"
              onClick={() => setShowFaqModal(true)}
              aria-label="Patient Assistance"
            >
              <Icon name="info" size={16} /> Help
            </button>

            {/* Return / Sign Out */}
            <button className="portal-header-btn" onClick={onSignOut} aria-label="Sign Out">
              <Icon name="log-out" size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION BAR */}
      <nav className="portal-nav-bar" aria-label="Patient portal navigation">
        <div className="portal-nav-inner">
          <button
            className={`portal-nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => changeTab("dashboard")}
          >
            <Icon name="grid" size={18} /> Dashboard
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => changeTab("appointments")}
          >
            <Icon name="calendar" size={18} /> My Appointments
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "records" ? "active" : ""}`}
            onClick={() => changeTab("records")}
          >
            <Icon name="file-text" size={18} /> Medical Records
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "results" ? "active" : ""}`}
            onClick={() => changeTab("results")}
          >
            <Icon name="flask" size={18} /> Test Results
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => changeTab("billing")}
          >
            <Icon name="receipt" size={18} /> Billing & Invoices
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => changeTab("profile")}
          >
            <Icon name="user" size={18} /> My Profile
          </button>
          <button
            className={`portal-nav-tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => changeTab("notifications")}
          >
            <Icon name="sliders" size={18} /> Settings & Alerts
            {unreadCount > 0 && <span className="portal-badge-count">{unreadCount}</span>}
          </button>
        </div>
      </nav>

      {/* 3. MAIN WORKSPACE */}
      <main className="portal-main">
        {/* Emergency Notice Callout */}
        <div className="portal-emergency-callout">
          <div className="portal-emergency-text">
            <Icon name="alert-triangle" size={18} />
            <span>
              <strong>Medical Emergency?</strong> If you are experiencing chest pain, severe difficulty breathing, trauma, or critical distress, do not wait for an online appointment. Visit Oda Roba Emergency Department immediately.
            </span>
          </div>
          <div className="portal-emergency-phone">
            Emergency Hotline: +251 22 665 2300 (24/7)
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD                                         */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <>
            {/* Welcome Banner */}
            <div className="portal-hero">
              <div className="portal-hero-text">
                <h1>Welcome back, {patient.fullName}</h1>
                <p>
                  Access your upcoming consultations, view certified laboratory test results, and review your medical care history at Oda Roba Hospital in Bale Robe.
                </p>
              </div>
              <div className="portal-hero-quick-actions">
                <button
                  className="portal-btn portal-btn-primary"
                  onClick={() => {
                    setWizardStep(1)
                    setBookingSubmitted(false)
                    setShowBookingWizard(true)
                  }}
                >
                  <Icon name="plus" size={16} /> Request Appointment
                </button>
                <button
                  className="portal-btn portal-btn-secondary"
                  onClick={() => changeTab("results")}
                >
                  <Icon name="flask" size={16} /> View Test Results
                </button>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="portal-kpi-grid">
              <div className="portal-kpi-card" onClick={() => changeTab("appointments")}>
                <div className="portal-kpi-icon teal">
                  <Icon name="calendar" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">1</span>
                  <span className="portal-kpi-label">Upcoming Appointment</span>
                </div>
              </div>

              <div className="portal-kpi-card" onClick={() => changeTab("results")}>
                <div className="portal-kpi-icon emerald">
                  <Icon name="flask" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">{results.length}</span>
                  <span className="portal-kpi-label">Validated Test Results</span>
                </div>
              </div>

              <div className="portal-kpi-card" onClick={() => changeTab("records")}>
                <div className="portal-kpi-icon navy">
                  <Icon name="file-text" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">{records.length}</span>
                  <span className="portal-kpi-label">Past Encounters</span>
                </div>
              </div>

              <div className="portal-kpi-card" onClick={() => changeTab("billing")}>
                <div className="portal-kpi-icon amber">
                  <Icon name="receipt" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">0 ETB</span>
                  <span className="portal-kpi-label">Outstanding Balance</span>
                </div>
              </div>
            </div>

            {/* Two-Column Content Grid */}
            <div className="portal-content-grid">
              {/* Left Column: Next Appointment & Active Prescriptions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Next Upcoming Appointment Highlight */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="calendar" size={18} /> Next Scheduled Visit
                    </h2>
                    <button
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => changeTab("appointments")}
                    >
                      View All Visits
                    </button>
                  </div>
                  <div className="portal-card-body">
                    {appointments.find((a) => a.status === "Confirmed") ? (
                      (() => {
                        const nextApt = appointments.find((a) => a.status === "Confirmed")!
                        return (
                          <div className="portal-appointment-card highlight" style={{ margin: 0 }}>
                            <div className="portal-appointment-top">
                              <div>
                                <div className="portal-appointment-title">{nextApt.doctorName}</div>
                                <div className="portal-appointment-dept">{nextApt.doctorSpecialty} · {nextApt.department}</div>
                              </div>
                              <span className="portal-badge confirmed">Confirmed</span>
                            </div>

                            <div className="portal-appointment-details">
                              <div className="portal-appointment-detail-item">
                                <Icon name="clock" size={15} />
                                <span>Tuesday, Oct 20, 2026 at 09:30 AM</span>
                              </div>
                              <div className="portal-appointment-detail-item">
                                <Icon name="pin" size={15} />
                                <span>{nextApt.room}</span>
                              </div>
                              <div className="portal-appointment-detail-item">
                                <Icon name="info" size={15} />
                                <span>Ref: {nextApt.appointmentNumber}</span>
                              </div>
                            </div>

                            {nextApt.prepInstructions && (
                              <div
                                style={{
                                  background: "#f0f7f7",
                                  borderLeft: "3px solid var(--orh-teal)",
                                  padding: "0.55rem 0.75rem",
                                  fontSize: "0.82rem",
                                  color: "var(--orh-navy)",
                                  marginBottom: "0.85rem",
                                  borderRadius: "0 4px 4px 0",
                                }}
                              >
                                <strong>Instructions:</strong> {nextApt.prepInstructions}
                              </div>
                            )}

                            <div className="portal-appointment-actions">
                              <button
                                className="portal-btn portal-btn-secondary portal-btn-sm"
                                onClick={() => setSelectedAppointment(nextApt)}
                              >
                                View Details
                              </button>
                              <button
                                className="portal-btn portal-btn-danger-outline portal-btn-sm"
                                onClick={() => setCancelModalAppointment(nextApt)}
                              >
                                Cancel Visit
                              </button>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <p style={{ color: "var(--orh-text-muted)", fontSize: "0.88rem", margin: 0 }}>
                        No upcoming visits scheduled. Click &apos;Request Appointment&apos; to schedule a consultation.
                      </p>
                    )}
                  </div>
                </div>

                {/* Active Prescriptions */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="pill" size={18} /> Active Prescribed Medications
                    </h2>
                    <button
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => changeTab("records")}
                    >
                      Encounter History
                    </button>
                  </div>
                  <div className="portal-card-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {records[0].prescriptions.map((rx, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: "1px solid var(--orh-border)",
                            borderRadius: "var(--orh-radius-md)",
                            padding: "0.85rem 1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#ffffff",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--orh-navy)", fontSize: "0.92rem" }}>
                              {rx.drug}
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--orh-text-muted)", marginTop: "0.15rem" }}>
                              {rx.dosage} — {rx.frequency} ({rx.duration})
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span className="portal-badge confirmed">Active</span>
                            <div style={{ fontSize: "0.75rem", color: "var(--orh-text-muted)", marginTop: "0.25rem" }}>
                              {rx.refillRemaining} refills remaining
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Health Profile Quick Card & Recent Lab Results */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Health Summary Card */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="heart" size={18} /> Patient Profile Snapshot
                    </h2>
                    <button
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => changeTab("profile")}
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="portal-card-body" style={{ fontSize: "0.84rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--orh-text-muted)" }}>MRN:</span>
                        <strong style={{ fontFamily: "monospace" }}>{patient.mrn}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--orh-text-muted)" }}>Age / Gender:</span>
                        <span>{patient.age} years / {patient.gender}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--orh-text-muted)" }}>Blood Group:</span>
                        <span className="portal-badge neutral">{patient.bloodType}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--orh-text-muted)" }}>Health Insurance:</span>
                        <span className="portal-badge confirmed">CBHI Active</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--orh-text-muted)" }}>Primary Residence:</span>
                        <span>{patient.kebele}</span>
                      </div>
                      <div style={{ borderTop: "1px solid var(--orh-border-light)", paddingTop: "0.5rem" }}>
                        <span style={{ color: "var(--orh-text-muted)", display: "block", marginBottom: "0.25rem" }}>
                          Known Allergies:
                        </span>
                        <div style={{ color: "var(--orh-danger)", fontWeight: 500 }}>
                          {patient.allergies.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Test Results Preview */}
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="flask" size={18} /> Recent Test Results
                    </h2>
                    <button
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => changeTab("results")}
                    >
                      All Results
                    </button>
                  </div>
                  <div className="portal-card-body" style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {results.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => setSelectedResult(res)}
                          style={{
                            padding: "0.65rem 0.75rem",
                            borderRadius: "var(--orh-radius-md)",
                            border: "1px solid var(--orh-border-light)",
                            background: "#fafcfc",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <strong style={{ fontSize: "0.86rem", color: "var(--orh-navy)" }}>{res.testName}</strong>
                            <span className="portal-badge confirmed" style={{ fontSize: "0.72rem" }}>Verified</span>
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--orh-text-muted)", marginTop: "0.2rem" }}>
                            Sample Date: 12 Oct 2026 · {res.analytes.length} Analytes
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY APPOINTMENTS                                   */}
        {/* ======================================================== */}
        {activeTab === "appointments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                  My Appointments
                </h1>
                <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                  Manage scheduled doctor consultations, review pending booking requests, or view your past clinic visits.
                </p>
              </div>
              <button
                className="portal-btn portal-btn-primary"
                onClick={() => {
                  setWizardStep(1)
                  setBookingSubmitted(false)
                  setShowBookingWizard(true)
                }}
              >
                <Icon name="plus" size={16} /> Request New Appointment
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--orh-border)", paddingBottom: "0.5rem" }}>
              <button
                className={`portal-btn portal-btn-sm ${appointmentFilter === "upcoming" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                onClick={() => setAppointmentFilter("upcoming")}
              >
                Upcoming (1)
              </button>
              <button
                className={`portal-btn portal-btn-sm ${appointmentFilter === "pending" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                onClick={() => setAppointmentFilter("pending")}
              >
                Pending Requests (1)
              </button>
              <button
                className={`portal-btn portal-btn-sm ${appointmentFilter === "completed" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                onClick={() => setAppointmentFilter("completed")}
              >
                Past Completed Visits (2)
              </button>
              <button
                className={`portal-btn portal-btn-sm ${appointmentFilter === "all" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                onClick={() => setAppointmentFilter("all")}
              >
                All Records ({appointments.length})
              </button>
            </div>

            {/* Appointment Cards List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <div key={apt.id} className="portal-appointment-card">
                    <div className="portal-appointment-top">
                      <div>
                        <div className="portal-appointment-title" style={{ fontSize: "1.05rem" }}>
                          {apt.doctorName}
                        </div>
                        <div className="portal-appointment-dept">
                          {apt.doctorSpecialty} · {apt.department}
                        </div>
                      </div>
                      <span
                        className={`portal-badge ${
                          apt.status === "Confirmed"
                            ? "confirmed"
                            : apt.status === "Pending Review"
                            ? "pending"
                            : apt.status === "Completed"
                            ? "completed"
                            : "cancelled"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="portal-appointment-details">
                      <div className="portal-appointment-detail-item">
                        <Icon name="calendar" size={15} />
                        <span>Date: {apt.dateTime.split("T")[0]}</span>
                      </div>
                      <div className="portal-appointment-detail-item">
                        <Icon name="clock" size={15} />
                        <span>Time: {apt.dateTime.split("T")[1].substring(0, 5)}</span>
                      </div>
                      <div className="portal-appointment-detail-item">
                        <Icon name="pin" size={15} />
                        <span>Location: {apt.room}</span>
                      </div>
                      <div className="portal-appointment-detail-item">
                        <Icon name="info" size={15} />
                        <span>Tracking ID: {apt.appointmentNumber}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "var(--orh-text)", marginBottom: "0.5rem" }}>
                      <strong>Reason for visit:</strong> {apt.reason}
                    </div>

                    {apt.prepInstructions && (
                      <div
                        style={{
                          background: "#f0f7f7",
                          borderLeft: "3px solid var(--orh-teal)",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.82rem",
                          color: "var(--orh-navy)",
                          marginBottom: "0.75rem",
                          borderRadius: "0 4px 4px 0",
                        }}
                      >
                        <strong>Preparation Note:</strong> {apt.prepInstructions}
                      </div>
                    )}

                    <div className="portal-appointment-actions">
                      <button
                        className="portal-btn portal-btn-secondary portal-btn-sm"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        View Full Details
                      </button>

                      {apt.canCancel && (
                        <button
                          className="portal-btn portal-btn-danger-outline portal-btn-sm"
                          onClick={() => setCancelModalAppointment(apt)}
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px dashed var(--orh-border)",
                    borderRadius: "var(--orh-radius-lg)",
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    color: "var(--orh-text-muted)",
                  }}
                >
                  <Icon name="calendar" size={32} />
                  <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                    No appointments found matching this filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MEDICAL RECORDS                                   */}
        {/* ======================================================== */}
        {activeTab === "records" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                My Clinical Visit Records
              </h1>
              <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                Approved clinical visit summaries, attending physicians, prescribed medications, and discharge care recommendations.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {records.map((rec) => (
                <div key={rec.id} className="portal-card">
                  <div className="portal-card-header">
                    <div>
                      <h2 className="portal-card-title" style={{ fontSize: "1.05rem" }}>
                        {rec.visitType} — {rec.department}
                      </h2>
                      <div style={{ fontSize: "0.8rem", color: "var(--orh-text-muted)", marginTop: "0.2rem" }}>
                        Attending Doctor: <strong>{rec.attendingDoctor}</strong> · Date of Visit: {rec.visitDate}
                      </div>
                    </div>
                    <span className="portal-badge confirmed">Verified Record</span>
                  </div>

                  <div className="portal-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Vital Signs Row */}
                    <div
                      style={{
                        background: "#f8fafb",
                        border: "1px solid var(--orh-border-light)",
                        borderRadius: "var(--orh-radius-md)",
                        padding: "0.75rem 1rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: "0.75rem",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Blood Pressure:</span>
                        <strong style={{ color: "var(--orh-navy)", fontSize: "0.95rem" }}>{rec.vitalSigns.bp}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Pulse Rate:</span>
                        <strong style={{ color: "var(--orh-navy)", fontSize: "0.95rem" }}>{rec.vitalSigns.pulse}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Body Temp:</span>
                        <strong style={{ color: "var(--orh-navy)", fontSize: "0.95rem" }}>{rec.vitalSigns.temp}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Weight:</span>
                        <strong style={{ color: "var(--orh-navy)", fontSize: "0.95rem" }}>{rec.vitalSigns.weight}</strong>
                      </div>
                    </div>

                    {/* Chief Complaint & Summary */}
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong>Reason for Consultation:</strong> {rec.chiefComplaint}
                      </div>
                      <div>
                        <strong>Physician Summary:</strong> {rec.clinicalSummary}
                      </div>
                    </div>

                    {/* Prescribed Medications */}
                    {rec.prescriptions.length > 0 && (
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "var(--orh-navy)", display: "block", marginBottom: "0.4rem" }}>
                          Prescriptions Given at this Encounter:
                        </strong>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {rec.prescriptions.map((rx, rIdx) => (
                            <div
                              key={rIdx}
                              style={{
                                border: "1px solid var(--orh-border-light)",
                                borderRadius: "var(--orh-radius-sm)",
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.82rem",
                                display: "flex",
                                justifyContent: "space-between",
                                background: "#fafcfc",
                              }}
                            >
                              <span>
                                <strong>{rx.drug}</strong> — {rx.dosage} ({rx.frequency})
                              </span>
                              <span style={{ color: "var(--orh-text-muted)" }}>Duration: {rx.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions & Follow-up */}
                    <div
                      style={{
                        background: "var(--orh-teal-subtle)",
                        borderLeft: "3px solid var(--orh-teal)",
                        padding: "0.65rem 0.85rem",
                        fontSize: "0.82rem",
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <div>
                        <strong>Patient Care Guidance:</strong> {rec.instructions}
                      </div>
                      <div style={{ marginTop: "0.25rem", color: "var(--orh-teal-hover)", fontWeight: 600 }}>
                        Next Follow-up: {rec.followUp}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--orh-border-light)", paddingTop: "0.75rem" }}>
                      <button
                        className="portal-btn portal-btn-secondary portal-btn-sm"
                        onClick={() => window.print()}
                      >
                        <Icon name="printer" size={14} /> Print Summary
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TEST RESULTS                                      */}
        {/* ======================================================== */}
        {activeTab === "results" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                Diagnostic Laboratory Results
              </h1>
              <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                Certified test reports conducted and approved by the Oda Roba General Hospital Clinical Laboratory.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {results.map((report) => (
                <div key={report.id} className="portal-card">
                  <div className="portal-card-header">
                    <div>
                      <h2 className="portal-card-title" style={{ fontSize: "1.05rem" }}>
                        <Icon name="flask" size={18} /> {report.testName}
                      </h2>
                      <div style={{ fontSize: "0.8rem", color: "var(--orh-text-muted)", marginTop: "0.2rem" }}>
                        Category: {report.testCategory} · Sample Date: {report.orderDate.split("T")[0]} · Report No: {report.reportNumber}
                      </div>
                    </div>
                    <span className="portal-badge confirmed">Final / Verified</span>
                  </div>

                  <div className="portal-card-body">
                    {/* Analytes Table */}
                    <div className="portal-table-container">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Analyte / Parameter</th>
                            <th>Measured Result</th>
                            <th>Standard Unit</th>
                            <th>Biological Reference Range</th>
                            <th>Status Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.analytes.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{item.name}</strong>
                              </td>
                              <td style={{ fontWeight: item.flag !== "Normal" ? 700 : 500 }}>
                                {item.result}
                              </td>
                              <td style={{ color: "var(--orh-text-muted)" }}>{item.unit}</td>
                              <td style={{ color: "var(--orh-text-muted)" }}>{item.referenceRange}</td>
                              <td>
                                <span
                                  className={`portal-badge ${
                                    item.flag === "Normal" ? "normal" : item.flag === "High" ? "high" : "low"
                                  }`}
                                >
                                  {item.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Laboratory Interpretation Note */}
                    <div
                      style={{
                        background: "#fafcfc",
                        border: "1px solid var(--orh-border)",
                        borderRadius: "var(--orh-radius-md)",
                        padding: "0.75rem 1rem",
                        marginTop: "1rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ color: "var(--orh-navy)", fontWeight: 600, marginBottom: "0.25rem" }}>
                        Medical Technologist Review & Clinical Remarks:
                      </div>
                      <div style={{ color: "var(--orh-text)" }}>{report.clinicalNotes}</div>
                      <div style={{ marginTop: "0.5rem", fontSize: "0.76rem", color: "var(--orh-text-muted)" }}>
                        Verified by: <strong>{report.verifiedBy}</strong> · Ordering Doctor: <strong>{report.orderingDoctor}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                      <button
                        className="portal-btn portal-btn-secondary portal-btn-sm"
                        onClick={() => window.print()}
                      >
                        <Icon name="download" size={14} /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: BILLING & INVOICES                                */}
        {/* ======================================================== */}
        {activeTab === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                  Hospital Billing & Payment Receipts
                </h1>
                <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                  Review your itemized invoices, CBHI community insurance deductions, and settled receipts.
                </p>
              </div>
              <button
                className="portal-btn portal-btn-primary"
                onClick={() => setShowPaymentModal(true)}
              >
                <Icon name="credit-card" size={16} /> Pay or Settle Bill
              </button>
            </div>

            {/* Financial Summary KPIs */}
            <div className="portal-kpi-grid">
              <div className="portal-kpi-card">
                <div className="portal-kpi-icon emerald">
                  <Icon name="receipt" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">0.00 ETB</span>
                  <span className="portal-kpi-label">Outstanding Balance</span>
                </div>
              </div>
              <div className="portal-kpi-card">
                <div className="portal-kpi-icon teal">
                  <Icon name="shield" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">1,440 ETB</span>
                  <span className="portal-kpi-label">Total CBHI Insurance Subsidized</span>
                </div>
              </div>
              <div className="portal-kpi-card">
                <div className="portal-kpi-icon navy">
                  <Icon name="check" size={22} />
                </div>
                <div className="portal-kpi-data">
                  <span className="portal-kpi-val">2</span>
                  <span className="portal-kpi-label">Paid Invoices</span>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {invoices.map((inv) => (
                <div key={inv.id} className="portal-card">
                  <div className="portal-card-header">
                    <div>
                      <h2 className="portal-card-title" style={{ fontSize: "1rem" }}>
                        Invoice {inv.invoiceNumber} — {inv.department}
                      </h2>
                      <div style={{ fontSize: "0.8rem", color: "var(--orh-text-muted)", marginTop: "0.15rem" }}>
                        Date: {inv.date} · {inv.serviceSummary}
                      </div>
                    </div>
                    <span className="portal-badge paid">Settled / Paid</span>
                  </div>

                  <div className="portal-card-body">
                    <div className="portal-table-container">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Item Description</th>
                            <th>Quantity</th>
                            <th>Unit Rate (ETB)</th>
                            <th>Line Total (ETB)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((it, idx) => (
                            <tr key={idx}>
                              <td>{it.description}</td>
                              <td>{it.quantity}</td>
                              <td>{it.unitPrice.toFixed(2)}</td>
                              <td>{it.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "1rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--orh-border-light)",
                      }}
                    >
                      <div style={{ minWidth: "260px", fontSize: "0.84rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--orh-text-muted)" }}>Subtotal:</span>
                          <span>{inv.subtotal.toFixed(2)} ETB</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--orh-success)" }}>
                          <span>CBHI Scheme Coverage:</span>
                          <span>- {inv.cbhiCovered.toFixed(2)} ETB</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1px solid var(--orh-border)",
                            paddingTop: "0.35rem",
                            fontWeight: 700,
                            color: "var(--orh-navy)",
                            fontSize: "0.95rem",
                          }}
                        >
                          <span>Total Paid:</span>
                          <span>{inv.totalDue === 0 ? "0.00 ETB (Fully Covered)" : `${inv.totalDue.toFixed(2)} ETB`}</span>
                        </div>
                        {inv.receiptNumber && (
                          <div style={{ fontSize: "0.75rem", color: "var(--orh-text-muted)", marginTop: "0.35rem" }}>
                            Settled via {inv.paymentMethod} · Receipt Ref: <strong>{inv.receiptNumber}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MY PROFILE                                        */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                  Patient Profile & Contact Information
                </h1>
                <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                  Review and manage your personal demographics, emergency contacts, and community health insurance credentials.
                </p>
              </div>
              <button
                className="portal-btn portal-btn-primary"
                onClick={() => {
                  setEditPhone(patient.phone)
                  setEditEmail(patient.email)
                  setEditEmergencyName(patient.emergencyContact.name)
                  setEditEmergencyPhone(patient.emergencyContact.phone)
                  setShowEditProfileModal(true)
                }}
              >
                <Icon name="edit" size={16} /> Edit Contact Details
              </button>
            </div>

            <div className="portal-content-grid">
              {/* Left Column: Personal Identification & Demographics */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="user" size={18} /> Official Identification
                    </h2>
                    <span className="portal-badge confirmed">Verified Patient</span>
                  </div>
                  <div className="portal-card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.86rem" }}>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Full Name:</span>
                        <strong style={{ color: "var(--orh-navy)", fontSize: "1rem" }}>{patient.fullName}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Medical Record Number (MRN):</span>
                        <strong style={{ fontFamily: "monospace", color: "var(--orh-navy)" }}>{patient.mrn}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>National / Kebele ID:</span>
                        <span>{patient.nationalId}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Gender / Age:</span>
                        <span>{patient.gender} · {patient.age} years</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Date of Birth:</span>
                        <span>{patient.dateOfBirth}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Blood Group:</span>
                        <span className="portal-badge neutral">{patient.bloodType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="phone" size={18} /> Contact & Emergency Details
                    </h2>
                  </div>
                  <div className="portal-card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.86rem" }}>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Primary Mobile Phone:</span>
                        <strong>{patient.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Email Address:</span>
                        <span>{patient.email}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Residential Kebele:</span>
                        <span>{patient.kebele}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Woreda / Zone:</span>
                        <span>{patient.woreda}, {patient.zone}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Emergency Contact Name:</span>
                        <strong>{patient.emergencyContact.name} ({patient.emergencyContact.relation})</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Emergency Contact Phone:</span>
                        <strong>{patient.emergencyContact.phone}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Insurance & Clinical Alerts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="shield" size={18} /> Community Health Insurance (CBHI)
                    </h2>
                    <span className="portal-badge confirmed">Active Policy</span>
                  </div>
                  <div className="portal-card-body" style={{ fontSize: "0.84rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>CBHI Member ID:</span>
                        <strong style={{ fontFamily: "monospace", color: "var(--orh-navy)" }}>{patient.cbhiId}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Issuing Woreda:</span>
                        <span>Robe City Administration CBHI Office</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--orh-text-muted)", display: "block" }}>Coverage Tier:</span>
                        <span>Full Outpatient & Inpatient Essential Benefits</span>
                      </div>
                      <div
                        style={{
                          background: "#e8f7ee",
                          border: "1px solid #c6ebd2",
                          borderRadius: "var(--orh-radius-sm)",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.78rem",
                          color: "var(--orh-success)",
                          marginTop: "0.5rem",
                        }}
                      >
                        Policy valid through Ginbot 2019 E.C. (July 2027 G.C.).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <h2 className="portal-card-title">
                      <Icon name="heart" size={18} /> Registered Medical Conditions
                    </h2>
                  </div>
                  <div className="portal-card-body" style={{ fontSize: "0.84rem" }}>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <span style={{ color: "var(--orh-text-muted)", display: "block", marginBottom: "0.25rem" }}>
                        Chronic Health Conditions:
                      </span>
                      {patient.chronicConditions.map((cond, idx) => (
                        <div key={idx} style={{ fontWeight: 600, color: "var(--orh-navy)" }}>
                          • {cond}
                        </div>
                      ))}
                    </div>
                    <div>
                      <span style={{ color: "var(--orh-text-muted)", display: "block", marginBottom: "0.25rem" }}>
                        Documented Drug Allergies:
                      </span>
                      {patient.allergies.map((all, idx) => (
                        <div key={idx} style={{ color: "var(--orh-danger)", fontWeight: 600 }}>
                          • {all}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SETTINGS & NOTIFICATIONS                          */}
        {/* ======================================================== */}
        {activeTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.25rem 0" }}>
                  Notifications & Portal Preferences
                </h1>
                <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                  Control communication channels, SMS appointment reminders, and view recent system notices.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="portal-btn portal-btn-secondary portal-btn-sm"
                  onClick={markAllNotificationsRead}
                >
                  <Icon name="check" size={14} /> Mark All as Read
                </button>
              </div>
            </div>

            <div className="portal-content-grid">
              {/* Left Column: Notification Feed */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">
                    <Icon name="inbox" size={18} /> Notification Feed
                  </h2>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      className={`portal-btn portal-btn-sm ${notificationFilter === "all" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                      onClick={() => setNotificationFilter("all")}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      className={`portal-btn portal-btn-sm ${notificationFilter === "unread" ? "portal-btn-primary" : "portal-btn-secondary"}`}
                      onClick={() => setNotificationFilter("unread")}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>
                </div>

                <div className="portal-card-body" style={{ padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {notifications
                      .filter((n) => (notificationFilter === "unread" ? !n.read : true))
                      .map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "var(--orh-radius-md)",
                            border: "1px solid var(--orh-border-light)",
                            background: notif.read ? "#ffffff" : "#f0f8f8",
                            borderLeft: notif.read ? "1px solid var(--orh-border-light)" : "4px solid var(--orh-teal)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.9rem", color: "var(--orh-navy)" }}>{notif.title}</strong>
                            <span style={{ fontSize: "0.72rem", color: "var(--orh-text-muted)", whiteSpace: "nowrap" }}>
                              {notif.timestamp.split("T")[0]}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "var(--orh-text)", margin: "0.35rem 0 0 0" }}>
                            {notif.message}
                          </p>
                          {notif.actionTab && (
                            <button
                              onClick={() => changeTab(notif.actionTab!)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--orh-teal)",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: 0,
                                marginTop: "0.4rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              Go to {notif.actionTab} <Icon name="arrow" size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Portal Preferences */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">
                    <Icon name="sliders" size={18} /> Portal Settings
                  </h2>
                </div>
                <div className="portal-card-body" style={{ fontSize: "0.84rem" }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Preferred Portal Language</label>
                    <select className="portal-form-select" defaultValue="en">
                      <option value="en">English (Official)</option>
                      <option value="om">Afaan Oromoo</option>
                      <option value="am">Amharic (አማርኛ)</option>
                    </select>
                  </div>

                  <div style={{ borderTop: "1px solid var(--orh-border-light)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--orh-navy)", marginBottom: "0.6rem" }}>
                      Notification Preferences
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />
                      <span>SMS reminders for appointments (24h prior)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />
                      <span>SMS notification when lab test results are ready</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />
                      <span>Email summary of discharge and visit instructions</span>
                    </label>
                  </div>

                  <div style={{ borderTop: "1px solid var(--orh-border-light)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--orh-navy)", marginBottom: "0.4rem" }}>
                      Security & Passcode
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--orh-text-muted)", margin: "0 0 0.75rem 0" }}>
                      Last password change was 45 days ago. Keep your credentials confidential.
                    </p>
                    <button
                      className="portal-btn portal-btn-secondary portal-btn-sm"
                      onClick={() => alert("Password reset verification link sent to your registered phone.")}
                    >
                      <Icon name="lock" size={14} /> Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS & WORKFLOWS */}

      {/* A. 5-STEP APPOINTMENT BOOKING WIZARD MODAL */}
      {showBookingWizard && (
        <div className="portal-modal-backdrop" onClick={() => setShowBookingWizard(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="calendar" size={20} /> Request an Appointment
              </h2>
              <button
                className="portal-btn portal-btn-secondary portal-btn-sm"
                onClick={() => setShowBookingWizard(false)}
                aria-label="Close"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="portal-modal-body">
              {bookingSubmitted ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "var(--orh-success-bg)",
                      color: "var(--orh-success)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <Icon name="check" size={32} />
                  </div>
                  <h3 style={{ fontSize: "1.2rem", color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>
                    Appointment Request Submitted!
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--orh-text-muted)", maxWidth: "420px", margin: "0 auto 1.25rem auto" }}>
                    Your request for <strong>{bookingDept}</strong> on <strong>{bookingDate}</strong> has been received. Our clinical scheduling team will verify doctor availability and dispatch an SMS confirmation within 2 business hours.
                  </p>
                  <button
                    className="portal-btn portal-btn-primary"
                    onClick={() => {
                      setShowBookingWizard(false)
                      changeTab("appointments")
                    }}
                  >
                    View My Appointments
                  </button>
                </div>
              ) : (
                <>
                  {/* Stepper Indicators */}
                  <div className="portal-wizard-steps">
                    {[
                      { step: 1, label: "Department" },
                      { step: 2, label: "Specialist" },
                      { step: 3, label: "Schedule" },
                      { step: 4, label: "Reason" },
                      { step: 5, label: "Confirm" },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`portal-wizard-step ${
                          wizardStep === s.step ? "active" : wizardStep > s.step ? "completed" : ""
                        }`}
                        onClick={() => wizardStep > s.step && setWizardStep(s.step)}
                      >
                        <div className="portal-step-bubble">{s.step}</div>
                        <span className="portal-step-label">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Department */}
                  {wizardStep === 1 && (
                    <div>
                      <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--orh-navy)" }}>Select Clinical Department</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        {[
                          "Internal Medicine",
                          "Pediatrics & Child Health",
                          "Obstetrics & Gynecology",
                          "General Surgery",
                          "Orthopedics",
                          "Ophthalmology / Eye",
                          "Dental & Oral Health",
                          "Dermatology",
                        ].map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => setBookingDept(dept)}
                            style={{
                              padding: "0.85rem",
                              borderRadius: "var(--orh-radius-md)",
                              border: bookingDept === dept ? "2px solid var(--orh-teal)" : "1px solid var(--orh-border)",
                              background: bookingDept === dept ? "var(--orh-teal-subtle)" : "#ffffff",
                              color: "var(--orh-navy)",
                              fontWeight: bookingDept === dept ? 600 : 500,
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "0.86rem",
                            }}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Doctor */}
                  {wizardStep === 2 && (
                    <div>
                      <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--orh-navy)" }}>Select Preferred Doctor</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {[
                          "First Available Specialist",
                          "Dr. Daniel Abate (Consultant Internist)",
                          "Dr. Aster Bekele (Ophthalmologist)",
                          "Dr. Hiwot Tadesse (OB/GYN Consultant)",
                          "Dr. Berhanu Mengistu (Pediatrician)",
                        ].map((doc) => (
                          <button
                            key={doc}
                            type="button"
                            onClick={() => setBookingDoctor(doc)}
                            style={{
                              padding: "0.85rem 1rem",
                              borderRadius: "var(--orh-radius-md)",
                              border: bookingDoctor === doc ? "2px solid var(--orh-teal)" : "1px solid var(--orh-border)",
                              background: bookingDoctor === doc ? "var(--orh-teal-subtle)" : "#ffffff",
                              color: "var(--orh-navy)",
                              fontWeight: bookingDoctor === doc ? 600 : 500,
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "0.88rem",
                            }}
                          >
                            {doc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Date & Time */}
                  {wizardStep === 3 && (
                    <div>
                      <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--orh-navy)" }}>Choose Date & Time Preference</h4>
                      <div className="portal-form-group">
                        <label className="portal-form-label">Preferred Appointment Date</label>
                        <input
                          type="date"
                          className="portal-form-input"
                          value={bookingDate}
                          min="2026-10-18"
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>

                      <div className="portal-form-group">
                        <label className="portal-form-label">Time Slot Preference</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          {["Morning (08:30 - 12:00)", "Afternoon (13:30 - 17:00)"].map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setBookingSlot(slot)}
                              style={{
                                padding: "0.75rem",
                                borderRadius: "var(--orh-radius-md)",
                                border: bookingSlot === slot ? "2px solid var(--orh-teal)" : "1px solid var(--orh-border)",
                                background: bookingSlot === slot ? "var(--orh-teal-subtle)" : "#ffffff",
                                color: "var(--orh-navy)",
                                fontWeight: bookingSlot === slot ? 600 : 500,
                                cursor: "pointer",
                                fontSize: "0.84rem",
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Reason */}
                  {wizardStep === 4 && (
                    <div>
                      <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--orh-navy)" }}>Reason for Visit & Symptoms</h4>
                      <div className="portal-form-group">
                        <label className="portal-form-label">Describe your symptoms or reason for scheduling</label>
                        <textarea
                          rows={4}
                          className="portal-form-textarea"
                          placeholder="e.g. Routine blood pressure check, persistent cough for 4 days, or prescription refill review…"
                          value={bookingReason}
                          onChange={(e) => setBookingReason(e.target.value)}
                        />
                        <div className="portal-form-help">
                          This information helps the medical team prepare the right clinic room and review prior records.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Confirm */}
                  {wizardStep === 5 && (
                    <div>
                      <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--orh-navy)" }}>Review & Submit Booking Request</h4>
                      <div
                        style={{
                          background: "#fafcfc",
                          border: "1px solid var(--orh-border)",
                          borderRadius: "var(--orh-radius-md)",
                          padding: "1rem",
                          fontSize: "0.86rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div><strong>Patient:</strong> {patient.fullName} (MRN: {patient.mrn})</div>
                        <div><strong>Department:</strong> {bookingDept}</div>
                        <div><strong>Doctor:</strong> {bookingDoctor}</div>
                        <div><strong>Requested Date & Slot:</strong> {bookingDate} · {bookingSlot}</div>
                        <div><strong>Reason:</strong> {bookingReason || "General Consultation"}</div>
                        <div><strong>Contact Phone:</strong> {patient.phone}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!bookingSubmitted && (
              <div className="portal-modal-footer">
                {wizardStep > 1 && (
                  <button
                    className="portal-btn portal-btn-secondary"
                    onClick={() => setWizardStep((s) => s - 1)}
                  >
                    Back
                  </button>
                )}
                {wizardStep < 5 ? (
                  <button
                    className="portal-btn portal-btn-primary"
                    onClick={() => setWizardStep((s) => s + 1)}
                  >
                    Next Step <Icon name="arrow" size={14} />
                  </button>
                ) : (
                  <button
                    className="portal-btn portal-btn-primary"
                    onClick={handleCompleteBooking}
                  >
                    Confirm & Submit Request
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="calendar" size={20} /> Appointment Details
              </h2>
              <button
                className="portal-btn portal-btn-secondary portal-btn-sm"
                onClick={() => setSelectedAppointment(null)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="portal-modal-body" style={{ fontSize: "0.88rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--orh-navy)" }}>
                    {selectedAppointment.doctorName}
                  </span>
                  <span className="portal-badge confirmed">{selectedAppointment.status}</span>
                </div>
                <div><strong>Department:</strong> {selectedAppointment.department}</div>
                <div><strong>Doctor Specialty:</strong> {selectedAppointment.doctorSpecialty}</div>
                <div><strong>Scheduled Date & Time:</strong> {selectedAppointment.dateTime.replace("T", " at ")}</div>
                <div><strong>Clinic Room & Ward:</strong> {selectedAppointment.room}</div>
                <div><strong>Tracking Number:</strong> {selectedAppointment.appointmentNumber}</div>
                <div><strong>Clinical Reason:</strong> {selectedAppointment.reason}</div>
                {selectedAppointment.prepInstructions && (
                  <div
                    style={{
                      background: "var(--orh-teal-subtle)",
                      borderLeft: "3px solid var(--orh-teal)",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <strong>Preparation Notice:</strong> {selectedAppointment.prepInstructions}
                  </div>
                )}
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn portal-btn-secondary" onClick={() => window.print()}>
                <Icon name="printer" size={14} /> Print Appointment Card
              </button>
              <button className="portal-btn portal-btn-primary" onClick={() => setSelectedAppointment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. CANCEL APPOINTMENT CONFIRMATION MODAL */}
      {cancelModalAppointment && (
        <div className="portal-modal-backdrop" onClick={() => setCancelModalAppointment(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title" style={{ color: "var(--orh-danger)" }}>
                <Icon name="warning" size={20} /> Cancel Appointment Confirmation
              </h2>
              <button
                className="portal-btn portal-btn-secondary portal-btn-sm"
                onClick={() => setCancelModalAppointment(null)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="portal-modal-body">
              <p style={{ fontSize: "0.88rem", color: "var(--orh-text)", marginTop: 0 }}>
                Are you sure you want to cancel your upcoming appointment with{" "}
                <strong>{cancelModalAppointment.doctorName}</strong> on{" "}
                <strong>{cancelModalAppointment.dateTime.split("T")[0]}</strong>?
              </p>
              <div className="portal-form-group">
                <label className="portal-form-label">Please state your reason for cancellation</label>
                <select
                  className="portal-form-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="schedule_conflict">Schedule conflict / unavailable</option>
                  <option value="symptoms_resolved">Symptoms resolved / no longer needed</option>
                  <option value="travel">Unable to travel to Bale Robe</option>
                  <option value="rescheduling">Planning to reschedule for next week</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn portal-btn-secondary" onClick={() => setCancelModalAppointment(null)}>
                Keep Appointment
              </button>
              <button
                className="portal-btn portal-btn-danger-outline"
                style={{ background: "var(--orh-danger)", color: "#ffffff", borderColor: "var(--orh-danger)" }}
                onClick={handleCancelAppointment}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. TEST RESULT MODAL */}
      {selectedResult && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedResult(null)}>
          <div className="portal-modal-dialog" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="flask" size={20} /> {selectedResult.testName}
              </h2>
              <button className="portal-btn portal-btn-secondary portal-btn-sm" onClick={() => setSelectedResult(null)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="portal-modal-body">
              <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "var(--orh-text-muted)" }}>
                Report: <strong>{selectedResult.reportNumber}</strong> · Category: {selectedResult.testCategory} · Verified by: {selectedResult.verifiedBy}
              </div>
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Analyte</th>
                      <th>Result</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.analytes.map((a, idx) => (
                      <tr key={idx}>
                        <td><strong>{a.name}</strong></td>
                        <td style={{ fontWeight: a.flag !== "Normal" ? 700 : 500 }}>{a.result}</td>
                        <td style={{ color: "var(--orh-text-muted)" }}>{a.unit}</td>
                        <td style={{ color: "var(--orh-text-muted)" }}>{a.referenceRange}</td>
                        <td>
                          <span className={`portal-badge ${a.flag === "Normal" ? "normal" : "high"}`}>
                            {a.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn portal-btn-secondary" onClick={() => window.print()}>
                <Icon name="printer" size={14} /> Print Report
              </button>
              <button className="portal-btn portal-btn-primary" onClick={() => setSelectedResult(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. MAKE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="credit-card" size={20} /> Settle Hospital Bill
              </h2>
              <button className="portal-btn portal-btn-secondary portal-btn-sm" onClick={() => setShowPaymentModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="portal-modal-body">
              {paymentSuccessMsg ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "var(--orh-success-bg)",
                      color: "var(--orh-success)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Icon name="check" size={26} />
                  </div>
                  <h3 style={{ color: "var(--orh-navy)", margin: "0 0 0.5rem 0" }}>{paymentSuccessMsg}</h3>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "0.85rem", color: "var(--orh-text-muted)", marginTop: 0 }}>
                    Select an electronic payment method or review instructions to pay at the Oda Roba Hospital Cashier Desk.
                  </p>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Select Payment Method</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                      {[
                        { id: "telebirr", label: "Telebirr" },
                        { id: "cbe", label: "CBE Birr" },
                        { id: "cashier", label: "In-Person Cashier" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id as any)}
                          style={{
                            padding: "0.65rem 0.5rem",
                            borderRadius: "var(--orh-radius-md)",
                            border: payMethod === m.id ? "2px solid var(--orh-teal)" : "1px solid var(--orh-border)",
                            background: payMethod === m.id ? "var(--orh-teal-subtle)" : "#ffffff",
                            fontWeight: payMethod === m.id ? 600 : 500,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payMethod === "telebirr" && (
                    <div className="portal-form-group">
                      <label className="portal-form-label">Telebirr Mobile Number</label>
                      <input
                        type="text"
                        className="portal-form-input"
                        value={payPhone}
                        onChange={(e) => setPayPhone(e.target.value)}
                      />
                      <div className="portal-form-help">
                        A USSD prompt will be sent to your phone to confirm payment of 0.00 ETB (Current balance cleared).
                      </div>
                    </div>
                  )}

                  {payMethod === "cbe" && (
                    <div style={{ fontSize: "0.84rem", background: "#f8fafb", padding: "0.85rem", borderRadius: "6px" }}>
                      <strong>CBE Birr Transfer:</strong> Dial *847# or open CBE Mobile Banking. Merchant Code: <strong>ORH-CBE-771</strong>.
                    </div>
                  )}

                  {payMethod === "cashier" && (
                    <div style={{ fontSize: "0.84rem", background: "#f8fafb", padding: "0.85rem", borderRadius: "6px" }}>
                      <strong>Cashier Desk:</strong> Visit the central cashier desk at Block A Ground Floor with your MRN <strong>{patient.mrn}</strong>.
                    </div>
                  )}
                </>
              )}
            </div>
            {!paymentSuccessMsg && (
              <div className="portal-modal-footer">
                <button className="portal-btn portal-btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button
                  className="portal-btn portal-btn-primary"
                  onClick={handleSimulatePayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing…" : "Verify & Pay"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* F. EDIT CONTACT MODAL */}
      {showEditProfileModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowEditProfileModal(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="edit" size={20} /> Update Contact Information
              </h2>
              <button className="portal-btn portal-btn-secondary portal-btn-sm" onClick={() => setShowEditProfileModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="portal-modal-body">
                <div className="portal-form-group">
                  <label className="portal-form-label">Primary Mobile Phone Number</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="portal-form-group">
                  <label className="portal-form-label">Email Address</label>
                  <input
                    type="email"
                    className="portal-form-input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="portal-form-group">
                  <label className="portal-form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    required
                  />
                </div>
                <div className="portal-form-group">
                  <label className="portal-form-label">Emergency Contact Phone Number</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="portal-form-help">
                  Note: Official legal name or Date of Birth changes require in-person identity verification at the Hospital Registrar Desk.
                </div>
              </div>
              <div className="portal-modal-footer">
                <button type="button" className="portal-btn portal-btn-secondary" onClick={() => setShowEditProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="portal-btn portal-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* G. FAQ & PATIENT ASSISTANCE MODAL */}
      {showFaqModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowFaqModal(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h2 className="portal-modal-title">
                <Icon name="info" size={20} /> Patient Assistance & Help Center
              </h2>
              <button className="portal-btn portal-btn-secondary portal-btn-sm" onClick={() => setShowFaqModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="portal-modal-body" style={{ fontSize: "0.86rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <strong>How do I view my laboratory test results?</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--orh-text-muted)" }}>
                  Click the &apos;Test Results&apos; tab on the top menu. All final and physician-verified diagnostic reports are listed with their measured values and reference ranges.
                </p>
              </div>
              <div>
                <strong>How do I book a follow-up consultation?</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--orh-text-muted)" }}>
                  Use the &apos;Request Appointment&apos; button to choose your department, preferred physician, and preferred morning or afternoon slot. Our team will verify and send an SMS confirmation.
                </p>
              </div>
              <div>
                <strong>What should I do in an emergency?</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--orh-text-muted)" }}>
                  Do not request an online appointment for severe or life-threatening symptoms. Call our 24/7 emergency hotline at <strong>+251 22 665 2300</strong> or visit the Emergency Department at Bale Robe immediately.
                </p>
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn portal-btn-primary" onClick={() => setShowFaqModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PORTAL FOOTER */}
      <footer className="portal-footer">
        <div className="portal-footer-inner">
          <div>
            <strong>Oda Roba General Hospital</strong> · Bale Robe, Oromia, Ethiopia · Patient Portal v12.0
          </div>
          <div className="portal-footer-links">
            <button onClick={() => setShowFaqModal(true)}>Assistance & FAQ</button>
            <button onClick={onNavigateHome}>Hospital Website</button>
            <button onClick={onSignOut}>Sign Out</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
