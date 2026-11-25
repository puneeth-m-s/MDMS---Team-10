import { useContext, useEffect, useState, type ReactNode } from 'react'
import type { Query } from '../../services/dataService'
import { getResourcePage } from '../services/resourceRegistry'
import type { PageResult } from '../types'
import { EmptyState, Pagination, Skeleton } from './ui'
import { ServiceFeatureContext } from '../services/ServiceFeatureContext'

export interface TableColumn<T> {
  key: keyof T | string
  title: string
  render?: (row: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  resource: string
  columns: TableColumn<T>[]
  searchField?: string
  searchLabel?: string
  filterField?: string
  filterOptions?: string[]
  filterLabels?: Record<string, string>
  sortField?: string
  rowAction?: (row: T) => ReactNode
  baseQuery?: Query
  selectable?: boolean
  onSelectionChange?: (ids: string[]) => void
}

export function DataTable<T extends { id: string }>({ resource, columns, searchField, searchLabel = 'Search', filterField, filterOptions, filterLabels = {}, sortField, rowAction, baseQuery = {}, selectable = false, onSelectionChange }: DataTableProps<T>) {
  const feature = useContext(ServiceFeatureContext)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState(sortField ?? '')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [result, setResult] = useState<PageResult<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const baseQueryKey = JSON.stringify(baseQuery)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      const query: Query = { ...(JSON.parse(baseQueryKey) as Query), _page: page, _per_page: 8 }
      if (sort) query._sort = sort
      if (search.trim() && searchField) query[`${searchField}:contains`] = search.trim()
      if (filter && filterField) query[filterField] = filter
      getResourcePage<T>(resource, query, feature).then((data) => { if (active) setResult(data) }).catch(() => { if (active) setError('Could not load this data. Check that JSON Server is running.') }).finally(() => { if (active) setLoading(false) })
    }, 180)
    return () => { active = false; window.clearTimeout(timer) }
  }, [resource, page, search, filter, sort, searchField, filterField, baseQueryKey, feature])

  const changeSort = (field: string) => { setSort((current) => current === field ? `-${field}` : field); setPage(1) }
  const rows = result?.data ?? []
  const totalPages = result?.pages ?? 0
  const visibleIds = rows.map((row) => row.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
  const updateSelection = (ids: string[]) => { setSelectedIds(ids); onSelectionChange?.(ids) }
  const selectVisible = (checked: boolean) => updateSelection(checked ? [...new Set([...selectedIds, ...visibleIds])] : selectedIds.filter((id) => !visibleIds.includes(id)))

  useEffect(() => { setPage(1) }, [resource, baseQueryKey])

  return <section className="table-card">
    <div className="table-tools">
      {searchField && <label className="search-control"><span aria-hidden="true">Search</span><input aria-label={searchLabel} placeholder={searchLabel} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>}
      {filterField && filterOptions && <label className="filter-control"><span>Filter</span><select aria-label={`Filter by ${filterField}`} value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }}><option value="">All</option>{filterOptions.map((option) => <option value={option} key={option}>{filterLabels[option] ?? option}</option>)}</select></label>}
    </div>
    {loading ? <div className="table-loading"><Skeleton rows={5} /></div> : error ? <EmptyState title="Could not load data" message={error} /> : rows.length === 0 ? <EmptyState /> : <>
      <div className="table-scroll"><table><thead><tr>{selectable && <th><input type="checkbox" aria-label="Select current page" checked={allVisibleSelected} onChange={(event) => selectVisible(event.target.checked)} /></th>}{columns.map((column) => <th key={String(column.key)}>{column.sortable ? <button type="button" className="sort-button" onClick={() => changeSort(String(column.key))}>{column.title}<span>{sort === column.key ? ' ↑' : sort === `-${String(column.key)}` ? ' ↓' : ' ↕'}</span></button> : column.title}</th>)}{rowAction && <th>Actions</th>}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}>{selectable && <td><input type="checkbox" aria-label={`Select ${row.id}`} checked={selectedIds.includes(row.id)} onChange={(event) => updateSelection(event.target.checked ? [...selectedIds, row.id] : selectedIds.filter((id) => id !== row.id))} /></td>}{columns.map((column) => <td key={String(column.key)}>{column.render ? column.render(row) : String(row[column.key as keyof T] ?? '—')}</td>)}{rowAction && <td>{rowAction(row)}</td>}</tr>)}</tbody>
      </table></div>
      <Pagination page={page} pages={totalPages} hasNext={Boolean(result?.next)} onPrevious={() => setPage(page - 1)} onNext={() => setPage(page + 1)} />
    </>}
  </section>
}
