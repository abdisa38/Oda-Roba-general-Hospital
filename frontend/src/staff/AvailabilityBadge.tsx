import Icon from "../Icon"
import type { AvailabilityStatus } from "../staffData"

type BadgeProps = {
  status: AvailabilityStatus
  example?: boolean
}
export default function AvailabilityBadge({
  status,
  example = false,
}: BadgeProps) {
  const labels = {
    unverified: "Schedule pending",
    available: "Available",
    limited: "Limited",
    unavailable: "Not available",
  }
  return (
    <span className={`staff-availability staff-availability-${status}`}>
      <Icon name={status === "unavailable" ? "close" : "calendar"} size={13} />
      {labels[status]}
      {example && <span className="status-example-label"> · example</span>}
    </span>
  )
}
