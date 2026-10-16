import Icon, { type IconName } from "./Icon"

type HomeProps = {
  open: (title: string) => void
  go: (id: string) => void
}
const carePhoto = "/images/patient-care.jpg"
type Service = {
  icon: IconName
  title: string
  description: string
}
type CareItem = {
  icon: IconName
  title: string
  text: string
}
const services: Service[] = [
  {
    icon: "user",
    title: "Outpatient care",
    description:
      "Consultations, assessment, and support for your ongoing health.",
  },
  {
    icon: "cross",
    title: "Emergency care",
    description:
      "A clear starting point when you need urgent medical attention.",
  },
  {
    icon: "flask",
    title: "Laboratory services",
    description:
      "Diagnostic testing to help guide the next steps in your care.",
  },
  {
    icon: "pill",
    title: "Pharmacy",
    description: "Information and guidance about medicines and prescriptions.",
  },
  {
    icon: "scan",
    title: "Radiology & imaging",
    description: "Diagnostic imaging to support assessment and treatment.",
  },
  {
    icon: "building",
    title: "Inpatient care",
    description: "An introduction to care and support during a hospital stay.",
  },
]
const departments: CareItem[] = [
  {
    icon: "user",
    title: "General medicine",
    text: "Assessment and ongoing medical care.",
  },
  {
    icon: "baby",
    title: "Maternal & child health",
    text: "Care for mothers, children, and families.",
  },
  {
    icon: "cross",
    title: "Emergency",
    text: "Guidance for urgent healthcare needs.",
  },
  {
    icon: "shield",
    title: "Surgery",
    text: "Information about surgical care.",
  },
  {
    icon: "flask",
    title: "Laboratory",
    text: "Testing and diagnostic information.",
  },
  {
    icon: "scan",
    title: "Radiology",
    text: "Information about medical imaging.",
  },
]
function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text?: string
}) {
  return (
    <div className="section-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}
function PendingNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="content-note">
      <Icon name="shield" size={14} />
      {children}
    </p>
  )
}
type FacilityProps = {
  name: string
  icon: IconName
}
function FacilityPlaceholder({ name, icon }: FacilityProps) {
  return (
    <div className={`facility-placeholder facility-${icon}`}>
      <div className="room-geometry" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="facility-caption">
        <Icon name={icon} size={19} />
        <span>
          <strong>{name}</strong>
          <small>Verified hospital photograph to be added</small>
        </span>
      </span>
      <span className="facility-tag">PHOTO PLACEHOLDER</span>
    </div>
  )
}
export default function Home({ open, go }: HomeProps) {
  return (
    <>
      <section className="hero homepage-hero">
        <div className="wide hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-line" /> ODA ROBA HOSPITAL · BALE ROBE,
              ETHIOPIA
            </div>
            <h1>
              Compassionate care.
              <br />
              <span>Trusted healthcare.</span>
            </h1>
            <p>
              Providing accessible, patient-centered healthcare for the Bale
              Robe community and surrounding areas.
            </p>
            <div className="hero-buttons">
              <button
                className="button"
                onClick={() => open("Request an appointment")}
              >
                <Icon name="calendar" size={17} />
                Book an appointment
              </button>
              <button
                className="button secondary"
                onClick={() => open("Patient portal")}
              >
                <Icon name="user" size={17} />
                Patient Portal
              </button>
              <button
                className="button secondary"
                onClick={() => open("Staff sign in")}
              >
                <Icon name="shield" size={17} />
                Staff Sign In
              </button>
            </div>
            <div className="hero-bottom">
              <span className="hero-location">
                <Icon name="pin" size={17} />
                Bale Robe, Oromia, Ethiopia
              </span>
              <button
                className="emergency-link"
                onClick={() => open("Emergency information")}
              >
                <Icon name="phone" size={15} />
                Need urgent help?
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img
              src={carePhoto}
              fetchPriority="high"
              alt="Healthcare professional with a patient"
            />
            <div className="care-note">
              <span>
                <Icon name="heart" size={25} />
              </span>
              <div>
                <strong>People at the heart of care.</strong>
                <small>Listening. Understanding. Caring.</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="homepage-trust wide" aria-label="Our care principles">
        {([
          {
            icon: "heart",
            title: "Patient-centered care",
            text: "Your needs come first.",
          },
          {
            icon: "shield",
            title: "Professional care",
            text: "Respect at every step.",
          },
          {
            icon: "pin",
            title: "Connected to our community",
            text: "Rooted in Bale Robe.",
          },
          {
            icon: "user",
            title: "Clear communication",
            text: "A more reassuring care journey.",
          },
        ] as CareItem[]).map((item) => (
          <div key={item.title}>
            <span className="trust-icon">
              <Icon name={item.icon} size={25} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="section services-section" id="services">
        <div className="wide">
          <SectionHeading
            eyebrow="HERE FOR YOUR HEALTH"
            title="Healthcare services designed around you."
            text="Find a starting point for the care you need, at every stage of life."
          />
          <div className="service-grid">
            {services.map((service) => (
              <button
                className="service-card"
                key={service.title}
                onClick={() => open(service.title)}
              >
                <span className="service-icon">
                  <Icon name={service.icon} size={25} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="card-link">
                  Learn more
                  <Icon name="arrow" size={17} />
                </span>
              </button>
            ))}
          </div>
          <div className="section-bottom">
            <PendingNote>
              Illustrative services. Availability awaits hospital verification.
            </PendingNote>
            <button className="text-link" onClick={() => open("All services")}>
              View all services
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </section>
      <section className="section wide homepage-departments" id="departments">
        <SectionHeading
          eyebrow="A CLEAR PATH TO CARE"
          title="Find the right care."
          text="Explore our departments and find the services that match your healthcare needs."
        />
        <div className="department-grid">
          {departments.map((department) => (
            <button
              className="department-card"
              key={department.title}
              onClick={() => open(department.title)}
            >
              <span className="department-icon">
                <Icon name={department.icon} size={24} />
              </span>
              <div>
                <h3>{department.title}</h3>
                <p>{department.text}</p>
                <span className="card-link">
                  View department
                  <Icon name="arrow" size={15} />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="section-bottom">
          <PendingNote>
            Department examples, not a confirmed hospital directory.
          </PendingNote>
          <button className="text-link" onClick={() => open("All departments")}>
            Explore all departments
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
      <section className="why-section" id="about">
        <div className="wide why-layout">
          <div>
            <div className="eyebrow">WHY ODA ROBA</div>
            <h2>
              Care built
              <br />
              around people.
            </h2>
            <p>
              Healthcare is personal. Our public experience starts with the
              things that matter most: being heard, feeling respected, and
              knowing what comes next.
            </p>
            <button
              className="text-link"
              onClick={() => open("About Oda Roba")}
            >
              Get to know our hospital
              <Icon name="arrow" size={18} />
            </button>
            <div className="community-note">
              <Icon name="pin" size={21} />
              <span>
                Bale Robe, Oromia
                <br />
                <strong>Our community. Our purpose.</strong>
              </span>
            </div>
          </div>
          <div className="values-grid">
            {([
              {
                icon: "heart",
                title: "Patient first",
                text: "Care begins with listening. Every person deserves dignity, understanding, and a voice in their care.",
              },
              {
                icon: "user",
                title: "Clear communication",
                text: "Understand your next steps with information that is simple, helpful, and easy to find.",
              },
              {
                icon: "shield",
                title: "Professional care",
                text: "A thoughtful approach to information, privacy, and the decisions that affect your health.",
              },
              {
                icon: "pin",
                title: "Community focus",
                text: "A hospital experience connected to the needs of Bale Robe and the people who call it home.",
              },
            ] as CareItem[]).map((value) => (
              <article key={value.title}>
                <Icon name={value.icon} size={27} />
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section wide" id="doctors">
        <SectionHeading
          eyebrow="THE PEOPLE BEHIND YOUR CARE"
          title="Meet our care team."
          text="Get to know the professionals who will support your healthcare journey."
        />
        <div className="doctor-grid">
          {[1, 2, 3].map((n) => (
            <article className="doctor-card" key={n}>
              <div className="doctor-placeholder">
                <span className="portrait-frame">
                  <Icon name="user" size={64} />
                </span>
                <span>Verified staff photograph</span>
              </div>
              <div className="doctor-info">
                <span className="example-label">
                  PROFILE AWAITING VERIFICATION
                </span>
                <h3>Dr. [Name]</h3>
                <p>
                  [Specialty] <span className="specialty-divider">/</span>{" "}
                  [Department]
                </p>
                <button
                  className="text-link"
                  onClick={() => open("Doctor profile")}
                >
                  View profile
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="section-bottom">
          <PendingNote>
            Official names, credentials, and photographs will be added after
            verification.
          </PendingNote>
          <button className="text-link" onClick={() => open("Find a doctor")}>
            Meet our doctors
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
      <section className="patient-section" id="patients">
        <div className="wide">
          <div className="patient-section-head">
            <SectionHeading
              eyebrow="YOUR NEXT STEP, MADE CLEAR"
              title="Your care, beyond your visit."
              text="Helpful information now. Secure online services when the hospital is ready."
            />
            <span className="public-info-label">
              <Icon name="shield" size={15} />
              Private records require secure access
            </span>
          </div>
          <div className="patient-capabilities">
            {([
              {
                icon: "calendar",
                title: "Request an appointment",
                text: "Preview a simple request journey and understand the next steps.",
                status: "Preview available",
                action: "Explore the request process",
                modal: "Request an appointment",
              },
              {
                icon: "shield",
                title: "Access patient portal",
                text: "A future secure space for your hospital information.",
                status: "Coming soon",
                action: "About secure access",
                modal: "Patient portal",
              },
              {
                icon: "flask",
                title: "View laboratory results",
                text: "Private results will require a verified portal connection.",
                status: "Coming soon",
                action: "Learn about this service",
                modal: "Patient portal",
              },
              {
                icon: "heart",
                title: "Manage follow-up care",
                text: "Future support for keeping track of your care journey.",
                status: "Coming soon",
                action: "Learn about follow-up care",
                modal: "Follow-up care",
              },
            ] as {
              icon: IconName
              title: string
              text: string
              status: string
              action: string
              modal: string
            }[]).map((item) => (
              <article className="patient-capability" key={item.title}>
                <div className="capability-top">
                  <Icon name={item.icon} size={24} />
                  <span
                    className={
                      item.status === "Coming soon"
                        ? "capability-status"
                        : "capability-status preview"
                    }
                  >
                    {item.status}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button className="text-link" onClick={() => open(item.modal)}>
                  {item.action}
                  <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section wide facilities-section" id="facilities">
        <div className="facilities-intro">
          <SectionHeading
            eyebrow="THE HOSPITAL EXPERIENCE"
            title="A place designed for better care."
            text="A welcoming environment is part of a reassuring care journey. This space will introduce the hospital through verified, locally captured photography."
          />
          <button
            className="text-link"
            onClick={() => open("Hospital facilities")}
          >
            Explore our environment
            <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="facilities-editorial">
          <div className="facility-primary">
            <FacilityPlaceholder name="Hospital & reception" icon="building" />
          </div>
          <div className="facility-support">
            <FacilityPlaceholder name="Patient waiting area" icon="heart" />
            <FacilityPlaceholder name="Clinical care spaces" icon="cross" />
          </div>
        </div>
        <PendingNote>
          Visual placeholders only. Actual facilities, accessibility, and
          equipment await confirmation.
        </PendingNote>
      </section>
      <section
        className="wide appointment-section homepage-appointment"
        id="appointments"
      >
        <div className="appointment-inner">
          <div>
            <div className="eyebrow light">LET’S TAKE THE NEXT STEP</div>
            <h2>
              Ready to take
              <br />
              the next step?
            </h2>
            <p>
              Request an appointment and connect with the appropriate healthcare
              service.
            </p>
            <div className="appointment-actions">
              <button
                className="button white"
                onClick={() => open("Request an appointment")}
              >
                Request an appointment
                <Icon name="arrow" size={18} />
              </button>
              <button
                className="text-link light-link"
                onClick={() => open("Find a doctor")}
              >
                Find a doctor
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
          <div className="appointment-steps">
            {[
              ["01", "Choose your care", "Select a service or department."],
              [
                "02",
                "Choose your preference",
                "Tell us your preferred date and doctor, if applicable.",
              ],
              [
                "03",
                "Request confirmation",
                "The hospital team confirms availability and next steps.",
              ],
            ].map(([n, title, text]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
            <div className="appointment-footnote">
              Request flow preview only. Online submissions are not connected.
            </div>
          </div>
        </div>
      </section>
      <section
        className="emergency-section wide homepage-emergency"
        id="emergency"
      >
        <span className="emergency-icon">
          <Icon name="phone" size={26} />
        </span>
        <div>
          <div className="emergency-eyebrow">URGENT CARE INFORMATION</div>
          <h3>Need urgent medical care?</h3>
          <p>
            If you are experiencing a medical emergency, seek immediate
            emergency care. Do not wait for an online response.
          </p>
          <span className="emergency-number">
            [Official Emergency Number] <small>Pending verification</small>
          </span>
          <span className="emergency-department">
            [Official Emergency Department Information]
          </span>
        </div>
        <div className="emergency-actions">
          <button
            className="button emergency-button"
            onClick={() => open("Emergency information")}
          >
            Emergency information
            <Icon name="arrow" size={17} />
          </button>
          <button
            className="text-link"
            onClick={() => open("Contact the hospital")}
          >
            Contact hospital
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </section>
      <section className="section news-section" id="resources">
        <div className="wide">
          <div className="section-head">
            <SectionHeading
              eyebrow="INFORMED & CONNECTED"
              title="Latest from Oda Roba."
              text="Hospital updates and helpful information, in one place."
            />
            <button
              className="text-link"
              onClick={() => open("News & announcements")}
            >
              All news & resources
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="news-grid">
            {([
              {
                category: "HOSPITAL NEWS",
                title: "[Hospital update title]",
                text: "A space for verified news about Oda Roba Hospital.",
                icon: "building",
              },
              {
                category: "HEALTH EDUCATION",
                title: "[Health information title]",
                text: "Reviewed, accessible health information will be published here.",
                icon: "heart",
              },
              {
                category: "ANNOUNCEMENTS",
                title: "[Official announcement title]",
                text: "Important notices from the hospital, once approved.",
                icon: "calendar",
              },
            ] as {
              category: string
              title: string
              text: string
              icon: IconName
            }[]).map((item) => (
              <article className="news-card" key={item.category}>
                <div className={`news-visual news-visual-${item.icon}`}>
                  <Icon name={item.icon} size={39} />
                  <span>EDITORIAL IMAGE PLACEHOLDER</span>
                </div>
                <div className="news-content">
                  <div className="news-meta">
                    <span>{item.category}</span>
                    <small>[Publication date]</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <button
                    className="card-link"
                    onClick={() => open(item.title)}
                  >
                    Read article
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <PendingNote>
            Content placeholders. No hospital announcements or medical advice
            are being published.
          </PendingNote>
        </div>
      </section>
      <section className="section wide contact-section" id="contact">
        <div className="contact-copy">
          <div className="eyebrow">CLOSE TO HOME</div>
          <h2>Find us in Bale Robe.</h2>
          <p className="contact-intro">
            Oda Roba Hospital
            <br />
            <strong>Bale Robe, Oromia, Ethiopia</strong>
          </p>
          <div className="contact-details">
            <div>
              <Icon name="pin" size={18} />
              <span>
                <small>LOCATION</small>[Official street address]
              </span>
            </div>
            <div>
              <Icon name="phone" size={18} />
              <span>
                <small>PHONE</small>[Official hospital number]
              </span>
            </div>
            <div>
              <Icon name="user" size={18} />
              <span>
                <small>EMAIL</small>[Official contact email]
              </span>
            </div>
            <div>
              <Icon name="calendar" size={18} />
              <span>
                <small>OPENING HOURS</small>[Official service hours]
              </span>
            </div>
          </div>
          <div className="contact-actions">
            <button className="button" onClick={() => open("Get directions")}>
              <Icon name="pin" size={16} />
              Get directions
              <Icon name="arrow" size={16} />
            </button>
            <button
              className="button secondary"
              onClick={() => open("Contact the hospital")}
            >
              Contact us
              <Icon name="arrow" size={16} />
            </button>
          </div>
          <p className="content-note">
            Address, contacts, hours, and map pin await hospital verification.
          </p>
        </div>
        <div
          className="location-visual"
          role="img"
          aria-label="Location visual placeholder for Bale Robe, Oromia, Ethiopia; not an actual map"
        >
          <div className="map-grid" aria-hidden="true" />
          <span className="map-label">LOCATION VISUAL · MAP PIN PENDING</span>
          <div className="map-marker">
            <Icon name="cross" size={28} />
          </div>
          <div className="map-place">
            <strong>Oda Roba Hospital</strong>
            <span>Bale Robe, Oromia, Ethiopia</span>
          </div>
          <span className="map-disclaimer">
            Illustrative location graphic · not for navigation
          </span>
        </div>
      </section>
    </>
  )
}
