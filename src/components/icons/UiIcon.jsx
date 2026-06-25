// src/components/icons/UiIcon.jsx
// Conjunto único de ícones de interface (traço, herdam currentColor).
// Substitui os emojis por uma linguagem visual consistente e profissional.

const P = {
  home: <path d="M3 11.2 12 4l9 7.2M5 9.8V20h5v-5h4v5h5V9.8" />,
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14.5V17h6v-2.5M8 20h8M10 17v3M14 17v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  forum: (
    <>
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v4A2.5 2.5 0 0 1 14.5 13H8l-3 3v-3H5.5A2.5 2.5 0 0 1 3 10.5Z" />
      <path d="M17 8.5h1.5A2.5 2.5 0 0 1 21 11v4a2.5 2.5 0 0 1-2.5 2.5H18v3l-3-3h-3" />
    </>
  ),
  flame: <path d="M12 3c1 3-1 4-1 6a2.5 2.5 0 0 0 5 .2c1.5 1.4 2.5 3.2 2.5 5.3A6.5 6.5 0 0 1 5.5 14c0-2.3 1.4-4 2.6-5.2C9.6 7.4 11 6 12 3Z" />,
  bolt: <path d="M13 3 5 13h5l-1 8 8-11h-5l1-7Z" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  play: <path d="M7 5v14l12-7Z" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  send: <path d="M5 12 21 4l-6 16-3.5-6.5L5 12Z" />,
  arrowRight: <path d="M4 12h15m0 0-6-6m6 6-6 6" />,
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1.5 6 5-2.5 5 2.5-1.5-6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10m0 0-4-4m4 4-4 4" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: <path d="M3 3l18 18M10.6 6.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4M6.2 7.4C3.7 9 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  sparkles: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8Z" />,
  medal: <><circle cx="12" cy="15" r="6" /><path d="M9 9L6 3M15 9l3-6M9.5 15l1.5 1.5 3-3.5" /></>,
  thumbsUp: <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 18 20H7" />,
  thumbsDown: <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Zm0 0-4 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7 4h10" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  layers: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" />,
  book: <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Zm12 0h2v16M5 4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2" />,
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6" />
    </>
  ),
  install: <path d="M12 3v9m0 0 3.5-3.5M12 12 8.5 8.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  message: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  pin: <path d="M9 4h6l-1 2 1 5 2 1.5V14H8v-1.5L10 11l-1-5-1-2ZM12 14v6" />,
  fire: <path d="M12 3c1 3-1 4-1 6a2.5 2.5 0 0 0 5 .2c1.5 1.4 2.5 3.2 2.5 5.3A6.5 6.5 0 0 1 5.5 14c0-2.3 1.4-4 2.6-5.2C9.6 7.4 11 6 12 3Z" />,
  grid: <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />,
  edit: <path d="M4 20h4l10-10-4-4L4 16v4ZM14 6l4 4" />,
  refresh: <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17" />
    </>
  ),
}

export default function UiIcon({ name, size = 22, strokeWidth = 1.8, className = '', ...rest }) {
  const path = P[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  )
}
