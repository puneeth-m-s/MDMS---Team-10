import type { CSSProperties, ReactNode } from 'react'

export type TimeRange = 'day' | 'week' | 'month' | 'year'

const RANGE_LABELS: Record<TimeRange, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
}

const ALL_RANGES: readonly TimeRange[] = ['day', 'week', 'month', 'year']

/* ---------- TimeRangeToggle ---------- */
export interface TimeRangeToggleProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  /** Which options to show. The zone dashboard uses ['week', 'month']. */
  options?: readonly TimeRange[]
  label?: string
}

export function TimeRangeToggle({
  value,
  onChange,
  options = ALL_RANGES,
  label = 'Time range',
}: TimeRangeToggleProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex gap-0.5 rounded-control border border-line bg-surface-2 p-[3px]"
    >
      {options.map((range) => {
        const active = range === value
        return (
          <button
            key={range}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={`h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${
              active ? 'bg-surface text-primary shadow-card' : 'text-muted hover:text-fg'
            }`}
          >
            {RANGE_LABELS[range]}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- ChartCard ---------- */
export interface ChartCardProps {
  title: string
  subtitle?: string
  /** Pass both `range` and `onRangeChange` to show the toggle. */
  range?: TimeRange
  onRangeChange?: (range: TimeRange) => void
  rangeOptions?: readonly TimeRange[]
  /** Extra controls next to the toggle (a select, an Export button...). */
  actions?: ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  /** Chart height in px on larger screens; it is capped at 260px on phones. */
  height?: number
  children: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  range,
  onRangeChange,
  rangeOptions,
  actions,
  loading = false,
  empty = false,
  emptyMessage = 'No data available for this period.',
  height = 320,
  children,
}: ChartCardProps) {
  const bodyStyle = { '--chart-h': `${height}px` } as CSSProperties

  return (
    <section className="card" aria-busy={loading}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {actions}
          {range && onRangeChange && (
            <TimeRangeToggle value={range} onChange={onRangeChange} options={rangeOptions} />
          )}
        </div>
      </div>

      {/* Charts (Recharts) need a parent with a fixed height. */}
      <div className="relative h-[min(var(--chart-h),260px)] min-w-0 sm:h-(--chart-h)" style={bodyStyle}>
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-line" />
        ) : empty ? (
          <p className="grid h-full place-items-center text-center text-muted">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}