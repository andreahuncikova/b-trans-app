import { Link } from 'react-router-dom'
import { useLanguage } from '../LanguageContext.jsx'

export default function Landing() {
  const { t } = useLanguage()

  const renderTitle = (title) =>
    title.split('\n').map((line, index) => (
      <span key={`${line}-${index}`} className="block">
        {line}
      </span>
    ))

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
          <a href="#services">{t.landing.navServices}</a>
          <a href="#contact">{t.landing.navContact}</a>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link to="/login" className="text-sm font-semibold">{t.landing.login}</Link>
          <button className="bg-accent text-white rounded-lg px-5 py-2.5 font-semibold text-sm">{t.landing.quote}</button>
        </div>
      </div>

      <div className="flex items-center gap-14 px-16 py-20 bg-platinum">
        <div className="flex-1">
          <div className="inline-block bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
            {t.landing.badge}
          </div>
          <h1 className="text-5xl font-bold leading-tight">{renderTitle(t.landing.title)}</h1>
          <p className="text-slate mt-5 max-w-md leading-relaxed">{t.landing.description}</p>
          <div className="flex gap-3.5 mt-8">
            <button className="bg-ink text-white rounded-lg px-6.5 py-3.5 font-semibold text-sm">{t.landing.requestQuote}</button>
            <button className="bg-white border border-gray-300 rounded-lg px-6.5 py-3.5 font-semibold text-sm">{t.landing.phoneLabel}</button>
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
          <h2 className="text-3xl font-bold">{t.landing.servicesTitle}</h2>
          <p className="text-slate mt-2.5">{t.landing.servicesSubtitle}</p>
        </div>
        <div className="flex gap-6">
          {t.landing.serviceItems.map((s) => (
            <div key={s.title} className="flex-1 p-8 border border-gray-100 rounded-2xl">
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-slate mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-platinum px-16 py-16 flex items-center gap-14">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{t.landing.driversTitle}</h2>
          <p className="text-slate mt-3 max-w-sm">{t.landing.driversText}</p>
        </div>
        <form className="flex-1 bg-white rounded-2xl p-7 shadow-sm">
          <div className="flex gap-3.5 mb-3.5">
            <input placeholder={t.landing.formName} className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
            <input placeholder={t.landing.formPhone} className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <input placeholder={t.landing.formEmail} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3.5" />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center mb-5 text-sm text-slate">
            {t.landing.upload} <span className="text-accent font-semibold">{t.landing.uploadAction}</span> {t.landing.uploadHint}
          </div>
          <button type="button" className="w-full bg-accent text-white rounded-lg py-3 font-semibold text-sm">
            {t.landing.submitCv}
          </button>
        </form>
      </div>

      <div id="contact" className="bg-ink text-white px-16 py-14 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.landing.contactTitle}</h2>
          <p className="text-white/65 mt-2">{t.landing.contactText}</p>
        </div>
        <div className="flex gap-10 text-sm">
          <div><div className="text-white/50 text-xs mb-1">{t.landing.phone}</div><div className="font-semibold">+421 908 585 550</div></div>
          <div><div className="text-white/50 text-xs mb-1">{t.landing.email}</div><div className="font-semibold">info@b-trans.sk</div></div>
          <div><div className="text-white/50 text-xs mb-1">{t.landing.address}</div><div className="font-semibold">{t.landing.location}</div></div>
        </div>
      </div>

      <div className="px-16 py-6 flex justify-between text-xs text-gray-400 border-t border-gray-100">
        <div>{t.landing.footer}</div>
        <div>{t.landing.location}</div>
      </div>
    </div>
  )
}
