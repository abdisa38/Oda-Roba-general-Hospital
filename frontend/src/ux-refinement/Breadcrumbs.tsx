import Icon from "../Icon"
import type { BreadcrumbItem } from "./model"

export default function Breadcrumbs({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[]
  onNavigate?: (destinationId: string) => void
}) {
  return (
    <nav className="orh-breadcrumbs" aria-label="Breadcrumb navigation">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="orh-breadcrumb-item">
            {isLast ? (
              <span className="orh-breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  className="orh-breadcrumb-link"
                  onClick={() => {
                    if (item.onClick) item.onClick()
                    else if (item.destinationId && onNavigate) onNavigate(item.destinationId)
                  }}
                >
                  {item.label}
                </button>
                <span className="orh-breadcrumb-separator" aria-hidden="true">
                  <Icon name="chevron" size={12} />
                </span>
              </>
            )}
          </span>
        )
      })}
    </nav>
  )
}
