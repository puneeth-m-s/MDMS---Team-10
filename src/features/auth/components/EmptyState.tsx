import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title?: string
  message?: string
  /** Replace the default icon. */
  icon?: ReactNode
  /** Optional button or link, e.g. "Clear filters". */
  action?: ReactNode
}

const DefaultIcon = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

export default function EmptyState({
  title = 'Nothing to show',
  message,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
      <span className="mb-1.5 grid size-[60px] place-items-center rounded-full border border-line bg-surface-2 text-muted">
        {icon ?? DefaultIcon}
      </span>
      <h3 className="text-[17px] font-bold">{title}</h3>
      {message && <p className="max-w-[42ch] text-muted">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}