import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../theme/ThemeProvider'
import { ROLE_META, getRoleFromPath } from './menuConfig'
import type { MenuIconName, UserRole } from './menuConfig'

/** Joins class names, skipping falsy values. Tailwind needs COMPLETE class names in the source. */
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

/* ---------- Icons (inline SVG, no extra dependency) ---------- */
type IconName =
  | MenuIconName
  | 'menu' | 'close' | 'search' | 'sun' | 'moon'
  | 'user' | 'logout' | 'chevronsLeft' | 'chevronDown'

const ICONS: Record<IconName, ReactNode> = {
  dashboard: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>),
  bills: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
  meterData: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  alerts: (<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>),
  zones: (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>),
  meters: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  reports: (<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>),
  audit: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  settings: (<><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>),
  menu: (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>),
  close: (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
  search: (<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>),
  sun: (<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  user: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  chevronsLeft: (<><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></>),
  chevronDown: <polyline points="6 9 12 15 18 9" />,
}

function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}

/* ---------- Small helpers ---------- */
const ROLE_KEY = 'mdms-role'
const LANG_KEY = 'mdms-lang'
const UNREAD_NOTIFICATIONS = 3 // static for Phase 1

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
] as const

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

function readStoredRole(): UserRole {
  const v = readStored(ROLE_KEY)
  return v === 'zone' || v === 'enterprise' || v === 'user' ? v : 'user'
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/* ---------- Layout ---------- */
export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Role comes from the URL; shared pages like /profile reuse the last known role.
  const pathRole = getRoleFromPath(pathname)
  const role: UserRole = pathRole ?? readStoredRole()
  const meta = ROLE_META[role]

  useEffect(() => {
    if (pathRole) writeStored(ROLE_KEY, pathRole)
  }, [pathRole])

  const [collapsed, setCollapsed] = useState(false) // desktop
  const [mobileOpen, setMobileOpen] = useState(false) // mobile / tablet drawer
  const [query, setQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [lang, setLang] = useState<string>(() => readStored(LANG_KEY) ?? 'en')

  const profileRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? meta.menu.filter((m) => m.label.toLowerCase().includes(q)) : meta.menu
  }, [meta.menu, query])

  const alertsPath = meta.menu.find((m) => m.icon === 'alerts')?.path ?? meta.home

  // Close popups with Escape; close the profile menu on outside click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setProfileOpen(false)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  // Stop the page behind the mobile drawer from scrolling.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [mobileOpen])

  const handleLang = (code: string) => {
    setLang(code)
    writeStored(LANG_KEY, code) // screen only, no translation in Phase 1
  }

  const closeAll = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  return (
    <div
      className={cx(
        'grid min-h-screen grid-cols-1 transition-[grid-template-columns] duration-200',
        collapsed ? 'lg:grid-cols-[76px_minmax(0,1fr)]' : 'lg:grid-cols-[264px_minmax(0,1fr)]',
      )}
    >
      <a
        href="#main"
        className="absolute -top-12 left-3 z-[100] rounded-control bg-primary px-3.5 py-2 text-on-primary focus:top-3"
      >
        Skip to content
      </a>

      {/* ---------- Sidebar: drawer below lg, sticky column from lg up ---------- */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(290px,85vw)] flex-col gap-4 overflow-x-hidden overflow-y-auto border-r border-line bg-surface p-3 shadow-pop transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none',
        )}
      >
        <div
          className={cx(
            'flex min-h-10 items-center justify-between gap-2 px-1',
            collapsed && 'lg:justify-center',
          )}
        >
          <span
            className={cx(
              'rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-bold whitespace-nowrap text-primary',
              collapsed && 'lg:hidden',
            )}
          >
            {meta.label}
          </span>

          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="close" />
          </button>

          <button
            type="button"
            className="icon-btn hidden lg:inline-grid"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <Icon name="chevronsLeft" className={cx('transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <label
          className={cx(
            'flex h-[42px] items-center gap-2 rounded-control border border-line bg-surface-2 px-3 text-muted focus-within:border-primary',
            collapsed && 'lg:hidden',
          )}
        >
          <Icon name="search" size={18} />
          <span className="sr-only">Search menu</span>
          <input
            type="search"
            placeholder="Search menu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted"
          />
        </label>

        <nav>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={item.label}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    cx(
                      'flex h-11 items-center gap-3 rounded-control px-3 font-medium whitespace-nowrap transition-colors',
                      collapsed && 'lg:justify-center lg:px-0',
                      isActive
                        ? 'bg-primary-soft font-bold text-primary'
                        : 'text-muted hover:bg-surface-2 hover:text-fg',
                    )
                  }
                >
                  <Icon name={item.icon} className="shrink-0" />
                  <span className={cx(collapsed && 'lg:hidden')}>{item.label}</span>
                </NavLink>
              </li>
            ))}
            {items.length === 0 && (
              <li className="px-3 py-2 text-[13px] text-muted">No matching menu items</li>
            )}
          </ul>
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---------- Header + page content ---------- */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-surface px-3.5 lg:px-6">
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-label="Open menu"
            aria-controls="app-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <Link to={meta.home} className="inline-flex items-center gap-2.5" aria-label="MDMS home">
            <span className="grid size-9 place-items-center rounded-control bg-primary font-extrabold text-on-primary">
              M
            </span>
            <span className="flex flex-col leading-[1.1]">
              <span className="text-lg font-extrabold max-[420px]:hidden">MDMS</span>
              <span className="hidden text-xs font-medium text-muted sm:block">Meter Data Management</span>
            </span>
          </Link>

          <div className="flex-1" />

          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => handleLang(e.target.value)}
            className="h-10 rounded-control border border-line bg-surface px-2.5 max-[420px]:px-1"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          <Link
            to={alertsPath}
            className="icon-btn"
            aria-label={`Notifications, ${UNREAD_NOTIFICATIONS} unread`}
          >
            <Icon name="alerts" />
            <span className="absolute top-[3px] right-[3px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-[5px] text-[11px] leading-none font-bold text-white">
              {UNREAD_NOTIFICATIONS}
            </span>
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex h-11 items-center gap-2.5 rounded-control px-2 hover:bg-surface-2"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((o) => !o)}
            >
              <span className="grid size-[34px] place-items-center rounded-full bg-primary-soft text-[13px] font-extrabold text-primary">
                {initials(meta.displayName)}
              </span>
              <span className="hidden flex-col items-start text-sm leading-tight font-semibold sm:flex">
                {meta.displayName}
                <small className="text-xs font-normal text-muted">{meta.label}</small>
              </span>
              <Icon name="chevronDown" size={16} />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute top-[calc(100%+8px)] right-0 min-w-[230px] rounded-card border border-line bg-surface p-2 shadow-pop"
              >
                <div className="mb-1.5 border-b border-line px-3 pt-2 pb-2.5">
                  <strong className="block">{meta.displayName}</strong>
                  <span className="text-[13px] text-muted">{meta.email}</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="flex h-10 w-full items-center gap-2.5 rounded-control px-3 text-left hover:bg-surface-2"
                  onClick={() => { setProfileOpen(false); navigate('/profile') }}
                >
                  <Icon name="user" size={18} /> Profile &amp; Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex h-10 w-full items-center gap-2.5 rounded-control px-3 text-left text-danger hover:bg-surface-2"
                  onClick={() => { setProfileOpen(false); navigate('/login') }}
                >
                  <Icon name="logout" size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1600px] flex-1 p-4 lg:p-6">
          <Suspense
            fallback={
              <div className="grid min-h-[40vh] place-items-center">
                <div
                  role="status"
                  aria-label="Loading"
                  className="size-9 animate-spin rounded-full border-[3px] border-line border-t-primary"
                />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}