import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useRouteError } from 'react-router-dom'
import { EmptyState, PasswordInput, TextInput, Toggle, Toast, Tabs, Loader } from '../components/ui'
import { useApiRecord } from '../components/useApi'
import type { UserRecord, UserRole } from '../types'

const demoUser: Record<UserRole, string> = { 'end-user': 'customer-001', 'zone-admin': 'admin-mangalore', enterprise: 'enterprise-admin' }

export function ProfilePage() {
  const role = (window.localStorage.getItem('mdms-role') as UserRole | null) ?? 'end-user'
  const { data, loading, error: loadError } = useApiRecord<UserRecord>('users', demoUser[role])
  const [tab, setTab] = useState('Profile')
  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (tab === 'Profile' && !(name ?? data?.name ?? '').trim()) { setError('Full name is required.'); return }
    if (tab === 'Profile' && !/^\S+@\S+\.\S+$/.test(email ?? data?.email ?? '')) { setError('Enter a valid email address.'); return }
    if (tab === 'Profile' && !(phone ?? data?.phone ?? '').trim()) { setError('Phone number is required.'); return }
    if (tab === 'Security' && (!current || !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password) || password !== confirm)) { setError('Enter the current password, meet the password rules and confirm the match.'); return }
    setError('')
    setMessage('Form checks passed. Profile changes are not saved in Phase 1.')
    setToast(true)
  }
  return <div className="profile-page"><div className="page-header"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & Settings</h1><p className="page-subtitle">Manage your account details and preferences.</p></div></div><div className="content-card profile-content"><Tabs items={['Profile', 'Security', 'Notifications']} active={tab} onChange={(value) => { setTab(value); setError(''); setMessage('') }} />{loading ? <Loader /> : loadError || !data ? <EmptyState title="Profile unavailable" message={loadError || 'Profile data is unavailable.'} /> : tab === 'Profile' ? <form className="form-grid" onSubmit={submit} noValidate><TextInput label="Full name" value={name ?? data.name} onChange={setName} error={error.startsWith('Full name') ? error : undefined} /><TextInput label="Email address" value={email ?? data.email} onChange={setEmail} type="email" error={error.startsWith('Enter a valid email') ? error : undefined} /><TextInput label="Phone number" value={phone ?? data.phone} onChange={setPhone} error={error.startsWith('Phone number') ? error : undefined} /><div className="form-actions"><button className="button button-primary" type="submit">Save changes</button></div></form> : tab === 'Security' ? <form className="form-grid" onSubmit={submit} noValidate><PasswordInput label="Current password" value={current} onChange={setCurrent} error={error || undefined} /><PasswordInput label="New password" value={password} onChange={setPassword} hint="At least 8 characters, one uppercase letter and one number." /><PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} /><div className="form-actions"><button className="button button-primary" type="submit">Update password</button></div></form> : <form onSubmit={submit}><div className="settings-block"><h3>How should we reach you?</h3><p>These preferences are shown for Phase 1; they are not saved.</p><Toggle label="Email notifications" checked={emailAlerts} onChange={setEmailAlerts} /><Toggle label="SMS notifications" checked={smsAlerts} onChange={setSmsAlerts} /></div><div className="form-actions"><button className="button button-primary" type="submit">Save preferences</button></div></form>}{message && <p className="inline-notice">{message}</p>}</div>{toast && <Toast onClose={() => setToast(false)}>Preferences are not saved in this phase.</Toast>}</div>
}

function UtilityFrame({ code, title, message, actions }: { code: string; title: string; message: string; actions: ReactNode }) {
  return <div className="utility-page"><div className="utility-card"><div className="utility-code">{code} · MDMS</div><h1>{title}</h1><p>{message}</p><div className="utility-actions">{actions}</div></div></div>
}

export function NotFoundPage() {
  return <UtilityFrame code="404" title="We couldn’t find that page" message="The address may be incorrect, or the page may have moved." actions={<><Link className="button button-primary" to="/login">Go to sign in</Link><button className="button button-secondary" onClick={() => window.history.back()}>Go back</button></>} />
}

export function ErrorPage() {
  const error = useRouteError()
  const title = error instanceof Error ? error.message : 'Something went wrong while opening this page.'
  return <UtilityFrame code="500" title="A server error occurred" message={`${title} The page can be reloaded or you can return to sign in.`} actions={<><button className="button button-primary" onClick={() => window.location.reload()}>Reload page</button><Link className="button button-secondary" to="/login">Back to sign in</Link></>} />
}

export function MaintenancePage() {
  return <UtilityFrame code="MAINTENANCE" title="A quick service pause" message="This utility page is available for maintenance notices in Phase 1." actions={<Link className="button button-primary" to="/login">Return to sign in</Link>} />
}

export function AccessDeniedPage() {
  return <UtilityFrame code="ACCESS DENIED" title="This area isn’t available" message="Choose one of the temporary Phase 1 workspaces to continue." actions={<><Link className="button button-primary" to="/user/dashboard">End-user</Link><Link className="button button-secondary" to="/zone/dashboard">Zone admin</Link><Link className="button button-secondary" to="/enterprise/dashboard">Enterprise</Link></>} />
}

