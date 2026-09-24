import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useLanguage } from '../LanguageContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { monthOptions } from '../dateUtils.js'

const WEEKDAY_LABELS = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So']

function buildDays(year, month) {
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
  const { t } = useLanguage()
  const { token } = useAuth()
  const months = useMemo(monthOptions, [])

  const [drivers, setDrivers] = useState([])
  const [driverId, setDriverId] = useState('')
  const [selected, setSelected] = useState(months[0])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    api.getDrivers(token).then((ds) => {
      setDrivers(ds)
      if (ds.length > 0) setDriverId(ds[0]._id)
    }).catch((err) => setError(err.message))
  }, [token])

  useEffect(() => {
    if (!driverId) return
    setLoading(true)
    setSavedMsg('')
    api
      .getLogStops({ driver: driverId, year: selected.year, month: selected.month }, token)
      .then((entries) => {
        const byDay = {}
        entries.forEach((e) => {
          byDay[new Date(e.date).getDate()] = e.stops
        })
        setValues(byDay)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [driverId, selected, token])

  const days = buildDays(selected.year, selected.month)
  const total = Object.values(values).reduce((sum, v) => sum + (v || 0), 0)

  const update = (day, val) => {
    setValues((v) => ({ ...v, [day]: val === '' ? undefined : Number(val) }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSavedMsg('')
    try {
      const entries = Object.entries(values).filter(([, v]) => v !== undefined && v !== null)
      await Promise.all(
        entries.map(([day, stops]) => {
          const date = `${selected.year}-${String(selected.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          return api.saveLogStop({ driver: driverId, date, stops }, token)
        })
      )
      setSavedMsg('Uložené.')
    } catch (err) {
      setError(err.message)
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
                  setSelected(m)
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
