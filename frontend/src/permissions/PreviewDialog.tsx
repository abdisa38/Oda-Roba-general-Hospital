import { useEffect, useRef, type ReactNode } from "react"
import Icon from "../Icon"
import { Button, Heading } from "./ui"

export default function PreviewDialog({
  title,
  children,
  onClose,
  wide = false,
  className = "",
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.showModal()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`permission-dialog${
        wide ? " permission-drawer-dialog" : ""
      } ${className}`}
      aria-labelledby="permission-dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          const isInDialog =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          if (!isInDialog) {
            onClose()
          }
        }
      }}
      style={
        wide
          ? undefined
          : {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              margin: 0,
            }
      }
    >
      <div className="permission-dialog-heading">
        <Heading level={2} className="permission-dialog-title">
          {title}
        </Heading>
        <Button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </Button>
      </div>
      <div id="permission-dialog-title" className="permission-sr-only">
        {title}
      </div>
      {children}
    </dialog>
  )
}
