import { useEffect, type ReactNode } from "react"

type PageReadyProps = {
  children: ReactNode
  visit: number
}
export default function PageReady({ children, visit }: PageReadyProps) {
  // Run navigation after the lazy page commits, rather than racing its download.
  useEffect(() => {
    const section = window.location.hash.slice(1)
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "instant"
      : "smooth"
    if (section) document.getElementById(section)?.scrollIntoView({ behavior })
    else if (visit > 0) {
      window.scrollTo({ top: 0, behavior })
      if (!document.querySelector("dialog[open]"))
        document.getElementById("main")?.focus({ preventScroll: true })
    }
  }, [visit])
  return <>{children}</>
}
