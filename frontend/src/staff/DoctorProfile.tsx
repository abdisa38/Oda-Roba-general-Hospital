import Icon from "../Icon"
import type { MedicalProfessional } from "../staffData"
import StaffPortrait from "./StaffPortrait"
import AvailabilityBadge from "./AvailabilityBadge"

type DoctorProfileProps = {
  doctor: MedicalProfessional
  onBack: () => void
  onHome: () => void
  onAppointment: (doctor: MedicalProfessional) => void
  open: (title: string) => void
  go: (id: string) => void
}
export default function DoctorProfile({
  doctor,
  onBack,
  onHome,
  onAppointment,
  open,
  go,
}: DoctorProfileProps) {
  const isPlaceholder = doctor.verification === "placeholder"
  return (
    <div className="staff-profile-page">
      <section className="staff-profile-hero">
        <div className="wide">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <button onClick={onHome}>Home</button>
            <Icon name="chevron" size={12} />
            <button onClick={onBack}>Doctors</button>
            <Icon name="chevron" size={12} />
            <span aria-current="page">Professional profile</span>
          </nav>
          <div className="staff-profile-layout">
            <StaffPortrait doctor={doctor} large />
            <div className="staff-profile-intro">
              <div className="eyebrow">THE PEOPLE BEHIND YOUR CARE</div>
              {isPlaceholder && (
                <span className="staff-verification-note">
                  <Icon name="shield" size={15} />
                  Profile placeholder · awaiting hospital verification
                </span>
              )}
              <h1>{doctor.name}</h1>
              <div className="staff-profile-specialty">
                <Icon name="cross" size={19} />
                {doctor.specialty}
                {isPlaceholder && <span>Example specialty</span>}
              </div>
              <p className="staff-profile-role">{doctor.professionalTitle}</p>
              <div className="staff-profile-department">
                <Icon name="building" size={17} />
                {doctor.department}
                {isPlaceholder && <small> · example department</small>}
              </div>
              <p className="staff-profile-biography-intro">
                {doctor.introduction}
              </p>
              <div className="staff-profile-primary-actions">
                <button
                  className="button"
                  disabled={doctor.appointmentEligibility === "not-eligible"}
                  onClick={() => onAppointment(doctor)}
                >
                  <Icon name="calendar" size={18} />
                  Book an appointment
                  <Icon name="arrow" size={17} />
                </button>
                <button
                  className="text-link"
                  onClick={() => open("Contact the hospital")}
                >
                  Ask about availability
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <AvailabilityBadge status={doctor.availability.status} />
            </div>
          </div>
        </div>
      </section>
      <nav className="about-page-nav" aria-label="Profile sections">
        <div className="wide">
          <span>PROFESSIONAL PROFILE</span>
          <a href="#profile-about">About</a>
          <a href="#profile-care">Specialty & care</a>
          <a href="#profile-background">Professional background</a>
          <a href="#profile-availability">Availability</a>
        </div>
      </nav>
      <div className="section wide staff-profile-body">
        <div className="staff-profile-information">
          <section id="profile-about">
            <div className="eyebrow">A PERSONAL INTRODUCTION</div>
            <h2>About</h2>
            <p>{doctor.biography}</p>
            {isPlaceholder && (
              <span className="staff-field-note">
                Official biography and clinical background have not been
                provided.
              </span>
            )}
          </section>
          <section id="profile-care">
            <h2>Specialty</h2>
            <div className="staff-specialty-summary">
              <Icon name="cross" size={23} />
              <div>
                <strong>{doctor.specialty}</strong>
                <span>
                  {isPlaceholder
                    ? "Editable specialty example—not verified for a real staff member."
                    : doctor.professionalTitle}
                </span>
              </div>
            </div>
            <h3>Areas of care</h3>
            <ul className="staff-areas">
              {doctor.areasOfCare.map((area) => (
                <li key={area}>
                  <Icon name="shield" size={15} />
                  {area}
                </li>
              ))}
            </ul>
            {isPlaceholder && (
              <span className="staff-field-note">
                These are editable examples, not verified treatment capabilities
                or medical advice.
              </span>
            )}
          </section>
          <section id="profile-background">
            <div className="eyebrow">PROFESSIONAL INFORMATION</div>
            <h2>Education & qualifications</h2>
            <ul className="staff-qualifications">
              {doctor.qualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="staff-background-block">
              <h3>Professional experience</h3>
              <p>{doctor.experience}</p>
            </div>
            <div className="staff-background-block">
              <h3>Languages</h3>
              <p>{doctor.languages.join(", ")}</p>
            </div>
            {isPlaceholder && (
              <span className="staff-field-note">
                Qualifications, experience, and languages require hospital
                verification before publication.
              </span>
            )}
          </section>
          <div className="staff-profile-next">
            <Icon name="building" size={24} />
            <div>
              <h3>Understand your next step.</h3>
              <p>
                Explore the department and services associated with this example
                profile.
              </p>
              <button className="text-link" onClick={() => go("departments")}>
                Explore departments
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </div>
        <aside className="staff-schedule" id="profile-availability">
          <div className="eyebrow">PLAN YOUR VISIT</div>
          <h2>Appointment availability</h2>
          <p>
            {doctor.availability.status === "unverified"
              ? "No verified schedule has been provided. Days below show the future schedule structure only."
              : "The hospital will confirm your appointment request."}
          </p>
          <div className="staff-schedule-days">
            {doctor.availability.schedule.map((day) => (
              <div key={day.day}>
                <span>{day.day}</span>
                <div>
                  <AvailabilityBadge status={day.status} />
                  {day.times.length > 0 && day.status !== "unverified" && (
                    <small>{day.times.join(" · ")}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="staff-schedule-legend">
            <span>
              Status key · design examples, not this doctor’s schedule
            </span>
            <div>
              <AvailabilityBadge status="available" example />
              <AvailabilityBadge status="limited" example />
              <AvailabilityBadge status="unavailable" example />
            </div>
          </div>
          <button
            className="button"
            disabled={doctor.appointmentEligibility === "not-eligible"}
            onClick={() => onAppointment(doctor)}
          >
            Request appointment
            <Icon name="arrow" size={17} />
          </button>
          <span className="staff-schedule-note">
            Request pathway preview · live booking not connected
          </span>
        </aside>
      </div>
      <section className="emergency-section wide staff-emergency">
        <span className="emergency-icon">
          <Icon name="phone" size={26} />
        </span>
        <div>
          <div className="emergency-eyebrow">URGENT CARE INFORMATION</div>
          <h3>Need urgent medical care?</h3>
          <p>
            Seek immediate emergency care. Do not wait for a routine
            appointment.
          </p>
          <span className="emergency-number">
            [Official emergency number] · pending verification
          </span>
        </div>
        <button
          className="button emergency-button"
          onClick={() => open("Emergency information")}
        >
          Emergency information
          <Icon name="arrow" size={17} />
        </button>
      </section>
      <section className="wide staff-profile-help">
        <div>
          <h2>Need help planning your care?</h2>
          <p>Contact the hospital for verified information and guidance.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => open("Contact the hospital")}
        >
          Contact the hospital
          <Icon name="arrow" size={17} />
        </button>
        <button className="text-link" onClick={onBack}>
          All medical professionals
          <Icon name="arrow" size={17} />
        </button>
      </section>
    </div>
  )
}
