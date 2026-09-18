import Sidebar from '../components/Sidebar.jsx'

const permanent = [
  { initials: 'PK', name: 'Peter Kováč', role: 'Dodávka · zamestnanec' },
  { initials: 'JS', name: 'Jozef Slabý', role: 'Dodávka · zamestnanec' },
]

export default function Drivers() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vodiči</h1>
            <p className="text-slate text-sm mt-1">Stáli zamestnanci aj príležitostní vodiči na zástup</p>
          </div>
          <button className="bg-accent text-white rounded-lg px-5 py-3 font-semibold text-sm">+ Pridať vodiča</button>
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Zamestnanci — stáli vodiči</div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-7">
          {permanent.map((p, i) => (
            <div key={p.name} className={`flex items-center gap-3.5 px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-ink text-platinum flex items-center justify-center text-sm font-semibold">
                {p.initials}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-sm text-slate">{p.role}</div>
              </div>
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">Aktívny</span>
              <a href="#" className="text-sm font-semibold text-accent">Detail</a>
            </div>
          ))}
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Vodiči na zástup</div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3.5 px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-slate flex items-center justify-center text-sm font-semibold">
              TV
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Tomáš Vaňo</div>
              <div className="text-sm text-slate">Dodávka · zástup od 8.9.2026</div>
            </div>
            <span className="bg-accent-light text-accent text-xs font-semibold px-2.5 py-1 rounded-full">Na zástupe</span>
            <a href="#" className="text-sm font-semibold text-accent">Detail</a>
          </div>
          <div className="px-5 py-4">
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3.5 text-sm font-semibold text-slate">
              + Pridať vodiča na zástup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
