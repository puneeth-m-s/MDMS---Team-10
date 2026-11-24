export interface PaginationProps {
  /** Current page, starting at 1. */
  page: number
  pageSize: number
  /** Total number of records on the server (not just the current page). */
  total: number
  onPageChange: (page: number) => void
  /** Pass this to show the "rows per page" selector. */
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: readonly number[]
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  let start = Math.max(2, current - 1)
  let end = Math.min(total - 1, current + 1)
  if (current <= 3) {
    start = 2
    end = 4
  }
  if (current >= total - 2) {
    start = total - 3
    end = total - 1
  }

  const items: PageItem[] = [1]
  if (start > 2) items.push('ellipsis-start')
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < total - 1) items.push('ellipsis-end')
  items.push(total)
  return items
}

const BTN_BASE =
  'inline-grid h-9 min-w-9 place-items-center rounded-lg border px-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const BTN_IDLE = 'border-line bg-surface enabled:hover:bg-surface-2'
const BTN_ACTIVE = 'border-primary bg-primary text-on-primary'

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  if (total <= 0) return null

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(page, 1), totalPages)
  const from = (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4 max-sm:justify-center"
    >
      <p className="text-sm text-muted">
        Showing <strong className="text-fg">{from}–{to}</strong> of{' '}
        <strong className="text-fg">{total}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {onPageSizeChange && (
          <label className="mr-2 inline-flex items-center gap-2 text-sm text-muted">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-9 rounded-lg border border-line bg-surface px-2 text-fg"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className={`${BTN_BASE} ${BTN_IDLE}`}
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Full page numbers on larger screens */}
        <div className="flex items-center gap-1.5 max-sm:hidden">
          {getPageItems(current, totalPages).map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                className={`${BTN_BASE} ${item === current ? BTN_ACTIVE : BTN_IDLE}`}
                onClick={() => onPageChange(item)}
                aria-current={item === current ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-muted" aria-hidden="true">…</span>
            ),
          )}
        </div>

        {/* Compact text on phones */}
        <span className="hidden px-2 text-sm text-muted max-sm:inline">
          Page {current} of {totalPages}
        </span>

        <button
          type="button"
          className={`${BTN_BASE} ${BTN_IDLE}`}
          onClick={() => onPageChange(current + 1)}
          disabled={current >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  )
}