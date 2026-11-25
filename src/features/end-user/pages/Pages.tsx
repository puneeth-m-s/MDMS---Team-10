import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable, type TableColumn } from '../../../shared/components/DataTable'
import { useApiList, useApiRecord } from '../../../shared/components/useApi'
import { ChartCard, EmptyState, Loader, PageHeader, StatCard, StatusBadge } from '../../../shared/components/ui'
import type { Bill, BillDay, ConsumptionPoint, Meter, NotificationRecord, Reading, UserRecord, Zone } from '../types'

const DEMO_USER = 'customer-001'
const DEMO_ZONE = 'zone-mangalore'
const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const formatDate = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export function DashboardPage() {
  const [range, setRange] = useState('Week')
  const { data: user } = useApiRecord<UserRecord>('users', DEMO_USER)
  const { data: zone } = useApiRecord<Zone>('zones', DEMO_ZONE)
  const { data: meters } = useApiList<Meter>('meters', { ownerId: DEMO_USER })
  const meter = meters[0]
  const { data: recentReading } = useApiList<Reading>('readings', { meterId: meter?.id ?? '', date: meter?.lastReadingAt.slice(0, 10) ?? '' })
  const { data: bills } = useApiList<Bill>('bills', { userId: DEMO_USER, _sort: '-month' })
  const { data: series } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'user', scopeId: DEMO_USER, range: range.toLowerCase(), _sort: 'period' })
  const latestBill = bills[0]
  const lastPaid = bills.find((bill) => bill.status === 'Paid')
  const outstanding = bills.filter((bill) => bill.status !== 'Paid').reduce((sum, bill) => sum + bill.amount, 0)
  const zoneName = zone?.name ?? 'Mangalore'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return <>
    <div className="welcome-card"><div><p className="eyebrow">{today.toUpperCase()}</p><h2>Good morning, {user?.name?.split(' ')[0] ?? 'Ananya'} 👋</h2><p>Your energy, made easier to understand.</p></div><div className="welcome-meta"><div><small>Last synced</small><strong>{meter ? new Date(meter.lastReadingAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</strong></div><div><small>Data source</small><strong>{meter?.id ?? 'Meter pending'}</strong></div></div></div>
    <PageHeader title="Your energy overview" subtitle={`Here’s what’s happening with your home in ${zoneName}.`} />
    <div className="stat-grid"><StatCard label="Current consumption" value={recentReading[0] ? `${recentReading[0].difference.toFixed(1)} kWh` : '—'} hint="Latest daily usage" /><StatCard label="This month’s bill" value={latestBill ? formatMoney(latestBill.amount) : '—'} hint={latestBill ? `Due ${formatDate(latestBill.dueDate)}` : 'No bill available'} tone="green" /><StatCard label="Outstanding balance" value={formatMoney(outstanding)} hint="Across unpaid bills" tone="amber" /><StatCard label="Last payment" value={lastPaid ? formatMoney(lastPaid.amount) : '—'} hint={lastPaid?.paidOn ? `Paid ${formatDate(lastPaid.paidOn)}` : 'No payment recorded'} tone="violet" /></div>
    <div className="dashboard-grid"><ChartCard title="Consumption overview" data={series} range={range} onRangeChange={setRange} valueLabel="kWh" showPrevious /><section className="surface-card quick-card"><h2>Quick actions</h2><p>Jump to the things you need most.</p><div className="quick-actions"><QuickAction to="/user/bills" icon="₹" label="Pay bill" /><QuickAction to="/user/bills" icon="▤" label="View bill history" /><QuickAction to="/user/meter-data" icon="⌁" label="View detailed usage" /><QuickAction to="/user/alerts" icon="◉" label="Manage notifications" /></div></section></div>
  </>
}

function QuickAction({ to, icon, label }: { to: string; icon: string; label: string }) {
  return <Link to={to} className="quick-action"><span><i>{icon}</i>{label}</span><b>→</b></Link>
}

export function BillsPage() {
  const navigate = useNavigate()
  const columns: TableColumn<Bill>[] = [
    { key: 'month', title: 'Billing month', sortable: true, render: (bill) => new Date(`${bill.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
    { key: 'amount', title: 'Amount', sortable: true, render: (bill) => <strong>{formatMoney(bill.amount)}</strong> },
    { key: 'dueDate', title: 'Due date', sortable: true, render: (bill) => formatDate(bill.dueDate) },
    { key: 'status', title: 'Status', render: (bill) => <StatusBadge status={bill.status} /> },
  ]
  return <><PageHeader title="My bills" subtitle="Review your complete billing history and payment status." action={<button className="button button-primary" onClick={() => navigate('/user/bills')}>Pay bill <span>→</span></button>} /><DataTable<Bill> resource="bills" columns={columns} baseQuery={{ userId: DEMO_USER }} searchField="month" searchLabel="Search billing month" filterField="status" filterOptions={['Pending', 'Paid', 'Overdue']} sortField="-month" rowAction={(bill) => <div className="row-actions"><Link className="button button-secondary button-small" to={`/user/bills/${bill.id}`}>View</Link><Link className="button button-quiet button-small" to={`/user/bills/${bill.id}#payment`}>Pay</Link></div>} /><p className="data-note">All bills are generated on the 1st of every month.</p></>
}

export function BillDetailPage() {
  const { billId = '' } = useParams()
  const { data: bill, loading, error } = useApiRecord<Bill>('bills', billId)
  const dailyColumns: TableColumn<BillDay>[] = [
    { key: 'date', title: 'Date', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'reading', title: 'Reading (kWh)', render: (row) => row.reading.toFixed(1) },
    { key: 'consumption', title: 'Consumption', render: (row) => `${row.consumption.toFixed(1)} kWh` },
    { key: 'cost', title: 'Cost', render: (row) => formatMoney(row.cost) },
  ]
  if (loading) return <Loader />
  if (error || !bill) return <EmptyState title="Bill not found" message="This bill may no longer be available." />
  const titleMonth = new Date(`${bill.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  return <><PageHeader title="Bill details" subtitle={titleMonth} action={<Link className="button button-secondary" to="/user/bills">← All bills</Link>} /><div className="content-card"><h2>Bill summary</h2><div className="detail-grid"><Detail label="Billing month" value={titleMonth} /><Detail label="Total amount" value={formatMoney(bill.amount)} /><Detail label="Due date" value={formatDate(bill.dueDate)} /><Detail label="Status" value={<StatusBadge status={bill.status} />} /></div></div><div className="section-heading"><div><h2>Daily usage & charges</h2><p>Meter readings recorded during this billing month.</p></div></div><DataTable<BillDay> resource="billDays" columns={dailyColumns} baseQuery={{ billId: bill.id }} sortField="date" /><div className="form-actions" id="payment"><button className="button button-secondary" disabled>Download PDF</button><button className="button button-secondary" onClick={() => window.print()}>Print</button><button className="button button-primary" disabled>Pay now</button></div><p className="data-note">PDF download and payment are inactive in Phase 1. Print is available.</p></>
}

export function MeterDataPage() {
  const [range, setRange] = useState('Month')
  const [startDate, setStartDate] = useState('2026-10-26')
  const [endDate, setEndDate] = useState('2026-11-25')
  const { data: meter } = useApiList<Meter>('meters', { ownerId: DEMO_USER })
  const meterId = meter[0]?.id ?? ''
  const { data: points } = useApiList<ConsumptionPoint>('chartSeries', { scope: 'user', scopeId: DEMO_USER, range: range.toLowerCase(), _sort: 'period' })
  const columns: TableColumn<{ id: string; meterId: string; date: string; reading: number; difference: number; notes: string }>[] = [
    { key: 'date', title: 'Date', sortable: true, render: (row) => formatDate(row.date) }, { key: 'reading', title: 'Reading', render: (row) => `${row.reading.toLocaleString('en-IN')} kWh` }, { key: 'difference', title: 'Difference', render: (row) => `${row.difference.toFixed(1)} kWh` }, { key: 'notes', title: 'Notes' },
  ]
  return <><PageHeader title="Meter data" subtitle="Explore daily readings and compare current use with the previous period." /><section className="content-card"><div className="chart-head"><div><h2>Usage comparison</h2><p>{meterId || 'Meter readings'} · current and previous period</p></div><div className="range-toggle">{['Day', 'Week', 'Month'].map((item) => <button type="button" className={range === item ? 'selected' : ''} key={item} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="date-range-row"><label className="field">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="field">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div></section><ChartCard title="Consumption trend" data={points} kind="line" valueLabel="Current" showPrevious /><div className="section-heading"><div><h2>Reading history</h2><p>Detailed meter readings for the selected range.</p></div></div><DataTable<{ id: string; meterId: string; date: string; reading: number; difference: number; notes: string }> resource="readings" columns={columns} baseQuery={{ meterId, 'date:gte': startDate, 'date:lte': endDate }} searchField="date" searchLabel="Search date" sortField="-date" /></>
}

export function AlertsPage() {
  const columns: TableColumn<NotificationRecord>[] = [
    { key: 'title', title: 'Notification', render: (row) => <span className={row.read ? '' : 'notification-unread'}><strong>{row.title}</strong><small className="cell-subtitle">{row.message}</small></span> },
    { key: 'type', title: 'Type' }, { key: 'read', title: 'Status', render: (row) => <StatusBadge status={row.read ? 'Read' : 'Unread'} /> },
    { key: 'createdAt', title: 'Received', sortable: true, render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ]
  return <><PageHeader title="Alerts & notifications" subtitle="Updates about your bills, payments, usage and service." /><DataTable<NotificationRecord> resource="notifications" columns={columns} baseQuery={{ userId: DEMO_USER }} searchField="title" searchLabel="Search notifications" filterField="read" filterOptions={['false']} filterLabels={{ 'false': 'Unread' }} sortField="-createdAt" /></>
}

function Detail({ label, value }: { label: string; value: string | ReactNode }) {
  return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div>
}
