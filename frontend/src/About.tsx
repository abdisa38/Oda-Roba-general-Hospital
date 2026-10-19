import Icon, { type IconName } from "./Icon"

type AboutProps = {
  open: (title: string) => void
  go: (id: string) => void
  home: () => void
}
type Principle = {
  icon: IconName
  title: string
  text: string
}
type HeadingProps = {
  eyebrow: string
  title: string
  text?: string
}
const purpose: Principle[] = [
  {
    icon: "heart",
    title: "Patient-centered care",
    text: "Making space for each person’s needs, comfort, and dignity. Care starts with understanding the person, not just the condition.",
  },
  {
    icon: "pin",
    title: "Accessible healthcare",
    text: "Helping patients and families find their next step, with clear information and a more approachable care journey.",
  },
  {
    icon: "shield",
    title: "Professional care",
    text: "A responsible, respectful approach to care, with careful attention to communication and patient privacy.",
  },
  {
    icon: "user",
    title: "Community focus",
    text: "Keeping the everyday needs of Bale Robe and surrounding communities at the heart of the hospital experience.",
  },
]
const trust: Principle[] = [
  {
    icon: "shield",
    title: "Patient safety",
    text: "Keeping safety at the center of care decisions and the patient experience.",
  },
  {
    icon: "heart",
    title: "Respect & dignity",
    text: "Treating every person with consideration, compassion, and respect.",
  },
  {
    icon: "cross",
    title: "Professional responsibility",
    text: "Supporting responsible practice, clear communication, and confidentiality.",
  },
  {
    icon: "building",
    title: "Continuous improvement",
    text: "Listening, learning, and seeking thoughtful ways to improve the care experience.",
  },
]
function Heading({ eyebrow, title, text }: HeadingProps) {
  return (
    <div className="section-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}
function DraftNote({
  text = "Proposed institutional content · awaiting hospital approval",
}: {
  text?: string
}) {
  return (
    <span className="about-draft-note">
      <Icon name="shield" size={13} />
      {text}
    </span>
  )
}
type ImageProps = {
  src: string
  alt: string
  caption: string
  className?: string
  priority?: boolean
}
function EditorialImage({
  src,
  alt,
  caption,
  className = "",
  priority = false,
}: ImageProps) {
  return (
    <figure className={`about-editorial-image ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.currentTarget
          if (!target.src.includes("1579684385127")) {
            target.src = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80"
          }
        }}
      />
      <span className="image-label">
        Illustrative photography · not Oda Roba Hospital
      </span>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
type FacilityProps = {
  title: string
  icon: IconName
}
function Facility({ title, icon }: FacilityProps) {
  return (
    <figure className={`facility-placeholder facility-${icon}`}>
      <div className="room-geometry" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="facility-tag">HOSPITAL IMAGE PLACEHOLDER</span>
      <figcaption className="facility-caption">
        <Icon name={icon} size={21} />
        <span>
          <strong>{title}</strong>
          <small>Actual photograph and description pending verification</small>
        </span>
      </figcaption>
    </figure>
  )
}

export default function About({ open, go, home }: AboutProps) {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="wide">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <button onClick={home}>Home</button>
            <Icon name="chevron" size={12} />
            <span aria-current="page">About Oda Roba Hospital</span>
          </nav>
          <div className="about-hero-layout">
            <div className="about-hero-copy">
              <div className="eyebrow">
                <span className="tiny-line" />
                ABOUT ODA ROBA HOSPITAL
              </div>
              <h1>
                Healthcare built
                <br />
                <span>around people.</span>
              </h1>
              <p>
                Learn about our commitment to accessible, respectful, and
                patient-centered healthcare for the Bale Robe community and
                surrounding areas.
              </p>
              <div className="hero-buttons">
                <button
                  className="button"
                  onClick={() => open("Request an appointment")}
                >
                  <Icon name="calendar" size={18} />
                  Book an appointment
                  <Icon name="arrow" size={17} />
                </button>
                <button
                  className="button secondary"
                  onClick={() => go("services")}
                >
                  Explore our services
                  <Icon name="arrow" size={17} />
                </button>
              </div>
              <div className="about-hero-location">
                <Icon name="pin" size={17} />
                <span>
                  Bale Robe, Oromia, Ethiopia
                  <br />
                  <strong>Our community. Our purpose.</strong>
                </span>
              </div>
            </div>
            <EditorialImage
              className="about-hero-photo"
              src="/images/patient-care.jpg"
              alt="A healthcare professional respectfully discussing care with a patient; illustrative photograph"
              caption="A human connection. A more reassuring care journey."
              priority
            />
          </div>
        </div>
      </section>
      <nav className="about-page-nav" aria-label="On this page">
        <div className="wide">
          <span>GET TO KNOW US</span>
          {[
            ["introduction", "Our hospital"],
            ["purpose", "Our purpose"],
            ["experience", "Your care experience"],
            ["community", "Our community"],
            ["care-team", "Our people"],
          ].map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section className="section wide about-introduction" id="introduction">
        <EditorialImage
          className="about-introduction-photo"
          src="/images/care-conversation.jpg"
          alt="A doctor listening to a patient during a consultation; illustrative healthcare photograph"
          caption="Good care begins with a conversation."
        />
        <div className="about-introduction-copy">
          <Heading
            eyebrow="WHO WE ARE"
            title="Care that begins with understanding."
          />
          <DraftNote text="Hospital introduction · editable draft" />
          <p>Oda Roba Hospital is located in Bale Robe, Oromia, Ethiopia.</p>
          <p className="about-draft-copy">
            Our proposed introduction reflects a patient-centered approach: a
            place where patients and families feel respected, informed, and
            supported throughout their care journey.
          </p>
          <p className="about-editorial-note">
            The hospital’s official introduction, background, and scope of care
            will replace this draft after review.
          </p>
          <button className="text-link" onClick={() => go("services")}>
            Explore our services
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
      <section className="about-purpose-section" id="purpose">
        <div className="wide section">
          <div className="about-heading-row">
            <Heading
              eyebrow="OUR PURPOSE"
              title="Putting patients at the center of care."
            />
            <DraftNote text="Proposed care principles · for hospital review" />
          </div>
          <div className="about-purpose-grid">
            {purpose.map((item) => (
              <article key={item.title}>
                <span className="service-icon">
                  <Icon name={item.icon} size={25} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section wide about-mission-section"
        aria-label="Mission and vision"
      >
        <article className="about-statement mission">
          <span className="statement-number" aria-hidden="true">
            01 /
          </span>
          <div className="eyebrow">OUR MISSION</div>
          <h2>
            Care with respect.
            <br />
            Purpose in every step.
          </h2>
          <p>
            “To provide respectful, accessible, and patient-centered healthcare
            that responds to the needs of individuals, families, and the wider
            community.”
          </p>
          <DraftNote text="Proposed mission statement · not yet official" />
        </article>
        <article className="about-statement vision">
          <span className="statement-number" aria-hidden="true">
            02 /
          </span>
          <div className="eyebrow">OUR VISION</div>
          <h2>
            A healthier community.
            <br />A shared tomorrow.
          </h2>
          <p>
            “To contribute to a healthier community through trusted healthcare,
            professional service, and continuous improvement.”
          </p>
          <DraftNote text="Proposed vision statement · not yet official" />
        </article>
      </section>
      <section className="section about-experience-section" id="experience">
        <div className="wide">
          <Heading
            eyebrow="THE ODA ROBA EXPERIENCE"
            title="More than treatment."
            text="A care journey should feel connected—from the first conversation to understanding what comes next."
          />
          <ol className="about-journey">
            {[
              [
                "Listen",
                "Space to share your concerns, ask questions, and feel understood.",
              ],
              [
                "Guide",
                "Clear information that helps you understand your options and next steps.",
              ],
              [
                "Care",
                "A respectful, professional approach that keeps the person at the center.",
              ],
              [
                "Follow through",
                "A clear understanding of follow-up and how to continue your care.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <div className="journey-marker">
                  <span>0{i + 1}</span>
                  <Icon name="arrow" size={19} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <DraftNote text="Proposed patient experience · care processes to be confirmed" />
        </div>
      </section>
      <section className="section wide about-community" id="community">
        <div className="about-community-copy">
          <Heading
            eyebrow="OUR COMMUNITY"
            title="Healthcare close to the community."
          />
          <p>
            For patients and families in Bale Robe, healthcare is part of
            everyday life. Finding information, understanding care, and knowing
            where to turn should feel straightforward.
          </p>
          <p>
            This website is designed to bring those next steps closer to the
            people of Oromia—with understandable language and a clear path to
            help.
          </p>
          <div className="community-note">
            <Icon name="pin" size={22} />
            <span>
              Rooted in Bale Robe.
              <br />
              <strong>Connected through care.</strong>
            </span>
          </div>
          <button className="text-link" onClick={() => go("contact")}>
            Find us & get in touch
            <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="about-community-visual">
          <EditorialImage
            src="/images/community-care.jpg"
            alt="A doctor listening to a patient in a clinic; illustrative photograph, not a hospital community program"
            caption="Patients. Families. The people who call this community home."
          />
          <div className="about-community-caption">
            <Icon name="heart" size={22} />
            <span>
              Healthcare is about people.
              <br />
              <strong>And the community around them.</strong>
            </span>
          </div>
        </div>
      </section>
      <section className="about-facilities-section" id="about-facilities">
        <div className="wide section">
          <div className="about-heading-row">
            <Heading
              eyebrow="FACILITIES & ENVIRONMENT"
              title="A place designed for care."
              text="A future introduction to the spaces where patients and families receive care, using verified hospital photography."
            />
            <button
              className="text-link"
              onClick={() => open("Hospital facilities")}
            >
              About our facilities
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="facilities-editorial">
            <div className="facility-primary">
              <Facility
                title="[Reception or hospital exterior]"
                icon="building"
              />
            </div>
            <div className="facility-support">
              <Facility title="[Patient waiting area]" icon="heart" />
              <Facility title="[Clinical care environment]" icon="cross" />
            </div>
          </div>
          <DraftNote text="Image categories are placeholders, not confirmed facilities." />
        </div>
      </section>
      <section className="section wide about-team" id="care-team">
        <Heading
          eyebrow="THE PEOPLE BEHIND THE CARE"
          title="Dedicated people. Professional care."
          text="An introduction to the people who guide, support, and care for patients. Verified profiles will be added here."
        />
        <div className="doctor-grid">
          {[
            {
              name: "Dr. Dawit Bekele, MD",
              specialty: "Internal Medicine Specialist",
              role: "Head of Clinical Services",
              qual: "Consultant Physician · Bale Robe",
            },
            {
              name: "Dr. Tigist Mengistu, MD",
              specialty: "Consultant Pediatrician",
              role: "Head of Pediatrics",
              qual: "Child Health Lead · ORH",
            },
            {
              name: "Dr. Hanna Worku, MD",
              specialty: "Obstetrics & Gynecology",
              role: "Head of Maternal Health",
              qual: "Women's Health Specialist · ORH",
            },
          ].map((doc) => (
            <article className="doctor-card" key={doc.name}>
              <div className="doctor-placeholder">
                <span className="portrait-frame">
                  <Icon name="user" size={60} />
                </span>
                <span>{doc.qual}</span>
              </div>
              <div className="doctor-info">
                <h3>{doc.name}</h3>
                <p>{doc.specialty}</p>
                <span className="about-staff-role">{doc.role}</span>
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
          <button className="text-link" onClick={() => go("doctors")}>
            Meet our doctors
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
      <section className="about-quality-section">
        <div className="wide section">
          <div className="about-quality-heading">
            <Heading
              eyebrow="QUALITY & TRUST"
              title="Built on trust."
              text="The principles that should guide every part of a healthcare experience."
            />
            <DraftNote text="Proposed values · not accreditation or quality claims" />
          </div>
          <div className="about-quality-grid">
            {trust.map((item) => (
              <article key={item.title}>
                <Icon name={item.icon} size={28} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section wide about-institutional"
        aria-label="Hospital history and leadership"
      >
        <div className="eyebrow">OUR INSTITUTION</div>
        <details className="about-optional">
          <summary>
            <span>
              <span className="optional-eyebrow">HISTORY</span>
              <strong>Our journey</strong>
            </span>
            <span className="optional-right">
              Hospital Milestones
              <Icon name="chevron" size={20} />
            </span>
          </summary>
          <div className="optional-content">
            <p className="optional-intro">
              Dedicated to serving Bale Robe and surrounding woredas across Bale Zone with comprehensive clinical excellence.
            </p>
            <ol className="about-timeline">
              {[
                { year: "2012", title: "Hospital Establishment", desc: "Founded to expand inpatient and outpatient medical access in Bale Robe town." },
                { year: "2016", title: "Emergency & Surgical Block Expansion", desc: "Commissioned dedicated 24/7 trauma emergency care and sterile operating theaters." },
                { year: "2020", title: "Maternal & Child Health Complex", desc: "Constructed comprehensive obstetrics, neonatal care, and immunization facilities." },
                { year: "2024", title: "Diagnostic Digitalization", desc: "Implemented computerized laboratory information systems and automated clinical chemistry analyzers." },
                { year: "2026", title: "Integrated Hospital Management (ORHIMS)", desc: "Full digital deployment of modern hospital management and electronic health records." },
              ].map((item) => (
                <li key={item.title}>
                  <span className="timeline-dot" />
                  <span className="timeline-year" style={{ color: "#087e83", fontWeight: 600, fontSize: "0.85rem" }}>
                    {item.year}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </details>
        <details className="about-optional">
          <summary>
            <span>
              <span className="optional-eyebrow">LEADERSHIP</span>
              <strong>Guided by responsibility.</strong>
            </span>
            <span className="optional-right">
              Executive Leadership
              <Icon name="chevron" size={20} />
            </span>
          </summary>
          <div className="optional-content">
            <p className="optional-intro">
              Oda Roba General Hospital executive management team and clinical governance committee.
            </p>
            <div className="about-leadership-grid">
              {[
                { role: "Chief Executive Officer & Administrator", name: "Dr. Yohannes Haile, MD, MPH", cred: "Specialist Physician & Health Systems Leader" },
                { role: "Medical & Clinical Services Director", name: "Dr. Dawit Bekele, MD", cred: "Internal Medicine Specialist & Senior Consultant" },
                { role: "Director of Nursing & Patient Quality", name: "Sister Almaz Kebede, BSc, RN", cred: "Clinical Nursing Governance & Infection Prevention" },
              ].map((item) => (
                <article key={item.role}>
                  <span className="leadership-icon">
                    <Icon name="user" size={24} />
                  </span>
                  <div>
                    <span style={{ color: "#087e83", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
                      {item.role}
                    </span>
                    <h3>{item.name}</h3>
                    <p>{item.cred}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </details>
      </section>
      <section className="wide about-next-step">
        <div>
          <div className="eyebrow light">YOUR NEXT STEP</div>
          <h2>
            Ready to take
            <br />
            the next step?
          </h2>
          <p>
            Whether you need to book an appointment, find a service, or contact
            the hospital, we're here to help you find the right next step.
          </p>
          <div className="about-cta-actions">
            <button
              className="button white"
              onClick={() => open("Request an appointment")}
            >
              Book an appointment
              <Icon name="arrow" size={18} />
            </button>
            <button
              className="text-link light-link"
              onClick={() => go("contact")}
            >
              Contact the hospital
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <span className="about-cta-note">
            Appointment request preview · online submissions not yet connected
          </span>
        </div>
        <div className="about-next-links">
          <span>HOW CAN WE HELP?</span>
          <button onClick={() => go("services")}>
            <Icon name="cross" size={22} />
            <span>
              Find the care you need
              <small>Explore services and departments</small>
            </span>
            <Icon name="arrow" size={19} />
          </button>
          <button onClick={() => go("doctors")}>
            <Icon name="user" size={22} />
            <span>
              Get to know your care team
              <small>Discover our doctor directory</small>
            </span>
            <Icon name="arrow" size={19} />
          </button>
          <button onClick={() => go("contact")}>
            <Icon name="pin" size={22} />
            <span>
              Plan your visit<small>Location and contact information</small>
            </span>
            <Icon name="arrow" size={19} />
          </button>
        </div>
      </section>
      <section className="emergency-section wide about-emergency">
        <span className="emergency-icon">
          <Icon name="phone" size={26} />
        </span>
        <div>
          <div className="emergency-eyebrow">URGENT CARE INFORMATION</div>
          <h3>Need urgent medical care?</h3>
          <p>
            Seek immediate emergency care. Do not wait for an online response.
          </p>
          <span className="emergency-number">
            Emergency Number: [Official number pending verification]
          </span>
          <span className="emergency-department">
            [Official emergency department information]
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
    </div>
  )
}
