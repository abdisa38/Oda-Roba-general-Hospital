// ORHIMS — Prescription Management Component (Phase 05, Prompt 29)

import { useState, useMemo } from "react"
import Icon from "../Icon"
import Button from "../Button"
import Heading from "../Heading"
import Text from "../Text"
import AccessDeniedPage from "../AccessDeniedPage"
import {
  samplePrescriptionPatient,
  hospitalMedicationCatalogue,
  initialEncounterOrders,
  sampleHistoricalPrescriptions,
  routeOptions,
  frequencyOptions,
  type MedicationOrder,
  type MedicationCatalogueItem,
  type HistoricalPrescription,
  type OrderStatus,
} from "./model"
import "./prescription-management.css"

interface PrescriptionManagementPageProps {
  state?: string
  permissions: Set<string>
  onNavigate: (destination: string) => void
  readOnly?: boolean
}

export default function PrescriptionManagementPage({
  permissions,
  onNavigate,
  readOnly = false,
}: PrescriptionManagementPageProps) {
  // Check authorization - clinician or doctor role required to prescribe
  const canPrescribe = permissions.has("consultations") || permissions.has("triage")

  const patient = samplePrescriptionPatient

  // Active encounter orders state
  const [orders, setOrders] = useState<MedicationOrder[]>(initialEncounterOrders)
  const [activeFilter, setActiveFilter] = useState<"All" | OrderStatus>("All")
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showAllergyModal, setShowAllergyModal] = useState(false)
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<MedicationOrder | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<MedicationOrder | null>(null)
  const [cancelReason, setCancelReason] = useState("Change in clinical condition or diagnosis")

  // Create prescription form multi-step state
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1)
  const [catSearchQuery, setCatSearchQuery] = useState("")
  const [catSelectedCategory, setCatSelectedCategory] = useState<string>("All")
  const [selectedMed, setSelectedMed] = useState<MedicationCatalogueItem | null>(null)

  // Form field states
  const [formStrength, setFormStrength] = useState("")
  const [formDoseAmount, setFormDoseAmount] = useState<string>("500")
  const [formDoseUnit, setFormDoseUnit] = useState("mg")
  const [formRoute, setFormRoute] = useState("Oral (PO)")
  const [formFrequency, setFormFrequency] = useState("Every 8 hours (q8h)")
  const [formDuration, setFormDuration] = useState("5")
  const [formDurationUnit, setFormDurationUnit] = useState<"Days" | "Weeks" | "Months" | "Doses">("Days")
  const [formQuantity, setFormQuantity] = useState("15 tablets")
  const [formStartDate, setFormStartDate] = useState(patient.encounterDate)
  const [formInstructions, setFormInstructions] = useState("")
  const [formInternalNotes, setFormInternalNotes] = useState("")
  const [allergyAcknowledged, setAllergyAcknowledged] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Existing order editing (Draft only)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") return orders
    return orders.filter((o) => o.status === activeFilter)
  }, [orders, activeFilter])

  // Count summaries
  const countSubmitted = orders.filter((o) => o.status === "Submitted").length
  const countDraft = orders.filter((o) => o.status === "Draft").length
  const countCancelled = orders.filter((o) => o.status === "Cancelled").length

  // Filter catalogue items
  const filteredCatalogue = useMemo(() => {
    return hospitalMedicationCatalogue.filter((item) => {
      const matchCat = catSelectedCategory === "All" || item.category === catSelectedCategory
      const query = catSearchQuery.toLowerCase().trim()
      const matchSearch =
        !query ||
        item.genericName.toLowerCase().includes(query) ||
        (item.brandName && item.brandName.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query) ||
        item.strength.toLowerCase().includes(query)
      return matchCat && matchSearch
    })
  }, [catSearchQuery, catSelectedCategory])

  // Check if selected med has potential allergy risk
  const hasAllergyConflict = useMemo(() => {
    if (!selectedMed) return false
    const medLower = (selectedMed.genericName + " " + (selectedMed.drugClass || "")).toLowerCase()
    return medLower.includes("penicillin") || medLower.includes("amoxicillin") || medLower.includes("beta-lactam")
  }, [selectedMed])

  // Open creation modal
  function handleOpenCreate() {
    setEditingDraftId(null)
    setSelectedMed(null)
    setCreateStep(1)
    setCatSearchQuery("")
    setCatSelectedCategory("All")
    setFormStrength("")
    setFormDoseAmount("500")
    setFormDoseUnit("mg")
    setFormRoute("Oral (PO)")
    setFormFrequency("Every 8 hours (q8h)")
    setFormDuration("5")
    setFormDurationUnit("Days")
    setFormQuantity("")
    setFormInstructions("")
    setFormInternalNotes("")
    setAllergyAcknowledged(false)
    setValidationError(null)
    setShowCreateModal(true)
  }

  // Open edit modal for an existing draft
  function handleOpenEditDraft(draft: MedicationOrder) {
    const matchedMed = hospitalMedicationCatalogue.find((m) => m.id === draft.medicationId) || {
      id: draft.medicationId,
      genericName: draft.genericName,
      brandName: draft.brandName,
      formulation: draft.formulation,
      strength: draft.strength,
      availableStrengths: [draft.strength],
      defaultRoute: draft.route,
      defaultDoseUnit: draft.doseUnit,
      category: "Antibacterial" as const,
    }
    setEditingDraftId(draft.id)
    setSelectedMed(matchedMed)
    setFormStrength(draft.strength)
    setFormDoseAmount(String(draft.doseAmount))
    setFormDoseUnit(draft.doseUnit)
    setFormRoute(draft.route)
    setFormFrequency(draft.frequency)
    setFormDuration(String(draft.duration))
    setFormDurationUnit(draft.durationUnit)
    setFormQuantity(draft.quantity)
    setFormStartDate(draft.startDate)
    setFormInstructions(draft.patientInstructions)
    setFormInternalNotes(draft.internalNotes || "")
    setAllergyAcknowledged(true)
    setValidationError(null)
    setCreateStep(2)
    setShowCreateModal(true)
  }

  // Selecting a medication from catalogue in Step 1
  function handleSelectMedication(med: MedicationCatalogueItem) {
    setSelectedMed(med)
    setFormStrength(med.strength)
    setFormDoseUnit(med.defaultDoseUnit)
    setFormRoute(med.defaultRoute)
    setAllergyAcknowledged(false)
    setValidationError(null)

    // Estimate initial default quantity
    if (med.formulation === "Tablet" || med.formulation === "Capsule") {
      setFormDoseAmount("500")
      setFormQuantity("15 " + med.formulation.toLowerCase() + "s")
      setFormInstructions(`Take 1 ${med.formulation.toLowerCase()} (${med.strength}) by mouth every 8 hours for 5 days.`)
    } else if (med.formulation === "Inhaler") {
      setFormDoseAmount("2")
      setFormDoseUnit("puff")
      setFormFrequency("As needed (PRN)")
      setFormDuration("30")
      setFormQuantity("1 inhaler")
      setFormInstructions("Inhale 2 puffs as needed for shortness of breath or wheezing.")
    } else {
      setFormDoseAmount("1")
      setFormQuantity("1 bottle / course")
      setFormInstructions(`Administer as directed by clinical protocol.`)
    }

    setCreateStep(2)
  }

  // Validate step 2 inputs and proceed to step 3 (Review)
  function handleProceedToReview() {
    if (!selectedMed) {
      setValidationError("Please select a medication from the catalogue.")
      return
    }
    if (!formDoseAmount || isNaN(Number(formDoseAmount)) || Number(formDoseAmount) <= 0) {
      setValidationError("Please enter a valid numeric dose amount.")
      return
    }
    if (!formDuration || isNaN(Number(formDuration)) || Number(formDuration) <= 0) {
      setValidationError("Please enter a valid duration (e.g. 5 days).")
      return
    }
    if (!formQuantity.trim()) {
      setValidationError("Please specify the quantity to dispense.")
      return
    }
    if (!formInstructions.trim()) {
      setValidationError("Please enter patient administration instructions.")
      return
    }
    if (hasAllergyConflict && !allergyAcknowledged) {
      setValidationError("You must review and acknowledge the documented penicillin allergy risk before proceeding.")
      return
    }

    setValidationError(null)
    setCreateStep(3)
  }

  // Save as Draft or Submit Prescription
  function handleSaveOrder(targetStatus: "Draft" | "Submitted") {
    if (!selectedMed) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    const orderData: MedicationOrder = {
      id: editingDraftId || `ord-${Date.now()}`,
      encounterId: patient.encounterId,
      patientId: patient.patientId,
      medicationId: selectedMed.id,
      genericName: selectedMed.genericName,
      brandName: selectedMed.brandName,
      formulation: selectedMed.formulation,
      strength: formStrength || selectedMed.strength,
      doseAmount: formDoseAmount,
      doseUnit: formDoseUnit,
      route: formRoute,
      frequency: formFrequency,
      duration: Number(formDuration),
      durationUnit: formDurationUnit,
      quantity: formQuantity,
      startDate: formStartDate,
      patientInstructions: formInstructions.trim(),
      internalNotes: formInternalNotes.trim() || undefined,
      prescriberName: patient.attendingDoctor,
      prescriberRole: "Consulting Physician",
      orderDate: patient.encounterDate,
      orderTime: timeStr,
      status: targetStatus,
      allergyWarningAcknowledged: hasAllergyConflict,
    }

    if (editingDraftId) {
      setOrders((prev) => prev.map((o) => (o.id === editingDraftId ? orderData : o)))
      setSuccessNotice(`Medication order for "${selectedMed.genericName}" updated (${targetStatus}).`)
    } else {
      setOrders((prev) => [orderData, ...prev])
      setSuccessNotice(
        targetStatus === "Submitted"
          ? `Prescription for "${selectedMed.genericName}" submitted to hospital pharmacy queue.`
          : `Draft medication order for "${selectedMed.genericName}" saved.`
      )
    }

    setShowCreateModal(false)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Delete draft
  function handleDeleteDraft(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    setSuccessNotice("Draft order deleted.")
    setTimeout(() => setSuccessNotice(null), 3000)
  }

  // Cancel submitted order
  function handleConfirmCancelOrder() {
    if (!orderToCancel) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderToCancel.id
          ? {
              ...o,
              status: "Cancelled" as const,
              cancellationReason: cancelReason,
              cancelledBy: patient.attendingDoctor,
              cancelledAt: `${patient.encounterDate} · ${timeStr}`,
            }
          : o
      )
    )

    setOrderToCancel(null)
    setSuccessNotice(`Order for "${orderToCancel.genericName}" cancelled. Pharmacy notified.`)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  if (!canPrescribe) {
    return (
      <AccessDeniedPage
        onBack={() => onNavigate("home")}
        onHome={() => onNavigate("home")}
      />
    )
  }

  return (
    <div className="rx-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="rx-breadcrumb" aria-label="Breadcrumb">
        <Button onClick={() => onNavigate("home")}>Doctor Workspace</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("consultations")}>Doctor Dashboard</Button>
        <Icon name="chevron" size={11} />
        <Button onClick={() => onNavigate("clinical-workspace")}>Clinical Workspace</Button>
        <Icon name="chevron" size={11} />
        <strong>Prescription Management</strong>
      </nav>

      {/* ── Patient Identity & Active Encounter Banner ── */}
      <div className="rx-patient-banner">
        <div className="rx-banner-top">
          <div className="rx-patient-info">
            <div className="rx-avatar">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="rx-patient-name-row">
                <h1 className="rx-patient-name">{patient.name}</h1>
                {patient.amharicName && (
                  <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>
                    ({patient.amharicName})
                  </span>
                )}
                <span className="rx-mrn-chip">{patient.patientId}</span>
                <span
                  style={{
                    background: "var(--mist)",
                    border: "1px solid var(--border)",
                    color: "var(--teal)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  Prescription Management
                </span>
              </div>
              <div className="rx-patient-meta">
                <span>
                  Sex: <strong>{patient.sex}</strong>
                </span>
                <span>·</span>
                <span>
                  Age: <strong>{patient.age}</strong> (DOB: {patient.dob})
                </span>
                <span>·</span>
                <span>
                  Attending Doctor: <strong>{patient.attendingDoctor}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="rx-banner-actions">
            <Button
              className="button secondary"
              onClick={() => onNavigate("clinical-workspace")}
            >
              <Icon name="arrow" size={14} />
              Return to Clinical Workspace
            </Button>
            <Button
              className="button"
              onClick={handleOpenCreate}
              disabled={readOnly || patient.encounterStatus === "Finalized"}
            >
              <Icon name="pill" size={15} />
              Add Medication Order
            </Button>
          </div>
        </div>

        {/* ── Context Strip: Allergies & Encounter Diagnoses ── */}
        <div className="rx-context-strip">
          {/* Allergy reference box */}
          <div
            className={`rx-context-box ${
              patient.allergies.status === "Documented" ? "rx-context-box-alert" : ""
            }`}
          >
            <div>
              <div className="rx-context-label">
                <Icon name="shield" size={13} />
                Allergy & Safety Profile
              </div>
              <div className="rx-context-text">
                {patient.allergies.status === "Documented"
                  ? patient.allergies.details
                  : patient.allergies.status === "NKDA"
                  ? "No Known Drug Allergies (NKDA)"
                  : "Allergy status unverified"}
              </div>
            </div>
            <button
              type="button"
              className="rx-context-btn"
              onClick={() => setShowAllergyModal(true)}
            >
              View Allergy Record
            </button>
          </div>

          {/* Active Diagnoses reference box */}
          <div className="rx-context-box">
            <div>
              <div className="rx-context-label">
                <Icon name="info" size={13} />
                Encounter Diagnoses
              </div>
              <div className="rx-context-text">
                {patient.diagnoses.map((d) => `${d.name} (${d.code})`).join(" · ")}
              </div>
            </div>
            <button
              type="button"
              className="rx-context-btn"
              onClick={() => onNavigate("diagnosis-management")}
            >
              Manage Diagnoses
            </button>
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successNotice && (
        <div className="rx-success-banner" role="status">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon name="check" size={18} />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* ── Section Title & Filter Controls ── */}
      <div className="rx-controls-bar">
        <div>
          <Heading level={2} style={{ fontSize: "18px", color: "var(--navy)", margin: 0 }}>
            Medication Orders for This Encounter
          </Heading>
          <Text style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0 0" }}>
            Review, authorize, and transmit pharmacological orders to the hospital pharmacy.
          </Text>
        </div>

        <div className="rx-bar-actions">
          <div className="rx-filter-group" role="tablist" aria-label="Prescription status filters">
            <button
              type="button"
              className={`rx-filter-tab${activeFilter === "All" ? " active" : ""}`}
              onClick={() => setActiveFilter("All")}
            >
              All Orders <span className="rx-count-badge">{orders.length}</span>
            </button>
            <button
              type="button"
              className={`rx-filter-tab${activeFilter === "Submitted" ? " active" : ""}`}
              onClick={() => setActiveFilter("Submitted")}
            >
              Active / Submitted <span className="rx-count-badge">{countSubmitted}</span>
            </button>
            <button
              type="button"
              className={`rx-filter-tab${activeFilter === "Draft" ? " active" : ""}`}
              onClick={() => setActiveFilter("Draft")}
            >
              Drafts <span className="rx-count-badge">{countDraft}</span>
            </button>
            <button
              type="button"
              className={`rx-filter-tab${activeFilter === "Cancelled" ? " active" : ""}`}
              onClick={() => setActiveFilter("Cancelled")}
            >
              Cancelled <span className="rx-count-badge">{countCancelled}</span>
            </button>
          </div>

          <Button
            className="button secondary"
            onClick={() => setShowHistoryModal(true)}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            <Icon name="clock" size={14} />
            Historical Prescriptions
          </Button>
        </div>
      </div>

      {/* ── Medication Orders List ── */}
      {filteredOrders.length === 0 ? (
        <div className="rx-empty-state">
          <Icon name="pill" size={32} />
          <h3>No Medication Orders</h3>
          <p>
            {activeFilter === "All"
              ? "No prescriptions have been authored for this active encounter yet."
              : `No medication orders match the selected "${activeFilter}" filter.`}
          </p>
          {!readOnly && (
            <Button className="button" onClick={handleOpenCreate}>
              <Icon name="pill" size={14} /> Add First Medication Order
            </Button>
          )}
        </div>
      ) : (
        <div className="rx-orders-list">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className={`rx-order-card is-${order.status.toLowerCase()}`}
            >
              <div className="rx-order-head">
                <div className="rx-med-title-group">
                  <h3 className="rx-med-name">{order.genericName}</h3>
                  {order.brandName && (
                    <span className="rx-brand-name">({order.brandName})</span>
                  )}
                  <span className="rx-form-pill">{order.formulation}</span>
                  <span className="rx-form-pill" style={{ background: "#ffffff" }}>
                    {order.strength}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`rx-status-badge rx-status-${order.status.toLowerCase()}`}>
                    {order.status === "Submitted" && <Icon name="check" size={12} />}
                    {order.status === "Draft" && <Icon name="clock" size={12} />}
                    {order.status === "Cancelled" && <Icon name="close" size={12} />}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="rx-specs-grid">
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Dose</span>
                  <span className="rx-spec-value">
                    {order.doseAmount} {order.doseUnit}
                  </span>
                </div>
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Route</span>
                  <span className="rx-spec-value">{order.route}</span>
                </div>
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Frequency</span>
                  <span className="rx-spec-value">{order.frequency}</span>
                </div>
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Duration</span>
                  <span className="rx-spec-value">
                    {order.duration} {order.durationUnit}
                  </span>
                </div>
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Quantity</span>
                  <span className="rx-spec-value">{order.quantity}</span>
                </div>
                <div className="rx-spec-item">
                  <span className="rx-spec-label">Start Date</span>
                  <span className="rx-spec-value">{order.startDate}</span>
                </div>
              </div>

              {/* Instructions quote */}
              <div className="rx-instructions-box">
                <div className="rx-instructions-title">
                  <Icon name="info" size={12} />
                  Patient Administration Instructions
                </div>
                <p className="rx-instructions-text">{order.patientInstructions}</p>
                {order.internalNotes && (
                  <div className="rx-internal-note">
                    Internal Clinical Note: {order.internalNotes}
                  </div>
                )}
              </div>

              {/* Cancellation Reason if cancelled */}
              {order.status === "Cancelled" && order.cancellationReason && (
                <div className="rx-cancellation-notice">
                  <strong>Order Cancelled:</strong> {order.cancellationReason} · Cancelled by{" "}
                  {order.cancelledBy || "Doctor"} ({order.cancelledAt || order.orderDate})
                </div>
              )}

              {/* Footer with prescriber & action buttons */}
              <div className="rx-order-foot">
                <div className="rx-meta-prescriber">
                  Ordered by <strong>{order.prescriberName}</strong> · {order.orderDate} at{" "}
                  {order.orderTime}
                </div>

                <div className="rx-card-actions">
                  {order.status === "Draft" && (
                    <>
                      <Button
                        className="button secondary"
                        style={{ fontSize: "12px", padding: "6px 10px" }}
                        onClick={() => handleOpenEditDraft(order)}
                        disabled={readOnly}
                      >
                        <Icon name="edit" size={13} />
                        Edit Draft
                      </Button>
                      <Button
                        className="button"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => {
                          setOrders((prev) =>
                            prev.map((o) => (o.id === order.id ? { ...o, status: "Submitted" } : o))
                          )
                          setSuccessNotice(`Draft for "${order.genericName}" submitted to pharmacy.`)
                          setTimeout(() => setSuccessNotice(null), 3000)
                        }}
                        disabled={readOnly}
                      >
                        <Icon name="check" size={13} />
                        Submit Order
                      </Button>
                      <Button
                        className="button secondary"
                        style={{
                          fontSize: "12px",
                          padding: "6px 10px",
                          color: "var(--emergency)",
                          borderColor: "#fca5a5",
                        }}
                        onClick={() => handleDeleteDraft(order.id)}
                        disabled={readOnly}
                      >
                        <Icon name="close" size={13} />
                        Delete
                      </Button>
                    </>
                  )}

                  {order.status === "Submitted" && (
                    <>
                      <Button
                        className="button secondary"
                        style={{ fontSize: "12px", padding: "6px 10px" }}
                        onClick={() => setSelectedOrderForSlip(order)}
                      >
                        <Icon name="mail" size={13} />
                        View Pharmacy Slip
                      </Button>
                      {!readOnly && (
                        <Button
                          className="button secondary"
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            color: "var(--emergency)",
                            borderColor: "#fca5a5",
                          }}
                          onClick={() => setOrderToCancel(order)}
                        >
                          <Icon name="warning" size={13} />
                          Cancel Order
                        </Button>
                      )}
                    </>
                  )}

                  {order.status === "Cancelled" && (
                    <Button
                      className="button secondary"
                      style={{ fontSize: "12px", padding: "6px 10px" }}
                      onClick={() => setSelectedOrderForSlip(order)}
                    >
                      <Icon name="info" size={13} />
                      View Order Record
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── CREATE PRESCRIPTION MULTI-STEP MODAL ── */}
      {showCreateModal && (
        <div className="rx-modal-overlay" role="dialog" aria-modal="true">
          <div className="rx-modal-dialog">
            <div className="rx-modal-head">
              <h2 className="rx-modal-title">
                {editingDraftId ? "Edit Draft Prescription" : "Create Prescription"}
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close dialog"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Stepper Bar */}
            <div className="rx-step-nav">
              <div
                className={`rx-step-item${
                  createStep === 1 ? " active" : createStep > 1 ? " completed" : ""
                }`}
              >
                <span className="rx-step-num">1</span>
                <span>Select Medication</span>
              </div>
              <div
                className={`rx-step-item${
                  createStep === 2 ? " active" : createStep > 2 ? " completed" : ""
                }`}
              >
                <span className="rx-step-num">2</span>
                <span>Medication Details</span>
              </div>
              <div className={`rx-step-item${createStep === 3 ? " active" : ""}`}>
                <span className="rx-step-num">3</span>
                <span>Review &amp; Submit</span>
              </div>
            </div>

            <div className="rx-modal-body">
              {/* Validation alert */}
              {validationError && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fca5a5",
                    color: "var(--emergency)",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Icon name="warning" size={16} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ── STEP 1: Search & Catalogue Selection ── */}
              {createStep === 1 && (
                <div>
                  <div className="rx-search-box">
                    <span className="rx-search-icon">
                      <Icon name="search" size={16} />
                    </span>
                    <input
                      type="text"
                      className="rx-search-input"
                      placeholder="Search medication by generic name, brand, or category..."
                      value={catSearchQuery}
                      onChange={(e) => setCatSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="rx-cat-filters">
                    {[
                      "All",
                      "Antibacterial",
                      "Analgesic / Antipyretic",
                      "Respiratory",
                      "Antimalarial",
                      "Gastrointestinal",
                      "Cardiovascular",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`rx-cat-pill${catSelectedCategory === cat ? " active" : ""}`}
                        onClick={() => setCatSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Catalogue Items List */}
                  <div className="rx-catalogue-list">
                    {filteredCatalogue.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                        No medications found matching "{catSearchQuery}".
                      </div>
                    ) : (
                      filteredCatalogue.map((med) => {
                        const isPenicillin = (med.genericName + " " + (med.drugClass || ""))
                          .toLowerCase()
                          .includes("penicillin") || med.genericName.toLowerCase().includes("amoxicillin")
                        return (
                          <div
                            key={med.id}
                            className={`rx-cat-item${selectedMed?.id === med.id ? " selected" : ""}`}
                            onClick={() => handleSelectMedication(med)}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <strong style={{ fontSize: "15px", color: "var(--navy)" }}>
                                  {med.genericName}
                                </strong>
                                {med.brandName && (
                                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                                    ({med.brandName})
                                  </span>
                                )}
                                <span className="rx-form-pill">{med.formulation}</span>
                                {isPenicillin && (
                                  <span
                                    style={{
                                      background: "#fee2e2",
                                      color: "#991b1b",
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    Beta-Lactam
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                                Available Strengths: {med.availableStrengths.join(", ")} · Category:{" "}
                                {med.category}
                              </div>
                            </div>

                            <Button
                              className="button secondary"
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              Select <Icon name="arrow" size={12} />
                            </Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Medication Details Form ── */}
              {createStep === 2 && selectedMed && (
                <div>
                  {/* Selected medication banner */}
                  <div
                    style={{
                      background: "#f0fdfa",
                      border: "1px solid #99f6e4",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--teal)" }}>
                        SELECTED MEDICATION
                      </div>
                      <strong style={{ fontSize: "16px", color: "var(--navy)" }}>
                        {selectedMed.genericName}{" "}
                        {selectedMed.brandName && `(${selectedMed.brandName})`} —{" "}
                        {selectedMed.formulation}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="rx-context-btn"
                      onClick={() => setCreateStep(1)}
                    >
                      Change Medication
                    </button>
                  </div>

                  {/* Clinical Safety Advisory if allergy conflict */}
                  {hasAllergyConflict && (
                    <div className="rx-advisory-box">
                      <div className="rx-advisory-head">
                        <Icon name="warning" size={16} />
                        Clinical Safety Alert: Patient Penicillin Hypersensitivity
                      </div>
                      <div className="rx-advisory-body">
                        The selected medication belongs to the Penicillin / Beta-Lactam class. This patient
                        has documented <strong>{patient.allergies.details}</strong>. Prescribing may trigger
                        severe hypersensitivity or anaphylaxis.
                      </div>
                      <label className="rx-advisory-check">
                        <input
                          type="checkbox"
                          checked={allergyAcknowledged}
                          onChange={(e) => setAllergyAcknowledged(e.target.checked)}
                        />
                        <span>
                          I have verified the clinical indication and allergy profile, and acknowledge this
                          safety warning.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="rx-form-grid">
                    <div className="rx-form-group">
                      <label className="rx-label">
                        Strength / Formulation<span className="required">*</span>
                      </label>
                      <select
                        className="rx-select"
                        value={formStrength}
                        onChange={(e) => setFormStrength(e.target.value)}
                      >
                        {selectedMed.availableStrengths.map((str) => (
                          <option key={str} value={str}>
                            {str}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Dose Amount &amp; Unit<span className="required">*</span>
                      </label>
                      <div className="rx-input-group">
                        <input
                          type="number"
                          className="rx-input"
                          value={formDoseAmount}
                          onChange={(e) => setFormDoseAmount(e.target.value)}
                          placeholder="e.g. 500"
                        />
                        <select
                          className="rx-select"
                          style={{ width: "95px" }}
                          value={formDoseUnit}
                          onChange={(e) => setFormDoseUnit(e.target.value)}
                        >
                          <option value="mg">mg</option>
                          <option value="g">g</option>
                          <option value="mL">mL</option>
                          <option value="tablet">tab</option>
                          <option value="capsule">cap</option>
                          <option value="puff">puff</option>
                          <option value="drops">drops</option>
                          <option value="sachet">sachet</option>
                        </select>
                      </div>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Route of Administration<span className="required">*</span>
                      </label>
                      <select
                        className="rx-select"
                        value={formRoute}
                        onChange={(e) => setFormRoute(e.target.value)}
                      >
                        {routeOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Frequency<span className="required">*</span>
                      </label>
                      <select
                        className="rx-select"
                        value={formFrequency}
                        onChange={(e) => setFormFrequency(e.target.value)}
                      >
                        {frequencyOptions.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Duration<span className="required">*</span>
                      </label>
                      <div className="rx-input-group">
                        <input
                          type="number"
                          className="rx-input"
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          placeholder="e.g. 5"
                        />
                        <select
                          className="rx-select"
                          style={{ width: "105px" }}
                          value={formDurationUnit}
                          onChange={(e) =>
                            setFormDurationUnit(e.target.value as "Days" | "Weeks" | "Months" | "Doses")
                          }
                        >
                          <option value="Days">Days</option>
                          <option value="Weeks">Weeks</option>
                          <option value="Months">Months</option>
                          <option value="Doses">Doses</option>
                        </select>
                      </div>
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Quantity to Dispense<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="rx-input"
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(e.target.value)}
                        placeholder="e.g. 15 tablets"
                      />
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">
                        Start Date<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="rx-input"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                      />
                    </div>

                    <div className="rx-form-group">
                      <label className="rx-label">Prescribing Clinician</label>
                      <input
                        type="text"
                        className="rx-input"
                        value={patient.attendingDoctor}
                        disabled
                        style={{ background: "var(--mist)", color: "var(--muted)" }}
                      />
                    </div>

                    <div className="rx-form-group full-width">
                      <label className="rx-label">
                        Patient Administration Instructions<span className="required">*</span>
                      </label>
                      <textarea
                        className="rx-textarea"
                        value={formInstructions}
                        onChange={(e) => setFormInstructions(e.target.value)}
                        placeholder="e.g. Take 1 tablet by mouth every 8 hours after meals. Complete full course."
                      />
                    </div>

                    <div className="rx-form-group full-width">
                      <label className="rx-label">Internal Clinical Notes (Optional)</label>
                      <textarea
                        className="rx-textarea"
                        style={{ minHeight: "60px" }}
                        value={formInternalNotes}
                        onChange={(e) => setFormInternalNotes(e.target.value)}
                        placeholder="Internal notes for pharmacy or follow-up doctor..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review Order Summary ── */}
              {createStep === 3 && selectedMed && (
                <div>
                  <div className="rx-review-card">
                    <h3 className="rx-review-title">Complete Medication Order Summary</h3>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Patient</span>
                      <span className="rx-review-val">
                        {patient.name} ({patient.patientId})
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Encounter</span>
                      <span className="rx-review-val">
                        {patient.encounterId} · {patient.clinic}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Medication</span>
                      <span className="rx-review-val">
                        {selectedMed.genericName}{" "}
                        {selectedMed.brandName ? `(${selectedMed.brandName})` : ""}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Formulation &amp; Strength</span>
                      <span className="rx-review-val">
                        {selectedMed.formulation} · {formStrength}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Dosage &amp; Route</span>
                      <span className="rx-review-val">
                        {formDoseAmount} {formDoseUnit} via {formRoute}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Frequency &amp; Duration</span>
                      <span className="rx-review-val">
                        {formFrequency} for {formDuration} {formDurationUnit}
                      </span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Total Dispense Quantity</span>
                      <span className="rx-review-val">{formQuantity}</span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Start Date</span>
                      <span className="rx-review-val">{formStartDate}</span>
                    </div>

                    <div className="rx-review-row">
                      <span className="rx-review-label">Patient Instructions</span>
                      <span className="rx-review-val">{formInstructions}</span>
                    </div>

                    {formInternalNotes && (
                      <div className="rx-review-row">
                        <span className="rx-review-label">Clinical Notes</span>
                        <span className="rx-review-val">{formInternalNotes}</span>
                      </div>
                    )}

                    <div className="rx-review-row" style={{ borderBottom: "none" }}>
                      <span className="rx-review-label">Prescriber</span>
                      <span className="rx-review-val">
                        {patient.attendingDoctor} (Consulting Physician)
                      </span>
                    </div>
                  </div>

                  {hasAllergyConflict && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <strong>Safety Check Recorded:</strong> Prescriber acknowledged documented penicillin
                      allergy alert before order confirmation.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="rx-modal-foot">
              {createStep === 1 && (
                <>
                  <Button className="button secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="button"
                    onClick={() => {
                      if (!selectedMed) {
                        setValidationError("Please select a medication first.")
                        return
                      }
                      setCreateStep(2)
                    }}
                    disabled={!selectedMed}
                  >
                    Next: Enter Details <Icon name="arrow" size={14} />
                  </Button>
                </>
              )}

              {createStep === 2 && (
                <>
                  <Button className="button secondary" onClick={() => setCreateStep(1)}>
                    Back to Selection
                  </Button>
                  <Button className="button" onClick={handleProceedToReview}>
                    Review Order <Icon name="arrow" size={14} />
                  </Button>
                </>
              )}

              {createStep === 3 && (
                <>
                  <Button className="button secondary" onClick={() => setCreateStep(2)}>
                    Edit Details
                  </Button>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      className="button secondary"
                      onClick={() => handleSaveOrder("Draft")}
                    >
                      Save as Draft
                    </Button>
                    <Button className="button" onClick={() => handleSaveOrder("Submitted")}>
                      <Icon name="check" size={14} />
                      Submit to Pharmacy
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL ORDER CONFIRMATION MODAL ── */}
      {orderToCancel && (
        <div className="rx-modal-overlay" role="dialog" aria-modal="true">
          <div className="rx-modal-dialog" style={{ maxWidth: "520px" }}>
            <div className="rx-modal-head">
              <h2 className="rx-modal-title" style={{ color: "var(--emergency)" }}>
                Cancel Medication Order
              </h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setOrderToCancel(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="rx-modal-body">
              <p style={{ fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                Are you sure you want to cancel the order for{" "}
                <strong>
                  {orderToCancel.genericName} ({orderToCancel.strength})
                </strong>
                ? This will notify the hospital pharmacy to halt fulfillment.
              </p>

              <div className="rx-form-group">
                <label className="rx-label">
                  Reason for Cancellation<span className="required">*</span>
                </label>
                <select
                  className="rx-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Change in clinical condition or diagnosis">
                    Change in clinical condition or diagnosis
                  </option>
                  <option value="Duplicate medication order">Duplicate medication order</option>
                  <option value="Patient allergy or adverse reaction risk">
                    Patient allergy or adverse reaction risk
                  </option>
                  <option value="Dosage or formulation adjustment required">
                    Dosage or formulation adjustment required
                  </option>
                  <option value="Patient transferred or discharged">
                    Patient transferred or discharged
                  </option>
                  <option value="Medication unavailable at hospital pharmacy">
                    Medication unavailable at hospital pharmacy
                  </option>
                </select>
              </div>
            </div>
            <div className="rx-modal-foot">
              <Button className="button secondary" onClick={() => setOrderToCancel(null)}>
                Keep Order
              </Button>
              <Button
                className="button"
                style={{ background: "var(--emergency)", borderColor: "var(--emergency)" }}
                onClick={handleConfirmCancelOrder}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW PHARMACY SLIP MODAL ── */}
      {selectedOrderForSlip && (
        <div className="rx-modal-overlay" role="dialog" aria-modal="true">
          <div className="rx-modal-dialog" style={{ maxWidth: "600px" }}>
            <div className="rx-modal-head">
              <h2 className="rx-modal-title">Official Hospital Prescription Slip</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setSelectedOrderForSlip(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="rx-modal-body">
              <div
                style={{
                  border: "2px solid var(--navy)",
                  borderRadius: "8px",
                  padding: "20px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "16px", color: "var(--navy)" }}>
                    ODA ROBA GENERAL HOSPITAL
                  </h3>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                    Bale Robe, Oromia, Ethiopia · Outpatient Pharmacy Service
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "12px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #eef3f3",
                  }}
                >
                  <div>
                    Patient: <strong>{patient.name}</strong>
                  </div>
                  <div>
                    MRN: <strong>{patient.patientId}</strong>
                  </div>
                  <div>
                    Age/Sex:{" "}
                    <strong>
                      {patient.age} / {patient.sex}
                    </strong>
                  </div>
                  <div>
                    Encounter: <strong>{patient.encounterId}</strong>
                  </div>
                  <div>
                    Prescriber: <strong>{selectedOrderForSlip.prescriberName}</strong>
                  </div>
                  <div>
                    Date: <strong>{selectedOrderForSlip.orderDate}</strong>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--mist)",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--navy)" }}>
                    Rx: {selectedOrderForSlip.genericName}{" "}
                    {selectedOrderForSlip.brandName && `(${selectedOrderForSlip.brandName})`}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>
                    {selectedOrderForSlip.strength} · {selectedOrderForSlip.formulation} · Dispense:{" "}
                    {selectedOrderForSlip.quantity}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--navy)", marginTop: "6px" }}>
                    Sig: {selectedOrderForSlip.patientInstructions}
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "right" }}>
                  Status: <strong>{selectedOrderForSlip.status.toUpperCase()}</strong> · Order ID:{" "}
                  {selectedOrderForSlip.id}
                </div>
              </div>
            </div>
            <div className="rx-modal-foot">
              <Button className="button secondary" onClick={() => setSelectedOrderForSlip(null)}>
                Close
              </Button>
              <Button
                className="button"
                onClick={() => {
                  window.print()
                }}
              >
                Print Slip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ALLERGY PROFILE MODAL ── */}
      {showAllergyModal && (
        <div className="rx-modal-overlay" role="dialog" aria-modal="true">
          <div className="rx-modal-dialog" style={{ maxWidth: "540px" }}>
            <div className="rx-modal-head">
              <h2 className="rx-modal-title">Patient Allergy Profile</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setShowAllergyModal(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="rx-modal-body">
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fca5a5",
                  padding: "16px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--emergency)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Documented Drug Allergy
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#7f1d1d" }}>
                  {patient.allergies.details}
                </div>
                <div style={{ fontSize: "12px", color: "#991b1b", marginTop: "4px" }}>
                  Severity: <strong>{patient.allergies.severity}</strong> · Source: Clinical History
                  Verification
                </div>
              </div>

              <Text style={{ fontSize: "13px", color: "var(--muted)" }}>
                Verified during nursing triage and doctor consultation. Any prescription containing
                penicillin or cross-reactive beta-lactams requires documented clinician override.
              </Text>
            </div>
            <div className="rx-modal-foot">
              <Button className="button secondary" onClick={() => setShowAllergyModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORICAL PRESCRIPTIONS MODAL ── */}
      {showHistoryModal && (
        <div className="rx-modal-overlay" role="dialog" aria-modal="true">
          <div className="rx-modal-dialog" style={{ maxWidth: "680px" }}>
            <div className="rx-modal-head">
              <h2 className="rx-modal-title">Historical Prescriptions Archive</h2>
              <button
                type="button"
                className="rx-context-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="rx-modal-body">
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 16px 0" }}>
                Prior medication courses recorded during earlier outpatient or inpatient hospital
                visits for {patient.name}. Older prescriptions are non-active historical records.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sampleHistoricalPrescriptions.map((hist) => (
                  <div
                    key={hist.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "14px 16px",
                      background: "#f8fafb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <strong style={{ fontSize: "15px", color: "var(--navy)" }}>
                        {hist.genericName} {hist.brandName && `(${hist.brandName})`} — {hist.strength}
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#e2e8f0",
                          color: "#475569",
                        }}
                      >
                        {hist.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--navy)", marginBottom: "6px" }}>
                      {hist.instructions}
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                      Encounter {hist.encounterId} ({hist.encounterDate}) · Prescribed by {hist.doctor} (
                      {hist.clinic})
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rx-modal-foot">
              <Button className="button secondary" onClick={() => setShowHistoryModal(false)}>
                Close Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
