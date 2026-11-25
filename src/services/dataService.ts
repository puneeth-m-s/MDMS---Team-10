import API from './http'
import type { PageResult } from '../shared/types'

export type QueryValue = string | number | boolean | undefined
export type Query = Record<string, QueryValue>

export async function getPage<T>(resource: string, query: Query = {}): Promise<PageResult<T>> {
  const response = await API.get<PageResult<T>>(`/${resource}`, { params: query })
  return response.data
}

export async function getList<T>(resource: string, query: Query = {}): Promise<T[]> {
  const response = await API.get<T[]>(`/${resource}`, { params: query })
  return response.data
}

export async function getOne<T>(resource: string, id: string): Promise<T> {
  const response = await API.get<T>(`/${resource}/${encodeURIComponent(id)}`)
  return response.data
}
