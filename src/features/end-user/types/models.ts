/**
 * Data contract between db.json and the UI.
 *
 * Every collection that scripts/generate-db.mjs writes has one interface here.
 * If you add or rename a field, change BOTH this file and the generator,
 * regenerate db.json, and tell the team (they share one db.json).
 *
 * Dates are ISO strings: "2026-11-24" (date) or "2026-11-24T10:30:00.000Z" (date and time).
 */

/* ---------- Shared value types ---------- */
export type IsoDate = string
export type IsoDateTime = string

export type Role = 'enterprise_admin' | 'zone_admin' | 'consumer'
export type ActiveStatus = 'active' | 'deactivated'
export type TariffCategory = 'residential' | 'commercial' | 'industrial'
export type BillStatus = 'paid' | 'pending' | 'overdue'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'open' | 'resolved'
export type AlertType =
  | 'high_consumption'
  | 'tamper_suspected'
  | 'abnormal_reading'
  | 'meter_inactive'
  | 'low_consumption'
export type NotificationType =
  | 'bill_generated'
  | 'payment_due'
  | 'payment_received'
  | 'high_consumption'
  | 'maintenance'
export type AuditStatus = 'success' | 'failed'
/** Same values as TimeRange in ChartCard.tsx. */
export type ChartRange = 'day' | 'week' | 'month' | 'year'
export type ComparisonPeriod = '4w' | '6m' | '12m'

/* ---------- Collections ---------- */
export interface Zone {
  id: string // "Z01"
  name: string
  location: string
  pincode: string
  description: string
  adminId: string // -> User (role zone_admin)
  status: ActiveStatus
}

/** One precomputed row per zone: cards, the "total meters" column and the bar chart. */
export interface ZoneSummary {
  id: string // same as zoneId
  zoneId: string
  totalMeters: number
  activeMeters: number
  totalConsumers: number
  lastMonthKwh: number
  avgKwhPerMeter: number
}

export interface NotificationPrefs {
  email: boolean
  sms: boolean
}

export interface User {
  id: string // "U-C001" consumer, "U-A01" zone admin, "U-E01" enterprise admin
  role: Role
  zoneId: string | null // null for enterprise admins
  name: string
  email: string
  phone: string
  status: ActiveStatus
  joinedOn: IsoDate
  /** Number of meters this person owns (denormalised for tables). */
  meterCount: number
  notificationPrefs: NotificationPrefs
}

/** One meter has exactly ONE owner and ONE zone (the owner's zone). */
export interface Meter {
  id: string // "MTR-1001"
  ownerId: string // -> User (role consumer)
  /** Denormalised copy of the owner's name, so tables can search and sort by owner. */
  ownerName: string
  zoneId: string // -> Zone
  address: string
  status: ActiveStatus
  tariffCategory: TariffCategory
  installedOn: IsoDate
  lastReading: number // kWh, cumulative
  lastReadingAt: IsoDateTime
}

/** Bills are generated on the 1st of every month, one per meter, for the month that just ended. */
export interface Bill {
  id: string // "INV-202610-1001"
  userId: string
  meterId: string
  zoneId: string
  month: string // "2026-10" = the month the bill covers
  units: number // kWh
  energyCharge: number // rupees
  fixedCharge: number // rupees
  amount: number // energyCharge + fixedCharge
  issuedOn: IsoDate
  dueDate: IsoDate
  status: BillStatus
  paidOn: IsoDate | null
}

/** One row per day inside a bill. Only generated for the "featured" meters. */
export interface BillDay {
  id: string
  billId: string
  date: IsoDate
  reading: number // cumulative kWh at the end of the day
  consumption: number // kWh used that day
  cost: number // rupees
}

/** Daily meter reading (last ~62 days of every meter). */
export interface Reading {
  id: string
  meterId: string
  date: IsoDate
  reading: number
  consumption: number
  note: string // "", "High consumption", "Estimated reading"
}

/** Hourly meter reading (last 7 days of the featured meters). */
export interface HourlyReading {
  id: string
  meterId: string
  date: IsoDate
  hour: number // 0..23
  reading: number
  consumption: number
}

export interface SeriesPoint {
  label: string
  value: number
}

/** Ready-made chart data for the Day / Week / Month / Year toggle. */
export interface ConsumptionSeries {
  id: string // "user-U-C001-week"
  scope: 'user' | 'zone' | 'enterprise'
  scopeId: string // user id, zone id, or "ALL" for the enterprise
  range: ChartRange
  periodLabel: string // "Yesterday", "Last 7 days", "October 2026", "Last 12 months"
  unit: 'kWh'
  points: SeriesPoint[]
}

/** Grouped bar chart: one document per zone and period. */
export interface ZoneComparison {
  id: string // "Z01-6m"
  zoneId: string
  period: ComparisonPeriod
  points: SeriesPoint[]
}

export interface Alert {
  id: string
  zoneId: string
  meterId: string
  severity: AlertSeverity
  type: AlertType
  message: string
  status: AlertStatus
  createdAt: IsoDateTime
}

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  createdAt: IsoDateTime
  read: boolean
}

export interface AuditLog {
  id: string
  timestamp: IsoDateTime
  userId: string
  userName: string
  action: string
  resource: string
  status: AuditStatus
}

export interface ZoneSettings {
  id: string // same as zoneId
  zoneId: string
  highConsumptionKwh: number // per meter per day
  lowConsumptionKwh: number
  abnormalReadingsPerDay: number
  inactiveMeterDays: number
  channels: { email: boolean; sms: boolean; push: boolean }
}

/** Single object (not a list) at /enterpriseSettings. */
export interface EnterpriseSettings {
  dataRetentionMonths: number
  policies: { autoLogoutMinutes: number; auditLogRetentionMonths: number }
  localisation: { timeZone: string; defaultLanguage: string; currency: string }
  notificationDefaults: { email: boolean; sms: boolean; push: boolean }
}

/** Single object at /demoSession. Phase 1 has no login, so this says who the role switcher "is". */
export interface DemoSession {
  consumerId: string
  consumerMeterId: string
  zoneId: string
  zoneAdminId: string
  enterpriseAdminId: string
}