import Sidebar from '../components/Sidebar.jsx'

const vehicles = [
  { name: 'Kamión — Mercedes-Benz Actros', plate: 'PB-123AB', driver: 'Milan Novák (živnostník, vozí pre FedEx)', service: '12. október 2026', status: 'ok' },
  { name: 'Dodávka — Ford Transit', plate: 'PB-456CD', driver: 'Peter Kováč', service: '3. november 2026', status: 'ok' },
  { name: 'Dodávka — Volkswagen Crafter', plate: 'PB-789EF', driver: 'Jozef Slabý', service: '24. september 2026', status: 'soon' },
]

export default function Vehicles() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-9">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Vozidlá</h1>
          <p className="text-slate text-sm mt-1">Vozový park firmy — kamión a dve dodávky</p>
        </div>

        <div className="flex flex-col gap-4">
          {vehicles.map((v) => (
            <div key={v.plate} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8">
                  <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
                  <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base">{v.name}</div>
                <div className="text-sm text-slate mt-0.5">ŠPZ {v.plate} · vodič: {v.driver}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${v.status === 'soon' ? 'text-amber-600' : 'text-gray-400'}`}>Najbližší servis</div>
                <div className={`text-sm font-semibold mt-0.5 ${v.status === 'soon' ? 'text-amber-600' : ''}`}>{v.service}</div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                v.status === 'soon' ? 'bg-accent-light text-accent' : 'bg-green-50 text-green-600'
              }`}>
                {v.status === 'soon' ? 'Servis čoskoro' : 'V prevádzke'}
              </span>
            </div>
          ))}

          <button className="self-start border-2 border-dashed border-gray-300 rounded-lg px-5 py-3 text-sm font-semibold text-slate">
            + Pridať vozidlo
          </button>
        </div>
      </div>
    </div>
  )
}
