import { useState } from "react"
import Icon from "../Icon"
import { dateKey, parseDate, readableDate } from "./model"

type CalendarProps = {
  value: string
  onChange: (value: string) => void
  error?: string
  availability?: DateAvailability[]
}
export type DateAvailability = {
  date: string
  status: "available" | "limited" | "unavailable" | "unverified"
}
function startOfWeek(date: Date) {
  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
  )
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}
export default function BookingCalendar({
  value,
  onChange,
  error,
  availability = [],
}: CalendarProps) {
  const [selectionError, setSelectionError] = useState("")
  const [anchor, setAnchor] = useState(() =>
    startOfWeek(parseDate(value) ?? new Date()),
  )
  const today = dateKey(new Date())
  const dateError = error || selectionError
  const statusFor = (date: string) =>
    availability.find((day) => day.date === date)?.status ?? "unverified"
  function choose(value: string) {
    if (statusFor(value) === "unavailable") {
      setSelectionError("This date is unavailable. Please choose another date.")
      return
    }
    setSelectionError("")
    onChange(value)
  }
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor)
    date.setDate(date.getDate() + index)
    return date
  })
  const previousDisabled = dateKey(days[0]) <= today
  function shift(direction: number) {
    const next = new Date(anchor)
    next.setDate(next.getDate() + direction * 7)
    setAnchor(next)
  }
  return (
    <div className="booking-calendar">
      <div className="booking-calendar-top">
        <div>
          <Icon name="calendar" size={20} />
          <h3>Preferred date</h3>
        </div>
        <button
          type="button"
          className="text-link"
          disabled={statusFor(today) === "unavailable"}
          onClick={() => {
            setAnchor(startOfWeek(new Date()))
            choose(today)
          }}
        >
          Today
        </button>
      </div>
      <div className="booking-week-nav">
        <button
          type="button"
          className="icon-button previous-arrow"
          disabled={previousDisabled}
          onClick={() => shift(-1)}
          aria-label="Previous week"
        >
          <Icon name="arrow" size={18} />
        </button>
        <strong>
          {new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
          }).format(days[0])}{" "}
          –{" "}
          {new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(days[6])}
        </strong>
        <button
          type="button"
          className="icon-button"
          onClick={() => shift(1)}
          aria-label="Next week"
        >
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <div
        className="booking-week"
        role="group"
        aria-label="Choose a preferred date"
      >
        {days.map((day) => {
          const key = dateKey(day)
          const status = statusFor(key)
          const disabled = key < today || status === "unavailable"
          return (
            <button
              type="button"
              key={key}
              aria-pressed={value === key}
              aria-label={`${readableDate(key)}. ${
                disabled
                  ? key < today
                    ? "Past date, unavailable"
                    : "Unavailable date"
                  : status === "unverified"
                    ? "Date preference only. Schedule pending verification"
                    : `${
                        status === "limited"
                          ? "Limited availability"
                          : "Available"
                      }. A request still requires hospital confirmation`
              }`}
              disabled={disabled}
              className={value === key ? "selected" : ""}
              onClick={() => choose(key)}
            >
              <span>
                {new Intl.DateTimeFormat("en", { weekday: "short" }).format(
                  day,
                )}
              </span>
              <strong>{day.getDate()}</strong>
              <small>
                {key < today
                  ? "Past"
                  : value === key
                    ? "Chosen"
                    : status === "available"
                      ? "Available"
                      : status === "limited"
                        ? "Limited"
                        : status === "unavailable"
                          ? "Unavailable"
                          : "Pending"}
              </small>
            </button>
          )
        })}
      </div>
      <label className="booking-date-label" htmlFor="booking-date">
        Choose another date <span>Required</span>
      </label>
      <input
        id="booking-date"
        type="date"
        min={today}
        value={value}
        aria-invalid={!!dateError}
        aria-describedby={
          dateError ? "booking-date-error" : "booking-date-help"
        }
        onChange={(event) => {
          choose(event.target.value)
          const parsed = parseDate(event.target.value)
          if (parsed) setAnchor(startOfWeek(parsed))
        }}
      />
      <p id="booking-date-help" className="booking-field-helper">
        Dates are preferences, not verified availability. Past dates cannot be
        selected.
      </p>
      {dateError && (
        <p id="booking-date-error" className="booking-field-error">
          <Icon name="warning" size={14} />
          {dateError}
        </p>
      )}
      <div className="booking-availability-key">
        <span>Future schedule key · status examples only</span>
        <div>
          <span className="slot-status available">Available</span>
          <span className="slot-status limited">Limited availability</span>
          <span className="slot-status unavailable">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
