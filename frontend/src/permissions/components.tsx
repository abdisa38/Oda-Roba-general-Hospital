import type { ReactNode } from "react"
import Icon from "../Icon"
import type { Destination, RoleScenario } from "./model"
import { Button, Heading, Text } from "./ui"

export function CollapsedNavigationTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <span className="permission-tooltip-wrap">
      {children}
      <span className="permission-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  )
}
export function NavigationItem({
  item,
  active,
  collapsed,
  onOpen,
}: {
  item: Destination
  active: boolean
  collapsed: boolean
  onOpen: () => void
}) {
  const control = (
    <Button
      className={`permission-nav-item${active ? " is-active" : ""}`}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={onOpen}
    >
      <Icon name={item.icon} size={19} />
      {!collapsed && <span>{item.label}</span>}
      {active && !collapsed && <Icon name="chevron" size={14} />}
    </Button>
  )
  return collapsed ? (
    <CollapsedNavigationTooltip label={item.label}>
      {control}
    </CollapsedNavigationTooltip>
  ) : (
    control
  )
}
export function NavigationGroup({
  label,
  children,
  collapsed,
}: {
  label: string
  children: ReactNode
  collapsed: boolean
}) {
  return collapsed ? (
    <div className="permission-nav-group" aria-label={label}>
      {children}
    </div>
  ) : (
    <details className="permission-nav-group" open>
      <summary>
        {label}
        <Icon name="chevron" size={13} />
      </summary>
      {children}
    </details>
  )
}
export function RoleAwareSidebar({
  role,
  items,
  active,
  collapsed,
  onOpen,
  onCollapse,
}: {
  role: RoleScenario
  items: Destination[]
  active: string
  collapsed: boolean
  onOpen: (id: string) => void
  onCollapse: () => void
}) {
  const home: Destination = {
    id: "home",
    label: role.home,
    group: "Workspace",
    icon: "building",
    action: "",
  }
  const groups = [...new Set(items.map((item) => item.group))]
  return (
    <div
      className={`permission-sidebar-content${
        collapsed ? " is-collapsed" : ""
      }`}
    >
      <div className="permission-brand">
        <span className="brand-symbol">
          <Icon name="cross" size={23} />
        </span>
        {!collapsed && (
          <div>
            <strong>ORHIMS</strong>
            <small>ODA ROBA HOSPITAL</small>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="permission-workspace-label">
          STAFF WORKSPACE<span>Hospital operations</span>
        </div>
      )}
      <nav aria-label="Authorized workspace navigation">
        <NavigationGroup label="Workspace" collapsed={collapsed}>
          <NavigationItem
            item={home}
            active={active === "home"}
            collapsed={collapsed}
            onOpen={() => onOpen("home")}
          />
        </NavigationGroup>
        {groups.map((group) => (
          <NavigationGroup key={group} label={group} collapsed={collapsed}>
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  active={active === item.id}
                  collapsed={collapsed}
                  onOpen={() => onOpen(item.id)}
                />
              ))}
          </NavigationGroup>
        ))}
        {items.length === 0 && !collapsed && (
          <Text className="permission-nav-empty">
            No operational destinations are currently configured.
          </Text>
        )}
      </nav>
      <div className="permission-sidebar-footer">
        {!collapsed && (
          <div>
            <Icon name="shield" size={17} />
            <span>
              ORHIMS Hospital Portal
              <small>Oda Roba General Hospital</small>
            </span>
          </div>
        )}
        <Button
          className="permission-nav-item"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          onClick={onCollapse}
        >
          <Icon name="menu" size={18} />
          {!collapsed && "Collapse navigation"}
        </Button>
      </div>
    </div>
  )
}
export function MobileNavigationDrawer({ children }: { children: ReactNode }) {
  return <div className="permission-mobile-navigation">{children}</div>
}
export function RoleContextIndicator({ role }: { role: RoleScenario }) {
  return (
    <span className="permission-role-label">
      {role.role}
    </span>
  )
}
export function RestrictedActionHint({ children }: { children: ReactNode }) {
  return (
    <span className="permission-restricted-hint">
      <Icon name="lock" size={14} />
      {children}
    </span>
  )
}
export function PermissionAwareAction({
  allowed,
  label,
  onClick,
  explanation,
  hide = false,
}: {
  allowed: boolean
  label: string
  onClick: () => void
  explanation?: string
  hide?: boolean
}) {
  if (!allowed && hide) return null
  return (
    <div className="permission-action">
      <Button
        className={`button${allowed ? "" : " secondary"}`}
        onClick={onClick}
        disabled={!allowed}
        aria-describedby={
          !allowed ? "restricted-action-explanation" : undefined
        }
      >
        <Icon name={allowed ? "edit" : "lock"} size={17} />
        {label}
      </Button>
      {!allowed && (
        <span id="restricted-action-explanation">
          <RestrictedActionHint>
            {explanation || "Additional authorization is required."}
          </RestrictedActionHint>
        </span>
      )}
    </div>
  )
}
export function RoleActionGroup({ children }: { children: ReactNode }) {
  return <div className="permission-action-group">{children}</div>
}
export function RoleAwarePageHeader({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="permission-page-heading">
      <div>
        <Heading level={1}>{title}</Heading>
        <Text>{description}</Text>
      </div>
      {children}
    </div>
  )
}
export function RoleDashboardLayout({ children }: { children: ReactNode }) {
  return <div className="permission-dashboard-layout">{children}</div>
}
export function RoleDashboardCard({
  title,
  children,
  className = "",
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`permission-card ${className}`}>
      <Heading level={2}>{title}</Heading>
      {children}
    </section>
  )
}
export function AuthorizedEmptyState({
  error = false,
  onRetry,
}: {
  error?: boolean
  onRetry?: () => void
}) {
  return (
    <div className="permission-empty">
      <Icon name={error ? "warning" : "check"} size={30} />
      <Heading level={3}>
        {error ? "Unable to load your work" : "You're up to date"}
      </Heading>
      <Text>
        {error
          ? "A demonstration network error occurred. Your permissions have not changed."
          : "There are no tasks in your currently authorized workflow."}
      </Text>
      {error && (
        <Button className="button secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
export function AccessDeniedPage({
  onBack,
  onHome,
}: {
  onBack: () => void
  onHome: () => void
}) {
  return (
    <section className="permission-denied">
      <span className="permission-denied-icon">
        <Icon name="shield" size={34} />
      </span>
      <span className="permission-eyebrow">PERMISSION-AWARE ACCESS</span>
      <Heading level={1}>Access restricted</Heading>
      <Text>
        You don't have permission to access this page. If you believe you need
        access, contact your system administrator.
      </Text>
      <RoleActionGroup>
        <Button className="button secondary" onClick={onBack}>
          Back
        </Button>
        <Button className="button" onClick={onHome}>
          Return to authorized home
          <Icon name="arrow" size={17} />
        </Button>
      </RoleActionGroup>
      <small>
        No record details are disclosed. This is a demonstration of
        authorization denial, not an expired session or missing record.
      </small>
    </section>
  )
}
