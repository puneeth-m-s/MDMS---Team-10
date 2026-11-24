type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

/** Every status the app can show. Use these exact lowercase values in db.json. */
export type BadgeStatus =
  | 'active'
  | 'deactivated'
  | 'inactive'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'critical'
  | 'warning'
  | 'info'
  | 'open'
  | 'resolved'
  | 'success'
  | 'failed'

interface StatusConfig {
  label: string
  tone: Tone
}

const STATUS_CONFIG: Record<BadgeStatus, StatusConfig> = {
  active: { label: 'Active', tone: 'success' },
  deactivated: { label: 'Deactivated', tone: 'neutral' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
  critical: { label: 'Critical', tone: 'danger' },
  warning: { label: 'Warning', tone: 'warning' },
  info: { label: 'Info', tone: 'info' },
  open: { label: 'Open', tone: 'info' },
  resolved: { label: 'Resolved', tone: 'success' },
  success: { label: 'Success', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
}

// Full class names in a lookup so Tailwind can see them.
const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-primary-soft text-primary',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-amber-700 dark:text-warning',
  info: 'bg-info/15 text-info',
  neutral: 'border-line bg-surface-2 text-muted',
}

export interface StatusBadgeProps {
  status: BadgeStatus
  /** Optional text override, e.g. "Paid on 5 Nov". */
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  // The fallback protects the UI if the data ever contains an unexpected value.
  const config: StatusConfig = STATUS_CONFIG[status] ?? { label: String(status), tone: 'neutral' }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-[3px] text-xs font-bold whitespace-nowrap ${TONE_CLASSES[config.tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? config.label}
    </span>
  )
}