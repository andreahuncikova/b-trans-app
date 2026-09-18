import Sidebar from '../components/Sidebar.jsx'

const days = [
  null, { d: 1 }, { d: 2, stops: 3 }, { d: 3, stops: 6 }, { d: 4, stops: 4 }, { d: 5, stops: 5 }, { d: 6 }, { d: 7 },
  { d: 8, stops: 4 }, { d: 9, stops: 3 }, { d: 10, stops: 8 }, { d: 11, stops: 5 }, { d: 12, stops: 4 }, { d: 13 }, { d: 14 },
  { d: 15, stops: 5, today: true }, { d: 16 }, { d: 17 }, { d: 18 }, { d: 19 }, { d: 20 }, { d: 21 },
]

function heat(stops) {
  if (!stops) return 'bg-[#F9F8F4]'
  if (stops >= 7) return 'bg-[#5FCFC3] text-white'
  if (stops >= 5) return 'bg-[#A8E8E1]'
  return 'bg-accent-light'
}

export default function Overview() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">Kalendár zastávok</h1>
            <p className="text-slate text-sm mt-1">Počet zastávok podľa dňa</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-white border border-gray-300 rounded-lg p-1 text-sm">
              <button className="px-3 py-1.5 text-slate">Týždeň</button>
              <button className="px-3 py-1.5 bg-accent text-white rounded-md font-semibold">Mesiac</button>
              <button className="px-3 py-1.5 text-slate">Rok</button>
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>Všetci zamestnanci</option>
              <option>Peter K.</option>
              <option>Jozef S.</option>
            </select>
          </div>
        </div>

        <div className="flex gap-5">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-slate text-center">
              {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2 h-16 ${day ? heat(day.stops) : ''} ${day?.today ? 'ring-2 ring-accent' : ''}`}
                >
                  {day && (
                    <>
                      <div className="text-xs text-slate">{day.d}</div>
                      {day.stops && <div className="text-sm font-bold mt-1">{day.stops}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="text-xs font-semibold text-accent">Streda, 15. september</div>
              <div className="font-display text-2xl font-bold mt-1">3 zastávky</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-slate">Peter K.</span><span className="font-semibold">2</span></div>
                <div className="flex justify-between"><span className="text-slate">Jozef S.</span><span className="font-semibold">1</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="font-semibold text-sm mb-3">Zastávky podľa vodiča</div>
              {[
                { name: 'Peter K.', count: 49, pct: 92 },
                { name: 'Jozef S.', count: 39, pct: 73 },
              ].map((r) => (
                <div key={r.name} className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate font-medium">{r.name}</span>
                    <span className="font-bold">{r.count}</span>
                  </div>
                  <div className="h-2 rounded bg-gray-200">
                    <div className="h-2 rounded bg-accent" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
