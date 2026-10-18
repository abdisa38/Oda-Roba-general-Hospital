import { useState } from "react"
import Icon from "../Icon"
import PreviewDialog from "../permissions/PreviewDialog"
import { Button, Heading, Input, Select, Text } from "../permissions/ui"
import {
  birthDisplay,
  dateLabel,
  validateDateFilters,
  type DateFilters,
  type DirectoryPatient,
  type PatientSort,
  type SearchScope,
  type SortField,
} from "./model"

export function PatientDirectoryHeader({
  canRegister,
  onRegister,
  onCreate,
}: {
  canRegister: boolean
  onRegister: () => void
  onCreate: () => void
}) {
  return (
    <div className="patient-directory-heading">
      <div>
        <span className="permission-eyebrow">RECEPTION / PATIENT RECORDS</span>
        <Heading level={1}>Patient Directory</Heading>
        <Text>Search and manage patient demographic records.</Text>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Button className="button" onClick={onCreate}>
          <Icon name="plus" size={17} />
          Add Patient
        </Button>
        {canRegister && (
          <Button className="button secondary" onClick={onRegister}>
            <Icon name="user" size={17} />
            Register Patient
          </Button>
        )}
      </div>
    </div>
  )
}
export function PatientSearchField({
  query,
  scope,
  onQuery,
  onScope,
  onSubmit,
  onClear,
  loading,
}: {
  query: string
  scope: SearchScope
  onQuery: (query: string) => void
  onScope: (scope: SearchScope) => void
  onSubmit: () => void
  onClear: () => void
  loading: boolean
}) {
  return (
    <form
      className="patient-search-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="patient-search-scope">
        <label htmlFor="patient-search-scope">Search by</label>
        <Select
          id="patient-search-scope"
          value={scope}
          onChange={(event) => onScope(event.target.value as SearchScope)}
          disabled={loading}
        >
          <option value="all">ID, name, or phone</option>
          <option value="id">Patient ID</option>
          <option value="name">Patient name</option>
          <option value="phone">Phone number</option>
        </Select>
      </div>
      <div className="patient-search-main">
        <label htmlFor="patient-directory-query">Search this directory</label>
        <div className="patient-search-input">
          <Icon name={loading ? "clock" : "search"} size={18} />
          <Input
            id="patient-directory-query"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search by patient ID, name, or phone number…"
            autoComplete="off"
            maxLength={120}
            disabled={loading}
            aria-describedby="patient-search-help"
          />
          {query && (
            <Button
              className="icon-button"
              aria-label="Clear patient search"
              onClick={onClear}
              disabled={loading}
            >
              <Icon name="close" size={16} />
            </Button>
          )}
        </div>
      </div>
      <Button type="submit" className="button" disabled={loading}>
        {loading ? "Searching…" : "Search"}
        <Icon name="arrow" size={16} />
      </Button>
    </form>
  )
}
export function AppliedFilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <Button
      className="patient-filter-chip"
      aria-label={`Remove filter: ${label}`}
      onClick={onRemove}
    >
      {label}
      <Icon name="close" size={13} />
    </Button>
  )
}
export function PatientFilterToolbar({
  filters,
  onOpen,
  onRemove,
  onClear,
  sort,
  onSort,
}: {
  filters: DateFilters
  onOpen: () => void
  onRemove: (key: keyof DateFilters) => void
  onClear: () => void
  sort: PatientSort
  onSort: (sort: PatientSort) => void
}) {
  const count = Number(!!filters.from) + Number(!!filters.to)
  return (
    <div className="patient-filter-toolbar">
      <Button
        className={`button secondary${count ? " has-filters" : ""}`}
        onClick={onOpen}
      >
        <Icon name="filter" size={16} />
        Filters
        {count > 0 && <span className="patient-filter-count">{count}</span>}
      </Button>
      <div
        className="patient-applied-filters"
        aria-label="Applied registration date filters"
      >
        {filters.from && (
          <AppliedFilterChip
            label={`Registered from ${dateLabel(filters.from)}`}
            onRemove={() => onRemove("from")}
          />
        )}
        {filters.to && (
          <AppliedFilterChip
            label={`Registered through ${dateLabel(filters.to)}`}
            onRemove={() => onRemove("to")}
          />
        )}
        {count > 0 ? (
          <Button className="patient-text-button" onClick={onClear}>
            Clear all filters
          </Button>
        ) : (
          <span>All registration dates</span>
        )}
      </div>
      <div className="patient-mobile-sort">
        <label htmlFor="patient-directory-sort">Sort by</label>
        <Select
          id="patient-directory-sort"
          value={`${sort.field}-${sort.direction}`}
          onChange={(event) => {
            const [field, direction] = event.target.value.split("-")
            onSort({
              field: field as SortField,
              direction: direction as "asc" | "desc",
            })
          }}
        >
          <option value="registered-desc">Registration · latest first</option>
          <option value="registered-asc">Registration · earliest first</option>
          <option value="name-asc">Name · A–Z</option>
          <option value="name-desc">Name · Z–A</option>
          <option value="id-asc">Patient ID · ascending</option>
          <option value="id-desc">Patient ID · descending</option>
        </Select>
      </div>
    </div>
  )
}
export function PatientFilterPanel({
  filters,
  onApply,
  onClose,
}: {
  filters: DateFilters
  onApply: (filters: DateFilters) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(filters)
  const [error, setError] = useState("")
  return (
    <PreviewDialog
      title="Filter patient records"
      onClose={onClose}
      className="patient-filter-dialog"
    >
      <Text>
        Narrow records by their registration date—not an appointment, encounter,
        or queue status.
      </Text>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const next = validateDateFilters(draft)
          setError(next)
          if (!next) onApply(draft)
        }}
      >
        <div className="patient-filter-fields">
          <div>
            <label htmlFor="patient-date-from">
              Registered from<span>Optional · inclusive</span>
            </label>
            <Input
              id="patient-date-from"
              type="date"
              value={draft.from}
              onChange={(event) => {
                setDraft({ ...draft, from: event.target.value })
                setError("")
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "patient-date-error" : undefined}
            />
          </div>
          <div>
            <label htmlFor="patient-date-to">
              Registered through<span>Optional · inclusive</span>
            </label>
            <Input
              id="patient-date-to"
              type="date"
              value={draft.to}
              onChange={(event) => {
                setDraft({ ...draft, to: event.target.value })
                setError("")
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "patient-date-error" : undefined}
            />
          </div>
        </div>
        {error && (
          <div
            id="patient-date-error"
            className="patient-filter-error"
            role="alert"
          >
            <Icon name="info" size={16} />
            {error}
          </div>
        )}
        <div className="patient-filter-explanation">
          <Icon name="shield" size={17} />
          <Text>
            Sex, record status, department, and encounter filters are omitted
            until hospital policy confirms their purpose and permitted access.
          </Text>
        </div>
        <div className="patient-filter-actions">
          <Button
            className="patient-text-button"
            onClick={() => {
              setDraft({ from: "", to: "" })
              setError("")
            }}
          >
            Reset dates
          </Button>
          <Button className="button secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="button">
            Apply Filters
            <Icon name="check" size={16} />
          </Button>
        </div>
      </form>
    </PreviewDialog>
  )
}
export function PatientRowActions({
export function PatientRowActions({
  patient,
  onView,
  onEdit,
  onDelete,
}: {
  patient: DirectoryPatient
  onView: (patient: DirectoryPatient) => void
  onEdit: (patient: DirectoryPatient) => void
  onDelete: (patient: DirectoryPatient) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Button
        className="patient-view-action"
        aria-label={`View Patient ${patient.name}, ${patient.id}`}
        onClick={() => onView(patient)}
        title="View details"
        style={{ padding: "4px 8px", borderRadius: "4px", background: "var(--mist)", fontSize: "11px" }}
      >
        <Icon name="eye" size={13} />
        View
      </Button>
      <Button
        className="patient-view-action"
        aria-label={`Edit Patient ${patient.name}, ${patient.id}`}
        onClick={() => onEdit(patient)}
        title="Edit patient record"
        style={{ padding: "4px 8px", borderRadius: "4px", background: "#f0f9ff", color: "#0284c7", fontSize: "11px" }}
      >
        <Icon name="edit" size={13} />
        Edit
      </Button>
      <Button
        className="patient-view-action"
        aria-label={`Delete Patient ${patient.name}, ${patient.id}`}
        onClick={() => onDelete(patient)}
        title="Archive or delete patient record"
        style={{ padding: "4px 8px", borderRadius: "4px", background: "var(--emergency-bg)", color: "var(--emergency)", fontSize: "11px" }}
      >
        <Icon name="x-circle" size={13} />
        Delete
      </Button>
    </div>
  )
}
export function PatientTableRow({
  patient,
  onView,
  onEdit,
  onDelete,
}: {
  patient: DirectoryPatient
  onView: (patient: DirectoryPatient) => void
  onEdit: (patient: DirectoryPatient) => void
  onDelete: (patient: DirectoryPatient) => void
}) {
  const birth = birthDisplay(patient)
  return (
    <tr>
      <td>
        <span className="patient-id">{patient.id}</span>
      </td>
      <td>
        <span className="patient-name">{patient.name}</span>
      </td>
      <td>
        <span>{birth.value}</span>
        <small>{birth.detail}</small>
      </td>
      <td>
        <span className={patient.phoneToken ? "" : "patient-missing-value"}>
          {patient.phoneToken ? patient.contact : "Not recorded"}
        </span>
      </td>
      <td>
        <time dateTime={patient.registered}>
          {dateLabel(patient.registered)}
        </time>
      </td>
      <td>
        <PatientRowActions
          patient={patient}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}
export function PatientTable({
  patients,
  sort,
  onSort,
  onView,
  onEdit,
  onDelete,
}: {
  patients: DirectoryPatient[]
  sort: PatientSort
  onSort: (sort: PatientSort) => void
  onView: (patient: DirectoryPatient) => void
  onEdit: (patient: DirectoryPatient) => void
  onDelete: (patient: DirectoryPatient) => void
}) {
  const header = (field: SortField, label: string) => (
    <th
      scope="col"
      aria-sort={
        sort.field === field
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <Button
        aria-label={`Sort by ${label}, ${
          sort.field === field && sort.direction === "asc"
            ? "descending"
            : "ascending"
        }`}
        onClick={() =>
          onSort({
            field,
            direction:
              sort.field === field && sort.direction === "asc" ? "desc" : "asc",
          })
        }
      >
        {label}
        <span
          className={`patient-sort-icon ${
            sort.field === field ? sort.direction : "unsorted"
          }`}
        >
          <Icon name="arrow" size={13} />
        </span>
      </Button>
    </th>
  )
  return (
    <table className="patient-directory-table">
      <caption className="permission-sr-only">
        Fictional patient demographic directory. Contact details are masked.
        Select View Patient to review identifying information.
      </caption>
      <thead>
        <tr>
          {header("id", "Patient ID")}
          {header("name", "Patient name")}
          <th scope="col">Age / birth date</th>
          <th scope="col">Phone (masked)</th>
          {header("registered", "Registration date")}
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <PatientTableRow
            key={patient.id}
            patient={patient}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}
export function MobilePatientList({
  patients,
  onView,
  onEdit,
  onDelete,
}: {
  patients: DirectoryPatient[]
  onView: (patient: DirectoryPatient) => void
  onEdit: (patient: DirectoryPatient) => void
  onDelete: (patient: DirectoryPatient) => void
}) {
  return (
    <div className="patient-mobile-list">
      {patients.map((patient) => {
        const birth = birthDisplay(patient)
        return (
          <article key={patient.id}>
            <div className="patient-mobile-identity">
              <span className="patient-id">{patient.id}</span>
              <Heading level={3}>{patient.name}</Heading>
            </div>
            <dl>
              <div>
                <dt>Age / birth date</dt>
                <dd>
                  {birth.value}
                  <small>{birth.detail}</small>
                </dd>
              </div>
              <div>
                <dt>Phone · masked</dt>
                <dd>{patient.phoneToken ? patient.contact : "Not recorded"}</dd>
              </div>
              <div>
                <dt>Registration date</dt>
                <dd>
                  <time dateTime={patient.registered}>
                    {dateLabel(patient.registered)}
                  </time>
                </dd>
              </div>
            </dl>
            <PatientRowActions
              patient={patient}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </article>
        )
      })}
    </div>
  )
}
    </div>
  )
}
export function PatientPagination({
  page,
  total,
  size,
  onPage,
  onSize,
}: {
  page: number
  total: number
  size: number
  onPage: (page: number) => void
  onSize: (size: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / size))
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const buttons = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => start + index,
  )
  return (
    <div className="patient-pagination">
      <span>
        Showing{" "}
        <strong>
          {total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)}
        </strong>{" "}
        of <strong>{total}</strong> sample records
      </span>
      <label htmlFor="patient-page-size">
        Rows per page
        <Select
          id="patient-page-size"
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </Select>
      </label>
      <nav aria-label="Patient result pages">
        <Button
          className="patient-page-button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <span className="patient-previous-arrow">
            <Icon name="arrow" size={15} />
          </span>
        </Button>
        {buttons.map((number) => (
          <Button
            key={number}
            className={`patient-page-button${
              number === page ? " is-current" : ""
            }`}
            aria-label={`Page ${number}`}
            aria-current={number === page ? "page" : undefined}
            onClick={() => onPage(number)}
          >
            {number}
          </Button>
        ))}
        <Button
          className="patient-page-button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          <Icon name="arrow" size={15} />
        </Button>
      </nav>
      <span className="patient-page-summary">
        Page {page} of {pages}
      </span>
    </div>
  )
}
export function PatientDirectoryEmptyState({
  emptyDataset,
  canRegister,
  onClear,
  onFilters,
  onRegister,
}: {
  emptyDataset: boolean
  canRegister: boolean
  onClear: () => void
  onFilters: () => void
  onRegister: () => void
}) {
  return (
    <div className="patient-directory-empty">
      <span>
        <Icon name={emptyDataset ? "user" : "search"} size={31} />
      </span>
      <Heading level={2}>
        {emptyDataset
          ? "No patient records are available to display."
          : "No patients match your search."}
      </Heading>
      <Text>
        {emptyDataset
          ? "The sample dataset is empty in this state. This is not a failed data request."
          : "Check spelling, identifiers, and registration dates. No results does not prove that the patient has no existing record."}
      </Text>
      <div>
        {!emptyDataset && (
          <>
            <Button className="button secondary" onClick={onClear}>
              Clear Search
            </Button>
            <Button className="button secondary" onClick={onFilters}>
              <Icon name="filter" size={15} />
              Adjust Filters
            </Button>
          </>
        )}
        {canRegister && (
          <Button className="button" onClick={onRegister}>
            Register New Patient
            <Icon name="arrow" size={15} />
          </Button>
        )}
      </div>
      <small>
        Registration opens the existing-patient check from Prompt 18. No record
        is created automatically.
      </small>
    </div>
  )
}
export function PatientDirectoryLoadingState() {
  return (
    <div className="patient-directory-loading" role="status" aria-busy="true">
      <span>
        <Icon name="clock" size={20} />
        Loading patient records…
      </span>
      {[1, 2, 3, 4, 5, 6].map((number) => (
        <div key={number}>
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}
export function PatientDirectoryErrorState({
  onRetry,
}: {
  onRetry: () => void
}) {
  return (
    <div
      className="patient-directory-empty patient-directory-error"
      role="alert"
    >
      <span>
        <Icon name="info" size={29} />
      </span>
      <Heading level={2}>Patient records couldn't be loaded.</Heading>
      <Text>
        Your search terms, filters, and sort order are still available. Retry to
        recover this demonstration request.
      </Text>
      <Button className="button secondary" onClick={onRetry}>
        Retry
        <Icon name="arrow" size={15} />
      </Button>
      <small>No offline copy or automatic synchronization is available.</small>
    </div>
  )
}
export function PossibleDuplicateNotice() {
  return (
    <div className="patient-identity-note">
      <Icon name="shield" size={15} />
      <span>
        Verify the patient using approved identifying details. Names and phone
        numbers alone do not establish identity. No delete or merge actions are
        available.
      </span>
    </div>
  )
}
