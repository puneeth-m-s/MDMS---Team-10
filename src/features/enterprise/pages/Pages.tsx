import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable, type TableColumn } from '../../../shared/components/DataTable'
import { useApiList, useApiRecord, useCount } from '../../../shared/components/useApi'
import { ChartCard, ConfirmDialog, EmptyState, Loader, Modal, PageHeader, RowActionMenu, SelectInput, StatCard, StatusBadge, Tabs, TextInput, Toast, Toggle } from '../../../shared/components/ui'
import type { AlertRecord, AuditLog, ConsumptionPoint, EnterpriseSettings, Meter, UserRecord, Zone } from '../types'

const zoneOptions = [{ label: 'All zones', value: '' }, { label: 'Mangalore', value: 'zone-mangalore' }, { label: 'Udupi', value: 'zone-udupi' }, { label: 'Surathkal', value: 'zone-surathkal' }, { label: 'Mulki', value: 'zone-mulki' }]

export function DashboardPage() {
  const zones = useCount('zones')
  const meters = useCount('meters')
  const critical = useCount('alerts', { severity: 'Critical', status: 'Open' })
  const { data: chart } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'enterprise', scopeId: 'all', range: 'current' })
  const { data: alerts } = useApiList<AlertRecord>('alerts', { severity: 'Critical', _sort: '-createdAt' })
  return <><PageHeader title="Enterprise overview" subtitle="A clear view across every service zone." /><div className="stat-grid three-cards"><StatCard label="Total zones" value={zones.toLocaleString()} hint="Active service areas" /><StatCard label="Total meters" value={meters.toLocaleString()} hint="Across all zones" tone="green" /><StatCard label="Critical alerts" value={critical.toLocaleString()} hint="Open across all zones" tone="amber" /></div><div className="dashboard-grid"><ChartCard title="Average consumption by zone" data={chart} valueLabel="kWh" kind="bar" showPrevious /><section className="surface-card quick-card"><div className="chart-head"><div><h2>Recent critical alerts</h2><p>Needs attention across the organisation.</p></div><Link className="text-button" to="/enterprise/alerts">View all</Link></div><div className="alert-list">{alerts.slice(0, 4).map((alert) => <div className="alert-list-row" key={alert.id}><span className="alert-mark">!</span><span><strong>{alert.title}</strong><small>{alert.zoneName} · {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small></span><StatusBadge status={alert.severity} /></div>)}</div></section></div></>
}

export function ZonesPage() {
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [adding, setAdding] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const navigate = useNavigate()
  const columns: TableColumn<Zone>[] = [
    { key: 'id', title: 'Zone ID', sortable: true }, { key: 'name', title: 'Zone name', sortable: true, render: (zone) => <strong>{zone.name}</strong> }, { key: 'adminName', title: 'Assigned admin' }, { key: 'meterCount', title: 'Meters' }, { key: 'status', title: 'Status', render: (zone) => <StatusBadge status={zone.status} /> },
  ]
  return <><PageHeader title="Zone management" subtitle="Service areas managed by the enterprise." action={<button className="button button-primary" onClick={() => setAdding(true)}>＋ Add zone</button>} /><DataTable<Zone> resource="zones" columns={columns} searchField="name" searchLabel="Search zones" filterField="status" filterOptions={['Active', 'Deactivated']} sortField="name" rowAction={(zone) => <RowActionMenu actions={[{ label: 'View details', onClick: () => navigate(`/enterprise/zones/${zone.id}`) }, { label: 'Edit zone', onClick: () => setEditingZone(zone) }, { label: zone.status === 'Active' ? 'Deactivate zone' : 'Activate zone', onClick: () => setPendingStatus(`${zone.status === 'Active' ? 'Deactivate' : 'Activate'} ${zone.name}`) }]} />} />{(adding || editingZone) && <ZoneFormModal zone={editingZone ?? undefined} onClose={() => { setAdding(false); setEditingZone(null) }} />}{pendingStatus && <ConfirmDialog title="Confirm status action" message={`${pendingStatus}? Phase 1 is read-only, so this will not change the zone record.`} onCancel={() => setPendingStatus('')} onConfirm={() => setPendingStatus('')} />}</>
}

