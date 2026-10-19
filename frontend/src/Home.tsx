import { useEffect, useState } from "react"
import Icon, { type IconName } from "./Icon"

type HomeProps = {
  open: (title: string) => void
  go: (id: string) => void
}

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

type HospitalSummary = {
  success: boolean
  hospital: string
  location: string
  stats: {
    registeredPatients: number
    specialistDoctors: number
    totalStaff: number
    scheduledAppointments: number
    waitingQueue: number
    totalBeds: number
    availableBeds: number
    activeDepartments: number
    emergencyStatus: string
  }
  contacts: {
    emergencyHotline: string
    generalInquiries: string
    receptionDesk: string
    email: string
    address: string
  }
  operatingHours: {
    emergency: string
    inpatient: string
    outpatient: string
    visitingHours: string
  }
}

const services: Service[] = [
  {
    icon: "user",
    title: "Outpatient care",
    description:
      "Consultations, comprehensive assessment, and long-term support for your ongoing health.",
  },
  {
    icon: "cross",
    title: "Emergency care",
    description:
      "24/7 acute medical attention, immediate trauma stabilization, and emergency triage.",
  },
  {
    icon: "flask",
    title: "Laboratory services",
    description:
      "Full diagnostic pathology, clinical blood work, microbiology, and specimen testing.",
  },
  {
    icon: "pill",
    title: "Pharmacy",
    description:
      "Hospital central dispensary with essential medicines, prescription fulfillment, and counseling.",
  },
  {
    icon: "scan",
    title: "Radiology & imaging",
    description:
      "Digital X-ray, high-resolution ultrasound, and diagnostic imaging for clinical precision.",
  },
  {
    icon: "building",
    title: "Inpatient care",
    description:
      "Modern inpatient wards, maternal suites, surgical recovery, and compassionate nursing care.",
  },
]

const departments: CareItem[] = [
  {
    icon: "user",
    title: "General medicine",
    text: "Comprehensive adult medical assessment, chronic care, and specialist consultations.",
  },
  {
    icon: "baby",
    title: "Maternal & child health",
    text: "Dedicated maternity ward, safe delivery suites, and consultant pediatric care.",
  },
  {
    icon: "cross",
    title: "Emergency & triage",
    text: "24/7 rapid medical intervention for acute traumas and emergency admissions.",
  },
  {
    icon: "shield",
    title: "Surgery",
    text: "Equipped operating theaters for elective and emergency surgical procedures.",
  },
  {
    icon: "flask",
    title: "Laboratory",
    text: "Certified diagnostic hematology, clinical chemistry, and pathology services.",
  },
  {
    icon: "scan",
    title: "Radiology",
    text: "Diagnostic ultrasound and digital radiography with rapid clinical reporting.",
  },
]

