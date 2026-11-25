import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ConsumptionPoint } from '../types'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">METER DATA MANAGEMENT</p><h1>{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>
}

export function StatCard({ label, value, hint, tone = 'blue' }: { label: string; value: string; hint?: string; tone?: 'blue' | 'green' | 'amber' | 'violet' }) {
  return <article className={`stat-card tone-${tone}`}><div className="stat-icon" aria-hidden="true">{tone === 'green' ? '↗' : tone === 'amber' ? '!' : tone === 'violet' ? '◷' : '◈'}</div><p>{label}</p><strong>{value}</strong>{hint && <small>{hint}</small>}</article>
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-badge status-${tone}`}>{status}</span>
}

export function EmptyState({ title = 'Nothing to show yet', message = 'Try changing your filters or check again later.' }: { title?: string; message?: string }) {
  return <div className="empty-state"><div className="empty-icon">⌕</div><h3>{title}</h3><p>{message}</p></div>
}

export function Loader({ label = 'Loading data' }: { label?: string }) {
  return <div className="loader" role="status"><span className="spinner" />{label}</div>
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-list" aria-label="Loading"><span className="skeleton-line skeleton-wide" />{Array.from({ length: rows }, (_, index) => <span className="skeleton-line" key={index} />)}</div>
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && !error && <small>{hint}</small>}{error && <small className="field-error" role="alert">{error}</small>}</label>
}

export function TextInput({ label, value, onChange, type = 'text', required, placeholder, error, hint, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; error?: string; hint?: string; autoComplete?: string }) {
  return <Field label={label} error={error} hint={hint}><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} autoComplete={autoComplete} /></Field>
}

export function SelectInput({ label, value, onChange, options, hint, error }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; hint?: string; error?: string }) {
  return <Field label={label} hint={hint} error={error}><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="toggle-row"><span>{label}</span><button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}><span /></button></label>
}

export function PasswordInput({ label, value, onChange, error, hint, required = true }: { label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; required?: boolean }) {
  const [visible, setVisible] = useState(false)
  return <Field label={label} error={error} hint={hint}><span className="password-wrap"><input type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} required={required} autoComplete="new-password" /><button type="button" className="text-button password-toggle" onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></span></Field>
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><h2 id="modal-title">{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}</section></div>
}

export function ConfirmDialog({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return <Modal title={title} onClose={onCancel}><p>{message}</p><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button type="button" className="button button-primary" onClick={onConfirm}>Confirm</button></div></Modal>
}

export function RowActionMenu({ actions }: { actions: Array<{ label: string; onClick: () => void; disabled?: boolean }> }) {
  return <details className="action-menu"><summary aria-label="Row actions">···</summary><div>{actions.map((action) => <button type="button" key={action.label} disabled={action.disabled} onClick={(event) => { const details = event.currentTarget.closest('details'); if (details) details.open = false; action.onClick() }}>{action.label}</button>)}</div></details>
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (tab: string) => void }) {
  return <div className="tabs" role="tablist">{items.map((item) => <button type="button" role="tab" aria-selected={item === active} className={item === active ? 'active' : ''} key={item} onClick={() => onChange(item)}>{item}</button>)}</div>
}

export function Toast({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onClose, 4200); return () => window.clearTimeout(timer) }, [onClose])
  return <div className="toast" role="status"><span className="toast-check">✓</span>{children}<button className="icon-button" aria-label="Dismiss message" onClick={onClose}>×</button></div>
}

export function ChartCard({ title, data, range, onRangeChange, kind = 'line', valueLabel = 'Consumption', showPrevious = false, grouped = false, ranges = ['Day', 'Week', 'Month', 'Year'] }: { title: string; data: ConsumptionPoint[]; range?: string; onRangeChange?: (range: string) => void; kind?: 'line' | 'bar' | 'donut'; valueLabel?: string; showPrevious?: boolean; grouped?: boolean; ranges?: string[] }) {
  const groupNames = [...new Set(data.map((point) => point.zoneName).filter((name): name is string => Boolean(name)))]
  const groupedData = data.reduce<Array<ConsumptionPoint & Record<string, string | number>>>((rows, point) => {
    const row = rows.find((item) => item.period === point.period)
    if (row && point.zoneName) row[point.zoneName] = point.value
    else if (point.zoneName) rows.push({ ...point, [point.zoneName]: point.value })
    return rows
  }, [])
  const palette = ['#14845f', '#a7cc5a', '#e1a74c', '#568f83']
  return <section className="chart-card"><div className="chart-head"><div><h2>{title}</h2><p>{valueLabel} overview</p></div>{range && onRangeChange && <div className="range-toggle" aria-label="Chart time range">{ranges.map((item) => <button type="button" className={range === item ? 'selected' : ''} key={item} onClick={() => onRangeChange(item)}>{item}</button>)}</div>}</div><div className="chart-area">{data.length === 0 ? <EmptyState title="No chart data" /> : <ResponsiveContainer width="100%" height="100%">{kind === 'donut' ? <PieChart><Pie data={data} dataKey="value" nameKey="period" innerRadius={58} outerRadius={88} paddingAngle={3}>{data.map((point, index) => <Cell key={point.id} fill={['#14845f', '#91bd5c', '#f2ad47', '#8e70d6', '#ec7290'][index % 5]} />)}</Pie><Tooltip /><Legend /></PieChart> : kind === 'bar' ? <BarChart data={grouped ? groupedData : data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Legend />{grouped ? groupNames.map((name, index) => <Bar key={name} dataKey={name} name={name} fill={palette[index % palette.length]} radius={[5, 5, 0, 0]} />) : <>{showPrevious && <Bar dataKey="previous" name="Previous" fill="#d4e2da" radius={[5, 5, 0, 0]} />}<Bar dataKey="value" name={valueLabel} fill="#14845f" radius={[5, 5, 0, 0]} /></>}</BarChart> : <LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Legend />{showPrevious && <Line type="monotone" dataKey="previous" name="Previous" stroke="#96ad9f" strokeWidth={2} dot={false} />}<Line type="monotone" dataKey="value" name={valueLabel} stroke="#14845f" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /></LineChart>}</ResponsiveContainer>}</div></section>
}

export function InlineForm({ children, onSubmit }: { children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="form-grid" onSubmit={onSubmit} noValidate>{children}</form>
}

export function Pagination({ page, pages, onPrevious, onNext, hasNext }: { page: number; pages: number; onPrevious: () => void; onNext: () => void; hasNext: boolean }) {
  return <div className="table-footer"><span>Page {page} of {Math.max(1, pages)}</span><div className="pagination"><button type="button" className="button button-secondary button-small" disabled={page <= 1} onClick={onPrevious}>Previous</button><button type="button" className="button button-secondary button-small" disabled={!hasNext} onClick={onNext}>Next</button></div></div>
}
