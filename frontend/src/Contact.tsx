import { useEffect, useRef, useState } from "react"
import Icon, { type IconName } from "./Icon"
import {
  contactDetails,
  inquiryTypes,
  type ContactDetails,
  type Inquiry,
  type SubmitInquiry,
} from "./contactData"
import "./contact.css"

type Props = {
  open: (title: string) => void
  go: (id: string) => void
  home: () => void
  details?: ContactDetails
  submitInquiry?: SubmitInquiry
}
const empty: Inquiry = {
  name: "",
  phone: "",
  email: "",
  type: "",
  subject: "",
  message: "",
}
function InfoBlock({
  icon,
  title,
  children,
}: {
  icon: IconName
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="contact-info">
      <Icon name={icon} size={23} />
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </article>
  )
}
export default function Contact({
  open,
  go,
  home,
  details = contactDetails,
  submitInquiry,
}: Props) {
  const [values, setValues] = useState<Inquiry>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Inquiry, string>>>(
    {},
  )
  const [status, setStatus] =
    useState<"idle" | "submitting" | "success" | "failure">("idle")
  const [reference, setReference] = useState("")
  const [preview, setPreview] =
    useState<"none" | "submitting" | "success" | "failure">("none")
  const [mapState, setMapState] = useState<"loading" | "ready" | "unavailable">(
    details.mapEmbedUrl ? "loading" : "unavailable",
  )
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const inFlight = useRef(false)
  const shown = preview === "none" ? status : preview
  useEffect(() => {
    if (shown === "success" || shown === "failure") resultRef.current?.focus()
  }, [shown])
  useEffect(() => {
    if (!details.mapEmbedUrl || mapState !== "loading") return
    const timeout = window.setTimeout(() => setMapState("unavailable"), 10000)
    return () => window.clearTimeout(timeout)
  }, [details.mapEmbedUrl, mapState])
  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (inFlight.current || preview !== "none") return
    const next: typeof errors = {}
    if (!values.name.trim()) next.name = "Please enter your name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "Please enter a valid email address."
    if (!inquiryTypes.some((type) => type === values.type))
      next.type = "Please select an inquiry type."
    if (!values.subject.trim()) next.subject = "Please enter a subject."
    if (!values.message.trim()) next.message = "Please enter a message."
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      )
      return
    }
    inFlight.current = true
    setStatus("submitting")
    try {
      if (!submitInquiry) throw new Error("Submission unavailable")
      const response = await submitInquiry(values)
      setReference(response.reference)
      setStatus("success")
      setValues(empty)
    } catch {
      setStatus("failure")
    } finally {
      inFlight.current = false
    }
  }
  function field(key: keyof Inquiry, label: string, optional = false) {
    const shared = {
      id: `contact-${key}`,
      name: key,
      value: values[key],
      required: !optional,
      "aria-invalid": errors[key] ? true as const : undefined,
      "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => {
        setValues((current) => ({ ...current, [key]: event.target.value }))
        setErrors((current) => ({ ...current, [key]: undefined }))
      },
    }
    return (
      <div
        className={`contact-field ${
          key === "message" || key === "subject" ? "full" : ""
        }`}
      >
        <label htmlFor={shared.id}>
          {label} <span>{optional ? "(optional)" : "(required)"}</span>
        </label>
        {key === "type" ? (
          <select {...shared}>
            <option value="">Select an inquiry type</option>
            {inquiryTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        ) : key === "message" ? (
          <textarea {...shared} rows={5} maxLength={3000} />
        ) : (
          <input
            {...shared}
            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
            autoComplete={
              key === "name"
                ? "name"
                : key === "phone"
                  ? "tel"
                  : key === "email"
                    ? "email"
                    : "off"
            }
            maxLength={key === "subject" ? 200 : 150}
          />
        )}
        {errors[key] && (
          <p className="contact-error" id={`contact-${key}-error`}>
            {errors[key]}
          </p>
        )}
      </div>
    )
  }
  const faqs = [
    [
      "Where is Oda Roba Hospital located?",
      "The hospital is in Bale Robe, Oromia, Ethiopia. The exact street address and hospital map pin are awaiting verification.",
    ],
    [
      "How can I contact the hospital?",
      "Official telephone and email details will appear here once verified by the hospital. Online inquiry delivery is not connected yet.",
    ],
    [
      "How do I request an appointment?",
      "Use Book an Appointment to explore the appointment request experience. It is currently a demo; it does not reserve a visit or confirm availability.",
    ],
    [
      "How can I find a department?",
      "Explore Departments & Services for care information. Listed examples remain subject to hospital verification.",
    ],
    [
      "Where can I find emergency information?",
      "Read the emergency panel near the top of this page. For urgent medical attention, seek appropriate emergency care immediately; do not wait for an online reply.",
    ],
    [
      "How can I ask about visiting hours?",
      "Verified visiting, reception, and holiday hours will be published in this contact directory. Until then, this website cannot confirm visiting arrangements.",
    ],
  ]
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="wide contact-hero-inner">
          <div>
            <div className="contact-breadcrumb">
              <button onClick={home}>Home</button>
              <span>/</span>Contact
            </div>
            <div className="eyebrow">
              <span className="tiny-line" /> CONTACT ODA ROBA HOSPITAL
            </div>
            <h1>
              We're Here <span>to Help.</span>
            </h1>
            <p>
              Find hospital contact information, plan your visit, or send a
              question to our team.
            </p>
            <div className="hero-buttons">
              <a className="button" href="#contact-location">
                <Icon name="directions" size={18} /> Get Directions
              </a>
              <a className="button secondary" href="#contact-inquiry">
                Send an Inquiry <Icon name="arrow" size={18} />
              </a>
            </div>
          </div>
          <div
            className="contact-photo"
            role="img"
            aria-label="Placeholder for a verified photograph of Oda Roba Hospital reception"
          >
            <span className="contact-photo-tag">
              HOSPITAL PHOTOGRAPH · PENDING
            </span>
            <Icon name="building" size={48} />
            <strong>A welcoming first point of contact.</strong>
            <p>
              Space reserved for an authentic hospital
              <br />
              reception or exterior photograph.
            </p>
            <span className="contact-photo-caption">
              <Icon name="pin" size={15} /> Bale Robe, Oromia, Ethiopia
            </span>
          </div>
        </div>
      </section>
      <div className="wide">
        <section
          className="contact-urgent"
          id="contact-emergency"
          aria-labelledby="urgent-title"
        >
          <span className="emergency-icon">
            <Icon name="cross" size={25} />
          </span>
          <div>
            <div className="contact-kicker">EMERGENCY ACCESS</div>
            <h2 id="urgent-title">Need Urgent Medical Care?</h2>
            <p>
              If someone may need urgent medical attention, seek appropriate
              emergency care immediately. Do not wait for a response to this
              website's contact form.
            </p>
            <div className="contact-emergency-details">
              <span>
                <Icon name="phone" size={15} />{" "}
                {details.emergencyPhone ? (
                  <a href={`tel:${details.emergencyPhone}`}>
                    {details.emergencyPhone}
                  </a>
                ) : (
                  "Official emergency telephone: pending verification"
                )}
              </span>
              <span>
                <Icon name="clock" size={15} />{" "}
                {details.emergencyHours ||
                  "Emergency operating information: pending verification"}
              </span>
            </div>
          </div>
          <div className="contact-urgent-actions">
            <button
              className="text-link"
              onClick={() => open("Emergency information")}
            >
              Emergency information <Icon name="arrow" size={16} />
            </button>
            <button
              className="text-link"
              onClick={() => go("emergency-department")}
            >
              Emergency department information <Icon name="arrow" size={16} />
            </button>
            <small>Department availability is unverified.</small>
          </div>
        </section>
        <section
          className="section contact-directory"
          aria-labelledby="contact-directory-title"
        >
          <div className="section-head">
            <div>
              <div className="eyebrow">LET’S CONNECT</div>
              <h2 id="contact-directory-title">
                Your next step, made clearer.
              </h2>
            </div>
            <p className="contact-verification">
              <Icon name="info" size={16} /> Official details awaiting hospital
              verification.
            </p>
          </div>
          <div className="contact-info-grid">
            <InfoBlock icon="pin" title="Hospital Location">
              <p>Bale Robe, Oromia, Ethiopia</p>
              <small>
                {details.address ||
                  "Exact street address: pending verification"}
              </small>
              <a className="text-link" href="#contact-location">
                Location & directions <Icon name="arrow" size={15} />
              </a>
            </InfoBlock>
            <InfoBlock icon="phone" title="Telephone">
              <p>{details.phone || "Official hospital phone"}</p>
              <small>
                {details.phone
                  ? "Hospital contact number"
                  : "Pending verification"}
              </small>
              {details.phone ? (
                <a className="text-link" href={`tel:${details.phone}`}>
                  Call the hospital <Icon name="arrow" size={15} />
                </a>
              ) : (
                <span className="contact-pending">
                  Call action available once verified
                </span>
              )}
            </InfoBlock>
            <InfoBlock icon="mail" title="Email">
              <p>{details.email || "Official hospital email"}</p>
              <small>
                {details.email
                  ? "General hospital inquiries"
                  : "Pending verification"}
              </small>
              {details.email ? (
                <a className="text-link" href={`mailto:${details.email}`}>
                  Email the hospital <Icon name="arrow" size={15} />
                </a>
              ) : (
                <span className="contact-pending">
                  Email action available once verified
                </span>
              )}
            </InfoBlock>
            <InfoBlock icon="edit" title="General Inquiries">
              <p>Questions about your next step?</p>
              <small>For non-urgent, general questions only.</small>
              <a className="text-link" href="#contact-inquiry">
                Go to the inquiry form <Icon name="arrow" size={15} />
              </a>
            </InfoBlock>
            <InfoBlock icon="clock" title="Visiting Information">
              <p>Plan your visit with confidence.</p>
              <small>
                Visiting: {details.visitingHours || "pending verification"}
                <br />
                Reception: {details.receptionHours || "pending verification"}
                <br />
                Holidays: {details.holidayInformation || "pending verification"}
              </small>
            </InfoBlock>
          </div>
        </section>
      </div>
      <section className="contact-location-section" id="contact-location">
        <div className="wide contact-location-grid">
          <div>
            <div className="eyebrow">LOCATION & DIRECTIONS</div>
            <h2>Find Us in Bale Robe.</h2>
            <p className="contact-address">
              <Icon name="pin" size={23} />
              <span>
                <strong>Oda Roba Hospital</strong>
                <br />
                Bale Robe, Oromia, Ethiopia
                <br />
                <small>
                  {details.address ||
                    "Exact street address awaiting verification."}
                </small>
              </span>
            </p>
            {details.directionsUrl ? (
              <a
                className="button"
                href={details.directionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="directions" size={18} /> Get Directions
              </a>
            ) : (
              <>
                <button className="button secondary" disabled>
                  <Icon name="directions" size={18} /> Directions pending
                  verification
                </button>
                <p className="contact-help">
                  A directions link will be added after the hospital’s exact
                  location is confirmed.
                </p>
              </>
            )}
            <div className="contact-arrival">
              <Icon name="info" size={20} />
              <div>
                <strong>Before you arrive</strong>
                <p>
                  {details.arrivalInformation ||
                    "Entrance, parking, accessibility, and arrival guidance will be published once supplied by the hospital."}
                </p>
              </div>
            </div>
          </div>
          <div className="contact-map">
            <span className="contact-map-label">HOSPITAL LOCATION</span>
            {details.mapEmbedUrl && mapState !== "unavailable" && (
              <iframe
                title="Verified Oda Roba Hospital location"
                src={details.mapEmbedUrl}
                onLoad={() => setMapState("ready")}
                onError={() => setMapState("unavailable")}
              />
            )}
            {mapState !== "ready" && (
              <div className="contact-map-placeholder" role="status">
                <span className="contact-map-pin">
                  <Icon name="pin" size={34} />
                </span>
                <h3>
                  {mapState === "loading"
                    ? "Loading hospital map…"
                    : "A verified location comes first."}
                </h3>
                <p>
                  {mapState === "loading"
                    ? "Please wait while the map loads."
                    : "The hospital map is not available yet. No precise location is shown until the address and map pin are verified."}
                </p>
                <small>MAP PLACEHOLDER · NOT A LOCATION PIN</small>
              </div>
            )}
          </div>
        </div>
      </section>
      <section
        className="wide section contact-inquiry-section"
        id="contact-inquiry"
      >
        <div className="contact-inquiry-intro">
          <div className="eyebrow">GENERAL INQUIRIES</div>
          <h2>How Can We Help?</h2>
          <p>Send a general question to the hospital team.</p>
          <div className="contact-safety">
            <Icon name="shield" size={24} />
            <h3>A note about your privacy</h3>
            <p>
              This form is for general inquiries. Please do not submit emergency
              requests or sensitive medical information through this form.
            </p>
            <p>This is not a secure clinical messaging system.</p>
            <button
              className="text-link"
              onClick={() => open("Privacy policy")}
            >
              Privacy Policy <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="contact-online-note">
            <Icon name="info" size={18} />
            <p>
              Online message delivery is not connected yet. Information entered
              here stays in this page’s memory and is not sent or saved.
            </p>
          </div>
        </div>
        <div className="contact-form-panel">
          {shown === "success" ? (
            <div
              className="contact-result"
              ref={resultRef}
              tabIndex={-1}
              role="status"
            >
              <span className="service-icon">
                <Icon name="check" size={26} />
              </span>
              {preview !== "none" && (
                <div className="eyebrow">SUCCESS STATE PREVIEW · NOT SENT</div>
              )}
              <h2>Thank You for Contacting Us.</h2>
              <p>
                {preview !== "none"
                  ? "This is an illustrative confirmation. No message has been delivered to the hospital."
                  : "Your message has been submitted. The hospital team can respond using the contact details you provided."}
              </p>
              <div className="notice">
                <strong>Submission reference</strong>
                <p>
                  {preview !== "none"
                    ? "[Reference supplied after confirmed submission]"
                    : reference || "Not provided"}
                </p>
              </div>
              <div className="contact-result-links">
                <button className="button" onClick={home}>
                  Return to Home
                </button>
                <button className="text-link" onClick={() => go("services")}>
                  Explore Services <Icon name="arrow" size={16} />
                </button>
                <button
                  className="text-link"
                  onClick={() => open("Request an appointment")}
                >
                  Book an Appointment <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={send}
              noValidate
              aria-busy={shown === "submitting"}
            >
              <div className="contact-form-heading">
                <h3>Your inquiry</h3>
                <span>Required fields are marked below.</span>
              </div>
              {shown === "failure" && (
                <div
                  className="contact-failure"
                  ref={resultRef}
                  tabIndex={-1}
                  role="alert"
                >
                  <Icon name="warning" size={20} />
                  <div>
                    <strong>Your message was not submitted.</strong>
                    <p>
                      {preview !== "none"
                        ? "Failure state preview. No message was sent."
                        : submitInquiry
                          ? "We could not confirm delivery. Your entries are still here. Please try again."
                          : "Online delivery is not available yet. Your entries are still here, but no message was sent."}
                    </p>
                  </div>
                </div>
              )}
              <fieldset disabled={shown === "submitting" || preview !== "none"}>
                <legend className="contact-sr-only">
                  General inquiry details
                </legend>
                <div className="contact-fields">
                  {field("name", "Full Name")}
                  {field("phone", "Phone Number", true)}
                  {field("email", "Email Address")}
                  {field("type", "Inquiry Type")}
                  {field("subject", "Subject")}
                  {field("message", "Message")}
                </div>
              </fieldset>
              <p className="contact-help">
                Please do not include private medical information in this
                general inquiry form.
              </p>
              <div className="contact-submit-row">
                <span>
                  <Icon name="mail" size={17} /> General questions only
                </span>
                <button
                  className="button"
                  type="submit"
                  disabled={shown === "submitting" || preview !== "none"}
                >
                  {shown === "submitting" ? "Sending message…" : "Send Message"}
                  <Icon name="arrow" size={17} />
                </button>
              </div>
              {shown === "submitting" && (
                <p role="status" className="contact-help">
                  {preview !== "none"
                    ? "Submitting state preview. No message is being sent."
                    : "Your message is being sent. Please wait."}
                </p>
              )}
            </form>
          )}
          <details className="contact-preview">
            <summary>
              Design preview: submission states{" "}
              <Icon name="chevron" size={15} />
            </summary>
            <p>Preview only. These controls never send your inquiry.</p>
            <div>
              {(["none", "submitting", "success", "failure"] as const).map(
                (state) => (
                  <button
                    key={state}
                    type="button"
                    aria-pressed={preview === state}
                    onClick={() => setPreview(state)}
                    disabled={status === "submitting"}
                  >
                    {state === "none"
                      ? "Live form"
                      : state === "submitting"
                        ? "Submitting"
                        : state === "success"
                          ? "Success"
                          : "Failure"}
                  </button>
                ),
              )}
            </div>
          </details>
        </div>
      </section>
      <section className="contact-faq-section">
        <div className="wide contact-faq-grid">
          <div>
            <div className="eyebrow">HELPFUL ANSWERS</div>
            <h2>
              A little clarity,
              <br />
              before you visit.
            </h2>
            <p>Common questions about getting in touch.</p>
          </div>
          <div className="contact-faq">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Icon name="chevron" size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="wide section">
        <div className="section-head">
          <div>
            <div className="eyebrow">YOUR NEXT STEP</div>
            <h2>Find the right place to start.</h2>
          </div>
        </div>
        <div className="contact-shortcuts">
          {([
            [
              "calendar",
              "Book an Appointment",
              "Explore the appointment demo",
              () => open("Request an appointment"),
            ],
            [
              "building",
              "Find a Department",
              "Explore departments & services",
              () => go("departments"),
            ],
            [
              "user",
              "Find a Doctor",
              "View the medical staff directory",
              () => go("doctors"),
            ],
            [
              "shield",
              "Patient Portal",
              "Portal entry & availability",
              () => open("Patient portal"),
            ],
          ] as const).map(([icon, title, description, action]) => (
            <button key={title} onClick={action}>
              <Icon name={icon} size={23} />
              <strong>{title}</strong>
              <span>{description}</span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      </section>
      <div className="wide contact-final-emergency">
        <Icon name="warning" size={22} />
        <div>
          <strong>Urgent care should never wait for an online reply.</strong>
          <p>
            Seek appropriate emergency care immediately. This form is not
            monitored for emergencies.
          </p>
        </div>
        <a className="text-link" href="#contact-emergency">
          Emergency information <Icon name="arrow" size={16} />
        </a>
      </div>
    </div>
  )
}
