import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable, type TableColumn } from '../../../shared/components/DataTable'
import { useApiList, useApiRecord, useCount } from '../../../shared/components/useApi'
import { ChartCard, ConfirmDialog, EmptyState, Loader, Modal, PageHeader, RowActionMenu, SelectInput, StatCard, StatusBadge, TextInput, Toast, Toggle } from '../../../shared/components/ui'
import type { AlertRecord, ConsumptionPoint, Meter, Reading, UserRecord, ZoneSettings } from '../types'

const ZONE_ID = 'zone-mangalore'

export function DashboardPage() {
  const [range, setRange] = useState('Week')
  const meters = useCount('meters', { zoneId: ZONE_ID, status: 'Active' })
  const alerts = useCount('alerts', { zoneId: ZONE_ID, status: 'Open' })
  const { data: series } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'zone', scopeId: ZONE_ID, range: range.toLowerCase(), _sort: 'period' })
  const average = series.length ? Math.round(series.reduce((sum, item) => sum + item.value, 0) / series.length) : 0
  const navigate = useNavigate()
  return <><PageHeader title="Zone overview" subtitle="A live snapshot of your service area." action={<><button className="button button-secondary" onClick={() => navigate('/zone/reports')}>Generate report</button><button className="button button-primary" onClick={() => navigate('/zone/meters?add=true')}>＋ Add meter</button></>} /><div className="stat-grid three-cards"><StatCard label="Active meters" value={meters.toLocaleString()} hint="Across your zone" tone="green" /><StatCard label="Average usage" value={`${average.toLocaleString()} kWh`} hint="This period’s zone usage" /><StatCard label="Pending alerts" value={alerts.toLocaleString()} hint="Needs review" tone="amber" /></div><div className="dashboard-grid"><ChartCard title="Zone consumption" data={series} range={range} onRangeChange={setRange} ranges={['Week', 'Month']} valueLabel="kWh" kind="bar" /><section className="surface-card quick-card"><h2>Zone actions</h2><p>Common tasks for your area.</p><div className="quick-actions"><Link className="quick-action" to="/zone/meters"><span><i>⌁</i>Manage meters</span><b>→</b></Link><Link className="quick-action" to="/zone/users"><span><i>♙</i>View customers</span><b>→</b></Link><Link className="quick-action" to="/zone/reports"><span><i>▥</i>Generate report</span><b>→</b></Link></div></section></div></>
}

export function MetersPage() {
  const [showForm, setShowForm] = useState(new URLSearchParams(window.location.search).get('add') === 'true')
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null)
  const [pendingStatus, setPendingStatus] = useState('')
  const navigate = useNavigate()
  const columns: TableColumn<Meter>[] = [
    { key: 'id', title: 'Meter ID', sortable: true, render: (row) => <Link className="text-button" to={`/zone/meters/${encodeURIComponent(row.id)}`}>{row.id}</Link> },
    { key: 'ownerName', title: 'Owner', sortable: true }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'lastReading', title: 'Last reading', sortable: true, render: (row) => `${row.lastReading.toLocaleString('en-IN')} kWh` },
    { key: 'lastReadingAt', title: 'Last updated', render: (row) => new Date(row.lastReadingAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
  ]
  return <><PageHeader title="Meter management" subtitle="Meters assigned to the Mangalore service zone." action={<button className="button button-primary" onClick={() => { setEditingMeter(null); setShowForm(true) }}>＋ Add meter</button>} /><DataTable<Meter> resource="meters" columns={columns} baseQuery={{ zoneId: ZONE_ID }} searchField="id" searchLabel="Search meter ID" filterField="status" filterOptions={['Active', 'Deactivated']} sortField="id" rowAction={(meter) => <RowActionMenu actions={[{ label: 'View details', onClick: () => navigate(`/zone/meters/${encodeURIComponent(meter.id)}`) }, { label: 'Edit meter', onClick: () => { setEditingMeter(meter); setShowForm(true) } }, { label: meter.status === 'Active' ? 'Deactivate meter' : 'Activate meter', onClick: () => setPendingStatus(`${meter.status === 'Active' ? 'Deactivate' : 'Activate'} ${meter.id}`) }]} />} />{showForm && <AddMeterModal meter={editingMeter ?? undefined} onClose={() => { setShowForm(false); setEditingMeter(null); navigate('/zone/meters', { replace: true }) }} />}{pendingStatus && <ConfirmDialog title="Confirm status action" message={`${pendingStatus}? Phase 1 is read-only, so this will not change the meter record.`} onCancel={() => setPendingStatus('')} onConfirm={() => setPendingStatus('')} />}</>
}

