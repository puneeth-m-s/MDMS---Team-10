import type { ReactNode } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

const HIGHLIGHTS = [
  'Track your consumption day by day',
  'See bills and payment status at a glance',
  'Get alerts the moment usage looks unusual',
]

/** The page frame shared by Login, Forgot password and Reset password. */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel: desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
        <span aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white/20 text-xl font-extrabold">M</span>
          <span className="text-2xl font-extrabold tracking-tight">MDMS</span>
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-4xl leading-tight font-bold">Know your power. Own your usage.</h2>
          <ul className="mt-8 flex flex-col gap-3 text-base text-white/90">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-bold">✓</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">Meter Data Management System</p>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col items-center justify-center px-4 py-14 sm:px-8">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn absolute top-4 right-4 h-9 px-3 text-[13px]"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-xl font-extrabold text-white">M</span>
          <span className="text-2xl font-extrabold tracking-tight">MDMS</span>
        </div>

        <div className="card w-full max-w-[460px]">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 mb-6 text-muted">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </main>
    </div>
  )
}