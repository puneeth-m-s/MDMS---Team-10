export type UserRole = 'end-user' | 'zone-admin' | 'enterprise'

export type RecordStatus = 'Active' | 'Deactivated' | 'Pending' | 'Paid' | 'Overdue' | 'Critical' | 'Warning' | 'Resolved' | 'Open'

export interface Zone {
  id: string
  name: string
  location: string
  pincode: string
  description: string
  adminId: string
  adminName?: string
  meterCount?: number
  status: 'Active' | 'Deactivated'
}

export interface UserRecord {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  zoneId: string | null
  meterCount?: number
  status: 'Active' | 'Deactivated'
  joinedAt: string
}

export interface Meter {
  id: string
  ownerId: string
  ownerName: string
  zoneName?: string
  zoneId: string
  status: 'Active' | 'Deactivated'
  lastReading: number
  lastReadingAt: string
  installedDate: string
  tariffCategory: string
  address: string
}

export interface Bill {
  id: string
  userId: string
  meterId: string
  month: string
  amount: number
  dueDate: string
  status: 'Paid' | 'Pending' | 'Overdue'
  paidOn: string | null
}

export interface BillDay {
  id: string
  billId: string
  date: string
  reading: number
  consumption: number
  cost: number
}

export interface ConsumptionPoint {
  id: string
  scope: 'user' | 'zone' | 'enterprise'
  scopeId: string
  range: 'day' | 'week' | 'month' | 'year' | 'current'
  period: string
  zoneName?: string
  value: number
  previous: number
}

export interface AlertRecord {
  id: string
  zoneId: string
  zoneName?: string
  meterId: string
  title: string
  severity: 'Critical' | 'Warning'
  status: 'Open' | 'Resolved'
  createdAt: string
}

export interface NotificationRecord {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  status: 'Success' | 'Failed'
}

export interface ZoneSettings {
  id: string
  zoneId: string
  highConsumption: number
  lowConsumption: number
  abnormalFrequencyHours: number
  inactiveMeterDays: number
  emailEnabled: boolean
  smsEnabled: boolean
}

export interface EnterpriseSettings {
  id: string
  dataRetentionYears: number
  autoLogoutMinutes: number
  auditRetentionYears: number
  timeZone: string
  language: string
  currency: string
  emailEnabled: boolean
  smsEnabled: boolean
}

export interface HourlyReading {
  id: string
  meterId: string
  timestamp: string
  reading: number
  consumption: number
}

export interface Reading {
  id: string
  meterId: string
  date: string
  reading: number
  difference: number
  notes: string
}

export interface PageResult<T> {
  data: T[]
  items: number
  pages: number
  first: number | null
  prev: number | null
  next: number | null
  last: number | null
}