function ZoneFormModal({ zone, onClose }: { zone?: Zone; onClose: () => void }) {
  const { data: admins } = useApiList<UserRecord>('users', { role: 'zone-admin', _sort: 'name' })
  const [name, setName] = useState(zone?.name ?? '')
  const [adminId, setAdminId] = useState(zone?.adminId ?? '')
  const [location, setLocation] = useState(zone?.location ?? '')
  const [pincode, setPincode] = useState(zone?.pincode ?? '')
  const [description, setDescription] = useState(zone?.description ?? '')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!name.trim() || !adminId || !location.trim() || !/^\d{6}$/.test(pincode) || !description.trim()) { setError('Complete each field and enter a valid six-digit pincode.'); return } setError(''); setToast(true) }
  return <Modal title={zone ? 'Edit zone' : 'Add zone'} onClose={onClose}><p className="page-subtitle">{zone ? 'Review zone information and validate the form.' : 'Enter the area and assign its zone administrator.'}</p><form className="form-grid" onSubmit={submit} noValidate><TextInput label="Zone name" value={name} onChange={setName} placeholder="e.g. Mangalore" error={error || undefined} /><SelectInput label="Assigned admin" value={adminId} onChange={setAdminId} options={[{ label: 'Select admin', value: '' }, ...admins.map((admin) => ({ label: admin.name, value: admin.id }))]} /><TextInput label="Location" value={location} onChange={setLocation} placeholder="District or city" /><TextInput label="Pincode" value={pincode} onChange={setPincode} placeholder="6-digit pincode" /><label className="field form-span">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the service area" /></label><div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Validate form</button></div></form>{error && <p className="field-error">{error}</p>}{toast && <Toast onClose={() => setToast(false)}>{zone ? 'Form validated; zone changes were not saved.' : 'Form validated; no zone was created in Phase 1.'}</Toast>}</Modal>
}

export function ZoneDetailPage() {
  const { zoneId = '' } = useParams()
  const { data: zone, loading, error } = useApiRecord<Zone>('zones', zoneId)
  const [tab, setTab] = useState('Meters')
  if (loading) return <Loader />
  if (error || !zone) return <EmptyState title="Zone not found" />
  const meterColumns: TableColumn<Meter>[] = [{ key: 'id', title: 'Meter ID', sortable: true }, { key: 'ownerName', title: 'Owner' }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'lastReading', title: 'Last reading', render: (row) => `${row.lastReading.toLocaleString('en-IN')} kWh` }]
  const userColumns: TableColumn<UserRecord>[] = [{ key: 'id', title: 'Customer ID' }, { key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }, { key: 'meterCount', title: 'Meters' }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }]
  return <><PageHeader title={zone.name} subtitle={`${zone.location} · ${zone.pincode}`} action={<Link className="button button-secondary" to="/enterprise/zones">← All zones</Link>} /><div className="stat-grid three-cards"><StatCard label="Assigned admin" value={zone.adminName ?? '—'} hint="Zone administrator" /><StatCard label="Total meters" value={String(zone.meterCount ?? 0)} hint="Devices in this zone" tone="green" /><StatCard label="Status" value={zone.status} hint={zone.description} tone="violet" /></div><div className="section-heading"><h2>Zone directory</h2></div><section className="content-card"><Tabs items={['Meters', 'Users']} active={tab} onChange={setTab} />{tab === 'Meters' ? <DataTable<Meter> resource="meters" columns={meterColumns} baseQuery={{ zoneId: zone.id }} searchField="id" searchLabel="Search meter ID" sortField="id" /> : <DataTable<UserRecord> resource="users" columns={userColumns} baseQuery={{ zoneId: zone.id, role: 'end-user' }} searchField="name" searchLabel="Search customers" sortField="name" />}</section></>
}

export function MetersPage() {
  const [zoneId, setZoneId] = useState('')
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null)
  const { data: zoneChart } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'enterprise', scopeId: 'all', range: 'current' })
  const columns: TableColumn<Meter>[] = [{ key: 'id', title: 'Meter ID', sortable: true }, { key: 'ownerName', title: 'Owner' }, { key: 'zoneName', title: 'Zone', sortable: true }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'lastReading', title: 'Last reading', render: (row) => `${row.lastReading.toLocaleString('en-IN')} kWh` }]
  const filters = zoneId ? { zoneId } : {}
  return <><PageHeader title="Meter management" subtitle="Meters across all zones, with zone-level comparison." /><ChartCard title="Average consumption by zone" data={zoneChart} valueLabel="kWh" kind="bar" showPrevious /><div className="section-heading"><div><h2>All meters</h2><p>Search and filter meters from every service area.</p></div><label className="filter-control"><span>Zone</span><select value={zoneId} onChange={(event) => setZoneId(event.target.value)}>{zoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><DataTable<Meter> resource="meters" columns={columns} baseQuery={filters} searchField="id" searchLabel="Search meter ID" filterField="status" filterOptions={['Active', 'Deactivated']} sortField="id" rowAction={(meter) => <RowActionMenu actions={[{ label: 'View details', onClick: () => setSelectedMeter(meter) }]} />} />{selectedMeter && <Modal title="Meter details" onClose={() => setSelectedMeter(null)}><div className="detail-grid"><Detail label="Meter ID" value={selectedMeter.id} /><Detail label="Owner" value={selectedMeter.ownerName} /><Detail label="Zone" value={selectedMeter.zoneName ?? '—'} /><Detail label="Status" value={<StatusBadge status={selectedMeter.status} />} /><Detail label="Last reading" value={`${selectedMeter.lastReading.toLocaleString('en-IN')} kWh`} /><Detail label="Tariff" value={selectedMeter.tariffCategory} /></div><p className="data-note">Meter updates are read-only in Phase 1.</p></Modal>}</>
}

