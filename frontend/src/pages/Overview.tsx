import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api } from '../api.ts'
import { MONTH_NAMES, monthOptions } from '../dateUtils.ts'
import type { LogStopEntry } from '../types.ts'

interface MonthOption {
  year: number
  month: number
  label: string
}

type EntryWithDriver = LogStopEntry & { driver: NonNullable<LogStopEntry['driver']> }

function hasDriver(entry: LogStopEntry): entry is EntryWithDriver {
  return entry.driver !== null
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay() // 0=Sun..6=Sat
  const leadingNulls = (firstWeekday + 6) % 7 // shift to Monday-first
  const cells: (number | null)[] = Array(leadingNulls).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  return cells
}

function formatSelectedDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('sk-SK', { weekday: 'long' })
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day}. ${MONTH_NAMES[month - 1].toLowerCase()}`
}

function heat(stops: number) {
  if (!stops) return 'bg-[#F9F8F4]'
  if (stops >= 7) return 'bg-[#5FCFC3] text-white'
  if (stops >= 5) return 'bg-[#A8E8E1]'
  return 'bg-accent-light'
}

export default function Overview() {
  const { token } = useAuth()
  const now = useMemo(() => new Date(), [])
  const months = useMemo<MonthOption[]>(() => monthOptions(), [])
  const [selected, setSelected] = useState<MonthOption>(months[0])
  const { year, month } = selected
  const today = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedDay, setSelectedDay] = useState(isCurrentMonth ? today : 1)

  useEffect(() => {
    setSelectedDay(isCurrentMonth ? today : 1)
    // only reset when the chosen month changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const { data: driversData } = useFetch(() => api.getDrivers(token!), [token])
  const drivers = driversData ?? []

  const { data: entriesData, loading, error } = useFetch(
    () => api.getLogStops({ year: String(year), month: String(month) }, token!),
    [token, year, month]
  )
  const entries = (entriesData ?? []).filter(hasDriver)
  const filteredEntries = selectedDriverId ? entries.filter((e) => e.driver._id === selectedDriverId) : entries

  const { data: reportData } = useFetch(() => api.getReport(year, month, token!), [token, year, month])
  const reportRows = (reportData?.rows ?? []).filter((r) => !selectedDriverId || r.driver._id === selectedDriverId)
  const totals = reportData?.totals ?? { days: 0, stops: 0, hours: 0 }

  const calendarDays = buildCalendarDays(year, month)

  const byDay = useMemo(() => {
    const map = new Map<number, { total: number; byDriver: Map<string, { name: string; stops: number }> }>()
    for (const entry of filteredEntries) {
      const day = new Date(entry.date).getDate()
      if (!map.has(day)) map.set(day, { total: 0, byDriver: new Map() })
      const dayEntry = map.get(day)!
      dayEntry.total += entry.stops
      const driverEntry = dayEntry.byDriver.get(entry.driver._id) ?? { name: entry.driver.name, stops: 0 }
      driverEntry.stops += entry.stops
      dayEntry.byDriver.set(entry.driver._id, driverEntry)
    }
    return map
  }, [filteredEntries])

  const selectedDayInfo = byDay.get(selectedDay)
  const selectedDayDrivers = selectedDayInfo ? [...selectedDayInfo.byDriver.values()].sort((a, b) => b.stops - a.stops) : []

  const exportCsv = () => {
    const header = [t.overview.driver, t.overview.workedDays, t.overview.hoursLabel, t.overview.stopsLabel]
    const lines = reportRows.map((r) => [r.driver.name, r.days, r.hours || 0, r.stops].join(';'))
    const csv = [header.join(';'), ...lines].join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${year}-${String(month).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold">{t.overview.title}</h1>
            <p className="text-slate text-sm mt-1">{t.overview.subtitle}</p>
          </div>
          <div className="flex gap-2.5 items-center">
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
            <div className="relative">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                <option value="">{t.overview.allEmployees}</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={reportRows.length === 0}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold bg-white hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              {t.overview.export}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4 shrink-0">{error}</p>}
        {loading && <p className="text-sm text-slate mb-4 shrink-0">Načítavam...</p>}

        <div className="flex gap-4 mb-5 shrink-0">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.overview.totalDays}</div>
            <div className="font-display text-3xl font-bold mt-1.5">{totals.days}</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.overview.hours}</div>
            <div className="font-display text-3xl font-bold mt-1.5">{totals.hours || 0}</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">{t.overview.delivered}</div>
            <div className="font-display text-3xl font-bold mt-1.5 text-accent">{totals.stops}</div>
          </div>
        </div>

        <div className="flex gap-5 mb-5 shrink-0">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-slate text-center">
              {t.overview.weekdayLabels.map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                const info = day ? byDay.get(day) : undefined
                const isToday = isCurrentMonth && day === today
                const isSelected = day === selectedDay
                return (
                  <button
                    type="button"
                    key={i}
                    disabled={!day}
                    onClick={() => day && setSelectedDay(day)}
                    className={`rounded-lg p-2 h-16 text-left ${day ? heat(info?.total ?? 0) : ''} ${
                      isToday ? 'ring-2 ring-accent' : ''
                    } ${isSelected && !isToday ? 'outline outline-2 outline-ink outline-offset-1' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="text-xs text-slate">{day}</div>
                        {info?.total ? <div className="text-sm font-bold mt-1">{info.total}</div> : null}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-72 shrink-0 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-xs font-semibold text-accent">{t.overview.selectedDate}</div>
            <div className="font-display text-lg font-bold mt-1">{formatSelectedDate(year, month, selectedDay)}</div>
            {selectedDayDrivers.length > 0 ? (
              <>
                <div className="text-sm text-slate mt-0.5">
                  {selectedDayInfo?.total} {t.logStops.stops}
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {selectedDayDrivers.map((d) => (
                    <div key={d.name} className="flex justify-between">
                      <span className="text-slate">{d.name}</span>
                      <span className="font-semibold">{d.stops}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-3">{t.overview.noStops}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3 shrink-0">{t.overview.note}</p>
      </div>

      <Link
        to="/zastavky"
        title={t.nav.logStops}
        aria-label={t.nav.logStops}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  )
}
