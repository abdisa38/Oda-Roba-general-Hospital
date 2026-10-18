import { useEffect, useRef, useState } from "react"
import Icon from "./Icon"
import { departments, services, type CareItem } from "./directoryData"
import {
  medicalProfessionals,
  staffSpecialties,
  staffDepartments,
  matchesProfessional,
  type MedicalProfessional,
} from "./staffData"
import StaffPortrait from "./staff/StaffPortrait"
import AvailabilityBadge from "./staff/AvailabilityBadge"
import BookingField, { type BookingFieldOption } from "./booking/BookingField"
import BookingCalendar from "./booking/BookingCalendar"
import AppointmentStatus from "./booking/AppointmentStatus"
import {
  blankPatient,
  dateKey,
  readableDate,
  timePreferences,
  patientErrors,
  stepErrors,
  statusDescriptions,
  type BookingEntry,
  type AppointmentDraft,
  type AppointmentRequest,
  type PatientDetails,
  type AppointmentStatus as Status,
} from "./booking/model"

type BookingProps = {
  entry: BookingEntry | null
  open: (title: string) => void
  onExit: () => void
  registerLeave: (guard: ((action: () => void) => void) | null) => void
}
const stages = ["Care", "Doctor", "Date & time", "Patient", "Review"]
type PatientFieldOptions = {
  required?: boolean
  type?: string
  helper?: string
  placeholder?: string
  options?: BookingFieldOption[]
  multiline?: boolean
}
function initialDraft(entry: BookingEntry | null): AppointmentDraft {
  const doctor = medicalProfessionals.find(
    (item) => item.id === entry?.doctorId,
  )
  const service = services.find((item) => item.slug === entry?.serviceSlug)
  const department = departments.find(
    (item) => item.slug === (entry?.departmentSlug ?? doctor?.departmentId),
  )
  return {
    careKind: service ? "service" : "department",
    careId: service?.id ?? department?.id ?? "",
    doctorChoice: doctor ? "specific" : "unselected",
    doctorId: doctor?.id ?? "",
    date: "",
    timePreference: "",
    patient: { ...blankPatient },
    consent: false,
  }
}
function useBookingDialog(isOpen: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = (document.activeElement as HTMLElement)
      ref.current?.showModal()
      const oldOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = oldOverflow
      }
    }
    ref.current?.close()
    previousFocus.current?.focus()
  }, [isOpen])
  return ref
}
export default function AppointmentBooking({
  entry,
  open,
  onExit,
  registerLeave,
}: BookingProps) {
  const [draft, setDraft] = useState(() => initialDraft(entry))
  const [step, setStep] = useState(1)
  const [furthest, setFurthest] = useState(1)
  const [careQuery, setCareQuery] = useState("")
  const [doctorQuery, setDoctorQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [doctorDepartment, setDoctorDepartment] = useState("care")
  const [doctorAvailability, setDoctorAvailability] = useState("all")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState<AppointmentRequest | null>(null)
  const [viewReceipt, setViewReceipt] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [previewDoctor, setPreviewDoctor] =
    useState<MedicalProfessional | null>(null)
  const leaveAction = useRef<(() => void) | null>(null)
  const submitting = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const leaveDialog = useBookingDialog(leaveOpen)
  const doctorDialog = useBookingDialog(previewDoctor !== null)
  const care = [...departments, ...services].find(
    (item) => item.id === draft.careId,
  )
  const careDepartment =
    care?.kind === "service"
      ? departments.find((item) => item.slug === care.department)
      : care
  const doctor = medicalProfessionals.find((item) => item.id === draft.doctorId)
  const preferredTime = timePreferences.find(
    (item) => item.id === draft.timePreference,
  )
  const careOptions = (
    draft.careKind === "department" ? departments : services
  ).filter((item) =>
    `${item.name} ${item.description} ${item.keywords.join(" ")}`
      .toLowerCase()
      .includes(careQuery.trim().toLowerCase()),
  )
  const eligibleDoctors = medicalProfessionals.filter(
    (item) =>
      matchesProfessional(item, doctorQuery) &&
      (specialty === "all" || item.specialtyId === specialty) &&
      (doctorDepartment === "all" ||
        item.departmentId ===
          (doctorDepartment === "care"
            ? careDepartment?.slug
            : doctorDepartment)) &&
      (doctorAvailability === "all" ||
        item.availability.status === doctorAvailability),
  )
  const dirty =
    step !== 6 &&
    (Boolean(draft.careId || draft.date || draft.doctorId) ||
      JSON.stringify(draft.patient) !== JSON.stringify(blankPatient))
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    if (step === 1) return
    document.getElementById("booking-workspace")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }, [step])
  useEffect(() => {
    registerLeave((action) => {
      setPreviewDoctor(null)
      if (dirty) {
        leaveAction.current = action
        setLeaveOpen(true)
      } else action()
    })
    return () => registerLeave(null)
  }, [dirty, registerLeave])
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  function requestLeave() {
    if (dirty) {
      leaveAction.current = onExit
      setLeaveOpen(true)
    } else onExit()
  }
  function updatePatient(key: keyof PatientDetails, value: string) {
    setDraft((current) => ({
      ...current,
      patient: { ...current.patient, [key]: value },
      consent: false,
    }))
    setErrors((current) => ({ ...current, [key]: "" }))
    setChecked((current) => ({ ...current, [key]: false }))
  }
  function checkPatientField(key: string) {
    const issue = patientErrors(draft.patient)[key]
    setErrors((current) => ({ ...current, [key]: issue ?? "" }))
    setChecked((current) => ({ ...current, [key]: !issue }))
  }
  function chooseCare(item: CareItem) {
    if (item.category === "emergency") {
      open("Emergency information")
      return
    }
    if (item.id === draft.careId) return
    const nextDepartment = item.kind === "service" ? item.department : item.slug
    const keepDoctor = doctor?.departmentId === nextDepartment
    setDraft((current) => ({
      ...current,
      careKind: item.kind,
      careId: item.id,
      doctorId: keepDoctor ? current.doctorId : "",
      doctorChoice: keepDoctor ? current.doctorChoice : "unselected",
      date: "",
      timePreference: "",
      consent: false,
    }))
    setFurthest(1)
    setErrors({})
  }
  function changeCareKind(kind: AppointmentDraft["careKind"]) {
    if (kind === draft.careKind) return
    setDraft((current) => ({
      ...current,
      careKind: kind,
      careId: "",
      doctorId: "",
      doctorChoice: "unselected",
      date: "",
      timePreference: "",
      consent: false,
    }))
    setCareQuery("")
    setFurthest(1)
    setErrors({})
  }
  function chooseDoctor(item: MedicalProfessional | null) {
    if (
      (item &&
        draft.doctorChoice === "specific" &&
        draft.doctorId === item.id) ||
      (!item && draft.doctorChoice === "hospital")
    )
      return
    setDraft((current) => ({
      ...current,
      doctorId: item?.id ?? "",
      doctorChoice: item ? "specific" : "hospital",
      date: "",
      timePreference: "",
      consent: false,
    }))
    setErrors((current) => ({ ...current, doctor: "" }))
    setFurthest(Math.min(furthest, 2))
  }
  function showErrors(issues: Record<string, string>) {
    setErrors(issues)
    requestAnimationFrame(() =>
      document.getElementById(`booking-${Object.keys(issues)[0]}`)?.focus(),
    )
  }
  function jump(target: number) {
    if (processing) return
    if (target > step) {
      for (let current = 1; current < target; current++) {
        const issues = stepErrors(current, draft)
        if (Object.keys(issues).length) {
          setStep(current)
          showErrors(issues)
          return
        }
      }
    }
    setErrors({})
    setStep(target)
    setFurthest(Math.max(furthest, target))
  }
  function next() {
    if (submitting.current || step === 6) return
    const issues = stepErrors(step, draft)
    if (Object.keys(issues).length) {
      showErrors(issues)
      return
    }
    if (step < 5) {
      jump(step + 1)
      return
    }
    for (let current = 1; current <= 5; current++) {
      const issue = stepErrors(current, draft)
      if (Object.keys(issue).length) {
        setStep(current)
        showErrors(issue)
        return
      }
    }
    submitting.current = true
    setProcessing(true)
    // This local simulation deliberately sends no patient information to a server.
    timer.current = setTimeout(() => {
      setReceipt({
        appointmentId: null,
        patientId:
          draft.patient.type === "returning" &&
          draft.patient.identifyBy === "id"
            ? draft.patient.patientId || null
            : null,
        department: careDepartment?.slug ?? "",
        service: care?.kind === "service" ? care.slug : null,
        doctor: draft.doctorChoice === "specific" ? draft.doctorId : null,
        date: draft.date,
        time: null,
        timePreference: draft.timePreference,
        status: "pending",
        appointmentType: "planned",
        createdDate: new Date().toISOString(),
        contactPreference: draft.patient.contactPreference,
        patient: { ...draft.patient },
        demo: true,
      })
      setProcessing(false)
      submitting.current = false
      setStep(6)
      setFurthest(5)
    }, 900)
  }
  function patientField(
    name: keyof PatientDetails,
    label: string,
    options: PatientFieldOptions = {},
  ) {
    return (
      <BookingField
        key={name}
        name={name}
        label={label}
        value={draft.patient[name]}
        onChange={(value) => updatePatient(name, value)}
        onBlur={() => checkPatientField(name)}
        error={errors[name]}
        valid={checked[name]}
        max={name === "dob" ? dateKey(new Date()) : undefined}
        {...options}
      />
    )
  }
  const patientName =
    draft.patient.type === "new"
      ? [draft.patient.firstName, draft.patient.lastName]
          .filter(Boolean)
          .join(" ")
      : "Returning patient · identity to be verified"
  function summary(editable: boolean) {
    return (
      <div className="booking-review-grid">
        {[
          {
            label: "CARE",
            index: 1,
            content: (
              <>
                <strong>{careDepartment?.name ?? "Not selected"}</strong>
                <span>
                  Service:{" "}
                  {care?.kind === "service"
                    ? care.name
                    : "Department appointment"}
                </span>
                <small>Care examples · availability unverified</small>
              </>
            ),
          },
          {
            label: "DOCTOR",
            index: 2,
            content: (
              <>
                <strong>
                  {draft.doctorChoice === "hospital"
                    ? "Hospital to help choose"
                    : (doctor?.name ?? "Not selected")}
                </strong>
                <span>
                  {draft.doctorChoice === "hospital"
                    ? "Route using the chosen care area"
                    : `${doctor?.specialty ?? ""}`}
                </span>
                <small>Professional selection requires verification</small>
              </>
            ),
          },
          {
            label: "DATE & TIME",
            index: 3,
            content: (
              <>
                <strong>{readableDate(draft.date)}</strong>
                <span>{preferredTime?.name ?? "Not selected"}</span>
                <small>Preferred date and time · hospital to confirm</small>
              </>
            ),
          },
          {
            label: "PATIENT",
            index: 4,
            content: (
              <>
                <strong>{patientName || "Not supplied"}</strong>
                <span>Phone: {draft.patient.phone || "Not supplied"}</span>
                {draft.patient.type === "returning" &&
                  draft.patient.identifyBy === "id" &&
                  draft.patient.patientId && (
                    <span>
                      Patient ID supplied · no record lookup performed
                    </span>
                  )}
                <small>
                  Contact preference:{" "}
                  {draft.patient.contactPreference === "none"
                    ? "No preference"
                    : draft.patient.contactPreference === "sms"
                      ? "SMS"
                      : draft.patient.contactPreference === "email"
                        ? "Email"
                        : "Phone"}
                </small>
              </>
            ),
          },
        ].map((section) => (
          <section key={section.label}>
            <div>
              <span>{section.label}</span>
              {editable && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => jump(section.index)}
                  aria-label={`Edit ${section.label.toLowerCase()}`}
                >
                  <Icon name="edit" size={14} />
                  Edit
                </button>
              )}
            </div>
            {section.content}
          </section>
        ))}
      </div>
    )
  }
  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="wide">
          <button
            className="brand"
            onClick={requestLeave}
            aria-label="Leave booking and return to Oda Roba Hospital"
          >
            <span className="brand-symbol">
              <Icon name="cross" size={30} />
            </span>
            <span>
              <strong>ODA ROBA</strong>
              <small>HOSPITAL</small>
            </span>
          </button>
          <span className="booking-header-location">
            <Icon name="pin" size={15} />
            Bale Robe, Oromia, Ethiopia
          </span>
          <div>
            <button onClick={() => open("Contact the hospital")}>
              <Icon name="phone" size={16} />
              Need help?
            </button>
            <button
              className="emergency-link"
              onClick={() => open("Emergency information")}
            >
              <Icon name="cross" size={16} />
              Emergency
            </button>
          </div>
        </div>
      </header>
      <div className="booking-container">
        <div className="booking-page-heading">
          <div>
            <div className="eyebrow">YOUR CARE. ONE STEP AT A TIME.</div>
            <h1>Book an appointment.</h1>
            <p>
              Choose the care, professional, and time that work best for you.
            </p>
          </div>
          <button onClick={requestLeave} className="booking-exit">
            <Icon name="close" size={16} />
            Exit booking
          </button>
        </div>
        <div className="booking-demo-note">
          <Icon name="shield" size={19} />
          <p>
            <strong>Interactive preview.</strong> Use sample information only.
            No request is sent to the hospital. Details remain only in this
            page’s memory.
          </p>
        </div>
        <nav className="booking-progress" aria-label="Appointment progress">
          <ol>
            {stages.map((stage, index) => (
              <li
                key={stage}
                className={
                  step > index + 1
                    ? "complete"
                    : step === index + 1
                      ? "current"
                      : "upcoming"
                }
              >
                <button
                  type="button"
                  disabled={index + 1 > furthest || processing || step === 6}
                  aria-current={step === index + 1 ? "step" : undefined}
                  onClick={() => jump(index + 1)}
                >
                  <span>
                    {step > index + 1 ? (
                      <Icon name="check" size={15} />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>
                  <strong>{stage}</strong>
                  <small>
                    {step > index + 1
                      ? "Completed"
                      : step === index + 1
                        ? "Current step"
                        : "Upcoming"}
                  </small>
                </button>
              </li>
            ))}
          </ol>
          <div className="booking-mobile-progress">
            <span>
              {step === 6 ? "Request preview complete" : `Step ${step} of 5`}
            </span>
            <strong>
              {step === 6 ? "Pending confirmation · demo" : stages[step - 1]}
            </strong>
            <div>
              {stages.map((stage, index) => (
                <span key={stage} className={step >= index + 1 ? "done" : ""} />
              ))}
            </div>
          </div>
        </nav>
        <div className="booking-workspace" id="booking-workspace">
          <form
            className={`booking-main ${step === 6 ? "is-complete" : ""}`}
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              next()
            }}
          >
            <div className="booking-step-heading">
              <span className="eyebrow">
                {step === 6
                  ? "DEMO CONFIRMATION"
                  : `STEP 0${step} / ${stages[step - 1].toUpperCase()}`}
              </span>
              <h2 ref={heading} tabIndex={-1} className="booking-step-title">
                {
                  [
                    "What type of care do you need?",
                    "Choose a healthcare professional.",
                    "Choose a date and time.",
                    "Tell us about the patient.",
                    "Review your appointment.",
                    "Appointment request received.",
                  ][step - 1]
                }
              </h2>
              <p>
                {
                  [
                    "Start with a department or a specific service. All options below are editable examples.",
                    "Choose a profile, or let the hospital help route your request. No diagnosis or recommendation is made.",
                    "Choose your preferences. Verified schedules and actual time slots are not connected.",
                    "Required fields are marked. Please use sample details for this preview.",
                    "Please review your information before submitting your appointment request.",
                    "Your demo request is complete. No request was sent to the hospital. In a live system, the hospital would confirm availability and provide next instructions.",
                  ][step - 1]
                }
              </p>
            </div>
            {Object.values(errors).some(Boolean) && (
              <div className="booking-error-summary" role="alert">
                <Icon name="warning" size={18} />
                <div>
                  <strong>Please check the highlighted information.</strong>
                  {Object.entries(errors)
                    .filter(([, error]) => error)
                    .map(([name, message]) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() =>
                          document.getElementById(`booking-${name}`)?.focus()
                        }
                      >
                        {message}
                      </button>
                    ))}
                </div>
              </div>
            )}
            {step === 1 && (
              <>
                <div
                  className="booking-care-tabs"
                  role="group"
                  aria-label="Choose care by"
                >
                  <button
                    type="button"
                    aria-pressed={draft.careKind === "department"}
                    className={draft.careKind === "department" ? "active" : ""}
                    onClick={() => {
                      changeCareKind("department")
                    }}
                  >
                    <Icon name="building" size={18} />
                    Choose a department
                  </button>
                  <button
                    type="button"
                    aria-pressed={draft.careKind === "service"}
                    className={draft.careKind === "service" ? "active" : ""}
                    onClick={() => {
                      changeCareKind("service")
                    }}
                  >
                    <Icon name="cross" size={18} />
                    Choose a service
                  </button>
                </div>
                <div className="booking-search">
                  <Icon name="search" size={20} />
                  <label className="sr-only" htmlFor="booking-care-query">
                    Search departments or services
                  </label>
                  <input
                    id="booking-care-query"
                    value={careQuery}
                    onChange={(event) => setCareQuery(event.target.value)}
                    placeholder="Search care options..."
                    autoComplete="off"
                  />
                  {careQuery && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setCareQuery("")}
                      aria-label="Clear care search"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
                <div
                  className="booking-care-grid"
                  id="booking-care"
                  tabIndex={-1}
                  role="group"
                  aria-label="Select a care option"
                >
                  {careOptions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={draft.careId === item.id}
                      className={`booking-care-option ${
                        draft.careId === item.id ? "selected" : ""
                      } ${item.category === "emergency" ? "urgent" : ""}`}
                      onClick={() => chooseCare(item)}
                    >
                      <Icon name={item.icon} size={25} />
                      <span>
                        <small>{item.kind.toUpperCase()}</small>
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                      </span>
                      <span className="option-choice">
                        {item.category === "emergency" ? (
                          <>
                            <Icon name="phone" size={14} />
                            Emergency pathway
                          </>
                        ) : draft.careId === item.id ? (
                          <>
                            <Icon name="check" size={14} />
                            Selected
                          </>
                        ) : (
                          "Select"
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                {!careOptions.length && (
                  <div className="booking-empty">
                    <h3>No care options found.</h3>
                    <p>Try another search term or explore all options.</p>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setCareQuery("")}
                    >
                      Clear search
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <div className="booking-search">
                  <Icon name="search" size={20} />
                  <label className="sr-only" htmlFor="booking-doctor-query">
                    Search doctors by name or specialty
                  </label>
                  <input
                    id="booking-doctor-query"
                    value={doctorQuery}
                    onChange={(event) => setDoctorQuery(event.target.value)}
                    placeholder="Search doctors by name or specialty..."
                    autoComplete="off"
                  />
                </div>
                <div className="booking-doctor-filters">
                  <div>
                    <label htmlFor="booking-specialty">Specialty</label>
                    <select
                      id="booking-specialty"
                      value={specialty}
                      onChange={(event) => setSpecialty(event.target.value)}
                    >
                      <option value="all">All specialties</option>
                      {staffSpecialties.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="booking-department-filter">
                      Department
                    </label>
                    <select
                      id="booking-department-filter"
                      value={doctorDepartment}
                      onChange={(event) =>
                        setDoctorDepartment(event.target.value)
                      }
                    >
                      <option value="care">Chosen care area</option>
                      <option value="all">All departments</option>
                      {staffDepartments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="booking-availability-filter">
                      Availability
                    </label>
                    <select
                      id="booking-availability-filter"
                      value={doctorAvailability}
                      onChange={(event) =>
                        setDoctorAvailability(event.target.value)
                      }
                    >
                      <option value="all">Any availability</option>
                      <option value="unverified">Schedule pending</option>
                      <option value="available">Available</option>
                      <option value="limited">Limited</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div
                  id="booking-doctor"
                  tabIndex={-1}
                  className="booking-doctor-grid"
                  role="group"
                  aria-label="Choose a healthcare professional"
                >
                  {eligibleDoctors.map((item) => {
                    const incompatible =
                      careDepartment?.slug !== item.departmentId
                    return (
                      <article
                        className={
                          draft.doctorId === item.id
                            ? "booking-doctor-card selected"
                            : "booking-doctor-card"
                        }
                        key={item.id}
                      >
                        <button
                          type="button"
                          className="booking-doctor-select"
                          disabled={
                            incompatible ||
                            item.appointmentEligibility === "not-eligible"
                          }
                          aria-pressed={
                            draft.doctorChoice === "specific" &&
                            draft.doctorId === item.id
                          }
                          onClick={() => chooseDoctor(item)}
                        >
                          <StaffPortrait doctor={item} />
                          <span>
                            <strong>{item.name}</strong>
                            <span>{item.specialty}</span>
                            <span>{item.professionalTitle}</span>
                            <span>{item.department}</span>
                          </span>
                        </button>
                        <div className="booking-doctor-bottom">
                          <AvailabilityBadge
                            status={item.availability.status}
                          />
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => setPreviewDoctor(item)}
                          >
                            View profile
                            <Icon name="arrow" size={14} />
                          </button>
                        </div>
                        <span className="booking-selection-label">
                          {incompatible ? (
                            "Different department · change care first"
                          ) : draft.doctorChoice === "specific" &&
                            draft.doctorId === item.id ? (
                            <>
                              <Icon name="check" size={14} />
                              Selected professional
                            </>
                          ) : (
                            "Select this clinician"
                          )}
                        </span>
                      </article>
                    )
                  })}
                </div>
                {!eligibleDoctors.length && (
                  <div className="booking-empty">
                    <h3>No matching doctors found.</h3>
                    <p>
                      Try different filters or choose routing assistance below.
                    </p>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setDoctorQuery("")
                        setSpecialty("all")
                        setDoctorDepartment("care")
                        setDoctorAvailability("all")
                      }}
                    >
                      Clear doctor filters
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className={`booking-route-help ${
                    draft.doctorChoice === "hospital" ? "selected" : ""
                  }`}
                  aria-pressed={draft.doctorChoice === "hospital"}
                  onClick={() => chooseDoctor(null)}
                >
                  <Icon name="user" size={22} />
                  <span>
                    <strong>Not sure which doctor to choose?</strong>
                    <span>
                      Choose for me. We’ll use the selected department or
                      service to help route the request—not symptoms or a
                      diagnosis.
                    </span>
                  </span>
                  <span>
                    {draft.doctorChoice === "hospital" ? (
                      <>
                        <Icon name="check" size={16} />
                        Selected
                      </>
                    ) : (
                      "Choose for me"
                    )}
                  </span>
                </button>
              </>
            )}
            {step === 3 && (
              <div className="booking-scheduling">
                <BookingCalendar
                  value={draft.date}
                  onChange={(value) => {
                    setDraft((current) => ({
                      ...current,
                      date: value,
                      consent: false,
                    }))
                    setErrors((current) => ({ ...current, date: "" }))
                  }}
                  error={errors.date}
                />
                <div
                  className="booking-time-panel"
                  id="booking-time"
                  tabIndex={-1}
                >
                  <div className="booking-time-heading">
                    <Icon name="clock" size={20} />
                    <h3>Time preference</h3>
                  </div>
                  <p>
                    No verified time slots are available in this preview. Choose
                    a preference, not a reserved time.
                  </p>
                  <div role="group" aria-label="Choose a time preference">
                    {timePreferences.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        aria-pressed={draft.timePreference === item.id}
                        className={
                          draft.timePreference === item.id ? "selected" : ""
                        }
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            timePreference: item.id,
                            consent: false,
                          }))
                          setErrors((current) => ({ ...current, time: "" }))
                        }}
                      >
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.description}</small>
                        </span>
                        {draft.timePreference === item.id && (
                          <Icon name="check" size={17} />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.time && (
                    <p className="booking-field-error">
                      <Icon name="warning" size={14} />
                      {errors.time}
                    </p>
                  )}
                  <span className="booking-schedule-note">
                    <Icon name="shield" size={16} />
                    The hospital would confirm the date, time, and professional
                    before the appointment.
                  </span>
                </div>
              </div>
            )}
            {step === 4 && (
              <>
                <div
                  className="booking-patient-tabs"
                  role="group"
                  aria-label="Patient registration type"
                >
                  <button
                    type="button"
                    aria-pressed={draft.patient.type === "new"}
                    className={draft.patient.type === "new" ? "selected" : ""}
                    onClick={() => {
                      updatePatient("type", "new")
                      setErrors({})
                    }}
                  >
                    I am a new patient
                    {draft.patient.type === "new" && (
                      <Icon name="check" size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-pressed={draft.patient.type === "returning"}
                    className={
                      draft.patient.type === "returning" ? "selected" : ""
                    }
                    onClick={() => {
                      updatePatient("type", "returning")
                      setErrors({})
                    }}
                  >
                    I am a returning patient
                    {draft.patient.type === "returning" && (
                      <Icon name="check" size={16} />
                    )}
                  </button>
                </div>
                {draft.patient.type === "returning" && (
                  <>
                    <div className="booking-returning-note">
                      <Icon name="shield" size={20} />
                      <p>
                        Identify the patient with an ID or phone number. No
                        record lookup or medical history is shown here. A live
                        system would verify identity separately.
                      </p>
                    </div>
                    <div
                      className="booking-identification-choice"
                      role="group"
                      aria-label="Identify returning patient by"
                    >
                      <button
                        type="button"
                        aria-pressed={draft.patient.identifyBy === "id"}
                        className={
                          draft.patient.identifyBy === "id" ? "active" : ""
                        }
                        onClick={() => {
                          updatePatient("identifyBy", "id")
                          setErrors({})
                        }}
                      >
                        Patient ID
                      </button>
                      <button
                        type="button"
                        aria-pressed={draft.patient.identifyBy === "phone"}
                        className={
                          draft.patient.identifyBy === "phone" ? "active" : ""
                        }
                        onClick={() => {
                          updatePatient("identifyBy", "phone")
                          setErrors({})
                        }}
                      >
                        Phone number
                      </button>
                    </div>
                  </>
                )}
                <div className="booking-patient-fields">
                  {draft.patient.type === "new" ? (
                    <>
                      {patientField("firstName", "First name", {
                        required: true,
                        placeholder: "Patient's first name",
                      })}
                      {patientField("lastName", "Last name", {
                        required: true,
                        placeholder: "Patient's last name",
                      })}
                      {patientField("dob", "Date of birth", {
                        required: true,
                        type: "date",
                        helper: "Must be a valid date, not a future date.",
                      })}
                      {patientField("sex", "Sex", {
                        options: [
                          { value: "", label: "Select if you wish" },
                          { value: "female", label: "Female" },
                          { value: "male", label: "Male" },
                          {
                            value: "prefer-not-to-say",
                            label: "Prefer not to say",
                          },
                        ],
                        helper:
                          "Final registration requirements must be confirmed by the hospital.",
                      })}
                    </>
                  ) : (
                    <>
                      {draft.patient.identifyBy === "id" &&
                        patientField("patientId", "Patient ID", {
                          required: true,
                          placeholder: "Hospital-issued patient ID",
                          helper:
                            "Use a sample ID. No patient record is retrieved.",
                        })}
                      {patientField("dob", "Date of birth", {
                        type: "date",
                        helper:
                          "Optional for returning patients in this preview.",
                      })}
                    </>
                  )}
                  {patientField("phone", "Phone number", {
                    type: "tel",
                    required:
                      draft.patient.type === "new" ||
                      draft.patient.identifyBy === "phone" ||
                      draft.patient.contactPreference === "sms" ||
                      draft.patient.contactPreference === "phone",
                    placeholder:
                      "Phone number, with country code if applicable",
                    helper:
                      "Different number formats are accepted; no country-specific format is assumed.",
                  })}
                  {patientField("email", "Email", {
                    type: "email",
                    required: draft.patient.contactPreference === "email",
                    placeholder: "you@example.com",
                  })}
                  {draft.patient.type === "new" && (
                    <div className="booking-field-wide">
                      {patientField("address", "Address", {
                        placeholder: "Town or area",
                        multiline: true,
                        helper: "Do not include medical information.",
                      })}
                    </div>
                  )}
                </div>
                <fieldset className="booking-contact-preference">
                  <legend>
                    How should we contact you? <span>Optional</span>
                  </legend>
                  <p>
                    Future notification preference only. SMS, email, and phone
                    integrations are not connected.
                  </p>
                  <div>
                    {[
                      ["none", "No preference"],
                      ["sms", "SMS"],
                      ["phone", "Phone"],
                      ["email", "Email"],
                    ].map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="contact-preference"
                          value={value}
                          checked={draft.patient.contactPreference === value}
                          onChange={() =>
                            updatePatient("contactPreference", value)
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 5 && (
              <>
                {summary(true)}
                <div className="booking-review-notice">
                  <Icon name="shield" size={19} />
                  <p>
                    This is a request, not a confirmed appointment. Hospital
                    availability, professional eligibility, and contact
                    integrations must be verified in the live experience.
                  </p>
                </div>
                <div className="booking-consent">
                  <label>
                    <input
                      id="booking-consent"
                      type="checkbox"
                      disabled={processing}
                      checked={draft.consent}
                      aria-invalid={!!errors.consent}
                      aria-describedby={
                        errors.consent ? "booking-consent-error" : undefined
                      }
                      onChange={(event) => {
                        setDraft((current) => ({
                          ...current,
                          consent: event.target.checked,
                        }))
                        setErrors((current) => ({ ...current, consent: "" }))
                      }}
                    />
                    <span>
                      I confirm that the information I provided is accurate.
                      <small>
                        Required before completing the demo request.
                      </small>
                    </span>
                  </label>
                  {errors.consent && (
                    <p
                      className="booking-field-error"
                      id="booking-consent-error"
                    >
                      {errors.consent}
                    </p>
                  )}
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => open("Privacy policy")}
                  >
                    Privacy policy
                    <Icon name="arrow" size={14} />
                  </button>
                </div>
              </>
            )}
            {step === 6 && receipt && (
              <>
                <div className="booking-confirmation-icon">
                  <Icon name="check" size={33} />
                </div>
                <div className="booking-confirmation-reference">
                  <span>Appointment reference</span>
                  <strong>[Appointment ID Placeholder]</strong>
                  <small>No real appointment ID was generated.</small>
                </div>
                <AppointmentStatus status={receipt.status} />
                <p className="booking-confirmation-note">
                  Demo status only. No appointment exists in the hospital system
                  and no SMS or email was sent.
                </p>
                {summary(false)}
                <div className="booking-confirmation-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => setViewReceipt(!viewReceipt)}
                  >
                    {viewReceipt
                      ? "Hide appointment preview"
                      : "View appointment"}
                    <Icon name="arrow" size={17} />
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={onExit}
                  >
                    Return to home
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
                {viewReceipt && (
                  <div className="booking-receipt-view">
                    <h3>Your demo appointment</h3>
                    <p>
                      Planned-care request preview. All information exists only
                      in this browser session and is discarded when you leave.
                    </p>
                    <span>Preferred date: {readableDate(receipt.date)}</span>
                    <span>
                      Time: Hospital to confirm · {preferredTime?.name}
                    </span>
                    <span>
                      Contact preference:{" "}
                      {receipt.contactPreference === "none"
                        ? "No preference"
                        : receipt.contactPreference}
                    </span>
                  </div>
                )}
                <details className="booking-status-examples">
                  <summary>
                    Future appointment statuses
                    <Icon name="chevron" size={17} />
                  </summary>
                  <p>Design examples only, not changes to this request.</p>
                  <div>
                    {(Object.keys(statusDescriptions) as Status[]).map(
                      (status) => (
                        <AppointmentStatus
                          status={status}
                          example
                          key={status}
                        />
                      ),
                    )}
                  </div>
                </details>
              </>
            )}
            {step < 6 && (
              <div className="booking-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={processing}
                  onClick={() => (step === 1 ? requestLeave() : jump(step - 1))}
                >
                  <span className="previous-arrow">
                    <Icon name="arrow" size={17} />
                  </span>
                  Back
                </button>
                <div>
                  <span>
                    {step === 5
                      ? "Demo only · no submission to the hospital"
                      : "Your selections stay with you when you go back."}
                  </span>
                  <button
                    className="button"
                    type="submit"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="booking-loading" />
                        Preparing demo request…
                      </>
                    ) : (
                      <>
                        {step === 5 ? "Request appointment" : "Continue"}
                        <Icon name="arrow" size={17} />
                      </>
                    )}
                  </button>
                </div>
                {processing && (
                  <p
                    className="booking-processing"
                    role="status"
                    aria-live="polite"
                  >
                    Preparing your demo request. Please wait; no duplicate
                    submission is needed.
                  </p>
                )}
              </div>
            )}
          </form>
          <aside className="booking-sidebar">
            <div className="eyebrow">YOUR VISIT AT A GLANCE</div>
            <h3>A clear path to care.</h3>
            <dl>
              <div>
                <dt>
                  <Icon name="building" size={16} />
                  Care
                </dt>
                <dd>{care?.name ?? "Choose a department or service"}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="user" size={16} />
                  Professional
                </dt>
                <dd>
                  {draft.doctorChoice === "hospital"
                    ? "Hospital to help choose"
                    : doctor
                      ? `${doctor.name} · ${doctor.specialty}`
                      : "Choose a professional or ask for help"}
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="calendar" size={16} />
                  Date & time
                </dt>
                <dd>
                  {draft.date
                    ? readableDate(draft.date)
                    : "Choose a date preference"}
                  <small>{preferredTime?.name ?? "Time to be confirmed"}</small>
                </dd>
              </div>
            </dl>
            <div className="booking-side-expect">
              <Icon name="shield" size={21} />
              <div>
                <strong>A request, not a confirmed booking.</strong>
                <p>
                  In a connected system, the hospital would review your
                  preferences and confirm the next steps.
                </p>
              </div>
            </div>
            <div className="booking-side-help">
              <h3>Need help?</h3>
              <button
                type="button"
                className="text-link"
                onClick={() => open("Contact the hospital")}
              >
                <Icon name="phone" size={15} />
                Contact the hospital
                <Icon name="arrow" size={15} />
              </button>
              <small>[Official hospital contact details]</small>
              <button
                type="button"
                className="text-link"
                onClick={() => open("Privacy policy")}
              >
                <Icon name="shield" size={15} />
                Privacy information
                <Icon name="arrow" size={15} />
              </button>
              <p>
                Use sample information in this preview. A verified backend and
                privacy process are required before live collection.
              </p>
            </div>
          </aside>
        </div>
        <section className="booking-emergency">
          <span className="emergency-icon">
            <Icon name="phone" size={23} />
          </span>
          <div>
            <h3>Need urgent medical care?</h3>
            <p>
              Appointments are for planned care. Seek immediate emergency help;
              do not wait for an appointment or online response.
            </p>
          </div>
          <button
            className="text-link"
            onClick={() => open("Emergency information")}
          >
            Emergency information
            <Icon name="arrow" size={17} />
          </button>
        </section>
        <footer className="booking-footer">
          <span>Oda Roba Hospital · Bale Robe, Oromia, Ethiopia</span>
          <div>
            <button onClick={() => open("Privacy policy")}>Privacy</button>
            <button onClick={() => open("Accessibility")}>Accessibility</button>
            <button onClick={() => open("Contact the hospital")}>
              Contact & help
            </button>
          </div>
        </footer>
      </div>
      <dialog
        ref={leaveDialog}
        className="booking-leave-dialog"
        aria-labelledby="booking-leave-title"
        onCancel={() => setLeaveOpen(false)}
      >
        <button
          type="button"
          className="dialog-close icon-button"
          aria-label="Close exit confirmation"
          onClick={() => setLeaveOpen(false)}
        >
          <Icon name="close" />
        </button>
        <div className="eyebrow">YOUR APPOINTMENT INFORMATION</div>
        <h2 id="booking-leave-title">Leave appointment booking?</h2>
        <p>
          Your appointment information may be lost if you leave now. No details
          have been saved or sent to the hospital.
        </p>
        <div>
          <button
            type="button"
            className="button"
            onClick={() => setLeaveOpen(false)}
          >
            Continue booking
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setLeaveOpen(false)
              leaveAction.current?.()
            }}
          >
            Leave
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </dialog>
      <dialog
        ref={doctorDialog}
        className="booking-profile-dialog"
        aria-labelledby="booking-profile-title"
        onCancel={() => setPreviewDoctor(null)}
      >
        <button
          type="button"
          className="dialog-close icon-button"
          aria-label="Close professional preview"
          onClick={() => setPreviewDoctor(null)}
        >
          <Icon name="close" />
        </button>
        {previewDoctor && (
          <>
            <div className="eyebrow">CLINICAL STAFF PROFILE</div>
            <h2 id="booking-profile-title">{previewDoctor.name}</h2>
            <h3>{previewDoctor.specialty}</h3>
            <p>
              {previewDoctor.professionalTitle}
              <br />
              {previewDoctor.department}
            </p>
            <p>{previewDoctor.introduction}</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => setPreviewDoctor(null)}
            >
              Back to choosing a professional
              <Icon name="arrow" size={16} />
            </button>
          </>
        )}
      </dialog>
    </div>
  )
}
