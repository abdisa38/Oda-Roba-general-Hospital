import { useState } from "react"
import Icon from "./Icon"
import { StaffSignInPanel, type AuthVariant } from "./auth/StaffAuthComponents"
import "./staff-auth.css"
import { Link } from "./permissions/ui"

type AuthStateDescription = {
  key: AuthVariant
  label: string
  group: string
  note: string
}
const states: AuthStateDescription[] = [
  {
    key: "default",
    label: "Default",
    group: "A · Primary Desktop Login",
    note: "Empty inputs, masked password, and no error. Use the primary sign-in route to present the clean composition.",
  },
  {
    key: "focus",
    label: "Focused input",
    group: "B · Form Interaction States",
    note: "Actual keyboard focus moves to the staff identifier. The focus outline is offset from the input border.",
  },
  {
    key: "visible",
    label: "Password visible",
    group: "B · Form Interaction States",
    note: "Visibility is enabled in this preview. Enter only a fictional value; the primary screen always masks passwords by default.",
  },
  {
    key: "validation",
    label: "Required fields",
    group: "B · Form Interaction States",
    note: "Persistent labels, inline warnings, and aria-describedby identify each error. Submitting moves focus to the first missing field.",
  },
  {
    key: "failure",
    label: "Authentication failure",
    group: "C · Authentication Error and Loading States",
    note: "Illustrative credential failure. This generic message does not disclose account existence. No credentials are verified.",
  },
  {
    key: "loading",
    label: "Loading",
    group: "C · Authentication Error and Loading States",
    note: "Fixed loading preview. Inputs, visibility control, recovery action, and submission are disabled. The layout stays stable.",
  },
  {
    key: "recovery",
    label: "Password recovery",
    group: "D · Password Recovery",
    note: "Recovery identifier and delivery channel await policy approval. Continue previews a generic confirmation; nothing is sent.",
  },
  {
    key: "confirmation",
    label: "Recovery confirmation",
    group: "D · Password Recovery",
    note: "Generic confirmation copy avoids account enumeration. This is explicitly a preview, not proof of recovery delivery.",
  },
  {
    key: "expired",
    label: "Session expired",
    group: "E · Session and Access States",
    note: "Staff can sign in again without revealing previous workspace or patient data.",
  },
  {
    key: "restricted",
    label: "Access restricted",
    group: "E · Session and Access States",
    note: "No protected workspace is rendered. Return to the authorized entry point or ask an administrator about permissions.",
  },
]
function HospitalIdentity() {
  return (
    <aside className="auth-identity">
      <div className="auth-hospital-brand">
        <span className="brand-symbol">
          <Icon name="cross" size={28} />
        </span>
        <div>
          <strong>ODA ROBA HOSPITAL</strong>
          <small>Bale Robe, Ethiopia</small>
        </div>
      </div>
      <div className="auth-identity-content">
        <div className="auth-product-label">
          HOSPITAL INFORMATION MANAGEMENT SYSTEM
        </div>
        <div className="auth-product-name">
          ORHIMS
          <span />
        </div>
        <h2>
          Connected care.
          <br />
          Trusted information.
        </h2>
        <p>
          A shared workspace designed to connect authorized hospital teams and
          patient workflows.
        </p>
        <div className="auth-workflow" aria-hidden="true">
          <div className="auth-workflow-line" />
          <div className="auth-workflow-node">
            <Icon name="user" size={21} />
          </div>
          <div className="auth-workflow-center">
            <Icon name="cross" size={26} />
          </div>
          <div className="auth-workflow-node">
            <Icon name="building" size={21} />
          </div>
          <span className="auth-workflow-caption">
            PEOPLE
            <span />
            INFORMATION
            <span />
            CARE
          </span>
        </div>
      </div>
      <div className="auth-identity-foot">
        <Icon name="shield" size={17} />
        <span>Purpose-built for hospital teams.</span>
      </div>
    </aside>
  )
}
export default function StaffAuthentication() {
  const gallery = window.location.pathname === "/staff/authentication/states"
  const [variant, setVariant] = useState<AuthVariant>("default")
  const selected = states.find((state) => state.key === variant)!
  return (
    <main
      className={`staff-auth${gallery ? " auth-gallery" : ""}`}
      id="main"
      tabIndex={-1}
    >
      <a className="skip-link" href="#staff-entry">
        Skip to staff sign-in
      </a>
      {gallery && (
        <header className="auth-gallery-header">
          <div>
            <div className="eyebrow">ORHIMS · PHASE 03</div>
            <h1>03 — Staff Authentication</h1>
            <p>
              Interaction states, responsive rules, reusable components, and
              open decisions.
            </p>
          </div>
          <a className="button secondary" href="/staff/sign-in">
            Primary login <Icon name="arrow" size={17} />
          </a>
        </header>
      )}
      {gallery && (
        <nav
          className="auth-state-nav"
          aria-label="Authentication design states"
        >
          {states.map((state) => (
            <button
              key={state.key}
              aria-pressed={variant === state.key}
              onClick={() => setVariant(state.key)}
            >
              {state.label}
            </button>
          ))}
        </nav>
      )}
      {gallery && (
        <div className="auth-state-description">
          <strong>{selected.group}</strong>
          <p>{selected.note}</p>
        </div>
      )}
      <div className="auth-shell">
        <HospitalIdentity />
        <div className="auth-entry-area" id="staff-entry">
          <div className="auth-entry-top">
            <span>
              <Icon name="lock" size={14} /> STAFF WORKSPACE
            </span>
            <a href="/home">
              Hospital website <Icon name="arrow" size={14} />
            </a>
          </div>
          <div className="auth-panel-position">
            <StaffSignInPanel
              key={variant}
              variant={variant}
              preview={gallery}
            />
          </div>
          <div className="auth-entry-footer">
            <span>Oda Roba Hospital · ORHIMS</span>
            <a
              href={gallery ? "/staff/sign-in" : "/staff/authentication/states"}
            >
              {gallery ? "Return to sign-in" : "Design states & decisions"}
              <Icon name="arrow" size={13} />
            </a>
          </div>
        </div>
      </div>
      {!gallery && (
        <div className="auth-prototype-note">
          <Icon name="info" size={14} />
          <span>
            Hospital Information Management System (ORHIMS). Role-based staff authentication.
          </span>
          <Link href="/staff/doctor" className="auth-text-button">Doctor Workspace</Link>
          <Link href="/staff/nurse" className="auth-text-button">Nurse Workspace</Link>
          <Link href="/staff/reception" className="auth-text-button">Reception Workspace</Link>
        </div>
      )}
      {gallery && (
        <section className="auth-design-notes">
          <article>
            <div className="eyebrow">F · RESPONSIVE VARIANTS</div>
            <h2>One task. Every screen.</h2>
            <dl>
              <div>
                <dt>1440 × 900 · Desktop</dt>
                <dd>
                  Balanced identity and sign-in regions. The full primary
                  experience fits the viewport.
                </dd>
              </div>
              <div>
                <dt>1280 · Laptop</dt>
                <dd>Reduced side padding, same form targets and hierarchy.</dd>
              </div>
              <div>
                <dt>768 · Tablet</dt>
                <dd>
                  Compact hospital identity bar above the form; secondary
                  workflow graphic removed.
                </dd>
              </div>
              <div>
                <dt>390 · Mobile</dt>
                <dd>
                  Single-column layout, full-width primary action, and 48-pixel
                  input targets. Errors wrap naturally.
                </dd>
              </div>
            </dl>
          </article>
          <article>
            <div className="eyebrow">G · REUSABLE COMPONENTS & VARIANTS</div>
            <h2>Designed for implementation.</h2>
            <p>
              StaffSignInPanel · StaffIdentifierInput · PasswordInput ·
              AuthenticationButton · InlineValidation · AuthAlert. Recovery,
              confirmation, session expiration, and restricted access share the
              panel.
            </p>
            <p>
              Reuses the site’s navy, teal, neutral palette, Manrope / Inter
              typography, button styling, brand mark, radius, and line-icon
              system. No separate internal component library or approved
              ORHIMS-specific token set was found in the repository.
            </p>
          </article>
          <article className="auth-open-decisions">
            <div className="eyebrow">H · OPEN DECISIONS</div>
            <h2>Confirm with hospital administration.</h2>
            <ul>
              <li>
                Approved staff identifiers, account provisioning, and identity
                provider.
              </li>
              <li>
                Password policy, additional verification, and lockout /
                rate-limiting rules.
              </li>
              <li>
                Recovery eligibility, delivery channel, and administrator
                support process.
              </li>
              <li>
                Session duration, shared-computer policy, and role-based access
                enforcement.
              </li>
              <li>
                Remembered-device policy. The checkbox is intentionally omitted
                until approved.
              </li>
              <li>
                Approved internal ORHIMS wordmark and any product-specific
                tokens. Existing hospital identity is reused, not replaced.
              </li>
            </ul>
            <p>
              This prototype provides no authentication, session storage,
              authorization, recovery delivery, or security certification.
              Backend validation and protected routes must be implemented before
              operational use.
            </p>
          </article>
        </section>
      )}
    </main>
  )
}
