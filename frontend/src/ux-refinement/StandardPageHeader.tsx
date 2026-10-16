import type { ReactNode } from "react"
import Icon, { type IconName } from "../Icon"
import Breadcrumbs from "./Breadcrumbs"
import type { BreadcrumbItem } from "./model"

interface StandardPageHeaderProps {
  title: string
  description?: string
  icon?: IconName
  breadcrumbs?: BreadcrumbItem[]
  badge?: ReactNode
  primaryAction?: {
    label: string
    icon?: IconName
    onClick: () => void
    disabled?: boolean
  }
  secondaryActions?: Array<{
    label: string
    icon?: IconName
    onClick: () => void
    variant?: "outline" | "ghost" | "danger"
  }>
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  filterSlot?: ReactNode
  onNavigate?: (destinationId: string) => void
}

export default function StandardPageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  badge,
  primaryAction,
  secondaryActions,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterSlot,
  onNavigate,
}: StandardPageHeaderProps) {
  return (
    <header className="orh-page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
      )}

      <div className="orh-page-header-top">
        <div className="orh-page-header-titles">
          <h1 className="orh-page-title">
            {icon && <Icon name={icon} size={24} />}
            <span>{title}</span>
            {badge}
          </h1>
          {description && <p className="orh-page-description">{description}</p>}
        </div>

        <div className="orh-page-header-actions">
          {secondaryActions?.map((sec, idx) => (
            <button
              key={idx}
              type="button"
              className={
                sec.variant === "danger"
                  ? "portal-btn portal-btn-danger-outline portal-btn-sm"
                  : "portal-btn portal-btn-secondary portal-btn-sm"
              }
              onClick={sec.onClick}
            >
              {sec.icon && <Icon name={sec.icon} size={15} />}
              <span>{sec.label}</span>
            </button>
          ))}

          {primaryAction && (
            <button
              type="button"
              className="portal-btn portal-btn-primary portal-btn-sm"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.icon && <Icon name={primaryAction.icon} size={15} />}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {(onSearchChange || filterSlot) && (
        <div className="orh-page-header-bottom">
          {onSearchChange && (
            <div style={{ position: "relative", minWidth: "260px", maxWidth: "400px", width: "100%" }}>
              <span
                style={{
                  position: "absolute",
                  left: "0.65rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--orh-text-muted)",
                }}
              >
                <Icon name="search" size={15} />
              </span>
              <input
                type="text"
                className="orh-input"
                style={{ paddingLeft: "2.1rem" }}
                placeholder={searchPlaceholder || "Search records…"}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          {filterSlot && <div>{filterSlot}</div>}
        </div>
      )}
    </header>
  )
}
