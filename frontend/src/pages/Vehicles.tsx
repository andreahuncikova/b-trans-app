import { useState, type ChangeEvent, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar.tsx'
import Spinner from '../components/Spinner.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api, type VehiclePatch } from '../api.ts'

const SOON_DAYS = 30

function nextStk(lastStk: string | null, interval: number) {
  if (!lastStk) return null
  const d = new Date(lastStk)
  d.setFullYear(d.getFullYear() + Number(interval))
  return d
}

export default function Vehicles() {
  const { token } = useAuth()
  const { data: vehicles, setData: setVehicles, loading, error, setError } = useFetch(
    () => api.getVehicles(token!),
    [token]
  )
  const { data: driversData } = useFetch(() => api.getDrivers(token!), [token])
  const drivers = driversData ?? []
  const [adding, setAdding] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ name: '', plate: '' })

  const patchVehicle = async (id: string, patch: VehiclePatch) => {
    const previous = (vehicles ?? []).find((v) => v._id === id)
    setVehicles((vs) =>
      vs
        ? vs.map((v) => {
            if (v._id !== id) return v
            const driver =
              patch.driver !== undefined
                ? patch.driver
                  ? drivers.find((d) => d._id === patch.driver) ?? v.driver
                  : null
                : v.driver
            return { ...v, ...patch, driver }
          })
        : vs
    )
    try {
      await api.updateVehicle(id, patch, token!)
    } catch (err) {
      setError((err as Error).message)
      if (previous) setVehicles((vs) => (vs ? vs.map((v) => (v._id === id ? previous : v)) : vs))
    }
  }

  const deleteVehicle = async (id: string, name: string) => {
    if (!window.confirm(`Naozaj vymazať vozidlo „${name}“?`)) return
    try {
      await api.deleteVehicle(id, token!)
      setVehicles((vs) => (vs ? vs.filter((v) => v._id !== id) : vs))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitNewVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newVehicle.name || !newVehicle.plate) return
    try {
      const created = await api.addVehicle(newVehicle, token!)
      setVehicles((vs) => (vs ? [...vs, created] : [created]))
      setNewVehicle({ name: '', plate: '' })
      setAdding(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t.vehicles.title}</h1>
            <p className="text-slate text-sm mt-1">{t.vehicles.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-accent text-white rounded-lg px-5 py-3 font-semibold text-sm"
          >
            {t.vehicles.addVehicle}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading ? (
          <Spinner />
        ) : (
        <div className="flex flex-col gap-4">
          {(vehicles ?? []).map((v) => {
            const next = nextStk(v.lastStk, v.stkIntervalYears)
            const daysLeft = next ? Math.ceil((next.getTime() - new Date().getTime()) / 86400000) : null
            const overdue = daysLeft !== null && daysLeft < 0
            const soon = daysLeft !== null && daysLeft <= SOON_DAYS
            const nextLabel = next
              ? next.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
              : '-'
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
                  <button
                    type="button"
                    onClick={() => deleteVehicle(v._id, v.name)}
                    title="Vymazať vozidlo"
                    aria-label="Vymazať vozidlo"
                    className="text-gray-300 hover:text-red-500 shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-slate">{t.vehicles.driver}</span>
                    <select
                      value={v.driver?._id ?? ''}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => patchVehicle(v._id, { driver: e.target.value || null })}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                    >
                      <option value="">-</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-slate">{t.vehicles.lastStk}</span>
                    <input
                      type="date"
                      value={v.lastStk ? v.lastStk.slice(0, 10) : ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => patchVehicle(v._id, { lastStk: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-slate">{t.vehicles.interval}</span>
                    <select
                      value={v.stkIntervalYears}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        patchVehicle(v._id, { stkIntervalYears: Number(e.target.value) as 1 | 2 })
                      }
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => patchVehicle(v._id, { inService: e.target.checked })}
                      className="w-4 h-4 accent-[#00A99D]"
                    />
                    {t.vehicles.serviceCheck}
                  </label>
                  {v.inService && (
                    <input
                      type="text"
                      value={v.serviceReason || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => patchVehicle(v._id, { serviceReason: e.target.value })}
                      placeholder={t.vehicles.reasonPlaceholder}
                      aria-label={t.vehicles.reason}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    />
                  )}
                </div>
              </div>
            )
          })}

          {adding && (
            <form onSubmit={submitNewVehicle} className="bg-white rounded-2xl shadow-sm p-5 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate block mb-1.5">Názov vozidla</label>
                <input
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle((n) => ({ ...n, name: e.target.value }))}
                  placeholder="napr. Dodávka Fiat Ducato"
                  required
                  autoFocus
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
          )}
        </div>
        )}
      </div>
    </div>
  )
}