export function UsersPage() {
  const [tab, setTab] = useState('Consumers')
  const [year, setYear] = useState('2026')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const roleQuery = tab === 'Admins' ? { 'role:in': 'enterprise,zone-admin' } : { role: 'end-user' }
  const active = useCount('users', { ...roleQuery, 'joinedAt:startsWith': year, status: 'Active' })
  const inactive = useCount('users', { ...roleQuery, 'joinedAt:startsWith': year, status: 'Deactivated' })
  const chart: ConsumptionPoint[] = [{ id: 'active', scope: 'enterprise', scopeId: 'all', range: 'year', period: 'Active', value: active, previous: 0 }, { id: 'inactive', scope: 'enterprise', scopeId: 'all', range: 'year', period: 'Deactivated', value: inactive, previous: 0 }]
  const columns: TableColumn<UserRecord>[] = [{ key: 'id', title: 'ID', sortable: true }, { key: 'name', title: 'Name', sortable: true }, { key: 'email', title: 'Email' }, { key: 'role', title: 'Role' }, { key: 'zoneId', title: 'Zone', render: (row) => row.zoneId?.replace('zone-', '') ?? 'All zones' }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }]
  return <><PageHeader title="User & role management" subtitle="View enterprise admins, zone admins and customers." /><div className="enterprise-user-grid"><section className="content-card"><div className="chart-head"><div><h2>User status</h2><p>Active and deactivated users by join year</p></div><select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Join year"><option>2026</option><option>2025</option><option>2024</option></select></div><ChartCard title="Account status" data={chart} kind="donut" valueLabel="Users" /></section><section className="content-card"><Tabs items={['Admins', 'Consumers']} active={tab} onChange={setTab} /><p className="page-subtitle">{tab === 'Admins' ? 'Enterprise and zone administrators.' : 'Customer accounts across all zones.'}</p><DataTable<UserRecord> resource="users" columns={columns} baseQuery={roleQuery} searchField="name" searchLabel="Search users" filterField="status" filterOptions={['Active', 'Deactivated']} sortField="name" rowAction={(user) => <button className="button button-secondary button-small" onClick={() => setSelectedUser(user)}>View</button>} /></section></div>{selectedUser && <Modal title="User details" onClose={() => setSelectedUser(null)}><div className="detail-grid"><Detail label="Name" value={selectedUser.name} /><Detail label="Email" value={selectedUser.email} /><Detail label="Role" value={selectedUser.role} /><Detail label="Zone" value={selectedUser.zoneId?.replace('zone-', '') ?? 'All zones'} /><Detail label="Status" value={<StatusBadge status={selectedUser.status} />} /><Detail label="Joined" value={selectedUser.joinedAt} /></div><p className="data-note">User records are view-only for the Enterprise in Phase 1.</p></Modal>}</>
}

export function ReportsPage() {
  const [month, setMonth] = useState('Nov')
  const { data } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'enterprise', scopeId: 'all', range: 'month', period: month, _sort: 'zoneName' })
  const columns: TableColumn<ConsumptionPoint>[] = [{ key: 'zoneName', title: 'Zone', sortable: true }, { key: 'value', title: 'Consumption', render: (row) => `${row.value.toLocaleString('en-IN')} kWh` }, { key: 'previous', title: 'Previous period', render: (row) => `${row.previous.toLocaleString('en-IN')} kWh` }, { key: 'change', title: 'Change', render: (row) => `${(((row.value - row.previous) / row.previous) * 100).toFixed(1)}%` }]
  return <><PageHeader title="Reports & analytics" subtitle="Compare energy consumption between service zones." action={<label className="filter-control"><span>Period</span><select value={month} onChange={(event) => setMonth(event.target.value)}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((item) => <option key={item}>{item}</option>)}</select></label>} /><ChartCard title={`Zone comparison · ${month} 2026`} data={data} kind="bar" grouped valueLabel="kWh" /><div className="section-heading"><div><h2>Zone summary</h2><p>Current and previous period values from JSON Server.</p></div></div><DataTable<ConsumptionPoint> resource="chartSeries" columns={columns} baseQuery={{ scope: 'enterprise', scopeId: 'all', range: 'month', period: month }} sortField="zoneName" /></>
}

