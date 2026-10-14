import Icon from "../Icon"

export type BookingFieldOption = {
  value: string
  label: string
}
type BookingFieldProps = {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  helper?: string
  type?: string
  required?: boolean
  error?: string
  valid?: boolean
  max?: string
  options?: BookingFieldOption[]
  multiline?: boolean
}
export default function BookingField({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  helper,
  type = "text",
  required = false,
  error,
  valid,
  max,
  options,
  multiline,
}: BookingFieldProps) {
  const id = `booking-${name}`
  const attributes = {
    id,
    name,
    value,
    required,
    onBlur,
    "aria-invalid": !!error,
    "aria-describedby": error
      ? `${id}-error`
      : helper
        ? `${id}-help`
        : undefined,
  }
  return (
    <div
      className={`booking-field ${
        error ? "has-error" : valid && value ? "is-valid" : ""
      }`}
    >
      <label htmlFor={id}>
        {label}
        <span>{required ? "Required" : "Optional"}</span>
      </label>
      {options ? (
        <select
          {...attributes}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          {...attributes}
          placeholder={placeholder}
          rows={3}
          maxLength={300}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...attributes}
          type={type}
          placeholder={placeholder}
          max={max}
          autoComplete="off"
          maxLength={150}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="booking-field-error">
          <Icon name="warning" size={14} />
          {error}
        </p>
      ) : (
        helper && (
          <p id={`${id}-help`} className="booking-field-helper">
            {helper}
          </p>
        )
      )}
      {valid && value && !error && (
        <span className="booking-field-valid">
          <Icon name="check" size={12} />
          Checked for this preview
        </span>
      )}
    </div>
  )
}
