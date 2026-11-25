import { endUserListResources, endUserPageResources, endUserRecordResources } from '../../features/end-user/services/endUserService'
import { enterpriseListResources, enterprisePageResources, enterpriseRecordResources } from '../../features/enterprise/services/enterpriseService'
import { zoneListResources, zonePageResources, zoneRecordResources } from '../../features/zone/services/zoneService'
import type { PageResult, UserRole } from '../types'
import type { Query } from '../../services/dataService'

const services: Record<UserRole, {
  lists: Record<string, (query: Query) => Promise<unknown[]>>
  pages: Record<string, (query: Query) => Promise<PageResult<unknown>>>
  records: Record<string, (id: string) => Promise<unknown>>
}> = {
  'end-user': { lists: endUserListResources, pages: endUserPageResources, records: endUserRecordResources },
  'zone-admin': { lists: zoneListResources, pages: zonePageResources, records: zoneRecordResources },
  enterprise: { lists: enterpriseListResources, pages: enterprisePageResources, records: enterpriseRecordResources },
}

export async function getResourceList<T>(resource: string, query: Query, feature: UserRole): Promise<T[]> {
  const fetch = services[feature].lists[resource]
  if (!fetch) throw new Error(`No ${feature} list service is registered for ${resource}.`)
  return await fetch(query) as T[]
}

export async function getResourcePage<T>(resource: string, query: Query, feature: UserRole): Promise<PageResult<T>> {
  const fetch = services[feature].pages[resource]
  if (!fetch) throw new Error(`No ${feature} paginated service is registered for ${resource}.`)
  return await fetch(query) as PageResult<T>
}

export async function getResourceRecord<T>(resource: string, id: string, feature: UserRole): Promise<T> {
  const fetch = services[feature].records[resource]
  if (!fetch) throw new Error(`No ${feature} record service is registered for ${resource}.`)
  return await fetch(id) as T
}
