import { useState } from "react"
import Icon from "../Icon"
import "./portal.css"

interface PatientAuthPageProps {
  initialTab?: "login" | "activate" | "recovery"
  onLoginSuccess: () => void
  onNavigateHome: () => void
  onNavigateStaffLogin: () => void
}

export default function PatientAuthPage({
  initialTab = "login",
  onLoginSuccess,
  onNavigateHome,
  onNavigateStaffLogin,
}: PatientAuthPageProps) {
  const [activeTab, setActiveTab] = useState<"login" | "activate" | "recovery">(initialTab)
  const [identifier, setIdentifier] = useState("ORH-26-00104")
  const [password, setPassword] = useState("PatientPass2026!")
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)

  // Activation state
  const [activateMrn, setActivateMrn] = useState("")
  const [activationCode, setActivationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Recovery state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("")
  const [recoverySent, setRecoverySent] = useState(false)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      // Allow any demo sign-in or check identifier
      if (identifier.trim().length < 3) {
        setAuthError("Please provide a valid Medical Record Number (MRN) or registered phone number.")
        return
      }
      onLoginSuccess()
    }, 600)
  }

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!activateMrn || !activationCode || !newPassword) {
      setAuthError("Please complete all required fields to activate your portal account.")
      return
    }
    if (newPassword !== confirmPassword) {
      setAuthError("The passwords entered do not match. Please verify and retype.")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setAuthSuccess("Account successfully activated! You can now log in using your MRN and password.")
      setIdentifier(activateMrn)
      setPassword(newPassword)
      setActiveTab("login")
    }, 800)
  }

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryIdentifier) {
      setAuthError("Please enter your registered phone number or MRN.")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setRecoverySent(true)
      setAuthSuccess(`A password reset verification code has been dispatched via SMS to your registered mobile number.`)
    }, 800)
  }

  const fillDemoCredentials = () => {
    setIdentifier("ORH-26-00104")
    setPassword("PatientPass2026!")
    setAuthError(null)
  }

  return (
    <div className="portal-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Banner */}
      <header className="portal-header">
        <div className="portal-header-inner">
          <button className="portal-brand" onClick={onNavigateHome} aria-label="Go to hospital website">
            <span className="portal-brand-symbol">
              <Icon name="cross" size={24} />
            </span>
            <span className="portal-brand-text">
              <span className="portal-brand-title">ODA ROBA HOSPITAL</span>
              <span className="portal-brand-subtitle">PATIENT SECURE PORTAL</span>
            </span>
          </button>

          <div className="portal-header-actions">
            <button className="portal-header-btn" onClick={onNavigateStaffLogin}>
              <Icon name="shield" size={14} /> Hospital Staff Sign-In
            </button>
            <button className="portal-header-btn" onClick={onNavigateHome}>
              <Icon name="arrow" size={14} /> Return to Website
            </button>
          </div>
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="portal-main" style={{ justifyContent: "center", alignItems: "center", padding: "2.5rem 1rem" }}>
        <div style={{ maxWidth: "460px", width: "100%" }}>
          <div className="portal-card" style={{ boxShadow: "var(--orh-shadow-md)" }}>
            {/* Card Header */}
            <div style={{ padding: "1.5rem 1.5rem 1rem 1.5rem", borderBottom: "1px solid var(--orh-border)", textAlign: "center" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "var(--orh-teal-subtle)",
                  color: "var(--orh-teal)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Icon name="user" size={26} />
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--orh-navy)", margin: "0 0 0.35rem 0" }}>
                Patient Portal Access
              </h1>
              <p style={{ fontSize: "0.86rem", color: "var(--orh-text-muted)", margin: 0 }}>
                Manage appointments, review test results, and view billing details from Oda Roba General Hospital.
              </p>
            </div>

            {/* Auth Sub-Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--orh-border)", background: "#fafcfc" }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login")
                  setAuthError(null)
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem 0.5rem",
                  background: activeTab === "login" ? "#ffffff" : "transparent",
                  border: "none",
                  borderBottom: activeTab === "login" ? "3px solid var(--orh-teal)" : "3px solid transparent",
                  color: activeTab === "login" ? "var(--orh-navy)" : "var(--orh-text-muted)",
                  fontWeight: activeTab === "login" ? 600 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("activate")
                  setAuthError(null)
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem 0.5rem",
                  background: activeTab === "activate" ? "#ffffff" : "transparent",
                  border: "none",
                  borderBottom: activeTab === "activate" ? "3px solid var(--orh-teal)" : "3px solid transparent",
                  color: activeTab === "activate" ? "var(--orh-navy)" : "var(--orh-text-muted)",
                  fontWeight: activeTab === "activate" ? 600 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Activate Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("recovery")
                  setAuthError(null)
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem 0.5rem",
                  background: activeTab === "recovery" ? "#ffffff" : "transparent",
                  border: "none",
                  borderBottom: activeTab === "recovery" ? "3px solid var(--orh-teal)" : "3px solid transparent",
                  color: activeTab === "recovery" ? "var(--orh-navy)" : "var(--orh-text-muted)",
                  fontWeight: activeTab === "recovery" ? 600 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Forgot Password
              </button>
            </div>

            <div className="portal-card-body" style={{ padding: "1.5rem" }}>
              {authError && (
                <div
                  style={{
                    background: "var(--orh-danger-bg)",
                    border: "1px solid #fecaca",
                    color: "var(--orh-danger)",
                    borderRadius: "var(--orh-radius-md)",
                    padding: "0.75rem 1rem",
                    fontSize: "0.84rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon name="warning" size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div
                  style={{
                    background: "var(--orh-success-bg)",
                    border: "1px solid #c6ebd2",
                    color: "var(--orh-success)",
                    borderRadius: "var(--orh-radius-md)",
                    padding: "0.75rem 1rem",
                    fontSize: "0.84rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon name="check" size={16} />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {activeTab === "login" && (
                <form onSubmit={handleLoginSubmit}>
                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="portal-identifier">
                      Medical Record Number (MRN) or Registered Phone
                    </label>
                    <input
                      id="portal-identifier"
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. ORH-26-00104 or +251 91 234 5678"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                    <div className="portal-form-help">Enter the MRN printed on your Oda Roba hospital card.</div>
                  </div>

                  <div className="portal-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <label className="portal-form-label" htmlFor="portal-password" style={{ margin: 0 }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("recovery")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--orh-teal)",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="portal-password"
                      type="password"
                      className="portal-form-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", color: "var(--orh-text)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember this device
                    </label>

                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--orh-text-muted)",
                        fontSize: "0.76rem",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Fill Demo Credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="portal-btn portal-btn-primary"
                    style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icon name="refresh" size={16} /> Authenticating…
                      </>
                    ) : (
                      <>
                        <Icon name="lock" size={16} /> Sign In to Patient Portal
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: ACTIVATE ACCOUNT */}
              {activeTab === "activate" && (
                <form onSubmit={handleActivationSubmit}>
                  <p style={{ fontSize: "0.82rem", color: "var(--orh-text-muted)", marginTop: 0, marginBottom: "1rem" }}>
                    If this is your first time using the online portal, provide the 6-digit activation code printed on your patient card or invoice receipt.
                  </p>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="activate-mrn">
                      Hospital MRN
                    </label>
                    <input
                      id="activate-mrn"
                      type="text"
                      className="portal-form-input"
                      placeholder="ORH-26-XXXXX"
                      value={activateMrn}
                      onChange={(e) => setActivateMrn(e.target.value)}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="activate-code">
                      6-Digit Activation Code
                    </label>
                    <input
                      id="activate-code"
                      type="text"
                      maxLength={6}
                      className="portal-form-input"
                      placeholder="e.g. 849201"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="activate-new-pass">
                      Create Password
                    </label>
                    <input
                      id="activate-new-pass"
                      type="password"
                      className="portal-form-input"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="activate-confirm-pass">
                      Confirm Password
                    </label>
                    <input
                      id="activate-confirm-pass"
                      type="password"
                      className="portal-form-input"
                      placeholder="Retype password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="portal-btn portal-btn-primary"
                    style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem" }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Activating…" : "Activate My Account"}
                  </button>
                </form>
              )}

              {/* TAB 3: FORGOT PASSWORD */}
              {activeTab === "recovery" && (
                <form onSubmit={handleRecoverySubmit}>
                  <p style={{ fontSize: "0.82rem", color: "var(--orh-text-muted)", marginTop: 0, marginBottom: "1rem" }}>
                    Enter your registered phone number or MRN. We will send a secure one-time verification code via SMS to reset your password.
                  </p>

                  <div className="portal-form-group">
                    <label className="portal-form-label" htmlFor="recovery-id">
                      Registered Phone Number or MRN
                    </label>
                    <input
                      id="recovery-id"
                      type="text"
                      className="portal-form-input"
                      placeholder="+251 9X XXX XXXX or ORH-26-XXXXX"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="portal-btn portal-btn-primary"
                    style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem" }}
                    disabled={isLoading || recoverySent}
                  >
                    {isLoading ? "Sending Code…" : recoverySent ? "Code Dispatched" : "Send Recovery Code"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--orh-teal)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Assistance Footer */}
            <div
              style={{
                background: "#f8fafb",
                borderTop: "1px solid var(--orh-border)",
                padding: "1rem 1.5rem",
                fontSize: "0.78rem",
                color: "var(--orh-text-muted)",
                textAlign: "center",
              }}
            >
              Need assistance accessing your records? Visit the Hospital Helpdesk at Bale Robe, or call patient assistance at{" "}
              <strong style={{ color: "var(--orh-navy)" }}>+251 22 665 2300</strong>.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