function AddMeterModal({ meter, onClose }: { meter?: Meter; onClose: () => void }) {
  const { data: users } = useApiList<UserRecord>('users', { zoneId: ZONE_ID, role: 'end-user', _sort: 'name' })
  const [meterId, setMeterId] = useState(meter?.id ?? '')
  const [ownerId, setOwnerId] = useState(meter?.ownerId ?? '')
  const [address, setAddress] = useState(meter?.address ?? '')
  const [tariff, setTariff] = useState(meter?.tariffCategory ?? 'Domestic')
  const [errors, setErrors] = useState<{ id?: string; owner?: string; address?: string }>({})
  const [toast, setToast] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const next = { id: meterId.trim() ? '' : 'Meter ID is required.', owner: ownerId ? '' : 'Select a customer.', address: address.trim() ? '' : 'Service address is required.' }; setErrors(next); if (Object.values(next).some(Boolean)) return; setToast(true) }
  return <Modal title={meter ? 'Edit meter' : 'Add meter'} onClose={onClose}><p className="page-subtitle">Assign a meter to a customer in this zone.</p><form className="form-grid" onSubmit={submit} noValidate><TextInput label="Meter ID" value={meterId} onChange={setMeterId} placeholder="MW-0000-1" error={errors.id} /><SelectInput label="Customer" value={ownerId} onChange={setOwnerId} options={[{ label: 'Select customer', value: '' }, ...users.map((user) => ({ label: user.name, value: user.id }))]} error={errors.owner} /><TextInput label="Service address" value={address} onChange={setAddress} placeholder="Street and locality" error={errors.address} /><SelectInput label="Tariff category" value={tariff} onChange={setTariff} options={[{ label: 'Domestic', value: 'Domestic' }, { label: 'Commercial', value: 'Commercial' }]} /><div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Validate form</button></div></form>{toast && <Toast onClose={() => setToast(false)}>{meter ? 'Form validated; meter changes were not saved.' : 'Form validated; no meter was saved in Phase 1.'}</Toast>}</Modal>
}

export function MeterDetailPage() {
  const { meterId = '' } = useParams()
  const { data: meter, loading, error } = useApiRecord<Meter>('meters', decodeURIComponent(meterId))
  const { data: readings } = useApiList<Reading>('readings', { meterId: decodeURIComponent(meterId), 'date:gte': '2026-10-26', 'date:lte': '2026-11-25', _sort: 'date' })
  const chart = readings.map((reading) => ({ id: reading.id, scope: 'zone' as const, scopeId: ZONE_ID, range: 'month' as const, period: reading.date.slice(5), value: reading.difference, previous: reading.difference * 0.92 }))
  const columns: TableColumn<Reading>[] = [{ key: 'date', title: 'Date', sortable: true }, { key: 'reading', title: 'Reading', render: (row) => `${row.reading.toLocaleString('en-IN')} kWh` }, { key: 'difference', title: 'Usage', render: (row) => `${row.difference.toFixed(1)} kWh` }, { key: 'notes', title: 'Notes' }]
  if (loading) return <Loader />
  if (error || !meter) return <EmptyState title="Meter not found" message="Check the meter ID and try again." />
  return <><PageHeader title="Meter details" subtitle={meter.id} action={<Link to="/zone/meters" className="button button-secondary">← All meters</Link>} /><div className="content-card"><h2>Meter information</h2><div className="detail-grid"><Detail label="Meter ID" value={meter.id} /><Detail label="Owner" value={meter.ownerName} /><Detail label="Address" value={meter.address} /><Detail label="Status" value={<StatusBadge status={meter.status} />} /><Detail label="Installed" value={meter.installedDate} /><Detail label="Tariff category" value={meter.tariffCategory} /><Detail label="Last reading" value={`${meter.lastReading.toLocaleString('en-IN')} kWh`} /></div></div><div className="section-heading"><div><h2>Recent usage</h2><p>Readings from the last 30 days.</p></div></div><ChartCard title="Meter usage" data={chart} valueLabel="kWh" showPrevious /><div className="section-heading"><h2>Recent readings</h2></div><DataTable<Reading> resource="readings" columns={columns} baseQuery={{ meterId: meter.id }} sortField="-date" /></>
}

