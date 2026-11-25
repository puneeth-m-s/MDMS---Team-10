import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import { AppLayout } from '../shared/layout/AppLayout'
import { Loader } from '../shared/components/ui'
import type { UserRole } from '../shared/types'

const LoginPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.LoginPage })))
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.ResetPasswordPage })))
const EndUserDashboard = lazy(() => import('../features/end-user/pages/Pages').then((module) => ({ default: module.DashboardPage })))
const BillsPage = lazy(() => import('../features/end-user/pages/Pages').then((module) => ({ default: module.BillsPage })))
const BillDetailPage = lazy(() => import('../features/end-user/pages/Pages').then((module) => ({ default: module.BillDetailPage })))
const MeterDataPage = lazy(() => import('../features/end-user/pages/Pages').then((module) => ({ default: module.MeterDataPage })))
const UserAlertsPage = lazy(() => import('../features/end-user/pages/Pages').then((module) => ({ default: module.AlertsPage })))
const ZoneDashboard = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.DashboardPage })))
const ZoneMeters = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.MetersPage })))
const ZoneMeterDetail = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.MeterDetailPage })))
const ZoneUsers = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.UsersPage })))
const ZoneReports = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.ReportsPage })))
const ZoneAlerts = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.AlertsPage })))
const ZoneSettings = lazy(() => import('../features/zone/pages/Pages').then((module) => ({ default: module.SettingsPage })))
const EnterpriseDashboard = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.DashboardPage })))
const EnterpriseZones = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.ZonesPage })))
const EnterpriseZoneDetail = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.ZoneDetailPage })))
const EnterpriseMeters = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.MetersPage })))
const EnterpriseUsers = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.UsersPage })))
const EnterpriseReports = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.ReportsPage })))
const EnterpriseAlerts = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.AlertsPage })))
const AuditLogs = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.AuditLogsPage })))
const EnterpriseSettings = lazy(() => import('../features/enterprise/pages/Pages').then((module) => ({ default: module.SettingsPage })))
const MaintenancePage = lazy(() => import('../shared/pages/SharedPages').then((module) => ({ default: module.MaintenancePage })))
const AccessDeniedPage = lazy(() => import('../shared/pages/SharedPages').then((module) => ({ default: module.AccessDeniedPage })))
const ProfilePage = lazy(() => import('../shared/pages/SharedPages').then((module) => ({ default: module.ProfilePage })))
const NotFoundPage = lazy(() => import('../shared/pages/SharedPages').then((module) => ({ default: module.NotFoundPage })))
const ErrorPage = lazy(() => import('../shared/pages/SharedPages').then((module) => ({ default: module.ErrorPage })))

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="route-loader"><Loader label="Opening page" /></div>}>{children}</Suspense>
}

type LazyPageComponent = LazyExoticComponent<ComponentType>
const lazyElement = (Page: LazyPageComponent) => <LazyPage><Page /></LazyPage>
function CurrentRoleLayout() {
  const role = (window.localStorage.getItem('mdms-role') as UserRole | null) ?? 'end-user'
  return <AppLayout role={role} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: lazyElement(ErrorPage),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: lazyElement(LoginPage) },
      { path: 'forgot-password', element: lazyElement(ForgotPasswordPage) },
      { path: 'reset-password/:token', element: lazyElement(ResetPasswordPage) },
      { path: 'maintenance', element: lazyElement(MaintenancePage) },
      { path: 'access-denied', element: lazyElement(AccessDeniedPage) },
      { path: 'profile', element: <CurrentRoleLayout />, children: [{ index: true, element: lazyElement(ProfilePage) }] },
      { path: 'user', element: <AppLayout role="end-user" />, children: [
        { path: 'dashboard', element: lazyElement(EndUserDashboard) },
        { path: 'bills', element: lazyElement(BillsPage) },
        { path: 'bills/:billId', element: lazyElement(BillDetailPage) },
        { path: 'meter-data', element: lazyElement(MeterDataPage) },
        { path: 'alerts', element: lazyElement(UserAlertsPage) },
        { path: '*', element: lazyElement(NotFoundPage) },
      ] },
      { path: 'zone', element: <AppLayout role="zone-admin" />, children: [
        { path: 'dashboard', element: lazyElement(ZoneDashboard) },
        { path: 'meters', element: lazyElement(ZoneMeters) },
        { path: 'meters/:meterId', element: lazyElement(ZoneMeterDetail) },
        { path: 'users', element: lazyElement(ZoneUsers) },
        { path: 'reports', element: lazyElement(ZoneReports) },
        { path: 'alerts', element: lazyElement(ZoneAlerts) },
        { path: 'settings', element: lazyElement(ZoneSettings) },
        { path: '*', element: lazyElement(NotFoundPage) },
      ] },
      { path: 'enterprise', element: <AppLayout role="enterprise" />, children: [
        { path: 'dashboard', element: lazyElement(EnterpriseDashboard) },
        { path: 'zones', element: lazyElement(EnterpriseZones) },
        { path: 'zones/:zoneId', element: lazyElement(EnterpriseZoneDetail) },
        { path: 'meters', element: lazyElement(EnterpriseMeters) },
        { path: 'users', element: lazyElement(EnterpriseUsers) },
        { path: 'reports', element: lazyElement(EnterpriseReports) },
        { path: 'alerts', element: lazyElement(EnterpriseAlerts) },
        { path: 'audit-logs', element: lazyElement(AuditLogs) },
        { path: 'settings', element: lazyElement(EnterpriseSettings) },
        { path: '*', element: lazyElement(NotFoundPage) },
      ] },
      { path: '*', element: lazyElement(NotFoundPage) },
    ],
  },
])
