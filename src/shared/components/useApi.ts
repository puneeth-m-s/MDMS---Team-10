import { useContext, useEffect, useState } from 'react'
import type { Query } from '../../services/dataService'
import { getResourceList, getResourceRecord, getResourcePage } from '../services/resourceRegistry'
import { ServiceFeatureContext } from '../services/ServiceFeatureContext'

export function useApiList<T>(resource: string, query: Query = {}) {
  const feature = useContext(ServiceFeatureContext)
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const queryKey = JSON.stringify(query)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getResourceList<T>(resource, JSON.parse(queryKey) as Query, feature).then((rows) => { if (active) setData(rows) }).catch(() => { if (active) setError('Data could not be loaded. Start JSON Server and try again.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [resource, queryKey, feature])
  return { data, loading, error }
}

export function useApiRecord<T>(resource: string, id: string) {
  const feature = useContext(ServiceFeatureContext)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true)
    getResourceRecord<T>(resource, id, feature).then((record) => { if (active) setData(record) }).catch(() => { if (active) setError('This record could not be found.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [resource, id, feature])
  return { data, loading, error }
}

export function useCount(resource: string, query: Query = {}) {
  const feature = useContext(ServiceFeatureContext)
  const [count, setCount] = useState(0)
  useEffect(() => {
    let active = true
    getResourcePage<unknown>(resource, { ...query, _page: 1, _per_page: 1 }, feature).then((page) => { if (active) setCount(page.items) }).catch(() => { if (active) setCount(0) })
    return () => { active = false }
  }, [resource, JSON.stringify(query), feature])
  return count
}
