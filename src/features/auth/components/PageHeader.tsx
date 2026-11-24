import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Buttons shown on the right (they stack under the title on phones). */
  actions?: ReactNode
  /** For detail pages, e.g. { to: '/user/bills', label: 'Back to bills' }. */
  back?: { to: string; label: string }
}

export default function PageHeader({ title, subtitle, actions, back }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-block text-sm font-semibold text-primary hover:underline">
            <span aria-hidden="true">←</span> {back.label}
          </Link>
        )}
        <h1 className="text-[length:clamp(22px,4vw,28px)] leading-tight font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2.5 max-sm:w-full max-sm:*:flex-[1_1_140px]">
          {actions}
        </div>
      )}
    </header>
  )
}