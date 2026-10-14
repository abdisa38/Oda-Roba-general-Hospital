import { useEffect, useRef, useState } from "react"
import Icon from "../Icon"
import { AccessDeniedPage } from "../permissions/components"
import PreviewDialog from "../permissions/PreviewDialog"
import { Button, Heading, Input, Select, Text } from "../permissions/ui"
import {
  birthDescription,
  displayName,
  draftCandidates,
  emptyDraft,
  fieldLabels,
  sampleMatches,
  searchMatches,
  validateDraft,
  type Errors,
  type FieldName,
  type PatientDraft,
  type PatientMatch,
} from "./model"
import {
  EmergencyContactSection,
  ExistingPatientSearch,
  PatientContactSection,
  PatientInformationSection,
  PossibleDuplicateReview,
  RegistrationActionFooter,
  RegistrationErrorState,
  RegistrationLoadingState,
  RegistrationReview,
  RegistrationSuccessState,
  SessionExpiredState,
} from "./components"
import "./registration.css"

type Step = "search" | "form" | "review" | "duplicate" | "success" | "existing"
type SearchState = "idle" | "loading" | "results" | "none" | "error"
type Outcome = "success" | "failure" | "duplicate" | "offline" | "loading" | "expired" | "restricted"
export type RegistrationLeaveGuard = (leave: () => void) => void
type Props = {
  state: string
  permissions: Set<string>
  onNavigate: (id: string) => void
  onReady: () => void
  onGuard: (guard: RegistrationLeaveGuard | null) => void
}
export default function PatientRegistrationPage({
  state,
  permissions,
  onNavigate,
  onReady,
  onGuard,
}: Props) {
  const [step, setStep] = useState<Step>("search")
  const [draft, setDraft] = useState<PatientDraft>({ ...emptyDraft })
  const [errors, setErrors] = useState<Errors>({})
  const [query, setQuery] = useState("")
  const [searchState, setSearchState] = useState<SearchState>("idle")
  const [matches, setMatches] = useState<PatientMatch[]>([])
  const [searchOutcome, setSearchOutcome] = useState("fixture")
  const [outcome, setOutcome] = useState<Outcome>("success")
  const [candidates, setCandidates] = useState<PatientMatch[]>([])
  const [duplicateOrigin, setDuplicateOrigin] =
    useState<"search" | "form" | "review">("search")
  const [confirmedDifferent, setConfirmedDifferent] = useState(false)
  const [acknowledgedDraft, setAcknowledgedDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<"failure" | "offline" | null>(null)
  const [blocked, setBlocked] = useState<"expired" | "restricted" | null>(null)
  const [matchView, setMatchView] = useState<PatientMatch | null>(null)
  const [verified, setVerified] = useState(false)
  const [existing, setExisting] = useState<PatientMatch | null>(null)
  const [successId, setSuccessId] = useState("")
  const [showSuccessRecord, setShowSuccessRecord] = useState(false)
  const [leaveDialog, setLeaveDialog] = useState(false)
  const dirty = useRef(false)
  const leaveAction = useRef<(() => void) | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idSequence = useRef(0)
  const stepRef = useRef<Step>(step)
  const editFocus = useRef<string | null>(null)
  useEffect(() => {
    onGuard((leave) => {
      if (dirty.current) {
        leaveAction.current = leave
        setMatchView(null)
        setLeaveDialog(true)
      } else leave()
    })
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", unload)
    return () => {
      onGuard(null)
      window.removeEventListener("beforeunload", unload)
      if (searchTimer.current) clearTimeout(searchTimer.current)
      if (submitTimer.current) clearTimeout(submitTimer.current)
    }
  }, [onGuard])
  useEffect(() => {
    if (stepRef.current !== step) {
      stepRef.current = step
      requestAnimationFrame(() => {
        const section = editFocus.current
        editFocus.current = null
        const element = section
          ? document.getElementById(`registration-section-${section}`)
          : null
        if (element) {
          element.scrollIntoView({ block: "start" })
          element.querySelector<HTMLInputElement>("input")?.focus()
        } else document.getElementById("registration-content")?.focus()
      })
    }
  }, [step])
  function change(field: FieldName, value: string) {
    dirty.current = true
    setAcknowledgedDraft("")
    setFailure(null)
    setDraft((current) =>
      field === "birthMode"
        ? {
            ...current,
            birthMode: value as PatientDraft["birthMode"],
            dob: "",
            age: "",
          }
        : { ...current, [field]: value },
    )
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      if (field === "birthMode") {
        delete next.dob
        delete next.age
      }
      return next
    })
  }
  function blur(field: FieldName) {
    const next = validateDraft(draft)
    setErrors((current) => ({ ...current, [field]: next[field] }))
  }
  function runSearch() {
    if (!query.trim() || searchState === "loading") return
    setSearchState("loading")
    setMatches([])
    searchTimer.current = setTimeout(() => {
      const found = searchOutcome === "no-match" ? [] : searchMatches(query)
      setMatches(found)
      setSearchState(
        searchOutcome === "error" ? "error" : found.length ? "results" : "none",
      )
    }, 350)
  }
  function clearSearch() {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    setQuery("")
    setMatches([])
    setSearchState("idle")
  }
  function reviewMatch(match: PatientMatch) {
    setVerified(false)
    setMatchView(match)
  }
  function compare(
    found: PatientMatch[],
    origin: "search" | "form" | "review",
  ) {
    setCandidates(found)
    setDuplicateOrigin(origin)
    setConfirmedDifferent(false)
    setStep("duplicate")
  }
  function startRegistration() {
    if (searchState === "results") compare(matches, "search")
    else if (searchState === "none") setStep("form")
  }
  function validateAndReview() {
    const next = validateDraft(draft)
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      requestAnimationFrame(() =>
        document.getElementById("registration-error-summary")?.focus(),
      )
      return
    }
    const found = draftCandidates(draft)
    if (found.length && acknowledgedDraft !== JSON.stringify(draft))
      compare(found, "form")
    else {
      setFailure(null)
      setStep("review")
    }
  }
  function submit() {
    if (submitting || !permissions.has("registration")) return
    const validation = validateDraft(draft)
    if (Object.values(validation).some(Boolean)) {
      setErrors(validation)
      setStep("form")
      return
    }
    setFailure(null)
    setSubmitting(true)
    if (outcome === "loading") return
    submitTimer.current = setTimeout(() => {
      setSubmitting(false)
      if (outcome === "failure" || outcome === "offline") setFailure(outcome)
      else if (outcome === "expired" || outcome === "restricted") {
        dirty.current = false
        setDraft({ ...emptyDraft })
        setBlocked(outcome)
      } else if (
        outcome === "duplicate" &&
        acknowledgedDraft !== JSON.stringify(draft)
      )
        compare([sampleMatches[0]], "review")
      else {
        dirty.current = false
        idSequence.current += 1
        setSuccessId(`DEMO-NEW-${String(idSequence.current).padStart(3, "0")}`)
        setStep("success")
      }
    }, 450)
  }
  function edit(section?: string) {
    editFocus.current = section || null
    setStep("form")
    setFailure(null)
  }
  function reset() {
    dirty.current = false
    setDraft({ ...emptyDraft })
    setErrors({})
    clearSearch()
    setFailure(null)
    setCandidates([])
    setAcknowledgedDraft("")
    setConfirmedDifferent(false)
    setStep("search")
    setOutcome("success")
    setExisting(null)
    setSuccessId("")
    setBlocked(null)
  }
  const visibleSearchState =
    state === "loading"
      ? "loading"
      : state === "error"
        ? "error"
        : state === "no-matches" || state === "empty"
          ? "none"
          : searchState
  if (blocked === "expired") return <SessionExpiredState />
  if (blocked === "restricted" || !permissions.has("registration"))
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  if (!permissions.has("directory"))
    return (
      <RegistrationErrorState
        title="Existing-patient lookup is restricted"
        message="Your configured permissions do not include patient lookup. Contact your administrator to confirm the approved identity-verification workflow before creating a record. No patient matches are shown."
      >
        <Button className="button secondary" onClick={() => onNavigate("home")}>
          Return to authorized home
        </Button>
      </RegistrationErrorState>
    )
  return (
    <div className="registration-page">
      <div className="registration-page-header">
        <div>
          <span className="permission-eyebrow">
            PATIENT OPERATIONS / DEMOGRAPHIC REGISTRATION
          </span>
          <Heading level={1}>Register Patient</Heading>
          <Text>
            Create a patient record using accurate demographic and contact
            information.
          </Text>
        </div>
        <Button className="button secondary" onClick={() => onNavigate("home")}>
          <Icon name="close" size={16} />
          Cancel
        </Button>
      </div>
      <div className="registration-demo-note">
        <Icon name="shield" size={15} />
        <span>
          Design preview · Use fictional information only. No hospital records
          are searched, sent, or saved.
        </span>
      </div>
      <div
        className="registration-stage-strip"
        aria-label="Registration progress"
      >
        {[
          "Check existing records",
          "Enter patient details",
          "Review & register",
        ].map((label, index) => (
          <span
            key={label}
            aria-current={
              (index === 0 && (step === "search" || step === "existing")) ||
              (index === 1 && step === "form") ||
              (index === 2 && (step === "review" || step === "success"))
                ? "step"
                : undefined
            }
            className={
              (
                step === "search" || step === "existing"
                  ? index === 0
                  : step === "form" || step === "duplicate"
                    ? index === 1
                    : index === 2
              )
                ? "is-active"
                : ""
            }
          >
            <span>{index + 1}</span>
            {label}
            {index < 2 && <Icon name="chevron" size={13} />}
          </span>
        ))}
      </div>
      <div className="registration-preview-controls">
        <div>
          <Icon name="eye" size={15} />
          <strong>Review controls</strong>
        </div>
        <label>
          Search scenario
          <Select
            value={searchOutcome}
            onChange={(event) => {
              setSearchOutcome(event.target.value)
              setSearchState("idle")
              setMatches([])
              onReady()
            }}
            disabled={searchState === "loading"}
          >
            <option value="fixture">Fictional examples</option>
            <option value="no-match">No matches</option>
            <option value="error">Service unavailable</option>
          </Select>
        </label>
        <label>
          Submission outcome
          <Select
            value={outcome}
            onChange={(event) => setOutcome(event.target.value as Outcome)}
            disabled={submitting}
          >
            <option value="success">Illustrative success</option>
            <option value="failure">Submission failed</option>
            <option value="duplicate">Possible duplicate</option>
            <option value="offline">Connection unavailable</option>
            <option value="loading">Loading preview</option>
            <option value="expired">Session expired</option>
            <option value="restricted">Permission denied</option>
          </Select>
        </label>
      </div>
      <div
        id="registration-content"
        className="registration-content"
        tabIndex={-1}
      >
        {step === "search" && (
          <ExistingPatientSearch
            query={query}
            onQuery={(value) => {
              setQuery(value)
              setSearchState("idle")
              setMatches([])
              onReady()
            }}
            onSearch={() => {
              onReady()
              runSearch()
            }}
            onClear={() => {
              onReady()
              clearSearch()
            }}
            status={visibleSearchState}
            matches={matches}
            onReview={reviewMatch}
            onSelect={reviewMatch}
            onContinue={() => {
              if (visibleSearchState === "none") {
                onReady()
                setStep("form")
              } else startRegistration()
            }}
          />
        )}
        {step === "form" && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              validateAndReview()
            }}
          >
            <div className="registration-identity-check">
              <Icon name="check" size={18} />
              <div>
                <strong>Existing-patient check reviewed</strong>
                <Text>
                  No confirmed existing record selected. Matching rules require
                  hospital approval; another check may be needed before
                  submission.
                </Text>
              </div>
              <Button
                className="registration-text-button"
                onClick={() => setStep("search")}
              >
                Search again
                <Icon name="search" size={14} />
              </Button>
            </div>
            {Object.values(errors).some(Boolean) && (
              <div
                id="registration-error-summary"
                className="registration-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <Heading level={3}>Check the highlighted information</Heading>
                <Text>Correct these fields before continuing to review.</Text>
                {Object.entries(errors)
                  .filter(([, message]) => message)
                  .map(([field, message]) => (
                    <Button
                      key={field}
                      onClick={() =>
                        document
                          .getElementById(`registration-${field}`)
                          ?.focus()
                      }
                    >
                      <Icon name="info" size={14} />
                      {fieldLabels[(field as FieldName)]}: {message}
                    </Button>
                  ))}
              </div>
            )}
            <PatientInformationSection
              draft={draft}
              errors={errors}
              onChange={change}
              onBlur={blur}
            />
            <PatientContactSection
              draft={draft}
              errors={errors}
              onChange={change}
              onBlur={blur}
            />
            <EmergencyContactSection
              draft={draft}
              errors={errors}
              onChange={change}
              onBlur={blur}
            />
            <RegistrationActionFooter
              primary="Review Registration"
              secondary="Cancel"
              onSecondary={() => onNavigate("home")}
              submit
              note="Only the patient's primary name is mandatory in this proposed model."
            />
          </form>
        )}
        {step === "review" && (
          <>
            {failure && (
              <RegistrationErrorState
                title={
                  failure === "offline"
                    ? "Connection unavailable"
                    : "Registration submission failed"
                }
                message={
                  failure === "offline"
                    ? "No record was saved or queued for synchronization. Your entered information is still available in this open preview. Retry when the connection is available."
                    : "The patient record couldn't be created. Your entered information is still available. Please try again."
                }
                onRetry={submit}
              />
            )}
            {submitting && (
              <>
                <RegistrationLoadingState title="Demonstrating registration submission…" />
                {outcome === "loading" && (
                  <Button
                    className="registration-text-button"
                    onClick={() => setSubmitting(false)}
                  >
                    Stop loading preview & return to review
                  </Button>
                )}
              </>
            )}
            <RegistrationReview
              draft={draft}
              onEdit={edit}
              onSubmit={submit}
              onBack={() => edit()}
              submitting={submitting}
            />
          </>
        )}
        {step === "duplicate" && (
          <PossibleDuplicateReview
            draft={duplicateOrigin === "search" ? undefined : draft}
            matches={candidates}
            confirmed={confirmedDifferent}
            onConfirm={setConfirmedDifferent}
            onReview={reviewMatch}
            onReturn={() =>
              setStep(
                duplicateOrigin === "search"
                  ? "search"
                  : duplicateOrigin === "review"
                    ? "review"
                    : "form",
              )
            }
            onContinue={() => {
              if (!confirmedDifferent) return
              setAcknowledgedDraft(JSON.stringify(draft))
              setStep(duplicateOrigin === "search" ? "form" : "review")
            }}
          />
        )}
        {step === "success" && (
          <RegistrationSuccessState
            id={successId}
            draft={draft}
            onView={() => setShowSuccessRecord(true)}
            onAnother={reset}
            onHome={() => onNavigate("home")}
          />
        )}
        {step === "existing" && existing && (
          <section className="registration-success">
            <span className="registration-success-icon">
              <Icon name="check" size={30} />
            </span>
            <Heading level={1}>Existing patient selected</Heading>
            <Text>
              A demonstration selection only. No new patient record,
              appointment, check-in, or encounter was created.
            </Text>
            <div className="registration-assigned-id">
              <span>EXISTING ILLUSTRATIVE IDENTIFIER</span>
              <strong>{existing.id}</strong>
              <Text>{existing.name}</Text>
            </div>
            <RegistrationActionFooter
              secondary="Return to search"
              onSecondary={reset}
              primary="Return to Reception"
              onPrimary={() => onNavigate("home")}
            />
          </section>
        )}
      </div>
      <details className="registration-policy-notes">
        <summary>
          <Icon name="info" size={15} />
          Prompt 18 · Open decisions & backend dependencies
          <Icon name="chevron" size={14} />
        </summary>
        <Text>
          Approve naming conventions, required fields, demographic
          classifications, photographs, identity-verification attributes, phone
          formats, date/age rules, staff confirmation authority, and patient-ID
          format. Approve duplicate-match thresholds, review evidence, and a
          separate restricted merging policy.
        </Text>
        <Text>
          This prototype searches only fixed fictional records and simulates
          submission outcomes. The server must independently enforce current
          permissions, validate fields, recheck duplicates transactionally,
          issue persistent identifiers, and prevent duplicate submissions.
          Session expiry, permission refresh, unsaved-data recovery, audit
          logging, and offline policy remain open decisions. No offline save or
          synchronization is implemented.
        </Text>
      </details>
      {matchView && (
        <PreviewDialog
          title="Review patient identity"
          onClose={() => setMatchView(null)}
        >
          <div className="registration-match-dialog">
            <span className="permission-eyebrow">
              FICTIONAL ADMINISTRATIVE DETAILS ONLY
            </span>
            <Heading level={3}>{matchView.name}</Heading>
            <dl>
              <div>
                <dt>Patient identifier</dt>
                <dd>{matchView.id}</dd>
              </div>
              <div>
                <dt>Birth information</dt>
                <dd>{matchView.birth}</dd>
              </div>
              <div>
                <dt>Masked contact</dt>
                <dd>{matchView.contact}</dd>
              </div>
              <div>
                <dt>Place of residence</dt>
                <dd>{matchView.residence}</dd>
              </div>
            </dl>
            <Text>
              A name alone is insufficient. If these details do not confirm
              identity, return to search and follow the hospital's approved
              verification process.
            </Text>
            <label className="registration-checkbox">
              <Input
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
              />
              <span>
                I am demonstrating verification using more than the name.
                <small>
                  Illustrative confirmation; actual required evidence is not
                  defined.
                </small>
              </span>
            </label>
            <Text>
              Selecting an existing record discards any unsaved new-registration
              draft after this explicit confirmation.
            </Text>
            <RegistrationActionFooter
              secondary="Return to search / comparison"
              onSecondary={() => setMatchView(null)}
              primary="Use Existing Patient"
              disabled={!verified || !permissions.has("directory")}
              onPrimary={() => {
                if (!verified || !permissions.has("directory")) return
                dirty.current = false
                setExisting(matchView)
                setDraft({ ...emptyDraft })
                setErrors({})
                setMatchView(null)
                setStep("existing")
              }}
            />
          </div>
        </PreviewDialog>
      )}
      {showSuccessRecord && (
        <PreviewDialog
          title="Created patient record · demonstration"
          onClose={() => setShowSuccessRecord(false)}
        >
          <div className="registration-match-dialog">
            <Heading level={3}>{displayName(draft)}</Heading>
            <dl>
              <div>
                <dt>Illustrative patient identifier</dt>
                <dd>{successId}</dd>
              </div>
              <div>
                <dt>Birth information</dt>
                <dd>{birthDescription(draft)}</dd>
              </div>
            </dl>
            <Text>
              This is the same memory-only demonstration identifier assigned on
              the success screen. The complete Patient Profile is not built
              here. No clinical records or downstream transactions exist.
            </Text>
          </div>
        </PreviewDialog>
      )}
      {leaveDialog && (
        <PreviewDialog
          title="Leave this registration?"
          onClose={() => setLeaveDialog(false)}
        >
          <Text>
            Your entered information is only available in this open preview.
            Leaving discards the unsaved draft; nothing has been saved to a
            hospital system.
          </Text>
          <RegistrationActionFooter
            secondary="Keep editing"
            onSecondary={() => {
              leaveAction.current = null
              setLeaveDialog(false)
            }}
            primary="Discard draft & leave"
            onPrimary={() => {
              dirty.current = false
              setLeaveDialog(false)
              const leave = leaveAction.current
              leaveAction.current = null
              leave?.()
            }}
          />
        </PreviewDialog>
      )}
    </div>
  )
}
