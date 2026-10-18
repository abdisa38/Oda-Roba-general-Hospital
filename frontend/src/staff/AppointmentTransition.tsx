import { useEffect, useRef } from "react"
import Icon from "../Icon"
import type { MedicalProfessional } from "../staffData"

type TransitionProps = {
  isOpen: boolean
  doctor: MedicalProfessional | null
  onClose: () => void
  onChooseDoctor: () => void
  onContact: () => void
}
export default function AppointmentTransition({
  isOpen,
  doctor,
  onClose,
  onChooseDoctor,
  onContact,
}: TransitionProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = (document.activeElement as HTMLElement)
      ref.current?.showModal()
      const oldOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = oldOverflow
      }
    }
    ref.current?.close()
    previousFocus.current?.focus()
  }, [isOpen])
  return (
    <dialog
      ref={ref}
      className="staff-booking-dialog"
      aria-labelledby="staff-booking-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        className="dialog-close icon-button"
        onClick={onClose}
        aria-label="Close appointment pathway"
      >
        <Icon name="close" />
      </button>
      <div className="eyebrow">YOUR NEXT STEP</div>
      <h2 id="staff-booking-title">Your appointment journey.</h2>
      <p>
        Schedule your consultation with our verified clinical specialists in Bale Robe.
      </p>
      <div className="staff-booking-selection">
        <Icon name="user" size={25} />
        <div>
          <span>
            {doctor
              ? "CHOSEN SPECIALIST"
              : "START WITH YOUR CARE PREFERENCE"}
          </span>
          <strong>
            {doctor
              ? doctor.name
              : "Choose a doctor or ask the hospital for guidance."}
          </strong>
          {doctor && <small>{doctor.specialty}</small>}
        </div>
      </div>
      <ol className="staff-booking-steps">
        {[
          [
            "Choose doctor",
            doctor
              ? "Your profile preference is shown above."
              : "Find a professional or ask for guidance.",
          ],
          ["Choose date", "Select a preferred date in the connected system."],
          ["Choose time", "Only verified appointment slots will be shown."],
          ["Patient information", "Share your details securely, with consent."],
          [
            "Confirm request",
            "The hospital confirms availability and next steps.",
          ],
        ].map(([title, text], i) => (
          <li key={title}>
            <span>0{i + 1}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="notice">
        <strong>Booking integration pending</strong>
        <p>
          Doctor eligibility and schedules must be verified before real requests
          are accepted. For urgent care, do not wait for an online response.
        </p>
      </div>
      <div className="staff-booking-actions">
        {doctor ? (
          <button className="button" onClick={onClose}>
            Done
            <Icon name="arrow" size={16} />
          </button>
        ) : (
          <button className="button" onClick={onChooseDoctor}>
            Choose a professional
            <Icon name="arrow" size={16} />
          </button>
        )}
        <button className="text-link" onClick={onContact}>
          Ask about availability
          <Icon name="arrow" size={15} />
        </button>
      </div>
    </dialog>
  )
}
