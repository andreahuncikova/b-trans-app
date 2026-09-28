import { useState, type ChangeEvent, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar.tsx'
import Spinner from '../components/Spinner.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api, type VehiclePatch } from '../api.ts'

const SOON_DAYS = 30
const MAX_PHOTO_DIM = 900

function nextStk(lastStk: string | null, interval: number) {
  if (!lastStk) return null
  const d = new Date(lastStk)
  d.setFullYear(d.getFullYear() + Number(interval))
  return d
}

function vignetteExpiry(purchasedAt: string | null, intervalDays: number) {
  if (!purchasedAt) return null
  const d = new Date(purchasedAt)
  d.setDate(d.getDate() + Number(intervalDays))
  return d
}

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Nepodarilo sa načítať súbor'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Súbor nie je platný obrázok'))
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIM / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Prehliadač nepodporuje spracovanie obrázkov'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
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

  const handlePhotoChange = async (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      await patchVehicle(id, { photo: dataUrl })
    } catch (err) {
      setError((err as Error).message)
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between mb-5 shrink-0">
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

        {error && <p className="text-sm text-red-600 mb-4 shrink-0">{error}</p>}

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
            const vExpiry = vignetteExpiry(v.vignettePurchasedAt, v.vignetteIntervalDays)
            const vExpiryLabel = vExpiry
              ? vExpiry.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
              : null
            const vDaysLeft = vExpiry ? Math.ceil((vExpiry.getTime() - new Date().getTime()) / 86400000) : null
            const vOverdue = vDaysLeft !== null && vDaysLeft < 0
            const vSoon = vDaysLeft !== null && vDaysLeft <= SOON_DAYS
            return (
              <div key={v._id} className="bg-white rounded-2xl shadow-sm p-5 flex gap-5">
                <label
                  className="group relative w-56 h-56 rounded-xl bg-accent-light flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                  title="Zmeniť fotku vozidla"
                >
                  {v.photo ? (
                    <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8">
                      <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
                      <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
                    </svg>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h3l2-3h6l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(v._id, e)}
                  />
                </label>
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base">{v.name}</div>
                    <div className="text-sm text-slate mt-0.5">{t.vehicles.plate} {v.plate}</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm shrink-0">
                    <span className="text-slate">{t.vehicles.driver}</span>
                    <div className="relative">
                      <select
                        value={v.driver?._id ?? ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => patchVehicle(v._id, { driver: e.target.value || null })}
                        className="appearance-none border border-gray-300 rounded-lg pl-3 pr-9 py-1.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <option value="">-</option>
                        {drivers.map((d) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </label>
                  {v.inService && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
                      {t.vehicles.inService}
                    </span>
                  )}
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

                <div className="grid grid-cols-2 gap-10">
                  <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{t.vehicles.nextService}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${overdue ? 'bg-red-50 text-red-600' : soon ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                        {nextLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <label className="flex items-center gap-2">
                        <span className="text-slate">{t.vehicles.lastStk}</span>
                        <input
                          type="date"
                          value={v.lastStk ? v.lastStk.slice(0, 10) : ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => patchVehicle(v._id, { lastStk: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-accent"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <span className="text-slate">{t.vehicles.interval}</span>
                        <div className="relative">
                          <select
                            value={v.stkIntervalYears}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              patchVehicle(v._id, { stkIntervalYears: Number(e.target.value) as 1 | 2 | 4 })
                            }
                            className="appearance-none border border-gray-300 rounded-lg pl-3 pr-9 py-1.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
                          >
                            <option value={1}>{t.vehicles.oneYear}</option>
                            <option value={2}>{t.vehicles.twoYears}</option>
                            <option value={4}>{t.vehicles.fourYears}</option>
                          </select>
                          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{t.vehicles.vignette}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${vOverdue ? 'bg-red-50 text-red-600' : vSoon ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                        {vExpiryLabel ?? '-'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <label className="flex items-center gap-2">
                        <span className="text-slate">{t.vehicles.vignettePurchased}</span>
                        <input
                          type="date"
                          value={v.vignettePurchasedAt ? v.vignettePurchasedAt.slice(0, 10) : ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => patchVehicle(v._id, { vignettePurchasedAt: e.target.value || null })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-accent"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <span className="text-slate">{t.vehicles.vignetteDuration}</span>
                        <div className="relative">
                          <select
                            value={v.vignetteIntervalDays}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              patchVehicle(v._id, { vignetteIntervalDays: Number(e.target.value) as 10 | 30 | 365 })
                            }
                            className="appearance-none border border-gray-300 rounded-lg pl-3 pr-9 py-1.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
                          >
                            <option value={10}>{t.vehicles.vignette10Days}</option>
                            <option value={30}>{t.vehicles.vignette1Month}</option>
                            <option value={365}>{t.vehicles.vignette1Year}</option>
                          </select>
                          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
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
