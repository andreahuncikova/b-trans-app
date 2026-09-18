import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'

const initialDays = [
  { d: '1.9.', label: 'Ut', value: 4 }, { d: '2.9.', label: 'St', value: 3 }, { d: '3.9.', label: 'Št', value: 6 },
  { d: '4.9.', label: 'Pi', value: 4 }, { d: '5.9.', label: 'So', weekend: true }, { d: '6.9.', label: 'Ne', weekend: true },
  { d: '7.9.', label: 'Po', value: 5 }, { d: '8.9.', label: 'Ut', value: 4 }, { d: '9.9.', label: 'St', value: 3 },
  { d: '10.9.', label: 'Št', value: 8 }, { d: '11.9.', label: 'Pi', value: 5 }, { d: '12.9.', label: 'So', weekend: true },
  { d: '13.9.', label: 'Ne', weekend: true }, { d: '14.9.', label: 'Po', value: 4 }, { d: '15.9.', label: 'St', value: null, today: true },
  { d: '16.9.', label: 'Št', value: null }, { d: '17.9.', label: 'Pi', value: null }, { d: '18.9.', label: 'So', weekend: true },
]

export default function LogStops() {
  const [days, setDays] = useState(initialDays)

  const update = (i, val) => {
    const next = [...days]
    next[i] = { ...next[i], value: val === '' ? null : Number(val) }
    setDays(next)
  }

  const total = days.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm h-fit">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold">Zapísať zastávky</h1>
            <p className="text-sm text-slate mt-1">
              Vyber vodiča a mesiac — počty môžeš doplniť kedykoľvek, aj spätne za celý mesiac naraz.
            </p>
          </div>

          <div className="p-6 pb-0 flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate block mb-1.5">Vodič</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                <option>Peter Kováč — Dodávka</option>
                <option>Jozef Slabý — Dodávka</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate block mb-1.5">Mesiac</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                <option>September 2026</option>
                <option>August 2026</option>
              </select>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-x-5 gap-y-2">
            {days.map((day, i) => (
              <div
                key={day.d}
                className={`flex items-center justify-between py-1.5 ${day.weekend ? 'opacity-40' : ''} ${
                  day.today ? 'bg-accent-light rounded-lg px-2' : ''
                }`}
              >
                <span className={`text-sm ${day.today ? 'font-semibold' : ''}`}>{day.label} {day.d}</span>
                <input
                  type="number"
                  min="0"
                  disabled={day.weekend}
                  value={day.value ?? ''}
                  placeholder="—"
                  onChange={(e) => update(i, e.target.value)}
                  className="w-14 text-center border border-gray-300 rounded-lg py-1.5 text-sm"
                />
              </div>
            ))}
          </div>

          <p className="px-6 text-xs text-gray-400">
            Prázdne polia = zatiaľ nezapísané dni. Víkendy sú needitovateľné.
          </p>

          <div className="p-6 mt-2 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm">
              <span className="text-slate">Spolu za mesiac:</span>
              <span className="font-bold ml-1.5">{total} zastávok</span>
            </div>
            <button className="bg-accent text-white rounded-lg px-6 py-3 font-semibold text-sm">Uložiť</button>
          </div>
        </div>
      </div>
    </div>
  )
}
