import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api } from '../api.ts'
import { monthOptions } from '../dateUtils.ts'

const WEEKDAY_LABELS = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So']

interface MonthOption {
  year: number
  month: number
  label: string
}

interface DayInfo {
  day: number
  label: string
  weekend: boolean
  today: boolean
}

function buildDays(year: number, month: number): DayInfo[] {
  const count = new Date(year, month, 0).getDate()
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const date = new Date(year, month - 1, day)
    const weekday = date.getDay()
    return {
      day,
      label: WEEKDAY_LABELS[weekday],
      weekend: weekday === 0 || weekday === 6,
      today: date.toDateString() === today.toDateString(),
    }
  })
}

export default function LogStops() {
  const { token } = useAuth()
  const months = useMemo<MonthOption[]>(() => monthOptions(), [])

  const { data: driversData } = useFetch(() => api.getDrivers(token!), [token])
  const drivers = driversData ?? []

  const [driverId, setDriverId] = useState('')
  const [selected, setSelected] = useState<MonthOption>(months[0])
  const [values, setValues] = useState<Record<number, number | undefined>>({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    if (!driverId && drivers.length > 0) setDriverId(drivers[0]._id)
  }, [drivers, driverId])

  const { data: entries, loading, error, setError } = useFetch(
    () =>
      driverId
        ? api.getLogStops({ driver: driverId, year: String(selected.year), month: String(selected.month) }, token!)
        : Promise.resolve([]),
    [driverId, selected, token]
  )

  useEffect(() => {
    setSavedMsg('')
    const byDay: Record<number, number | undefined> = {}
    ;(entries ?? []).forEach((e) => {
      byDay[new Date(e.date).getDate()] = e.stops
    })
    setValues(byDay)
  }, [entries])

  const days = buildDays(selected.year, selected.month)
  const total = Object.values(values).reduce((sum: number, v) => sum + (v || 0), 0)

  const update = (day: number, val: string) => {
    setValues((v) => ({ ...v, [day]: val === '' ? undefined : Number(val) }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSavedMsg('')
    try {
      const entries = Object.entries(values).filter(([, v]) => v !== undefined)
      await Promise.all(
        entries.map(([day, stops]) => {
          const date = `${selected.year}-${String(selected.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          return api.saveLogStop({ driver: driverId, date, stops: stops as number }, token!)
        })
      )
      setSavedMsg('Uložené.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm h-fit">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold">{t.logStops.title}</h1>
            <p className="text-sm text-slate mt-1">{t.logStops.subtitle}</p>
          </div>

          <div className="p-6 pb-0 flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate block mb-1.5">{t.logStops.driver}</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              >
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate block mb-1.5">{t.logStops.month}</label>
              <select
                value={`${selected.year}-${selected.month}`}
                onChange={(e) => {
                  const m = months.find((o) => `${o.year}-${o.month}` === e.target.value)
                  if (m) setSelected(m)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              >
                {months.map((m) => (
                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}
          {loading && <p className="px-6 pt-4 text-sm text-slate">Načítavam...</p>}

          <div className="p-6 grid grid-cols-3 gap-x-5 gap-y-2">
            {days.map((day) => (
              <div
                key={day.day}
                className={`flex items-center justify-between py-1.5 ${day.weekend ? 'opacity-40' : ''} ${
                  day.today ? 'bg-accent-light rounded-lg px-2' : ''
                }`}
              >
                <span className={`text-sm ${day.today ? 'font-semibold' : ''}`}>{day.label} {day.day}.</span>
                <input
                  type="number"
                  min="0"
                  disabled={day.weekend}
                  value={values[day.day] ?? ''}
                  placeholder={t.logStops.placeholder}
                  onChange={(e) => update(day.day, e.target.value)}
                  className="w-14 text-center border border-gray-300 rounded-lg py-1.5 text-sm"
                />
              </div>
            ))}
          </div>

          <p className="px-6 text-xs text-gray-400">{t.logStops.empty}</p>

          <div className="p-6 mt-2 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm">
              <span className="text-slate">{t.logStops.total}</span>
              <span className="font-bold ml-1.5">{total} {t.logStops.stops}</span>
              {savedMsg && <span className="text-green-600 ml-3">{savedMsg}</span>}
            </div>
            <button
              onClick={save}
              disabled={saving || !driverId}
              className="bg-accent text-white rounded-lg px-6 py-3 font-semibold text-sm disabled:opacity-60"
            >
              {saving ? 'Ukladám...' : t.logStops.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
