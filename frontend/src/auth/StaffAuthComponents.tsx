import { useEffect, useRef, useState, type ReactNode } from "react"
import Icon from "../Icon"

export type AuthVariant = "default" | "focus" | "visible" | "validation" | "failure" | "loading" | "recovery" | "confirmation" | "expired" | "restricted"

export function AuthAlert({
  children,
  title,
  error = false,
}: {
  children: ReactNode
  title: string
  error?: boolean
}) {
  return (
    <div
      className={`auth-alert${error ? " auth-alert-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      <Icon name={error ? "warning" : "info"} size={19} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}
export function InlineValidation({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <p id={id} className="auth-field-error">
      <Icon name="warning" size={14} />
      {children}
    </p>
  )
}
export function StaffIdentifierInput({
  value,
  onChange,
  error,
  disabled,
  inputRef,
  recovery = false,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  recovery?: boolean
}) {
  return (
    <div className="auth-field">
      <label htmlFor="staff-identifier">Staff ID or email</label>
      <input
        id="staff-identifier"
        ref={inputRef}
        name="username"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? "identifier-error"
            : recovery
              ? "recovery-guidance"
              : undefined
        }
      />
      {error && (
        <InlineValidation id="identifier-error">{error}</InlineValidation>
      )}
    </div>
  )
}
export function PasswordInput({
  value,
  onChange,
  error,
  disabled,
  initiallyVisible = false,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  initiallyVisible?: boolean
}) {
  const [visible, setVisible] = useState(initiallyVisible)
  return (
    <div className="auth-field">
      <label htmlFor="staff-password">Password</label>
      <div className="auth-password-wrap">
        <input
          id="staff-password"
          name="password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="current-password"
          required
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
        />
        <button
          type="button"
          className="auth-visibility"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls="staff-password"
          onClick={() => setVisible(!visible)}
          disabled={disabled}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={19} />
        </button>
      </div>
      {error && (
        <InlineValidation id="password-error">{error}</InlineValidation>
      )}
    </div>
  )
}
export function AuthenticationButton({
  loading,
  children,
}: {
  loading?: boolean
  children: ReactNode
}) {
  return (
    <button type="submit" className="button auth-submit" disabled={loading}>
      {loading ? (
        <>
          <Icon name="clock" size={18} /> Please wait…
        </>
      ) : (
        <>
          {children}
          <Icon name="arrow" size={18} />
        </>
      )}
    </button>
  )
}
export function StaffSignInPanel({
  variant = "default",
  preview = false,
}: {
  variant?: AuthVariant
  preview?: boolean
}) {
  const [screen, setScreen] = useState<AuthVariant>(variant)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    identifier?: string
    password?: string
  }>(
    variant === "validation"
      ? {
          identifier: "Enter your staff ID or email.",
          password: "Enter your password.",
        }
      : {},
  )
  const [unavailable, setUnavailable] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousScreen = useRef(screen)
  const recovery = screen === "recovery"
  const loading = screen === "loading"
  useEffect(() => {
    if (variant === "focus") inputRef.current?.focus()
  }, [variant])
  useEffect(() => {
    if (previousScreen.current !== screen) headingRef.current?.focus()
    previousScreen.current = screen
  }, [screen])
  function changeScreen(next: AuthVariant) {
    setScreen(next)
    setPassword("")
    setErrors({})
    setUnavailable(false)
  }
  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (loading) return
    const next = {
      identifier: !identifier.trim()
        ? "Enter your staff ID or email."
        : undefined,
      password: !recovery && !password ? "Enter your password." : undefined,
    }
    setErrors(next)
    if (next.identifier || next.password) {
      requestAnimationFrame(() =>
        document
          .getElementById(
            next.identifier ? "staff-identifier" : "staff-password",
          )
          ?.focus(),
      )
      return
    }
    // The prototype never sends, logs, stores, or verifies staff credentials.
    if (preview && recovery) {
      setIdentifier("")
      changeScreen("confirmation")
      return
    }
    setUnavailable(true)
  }
  return (
    <section className="auth-panel" aria-label="Staff authentication">
      <div className="auth-panel-kicker">
        <span className="auth-kicker-mark" /> AUTHORIZED STAFF ACCESS
      </div>
      {preview && (
        <div className="auth-preview-label">
          DESIGN STATE PREVIEW · NO AUTHENTICATION
        </div>
      )}
      {screen === "confirmation" ? (
        <>
          <span className="auth-result-icon">
            <Icon name="mail" size={25} />
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            Check your next steps
          </h1>
          <p className="auth-intro">
            If the details match an eligible staff account, recovery
            instructions will be provided through the hospital’s approved
            process.
          </p>
          <AuthAlert title="Illustrative confirmation">
            No recovery request has been sent. The recovery process and delivery
            channel require hospital approval.
          </AuthAlert>
          <button
            className="button auth-submit"
            onClick={() => changeScreen("default")}
          >
            Return to sign-in
            <Icon name="arrow" size={18} />
          </button>
        </>
      ) : screen === "restricted" ? (
        <>
          <span className="auth-result-icon">
            <Icon name="shield" size={25} />
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            Access restricted
          </h1>
          <p className="auth-intro">
            This account is not authorized to access the requested workspace.
          </p>
          <AuthAlert title="Use an authorized entry point">
            Contact your hospital administrator for help with access. This
            preview does not grant or verify permissions.
          </AuthAlert>
          <button
            className="button auth-submit"
            onClick={() => changeScreen("default")}
          >
            Return to staff sign-in
            <Icon name="arrow" size={18} />
          </button>
        </>
      ) : (
        <>
          <h1 ref={headingRef} tabIndex={-1}>
            {recovery ? "Recover your access" : "Welcome back"}
          </h1>
          <p className="auth-intro">
            {recovery
              ? "Enter your staff ID or email to begin the approved recovery process."
              : "Sign in to access your hospital workspace."}
          </p>
          {screen === "expired" && (
            <AuthAlert title="Your session has expired">
              Sign in again to continue. No previous workspace or patient
              details are shown here.
            </AuthAlert>
          )}
          {recovery && (
            <p className="auth-recovery-guidance" id="recovery-guidance">
              The hospital must confirm which identifiers and recovery channels
              are supported. Staff accounts are provisioned by administrators.
            </p>
          )}
          <form onSubmit={submit} noValidate aria-busy={loading}>
            <StaffIdentifierInput
              value={identifier}
              onChange={(value) => {
                setIdentifier(value)
                setErrors((current) => ({ ...current, identifier: undefined }))
                setUnavailable(false)
              }}
              error={errors.identifier}
              disabled={loading}
              inputRef={inputRef}
              recovery={recovery}
            />
            {!recovery && (
              <PasswordInput
                value={password}
                onChange={(value) => {
                  setPassword(value)
                  setErrors((current) => ({ ...current, password: undefined }))
                  setUnavailable(false)
                }}
                error={errors.password}
                disabled={loading}
                initiallyVisible={variant === "visible"}
              />
            )}
            {!recovery && (
              <div className="auth-options">
                <span>
                  <Icon name="lock" size={13} /> Staff accounts only
                </span>
                <button
                  type="button"
                  className="auth-text-button"
                  disabled={loading}
                  onClick={() => changeScreen("recovery")}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <AuthenticationButton loading={loading}>
              {recovery ? "Continue" : "Sign in"}
            </AuthenticationButton>
            <div className="auth-feedback" aria-live="polite">
              {loading && (
                <p role="status">
                  {preview
                    ? "Loading state preview. No credentials are being sent."
                    : "Signing in. Please wait."}
                </p>
              )}
              {screen === "failure" && !unavailable && (
                <AuthAlert error title="Unable to sign in">
                  Unable to sign in with those credentials. Check your details
                  and try again.
                </AuthAlert>
              )}
              {unavailable && (
                <AuthAlert
                  error
                  title={
                    recovery
                      ? "Recovery is not connected"
                      : "Staff sign-in is not connected"
                  }
                >
                  No {recovery ? "recovery request" : "credentials"} were sent.
                  This is a design preview; the hospital’s authentication
                  service must be connected before staff access is available.
                </AuthAlert>
              )}
            </div>
          </form>
          {recovery && (
            <button
              className="auth-back"
              onClick={() => changeScreen("default")}
            >
              <Icon name="arrow" size={16} /> Return to sign-in
            </button>
          )}
        </>
      )}
      <div className="auth-confidentiality">
        <Icon name="shield" size={19} />
        <p>
          For authorized hospital staff only. Protect confidential patient
          information and use only your own approved account.
        </p>
      </div>
      <p className="auth-admin-help">
        Need account access? Contact your hospital administrator.
      </p>
    </section>
  )
}
