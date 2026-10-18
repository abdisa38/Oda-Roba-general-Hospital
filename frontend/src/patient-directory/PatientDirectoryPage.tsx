import { useEffect, useMemo, useRef, useState } from "react"
import Icon from "../Icon"
import { AccessDeniedPage } from "../permissions/components"
import PreviewDialog from "../permissions/PreviewDialog"
import { Button, Heading, Text } from "../permissions/ui"
import { api } from "../api/client"
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
  const [patientList, setPatientList] = useState<DirectoryPatient[]>(patients)

  useEffect(() => {
    let mounted = true
    api.getPatients()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setPatientList(
            data.map((p) => ({
              id: p.id,
              name: p.name,
              birth: p.birth || p.dob || "Birth date not recorded",
              contact: p.contact || "No contact recorded",
              phoneToken: p.phoneToken || "",
              residence: p.residence || "Bale Robe, Ethiopia",
              registered: p.registered ? p.registered.slice(0, 10) : new Date().toISOString().slice(0, 10),
              estimatedAge: p.age,
            }))
          )
        }
      })
      .catch((err) => console.error("Database patient fetch notice:", err))
    return () => {
      mounted = false
    }
  }, [])
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

  // CRUD Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<DirectoryPatient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<DirectoryPatient | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null)

  // Add Patient Form State
  const [newName, setNewName] = useState("")
  const [newBirth, setNewBirth] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newResidence, setNewResidence] = useState("")

  // Edit Patient Form State
  const [editName, setEditName] = useState("")
  const [editBirth, setEditBirth] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editResidence, setEditResidence] = useState("")

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

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

  const source = state === "empty" ? [] : patientList
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
    setPage(1)
    onReady()
    refresh()
  }
  function changeFilters(next: DateFilters) {
    setFilters(next)
    setPage(1)
    onReady()
    refresh()
  }
  function changeSort(next: PatientSort) {
    setSort(next)
    setPage(1)
    refresh()
  }
  function register() {
    onNavigate("registration")
  }

  // --- CRUD HANDLERS ---
  const handleOpenAdd = () => {
    setNewName("")
    setNewBirth("")
    setNewPhone("")
    setNewResidence("")
    setIsAddModalOpen(true)
  }

  const handleSaveNewPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      showToast("Please enter the patient full name.", "warning")
      return
    }
    const cleanPhone = newPhone.trim()
    const cleanDigits = cleanPhone.replace(/\D/g, "")
    const newId = `ORH-2026-${String(Math.floor(10000 + Math.random() * 90000))}`
    const payload = {
      id: newId,
      name: newName.trim(),
      birth: newBirth.trim() || "Birth date not recorded",
      contact: cleanPhone ? `+251 ${cleanDigits.slice(-9)}` : "No contact recorded",
      phoneToken: cleanDigits || "",
      residence: newResidence.trim() || "Bale Robe, Ethiopia",
      registered: new Date().toISOString().slice(0, 10),
    }

    try {
      const created = await api.createPatient(payload)
      const mapped: DirectoryPatient = {
        id: created.id,
        name: created.name,
        birth: created.birth || created.dob || "Birth date not recorded",
        contact: created.contact || "No contact recorded",
        phoneToken: created.phoneToken || cleanDigits,
        residence: created.residence || "Bale Robe, Ethiopia",
        registered: created.registered ? created.registered.slice(0, 10) : new Date().toISOString().slice(0, 10),
      }
      setPatientList((prev) => [mapped, ...prev])
      setIsAddModalOpen(false)
      showToast(`Patient ${mapped.name} (${mapped.id}) added and saved to database!`, "success")
    } catch (err: any) {
      showToast(`Error saving patient: ${err.message}`, "warning")
    }
  }

  const handleOpenEdit = (patient: DirectoryPatient) => {
    setEditingPatient(patient)
    setEditName(patient.name)
    setEditBirth(patient.birth)
    setEditPhone(patient.phoneToken ? `09${patient.phoneToken.slice(-8)}` : "")
    setEditResidence(patient.residence)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPatient) return
    if (!editName.trim()) {
      showToast("Patient name cannot be empty.", "warning")
      return
    }

    const cleanPhone = editPhone.trim()
    const cleanDigits = cleanPhone.replace(/\D/g, "")
    const payload = {
      name: editName.trim(),
      birth: editBirth.trim() || editingPatient.birth,
      contact: cleanPhone ? `+251 ${cleanDigits.slice(-9)}` : editingPatient.contact,
      phoneToken: cleanDigits || editingPatient.phoneToken,
      residence: editResidence.trim() || editingPatient.residence,
    }

    try {
      const updatedApi = await api.updatePatient(editingPatient.id, payload)
      const updated: DirectoryPatient = {
        ...editingPatient,
        name: updatedApi.name || payload.name,
        birth: updatedApi.birth || payload.birth,
        contact: updatedApi.contact || payload.contact,
        phoneToken: updatedApi.phoneToken || payload.phoneToken,
        residence: updatedApi.residence || payload.residence,
      }
      setPatientList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      if (selected?.id === updated.id) {
        setSelected(updated)
      }
      setEditingPatient(null)
      showToast(`Patient ${updated.name} updated in database.`, "success")
    } catch (err: any) {
      showToast(`Error updating patient: ${err.message}`, "warning")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return
    const id = deletingPatient.id
    const name = deletingPatient.name
    try {
      await api.deletePatient(id)
      setPatientList((prev) => prev.filter((p) => p.id !== id))
      if (selected?.id === id) {
        setSelected(null)
      }
      setDeletingPatient(null)
      showToast(`Patient ${name} (${id}) deleted from database.`, "info")
    } catch (err: any) {
      showToast(`Error deleting patient: ${err.message}`, "warning")
    }
  }

  const authorized = permissions.has("directory")
  if (!authorized)
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )

  return (
    <div className="patient-directory-page">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: toast.type === "success" ? "#087e83" : toast.type === "warning" ? "#d97706" : "#243b4b",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <Icon name={toast.type === "success" ? "check" : "info"} size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      <PatientDirectoryHeader
        canRegister={canRegister}
        onRegister={register}
        onCreate={handleOpenAdd}
      />

      <div className="patient-directory-context">
        <span>
          <Icon name="shield" size={14} />
          Demographic records directory
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
                : "Select Search or press Enter to apply."}
            </span>
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
                      matching.length === 1 ? "record" : "records"
                    }${activeFilterCount || appliedQuery ? " · filtered" : ""}`}
            </span>
          </div>
          <span>
            {appliedQuery
              ? `Results for “${appliedQuery}”`
              : "All permitted patient records"}
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
              onEdit={handleOpenEdit}
              onDelete={setDeletingPatient}
            />
            <MobilePatientList
              patients={visible}
              onView={setSelected}
              onEdit={handleOpenEdit}
              onDelete={setDeletingPatient}
            />
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

      {filterPanel && (
        <PatientFilterPanel
          filters={filters}
          onApply={changeFilters}
          onClose={() => setFilterPanel(false)}
        />
      )}

      {/* ── CREATE PATIENT MODAL ── */}
      {isAddModalOpen && (
        <PreviewDialog
          title="Add New Patient Record"
          onClose={() => setIsAddModalOpen(false)}
          className="patient-identity-dialog"
        >
          <form onSubmit={handleSaveNewPatient} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
              Enter demographic details to register a patient into the hospital directory.
            </p>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                Full Name *
              </label>
              <input
                type="text"
                className="permission-input"
                placeholder="e.g. Almaz Tadesse"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Birth Date or Age
                </label>
                <input
                  type="text"
                  className="permission-input"
                  placeholder="e.g. 1995-03-20 or 28y"
                  value={newBirth}
                  onChange={(e) => setNewBirth(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="permission-input"
                  placeholder="0911234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                Residence / Kebele
              </label>
              <input
                type="text"
                className="permission-input"
                placeholder="e.g. Kebele 02, Bale Robe"
                value={newResidence}
                onChange={(e) => setNewResidence(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <Button className="button secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="button">
                <Icon name="check" size={16} />
                Save Patient
              </Button>
            </div>
          </form>
        </PreviewDialog>
      )}

      {/* ── EDIT PATIENT MODAL ── */}
      {editingPatient && (
        <PreviewDialog
          title={`Edit Patient · ${editingPatient.id}`}
          onClose={() => setEditingPatient(null)}
          className="patient-identity-dialog"
        >
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
              Update demographic details for <strong>{editingPatient.name}</strong>.
            </p>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                Full Name *
              </label>
              <input
                type="text"
                className="permission-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Birth Date / Age
                </label>
                <input
                  type="text"
                  className="permission-input"
                  value={editBirth}
                  onChange={(e) => setEditBirth(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="permission-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                Residence / Kebele
              </label>
              <input
                type="text"
                className="permission-input"
                value={editResidence}
                onChange={(e) => setEditResidence(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <Button className="button secondary" onClick={() => setEditingPatient(null)}>
                Cancel
              </Button>
              <Button type="submit" className="button">
                <Icon name="check" size={16} />
                Save Changes
              </Button>
            </div>
          </form>
        </PreviewDialog>
      )}

      {/* ── DELETE / ARCHIVE CONFIRMATION MODAL ── */}
      {deletingPatient && (
        <PreviewDialog
          title="Archive Patient Record"
          onClose={() => setDeletingPatient(null)}
          className="patient-identity-dialog"
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ color: "var(--emergency)", marginBottom: "12px" }}>
              <Icon name="x-circle" size={44} />
            </div>
            <h3 style={{ fontSize: "18px", color: "var(--navy)", margin: "0 0 8px" }}>
              Archive {deletingPatient.name}?
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
              Are you sure you want to archive patient <strong>{deletingPatient.id}</strong>? The record will be removed from the active directory.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <Button className="button secondary" onClick={() => setDeletingPatient(null)}>
                Keep Record
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)" }}
                onClick={handleConfirmDelete}
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </PreviewDialog>
      )}

      {/* ── READ / PREVIEW DETAILS MODAL ── */}
      {selected && (
        <PreviewDialog
          title="Patient Demographic Details"
          onClose={() => setSelected(null)}
          className="patient-identity-dialog"
        >
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
              <dt>Contact · phone</dt>
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
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            <Button
              className="button secondary"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            <Button
              className="button secondary"
              onClick={() => {
                const target = selected
                setSelected(null)
                handleOpenEdit(target)
              }}
              style={{ color: "#0284c7" }}
            >
              <Icon name="edit" size={14} />
              Edit Record
            </Button>
            <Button
              className="button secondary"
              onClick={() => {
                const target = selected
                setSelected(null)
                setDeletingPatient(target)
              }}
              style={{ color: "var(--emergency)" }}
            >
              <Icon name="x-circle" size={14} />
              Archive
            </Button>
            <Button
              className="button"
              onClick={() => {
                setSelected(null)
                onNavigate("patient-profile")
              }}
              style={{ marginLeft: "auto" }}
            >
              Full Profile <Icon name="arrow" size={14} />
            </Button>
          </div>
        </PreviewDialog>
      )}
    </div>
  )
}
