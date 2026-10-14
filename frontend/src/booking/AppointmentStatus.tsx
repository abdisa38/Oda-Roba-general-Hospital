import Icon from "../Icon"
import { statusDescriptions, type AppointmentStatus as Status } from "./model"

type StatusProps = {
  status: Status
  example?: boolean
}
export default function AppointmentStatus({
  status,
  example = false,
}: StatusProps) {
  const info = statusDescriptions[status]
  return (
    <span className={`appointment-status appointment-status-${status}`}>
      <Icon
        name={
          status === "confirmed" || status === "completed"
            ? "check"
            : status === "cancelled" || status === "no-show"
              ? "close"
              : "calendar"
        }
        size={15}
      />
      <span>
        <strong>
          {info.label}
          {example && " · example"}
        </strong>
        <small>{info.description}</small>
      </span>
    </span>
  )
}
