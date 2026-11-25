import { getList, getOne, getPage, type Query } from '../../../services/dataService'
import type { Bill, BillDay, Meter, NotificationRecord, PageResult, Reading, UserRecord, ConsumptionPoint } from '../types'

export const listBills = (query: Query = {}) => getList<Bill>('bills', query)
export const pageBills = (query: Query = {}) => getPage<Bill>('bills', query)
export const getBill = (id: string) => getOne<Bill>('bills', id)
export const pageBillDays = (query: Query = {}) => getPage<BillDay>('billDays', query)
export const listMeters = (query: Query = {}) => getList<Meter>('meters', query)
export const listUsers = (query: Query = {}) => getList<UserRecord>('users', query)
export const getUser = (id: string) => getOne<UserRecord>('users', id)
export const getServiceZone = (id: string) => getOne<import('../types').Zone>('zones', id)
export const listNotifications = (query: Query = {}) => getList<NotificationRecord>('notifications', query)
export const pageNotifications = (query: Query = {}) => getPage<NotificationRecord>('notifications', query)
export const pageReadings = (query: Query = {}) => getPage<Reading>('readings', query)
export const listReadings = (query: Query = {}) => getList<Reading>('readings', query)
export const listConsumptionSeries = (query: Query = {}) => getList<ConsumptionPoint>('chartSeries', query)

export const endUserPageResources: Record<string, (query: Query) => Promise<PageResult<unknown>>> = {
  bills: (query) => pageBills(query), billDays: (query) => pageBillDays(query), notifications: (query) => pageNotifications(query), readings: (query) => pageReadings(query),
}
export const endUserListResources: Record<string, (query: Query) => Promise<unknown[]>> = {
  bills: listBills, meters: listMeters, users: listUsers, notifications: listNotifications, readings: listReadings, chartSeries: listConsumptionSeries,
}
export const endUserRecordResources: Record<string, (id: string) => Promise<unknown>> = { bills: getBill, users: getUser, zones: getServiceZone }
