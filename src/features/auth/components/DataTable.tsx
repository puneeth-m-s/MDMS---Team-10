import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import EmptyState from './EmptyState'
import Pagination from './Pagination'
import type { PaginationProps } from './Pagination'
import { Skeleton } from './Loader'

/* ---------- Types ---------- */
export interface Column<T> {
  /** Field name on the row. Also sent to the server when sorting. */
  key: string
  header: string
  /** Custom cell, e.g. render={(row) => <StatusBadge status={row.status} />} */
  render?: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface RowAction<T> {
  label: string | ((row: T) => string)
  onClick: (row: T) => void
  danger?: boolean
  /** Return true to hide this action for a given row. */
  hidden?: (row: T) => boolean
}

export type SortDirection = 'asc' | 'desc'
export interface SortState {
  key: string
  direction: SortDirection
}

export interface DataTableProps<T extends object> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  /** Accessible name for the table (read by screen readers). */
  caption?: string
  loading?: boolean

  search?: { value: string; onChange: (value: string) => void; placeholder?: string }
  /** Extra filters (selects, buttons) shown next to the search box. */
  toolbar?: ReactNode

  sort?: SortState | null
  onSortChange?: (sort: SortState | null) => void

  pagination?: PaginationProps

  rowActions?: RowAction<T>[]

  selectable?: boolean
  selectedKeys?: Array<string | number>
  onSelectionChange?: (keys: Array<string | number>) => void

  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
  skeletonRows?: number
}

interface MenuState {
  key: string
  top: number
  right: number
}

/* ---------- Styling (full class names so Tailwind can see them) ---------- */
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

const TH =
  'border-b border-line bg-surface-2 px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap text-muted uppercase'

// On phones every cell becomes "label ... value", using the data-label attribute.
const TD =
  'border-b border-line px-4 py-3.5 align-middle max-sm:flex max-sm:items-center max-sm:gap-4 max-sm:border-0 max-sm:px-0 max-sm:py-1.5 max-sm:text-right max-sm:before:text-left max-sm:before:font-semibold max-sm:before:text-muted max-sm:before:content-[attr(data-label)]'

const TR_BASE =
  'max-sm:block max-sm:border-b max-sm:border-line max-sm:px-4 max-sm:py-3 max-sm:last:border-b-0 last:*:border-b-0'

function renderCell<T extends object>(col: Column<T>, row: T): ReactNode {
  if (col.render) return col.render(row)
  const value: unknown = Reflect.get(row, col.key)
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string' || typeof value === 'number') return value
  return String(value)
}

