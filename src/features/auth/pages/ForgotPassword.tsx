import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Input } from '../components/FormFields'
import { validateEmail } from '../utils/validators'

// Phase 1 has no email service, so the "link we sent" is a fixed demo link.
const DEMO_RESET_LINK = '/reset-password/demo-reset-token'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Forgot password · MDMS'
  }, [])

  const error = validateEmail(email)
  const shownError = submitted || touched ? error : undefined

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (error) {
      inputRef.current?.focus()
      return
    }
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSending(false)
    setSentTo(email.trim())
  }

  function startOver() {
    setSentTo(null)
    setSubmitted(false)
    setTouched(false)
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email" subtitle={`If an account exists for ${sentTo}, we have sent a link to reset the password.`}>
        <div className="flex flex-col gap-4">
          <p className="rounded-control border border-line bg-primary-soft px-3 py-3 text-sm">
            <strong>Demo only:</strong> no real email is sent in Phase 1. Use this link to continue:{' '}
            <Link to={DEMO_RESET_LINK} className="font-semibold text-primary underline">
              Open reset link
            </Link>
          </p>
          <button type="button" className="btn w-full" onClick={startOver}>
            Use a different email
          </button>
          <Link to="/login" className="text-center text-sm font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we will send you a link to choose a new one.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          ref={inputRef}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={shownError}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={sending}>
          {sending ? 'Sending…' : 'Send reset link'}
        </button>
        <Link to="/login" className="text-center text-sm font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}