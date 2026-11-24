export interface LoaderProps {
  /** Read by screen readers; shown on screen only if showLabel is true. */
  label?: string
  showLabel?: boolean
  /** Centres the spinner in a tall area (use for whole-page loading). */
  fullPage?: boolean
  size?: number
}

/** Spinner for waiting on pages or data. */
export default function Loader({
  label = 'Loading',
  showLabel = false,
  fullPage = false,
  size = 36,
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullPage
          ? 'flex min-h-[50vh] items-center justify-center gap-3'
          : 'inline-flex items-center gap-3'
      }
    >
      <span
        className="animate-spin rounded-full border-[3px] border-line border-t-primary"
        style={{ width: size, height: size }}
      />
      <span className={showLabel ? 'font-semibold text-muted' : 'sr-only'}>{label}</span>
    </div>
  )
}

export interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
}

/** Grey pulsing block that stands in for content while data loads. */
export function Skeleton({ width = '100%', height = 16, radius, className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-line ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
    />
  )
}