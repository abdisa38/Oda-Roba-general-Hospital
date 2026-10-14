import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import Icon from "./Icon"
import {
  medicalProfessionals,
  staffDepartments,
  staffSpecialties,
  matchesProfessional,
  type MedicalProfessional,
  type AvailabilityStatus,
} from "./staffData"
import DoctorCard from "./staff/DoctorCard"
import DoctorProfile from "./staff/DoctorProfile"

type DoctorsProps = {
  path: string
  onBook: (doctor?: MedicalProfessional) => void
  registerAppointment: (action: (() => void) | null) => void
  onProfile: (slug?: string) => void
  home: () => void
  open: (title: string) => void
  go: (id: string) => void
}
const PAGE_SIZE = 6
export default function Doctors({
  path,
  onBook,
  registerAppointment,
  onProfile,
  home,
  open,
  go,
}: DoctorsProps) {
  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [department, setDepartment] = useState("all")
  const [availability, setAvailability] = useState<AvailabilityStatus | "all">(
    "all",
  )
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const slug = path.startsWith("/doctors/") ? path.split("/")[2] : null
  const profile = slug
    ? medicalProfessionals.find((doctor) => doctor.slug === slug)
    : null
  const activeFilterCount = [specialty, department, availability].filter(
    (value) => value !== "all",
  ).length
  const isFiltered = query.trim().length > 0 || activeFilterCount > 0
  const filtered = medicalProfessionals.filter(
    (doctor) =>
      matchesProfessional(doctor, query) &&
      (specialty === "all" || doctor.specialtyId === specialty) &&
      (department === "all" || doctor.departmentId === department) &&
      (availability === "all" || doctor.availability.status === availability),
  )
  const visible = filtered.slice(0, visibleCount)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, specialty, department, availability])
  useEffect(() => {
    registerAppointment(() => {
      onBook(profile ?? undefined)
    })
    return () => registerAppointment(null)
  }, [profile, registerAppointment, onBook])
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const onChange = () => setFiltersOpen(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])
  function appointment(doctor: MedicalProfessional | null = null) {
    onBook(doctor ?? undefined)
  }
  function reset() {
    setQuery("")
    setSpecialty("all")
    setDepartment("all")
    setAvailability("all")
    setVisibleCount(PAGE_SIZE)
    inputRef.current?.focus()
  }
  function resultKeyboard(event: KeyboardEvent<HTMLElement>) {
    const links = Array.from(
      resultsRef.current?.querySelectorAll<HTMLAnchorElement>(
        ".staff-profile-link",
      ) ?? [],
    )
    if (event.key === "Escape") {
      inputRef.current?.focus()
      return
    }
    if (!links.length || (event.key !== "ArrowDown" && event.key !== "ArrowUp"))
      return
    event.preventDefault()
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    const next =
      index < 0
        ? event.key === "ArrowDown"
          ? 0
          : links.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) %
          links.length
    links[next].focus()
  }
  function loadMore() {
    const firstNew = visibleCount
    setVisibleCount((value) => value + PAGE_SIZE)
    requestAnimationFrame(() =>
      resultsRef.current
        ?.querySelectorAll<HTMLAnchorElement>(".staff-profile-link")
        [firstNew]?.focus(),
    )
  }
  return (
    <div className="staff-page">
      {slug ? (
        profile ? (
          <DoctorProfile
            doctor={profile}
            onBack={() => onProfile()}
            onHome={home}
            onAppointment={appointment}
            open={open}
            go={go}
          />
        ) : (
          <section className="section wide staff-missing-profile">
            <Icon name="user" size={35} />
            <div className="eyebrow">MEDICAL PROFESSIONAL PROFILE</div>
            <h1>Profile not available.</h1>
            <p>
              This profile has not been provided. Explore the directory for
              current profile placeholders.
            </p>
            <button className="button" onClick={() => onProfile()}>
              All medical professionals
              <Icon name="arrow" size={17} />
            </button>
          </section>
        )
      ) : (
        <>
          <section className="directory-hero staff-hero">
            <div className="wide">
              <nav className="about-breadcrumb" aria-label="Breadcrumb">
                <button onClick={home}>Home</button>
                <Icon name="chevron" size={12} />
                <span aria-current="page">Doctors & medical staff</span>
              </nav>
              <div className="directory-hero-layout">
                <div>
                  <div className="eyebrow">
                    <span className="tiny-line" />
                    OUR MEDICAL TEAM
                  </div>
                  <h1>
                    Meet the people
                    <br />
                    <span>behind your care.</span>
                  </h1>
                  <p>
                    Explore our healthcare professionals and find the right
                    place to begin your care journey.
                  </p>
                  <div className="directory-hero-actions">
                    <button className="button" onClick={() => appointment()}>
                      <Icon name="calendar" size={17} />
                      Book an appointment
                      <Icon name="arrow" size={16} />
                    </button>
                    <button
                      className="text-link"
                      onClick={() => go("services")}
                    >
                      Explore services
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>
                </div>
                <figure className="directory-hero-image staff-hero-image">
                  <img
                    src="/images/patient-care.jpg"
                    alt="Healthcare professionals discussing information in a clinical setting; illustrative photograph, not Oda Roba Hospital"
                    fetchPriority="high"
                  />
                  <span className="image-label">Illustrative team imagery</span>
                  <figcaption>
                    <Icon name="heart" size={17} />
                    People at the heart of care.
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
          <section
            className="wide staff-discovery"
            id="staff-discovery"
            aria-labelledby="staff-search-title"
          >
            <div className="discovery-heading">
              <h2 id="staff-search-title">Find a healthcare professional.</h2>
              <span className="directory-note">
                <Icon name="shield" size={14} />
                Profile examples · no verified staff directory provided
              </span>
            </div>
            <form
              className="care-search-form"
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                resultsRef.current
                  ?.querySelector<HTMLAnchorElement>(".staff-profile-link")
                  ?.focus()
              }}
            >
              <div className="care-search-input">
                <Icon name="search" size={22} />
                <label htmlFor="staff-query" className="sr-only">
                  Search by doctor name or specialty
                </label>
                <input
                  id="staff-query"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={resultKeyboard}
                  placeholder="Search by doctor name or specialty..."
                  autoComplete="off"
                  aria-controls="staff-results"
                  aria-describedby="staff-search-help"
                />
                {query && (
                  <button
                    className="clear-search"
                    type="button"
                    onClick={() => {
                      setQuery("")
                      inputRef.current?.focus()
                    }}
                    aria-label="Clear doctor search"
                  >
                    <Icon name="close" size={17} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <button className="button search-submit" type="submit">
                Search
                <Icon name="arrow" size={17} />
              </button>
            </form>
            <details
              className="staff-filter-details"
              open={filtersOpen}
              onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
            >
              <summary>
                <Icon name="scan" size={19} />
                <strong>Filters</strong>
                <span>
                  {activeFilterCount > 0
                    ? `${activeFilterCount} selected`
                    : "Specialty, department & availability"}
                </span>
                <Icon name="chevron" size={17} />
              </summary>
              <div className="staff-filter-row">
                <button
                  className={`staff-all-filter ${!isFiltered ? "active" : ""}`}
                  aria-pressed={!isFiltered}
                  onClick={reset}
                >
                  <Icon name="user" size={18} />
                  All doctors
                </button>
                <div className="staff-filter">
                  <label htmlFor="staff-specialty">Specialty</label>
                  <select
                    id="staff-specialty"
                    value={specialty}
                    onChange={(event) => setSpecialty(event.target.value)}
                  >
                    <option value="all">All specialties</option>
                    {staffSpecialties.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name} · example
                      </option>
                    ))}
                  </select>
                </div>
                <div className="staff-filter">
                  <label htmlFor="staff-department">Department</label>
                  <select
                    id="staff-department"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                  >
                    <option value="all">All departments</option>
                    {staffDepartments.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name} · example
                      </option>
                    ))}
                  </select>
                </div>
                <div className="staff-filter">
                  <label htmlFor="staff-availability">Availability</label>
                  <select
                    id="staff-availability"
                    value={availability}
                    onChange={(event) =>
                      setAvailability(
                        event.target.value as AvailabilityStatus | "all",
                      )
                    }
                  >
                    <option value="all">Any availability</option>
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Not available</option>
                    <option value="unverified">Schedule pending</option>
                  </select>
                </div>
              </div>
            </details>
            <div className="staff-search-foot">
              <p id="staff-search-help">
                Specialties and departments are examples. All current schedules
                await verification.
              </p>
              {isFiltered && (
                <button className="text-link" onClick={reset}>
                  Clear filters
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          </section>
          {!isFiltered && (
            <section className="section staff-featured">
              <div className="wide">
                <div className="section-head">
                  <div className="section-heading">
                    <div className="eyebrow">MEET OUR TEAM</div>
                    <h2>Dedicated people. Compassionate care.</h2>
                    <p>
                      A thoughtful introduction to the people behind your care.
                    </p>
                  </div>
                  <a className="text-link" href="#staff-directory">
                    All medical professionals
                    <Icon name="arrow" size={17} />
                  </a>
                </div>
                <div className="staff-grid">
                  {medicalProfessionals
                    .filter((doctor) => doctor.featured)
                    .slice(0, 3)
                    .map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onProfile={onProfile}
                        onAppointment={appointment}
                      />
                    ))}
                </div>
                <span className="directory-note">
                  <Icon name="shield" size={14} />
                  Featured profile placeholders. Names, specialties, roles, and
                  credentials require hospital verification.
                </span>
              </div>
            </section>
          )}
          <section
            className="section wide staff-directory"
            id="staff-directory"
          >
            <div className="staff-directory-heading">
              <div>
                <div className="eyebrow">
                  {isFiltered ? "YOUR SEARCH RESULTS" : "OUR CARE TEAM"}
                </div>
                <h2>All medical professionals.</h2>
              </div>
              <div>
                <span className="staff-real-count">
                  [Number] healthcare professionals
                </span>
                <span
                  className="staff-sample-count"
                  role="status"
                  aria-live="polite"
                >
                  {filtered.length} matching placeholder{" "}
                  {filtered.length === 1 ? "profile" : "profiles"}
                </span>
              </div>
            </div>
            <div id="staff-results" ref={resultsRef} onKeyDown={resultKeyboard}>
              {visible.length ? (
                <div className="staff-grid">
                  {visible.map((doctor) => (
                    <DoctorCard
                      doctor={doctor}
                      key={doctor.id}
                      onProfile={onProfile}
                      onAppointment={appointment}
                      query={query}
                    />
                  ))}
                </div>
              ) : (
                <div className="search-empty staff-empty">
                  <span>
                    <Icon name="search" size={29} />
                  </span>
                  <h3>No healthcare professionals found.</h3>
                  <p>Try another name, specialty, or department.</p>
                  {availability !== "all" && availability !== "unverified" && (
                    <p className="staff-empty-schedule-note">
                      Verified schedules are not connected. All current profiles
                      show “Schedule pending.”
                    </p>
                  )}
                  <button className="button secondary" onClick={reset}>
                    Clear filters
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>
            {visible.length > 0 && (
              <div className="staff-directory-bottom">
                <span>
                  Showing {visible.length} of {filtered.length} example profiles
                  · not a verified staff count
                </span>
                {visible.length < filtered.length ? (
                  <button className="button secondary" onClick={loadMore}>
                    Load more profiles
                    <Icon name="arrow" size={16} />
                  </button>
                ) : (
                  <span className="staff-all-shown">
                    All matching example profiles shown
                  </span>
                )}
              </div>
            )}
            <p className="staff-keyboard-help">
              Use Tab or the arrow keys to browse profiles. Press Enter to view
              a profile.
            </p>
          </section>
          <section className="staff-trust-section">
            <div className="wide section">
              <div className="section-heading">
                <div className="eyebrow">OUR APPROACH TO CARE</div>
                <h2>Professional care starts with the right team.</h2>
              </div>
              <div className="staff-trust-grid">
                {[
                  {
                    icon: "heart" as const,
                    title: "Patient-centered",
                    text: "A care experience that starts with listening and understanding.",
                  },
                  {
                    icon: "shield" as const,
                    title: "Professional",
                    text: "A responsible approach to communication, information, and privacy.",
                  },
                  {
                    icon: "user" as const,
                    title: "Respectful",
                    text: "Dignity and consideration for every patient and family.",
                  },
                  {
                    icon: "cross" as const,
                    title: "Collaborative",
                    text: "A connected care journey with clear next steps.",
                  },
                ].map((item) => (
                  <article key={item.title}>
                    <Icon name={item.icon} size={27} />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
              <span className="directory-note">
                <Icon name="shield" size={14} />
                Proposed care principles, not verified qualifications or
                performance claims.
              </span>
            </div>
          </section>
          <section className="section wide staff-guidance">
            <div>
              <div className="eyebrow">A CLEARER STARTING POINT</div>
              <h2>Not sure who to see?</h2>
              <p>
                Explore our departments and services to understand where to
                begin.
              </p>
              <span className="directory-note">
                <Icon name="shield" size={14} />
                Navigation guidance only—not medical advice.
              </span>
            </div>
            <div>
              <button className="button" onClick={() => go("departments")}>
                <Icon name="building" size={18} />
                Explore departments
                <Icon name="arrow" size={17} />
              </button>
              <button
                className="button secondary"
                onClick={() => go("services")}
              >
                Explore services
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </section>
          <section className="wide staff-pathway">
            <div>
              <div className="eyebrow light">
                FROM DISCOVERY TO YOUR NEXT STEP
              </div>
              <h2>
                Your appointment journey,
                <br />
                made clear.
              </h2>
              <p>
                Choose a professional, tell us your preferences, and request
                confirmation from the hospital.
              </p>
            </div>
            <ol>
              {[
                "Doctor",
                "Date",
                "Time",
                "Patient information",
                "Confirm request",
              ].map((step, i) => (
                <li key={step}>
                  <span>0{i + 1}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            <div className="staff-pathway-actions">
              <button className="button white" onClick={() => appointment()}>
                Book an appointment
                <Icon name="arrow" size={17} />
              </button>
              <span>
                Pathway preview only. Live booking and verified schedules are
                not connected.
              </span>
            </div>
          </section>
          <section className="emergency-section wide staff-emergency">
            <span className="emergency-icon">
              <Icon name="phone" size={26} />
            </span>
            <div>
              <div className="emergency-eyebrow">WHEN CARE CANNOT WAIT</div>
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
          <section className="section wide staff-help">
            <div>
              <div className="eyebrow">WE’LL HELP YOU FIND YOUR WAY</div>
              <h2>
                Need help finding
                <br />
                the right doctor?
              </h2>
              <p>
                Contact information will be added after hospital confirmation.
              </p>
            </div>
            <div className="staff-help-options">
              <button onClick={() => open("Contact the hospital")}>
                <Icon name="phone" size={21} />
                <span>
                  <strong>Contact the hospital</strong>
                  <small>[Official phone] · [Official email]</small>
                </span>
                <Icon name="arrow" size={17} />
              </button>
              <button onClick={() => go("departments")}>
                <Icon name="building" size={21} />
                <span>
                  <strong>Explore departments</strong>
                  <small>Find the right starting point for your care</small>
                </span>
                <Icon name="arrow" size={17} />
              </button>
              <button onClick={() => appointment()}>
                <Icon name="calendar" size={21} />
                <span>
                  <strong>Book an appointment</strong>
                  <small>Explore the future request pathway</small>
                </span>
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
