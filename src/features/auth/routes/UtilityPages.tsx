import { useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  Link,
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom'

type Tone = 'primary' | 'danger' | 'warning'

/** Full class names in a lookup, never built with string templates, or Tailwind can't see them. */
const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-primary',
  danger: 'text-danger',
  warning: 'text-warning',
}

interface StatusPageProps {
  code: string
  title: string
  message: string
  tone?: Tone
  children?: ReactNode
}

/** One shared layout for every utility page, so they all look consistent. */
function StatusPage({ code, title, message, tone = 'primary', children }: StatusPageProps) {
  return (
    <section
      aria-labelledby="status-title"
      // Inside the app layout: 60vh. Standalone, directly under #root: full screen.
      className="grid min-h-[60vh] place-items-center p-6 text-center [#root>&]:min-h-screen"
    >
      <div className="w-full max-w-[520px]">
        <p
          aria-hidden="true"
          className={`mb-2 text-[length:clamp(64px,18vw,120px)] leading-none font-extrabold tracking-tighter ${TONE_TEXT[tone]}`}
        >
          {code}
        </p>
        <h1 id="status-title" className="mb-2 text-[length:clamp(22px,5vw,28px)] font-bold">
          {title}
        </h1>
        <p className="mx-auto mb-6 max-w-[44ch] text-muted">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  )
}

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

/* ---------- 404 ---------- */
export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you are looking for does not exist or may have been moved."
    >
      <Link to="/" className="btn btn-primary">Back to home</Link>
      <button type="button" className="btn" onClick={() => navigate(-1)}>Go back</button>
    </StatusPage>
  )
}

/* ---------- 500 (used as the router's error element) ---------- */
export function ServerErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    if (import.meta.env.DEV) console.error('Route error:', error)
  }, [error])

  return (
    <StatusPage
      code="500"
      title="Something went wrong"
      message="An unexpected error occurred. Please try again, or come back in a few minutes."
      tone="danger"
    >
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
        Try again
      </button>
      <Link to="/" className="btn">Back to home</Link>
      {import.meta.env.DEV && (
        <details className="mt-2 basis-full text-left text-[13px] text-muted">
          <summary>Error details (development only)</summary>
          <pre className="mt-2 rounded-control border border-line bg-surface-2 p-3 break-words whitespace-pre-wrap">
            {getErrorMessage(error)}
          </pre>
        </details>
      )}
    </StatusPage>
  )
}

/* ---------- Maintenance ---------- */
export function MaintenancePage() {
  return (
    <StatusPage
      code="503"
      title="We'll be back soon"
      message="MDMS is undergoing scheduled maintenance. Your data is safe, and the service will return shortly."
      tone="warning"
    >
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
        Check again
      </button>
    </StatusPage>
  )
}

/* ---------- Access denied ---------- */
export function AccessDeniedPage() {
  const navigate = useNavigate()
  return (
    <StatusPage
      code="403"
      title="Access denied"
      message="You do not have permission to view this page. If you think this is a mistake, contact your administrator."
      tone="danger"
    >
      <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>Go back</button>
      <Link to="/login" className="btn">Back to login</Link>
    </StatusPage>
  )
}