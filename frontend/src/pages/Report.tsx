import { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api } from '../api.ts'
import { monthOptions } from '../dateUtils.ts'

interface MonthOption {
  year: number
  month: number
  label: string
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Report() {
  const { token } = useAuth()
  const months = useMemo<MonthOption[]>(() => monthOptions(), [])
  const [selected, setSelected] = useState<MonthOption>(months[0])

  const { data, loading, error } = useFetch(
    () => api.getReport(selected.year, selected.month, token!),
    [selected, token]
  )
  const rows = data?.rows ?? []
  const totals = data?.totals ?? { days: 0, stops: 0, hours: 0 }

  const exportCsv = () => {
    const header = [t.report.driver, t.report.workedDays, t.report.hoursLabel, t.report.stopsLabel]
    const lines = rows.map((r) => [r.driver.name, r.days, r.hours || 0, r.stops].join(';'))
    const csv = [header.join(';'), ...lines].join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${selected.year}-${String(selected.month).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
                if (m) setSelected(m)
              }}
              className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white"
            >
              {months.map((m) => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{m.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold bg-white disabled:opacity-50"
            >
              {t.report.export}
            </button>
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
          <div className="grid grid-cols-4 px-5 py-2.5 text-xs text-gray-400 font-semibold uppercase">
            <div>{t.report.driver}</div><div>{t.report.workedDays}</div><div>{t.report.hoursLabel}</div><div>{t.report.stopsLabel}</div>
          </div>
          {rows.map((r) => (
            <div key={r.driver._id} className="grid grid-cols-4 px-5 py-4 items-center border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-ink text-platinum flex items-center justify-center text-xs font-semibold">
                  {initials(r.driver.name)}
                </div>
                <span className="font-medium">{r.driver.name}</span>
              </div>
              <div className="text-slate">{r.days}</div>
              <div className="text-slate">{r.hours || 0}</div>
              <div className="text-slate">{r.stops}</div>
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
