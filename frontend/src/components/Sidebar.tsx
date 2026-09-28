import { Link, NavLink, useNavigate } from 'react-router-dom'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import Logo from './Logo.tsx'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/prehlad', label: t.nav.overview },
    { to: '/zastavky', label: t.nav.logStops },
    { to: '/vodici', label: t.nav.drivers },
    { to: '/vozidla', label: t.nav.vehicles },
  ]

  return (
    <div className="w-60 shrink-0 sticky top-0 h-screen overflow-y-auto bg-ink text-platinum flex flex-col gap-8 p-5">
      <Link to="/">
        <Logo variant="light" />
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `px-3 py-2.5 rounded-lg text-sm ${
                isActive ? 'bg-white/10 font-medium' : 'text-platinum/65 hover:bg-white/5'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-5 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-ink shrink-0">
            {user ? initials(user.name) : '-'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-platinum/55">{user ? 'Admin' : ''}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-platinum/65 hover:text-platinum hover:bg-white/5 rounded-lg px-3 py-2 -mx-3 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Odhlásiť sa
        </button>
      </div>
    </div>
  )
}
