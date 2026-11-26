import API from './http'

/**
 * Which JSON Server is installed?  0 = 0.17.x (recommended)  |  1 = 1.0 beta
 *
 * The two versions use different query names for paging and sorting, and
 * 1.0 beta has no full-text search. Change this one number if you switch.
 *   npm ls json-server    <- shows the installed version
 */
export const JSON_SERVER_MAJOR = 0 as 0 | 1

/** Operator separator: "views_gte=5". Some newer 1.0 betas use ":" instead ("views:gte=5"). */
const OPERATOR_SEPARATOR = '_'

/** Builds a filter key such as "dueDate_gte". Operators: gte, lte, gt, lt, ne, like (0.17 only). */
export function withOperator(field: string, operator: 'gte' | 'lte' | 'gt' | 'lt' | 'ne' | 'like'): string {
  return `${field}${OPERATOR_SEPARATOR}${operator}`
}

export type FilterValue = string | number | boolean | ReadonlyArray<string | number> | null | undefined

export interface PageParams {
  /** 1-based page number. Leave out (with pageSize) to get every row. */
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  /** Text typed in a table's search box. */
  search?: string
  /** 1.0 beta only: the single field the search text is matched against (prefix match). */
  searchField?: string
  /** Exact-match filters and operator filters. Empty values are skipped. */
  filters?: Record<string, FilterValue>
}

export interface Page<T> {
  items: T[]
  /** Total rows on the server for this query (not just this page). */
  total: number
}

interface PagedEnvelope<T> {
  items: number
  data: T[]
}

function toQuery(params: PageParams): Record<string, unknown> {
  const query: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params.filters ?? {})) {
    if (value === undefined || value === null || value === '') continue
    query[key] = value
  }

  if (params.page !== undefined) query._page = params.page
  if (params.pageSize !== undefined) {
    query[JSON_SERVER_MAJOR === 1 ? '_per_page' : '_limit'] = params.pageSize
  }

  if (params.sortBy) {
    if (JSON_SERVER_MAJOR === 1) {
      query._sort = params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy
    } else {
      query._sort = params.sortBy
      query._order = params.sortOrder ?? 'asc'
    }
  }

  const search = params.search?.trim()
  if (search) {
    if (JSON_SERVER_MAJOR === 1) {
      const field = params.searchField ?? 'id'
      query[withOperator(field, 'gte')] = search
      query[withOperator(field, 'lte')] = `${search}\uffff`
    } else {
      query.q = search
    }
  }

  return query
}

/** One page of a list, plus the total number of rows. Use this for every table. */
export async function fetchPage<T>(url: string, params: PageParams = {}): Promise<Page<T>> {
  const res = await API.get<T[] | PagedEnvelope<T>>(url, { params: toQuery(params) })
  const body = res.data

  if (Array.isArray(body)) {
    // 0.17: the rows are the body, the total is in a header.
    const header: unknown = res.headers['x-total-count']
    const total = Number(header)
    return { items: body, total: Number.isFinite(total) ? total : body.length }
  }
  // 1.0 beta: { data: [...], items: <total>, pages, next, ... }
  return { items: body.data, total: body.items }
}

/** A whole (small) list without paging, e.g. the 5 zones or one customer's 12 bills. */
export async function fetchList<T>(url: string, params: Omit<PageParams, 'page' | 'pageSize'> = {}): Promise<T[]> {
  const res = await API.get<T[] | PagedEnvelope<T>>(url, { params: toQuery(params) })
  return Array.isArray(res.data) ? res.data : res.data.data
}

/** A single record or a single-object resource, e.g. fetchOne<Zone>("/zones/Z01"). */
export async function fetchOne<T>(url: string): Promise<T> {
  const res = await API.get<T>(url)
  return res.data
}

/** How many rows match? Asks for one row and reads the total, so almost no data is sent. */
export async function countOf(url: string, filters: Record<string, FilterValue> = {}): Promise<number> {
  const page = await fetchPage<unknown>(url, { page: 1, pageSize: 1, filters })
  return page.total
}