import Icon from "../Icon"
import type { MedicalProfessional } from "../staffData"

type PortraitProps = {
  doctor: MedicalProfessional
  large?: boolean
}
export default function StaffPortrait({
  doctor,
  large = false,
}: PortraitProps) {
  return (
    <div className={`staff-portrait ${large ? "staff-portrait-large" : ""}`}>
      {doctor.photo && doctor.verification === "verified" ? (
        <img src={doctor.photo} alt={doctor.photoAlt} loading="lazy" />
      ) : (
        <div
          className="staff-portrait-placeholder"
          role="img"
          aria-label="Professional portrait placeholder. Actual staff photograph awaits hospital approval."
        >
          <span className="staff-portrait-frame">
            <Icon name="user" size={large ? 100 : 65} />
          </span>
          <span>Staff photograph placeholder</span>
        </div>
      )}
      {doctor.verification === "placeholder" && (
        <span className="staff-photo-tag">VERIFIED PORTRAIT TO BE ADDED</span>
      )}
    </div>
  )
}
