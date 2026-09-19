import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useLanguage } from '../LanguageContext.jsx'

const vehicles = [
  { name: 'Kamión — Mercedes-Benz Actros', plate: 'PB-123AB', driver: 'Milan Novák (živnostník, vozí pre FedEx)', lastStk: '2025-10-12', interval: 1 },
  { name: 'Dodávka — Ford Transit', plate: 'PB-456CD', driver: 'Peter Kováč', lastStk: '2024-11-03', interval: 2 },
  { name: 'Dodávka — Volkswagen Crafter', plate: 'PB-789EF', driver: 'Jozef Slabý', lastStk: '2025-09-24', interval: 1 },
]

const SOON_DAYS = 30

function nextStk(lastStk, interval) {
  if (!lastStk) return null
  const d = new Date(lastStk)
  d.setFullYear(d.getFullYear() + Number(interval))
  return d
}

export default function Vehicles() {
  const { t, lang } = useLanguage()
  const [state, setState] = useState(() =>
    Object.fromEntries(vehicles.map((v) => [v.plate, { checked: false, reason: '', lastStk: v.lastStk, interval: v.interval }]))
  )
  const update = (plate, patch) =>
    setState((s) => ({ ...s, [plate]: { ...s[plate], ...patch } }))

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t.vehicles.title}</h1>
          <p className="text-slate text-sm mt-1">{t.vehicles.subtitle}</p>
        </div>

        <div className="flex flex-col gap-4">
          {vehicles.map((v) => {
            const s = state[v.plate]
            const next = nextStk(s.lastStk, s.interval)
            const daysLeft = next ? Math.ceil((next - new Date()) / 86400000) : null
            const overdue = daysLeft !== null && daysLeft < 0
            const soon = daysLeft !== null && daysLeft <= SOON_DAYS
            const nextLabel = next
              ? next.toLocaleDateString(lang === 'en' ? 'en-GB' : 'sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
            return (
            <div key={v.plate} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8">
                  <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
                  <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base">{v.name}</div>
                <div className="text-sm text-slate mt-0.5">{t.vehicles.plate} {v.plate} · {t.vehicles.driver}: {v.driver}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${soon ? 'text-amber-600' : 'text-gray-400'}`}>{t.vehicles.nextService}</div>
                <div className={`text-sm font-semibold mt-0.5 ${soon ? 'text-amber-600' : ''}`}>{nextLabel}</div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                s.checked ? 'bg-amber-50 text-amber-600'
                  : overdue ? 'bg-red-50 text-red-600'
                  : soon ? 'bg-accent-light text-accent' : 'bg-green-50 text-green-600'
              }`}>
                {s.checked ? t.vehicles.inService : overdue ? t.vehicles.overdue : soon ? t.vehicles.soon : t.vehicles.inUse}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <label className="flex items-center gap-2">
                <span className="text-slate">{t.vehicles.lastStk}</span>
                <input
                  type="date"
                  value={s.lastStk}
                  onChange={(e) => update(v.plate, { lastStk: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-slate">{t.vehicles.interval}</span>
                <select
                  value={s.interval}
                  onChange={(e) => update(v.plate, { interval: Number(e.target.value) })}
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
                  checked={s.checked}
                  onChange={(e) => update(v.plate, { checked: e.target.checked })}
                  className="w-4 h-4 accent-[#00A99D]"
                />
                {t.vehicles.serviceCheck}
              </label>
              {s.checked && (
                <input
                  type="text"
                  value={s.reason}
                  onChange={(e) => update(v.plate, { reason: e.target.value })}
                  placeholder={t.vehicles.reasonPlaceholder}
                  aria-label={t.vehicles.reason}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              )}
            </div>
            </div>
            )
          })}

          <button className="self-start border-2 border-dashed border-gray-300 rounded-lg px-5 py-3 text-sm font-semibold text-slate">
            {t.vehicles.addVehicle}
          </button>
        </div>
      </div>
    </div>
  )
}
