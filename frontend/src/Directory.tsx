import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import Icon from "./Icon"
import {
  allCare,
  categories,
  departments,
  services,
  departmentServices,
  careMatches,
  type CareItem,
  type Department,
  type Service,
  type CareCategory,
} from "./directoryData"

type DirectoryProps = {
  onBook: (item?: CareItem) => void
  open: (title: string) => void
  go: (id: string) => void
  home: () => void
}
type Scope = "all" | "departments" | "services"
type HighlightProps = {
  text: string
  query: string
}
function Highlight({ text, query }: HighlightProps) {
  const term = query.trim()
  if (!term) return <>{text}</>
  const index = text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase())
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  )
}
function Note({ children }: { children: ReactNode }) {
  return (
    <span className="directory-note">
      <Icon name="shield" size={14} />
      {children}
    </span>
  )
}
type CardProps<T,> = {
  item: T
  view: (item: CareItem, event?: MouseEvent<HTMLAnchorElement>) => void
}
function ServiceCard({ item, view }: CardProps<Service>) {
  return (
    <article className="directory-service-card">
      <span className="service-icon">
        <Icon name={item.icon} size={25} />
      </span>
      <span className="directory-example">CLINICAL SERVICE</span>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <a
        className="card-link"
        href={`/services/${item.slug}`}
        onClick={(event) => view(item, event)}
      >
        Learn more
        <Icon name="arrow" size={17} />
      </a>
    </article>
  )
}
function DepartmentCard({ item, view }: CardProps<Department>) {
  const related = departmentServices(item)
  return (
    <article
      className={`directory-department-card ${
        item.featured ? "department-card-featured" : ""
      }`}
    >
      <div className="department-main">
        <span className="directory-department-icon">
          <Icon name={item.icon} size={25} />
        </span>
        <div>
          <span className="directory-example">HOSPITAL DEPARTMENT</span>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      </div>
      <div className="department-services">
        <span>Clinical services</span>
        <ul>
          {(related.length
            ? related.slice(0, 3).map((service) => service.name)
            : [
                "Outpatient Consultation",
                "Diagnostic Support",
              ]
          ).map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <div className="department-card-bottom">
        <span>Availability pending verification</span>
        <a
          className="text-link"
          href={`/departments/${item.slug}`}
          onClick={(event) => view(item, event)}
        >
          View department
          <Icon name="arrow" size={16} />
        </a>
      </div>
    </article>
  )
}

export default function Directory({ open, go, home, onBook }: DirectoryProps) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<Scope>(
    window.location.pathname === "/services" ? "services" : "all",
  )
  const [category, setCategory] = useState<CareCategory>("clinical")
  const [selected, setSelected] = useState<CareItem | null>(() => {
    const [type, slug] = window.location.pathname.split("/").filter(Boolean)
    return slug
      ? (allCare.find(
          (item) =>
            item.slug === slug &&
            (type === "departments"
              ? item.kind === "department"
              : item.kind === "service"),
        ) ?? null)
      : null
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const isSearching = query.trim().length > 0 || scope !== "all"
  const results = allCare.filter(
    (item) =>
      (scope === "all" ||
        (scope === "departments"
          ? item.kind === "department"
          : item.kind === "service")) &&
      careMatches(item, query),
  )
  const selectedCategory = categories.find((item) => item.id === category)!
  const categoryServices = services.filter((item) => item.category === category)
  const featuredDepartment =
    departments.find((item) => item.featured) ?? departments[0]
  const hasSelected = selected !== null
  useEffect(() => {
    if (hasSelected) {
      previousFocus.current = (document.activeElement as HTMLElement)
      dialogRef.current?.showModal()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = previousOverflow
      }
    } else {
      dialogRef.current?.close()
      previousFocus.current?.focus()
    }
  }, [hasSelected])
  useEffect(() => {
    if (selected)
      dialogRef.current
        ?.querySelector<HTMLElement>("#care-preview-title")
        ?.focus()
  }, [selected?.id])
  function view(item: CareItem, event?: MouseEvent<HTMLAnchorElement>) {
    if (
      event &&
      (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    )
      return
    event?.preventDefault()
    setSelected(item)
  }
  function browse(term: string) {
    setScope("all")
    setQuery(term)
    document.getElementById("care-search")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
    inputRef.current?.focus({ preventScroll: true })
  }
  function reset() {
    setQuery("")
    setScope("all")
    inputRef.current?.focus()
  }
  function resultKeyboard(event: KeyboardEvent<HTMLElement>) {
    const links = Array.from(
      resultRef.current?.querySelectorAll<HTMLAnchorElement>(
        ".search-result-link",
      ) ?? [],
    )
    if (!links.length) return
    if (event.key === "Escape") {
      inputRef.current?.focus()
      return
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
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
  function detailAppointment() {
    setSelected(null)
    setTimeout(() => onBook(selected ?? undefined), 0)
  }
  return (
    <div className="directory-page">
      <section className="directory-hero">
        <div className="wide">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <button onClick={home}>Home</button>
            <Icon name="chevron" size={12} />
            <span aria-current="page">Departments & services</span>
          </nav>
          <div className="directory-hero-layout">
            <div>
              <div className="eyebrow">
                <span className="tiny-line" />
                DEPARTMENTS & SERVICES
              </div>
              <h1>
                Find the <span>right care.</span>
              </h1>
              <p>
                Explore the hospital’s departments and healthcare services to
                find the care that best matches your needs.
              </p>
              <div className="directory-hero-actions">
                <button
                  className="button"
                  onClick={() => open("Request an appointment")}
                >
                  <Icon name="calendar" size={17} />
                  Book an appointment
                  <Icon name="arrow" size={16} />
                </button>
                <button
                  className="directory-hero-emergency"
                  onClick={() => open("Emergency information")}
                >
                  <Icon name="phone" size={16} />
                  Emergency care
                  <Icon name="arrow" size={15} />
                </button>
              </div>
            </div>
            <figure className="directory-hero-image">
              <img
                src="/images/patient-care.jpg"
                alt="A healthcare conversation; illustrative photograph, not Oda Roba Hospital"
                fetchPriority="high"
              />
              <span className="image-label">Illustrative care imagery</span>
              <figcaption>
                <Icon name="heart" size={17} />A clearer path to care.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section
        className="care-discovery wide"
        id="care-search"
        aria-labelledby="care-search-heading"
      >
        <div className="discovery-heading">
          <h2 id="care-search-heading">What are you looking for?</h2>
          <Note>
            Oda Roba General Hospital Clinical Services & Specialties
          </Note>
        </div>
        <form
          className="care-search-form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const first = resultRef.current?.querySelector<HTMLAnchorElement>(
              ".search-result-link",
            )
            if (first) first.focus()
            else inputRef.current?.focus()
          }}
        >
          <div className="care-search-input">
            <Icon name="search" size={22} />
            <label className="sr-only" htmlFor="care-query">
              Search services, departments, or care
            </label>
            <input
              id="care-query"
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={resultKeyboard}
              placeholder="Search services, departments, or care..."
              autoComplete="off"
              aria-controls="care-search-results"
              aria-describedby="search-help"
            />
            {query && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label="Clear search"
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
        <div className="discovery-controls">
          <div
            className="care-filters"
            role="group"
            aria-label="Filter care directory"
          >
            {(["all", "departments", "services"] as Scope[]).map((value) => (
              <button
                type="button"
                aria-pressed={scope === value}
                className={scope === value ? "active" : ""}
                onClick={() => setScope(value)}
                key={value}
              >
                {value === "all"
                  ? "All care"
                  : value === "departments"
                    ? "Departments"
                    : "Services"}
              </button>
            ))}
          </div>
          <p id="search-help">
            Try <button onClick={() => browse("laboratory")}>laboratory</button>
            ,{" "}
            <button onClick={() => browse("general medicine")}>
              general medicine
            </button>
            , or{" "}
            <button onClick={() => browse("maternal")}>maternal care</button>.
          </p>
        </div>
        <div
          id="care-search-results"
          ref={resultRef}
          className={
            isSearching ? "search-results is-visible" : "search-results"
          }
          onKeyDown={resultKeyboard}
        >
          {isSearching && (
            <>
              <div className="search-results-heading">
                <h3>
                  {query.trim()
                    ? `Results for “${query.trim()}”`
                    : `Browse ${scope}`}
                </h3>
                <span role="status" aria-live="polite">
                  {results.length}{" "}
                  {results.length === 1 ? "result" : "results"} found
                </span>
              </div>
              {results.length ? (
                <ul className="search-results-list">
                  {results.map((item) => (
                    <li key={item.id}>
                      <a
                        className="search-result-link"
                        href={`/${
                          item.kind === "department"
                            ? "departments"
                            : "services"
                        }/${item.slug}`}
                        onClick={(event) => view(item, event)}
                      >
                        <span className="result-icon">
                          <Icon name={item.icon} size={22} />
                        </span>
                        <span className="result-copy">
                          <span className="result-type">
                            {item.kind === "department"
                              ? "DEPARTMENT"
                              : "SERVICE"}
                          </span>
                          <strong>
                            <Highlight text={item.name} query={query} />
                          </strong>
                          <span className="result-description">
                            <Highlight text={item.description} query={query} />
                          </span>
                          {item.kind === "service" && (
                            <small>
                              Department:{" "}
                              <Highlight
                                text={
                                  departments.find(
                                    (d) => d.slug === item.department,
                                  )?.name ?? ""
                                }
                                query={query}
                              />
                            </small>
                          )}
                        </span>
                        <Icon name="arrow" size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="search-empty">
                  <span>
                    <Icon name="search" size={29} />
                  </span>
                  <h3>
                    {scope === "departments"
                      ? "No departments found"
                      : "No services found"}
                  </h3>
                  <p>Try a different search term or explore all departments.</p>
                  <button className="button secondary" onClick={reset}>
                    Explore all care
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
              <p className="search-keyboard-help">
                Use Tab or the arrow keys to browse results. Press Enter to open
                a preview.
              </p>
            </>
          )}
        </div>
      </section>
      {!isSearching && (
        <>
          <section className="section directory-featured">
            <div className="wide">
              <div className="section-head">
                <div className="section-heading">
                  <div className="eyebrow">FEATURED SERVICES</div>
                  <h2>Start with the care you need.</h2>
                  <p>
                    A few familiar starting points for your healthcare journey.
                  </p>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    setScope("services")
                    document.getElementById("care-search")?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                    inputRef.current?.focus({ preventScroll: true })
                  }}
                >
                  Explore all services
                  <Icon name="arrow" size={18} />
                </button>
              </div>
              <div className="directory-featured-grid">
                {services
                  .filter((item) => item.featured)
                  .map((item) => (
                    <ServiceCard item={item} view={view} key={item.id} />
                  ))}
              </div>
              <Note>
                These are editable service examples, not confirmed hospital
                offerings.
              </Note>
            </div>
          </section>
          <section
            className="section wide directory-departments"
            id="department-directory"
          >
            <div className="directory-section-heading">
              <div className="section-heading">
                <div className="eyebrow">OUR DEPARTMENTS</div>
                <h2>Care across different needs.</h2>
                <p>
                  Find the area of care you’re looking for, then explore its
                  services.
                </p>
              </div>
              <div className="directory-definition">
                <Icon name="building" size={21} />
                <p>
                  <strong>A department</strong> brings a care team and related
                  services together.
                  <br />
                  <strong>A service</strong> is a specific type of care or
                  support.
                </p>
              </div>
            </div>
            <div className="directory-department-grid">
              {departments.map((item) => (
                <DepartmentCard item={item} view={view} key={item.id} />
              ))}
            </div>
            <Note>
              Department names and service lists are examples. The hospital must
              verify its directory before publication.
            </Note>
          </section>
          <section className="section directory-categories" id="care-services">
            <div className="wide">
              <div className="section-heading">
                <div className="eyebrow">BROWSE BY TYPE OF CARE</div>
                <h2>Explore healthcare services.</h2>
                <p>Know the kind of care you’re looking for? Start here.</p>
              </div>
              <div className="care-category-layout">
                <div
                  className="care-category-buttons"
                  role="group"
                  aria-label="Service categories"
                >
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      aria-pressed={category === item.id}
                      className={category === item.id ? "active" : ""}
                      onClick={() => setCategory(item.id)}
                    >
                      <Icon name={item.icon} size={20} />
                      <span>{item.name}</span>
                      <Icon name="arrow" size={15} />
                    </button>
                  ))}
                </div>
                <div className="category-content" aria-live="polite">
                  <span className="directory-example">
                    CLINICAL SPECIALTY CATEGORY
                  </span>
                  <h3>{selectedCategory.name}</h3>
                  <p>{selectedCategory.description}</p>
                  <div className="category-service-list">
                    {categoryServices.map((item) => (
                      <a
                        key={item.id}
                        href={`/services/${item.slug}`}
                        onClick={(event) => view(item, event)}
                      >
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.description}</small>
                        </span>
                        <Icon name="arrow" size={18} />
                      </a>
                    ))}
                  </div>
                  <Note>
                    Oda Roba General Hospital Clinical Specialties
                  </Note>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      <section className="section wide directory-guidance">
        <div>
          <div className="eyebrow">A LITTLE GUIDANCE</div>
          <h2>
            Not sure where
            <br />
            to start?
          </h2>
          <p>
            Tell us what kind of care you are looking for and explore the
            services that may be relevant.
          </p>
          <span className="guidance-disclaimer">
            <Icon name="shield" size={15} />
            Navigation guidance only—not medical advice or a symptom checker.
          </span>
        </div>
        <div className="guidance-pathways">
          {[
            {
              text: "I need urgent care",
              destination: "Emergency information",
              icon: "phone" as const,
              action: () => open("Emergency information"),
              urgent: true,
            },
            {
              text: "I need to see a doctor",
              destination: "Appointments & outpatient care",
              icon: "user" as const,
              action: () => open("Request an appointment"),
              urgent: false,
            },
            {
              text: "I need a test",
              destination: "Laboratory & diagnostic services",
              icon: "flask" as const,
              action: () => browse("diagnostic"),
              urgent: false,
            },
            {
              text: "I need medication",
              destination: "Pharmacy information",
              icon: "pill" as const,
              action: () => browse("pharmacy"),
              urgent: false,
            },
            {
              text: "I need follow-up care",
              destination: "Patient services",
              icon: "heart" as const,
              action: () => go("patients"),
              urgent: false,
            },
          ].map((item) => (
            <button
              className={item.urgent ? "urgent-pathway" : ""}
              onClick={item.action}
              key={item.text}
            >
              <Icon name={item.icon} size={20} />
              <span>
                <strong>{item.text}</strong>
                <small>{item.destination}</small>
              </span>
              <Icon name="arrow" size={17} />
            </button>
          ))}
        </div>
      </section>
      {!isSearching && featuredDepartment && (
        <section className="section directory-detail-preview">
          <div className="wide detail-preview-layout">
            <figure>
              <img
                src={
                  featuredDepartment.image ?? "/images/care-conversation.jpg"
                }
                alt="A clinician listening during a consultation; illustrative photography"
                loading="lazy"
              />
              <span className="image-label">
                Oda Roba General Hospital · Bale Robe
              </span>
              <figcaption>Understanding starts with a conversation.</figcaption>
            </figure>
            <div>
              <div className="eyebrow">
                {featuredDepartment.name.toUpperCase()} · DEPARTMENT
              </div>
              <h2>
                {featuredDepartment.slug === "general-medicine"
                  ? "Professional care for everyday health needs."
                  : `Explore care with ${featuredDepartment.name.toLowerCase()}.`}
              </h2>
              <p>
                Providing trusted clinical consultations, advanced diagnostics,
                and dedicated inpatient and outpatient care for Bale Robe.
              </p>
              <span className="preview-list-heading">Clinical services</span>
              <ul>
                {departmentServices(featuredDepartment)
                  .slice(0, 3)
                  .map((service) => (
                    <li key={service.id}>{service.name}</li>
                  ))}
              </ul>
              <div className="detail-preview-actions">
                <a
                  className="button"
                  href={`/departments/${featuredDepartment.slug}`}
                  onClick={(event) => view(featuredDepartment, event)}
                >
                  View department
                  <Icon name="arrow" size={16} />
                </a>
                <button
                  className="text-link"
                  onClick={() => onBook(featuredDepartment)}
                >
                  Book an appointment
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <Note>Department availability and services are unverified.</Note>
            </div>
          </div>
        </section>
      )}
      <section
        className="emergency-section wide directory-emergency"
        id="directory-emergency"
      >
        <span className="emergency-icon">
          <Icon name="phone" size={26} />
        </span>
        <div>
          <div className="emergency-eyebrow">WHEN CARE CANNOT WAIT</div>
          <h3>Need urgent medical care?</h3>
          <p>
            Seek immediate emergency care. Do not wait for an online response.
          </p>
          <div className="directory-emergency-details">
            <span>
              <strong>Emergency contact</strong>[Official emergency number]
            </span>
            <span>
              <strong>Emergency department</strong>[Official department
              information]
            </span>
          </div>
        </div>
        <button
          className="button emergency-button"
          onClick={() => open("Emergency information")}
        >
          Get emergency information
          <Icon name="arrow" size={17} />
        </button>
      </section>
      <section className="wide directory-appointment">
        <div>
          <div className="eyebrow light">YOUR NEXT STEP</div>
          <h2>
            Ready to see a<br />
            healthcare professional?
          </h2>
          <p>
            Request an appointment and take the next step in your care journey.
          </p>
          <span>
            Appointment flow preview · online submissions not connected
          </span>
        </div>
        <div className="directory-appointment-actions">
          <button
            className="button white"
            onClick={() => open("Request an appointment")}
          >
            <Icon name="calendar" size={18} />
            Book an appointment
            <Icon name="arrow" size={17} />
          </button>
          <button
            className="text-link light-link"
            onClick={() => open("Find a doctor")}
          >
            Find a doctor
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
      <section className="section wide directory-help">
        <div>
          <div className="eyebrow">WE’LL HELP YOU FIND YOUR WAY</div>
          <h2>
            Need help finding
            <br />
            the right service?
          </h2>
          <p>Clear information is part of a more reassuring care journey.</p>
        </div>
        <div className="directory-help-options">
          <button onClick={() => open("Contact the hospital")}>
            <Icon name="user" size={23} />
            <span>
              <strong>Contact the hospital</strong>
              <small>[Official contact email]</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
          <button onClick={() => open("Contact the hospital")}>
            <Icon name="phone" size={23} />
            <span>
              <strong>Call the hospital</strong>
              <small>[Official hospital number]</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
          <button onClick={() => go("contact")}>
            <Icon name="pin" size={23} />
            <span>
              <strong>Visit the hospital</strong>
              <small>Bale Robe, Oromia, Ethiopia</small>
            </span>
            <Icon name="arrow" size={17} />
          </button>
          <Note>
            Phone, email, exact address, and service hours await confirmation.
          </Note>
        </div>
      </section>
      <dialog
        ref={dialogRef}
        className="care-preview-dialog"
        aria-labelledby="care-preview-title"
        onCancel={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null)
        }}
      >
        <button
          className="dialog-close icon-button"
          aria-label="Close care preview"
          onClick={() => setSelected(null)}
        >
          <Icon name="close" />
        </button>
        {selected && (
          <>
            <div className="eyebrow">
              {selected.kind === "department" ? "DEPARTMENT" : "SERVICE"}{" "}
              PREVIEW
            </div>
            <span className="service-icon">
              <Icon name={selected.icon} size={27} />
            </span>
            <h2 id="care-preview-title" tabIndex={-1}>
              {selected.name}
            </h2>
            <div className="care-preview-status">
              <Icon name="shield" size={16} />
              <span>Oda Roba General Hospital Clinical Specialty</span>
            </div>
            <p>{selected.description}</p>
            <h3>Who this information is for</h3>
            <p>{selected.audience}</p>
            {selected.kind === "department" ? (
              <>
                <h3>Clinical services</h3>
                <ul>
                  {departmentServices(selected).length ? (
                    departmentServices(selected).map((service) => (
                      <li key={service.id}>
                        <button onClick={() => setSelected(service)}>
                          {service.name}
                          <Icon name="arrow" size={15} />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>Inpatient & outpatient clinical consultations</li>
                  )}
                </ul>
              </>
            ) : (
              <>
                <h3>Department</h3>
                <button
                  className="text-link"
                  onClick={() =>
                    setSelected(
                      departments.find(
                        (item) => item.slug === selected.department,
                      ) ?? null,
                    )
                  }
                >
                  {
                    departments.find(
                      (item) => item.slug === selected.department,
                    )?.name
                  }
                  <Icon name="arrow" size={16} />
                </button>
              </>
            )}
            <div className="notice">
              <strong>Before planning your visit</strong>
              <p>
                Availability, appointment eligibility, opening hours, and
                location must be confirmed by the hospital. This is a content
                preview, not medical advice.
              </p>
            </div>
            <div className="care-preview-actions">
              {selected.category === "emergency" ? (
                <button
                  className="button emergency-button"
                  onClick={() => {
                    setSelected(null)
                    setTimeout(() => open("Emergency information"), 0)
                  }}
                >
                  Emergency information
                  <Icon name="arrow" size={16} />
                </button>
              ) : (
                <button className="button" onClick={detailAppointment}>
                  Explore appointment requests
                  <Icon name="arrow" size={16} />
                </button>
              )}
              <button className="text-link" onClick={() => setSelected(null)}>
                Back to directory
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}
