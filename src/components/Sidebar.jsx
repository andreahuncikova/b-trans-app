import { NavLink } from 'react-router-dom'
import { useLanguage } from '../LanguageContext.jsx'

export default function Sidebar() {
  const { t, lang, setLang } = useLanguage()

  const links = [
    { to: '/prehlad', label: t.nav.overview },
    { to: '/zastavky', label: t.nav.logStops },
    { to: '/report', label: t.nav.report },
    { to: '/vodici', label: t.nav.drivers },
    { to: '/vozidla', label: t.nav.vehicles },
  ]

  return (
    <div className="w-60 shrink-0 bg-ink text-platinum flex flex-col gap-8 p-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F21" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
            <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
          </svg>
        </div>
        <div className="font-display font-bold text-lg">B-Trans</div>
      </div>

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
        <div className="flex gap-2 rounded-lg bg-white/5 p-1">
          {['sk', 'en'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold ${
                lang === code ? 'bg-accent text-ink' : 'text-platinum/75'
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-ink">
            MN
          </div>
          <div>
            <div className="text-sm font-medium">Milan Novák</div>
            <div className="text-xs text-platinum/55">Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
