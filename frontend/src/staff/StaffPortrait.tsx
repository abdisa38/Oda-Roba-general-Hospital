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
      {doctor.photo ? (
        <img
          src={doctor.photo}
          alt={doctor.photoAlt || doctor.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      ) : (
        <div
          className="staff-portrait-placeholder"
          role="img"
          aria-label={doctor.name}
        >
          <span className="staff-portrait-frame">
            <Icon name="user" size={large ? 100 : 65} />
          </span>
          <span>{doctor.specialty}</span>
        </div>
      )}
      {doctor.verification === "verified" && (
        <span className="staff-photo-tag" style={{ background: "rgba(8, 126, 131, 0.9)", color: "white" }}>
          VERIFIED STAFF
        </span>
      )}
    </div>
  )
}
