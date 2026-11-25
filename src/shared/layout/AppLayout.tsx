import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '../types'
import { ServiceFeatureContext } from '../services/ServiceFeatureContext'

const roleNames: Record<UserRole, string> = { 'end-user': 'End-user', 'zone-admin': 'Zone admin', enterprise: 'Enterprise' }
const menus: Record<UserRole, Array<{ label: string; path: string; icon: string }>> = {
  'end-user': [
    { label: 'Dashboard', path: '/user/dashboard', icon: '⌂' }, { label: 'Bills & Payments', path: '/user/bills', icon: '▤' },
    { label: 'Meter Data', path: '/user/meter-data', icon: '⌁' }, { label: 'Alerts', path: '/user/alerts', icon: '◉' },
  ],
  'zone-admin': [
    { label: 'Dashboard', path: '/zone/dashboard', icon: '⌂' }, { label: 'Meter Management', path: '/zone/meters', icon: '⌁' },
    { label: 'User Management', path: '/zone/users', icon: '♙' }, { label: 'Reports & Analytics', path: '/zone/reports', icon: '▥' },
    { label: 'Alerts', path: '/zone/alerts', icon: '◉' }, { label: 'Settings', path: '/zone/settings', icon: '⚙' },
  ],
  enterprise: [
    { label: 'Dashboard', path: '/enterprise/dashboard', icon: '⌂' }, { label: 'Zone Management', path: '/enterprise/zones', icon: '▦' },
    { label: 'Meter Management', path: '/enterprise/meters', icon: '⌁' }, { label: 'User & Role Management', path: '/enterprise/users', icon: '♙' },
    { label: 'Reports & Analytics', path: '/enterprise/reports', icon: '▥' }, { label: 'Alerts', path: '/enterprise/alerts', icon: '◉' },
    { label: 'Audit Logs', path: '/enterprise/audit-logs', icon: '▤' }, { label: 'Settings', path: '/enterprise/settings', icon: '⚙' },
  ],
}

function initialTheme() {
  return window.localStorage.getItem('mdms-theme') === 'dark' ? 'dark' : 'light'
}

export function AppLayout({ role }: { role: UserRole }) {
  const [theme, setTheme] = useState(initialTheme)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const roleName = roleNames[role]

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('mdms-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('mdms-role', role)
    setSidebarOpen(false)
    setProfileOpen(false)
  }, [role, location.pathname])

  return <ServiceFeatureContext.Provider value={role}><div className="app-shell">
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <NavLink to={menus[role][0].path} className="brand"><span className="brand-mark">M</span><span>MDMS<small>METER DATA MANAGEMENT</small></span></NavLink>
      <div className="sidebar-label">WORKSPACE</div>
      <div className="role-chip"><span className="role-dot" />{roleName} workspace</div>
      <nav className="side-nav" aria-label={`${roleName} navigation`}>
        {menus[role].map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-foot">MDMS · Phase 1 <span>v1.0</span></div></div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <button type="button" className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>☰</button>
        <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{menus[role].find((item) => location.pathname === item.path)?.label ?? (location.pathname === '/profile' ? 'Profile & Settings' : roleName)}</strong></div>
        <div className="topbar-actions">
          <label className="language-select"><span className="globe">◎</span><select aria-label="Language"><option>English</option><option>ಕನ್ನಡ</option><option>हिन्दी</option></select></label>
          <button type="button" className="icon-button notification-button" aria-label="Notifications, 3 unread" onClick={() => navigate(role === 'end-user' ? '/user/alerts' : role === 'zone-admin' ? '/zone/alerts' : '/enterprise/alerts')}><svg className="bell-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><i>3</i></button>
          <button type="button" className="theme-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><span>{theme === 'light' ? '☾' : '☀'}</span></button>
          <div className="profile-wrap"><button type="button" className="profile-trigger" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><span className="avatar">{role === 'end-user' ? 'AR' : role === 'zone-admin' ? 'SN' : 'MK'}</span><span className="profile-name">{role === 'end-user' ? 'Ananya Rao' : role === 'zone-admin' ? 'Sahana Nayak' : 'Meera Kulkarni'}<small>{roleName}</small></span><span className="chevron">⌄</span></button>{profileOpen && <div className="profile-menu"><button onClick={() => navigate('/profile')}>Profile</button><button onClick={() => navigate('/profile')}>Settings</button><button onClick={() => navigate('/login')}>Log out</button></div>}</div>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
    </div>
  </div></ServiceFeatureContext.Provider>
}
