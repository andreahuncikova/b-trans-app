import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../LanguageContext.jsx'
import { useAuth } from '../AuthContext.jsx'

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Sidebar() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/prehlad', label: t.nav.overview },
    { to: '/zastavky', label: t.nav.logStops },
    { to: '/report', label: t.nav.report },
    { to: '/vodici', label: t.nav.drivers },
    { to: '/vozidla', label: t.nav.vehicles },
  ]

  return (
    <div className="w-60 shrink-0 bg-ink text-platinum flex flex-col gap-8 p-5">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F21" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
            <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
          </svg>
        </div>
        <div className="font-display font-bold text-lg">B-Trans</div>
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
            {user ? initials(user.name) : '—'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-platinum/55">{user?.role === 'admin' ? 'Admin' : 'Vodič'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-platinum/55 text-left hover:text-platinum"
        >
          Odhlásiť sa
        </button>
      </div>
    </div>
  )
}
