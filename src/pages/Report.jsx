import Sidebar from '../components/Sidebar.jsx'

const rows = [
  { initials: 'PK', name: 'Peter Kováč', days: 20, hours: '160 h', stops: 49 },
  { initials: 'JS', name: 'Jozef Slabý', days: 19, hours: '152 h', stops: 39 },
]

export default function Report() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mesačný report</h1>
            <p className="text-slate text-sm mt-1">Odpracované dni a doručené zákazky za vodiča</p>
          </div>
          <div className="flex gap-2.5">
            <select className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white">
              <option>September 2026</option>
              <option>August 2026</option>
            </select>
            <button className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-semibold text-sm">
              Exportovať
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">Odpracované dni spolu</div>
            <div className="font-display text-3xl font-bold mt-1.5">39</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">Odjazdené hodiny</div>
            <div className="font-display text-3xl font-bold mt-1.5">312</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
            <div className="text-slate text-sm font-medium">Doručené zákazky</div>
            <div className="font-display text-3xl font-bold mt-1.5 text-accent">88</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-semibold text-sm">Podľa vodiča</div>
          <div className="grid grid-cols-5 px-5 py-2.5 text-xs text-gray-400 font-semibold uppercase">
            <div>Vodič</div><div>Odpracované dni</div><div>Hodiny</div><div>Doručené zákazky</div><div></div>
          </div>
          {rows.map((r) => (
            <div key={r.name} className="grid grid-cols-5 px-5 py-4 items-center border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-ink text-platinum flex items-center justify-center text-xs font-semibold">
                  {r.initials}
                </div>
                <span className="font-medium">{r.name}</span>
              </div>
              <div className="text-slate">{r.days}</div>
              <div className="text-slate">{r.hours}</div>
              <div className="text-slate">{r.stops}</div>
              <div><a href="#" className="text-accent font-semibold">Detail</a></div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Report je len prehľadový výstup pre internú potrebu — nenahrádza mzdové spracovanie.
        </p>
      </div>
    </div>
  )
}
