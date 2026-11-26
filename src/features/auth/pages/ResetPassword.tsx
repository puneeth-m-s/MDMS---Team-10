import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { PasswordInput } from '../components/FormFields'
import { useToast } from '../components/Toast'
import {
  PASSWORD_RULES,
  validateConfirmPassword,
  validateNewPassword,
} from '../utils/validators'

// Phase 1 rule: any token of 6+ characters counts as a valid link.
const MIN_TOKEN_LENGTH = 6

export default function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({ password: false, confirm: false })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Reset password · MDMS'
  }, [])

  const errors = {
    password: validateNewPassword(password),
    confirm: validateConfirmPassword(password, confirm),
  }
  const visible = (field: 'password' | 'confirm') => (submitted || touched[field] ? errors[field] : undefined)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }
    if (errors.confirm) {
      confirmRef.current?.focus()
      return
    }
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success('Password changed. Please sign in with your new password.')
    navigate('/login', { replace: true })
  }

  if (token.length < MIN_TOKEN_LENGTH) {
    return (
      <AuthShell title="Link not valid" subtitle="This reset link is invalid or has expired.">
        <div className="flex flex-col gap-4">
          <Link to="/forgot-password" className="btn btn-primary w-full">
            Request a new link
          </Link>
          <Link to="/login" className="text-center text-sm font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you have not used before.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordInput
          ref={passwordRef}
          label="New password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={visible('password')}
        />

        <ul aria-label="Password rules" className="-mt-1 flex flex-col gap-1 text-[13px]">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password)
            return (
              <li key={rule.id} className={ok ? 'text-primary' : 'text-muted'}>
                <span aria-hidden="true">{ok ? '✓' : '○'}</span> {rule.label}
              </li>
            )
          })}
        </ul>

        <PasswordInput
          ref={confirmRef}
          label="Confirm new password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={visible('confirm')}
        />

        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Change password'}
        </button>
        <Link to="/login" className="text-center text-sm font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}