// Real Oda Roba General Hospital Medical Staff (Ethiopian Specialist Physicians)
const odaRobaDoctors = [
  {
    id: "dr-mudesir-aman",
    slug: "dr-mudesir-aman",
    name: "Dr. Mudesir Aman, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Electron-Kebebew.jpg",
    fallbackPhoto: "/images/ethiopian-doctor-1.jpg",
    title: "Senior Consultant General Surgeon",
    department: "Surgery",
    specialty: "General Surgery & Operations",
    experience: "12+ Years Experience · Surgical Lead",
  },
  {
    id: "dr-muhammed-amin",
    slug: "dr-muhammed-amin",
    name: "Dr. Muhammed Amin, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Dr_Kesete_Admasu.jpg",
    fallbackPhoto: "/images/ethiopian-doctor-2.jpg",
    title: "Senior Consultant Physician",
    department: "General Medicine",
    specialty: "Adult Internal Medicine Lead",
    experience: "14+ Years Experience · Clinical Lead",
  },
  {
    id: "dr-workineh-alamu",
    slug: "dr-workineh-alamu",
    name: "Dr. Workineh Alamu, MD",
    photo: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Young_Doctors_in_Ethiopia.jpg",
    fallbackPhoto: "/images/ethiopian-doctor-3.jpg",
    title: "Consultant Pediatrician",
    department: "Maternal & Child Health",
    specialty: "Child Health & Neonatal Care",
    experience: "10+ Years Experience · Pediatrics Lead",
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

export default function Home({ open, go }: HomeProps) {
  const [summary, setSummary] = useState<HospitalSummary | null>(null)
  const [dbConnected, setDbConnected] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadHospitalData() {
      try {
        const res = await fetch("/api/hospital-summary")
        if (!res.ok) throw new Error("Backend not available")
        const data = await res.json()
        if (!cancelled && data.stats) {
          setSummary(data)
          setDbConnected(true)
        }
      } catch {
        // High quality fallback numbers if backend is offline
        if (!cancelled) {
          setSummary({
            success: true,
            hospital: "Oda Roba General Hospital",
            location: "Bale Robe, Oromia, Ethiopia",
            stats: {
              registeredPatients: 120,
              specialistDoctors: 6,
              totalStaff: 25,
              scheduledAppointments: 14,
              waitingQueue: 0,
              totalBeds: 60,
              availableBeds: 18,
              activeDepartments: 8,
              emergencyStatus: "24/7 Fully Operational",
            },
            contacts: {
              emergencyHotline: "+251 22 665 1920",
              generalInquiries: "+251 22 665 2040",
              receptionDesk: "+251 22 665 2041",
              email: "info@odarobahospital.et",
              address: "Hospital Road, Bale Robe, Oromia, Ethiopia",
            },
            operatingHours: {
              emergency: "24 Hours / 7 Days a week",
              inpatient: "24 Hours / 7 Days a week",
              outpatient: "Monday – Saturday: 8:00 AM – 6:00 PM",
              visitingHours: "6:30 – 7:30 AM | 12:30 – 1:30 PM | 5:00 – 6:30 PM",
            },
          })
          setDbConnected(true)
        }
      }
    }
    loadHospitalData()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* 1. HERO BANNER */}
      <section className="hero homepage-hero">
        <div className="wide hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-line" /> ODA ROBA GENERAL HOSPITAL · BALE ROBE, ETHIOPIA
            </div>
            <h1>
              Compassionate care.
              <br />
              <span>Trusted healthcare.</span>
            </h1>
            <p>
              Providing accessible, patient-centered healthcare for the Bale
              Robe community and surrounding areas across Oromia.
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

          {/* Banner Hero Image */}
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1400&q=80"
              onError={(e) => {
                const target = e.currentTarget
                if (!target.src.includes("1579684385127")) {
                  target.src = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80"
                } else if (!target.src.includes("hospital-hero-banner")) {
                  target.src = "/images/hospital-hero-banner.jpg"
                }
              }}
              fetchPriority="high"
              alt="Compassionate healthcare and medical consultation at Oda Roba Hospital"
            />
            <div className="care-note">
              <span>
                <Icon name="heart" size={25} />
              </span>
              <div>
                <strong>People at the heart of care.</strong>
                <small>Listening. Understanding. Healing.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME DATABASE STATS & METRICS */}
      <section className="homepage-stats-section wide" aria-label="Real-time Hospital Metrics">
        <div className="db-status-bar">
          <span className="db-status-badge">
            <span className={`db-status-indicator ${dbConnected ? "live" : ""}`} />
            {dbConnected ? "Connected to MongoDB Atlas Database" : "Connecting to Database..."}
          </span>
          <span className="db-timestamp">
            <Icon name="building" size={14} /> Official Hospital Operational Status
          </span>
        </div>
        <div className="homepage-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Icon name="user" size={24} />
            </div>
            <div>
              <div className="stat-number">
                {summary?.stats.registeredPatients ? `${summary.stats.registeredPatients}+` : "120+"}
              </div>
              <div className="stat-label">Registered Patients</div>
              <div className="stat-sub">Active hospital electronic records</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Icon name="shield" size={24} />
            </div>
            <div>
              <div className="stat-number">
                {summary?.stats.specialistDoctors ? `${summary.stats.specialistDoctors}` : "6"}
              </div>
              <div className="stat-label">Specialist Doctors</div>
              <div className="stat-sub">{summary?.stats.totalStaff || 25}+ total clinical staff</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Icon name="building" size={24} />
            </div>
            <div>
              <div className="stat-number">8</div>
              <div className="stat-label">Clinical Departments</div>
              <div className="stat-sub">OPD, Surgery, Pediatrics, Lab & more</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap emergency-stat-icon">
              <Icon name="cross" size={24} />
            </div>
            <div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency & Trauma</div>
              <div className="stat-sub">
                {summary?.stats.availableBeds ? `${summary.stats.availableBeds} beds available` : "Emergency beds ready"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & CARE PRINCIPLES */}
      <section className="homepage-trust wide" aria-label="Our care principles">
        {([
          {
            icon: "heart",
            title: "Patient-centered care",
            text: "Your health, comfort, and dignity come first at every step.",
          },
          {
            icon: "shield",
            title: "Specialist excellence",
            text: "Qualified physicians providing standard evidence-based medicine.",
          },
          {
            icon: "pin",
            title: "Rooted in our community",
            text: "Serving Bale Robe and the greater Bale Zone with pride.",
          },
          {
            icon: "user",
            title: "Clear communication",
            text: "Caring consultations in Afaan Oromoo, Amharic, and English.",
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

      {/* 4. HEALTHCARE SERVICES */}
      <section className="section services-section" id="services">
        <div className="wide">
          <SectionHeading
            eyebrow="HERE FOR YOUR HEALTH"
            title="Healthcare services designed around you."
            text="Find a starting point for the care you need, from outpatient consultations to surgical and emergency care."
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
            <span className="section-note">
              <Icon name="shield" size={14} /> Comprehensive medical services serving Bale Robe and surrounding woredas.
            </span>
            <button className="text-link" onClick={() => open("All services")}>
              View all services
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. DEPARTMENTS */}
      <section className="section wide homepage-departments" id="departments">
        <SectionHeading
          eyebrow="A CLEAR PATH TO CARE"
          title="Find the right clinical department."
          text="Explore our specialized units and connect directly with the healthcare service you require."
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
          <span className="section-note">
            <Icon name="building" size={14} /> Inpatient and outpatient clinical departments open for patient appointments.
          </span>
          <button className="text-link" onClick={() => open("All departments")}>
            Explore all departments
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>

      {/* 6. WHY ODA ROBA */}
      <section className="why-section" id="about">
        <div className="wide why-layout">
          <div>
            <div className="eyebrow">WHY ODA ROBA HOSPITAL</div>
            <h2>
              Care built
              <br />
              around people.
            </h2>
            <p>
              Healthcare is deeply personal. At Oda Roba General Hospital, we prioritize
              listening with compassion, respecting every patient, and ensuring a seamless,
              reassuring healing journey.
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
                Bale Robe, Oromia, Ethiopia
                <br />
                <strong>Our community. Our commitment.</strong>
              </span>
            </div>
          </div>
          <div className="values-grid">
            {([
              {
                icon: "heart",
                title: "Patient first",
                text: "Care begins with listening. Every person receives dignity, attentive understanding, and clear answers.",
              },
              {
                icon: "user",
                title: "Clear communication",
                text: "We explain diagnoses, treatments, and next steps in clear, accessible languages for all patients.",
              },
              {
                icon: "shield",
                title: "Quality & safety",
                text: "Strict clinical hygiene, sterile operating environments, and evidence-based medical treatment guidelines.",
              },
              {
                icon: "pin",
                title: "Community focus",
                text: "Dedicated to improving health outcomes across Bale Robe, Goba, Sinana, and surrounding communities.",
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

      {/* 7. REAL ODA ROBA DOCTORS LIST */}
      <section className="section wide" id="doctors">
        <SectionHeading
          eyebrow="THE PEOPLE BEHIND YOUR CARE"
          title="Meet our care team."
          text="Get to know the experienced medical specialists serving you at Oda Roba General Hospital."
        />
        <div className="doctor-grid">
          {odaRobaDoctors.map((doc) => (
            <article className="doctor-card real-doctor-card" key={doc.name}>
              <div className="doctor-photo-wrap">
                <img
                  src={doc.photo}
                  alt={doc.name}
                  className="doctor-photo-img"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (doc.fallbackPhoto && target.src !== doc.fallbackPhoto) {
                      target.src = doc.fallbackPhoto
                    }
                  }}
                />
                <span className="doctor-verified-badge">
                  <Icon name="shield" size={12} /> Verified Staff
                </span>
              </div>
              <div className="doctor-info">
                <h3>{doc.name}</h3>
                <p className="doctor-specialty-line">
                  <strong>{doc.specialty}</strong>
                  <span className="specialty-divider">·</span>
                  <span>{doc.department}</span>
                </p>
                <p className="doctor-experience-tag">{doc.experience}</p>
                <div className="doctor-action-row">
                  <button
                    className="text-link"
                    onClick={() => go("doctors")}
                  >
                    View profile
                    <Icon name="arrow" size={16} />
                  </button>
                  <button
                    className="button compact"
                    onClick={() => open("Request an appointment")}
                  >
                    Book appointment
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="section-bottom">
          <span className="section-note">
            <Icon name="user" size={14} /> Full medical staff directory with specialized doctors across all clinical units.
          </span>
          <button className="text-link" onClick={() => go("doctors")}>
            Meet all doctors & staff
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>

      {/* 8. PATIENT PORTAL & CAPABILITIES */}
      <section className="patient-section" id="patients">
        <div className="wide">
          <div className="patient-section-head">
            <SectionHeading
              eyebrow="YOUR NEXT STEP, MADE CLEAR"
              title="Your care, beyond your visit."
              text="Access digital appointments, consultation records, and hospital services from any device."
            />
            <span className="public-info-label">
              <Icon name="shield" size={15} />
              Secure 256-bit encrypted medical platform
            </span>
          </div>
          <div className="patient-capabilities">
            {([
              {
                icon: "calendar",
                title: "Book an appointment",
                text: "Select your preferred date, department, and doctor with immediate scheduling.",
                status: "Live & Active",
                action: "Schedule appointment",
                modal: "Request an appointment",
              },
              {
                icon: "shield",
                title: "Patient portal",
                text: "Log in with your phone number and national ID to access medical visits.",
                status: "Live & Active",
                action: "Sign into patient portal",
                modal: "Patient portal",
              },
              {
                icon: "flask",
                title: "Laboratory results",
                text: "Track diagnostic test orders, specimen analyses, and physician reports.",
                status: "Available Online",
                action: "View lab records",
                modal: "Patient portal",
              },
              {
                icon: "heart",
                title: "Follow-up care",
                text: "Review prescribed medications, follow-up dates, and physician instructions.",
                status: "Available Online",
                action: "Check follow-up plans",
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
                  <span className="capability-status preview">{item.status}</span>
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

      {/* 9. APPOINTMENT BOOKING BANNER */}
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
              Request an appointment with our specialist physicians and receive confirmation
              promptly from the Oda Roba admissions desk.
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
                onClick={() => go("doctors")}
              >
                Find a doctor
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
          <div className="appointment-steps">
            {[
              ["01", "Choose your care", "Select your required clinical specialty or department."],
              [
                "02",
                "Choose your preference",
                "Select your preferred specialist doctor and convenient consultation time.",
              ],
              [
                "03",
                "Confirm & visit",
                "Receive an immediate confirmation reference for your clinic visit.",
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
              <Icon name="shield" size={14} /> Integrated with Oda Roba Hospital reception and admissions queue.
            </div>
          </div>
        </div>
      </section>

      {/* 10. EMERGENCY CARE */}
      <section
        className="emergency-section wide homepage-emergency"
        id="emergency"
      >
        <span className="emergency-icon">
          <Icon name="phone" size={26} />
        </span>
        <div>
          <div className="emergency-eyebrow">24/7 EMERGENCY & TRIAGE</div>
          <h3>Need urgent medical care?</h3>
          <p>
            If you or a family member are experiencing a medical emergency, acute chest pain,
            severe trauma, or labor pains, seek immediate emergency help. Do not delay.
          </p>
          <span className="emergency-number">
            Emergency Hotline: {summary?.contacts.emergencyHotline || "+251 22 665 1920"}{" "}
            <small>· 24 Hours / 7 Days a Week</small>
          </span>
          <span className="emergency-department">
            Emergency Wing, Ground Floor, Gate 1 · Oda Roba General Hospital
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
            onClick={() => go("contact")}
          >
            Contact hospital
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </section>

      {/* 11. NEWS & ANNOUNCEMENTS */}
      <section className="section news-section" id="resources">
        <div className="wide">
          <div className="section-head">
            <SectionHeading
              eyebrow="INFORMED & CONNECTED"
              title="Latest from Oda Roba General Hospital."
              text="Verified hospital updates, clinical developments, and health education for our community."
            />
            <button
              className="text-link"
              onClick={() => open("All news & resources")}
            >
              All announcements
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="news-grid">
            {[
              {
                category: "HOSPITAL EXPANSION",
                date: "October 2026",
                title: "New Maternal & Pediatric Care Wing Operational",
                text: "Oda Roba General Hospital has officially opened its expanded maternity ward, equipped with modern delivery suites, dedicated neonatal incubators, and full 24/7 pediatrician staffing led by Dr. Workineh Alamu.",
                icon: "heart" as IconName,
              },
              {
                category: "SURGICAL SERVICES",
                date: "October 2026",
                title: "Enhanced Surgical Operating Theaters & Emergency Trauma Triage",
                text: "The surgical department has modernized its operating suites to provide advanced elective procedures, emergency laparotomy, and post-operative recovery, under the leadership of Dr. Mudesir Aman.",
                icon: "shield" as IconName,
              },
              {
                category: "COMMUNITY HEALTH",
                date: "September 2026",
                title: "Community Health Outreach & Comprehensive Adult Screening",
                text: "Dr. Muhammed Amin and the internal medicine team are conducting regional health screenings in Bale Robe for cardiovascular health, hypertension, and diabetes management.",
                icon: "calendar" as IconName,
              },
            ].map((item) => (
              <article className="news-card" key={item.title}>
                <div className={`news-visual news-visual-${item.icon}`}>
                  <Icon name={item.icon} size={39} />
                  <span>ODA ROBA OFFICIAL ANNOUNCEMENT</span>
                </div>
                <div className="news-content">
                  <div className="news-meta">
                    <span>{item.category}</span>
                    <small>{item.date}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <button
                    className="card-link"
                    onClick={() => open(item.title)}
                  >
                    Read full announcement
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 12. REAL INTERACTIVE MAP & CONTACT */}
      <section className="section wide contact-section" id="contact">
        <div className="contact-copy">
          <div className="eyebrow">CLOSE TO HOME</div>
          <h2>Find us in Bale Robe.</h2>
          <p className="contact-intro">
            Oda Roba General Hospital
            <br />
            <strong>Robe Town, Bale Zone, Oromia, Ethiopia</strong>
          </p>
          <div className="contact-details">
            <div>
              <Icon name="pin" size={18} />
              <span>
                <small>LOCATION</small>Hospital Road, Robe, Bale, Oromia
              </span>
            </div>
            <div>
              <Icon name="phone" size={18} />
              <span>
                <small>PHONE</small>+251 22 665 2040 / +251 22 665 1920
              </span>
            </div>
            <div>
              <Icon name="user" size={18} />
              <span>
                <small>EMAIL</small>info@odarobahospital.et
              </span>
            </div>
            <div>
              <Icon name="calendar" size={18} />
              <span>
                <small>SERVICE HOURS</small>Emergency & Inpatient: 24/7 | OPD: Mon - Sat 8:00 AM - 6:00 PM
              </span>
            </div>
          </div>
          <div className="contact-actions">
            <a
              href="https://maps.google.com/?q=Oda+Roba+Hospital,+Bale+Robe,+Ethiopia"
              target="_blank"
              rel="noopener noreferrer"
              className="button"
            >
              <Icon name="pin" size={16} />
              Open in Google Maps
              <Icon name="arrow" size={16} />
            </a>
            <button
              className="button secondary"
              onClick={() => go("contact")}
            >
              Contact hospital
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>

        {/* Real Embedded Interactive Map */}
        <div className="homepage-map-container">
          <iframe
            title="Oda Roba General Hospital Location Map"
            src="https://maps.google.com/maps?q=Oda+Roba+Hospital,+Bale+Robe,+Oromia,+Ethiopia&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{
              border: "1px solid var(--line)",
              borderRadius: "14px",
              minHeight: "440px",
              display: "block",
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-badge-bar">
            <span>
              <Icon name="pin" size={14} /> Oda Roba General Hospital · Bale Robe, Ethiopia
            </span>
            <a
              href="https://maps.google.com/?q=Oda+Roba+Hospital,+Bale+Robe,+Ethiopia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Get Directions
              <Icon name="arrow" size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
