import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useLanguage } from '../LanguageContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'
import { monthOptions } from '../dateUtils.js'

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Report() {
  const { t } = useLanguage()
  const { token } = useAuth()
  const months = useMemo(() => monthOptions(), [])
  const [selected, setSelected] = useState(months[0])
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ days: 0, stops: 0, hours: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .getReport(selected.year, selected.month, token)
      .then((data) => {
        setRows(data.rows)
        setTotals(data.totals)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selected, token])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t.report.title}</h1>
            <p className="text-slate text-sm mt-1">{t.report.subtitle}</p>
          </div>
          <div className="flex gap-2.5">
            <select
              value={`${selected.year}-${selected.month}`}
              onChange={(e) => {
                const m = months.find((o) => `${o.year}-${o.month}` === e.target.value)
                setSelected(m)
              }}
              className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white"
            >
              {months.map((m) => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-sm text-slate mb-4">Načítavam...</p>}

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.report.totalDays}</div>
            <div className="font-display text-3xl font-bold mt-1.5">{totals.days}</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.report.hours}</div>
            <div className="font-display text-3xl font-bold mt-1.5">{totals.hours || 0}</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.report.delivered}</div>
            <div className="font-display text-3xl font-bold mt-1.5 text-accent">{totals.stops}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-semibold text-sm">{t.report.byDriver}</div>
          <div className="grid grid-cols-5 px-5 py-2.5 text-xs text-gray-400 font-semibold uppercase">
            <div>{t.report.driver}</div><div>{t.report.workedDays}</div><div>{t.report.hoursLabel}</div><div>{t.report.stopsLabel}</div><div></div>
          </div>
          {rows.map((r) => (
            <div key={r.driver._id} className="grid grid-cols-5 px-5 py-4 items-center border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-ink text-platinum flex items-center justify-center text-xs font-semibold">
                  {initials(r.driver.name)}
                </div>
                <span className="font-medium">{r.driver.name}</span>
              </div>
              <div className="text-slate">{r.days}</div>
              <div className="text-slate">{r.hours || 0}</div>
              <div className="text-slate">{r.stops}</div>
              <div><a href="#" className="text-accent font-semibold">{t.report.detail}</a></div>
            </div>
          ))}
          {rows.length === 0 && !loading && (
            <div className="px-5 py-4 text-sm text-slate">Za tento mesiac zatiaľ nie sú zapísané žiadne zastávky.</div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">{t.report.note}</p>
      </div>
    </div>
  )
}
