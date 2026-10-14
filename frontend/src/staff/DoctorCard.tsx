import type { MouseEvent } from "react"
import Icon from "../Icon"
import type { MedicalProfessional } from "../staffData"
import StaffPortrait from "./StaffPortrait"
import AvailabilityBadge from "./AvailabilityBadge"

type DoctorCardProps = {
  doctor: MedicalProfessional
  onProfile: (slug?: string) => void
  onAppointment: (doctor: MedicalProfessional) => void
  query?: string
}
type MatchProps = {
  text: string
  query: string
}
function Match({ text, query }: MatchProps) {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase())
  if (!query.trim() || index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.trim().length)}</mark>
      {text.slice(index + query.trim().length)}
    </>
  )
}
export default function DoctorCard({
  doctor,
  onProfile,
  onAppointment,
  query = "",
}: DoctorCardProps) {
  function profile(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onProfile(doctor.slug)
  }
  return (
    <article className="staff-card">
      <StaffPortrait doctor={doctor} />
      <div className="staff-card-content">
        <span className="example-label">
          {doctor.verification === "placeholder"
            ? "PROFILE PLACEHOLDER"
            : "MEDICAL PROFESSIONAL"}
        </span>
        <h3>
          <Match text={doctor.name} query={query} />
        </h3>
        <div className="staff-card-specialty">
          <Icon name="cross" size={15} />
          <span>
            <Match text={doctor.specialty} query={query} />
          </span>
          {doctor.verification === "placeholder" && (
            <small>Example specialty</small>
          )}
        </div>
        <p className="staff-card-title">{doctor.professionalTitle}</p>
        <div className="staff-card-department">
          <Icon name="building" size={14} />
          <span>
            <Match text={doctor.department} query={query} />
          </span>
        </div>
        <p className="staff-card-description">{doctor.introduction}</p>
        <AvailabilityBadge status={doctor.availability.status} />
        <div className="staff-card-actions">
          <a
            href={`/doctors/${doctor.slug}`}
            className="text-link staff-profile-link"
            aria-label={`View profile: ${doctor.name}, ${doctor.specialty}`}
            onClick={profile}
          >
            View profile
            <Icon name="arrow" size={16} />
          </a>
          <button
            className="button secondary"
            aria-label={`Explore appointment pathway: ${doctor.name}, ${doctor.specialty}`}
            disabled={doctor.appointmentEligibility === "not-eligible"}
            onClick={() => onAppointment(doctor)}
          >
            Book appointment
          </button>
        </div>
      </div>
    </article>
  )
}
