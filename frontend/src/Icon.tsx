import type { ReactNode } from "react"

export type IconName =
  | "filter"
  | "lock"
  | "eye"
  | "eye-off"
  | "mail"
  | "directions"
  | "info"
  | "arrow"
  | "pin"
  | "phone"
  | "user"
  | "calendar"
  | "heart"
  | "cross"
  | "shield"
  | "building"
  | "flask"
  | "pill"
  | "scan"
  | "baby"
  | "menu"
  | "close"
  | "chevron"
  | "search"
  | "check"
  | "clock"
  | "edit"
  | "warning"
  | "printer"
  | "download"
  | "refresh"
  | "plus"
  | "x"
  | "alert-triangle"
  | "grid"
  | "x-circle"
  | "inbox"
  | "truck"

export default function Icon({
  name,
  size = 20,
}: {
  name: IconName
  size?: number
}) {
  const paths: Record<IconName, ReactNode> = {
    x: <path d="m18 6-12 12M6 6l12 12" />,
    "alert-triangle": (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
    "x-circle": (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </>
    ),
    inbox: (
      <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </>
    ),
    truck: (
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-5.28a2 2 0 0 0-.58-1.42l-3.14-3.14A2 2 0 0 0 17 6.58V18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
    plus: <path d="M5 12h14M12 5v14" />,
    printer: (
      <>
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 21v-5h-5" />
      </>
    ),
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    "eye-off": (
      <>
        <path d="m3 3 18 18M9.5 5.4A11 11 0 0 1 12 5c6 0 10 7 10 7a20 20 0 0 1-3.5 4.2M6 6.5A24 24 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5-1.2M10 10a3 3 0 0 0 4 4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    directions: (
      <>
        <path d="m12 2 10 10-10 10L2 12Z" />
        <path d="M8 16v-5h8m-3-3 3 3-3 3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7a3 3 0 0 0-4-4L5 15Z" />
      </>
    ),
    warning: (
      <>
        <path d="M10 4a2 2 0 0 1 4 0l8 15a2 2 0 0 1-2 3H4a2 2 0 0 1-2-3Z" />
        <path d="M12 8v5m0 4h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <path d="m8 3 3 5-3 3c1 3 2 4 5 5l3-3 5 3c0 4-2 5-5 5C9 20 4 15 3 8c0-3 1-5 5-5Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 5h3" />
      </>
    ),
    heart: <path d="M12 21 3 12C-3 5 6-2 12 6c6-8 15-1 9 6Z" />,
    cross: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="3" width="16" height="19" rx="1" />
        <path d="M9 22v-6h6v6M8 7h1m6 0h1M8 11h1m6 0h1" />
      </>
    ),
    flask: (
      <>
        <path d="M9 3h6m-5 0v7L4 19q-1 2 2 2h12q3 0 2-2l-6-9V3M7 15h10" />
      </>
    ),
    pill: (
      <>
        <path d="M4 20a6 6 0 0 1 0-8l8-8a6 6 0 0 1 8 8l-8 8a6 6 0 0 1-8 0Z" />
        <path d="m8 8 8 8" />
      </>
    ),
    scan: (
      <>
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M6 12h12" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    baby: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 5c-4-4 4-5 2 0M8 12h.1M16 12h.1m-7 4q3 3 6 0" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
