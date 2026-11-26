import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Input , PasswordInput } from '../components/FormFields'
import { useToast } from '../components/Toast'
import { ROLE_META } from '../layout/menuConfig'
import type { UserRole } from '../layout/menuConfig'
import { validateEmail, validateLoginPassword } from '../utils/validators'
import type { DemoSession , User } from '../../end-user/types/models' 
import { getErrorMessage } from '../../../services/http'
import { fetchList, fetchOne } from '../../../services/query'

const ROLE_KEY = 'mdms-role' // same key AppLayout reads
const DEMO_PASSWORD = 'Demo@1234'
const ROLE_ORDER: UserRole[] = ['user', 'zone', 'enterprise']

interface DemoAccount {
  role: UserRole
  name: string
  email: string
}

type AccountsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; accounts: DemoAccount[] }

function readStoredRole(): UserRole {
  try {
    const saved = localStorage.getItem(ROLE_KEY)
    if (saved === 'user' || saved === 'zone' || saved === 'enterprise') return saved
  } catch {
    // storage can be blocked; use the default
  }
  return 'user'
}

export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()

  const [role, setRole] = useState<UserRole>(readStoredRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [demo, setDemo] = useState<AccountsState>({ status: 'loading' })

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Sign in · MDMS'
  }, [])

  // Real demo accounts come from the API (so this screen also proves the backend is connected).
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const session = await fetchOne<DemoSession>('/demoSession')
        const ids = [session.consumerId, session.zoneAdminId, session.enterpriseAdminId]
        const users = await fetchList<User>('/users', { filters: { id: ids } })
        if (cancelled) return

        const byId = new Map(users.map((u) => [u.id, u]))
        const make = (accountRole: UserRole, id: string): DemoAccount | null => {
          const u = byId.get(id)
          return u ? { role: accountRole, name: u.name, email: u.email } : null
        }
        const accounts = [
          make('user', session.consumerId),
          make('zone', session.zoneAdminId),
          make('enterprise', session.enterpriseAdminId),
        ].filter((a): a is DemoAccount => a !== null)
        setDemo({ status: 'ready', accounts })
      } catch (err) {
        if (!cancelled) setDemo({ status: 'error', message: getErrorMessage(err) })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const errors = {
    email: validateEmail(email),
    password: validateLoginPassword(password),
  }
  const visible = (field: 'email' | 'password') => (submitted || touched[field] ? errors[field] : undefined)

  function fillFrom(account: DemoAccount) {
    setRole(account.role)
    setEmail(account.email)
    setPassword(DEMO_PASSWORD)
    setTouched({ email: false, password: false })
    setSubmitted(false)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    // Phase 1 has no real authentication: pretend to check, remember the role, go to its home page.
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      localStorage.setItem(ROLE_KEY, role)
    } catch {
      // ignore storage errors
    }
    toast.success(`Signed in as ${ROLE_META[role].label}.`)
    navigate(ROLE_META[role].home, { replace: true })
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Pick a role, then use any valid email and a password of 6+ characters."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Sign in as</legend>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_ORDER.map((r) => (
              <label
                key={r}
                className={`cursor-pointer rounded-control border px-2 py-2.5 text-center text-[13px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                  role === r ? 'border-primary bg-primary-soft text-primary' : 'border-line hover:bg-primary-soft'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                {ROLE_META[r].label}
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          ref={emailRef}
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={visible('email')}
        />

        <PasswordInput
          ref={passwordRef}
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={visible('password')}
        />

        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Demo accounts */}
      <section aria-label="Demo accounts" className="mt-6 border-t border-line pt-5">
        <h2 className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">Demo accounts</h2>

        {demo.status === 'loading' && <p className="text-sm text-muted">Loading demo accounts…</p>}

        {demo.status === 'error' && (
          <p role="alert" className="rounded-control border border-line bg-primary-soft px-3 py-2 text-sm">
            Could not load demo accounts. {demo.message} You can still sign in by typing any valid email.
          </p>
        )}

        {demo.status === 'ready' && (
          <ul className="flex flex-col gap-2">
            {demo.accounts.map((account) => (
              <li
                key={account.role}
                className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-primary">{ROLE_META[account.role].label}</p>
                  <p className="truncate text-sm">{account.name}</p>
                  <p className="truncate text-[13px] text-muted">{account.email}</p>
                </div>
                <button type="button" className="btn h-9 shrink-0 px-3 text-[13px]" onClick={() => fillFrom(account)}>
                  Use
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AuthShell>
  )
}