/* ---------- Component ---------- */
export default function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  search,
  toolbar,
  sort,
  onSortChange,
  pagination,
  rowActions,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  emptyTitle = 'No records found',
  emptyMessage = 'Try changing your search or filters.',
  emptyAction,
  skeletonRows,
}: DataTableProps<T>) {
  /* ----- search (debounced so we don't call the server on every key) ----- */
  const searchValue = search?.value
  const onSearchChange = search?.onChange
  const [draft, setDraft] = useState(searchValue ?? '')

  useEffect(() => {
    if (searchValue === undefined || !onSearchChange || draft === searchValue) return
    const timer = setTimeout(() => onSearchChange(draft), 300)
    return () => clearTimeout(timer)
  }, [draft, searchValue, onSearchChange])

  /* ----- sorting: asc -> desc -> none ----- */
  const cycleSort = (key: string) => {
    if (!onSortChange) return
    if (!sort || sort.key !== key) onSortChange({ key, direction: 'asc' })
    else if (sort.direction === 'asc') onSortChange({ key, direction: 'desc' })
    else onSortChange(null)
  }

  /* ----- selection ----- */
  const selectedSet = new Set(selectedKeys)
  const pageKeys = rows.map(rowKey)
  const allSelected = pageKeys.length > 0 && pageKeys.every((k) => selectedSet.has(k))
  const someSelected = pageKeys.some((k) => selectedSet.has(k))

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (allSelected) onSelectionChange(selectedKeys.filter((k) => !pageKeys.includes(k)))
    else onSelectionChange([...new Set([...selectedKeys, ...pageKeys])])
  }
  const toggleRow = (key: string | number) => {
    if (!onSelectionChange) return
    onSelectionChange(
      selectedSet.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key],
    )
  }

  /* ----- row-action menu (fixed position so the scroll area can't clip it) ----- */
  const [menu, setMenu] = useState<MenuState | null>(null)
  const hasActions = !!rowActions && rowActions.length > 0

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onDown = (e: globalThis.MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-row-menu]')) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menu])

  const actionsFor = (row: T) => (rowActions ?? []).filter((a) => !a.hidden?.(row))

  const openMenu = (e: MouseEvent<HTMLButtonElement>, key: string, count: number) => {
    if (menu?.key === key) {
      setMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const menuHeight = count * 40 + 16
    const flipUp = rect.bottom + menuHeight > window.innerHeight - 8 && rect.top > menuHeight
    setMenu({
      key,
      top: flipUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
  }

  const menuRow = menu ? rows.find((r) => String(rowKey(r)) === menu.key) : undefined
  const menuActions = menuRow ? actionsFor(menuRow) : []

  /* ----- render ----- */
  const isEmpty = !loading && rows.length === 0
  const placeholderRows = skeletonRows ?? Math.min(pagination?.pageSize ?? 5, 8)
  const showToolbar = !!search || !!toolbar || (selectable && selectedKeys.length > 0)

  return (
    <div className="min-w-0 rounded-card border border-line bg-surface shadow-card">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 max-sm:px-4 max-sm:py-3">
          {search && (
            <label className="flex h-[42px] max-w-[360px] flex-[1_1_240px] items-center gap-2 rounded-control border border-line bg-surface-2 px-3 text-muted focus-within:border-primary max-sm:max-w-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="sr-only">Search</span>
              <input
                type="search"
                value={draft}
                placeholder={search.placeholder ?? 'Search…'}
                onChange={(e) => setDraft(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted"
              />
            </label>
          )}

          {selectable && selectedKeys.length > 0 && (
            <span className="text-sm font-semibold text-primary">{selectedKeys.length} selected</span>
          )}

          {toolbar && (
            <div className="ml-auto flex flex-wrap items-center gap-2.5 max-sm:ml-0 max-sm:w-full max-sm:*:flex-[1_1_140px] [&_select]:h-[42px] [&_select]:rounded-control [&_select]:border [&_select]:border-line [&_select]:bg-surface [&_select]:px-2.5">
              {toolbar}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm max-sm:block">
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead className="max-sm:hidden">
            <tr>
              {selectable && (
                <th scope="col" className={`${TH} w-11`}>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    aria-label="Select all rows on this page"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    onChange={toggleAll}
                  />
                </th>
              )}

              {columns.map((col) => {
                const sortable = !!col.sortable && !!onSortChange
                const isSorted = sort?.key === col.key
                const ariaSort = isSorted
                  ? sort?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : sortable
                    ? 'none'
                    : undefined
                return (
                  <th key={col.key} scope="col" className={`${TH} ${ALIGN[col.align ?? 'left']}`} aria-sort={ariaSort}>
                    {sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 uppercase hover:text-fg"
                        onClick={() => cycleSort(col.key)}
                      >
                        {col.header}
                        <span className="text-[10px]" aria-hidden="true">
                          {isSorted ? (sort?.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}

              {hasActions && (
                <th scope="col" className={`${TH} w-14`}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="max-sm:block">
            {loading
              ? Array.from({ length: placeholderRows }, (_, i) => (
                  <tr key={`sk-${i}`} aria-hidden="true" className={TR_BASE}>
                    {selectable && (
                      <td className={`${TD} w-11 max-sm:w-auto max-sm:justify-start`}>
                        <Skeleton width={16} height={16} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} data-label={col.header} className={`${TD} max-sm:justify-between`}>
                        <Skeleton height={14} width="70%" className="max-sm:w-1/2" />
                      </td>
                    ))}
                    {hasActions && (
                      <td className={`${TD} w-14 max-sm:w-auto max-sm:justify-end`}>
                        <Skeleton width={28} height={28} />
                      </td>
                    )}
                  </tr>
                ))
              : rows.map((row) => {
                  const key = rowKey(row)
                  const keyStr = String(key)
                  const actions = actionsFor(row)
                  const selected = selectedSet.has(key)
                  return (
                    <tr
                      key={keyStr}
                      className={`${TR_BASE} ${selected ? 'bg-primary-soft' : 'hover:bg-surface-2'}`}
                    >
                      {selectable && (
                        <td className={`${TD} w-11 max-sm:w-auto max-sm:justify-start`}>
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            aria-label={`Select row ${keyStr}`}
                            checked={selected}
                            onChange={() => toggleRow(key)}
                          />
                        </td>
                      )}

                      {columns.map((col) => (
                        <td
                          key={col.key}
                          data-label={col.header}
                          className={`${TD} ${ALIGN[col.align ?? 'left']} max-sm:justify-between`}
                        >
                          {renderCell(col, row)}
                        </td>
                      ))}

                      {hasActions && (
                        <td className={`${TD} w-14 text-right max-sm:w-auto max-sm:justify-end`}>
                          {actions.length > 0 && (
                            <button
                              type="button"
                              className="icon-btn"
                              data-row-menu
                              aria-haspopup="menu"
                              aria-expanded={menu?.key === keyStr}
                              aria-label={`Actions for row ${keyStr}`}
                              onClick={(e) => openMenu(e, keyStr, actions.length)}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <circle cx="12" cy="5" r="1.8" />
                                <circle cx="12" cy="12" r="1.8" />
                                <circle cx="12" cy="19" r="1.8" />
                              </svg>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {isEmpty && <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />}

      {pagination && !isEmpty && (
        <div className="px-5 pb-4 max-sm:px-4">
          <Pagination {...pagination} />
        </div>
      )}

      {menu && menuRow && (
        <ul
          role="menu"
          data-row-menu
          style={{ top: menu.top, right: menu.right }}
          className="fixed z-[60] min-w-[190px] rounded-card border border-line bg-surface p-2 shadow-pop"
        >
          {menuActions.map((action, i) => (
            <li key={i} role="none">
              <button
                type="button"
                role="menuitem"
                className={`flex h-10 w-full items-center rounded-control px-3 text-left hover:bg-surface-2 ${
                  action.danger ? 'text-danger' : ''
                }`}
                onClick={() => {
                  setMenu(null)
                  action.onClick(menuRow)
                }}
              >
                {typeof action.label === 'function' ? action.label(menuRow) : action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}