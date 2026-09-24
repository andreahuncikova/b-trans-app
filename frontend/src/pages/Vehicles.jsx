import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useLanguage } from '../LanguageContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'

const SOON_DAYS = 30

function nextStk(lastStk, interval) {
  if (!lastStk) return null
  const d = new Date(lastStk)
  d.setFullYear(d.getFullYear() + Number(interval))
  return d
}

export default function Vehicles() {
  const { t } = useLanguage()
  const { token } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ name: '', plate: '' })

  useEffect(() => {
    api
      .getVehicles(token)
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const patchVehicle = async (id, patch) => {
    setVehicles((vs) => vs.map((v) => (v._id === id ? { ...v, ...patch } : v)))
    try {
      await api.updateVehicle(id, patch, token)
    } catch (err) {
      setError(err.message)
    }
  }

  const submitNewVehicle = async (e) => {
    e.preventDefault()
    if (!newVehicle.name || !newVehicle.plate) return
    try {
      const created = await api.addVehicle(newVehicle, token)
      setVehicles((vs) => [...vs, created])
      setNewVehicle({ name: '', plate: '' })
      setAdding(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t.vehicles.title}</h1>
          <p className="text-slate text-sm mt-1">{t.vehicles.subtitle}</p>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-sm text-slate">Načítavam...</p>}

        <div className="flex flex-col gap-4">
          {vehicles.map((v) => {
            const next = nextStk(v.lastStk, v.stkIntervalYears)
            const daysLeft = next ? Math.ceil((next - new Date()) / 86400000) : null
            const overdue = daysLeft !== null && daysLeft < 0
            const soon = daysLeft !== null && daysLeft <= SOON_DAYS
            const nextLabel = next
              ? next.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
            return (
              <div key={v._id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8">
                      <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
                      <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{v.name}</div>
                    <div className="text-sm text-slate mt-0.5">
                      {t.vehicles.plate} {v.plate}
                      {v.driver && <> · {t.vehicles.driver}: {v.driver.name}</>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${soon ? 'text-amber-600' : 'text-gray-400'}`}>{t.vehicles.nextService}</div>
                    <div className={`text-sm font-semibold mt-0.5 ${soon ? 'text-amber-600' : ''}`}>{nextLabel}</div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    v.inService ? 'bg-amber-50 text-amber-600'
                      : overdue ? 'bg-red-50 text-red-600'
                      : soon ? 'bg-accent-light text-accent' : 'bg-green-50 text-green-600'
                  }`}>
                    {v.inService ? t.vehicles.inService : overdue ? t.vehicles.overdue : soon ? t.vehicles.soon : t.vehicles.inUse}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-slate">{t.vehicles.lastStk}</span>
                    <input
                      type="date"
                      value={v.lastStk ? v.lastStk.slice(0, 10) : ''}
                      onChange={(e) => patchVehicle(v._id, { lastStk: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-slate">{t.vehicles.interval}</span>
                    <select
                      value={v.stkIntervalYears}
                      onChange={(e) => patchVehicle(v._id, { stkIntervalYears: Number(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                    >
                      <option value={1}>{t.vehicles.oneYear}</option>
                      <option value={2}>{t.vehicles.twoYears}</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={v.inService}
                      onChange={(e) => patchVehicle(v._id, { inService: e.target.checked })}
                      className="w-4 h-4 accent-[#00A99D]"
                    />
                    {t.vehicles.serviceCheck}
                  </label>
                  {v.inService && (
                    <input
                      type="text"
                      value={v.serviceReason || ''}
                      onChange={(e) => patchVehicle(v._id, { serviceReason: e.target.value })}
                      placeholder={t.vehicles.reasonPlaceholder}
                      aria-label={t.vehicles.reason}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  )}
                </div>
              </div>
            )
          })}

          {adding ? (
            <form onSubmit={submitNewVehicle} className="bg-white rounded-2xl shadow-sm p-5 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate block mb-1.5">Názov vozidla</label>
                <input
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle((n) => ({ ...n, name: e.target.value }))}
                  placeholder="napr. Dodávka — Fiat Ducato"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate block mb-1.5">{t.vehicles.plate}</label>
                <input
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle((n) => ({ ...n, plate: e.target.value }))}
                  placeholder="PB-000XX"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <button type="submit" className="bg-accent text-white rounded-lg px-5 py-2.5 font-semibold text-sm">
                Uložiť
              </button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm text-slate px-2 py-2.5">
                Zrušiť
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="self-start border-2 border-dashed border-gray-300 rounded-lg px-5 py-3 text-sm font-semibold text-slate"
            >
              {t.vehicles.addVehicle}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