export function AlertsPage() {
  const [status, setStatus] = useState('')
  const columns: TableColumn<AlertRecord>[] = [{ key: 'title', title: 'Alert', sortable: true }, { key: 'zoneName', title: 'Zone', sortable: true }, { key: 'meterId', title: 'Meter' }, { key: 'severity', title: 'Severity', render: (row) => <StatusBadge status={row.severity} /> }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'createdAt', title: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }]
  const baseQuery = status ? { status } : {}
  return <><PageHeader title="Enterprise alerts" subtitle="Critical and warning alerts across all service areas." action={<label className="filter-control"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Open</option><option>Resolved</option></select></label>} /><DataTable<AlertRecord> resource="alerts" columns={columns} baseQuery={baseQuery} searchField="title" searchLabel="Search alerts" filterField="severity" filterOptions={['Critical', 'Warning']} sortField="-createdAt" /></>
}

export function AuditLogsPage() {
  const [date, setDate] = useState('2026-11-01')
  const columns: TableColumn<AuditLog>[] = [{ key: 'id', title: 'Log ID', sortable: true }, { key: 'timestamp', title: 'Timestamp', sortable: true, render: (row) => new Date(row.timestamp).toLocaleString('en-IN') }, { key: 'userName', title: 'User', sortable: true }, { key: 'action', title: 'Action' }, { key: 'resource', title: 'Resource' }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }]
  return <><PageHeader title="Audit logs" subtitle="Review recorded activity across the organisation." /><div className="section-heading"><div><h2>Activity history</h2><p>Search by user, filter by result and choose a date range.</p></div><label className="field date-filter">From date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div><DataTable<AuditLog> resource="auditLogs" columns={columns} baseQuery={{ 'timestamp:gte': `${date}T00:00:00.000Z` }} searchField="userName" searchLabel="Search user" filterField="status" filterOptions={['Success', 'Failed']} sortField="-timestamp" /></>
}

export function SettingsPage() {
  const { data, loading, error: loadError } = useApiRecord<EnterpriseSettings>('enterpriseSettings', 'enterprise-default')
  const [retention, setRetention] = useState('')
  const [logout, setLogout] = useState('')
  const [audit, setAudit] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [language, setLanguage] = useState('')
  const [currency, setCurrency] = useState('')
  const [email, setEmail] = useState<boolean | null>(null)
  const [sms, setSms] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)
  if (loading) return <Loader />
  if (loadError || !data) return <EmptyState title="Settings unavailable" message={loadError || 'Enterprise settings are unavailable.'} />
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (Number(retention || data.dataRetentionYears) < 1 || Number(logout || data.autoLogoutMinutes) < 1 || Number(audit || data.auditRetentionYears) < 1) { setError('Retention periods and auto-logout must be positive numbers.'); return } setError(''); setToast(true) }
  return <><PageHeader title="Settings & configuration" subtitle="Organisation-wide policies and localisation preferences." /><div className="content-card"><form className="form-grid" onSubmit={submit} noValidate><div className="form-span"><h2>Policies and retention</h2><p className="page-subtitle">Values are loaded from JSON Server. Updates are not saved in Phase 1.</p></div><TextInput label="Data retention (years)" type="number" value={retention || String(data.dataRetentionYears)} onChange={setRetention} error={error || undefined} /><TextInput label="Auto-logout timer (minutes)" type="number" value={logout || String(data.autoLogoutMinutes)} onChange={setLogout} /><TextInput label="Audit-log retention (years)" type="number" value={audit || String(data.auditRetentionYears)} onChange={setAudit} /><div className="form-span settings-block"><h3>Localisation</h3></div><TextInput label="Time zone" value={timeZone || data.timeZone} onChange={setTimeZone} /><TextInput label="Default language" value={language || data.language} onChange={setLanguage} /><TextInput label="Currency" value={currency || data.currency} onChange={setCurrency} /><div className="form-span settings-block"><h3>Notification defaults</h3><Toggle label="Email notifications" checked={email ?? data.emailEnabled} onChange={setEmail} /><Toggle label="SMS notifications" checked={sms ?? data.smsEnabled} onChange={setSms} /></div><div className="form-actions"><button type="submit" className="button button-primary">Validate settings</button></div></form></div>{error && <p className="field-error">{error}</p>}{toast && <Toast onClose={() => setToast(false)}>Settings validated; no organisation settings were saved in Phase 1.</Toast>}</>
}

function Detail({ label, value }: { label: string; value: string | ReactNode }) {
  return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div>
}
