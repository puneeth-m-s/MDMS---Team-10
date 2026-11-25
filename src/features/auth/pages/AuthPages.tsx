import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PasswordInput, TextInput, Toast } from '../../../shared/components/ui'

function AuthBrand() {
  return <div className="auth-brand"><span className="brand-mark">M</span><span>MDMS</span></div>
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = { email: !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email address.' : '', password: password.length < 1 ? 'Password is required.' : '' }
    setErrors(next)
    if (!next.email && !next.password) navigate('/user/dashboard')
  }
  return <div className="auth-page"><div className="auth-wrap"><AuthBrand /><section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to Meterwise</h1><p>Manage your meter data from one clear workspace.</p><form className="auth-form" onSubmit={submit} noValidate><TextInput label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} /><PasswordInput label="Password" value={password} onChange={setPassword} error={errors.password} /><div className="auth-options"><label className="form-check"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label><Link className="text-button" to="/forgot-password">Forgot password?</Link></div><button type="submit" className="button button-primary">Sign in <span>→</span></button></form><div className="auth-foot"><span>Secure access to your energy data</span></div></section><section className="role-switcher"><p>Phase 1 demo · choose a workspace to continue</p><div className="role-links"><Link to="/user/dashboard">End-user</Link><Link to="/zone/dashboard">Zone admin</Link><Link to="/enterprise/dashboard">Enterprise</Link></div></section></div></div>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [toast, setToast] = useState(false)
  const valid = /^\S+@\S+\.\S+$/.test(email)
  const send = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!valid) { setError('Enter a valid email address.'); return } setError(''); setSent(true) }
  return <div className="auth-page"><div className="auth-wrap"><AuthBrand /><section className="auth-card">{sent ? <div className="check-email"><div className="email-mark">✉</div><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Check your email</h1><p>If an account exists for <strong>{email}</strong>, a reset link would arrive there. Email delivery is not connected in Phase 1.</p><Link className="button button-primary" to="/reset-password/demo-token">Continue to reset password</Link><button className="button button-secondary resend-button" type="button" onClick={() => setToast(true)}>Resend reset link</button><div className="auth-foot"><Link className="text-button" to="/login">← Back to Login</Link></div></div> : <><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Forgot password?</h1><p>Enter the email address associated with your account.</p><form className="auth-form" onSubmit={send} noValidate><TextInput label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" error={error} /><button type="submit" className="button button-primary">Send reset link</button></form><div className="auth-foot"><Link className="text-button" to="/login">← Back to Login</Link></div></>}</section>{toast && <Toast onClose={() => setToast(false)}>Reset email is not sent in Phase 1.</Toast>}</div></div>
}

export function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [updated, setUpdated] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = { password: !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password) ? 'Use at least 8 characters, including an uppercase letter and a number.' : '', confirm: confirm !== password ? 'Passwords do not match.' : '' }
    setErrors(next)
    if (!next.password && !next.confirm) setUpdated(true)
  }
  return <div className="auth-page"><div className="auth-wrap"><AuthBrand /><section className="auth-card">{updated ? <div className="check-email"><div className="email-mark">✓</div><p className="eyebrow">PASSWORD UPDATED</p><h1>You’re all set</h1><p>Your password passed the form checks. Passwords are not saved or changed in Phase 1.</p><Link className="button button-primary" to="/login">Continue to Login</Link></div> : <><p className="eyebrow">RESET PASSWORD</p><h1>Choose a new password</h1><p>Reset token: <code>{token ?? 'missing'}</code></p><form className="auth-form" onSubmit={submit} noValidate><PasswordInput label="New password" value={password} onChange={setPassword} hint="At least 8 characters, one uppercase letter and one number." error={errors.password} /><PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} error={errors.confirm} /><button type="submit" className="button button-primary">Update password</button></form></>}</section></div></div>
}
