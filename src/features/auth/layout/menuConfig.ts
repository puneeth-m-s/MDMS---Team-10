export type UserRole = 'user' | 'zone' | 'enterprise'

export type MenuIconName =
  | 'dashboard'
  | 'bills'
  | 'meterData'
  | 'alerts'
  | 'zones'
  | 'meters'
  | 'users'
  | 'reports'
  | 'audit'
  | 'settings'

export interface MenuItem {
  label: string
  path: string
  icon: MenuIconName
}

export interface RoleMeta {
  label: string
  /** Static demo identity shown in the profile menu (no real login in Phase 1). */
  displayName: string
  email: string
  home: string
  menu: MenuItem[]
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  user: {
    label: 'End-user',
    displayName: 'Demo Consumer',
    email: 'consumer@mdms.in',
    home: '/user/dashboard',
    menu: [
      { label: 'Dashboard', path: '/user/dashboard', icon: 'dashboard' },
      { label: 'Bills & Payments', path: '/user/bills', icon: 'bills' },
      { label: 'Meter Data', path: '/user/meter-data', icon: 'meterData' },
      { label: 'Alerts', path: '/user/alerts', icon: 'alerts' },
    ],
  },
  zone: {
    label: 'Zone admin',
    displayName: 'Demo Zone Admin',
    email: 'zone.admin@mdms.in',
    home: '/zone/dashboard',
    menu: [
      { label: 'Dashboard', path: '/zone/dashboard', icon: 'dashboard' },
      { label: 'Meter Management', path: '/zone/meters', icon: 'meters' },
      { label: 'User Management', path: '/zone/users', icon: 'users' },
      { label: 'Reports & Analytics', path: '/zone/reports', icon: 'reports' },
      { label: 'Alerts', path: '/zone/alerts', icon: 'alerts' },
      { label: 'Settings', path: '/zone/settings', icon: 'settings' },
    ],
  },
  enterprise: {
    label: 'Enterprise',
    displayName: 'Demo Enterprise Admin',
    email: 'enterprise@mdms.in',
    home: '/enterprise/dashboard',
    menu: [
      { label: 'Dashboard', path: '/enterprise/dashboard', icon: 'dashboard' },
      { label: 'Zone Management', path: '/enterprise/zones', icon: 'zones' },
      { label: 'Meter Management', path: '/enterprise/meters', icon: 'meters' },
      { label: 'User & Role Management', path: '/enterprise/users', icon: 'users' },
      { label: 'Reports & Analytics', path: '/enterprise/reports', icon: 'reports' },
      { label: 'Alerts', path: '/enterprise/alerts', icon: 'alerts' },
      { label: 'Audit Logs', path: '/enterprise/audit-logs', icon: 'audit' },
      { label: 'Settings', path: '/enterprise/settings', icon: 'settings' },
    ],
  },
}

/** Figures out the role from the URL prefix: /user/*, /zone/*, /enterprise/* */
export function getRoleFromPath(pathname: string): UserRole | null {
  const first = pathname.split('/')[1]
  return first === 'user' || first === 'zone' || first === 'enterprise'
    ? first
    : null
}