import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react"

// Small local primitives extend the existing ORHIMS CSS foundation.
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={className} {...props} />
}
export function Heading({
  level = 2,
  children,
  className = "",
}: {
  level?: 1 | 2 | 3
  children: ReactNode
  className?: string
}) {
  const Tag = level === 1 ? "h1" : level === 3 ? "h3" : "h2"
  return <Tag className={className}>{children}</Tag>
}
export function Text({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={className}>{children}</p>
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />
}
export function Link({
  href,
  children,
  className = "",
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
