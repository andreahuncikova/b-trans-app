import { Link } from 'react-router-dom'

const services = [
  { title: 'Vnútroštátna doprava', desc: 'Preprava paletového aj kusového nákladu kamiónom po celom Slovensku aj do zahraničia.' },
  { title: 'Rozvoz zásielok', desc: 'Menšie a rýchle rozvozy dodávkami, ideálne pre lokálnych klientov.' },
  { title: 'Individuálne riešenia', desc: 'Nadrozmerný náklad alebo špecifické požiadavky riešime na mieru.' },
]

export default function Landing() {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between px-16 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F21" strokeWidth="2.5">
              <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
              <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
            </svg>
          </div>
          <div className="font-display font-bold text-lg">B-Trans</div>
        </div>
        <nav className="flex gap-9 text-sm font-medium text-slate">
          <a href="#services">Služby</a>
          <a href="#contact">Kontakt</a>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link to="/prehlad" className="text-sm font-semibold">Prihlásenie</Link>
          <button className="bg-accent text-white rounded-lg px-5 py-2.5 font-semibold text-sm">Nezáväzná ponuka</button>
        </div>
      </div>

      <div className="flex items-center gap-14 px-16 py-20 bg-platinum">
        <div className="flex-1">
          <div className="inline-block bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
            Doprava po celom Slovensku aj do zahraničia
          </div>
          <h1 className="text-5xl font-bold leading-tight">Spoľahlivá nákladná<br />doprava a rozvoz</h1>
          <p className="text-slate mt-5 max-w-md leading-relaxed">
            Rodinná preprava s vlastným vozovým parkom. Popri pravidelných zvozoch pre FedEx vezmeme aj vaše
            priame zákazky — kamiónom aj menšími dodávkami, rýchlo a s osobným prístupom.
          </p>
          <div className="flex gap-3.5 mt-8">
            <button className="bg-ink text-white rounded-lg px-6.5 py-3.5 font-semibold text-sm">Vyžiadať cenovú ponuku</button>
            <button className="bg-white border border-gray-300 rounded-lg px-6.5 py-3.5 font-semibold text-sm">+421 908 585 550</button>
          </div>
        </div>
        <div className="flex-1 h-96 rounded-2xl bg-ink flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.4">
            <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
            <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
          </svg>
        </div>
      </div>

      <div id="services" className="px-16 py-20">
        <div className="text-center mb-11">
          <h2 className="text-3xl font-bold">Naše služby</h2>
          <p className="text-slate mt-2.5">Prispôsobíme sa veľkosti vášho nákladu aj termínu</p>
        </div>
        <div className="flex gap-6">
          {services.map((s) => (
            <div key={s.title} className="flex-1 p-8 border border-gray-100 rounded-2xl">
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-slate mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-platinum px-16 py-16 flex items-center gap-14">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Hľadáme šikovných vodičov</h2>
          <p className="text-slate mt-3 max-w-sm">
            Rozširujeme flotilu a radi privítame nových kolegov. Pošlite nám svoj životopis a ozveme sa vám.
          </p>
        </div>
        <form className="flex-1 bg-white rounded-2xl p-7 shadow-sm">
          <div className="flex gap-3.5 mb-3.5">
            <input placeholder="Meno a priezvisko" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
            <input placeholder="Telefón" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <input placeholder="E-mail" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3.5" />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center mb-5 text-sm text-slate">
            Presuňte súbor sem alebo <span className="text-accent font-semibold">vyberte z počítača</span> (PDF, do 5 MB)
          </div>
          <button type="button" className="w-full bg-accent text-white rounded-lg py-3 font-semibold text-sm">
            Odoslať životopis
          </button>
        </form>
      </div>

      <div id="contact" className="bg-ink text-white px-16 py-14 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Potrebujete niečo previezť?</h2>
          <p className="text-white/65 mt-2">Ozvite sa nám, odpovieme do 24 hodín.</p>
        </div>
        <div className="flex gap-10 text-sm">
          <div><div className="text-white/50 text-xs mb-1">Telefón</div><div className="font-semibold">+421 908 585 550</div></div>
          <div><div className="text-white/50 text-xs mb-1">E-mail</div><div className="font-semibold">info@b-trans.sk</div></div>
          <div><div className="text-white/50 text-xs mb-1">Sídlo</div><div className="font-semibold">Sverepec, Slovensko</div></div>
        </div>
      </div>

      <div className="px-16 py-6 flex justify-between text-xs text-gray-400 border-t border-gray-100">
        <div>© 2026 B-Trans. Všetky práva vyhradené.</div>
        <div>Sverepec, Slovensko</div>
      </div>
    </div>
  )
}
