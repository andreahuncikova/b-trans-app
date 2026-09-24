import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useLanguage } from '../LanguageContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Drivers() {
  const { t } = useLanguage()
  const { token } = useAuth()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingType, setAddingType] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    api
      .getDrivers(token)
      .then(setDrivers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const permanent = drivers.filter((d) => d.type === 'permanent')
  const substitutes = drivers.filter((d) => d.type === 'substitute')

  const submitNewDriver = async (e) => {
    e.preventDefault()
    if (!name) return
    try {
      const created = await api.addDriver({ name, type: addingType, role: t.drivers.role }, token)
      setDrivers((ds) => [...ds, created])
      setName('')
      setAddingType(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const AddForm = ({ type }) => (
    <form onSubmit={submitNewDriver} className="px-5 py-4 flex items-center gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Meno a priezvisko"
        autoFocus
        required
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
      />
      <button type="submit" className="bg-accent text-white rounded-lg px-5 py-2.5 font-semibold text-sm">
        Uložiť
      </button>
      <button type="button" onClick={() => { setAddingType(null); setName('') }} className="text-sm text-slate px-2">
        Zrušiť
      </button>
    </form>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t.drivers.title}</h1>
            <p className="text-slate text-sm mt-1">{t.drivers.subtitle}</p>
          </div>
          <button
            onClick={() => setAddingType('permanent')}
            className="bg-accent text-white rounded-lg px-5 py-3 font-semibold text-sm"
          >
            {t.drivers.addDriver}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-sm text-slate mb-4">Načítavam...</p>}

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">{t.drivers.permanentTitle}</div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-7">
          {permanent.map((p, i) => (
            <div key={p._id} className={`flex items-center gap-3.5 px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-ink text-platinum flex items-center justify-center text-sm font-semibold">
                {initials(p.name)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-sm text-slate">{p.role || t.drivers.role}</div>
              </div>
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">{t.drivers.active}</span>
              <a href="#" className="text-sm font-semibold text-accent">{t.drivers.detail}</a>
            </div>
          ))}
          {addingType === 'permanent' && (
            <div className={permanent.length > 0 ? 'border-t border-gray-100' : ''}>
              <AddForm type="permanent" />
            </div>
          )}
          {permanent.length === 0 && addingType !== 'permanent' && !loading && (
            <div className="px-5 py-4 text-sm text-slate">Zatiaľ žiadni stáli vodiči.</div>
          )}
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">{t.drivers.substituteTitle}</div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {substitutes.map((s, i) => (
            <div key={s._id} className={`flex items-center gap-3.5 px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 text-slate flex items-center justify-center text-sm font-semibold">
                {initials(s.name)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-sm text-slate">{s.role || t.drivers.substituteRole}</div>
              </div>
              <span className="bg-accent-light text-accent text-xs font-semibold px-2.5 py-1 rounded-full">{t.drivers.substituteTag}</span>
              <a href="#" className="text-sm font-semibold text-accent">{t.drivers.detail}</a>
            </div>
          ))}
          {addingType === 'substitute' ? (
            <div className={substitutes.length > 0 ? 'border-t border-gray-100' : ''}>
              <AddForm type="substitute" />
            </div>
          ) : (
            <div className="px-5 py-4">
              <button
                onClick={() => setAddingType('substitute')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3.5 text-sm font-semibold text-slate"
              >
                {t.drivers.addSubstitute}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
