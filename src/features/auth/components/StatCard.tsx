import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type StatTone = 'primary' | 'info' | 'warning' | 'danger'

export interface StatTrend {
  text: string
  direction: 'up' | 'down' | 'flat'
  /** Colours the trend: good = green, bad = red, neutral = grey. */
  sentiment?: 'good' | 'bad' | 'neutral'
}

export interface StatCardProps {
  label: string
  value: string | number
  /** Small helper text under the value, e.g. "Due on 10 Dec 2026". */
  hint?: ReactNode
  trend?: StatTrend
  icon?: ReactNode
  tone?: StatTone
  /** If set, a link is shown at the bottom of the card. */
  to?: string
  linkLabel?: string
  loading?: boolean
}

// Full class names in lookups so Tailwind can see them.
const ICON_TONE: Record<StatTone, string> = {
  primary: 'bg-primary-soft text-primary',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-amber-700 dark:text-warning',
  danger: 'bg-danger/15 text-danger',
}

const TREND_COLOR: Record<NonNullable<StatTrend['sentiment']>, string> = {
  good: 'text-primary',
  bad: 'text-danger',
  neutral: 'text-muted',
}

const ARROWS: Record<StatTrend['direction'], string> = {
  up: '▲',
  down: '▼',
  flat: '■',
}

export default function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = 'primary',
  to,
  linkLabel = 'View details',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <article className="card flex min-w-0 flex-col" aria-busy="true" aria-label={`${label} loading`}>
        <div className="h-3.5 w-[55%] animate-pulse rounded-md bg-line" />
        <div className="mt-3.5 h-8 w-[70%] animate-pulse rounded-md bg-line" />
        <div className="mt-3.5 h-3 w-[45%] animate-pulse rounded-md bg-line" />
      </article>
    )
  }

  return (
    <article className="card flex min-w-0 flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-muted">{label}</span>
        {icon && (
          <span
            aria-hidden="true"
            className={`grid size-[38px] shrink-0 place-items-center rounded-control ${ICON_TONE[tone]}`}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[length:clamp(24px,4vw,30px)] leading-[1.15] font-extrabold break-words">
        {value}
      </p>

      {trend && (
        <p className={`text-[13px] font-bold ${TREND_COLOR[trend.sentiment ?? 'neutral']}`}>
          <span aria-hidden="true">{ARROWS[trend.direction]}</span> {trend.text}
        </p>
      )}

      {hint && <p className="text-[13px] text-muted">{hint}</p>}

      {to && (
        <Link to={to} className="mt-2 text-[13px] font-bold text-primary hover:underline">
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  )
}