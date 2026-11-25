import { getList, getOne, getPage, type Query } from '../../../services/dataService'
import type { AlertRecord, ConsumptionPoint, Meter, PageResult, Reading, UserRecord, ZoneSettings } from '../types'

export const listZoneMeters = (query: Query = {}) => getList<Meter>('meters', query)
export const pageZoneMeters = (query: Query = {}) => getPage<Meter>('meters', query)
export const getZoneMeter = (id: string) => getOne<Meter>('meters', id)
export const listZoneUsers = (query: Query = {}) => getList<UserRecord>('users', query)
export const pageZoneUsers = (query: Query = {}) => getPage<UserRecord>('users', query)
export const listZoneReadings = (query: Query = {}) => getList<Reading>('readings', query)
export const pageZoneReadings = (query: Query = {}) => getPage<Reading>('readings', query)
export const pageZoneAlerts = (query: Query = {}) => getPage<AlertRecord>('alerts', query)
export const listZoneAlerts = (query: Query = {}) => getList<AlertRecord>('alerts', query)
export const listZoneSeries = (query: Query = {}) => getList<ConsumptionPoint>('chartSeries', query)
export const getZoneSettings = (id: string) => getOne<ZoneSettings>('zoneSettings', id)

export const zonePageResources: Record<string, (query: Query) => Promise<PageResult<unknown>>> = {
  meters: (query) => pageZoneMeters(query), users: (query) => pageZoneUsers(query), readings: (query) => pageZoneReadings(query), alerts: (query) => pageZoneAlerts(query),
}
export const zoneListResources: Record<string, (query: Query) => Promise<unknown[]>> = {
  meters: listZoneMeters, users: listZoneUsers, readings: listZoneReadings, alerts: listZoneAlerts, chartSeries: listZoneSeries,
}
export const zoneRecordResources: Record<string, (id: string) => Promise<unknown>> = { meters: getZoneMeter, zoneSettings: getZoneSettings }
