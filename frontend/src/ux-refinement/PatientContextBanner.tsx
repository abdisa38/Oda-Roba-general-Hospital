import Icon from "../Icon"
import { type PatientContextState, DEMO_PATIENT_CONTEXT } from "./model"

interface PatientContextBannerProps {
  patient?: PatientContextState
  onNavigate?: (destinationId: string) => void
  onActionClick?: (actionName: string) => void
}

export default function PatientContextBanner({
  patient = DEMO_PATIENT_CONTEXT,
  onNavigate,
  onActionClick,
}: PatientContextBannerProps) {
  return (
    <section className="orh-patient-context-banner" aria-label="Active patient context">
      <div className="orh-patient-meta">
        <div className="orh-patient-avatar" aria-hidden="true">
          {patient.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div className="orh-patient-details-grid">
          <div className="orh-patient-name-row">
            <span className="orh-patient-name">{patient.fullName}</span>
            <span className="orh-patient-mrn-chip" title="Medical Record Number">
              {patient.mrn}
            </span>
            <span className="orh-status-badge success" style={{ fontSize: "0.72rem" }}>
              <Icon name="shield" size={13} /> CBHI {patient.cbhiStatus}
            </span>
            {patient.allergies.length > 0 && (
              <span className="orh-status-badge danger" style={{ fontSize: "0.72rem" }}>
                <Icon name="warning" size={13} /> {patient.allergies[0]}
              </span>
            )}
          </div>

          <div className="orh-patient-sub-meta">
            <span>
              <strong>Age / Sex:</strong> {patient.age} Y / {patient.gender}
            </span>
            <span>
              <strong>Blood:</strong> {patient.bloodGroup}
            </span>
            <span>
              <strong>Kebele:</strong> {patient.kebele}
            </span>
            <span>
              <strong>Encounter:</strong> {patient.currentEncounterId}
            </span>
            {patient.currentBed && (
              <span>
                <strong>Ward & Bed:</strong> {patient.currentWard} ({patient.currentBed})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="orh-patient-actions-group">
        <button
          type="button"
          className="orh-status-badge progress"
          style={{ cursor: "pointer", padding: "0.35rem 0.65rem" }}
          onClick={() => {
            if (onNavigate) onNavigate("clinical-workspace")
            if (onActionClick) onActionClick("Open Clinical Consultation")
          }}
          title="Open Clinical Encounter"
        >
          <Icon name="edit" size={14} /> Clinical Encounter
        </button>
        <button
          type="button"
          className="orh-status-badge info"
          style={{ cursor: "pointer", padding: "0.35rem 0.65rem" }}
          onClick={() => {
            if (onNavigate) onNavigate("orders")
            if (onActionClick) onActionClick("Order Diagnostics")
          }}
          title="Order Diagnostics"
        >
          <Icon name="flask" size={14} /> Lab Order
        </button>
        <button
          type="button"
          className="orh-status-badge warning"
          style={{ cursor: "pointer", padding: "0.35rem 0.65rem" }}
          onClick={() => {
            if (onNavigate) onNavigate("invoices")
            if (onActionClick) onActionClick("View Billing Invoices")
          }}
          title="Hospital Billing"
        >
          <Icon name="receipt" size={14} /> Bill & Invoices
        </button>
      </div>
    </section>
  )
}
