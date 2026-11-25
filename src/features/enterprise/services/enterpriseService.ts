import { getList, getOne, getPage, type Query } from '../../../services/dataService'
import type { AlertRecord, AuditLog, ConsumptionPoint, EnterpriseSettings, Meter, PageResult, UserRecord, Zone } from '../types'

export const listZones = (query: Query = {}) => getList<Zone>('zones', query)
export const pageZones = (query: Query = {}) => getPage<Zone>('zones', query)
export const getZone = (id: string) => getOne<Zone>('zones', id)
export const listEnterpriseMeters = (query: Query = {}) => getList<Meter>('meters', query)
export const pageEnterpriseMeters = (query: Query = {}) => getPage<Meter>('meters', query)
export const listEnterpriseUsers = (query: Query = {}) => getList<UserRecord>('users', query)
export const pageEnterpriseUsers = (query: Query = {}) => getPage<UserRecord>('users', query)
export const listEnterpriseAlerts = (query: Query = {}) => getList<AlertRecord>('alerts', query)
export const pageEnterpriseAlerts = (query: Query = {}) => getPage<AlertRecord>('alerts', query)
export const pageAuditLogs = (query: Query = {}) => getPage<AuditLog>('auditLogs', query)
export const listAuditLogs = (query: Query = {}) => getList<AuditLog>('auditLogs', query)
export const listEnterpriseSeries = (query: Query = {}) => getList<ConsumptionPoint>('chartSeries', query)
export const pageEnterpriseSeries = (query: Query = {}) => getPage<ConsumptionPoint>('chartSeries', query)
export const getEnterpriseSettings = (id: string) => getOne<EnterpriseSettings>('enterpriseSettings', id)

export const enterprisePageResources: Record<string, (query: Query) => Promise<PageResult<unknown>>> = {
  zones: (query) => pageZones(query), meters: (query) => pageEnterpriseMeters(query), users: (query) => pageEnterpriseUsers(query), alerts: (query) => pageEnterpriseAlerts(query), auditLogs: (query) => pageAuditLogs(query), chartSeries: (query) => pageEnterpriseSeries(query),
}
export const enterpriseListResources: Record<string, (query: Query) => Promise<unknown[]>> = {
  zones: listZones, meters: listEnterpriseMeters, users: listEnterpriseUsers, alerts: listEnterpriseAlerts, auditLogs: listAuditLogs, chartSeries: listEnterpriseSeries,
}
export const enterpriseRecordResources: Record<string, (id: string) => Promise<unknown>> = { zones: getZone, enterpriseSettings: getEnterpriseSettings }
