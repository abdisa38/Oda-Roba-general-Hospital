import { useState, type ReactNode } from "react"
import Icon, { type IconName } from "./Icon"
import { patientGuidance, type PatientGuidance } from "./patientServicesData"
import "./patient-services.css"

type Props = {
  open: (title: string) => void
  go: (id: string) => void
  home: () => void
  guidance?: PatientGuidance
}
function Status({ children }: { children: ReactNode }) {
  return <span className="ps-status">{children}</span>
}
function Heading({
  label,
  title,
  text,
}: {
  label: string
  title: string
  text?: string
}) {
  return (
    <div className="ps-heading">
      <div className="eyebrow">{label}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}
function Action({
  children,
  onClick,
  secondary = false,
}: {
  children: ReactNode
  onClick: () => void
  secondary?: boolean
}) {
  return (
    <button
      className={`button${secondary ? " secondary" : ""}`}
      onClick={onClick}
    >
      {children}
      <Icon name="arrow" size={17} />
    </button>
  )
}
function Information({
  icon,
  title,
  text,
  action,
  onClick,
  status,
}: {
  icon: IconName
  title: string
  text: string
  action?: string
  onClick?: () => void
  status?: string
}) {
  return (
    <article className="ps-information">
      <Icon name={icon} size={24} />
      <div>
        {status && <Status>{status}</Status>}
        <h3>{title}</h3>
        <p>{text}</p>
        {action && onClick && (
          <button className="text-link" onClick={onClick}>
            {action}
            <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
    </article>
  )
}
export default function PatientServices({
  open,
  go,
  home,
  guidance = patientGuidance,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const book = () => open("Request an appointment")
  const portal = () => open("Patient portal")
  const contact = () => go("contact")
  const hub: {
    icon: IconName
    title: string
    text: string
    status: string
    action: string
    run: () => void
  }[] = [
    {
      icon: "calendar",
      title: "Book an Appointment",
      text: "Explore a planned visit request; live booking is not connected.",
      status: "Demo · not a confirmed booking",
      action: "Open appointment demo",
      run: book,
    },
    {
      icon: "user",
      title: "Find a Doctor",
      text: "Explore the medical staff directory; profiles await verification.",
      status: "Directory preview",
      action: "Explore medical staff",
      run: () => go("doctors"),
    },
    {
      icon: "building",
      title: "Explore Departments",
      text: "Find care information; hospital offerings await verification.",
      status: "Directory preview",
      action: "Browse departments",
      run: () => go("departments"),
    },
    {
      icon: "shield",
      title: "Patient Portal",
      text: "Learn about future authenticated patient services.",
      status: "Coming Soon",
      action: "View portal availability",
      run: portal,
    },
    {
      icon: "flask",
      title: "Laboratory Results",
      text: "Find guidance about the hospital’s approved results process.",
      status: "Contact the Hospital",
      action: "Learn about results",
      run: () => go("results"),
    },
    {
      icon: "mail",
      title: "Contact the Hospital",
      text: "Find location and general inquiry information in one place.",
      status: "Information available",
      action: "Contact information",
      run: contact,
    },
  ]
  const journey = [
    ["Reception", "Find out where to begin your visit."],
    [
      "Registration or Patient Identification",
      "Follow the identification process explained by hospital staff.",
    ],
    [
      "Department or Clinical Assessment",
      "Staff can advise on the appropriate next step.",
    ],
    [
      "Consultation or Requested Service",
      "Discuss your visit with the relevant care professional.",
    ],
    ["Next Steps", "Ask about any instructions and follow-up guidance."],
  ]
  const faqs = [
    [
      "How do I request an appointment?",
      "Book an Appointment opens the planned-care demo. It currently records preferences only in memory, does not send a request, and cannot confirm a visit.",
      "Open appointment demo",
      book,
    ],
    [
      "How can I find the right department?",
      "Browse Departments & Services to explore care information. Department examples and service availability await hospital verification.",
      "Explore departments",
      () => go("departments"),
    ],
    [
      "How do I access laboratory results?",
      guidance.results ||
        "Online results are not available. The hospital’s approved access process is awaiting verification. Do not upload results or medical records to the public inquiry form.",
      "Contact information",
      contact,
    ],
    [
      "How can I contact the hospital?",
      "Visit Contact for location and emergency guidance. Official telephone and email details await verification, and online inquiry delivery is not connected.",
      "Contact the hospital",
      contact,
    ],
    [
      "How do I access the patient portal?",
      "The patient portal is Coming Soon. There is no live login or account registration on this public website. Patient information should only be accessed through approved, authenticated services.",
      "Portal availability",
      portal,
    ],
    [
      "What should I do if I need urgent medical care?",
      "Seek appropriate emergency care immediately. Do not wait for an appointment request, public inquiry, or website response.",
      "Emergency information",
      () => open("Emergency information"),
    ],
  ] as const
  return (
    <div className="ps-page">
      <section className="ps-hero">
        <div className="wide ps-hero-grid">
          <div className="ps-hero-copy">
            <div className="ps-breadcrumb">
              <button onClick={home}>Home</button>
              <span>/</span>Patient Services
            </div>
            <div className="eyebrow">
              <span className="tiny-line" /> PATIENT SERVICES
            </div>
            <h1>
              Your Care Journey,
              <br />
              <span>Made Clearer.</span>
            </h1>
            <p>
              Find the information and services you need to prepare for your
              visit, request an appointment, and understand your next steps.
            </p>
            <div className="ps-actions">
              <Action onClick={book}>Book an Appointment</Action>
              <Action onClick={portal} secondary>
                Access Patient Portal
              </Action>
            </div>
            <div className="ps-hero-note">
              <Icon name="info" size={16} />
              <span>Appointments: demo only · Patient portal: Coming Soon</span>
            </div>
          </div>
          <div className="ps-hero-image">
            {!imageFailed ? (
              <img
                src="/images/patient-services-consultation.jpg"
                alt="Illustrative photograph of a healthcare professional speaking with a visitor; not Oda Roba Hospital."
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="ps-photo-fallback">
                <Icon name="heart" size={40} />
                <p>Illustrative healthcare photograph unavailable.</p>
              </div>
            )}
            <span className="ps-photo-label">
              Illustrative photography · Not Oda Roba Hospital
            </span>
            <div className="ps-photo-credit">
              Photo: Francisco Venâncio / Unsplash
            </div>
          </div>
        </div>
      </section>
      <section className="wide section ps-hub" aria-labelledby="ps-hub-title">
        <div className="section-head">
          <div>
            <div className="eyebrow">A SIMPLE PLACE TO START</div>
            <h2 id="ps-hub-title">What Do You Need Today?</h2>
          </div>
          <p>Clear information. A more confident next step.</p>
        </div>
        <div className="ps-hub-grid">
          {hub.map((item) => (
            <button className="ps-hub-card" key={item.title} onClick={item.run}>
              <span className="ps-card-top">
                <span className="service-icon">
                  <Icon name={item.icon} size={25} />
                </span>
                <Status>{item.status}</Status>
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="card-link">
                {item.action}
                <Icon name="arrow" size={17} />
              </span>
            </button>
          ))}
        </div>
        <p className="ps-inline-note">
          <Icon name="info" size={16} /> This hub shares public information
          only. Live booking, patient accounts, online results, and online
          payments are not available.
        </p>
      </section>
      <section className="ps-tinted" id="patient-before">
        <div className="wide section">
          <Heading
            label="BEFORE YOUR VISIT"
            title="Feel Prepared Before You Arrive."
            text="A little preparation can help you understand where to begin."
          />
          <div className="ps-before-grid">
            <Information
              icon="calendar"
              title="Appointments"
              text="Explore the planned-care request journey. This demo does not send a request or provide hospital confirmation or instructions."
              action="Book an Appointment"
              onClick={book}
            />
            <Information
              icon="building"
              title="Finding the Right Department"
              text="Browse departments and services before visiting. Examples are clearly labeled while official offerings are being verified."
              action="Explore Departments"
              onClick={() => go("departments")}
            />
            <Information
              icon="edit"
              title="What to Bring"
              text={
                guidance.visitRequirements ||
                "Hospital-approved visit requirements are awaiting verification. This website cannot confirm mandatory documents or identification rules."
              }
              action="View Visit Information"
              onClick={() => open("Visit information")}
            />
            <Information
              icon="directions"
              title="Location and Contact"
              text="Find the hospital’s general location in Bale Robe. Exact address and directions are pending hospital verification."
              action="Get Directions"
              onClick={() => go("directions")}
            />
          </div>
        </div>
      </section>
      <section className="wide section ps-plan" id="patient-appointments">
        <div>
          <Heading
            label="APPOINTMENT SERVICES"
            title="Plan Your Visit."
            text="A clear path for planned care, from choosing a service to understanding your next step."
          />
          <Status>Appointment demo · no live submission</Status>
          <div className="ps-actions">
            <Action onClick={book}>Book an Appointment</Action>
          </div>
          <p className="ps-inline-note">
            <Icon name="info" size={18} /> Submitting a request does not
            necessarily mean the appointment is confirmed.
          </p>
        </div>
        <ol className="ps-steps">
          {[
            [
              "Choose Your Care",
              "Select a relevant department, service, or doctor in the appointment experience.",
            ],
            [
              "Request a Time",
              "Explore date and time preferences. These are not verified available appointment slots.",
            ],
            [
              "Receive Instructions",
              "In a live service, review hospital-confirmed status and instructions. The current demo only simulates a pending request.",
            ],
          ].map(([title, text], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="ps-portal-section" id="patient-portal">
        <div className="wide section ps-portal-grid">
          <div className="ps-portal-copy">
            <div className="eyebrow light">DIGITAL PATIENT SERVICES</div>
            <Status>Coming Soon</Status>
            <h2>
              Your Health Information,
              <br />
              in One Place.
            </h2>
            <p>
              Access patient services through a secure digital experience when
              your account and the relevant features are available.
            </p>
            <p className="ps-portal-disclaimer">
              The portal is not operational. There is no live sign-in, account
              registration, or access to patient records yet.
            </p>
            <div className="ps-actions">
              <Action onClick={portal}>Access Patient Portal</Action>
              <a href="#patient-records" className="ps-light-link">
                Learn About Patient Services
                <Icon name="arrow" size={16} />
              </a>
            </div>
            <div className="ps-privacy">
              <Icon name="shield" size={21} />
              <div>
                <p>
                  Patient-specific information should only be accessed through
                  the hospital's approved, authenticated services.
                </p>
                <button onClick={() => open("Privacy policy")}>
                  Privacy Policy <Icon name="arrow" size={14} />
                </button>
              </div>
            </div>
          </div>
          <div
            className="ps-portal-preview"
            aria-label="Non-interactive patient portal concept. No patient records are displayed."
          >
            <div className="ps-preview-banner">
              <Icon name="info" size={15} /> NON-INTERACTIVE CONCEPT · NO
              PATIENT DATA
            </div>
            <div className="ps-preview-head">
              <span className="brand-symbol">
                <Icon name="cross" size={22} />
              </span>
              <div>
                <strong>Oda Roba Patient Portal</strong>
                <small>A future space for your care</small>
              </div>
              <Icon name="shield" size={22} />
            </div>
            <div className="ps-preview-body">
              <div className="ps-preview-greeting">
                <strong>Your patient services</strong>
                <Status>Coming Soon</Status>
              </div>
              <div className="ps-preview-appointment">
                <Icon name="calendar" size={22} />
                <div>
                  <strong>Upcoming appointments</strong>
                  <p>Appointment details will appear after authentication.</p>
                </div>
                <span className="ps-skeleton" aria-hidden="true" />
              </div>
              <div className="ps-preview-tiles">
                {([
                  ["user", "Patient profile"],
                  ["flask", "Laboratory results"],
                  ["pill", "Prescriptions"],
                  ["clock", "Visit history"],
                ] as const).map(([icon, title]) => (
                  <div key={title}>
                    <Icon name={icon} size={20} />
                    <strong>{title}</strong>
                    <span className="ps-skeleton" aria-hidden="true" />
                    <small>Future authenticated feature</small>
                  </div>
                ))}
              </div>
              <div className="ps-preview-foot">
                <Icon name="shield" size={16} />
                <span>
                  Billing information & notifications · planned features
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="wide section" id="patient-records">
        <Heading
          label="MEDICAL RECORDS & RESULTS"
          title="Stay Informed About Your Care."
          text="Know where to look for approved patient information—without sharing private records here."
        />
        <div className="ps-record-grid">
          <Information
            icon="flask"
            title="Laboratory Results"
            status="Contact the Hospital"
            text={
              guidance.results ||
              "Online results are not available. The hospital’s approved process for accessing results is awaiting verification."
            }
            action="Learn About Results"
            onClick={() => open("Laboratory results information")}
          />
          <Information
            icon="pill"
            title="Prescriptions"
            status="Contact the Hospital"
            text={
              guidance.prescriptions ||
              "Prescription guidance and approved information channels will be published once supplied by the hospital."
            }
            action="Prescription Information"
            onClick={() => open("Prescription information")}
          />
          <Information
            icon="clock"
            title="Visit History"
            status="Coming Soon"
            text="Reviewing previous visits is a planned authenticated portal feature. No patient-specific visit history is available on this public website."
            action="Patient Portal"
            onClick={portal}
          />
        </div>
        <div className="ps-record-privacy">
          <Icon name="shield" size={20} />
          <p>
            Please do not send medical records, prescriptions, or test results
            through the general inquiry form.
          </p>
          <button className="text-link" onClick={() => open("Privacy policy")}>
            Privacy Policy
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </section>
      <section className="ps-tinted" id="patient-during">
        <div className="wide section">
          <Heading
            label="DURING YOUR VISIT"
            title="Know What to Expect."
            text="An illustrative care pathway. Your journey may differ depending on the service and guidance from hospital staff."
          />
          <ol className="ps-journey">
            {journey.map(([title, text], index) => (
              <li key={title}>
                <div className="ps-journey-number">0{index + 1}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                {index < journey.length - 1 && (
                  <span className="ps-journey-arrow">
                    <Icon name="arrow" size={18} />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="ps-guidance-grid">
            {[
              ["Reception guidance", guidance.reception],
              ["Department navigation", guidance.departmentNavigation],
              ["General patient assistance", guidance.assistance],
            ].map(([title, text]) => (
              <div key={title}>
                <Icon name="info" size={18} />
                <div>
                  <strong>{title}</strong>
                  <p>
                    {text ||
                      "Hospital-approved guidance awaiting verification."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wide section">
        <Heading
          label="AFTER YOUR VISIT"
          title="Your Care Continues."
          text="Use the instructions given by your healthcare professional to understand your next steps."
        />
        <div className="ps-record-grid">
          <Information
            icon="calendar"
            title="Follow-up Appointments"
            text="Ask the hospital about follow-up arrangements. You can explore the appointment demo here, but it cannot request or confirm a follow-up visit."
            action="Request an Appointment"
            onClick={book}
          />
          <Information
            icon="pill"
            title="Prescriptions and Medication Information"
            text="Use hospital-approved pharmacy and prescription channels. Official processes and service availability are awaiting verification."
            action="Explore Pharmacy Services"
            onClick={() => go("pharmacy")}
          />
          <Information
            icon="edit"
            title="Results and Further Instructions"
            text="Follow the instructions provided by your healthcare professional. This public website does not provide personal diagnosis or treatment advice."
            action="Patient Services"
            onClick={() => go("results")}
          />
        </div>
      </section>
      <section className="ps-billing-section" id="patient-billing">
        <div className="wide section ps-billing-grid">
          <div>
            <Heading
              label="BILLING & PAYMENT INFORMATION"
              title="Understand Your Visit Information."
              text="Hospital-approved information will help you understand billing, payment, and invoice questions."
            />
            <Status>Contact the Hospital</Status>
            <div className="ps-actions">
              <Action onClick={() => open("Billing information")} secondary>
                Billing Information
              </Action>
            </div>
            <p className="ps-inline-note">
              <Icon name="info" size={16} /> Online payments are not available.
              No prices, payment methods, or insurance policies are confirmed
              here.
            </p>
          </div>
          <dl className="ps-billing-list">
            {[
              ["Billing inquiries", guidance.billing],
              ["Payment information", guidance.payment],
              ["Invoice questions", guidance.invoices],
              ["Billing support contact", guidance.billingSupport],
            ].map(([title, text]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{text || "Official information pending verification."}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="wide section ps-faq-section" id="patient-support">
        <Heading
          label="PATIENT SUPPORT"
          title="How Can We Help?"
          text="Straightforward answers to common patient service questions."
        />
        <div className="ps-faq">
          {faqs.map(([question, answer, action, run]) => (
            <details key={question}>
              <summary>
                {question}
                <Icon name="chevron" size={18} />
              </summary>
              <div>
                <p>{answer}</p>
                <button className="text-link" onClick={run}>
                  {action}
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section className="wide ps-emergency">
        <span className="emergency-icon">
          <Icon name="cross" size={24} />
        </span>
        <div>
          <h2>Need Urgent Medical Care?</h2>
          <p>
            Do not wait for a website response if you need urgent medical
            attention. Use the appropriate emergency care pathway.
          </p>
          <small>
            Official emergency telephone: pending hospital verification.
          </small>
        </div>
        <Action onClick={() => open("Emergency information")} secondary>
          Emergency Information
        </Action>
      </section>
      <section className="ps-final">
        <div className="wide">
          <div>
            <div className="eyebrow">YOUR NEXT STEP</div>
            <h2>Ready for Your Next Step?</h2>
            <p>
              Find a service, request an appointment, or contact the hospital
              for further information.
            </p>
          </div>
          <div className="ps-actions">
            <Action onClick={book}>Book an Appointment</Action>
            <Action onClick={contact} secondary>
              Contact the Hospital
            </Action>
          </div>
        </div>
      </section>
    </div>
  )
}