export function UsersPage() {
  const [selected, setSelected] = useState<UserRecord | null>(null)
  const columns: TableColumn<UserRecord>[] = [
    { key: 'id', title: 'Customer ID', sortable: true }, { key: 'name', title: 'Name', sortable: true }, { key: 'email', title: 'Email' }, { key: 'phone', title: 'Phone' }, { key: 'meterCount', title: 'Meters', render: (row) => row.meterCount ?? 1 }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]
  return <><PageHeader title="User management" subtitle="Customers assigned to your zone. Customer records are read-only in Phase 1." /><DataTable<UserRecord> resource="users" columns={columns} baseQuery={{ zoneId: ZONE_ID, role: 'end-user' }} searchField="name" searchLabel="Search customers" filterField="status" filterOptions={['Active', 'Deactivated']} sortField="name" rowAction={(user) => <button className="button button-secondary button-small" onClick={() => setSelected(user)}>View</button>} />{selected && <CustomerDetails user={selected} onClose={() => setSelected(null)} />}</>
}

function CustomerDetails({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const { data: meters } = useApiList<Meter>('meters', { ownerId: user.id })
  return <Modal title="Customer and meters" onClose={onClose}><div className="detail-grid"><Detail label="Customer" value={user.name} /><Detail label="Email" value={user.email} /><Detail label="Phone" value={user.phone} /></div><div className="settings-block"><h3>Assigned meters</h3>{meters.length ? meters.map((meter) => <div className="meter-list-item" key={meter.id}><strong>{meter.id}</strong><span>{meter.status}</span></div>) : <Loader />}</div></Modal>
}

export function ReportsPage() {
  const [meterId, setMeterId] = useState('')
  const [startDate, setStartDate] = useState('2026-10-26')
  const [endDate, setEndDate] = useState('2026-11-25')
  const { data: meters } = useApiList<Meter>('meters', { zoneId: ZONE_ID, _sort: 'id' })
  const selectedMeter = meterId || meters[0]?.id || ''
  const query = { meterId: selectedMeter, 'date:gte': startDate, 'date:lte': endDate, _sort: 'date' }
  const { data: readings } = useApiList<Reading>('readings', query)
  const chart = readings.map((reading) => ({ id: reading.id, scope: 'zone' as const, scopeId: ZONE_ID, range: 'month' as const, period: reading.date.slice(5), value: reading.difference, previous: reading.difference * 0.94 }))
  const columns: TableColumn<Reading>[] = [{ key: 'date', title: 'Date', sortable: true }, { key: 'reading', title: 'Reading', render: (row) => `${row.reading.toLocaleString('en-IN')} kWh` }, { key: 'difference', title: 'Consumption', render: (row) => `${row.difference.toFixed(1)} kWh` }, { key: 'notes', title: 'Notes' }]
  return <><PageHeader title="Reports & analytics" subtitle="Review consumption trends for a selected meter and date range." /><section className="content-card"><div className="form-grid"><SelectInput label="Meter" value={selectedMeter} onChange={setMeterId} options={meters.map((meter) => ({ label: `${meter.id} · ${meter.ownerName}`, value: meter.id }))} /><label className="field">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="field">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div></section><div className="section-heading"><div><h2>Energy use trend</h2><p>Selected meter consumption over time.</p></div></div><ChartCard title="Consumption trend" data={chart} valueLabel="kWh" showPrevious /><div className="section-heading"><div><h2>Summary by day</h2><p>{readings.length} readings in selected period.</p></div></div><DataTable<Reading> resource="readings" columns={columns} baseQuery={{ meterId: selectedMeter, 'date:gte': startDate, 'date:lte': endDate }} sortField="date" /></>
}

export function AlertsPage() {
  const [status, setStatus] = useState('')
  const columns: TableColumn<AlertRecord>[] = [{ key: 'title', title: 'Alert', sortable: true }, { key: 'meterId', title: 'Meter ID' }, { key: 'severity', title: 'Severity', render: (row) => <StatusBadge status={row.severity} /> }, { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'createdAt', title: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }]
  const baseQuery = status ? { zoneId: ZONE_ID, status } : { zoneId: ZONE_ID }
  return <><PageHeader title="Zone alerts" subtitle="Review meter and consumption alerts for Mangalore." action={<label className="filter-control"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Open</option><option>Resolved</option></select></label>} /><DataTable<AlertRecord> resource="alerts" columns={columns} baseQuery={baseQuery} searchField="title" searchLabel="Search alerts" filterField="severity" filterOptions={['Critical', 'Warning']} sortField="-createdAt" /></>
}

export function SettingsPage() {
  const { data: settings, loading, error: loadError } = useApiRecord<ZoneSettings>('zoneSettings', `settings-${ZONE_ID}`)
  const [high, setHigh] = useState('')
  const [low, setLow] = useState('')
  const [frequency, setFrequency] = useState('')
  const [inactiveDays, setInactiveDays] = useState('')
  const [email, setEmail] = useState<boolean | null>(null)
  const [sms, setSms] = useState<boolean | null>(null)
  const [toast, setToast] = useState(false)
  const [error, setError] = useState('')
  if (loading) return <Loader />
  if (loadError || !settings) return <EmptyState title="Zone settings unavailable" message={loadError || 'Settings are unavailable.'} />
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const highValue = Number(high || settings.highConsumption); const lowValue = Number(low || settings.lowConsumption); const frequencyValue = Number(frequency || settings.abnormalFrequencyHours); const inactiveValue = Number(inactiveDays || settings.inactiveMeterDays); if ([highValue, lowValue, frequencyValue, inactiveValue].some((value) => value <= 0) || highValue <= lowValue) { setError('Enter positive values, and keep high consumption above low consumption.'); return } setError(''); setToast(true) }
  return <><PageHeader title="Zone settings" subtitle="Alert thresholds and notification channels for Mangalore." /><div className="content-card"><form className="form-grid" onSubmit={submit} noValidate><div className="form-span"><h2>Alert thresholds</h2><p className="page-subtitle">Loaded from JSON Server. Changes are not saved in Phase 1.</p></div><TextInput label="High consumption (kWh/day)" type="number" value={high || String(settings.highConsumption)} onChange={setHigh} error={error || undefined} /><TextInput label="Low consumption (kWh/day)" type="number" value={low || String(settings.lowConsumption)} onChange={setLow} /><TextInput label="Abnormal reading frequency (hours)" type="number" value={frequency || String(settings.abnormalFrequencyHours)} onChange={setFrequency} /><TextInput label="Inactive meter duration (days)" type="number" value={inactiveDays || String(settings.inactiveMeterDays)} onChange={setInactiveDays} /><div className="form-span settings-block"><h3>Notification channels</h3><Toggle label="Email notifications" checked={email ?? settings.emailEnabled} onChange={setEmail} /><Toggle label="SMS notifications" checked={sms ?? settings.smsEnabled} onChange={setSms} /></div><div className="form-actions"><button className="button button-primary" type="submit">Validate settings</button></div></form></div>{error && <p className="field-error">{error}</p>}{toast && <Toast onClose={() => setToast(false)}>Settings validated; values were not saved in Phase 1.</Toast>}</>
}

function Detail({ label, value }: { label: string; value: string | import('react').ReactNode }) { return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div> }
