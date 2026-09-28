import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.tsx'
import Spinner from '../components/Spinner.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api } from '../api.ts'
import { monthOptions } from '../dateUtils.ts'

const WEEKDAY_LABELS = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']

interface MonthOption {
  year: number
  month: number
  label: string
}

interface DayInfo {
  day: number
  weekend: boolean
  today: boolean
}

function buildCalendarDays(year: number, month: number): (DayInfo | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay() // 0=Sun..6=Sat
  const leadingNulls = (firstWeekday + 6) % 7 // shift to Monday-first
  const today = new Date()
  const cells: (DayInfo | null)[] = Array(leadingNulls).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const weekday = date.getDay()
    cells.push({
      day,
      weekend: weekday === 0 || weekday === 6,
      today: date.toDateString() === today.toDateString(),
    })
  }
  return cells
}

export default function LogStops() {
  const { token } = useAuth()
  const months = useMemo<MonthOption[]>(() => monthOptions(), [])

  const { data: driversData } = useFetch(() => api.getDrivers(token!), [token])
  const drivers = driversData ?? []

  const [driverId, setDriverId] = useState('')
  const [selected, setSelected] = useState<MonthOption>(months[0])
  const [values, setValues] = useState<Record<number, number | undefined>>({})
  const [entryIds, setEntryIds] = useState<Record<number, string>>({})
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
    const idsByDay: Record<number, string> = {}
    ;(entries ?? []).forEach((e) => {
      const day = new Date(e.date).getDate()
      byDay[day] = e.stops
      idsByDay[day] = e._id
    })
    setValues(byDay)
    setEntryIds(idsByDay)
  }, [entries])

  const calendarDays = buildCalendarDays(selected.year, selected.month)
  const total = Object.values(values).reduce((sum: number, v) => sum + (v || 0), 0)

  const update = (day: number, val: string) => {
    setValues((v) => ({ ...v, [day]: val === '' ? undefined : Number(val) }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSavedMsg('')
    try {
      const toSave = Object.entries(values).filter(([, v]) => v !== undefined)
      const toDelete = Object.entries(entryIds).filter(([day]) => values[Number(day)] === undefined)
      const [savedEntries] = await Promise.all([
        Promise.all(
          toSave.map(async ([day, stops]) => {
            const date = `${selected.year}-${String(selected.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const entry = await api.saveLogStop({ driver: driverId, date, stops: stops as number }, token!)
            return [Number(day), entry._id] as const
          })
        ),
        Promise.all(toDelete.map(([, id]) => api.deleteLogStop(id, token!))),
      ])
      setEntryIds((ids) => {
        const next = { ...ids }
        toDelete.forEach(([day]) => delete next[Number(day)])
        savedEntries.forEach(([day, id]) => {
          next[day] = id
        })
        return next
      })
      setSavedMsg('Uložené.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between mb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-bold">{t.logStops.title}</h1>
            <p className="text-slate text-sm mt-1">{t.logStops.subtitle}</p>
          </div>
          <div className="flex gap-2.5 items-center">
            <div className="relative">
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="relative">
              <select
                value={`${selected.year}-${selected.month}`}
                onChange={(e) => {
                  const m = months.find((o) => `${o.year}-${o.month}` === e.target.value)
                  if (m) setSelected(m)
                }}
                className="appearance-none border border-gray-300 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                {months.map((m) => (
                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{m.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {!driverId && !loading && (
          <p className="text-sm text-slate mb-4 shrink-0">Najprv pridaj vodiča v sekcii Vodiči.</p>
        )}
        {error && <p className="text-sm text-red-600 mb-4 shrink-0">{error}</p>}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {loading ? (
            <Spinner />
          ) : (
          <>
          <div className="grid grid-cols-7 gap-3 mb-3 text-xs font-semibold text-slate text-center">
            {WEEKDAY_LABELS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 h-16 flex items-center justify-between ${
                  day ? (day.weekend ? 'bg-gray-50 opacity-50' : 'bg-[#F9F8F4]') : ''
                } ${day?.today ? 'ring-2 ring-accent' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-xs ${day.today ? 'font-semibold text-accent' : 'text-slate'}`}>{day.day}</span>
                    <input
                      type="number"
                      min="0"
                      disabled={day.weekend}
                      value={values[day.day] ?? ''}
                      placeholder={t.logStops.placeholder}
                      onChange={(e) => update(day.day, e.target.value)}
                      className="w-12 text-center border border-gray-300 rounded-lg py-1 text-sm bg-white disabled:bg-transparent"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 flex items-center justify-between border-t border-gray-100">
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
          </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-9 shrink-0">{t.logStops.empty}</p>
      </div>
    </div>
  )
}
