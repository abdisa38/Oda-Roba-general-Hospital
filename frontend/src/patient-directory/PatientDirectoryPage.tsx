import { useEffect, useMemo, useRef, useState } from "react"
import Icon from "../Icon"
import { AccessDeniedPage } from "../permissions/components"
import PreviewDialog from "../permissions/PreviewDialog"
import { Button, Heading, Text } from "../permissions/ui"
import {
  birthDisplay,
  dateLabel,
  defaultSort,
  emptyFilters,
  filterPatients,
  patients,
  type DateFilters,
  type DirectoryPatient,
  type PatientSort,
  type SearchScope,
} from "./model"
import {
  MobilePatientList,
  PatientDirectoryEmptyState,
  PatientDirectoryErrorState,
  PatientDirectoryHeader,
  PatientDirectoryLoadingState,
  PatientFilterPanel,
  PatientFilterToolbar,
  PatientPagination,
  PatientSearchField,
  PatientTable,
  PossibleDuplicateNotice,
} from "./components"
import "./patient-directory.css"

export default function PatientDirectoryPage({
  state,
  permissions,
  onNavigate,
  onReady,
}: {
  state: string
  permissions: Set<string>
  onNavigate: (id: string) => void
  onReady: () => void
}) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<SearchScope>("all")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [appliedScope, setAppliedScope] = useState<SearchScope>("all")
  const [filters, setFilters] = useState<DateFilters>(emptyFilters)
  const [sort, setSort] = useState<PatientSort>(defaultSort)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [filterPanel, setFilterPanel] = useState(false)
  const [selected, setSelected] = useState<DirectoryPatient | null>(null)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  useEffect(() => {
    setSelected(null)
    setFilterPanel(false)
  }, [state])
  const source = state === "empty" ? [] : patients
  const matching = useMemo(
    () =>
      state === "no-matches"
        ? []
        : filterPatients(source, appliedQuery, appliedScope, filters, sort),
    [state, source, appliedQuery, appliedScope, filters, sort],
  )
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / size)),
  )
  const visible = matching.slice((currentPage - 1) * size, currentPage * size)
  const loading = state === "loading" || busy
  const canRegister = permissions.has("registration")
  const activeFilterCount = Number(!!filters.from) + Number(!!filters.to)
  const pendingSearch =
    query !== appliedQuery || (!!query && scope !== appliedScope)
  function refresh() {
    if (timer.current) clearTimeout(timer.current)
    setBusy(true)
    timer.current = setTimeout(() => setBusy(false), 300)
  }
  function search() {
    if (loading) return
    setQuery(query.trim())
    setAppliedQuery(query.trim())
    setAppliedScope(scope)
    setPage(1)
    onReady()
    refresh()
  }
  function clearSearch() {
    setQuery("")
    setAppliedQuery("")
    setAppliedScope(scope)
    setPage(1)
    onReady()
  }
  function changeFilters(next: DateFilters) {
    setFilters(next)
    setPage(1)
    setFilterPanel(false)
    onReady()
    refresh()
  }
  function changeSort(next: PatientSort) {
    setSort(next)
    setPage(1)
  }
  const register = () => {
    if (canRegister) onNavigate("registration")
  }
  if (!permissions.has("directory"))
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  return (
    <div className="patient-directory-page">
      <PatientDirectoryHeader canRegister={canRegister} onRegister={register} />
      <div className="patient-directory-context">
        <span>
          <Icon name="shield" size={14} />
          Demographic records only · contacts masked
        </span>
        <span className="patient-sample-label">
          FICTIONAL DATA · DESIGN PREVIEW
        </span>
      </div>
      <section
        className="patient-directory-surface"
        aria-label="Patient directory search and results"
      >
        <div className="patient-directory-tools">
          <PatientSearchField
            query={query}
            scope={scope}
            onQuery={setQuery}
            onScope={setScope}
            onSubmit={search}
            onClear={clearSearch}
            loading={loading}
          />
          <div id="patient-search-help" className="patient-search-help">
            <span>
              {pendingSearch
                ? "Search text changed. Select Search to update the results."
                : "Select Search or press Enter to apply. Filters stay in place."}
            </span>
            <span>This search is limited to the patient directory.</span>
          </div>
          <PatientFilterToolbar
            filters={filters}
            onOpen={() => setFilterPanel(true)}
            onRemove={(key) => changeFilters({ ...filters, [key]: "" })}
            onClear={() => changeFilters(emptyFilters)}
            sort={sort}
            onSort={changeSort}
          />
        </div>
        <div
          className="patient-results-heading"
          aria-live="polite"
          aria-atomic="true"
        >
          <div>
            <Heading level={2}>Patient Records</Heading>
            <span>
              {loading
                ? "Retrieving sample results…"
                : state === "error"
                  ? "Results unavailable"
                  : `${matching.length} ${
                      matching.length === 1 ? "sample record" : "sample records"
                    }${activeFilterCount || appliedQuery ? " · filtered" : ""}`}
            </span>
          </div>
          <span>
            {appliedQuery
              ? `Results for “${appliedQuery}”`
              : "All permitted sample records"}
            {!loading && state !== "error" && (
              <small>
                Sort:{" "}
                {sort.field === "registered"
                  ? "registration date"
                  : sort.field === "name"
                    ? "patient name"
                    : "patient ID"}{" "}
                · {sort.direction === "asc" ? "ascending" : "descending"}
              </small>
            )}
          </span>
        </div>
        {loading ? (
          <PatientDirectoryLoadingState />
        ) : state === "error" ? (
          <PatientDirectoryErrorState
            onRetry={() => {
              onReady()
              refresh()
            }}
          />
        ) : matching.length === 0 ? (
          <PatientDirectoryEmptyState
            emptyDataset={source.length === 0}
            canRegister={canRegister}
            onClear={clearSearch}
            onFilters={() => setFilterPanel(true)}
            onRegister={register}
          />
        ) : (
          <>
            <PatientTable
              patients={visible}
              sort={sort}
              onSort={changeSort}
              onView={setSelected}
            />
            <MobilePatientList patients={visible} onView={setSelected} />
            <PatientPagination
              page={currentPage}
              total={matching.length}
              size={size}
              onPage={setPage}
              onSize={(next) => {
                setSize(next)
                setPage(1)
              }}
            />
          </>
        )}
      </section>
      <PossibleDuplicateNotice />
      <details className="patient-directory-notes">
        <summary>
          <Icon name="info" size={15} />
          Prompt 19 · Interaction notes & open decisions
          <Icon name="chevron" size={14} />
        </summary>
        <Heading level={3}>Focused lookup, not a clinical dashboard</Heading>
        <Text>
          Search is submitted deliberately with Search or Enter. Text edits do
          not fetch or change results until submitted. Search and clear retain
          date filters; applying filters retains the submitted query. Search,
          filters, sort, and page size reset to page 1. Default sorting is
          registration date descending, then patient ID ascending. The default
          10 rows is a design choice.
        </Text>
        <Text>
          All names, birth details, contacts, identifiers, dates, and totals are
          fictional examples. Existing Prompt 18 identity examples are reused.
          New memory-only registrations are not added to a persistent directory.
          IDs are not the hospital's confirmed convention. Search matches only
          local example fixtures, never a backend or a real patient.
        </Text>
        <Text>
          Record status, sex/category, clinical department, appointment status,
          and encounter filters are omitted pending hospital approval. Patient
          identity, masking, authorized data scope, phone search, multilingual
          collation, record correction, duplicate investigation, merging
          authority, and date/calendar rules remain open decisions.
        </Text>
        <Text>
          Backend services must independently authorize search and every record
          open, apply scope before returning counts, support paging/sorting, and
          enforce current permissions. If a backend does not provide a total,
          omit the total and numbered pages; use server-provided next/previous
          availability instead. No totals are inferred here beyond the fixed
          sample dataset.
        </Text>
        <Text>
          View Patient opens only an identity-preview panel for the selected
          fictional record. The full Patient Profile, Appointment Management,
          and Queue Management are not built. Register Patient reuses Prompt
          18's search-before-registration workflow. No row is deleted or
          automatically merged.
        </Text>
      </details>
      {filterPanel && (
        <PatientFilterPanel
          filters={filters}
          onApply={changeFilters}
          onClose={() => setFilterPanel(false)}
        />
      )}
      {selected && (
        <PreviewDialog
          title="Patient workspace · identity preview"
          onClose={() => setSelected(null)}
          className="patient-identity-dialog"
        >
          <span className="permission-eyebrow">
            FICTIONAL RECORD / DEMOGRAPHIC SCOPE ONLY
          </span>
          <div className="patient-preview-identity">
            <span className="patient-id">{selected.id}</span>
            <Heading level={3}>{selected.name}</Heading>
          </div>
          <dl className="patient-preview-details">
            <div>
              <dt>Age / birth date</dt>
              <dd>
                {birthDisplay(selected).value}
                <small>{birthDisplay(selected).detail}</small>
              </dd>
            </div>
            <div>
              <dt>Contact · masked</dt>
              <dd>{selected.phoneToken ? selected.contact : "Not recorded"}</dd>
            </div>
            <div>
              <dt>Registration date</dt>
              <dd>{dateLabel(selected.registered)}</dd>
            </div>
            <div>
              <dt>Place of residence</dt>
              <dd>{selected.residence}</dd>
            </div>
          </dl>
          <Text>
            Verify identifying details according to the hospital's approved
            process. A similar name or shared phone number does not confirm
            identity.
          </Text>
          <div className="patient-preview-scope">
            <Icon name="info" size={18} />
            <Text>
              This is the intended patient-workspace entry concept, not the
              complete Prompt 20 profile. No appointment, encounter, clinical
              record, or payment is created or displayed.
            </Text>
          </div>
          <Button
            className="button secondary"
            onClick={() => setSelected(null)}
          >
            Return to Directory
          </Button>
        </PreviewDialog>
      )}
    </div>
  )
}
