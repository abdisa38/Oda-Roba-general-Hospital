import type { InputHTMLAttributes, ReactNode } from "react"
import Icon from "../Icon"
import { Button, Heading, Input, Link, Select, Text } from "../permissions/ui"
import {
  birthDescription,
  displayName,
  fieldLabels,
  type Errors,
  type FieldName,
  type PatientDraft,
  type PatientMatch,
} from "./model"

export function FieldErrorMessage({
  id,
  message,
}: {
  id: string
  message: string
}) {
  return (
    <span id={id} className="registration-field-error">
      <Icon name="info" size={14} />
      {message}
    </span>
  )
}
export function FormField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  help,
  type = "text",
  ...props
}: {
  name: FieldName
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  required?: boolean
  help?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "onChange" | "value" | "required" | "onBlur">) {
  const id = `registration-${name}`
  return (
    <div className={`registration-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        <span>{required ? "Required" : "Optional"}</span>
      </label>
      <Input
        {...props}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete="off"
        maxLength={160}
        aria-invalid={!!error}
        aria-describedby={
          [help ? `${id}-help` : "", error ? `${id}-error` : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {help && (
        <span id={`${id}-help`} className="registration-field-help">
          {help}
        </span>
      )}
      {error && <FieldErrorMessage id={`${id}-error`} message={error} />}
    </div>
  )
}
export function FormSectionHeader({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="registration-section-heading">
      <span>{number}</span>
      <div>
        <Heading level={2}>{title}</Heading>
        <Text>{description}</Text>
      </div>
    </div>
  )
}
type SectionProps = {
  draft: PatientDraft
  errors: Errors
  onChange: (field: FieldName, value: string) => void
  onBlur: (field: FieldName) => void
}
export function PatientInformationSection({
  draft,
  errors,
  onChange,
  onBlur,
}: SectionProps) {
  return (
    <section id="registration-section-patient" className="registration-section">
      <FormSectionHeader
        number="01"
        title="Patient Information"
        description="Record the name as given. Additional and family names may not apply."
      />
      <div className="registration-fields three">
        <FormField
          name="given"
          label="Given / primary name"
          required
          value={draft.given}
          onChange={(value) => onChange("given", value)}
          onBlur={() => onBlur("given")}
          error={errors.given}
          help="A single name is supported in this proposed model."
        />
        <FormField
          name="additional"
          label="Additional name"
          value={draft.additional}
          onChange={(value) => onChange("additional", value)}
        />
        <FormField
          name="family"
          label="Family name"
          value={draft.family}
          onChange={(value) => onChange("family", value)}
          help="Only if used in the patient's naming convention."
        />
      </div>
      <div className="registration-birth-block">
        <div className="registration-field">
          <label htmlFor="registration-birthMode">
            Birth information<span>Optional</span>
          </label>
          <Select
            id="registration-birthMode"
            value={draft.birthMode}
            onChange={(event) => onChange("birthMode", event.target.value)}
          >
            <option value="unknown">Not provided / unknown</option>
            <option value="date">Date of birth is known</option>
            <option value="age">Record age instead</option>
          </Select>
          <span className="registration-field-help">
            Never infer a birth date from an age.
          </span>
        </div>
        {draft.birthMode === "date" && (
          <FormField
            name="dob"
            label="Date of birth"
            required
            value={draft.dob}
            onChange={(value) => onChange("dob", value)}
            onBlur={() => onBlur("dob")}
            error={errors.dob}
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
            help="Demo date rule: on or before 18 Jun 2026. Hospital approval required."
          />
        )}
        {draft.birthMode === "age" && (
          <>
            <FormField
              name="age"
              label="Age in completed years"
              required
              value={draft.age}
              onChange={(value) => onChange("age", value)}
              onBlur={() => onBlur("age")}
              error={errors.age}
              inputMode="numeric"
              help="Recorded as of the illustrative 18 Jun 2026 date."
            />
            <div className="registration-field">
              <label htmlFor="registration-ageBasis">
                Age source<span>Optional</span>
              </label>
              <Select
                id="registration-ageBasis"
                value={draft.ageBasis}
                onChange={(event) => onChange("ageBasis", event.target.value)}
              >
                <option value="estimated">Estimated age</option>
                <option value="reported">
                  Patient / guardian reported age
                </option>
              </Select>
              <span className="registration-field-help">
                An age is not a verified date of birth.
              </span>
            </div>
          </>
        )}
      </div>
      <div className="registration-section-note">
        <Icon name="shield" size={14} />
        <span>
          Sex/classification, photographs, and government identification are not
          collected until hospital policy confirms their need.
        </span>
      </div>
    </section>
  )
}
export function PatientContactSection({
  draft,
  errors,
  onChange,
  onBlur,
}: SectionProps) {
  return (
    <section id="registration-section-contact" className="registration-section">
      <FormSectionHeader
        number="02"
        title="Contact Information"
        description="A patient can be registered without a phone number or email address."
      />
      <div className="registration-fields three">
        {(["phone", "alternatePhone"] as const).map((field) => (
          <FormField
            key={field}
            name={field}
            label={fieldLabels[field]!}
            value={draft[field]}
            type="tel"
            onChange={(value) => onChange(field, value)}
            onBlur={() => onBlur(field)}
            error={errors[field]}
            help={
              field === "phone"
                ? "Local or international format. No fixed country code or length is imposed."
                : undefined
            }
          />
        ))}
        <FormField
          name="email"
          label="Email address"
          type="email"
          value={draft.email}
          onChange={(value) => onChange("email", value)}
          onBlur={() => onBlur("email")}
          error={errors.email}
          placeholder="person@example.test"
        />
      </div>
      <div className="registration-fields">
        <FormField
          name="residence"
          label="Place of residence"
          value={draft.residence}
          onChange={(value) => onChange("residence", value)}
          help="Only the administrative address detail needed for registration; no required region hierarchy."
        />
      </div>
    </section>
  )
}
export function EmergencyContactSection({
  draft,
  errors,
  onChange,
  onBlur,
}: SectionProps) {
  return (
    <section
      id="registration-section-emergency"
      className="registration-section"
    >
      <FormSectionHeader
        number="03"
        title="Emergency Contact"
        description="Optional. This person is separate from the patient; leave blank if unavailable."
      />
      <div className="registration-fields three">
        <FormField
          name="emergencyName"
          label="Emergency contact name"
          value={draft.emergencyName}
          onChange={(value) => onChange("emergencyName", value)}
        />
        <FormField
          name="relationship"
          label="Relationship"
          value={draft.relationship}
          onChange={(value) => onChange("relationship", value)}
        />
        <FormField
          name="emergencyPhone"
          label="Emergency contact phone"
          type="tel"
          value={draft.emergencyPhone}
          onChange={(value) => onChange("emergencyPhone", value)}
          onBlur={() => onBlur("emergencyPhone")}
          error={errors.emergencyPhone}
        />
      </div>
      <div className="registration-section-note">
        <Icon name="info" size={14} />
        <span>
          No clinical history or additional sensitive administrative details are
          collected in this proposed registration workflow.
        </span>
      </div>
    </section>
  )
}
export function PatientMatchList({
  matches,
  onReview,
  onSelect,
}: {
  matches: PatientMatch[]
  onReview: (match: PatientMatch) => void
  onSelect: (match: PatientMatch) => void
}) {
  return (
    <div className="registration-match-list">
      {matches.map((match) => (
        <div key={match.id} className="registration-match">
          <span className="registration-match-avatar">
            <Icon name="user" size={21} />
          </span>
          <div>
            <strong>{match.name}</strong>
            <span>{match.id} · Fictional record</span>
            <small>
              Birth: {match.birth} <span>·</span> Contact: {match.contact}
            </small>
          </div>
          <div className="registration-match-actions">
            <Button
              className="registration-text-button"
              onClick={() => onReview(match)}
            >
              Review Patient
              <Icon name="eye" size={14} />
            </Button>
            <Button
              className="button secondary"
              onClick={() => onSelect(match)}
            >
              Select Existing Patient
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
export function ExistingPatientSearch({
  query,
  onQuery,
  onSearch,
  onClear,
  status,
  matches,
  onReview,
  onSelect,
  onContinue,
}: {
  query: string
  onQuery: (value: string) => void
  onSearch: () => void
  onClear: () => void
  status: "idle" | "loading" | "results" | "none" | "error"
  matches: PatientMatch[]
  onReview: (match: PatientMatch) => void
  onSelect: (match: PatientMatch) => void
  onContinue: () => void
}) {
  return (
    <section className="registration-section registration-search-section">
      <FormSectionHeader
        number="01"
        title="Check for an existing patient"
        description="Search for a patient before creating a new record."
      />
      <form
        className="registration-search-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSearch()
        }}
      >
        <label htmlFor="registration-existing-search">
          Patient ID, full name, or permitted phone number
        </label>
        <div>
          <span className="registration-search-input">
            <Icon name="search" size={18} />
            <Input
              id="registration-existing-search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              autoComplete="off"
              placeholder="Try Hana, DEMO-EX-101, or 0000000101"
              maxLength={100}
              disabled={status === "loading"}
            />
          </span>
          <Button
            type="submit"
            className="button"
            disabled={!query.trim() || status === "loading"}
          >
            <Icon name="search" size={16} />
            Search
          </Button>
          <Button
            className="button secondary"
            onClick={onClear}
            disabled={status === "loading"}
          >
            Clear
          </Button>
        </div>
        <span className="registration-field-help">
          Fictional examples only. Search fields and identity-verification rules
          require hospital approval.
        </span>
      </form>
      {status === "idle" && (
        <div className="registration-search-guidance">
          <span>
            <Icon name="shield" size={23} />
          </span>
          <Heading level={3}>Start with the patient, not a new record</Heading>
          <Text>
            Look up an identifier or combine identifying details. Similar names
            alone do not confirm a match.
          </Text>
          <div>
            <span>01 · Search existing records</span>
            <span>02 · Verify identifying details</span>
            <span>03 · Register only when appropriate</span>
          </div>
        </div>
      )}
      {status === "loading" && (
        <RegistrationLoadingState title="Searching demonstration records…" />
      )}
      {status === "error" && (
        <RegistrationErrorState
          title="Patient search is unavailable"
          message="The search service couldn't be reached in this scenario. Retry before starting a new registration; no results have been verified."
          onRetry={onSearch}
        />
      )}
      {status === "results" && (
        <>
          <div className="registration-results-heading">
            <Heading level={3}>
              {matches.length} possible{" "}
              {matches.length === 1 ? "match" : "matches"}
            </Heading>
            <span>Not an identity confirmation</span>
          </div>
          <PatientMatchList
            matches={matches}
            onReview={onReview}
            onSelect={onSelect}
          />
          <div className="registration-search-bottom">
            <Text>None of these records is a confirmed match?</Text>
            <Button className="registration-text-button" onClick={onContinue}>
              Review possible duplicates before continuing
              <Icon name="arrow" size={14} />
            </Button>
          </div>
        </>
      )}
      {status === "none" && (
        <div className="registration-no-results" role="status">
          <Icon name="search" size={27} />
          <Heading level={3}>No matching patient was found.</Heading>
          <Text>
            No results does not guarantee that no duplicate exists. Check
            alternate spellings or identifiers when available.
          </Text>
          <Button className="button" onClick={onContinue}>
            Continue to New Registration
            <Icon name="arrow" size={16} />
          </Button>
        </div>
      )}
    </section>
  )
}
export function PossibleDuplicateReview({
  draft,
  matches,
  confirmed,
  onConfirm,
  onReview,
  onReturn,
  onContinue,
}: {
  draft?: PatientDraft
  matches: PatientMatch[]
  confirmed: boolean
  onConfirm: (value: boolean) => void
  onReview: (match: PatientMatch) => void
  onReturn: () => void
  onContinue: () => void
}) {
  return (
    <section className="registration-section">
      <div className="registration-duplicate-intro">
        <Icon name="info" size={26} />
        <div>
          <Heading level={2}>Review a possible existing record</Heading>
          <Text>
            This information needs to be reviewed before registration can
            continue. Similar details do not prove that two records belong to
            the same person.
          </Text>
        </div>
      </div>
      {draft && (
        <div className="registration-new-comparison">
          <span>ENTERED INFORMATION · NOT SAVED</span>
          <strong>{displayName(draft)}</strong>
          <Text>
            {birthDescription(draft)} · Contact:{" "}
            {draft.phone ? `••• ${draft.phone.slice(-4)}` : "Not provided"}
          </Text>
        </div>
      )}
      <PatientMatchList
        matches={matches}
        onReview={onReview}
        onSelect={onReview}
      />
      <div className="registration-section-note">
        <Icon name="shield" size={15} />
        <span>
          Verify approved identifying details. This prototype does not implement
          matching rules or merge records.
        </span>
      </div>
      <label className="registration-checkbox">
        <Input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onConfirm(event.target.checked)}
        />
        <span>
          I reviewed the available identifying details and am demonstrating a
          different patient.
          <small>
            Proposed confirmation only; the hospital must approve who can
            proceed and what evidence is required.
          </small>
        </span>
      </label>
      <RegistrationActionFooter
        secondary="Return to search / edit"
        onSecondary={onReturn}
        primary="Continue new registration preview"
        onPrimary={onContinue}
        disabled={!confirmed}
      />
    </section>
  )
}
export function RegistrationActionFooter({
  primary,
  secondary,
  onPrimary,
  onSecondary,
  disabled = false,
  note,
  submit = false,
}: {
  primary: string
  secondary: string
  onPrimary?: () => void
  onSecondary: () => void
  disabled?: boolean
  note?: string
  submit?: boolean
}) {
  return (
    <div className="registration-action-footer">
      {note && (
        <span>
          <Icon name="lock" size={14} />
          {note}
        </span>
      )}
      <div>
        <Button className="button secondary" onClick={onSecondary}>
          {secondary}
        </Button>
        <Button
          type={submit ? "submit" : "button"}
          className="button"
          onClick={onPrimary}
          disabled={disabled}
        >
          {primary}
          <Icon name="arrow" size={16} />
        </Button>
      </div>
    </div>
  )
}
export function RegistrationReview({
  draft,
  onEdit,
  onSubmit,
  onBack,
  submitting,
}: {
  draft: PatientDraft
  onEdit: (section: string) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}) {
  const groups: {
    title: string
    id: string
    values: [string, string][]
  }[] = [
    {
      title: "Patient Information",
      id: "patient",
      values: [
        ["Patient name", displayName(draft)],
        ["Birth information", birthDescription(draft)],
      ],
    },
    {
      title: "Contact Information",
      id: "contact",
      values: [
        ["Primary phone", draft.phone],
        ["Alternative phone", draft.alternatePhone],
        ["Email address", draft.email],
        ["Place of residence", draft.residence],
      ],
    },
    {
      title: "Emergency Contact",
      id: "emergency",
      values: [
        ["Contact name", draft.emergencyName],
        ["Relationship", draft.relationship],
        ["Contact phone", draft.emergencyPhone],
      ],
    },
  ]
  return (
    <div className="registration-review">
      <div className="registration-review-intro">
        <Icon name="check" size={21} />
        <div>
          <Heading level={2}>Review before registration</Heading>
          <Text>
            Confirm the demographic details. The final action below demonstrates
            creating only a patient record.
          </Text>
        </div>
      </div>
      {groups.map((group) => (
        <section key={group.id} className="registration-section">
          <div className="registration-review-heading">
            <Heading level={2}>{group.title}</Heading>
            <Button
              className="registration-text-button"
              onClick={() => onEdit(group.id)}
              disabled={submitting}
            >
              <Icon name="edit" size={15} />
              Edit {group.title}
            </Button>
          </div>
          <dl>
            {group.values.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <div className="registration-section-note">
        <Icon name="info" size={15} />
        <span>
          Additional details, demographic classifications, and photos are not
          collected pending hospital policy approval.
        </span>
      </div>
      <RegistrationActionFooter
        primary={submitting ? "Demonstrating submission…" : "Register Patient"}
        secondary="Back to Edit"
        onSecondary={onBack}
        onPrimary={onSubmit}
        disabled={submitting}
        note="Prototype only · nothing is sent or saved to a hospital system."
      />
    </div>
  )
}
export function RegistrationErrorState({
  title,
  message,
  onRetry,
  children,
}: {
  title: string
  message: string
  onRetry?: () => void
  children?: ReactNode
}) {
  return (
    <div className="registration-error-state" role="alert">
      <Icon name="info" size={20} />
      <div>
        <Heading level={3}>{title}</Heading>
        <Text>{message}</Text>
        {onRetry && (
          <Button className="registration-text-button" onClick={onRetry}>
            Retry
            <Icon name="arrow" size={15} />
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
export function RegistrationLoadingState({ title }: { title: string }) {
  return (
    <div className="registration-loading" role="status" aria-busy="true">
      <Icon name="clock" size={23} />
      <Text>{title}</Text>
      <div />
      <div />
    </div>
  )
}
export function RegistrationSuccessState({
  id,
  draft,
  onView,
  onAnother,
  onHome,
}: {
  id: string
  draft: PatientDraft
  onView: () => void
  onAnother: () => void
  onHome: () => void
}) {
  return (
    <section className="registration-success" role="status">
      <span className="registration-success-icon">
        <Icon name="check" size={35} />
      </span>
      <span className="permission-eyebrow">
        ILLUSTRATIVE SUCCESS · NO BACKEND RECORD
      </span>
      <Heading level={1}>Patient Registered Successfully</Heading>
      <Text>
        The patient record has been created{" "}
        <strong>in this demonstration only</strong>. No real patient information
        was submitted or saved.
      </Text>
      <div className="registration-assigned-id">
        <span>ILLUSTRATIVE PATIENT IDENTIFIER</span>
        <strong>{id}</strong>
        <Text>{displayName(draft)}</Text>
        <small>
          The actual patient-ID format must be confirmed by the hospital.
        </small>
      </div>
      <div className="registration-success-actions">
        <Button className="button" onClick={onView}>
          View Patient Record
          <Icon name="arrow" size={16} />
        </Button>
        <Button className="button secondary" onClick={onAnother}>
          Register Another Patient
        </Button>
        <Button className="registration-text-button" onClick={onHome}>
          Return to Reception
          <Icon name="arrow" size={15} />
        </Button>
      </div>
      <div className="registration-section-note">
        <Icon name="shield" size={15} />
        <span>
          Registration is separate from check-in, appointments, encounters,
          diagnoses, prescriptions, and invoices. None has been created.
        </span>
      </div>
    </section>
  )
}
export function SessionExpiredState() {
  return (
    <section className="registration-success">
      <Icon name="lock" size={32} />
      <Heading level={1}>Your staff session has expired</Heading>
      <Text>
        Sign in again to continue. Entered patient information is hidden and
        this prototype does not retain it across sign-in. Nothing was submitted.
      </Text>
      <Link href="/staff/sign-in" className="button">
        Return to sign-in
        <Icon name="arrow" size={16} />
      </Link>
    </section>
  )
}
