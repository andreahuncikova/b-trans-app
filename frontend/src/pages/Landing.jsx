import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../LanguageContext.jsx'
import { api } from '../api.js'
import heroPhoto from '../assets/hero-photo.jpeg'
import Logo from '../components/Logo.jsx'
import Reveal from '../components/Reveal.jsx'

const SERVICE_ICONS = [
  <path key="truck" d="M1 7h15v10H1z M16 10h4l3 3v4h-7z M6 19a2 2 0 100-4 2 2 0 000 4z M18 19a2 2 0 100-4 2 2 0 000 4z" />,
  <path key="box" d="M3 8l9-5 9 5-9 5-9-5z M3 8v9l9 5 9-5V8 M12 13v9" />,
  <path key="tool" d="M14.7 6.3a4 4 0 01-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 015.4-5.4l-3-3z" />,
]

export default function Landing() {
  const { t } = useLanguage()

  const renderTitle = (title) =>
    title.split('\n').map((line, index) => (
      <span key={`${line}-${index}`} className="block">
        {line}
      </span>
    ))

  const [cv, setCv] = useState({ name: '', phone: '', email: '' })
  const [cvStatus, setCvStatus] = useState('idle')

  const submitCv = async (e) => {
    e.preventDefault()
    setCvStatus('sending')
    try {
      await api.submitApplication(cv)
      setCvStatus('sent')
      setCv({ name: '', phone: '', email: '' })
    } catch {
      setCvStatus('error')
    }
  }

  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 flex items-center justify-between px-16 py-4 border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex gap-9 text-sm font-medium text-slate">
          {[
            { href: '#services', label: t.landing.navServices },
            { href: '#contact', label: t.landing.navContact },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-ink transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3.5">
          <Link to="/login" className="text-sm font-semibold hover:text-accent transition-colors">{t.landing.login}</Link>
        </div>
      </div>

      <div className="flex items-center gap-14 px-16 py-20 bg-platinum overflow-hidden">
        <div className="flex-1 animate-fade-up">
          <div className="inline-block bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
            {t.landing.badge}
          </div>
          <h1 className="text-5xl font-bold leading-tight">{renderTitle(t.landing.title)}</h1>
          <p className="text-slate mt-5 max-w-md leading-relaxed">{t.landing.description}</p>
          <div className="flex gap-3.5 mt-8">
            <a
              href="tel:+421908585550"
              className="bg-ink text-white rounded-lg px-6.5 py-3.5 font-semibold text-sm hover:bg-ink/85 transition-colors"
            >
              {t.landing.phoneLabel}
            </a>
          </div>
        </div>
        <div
          className="flex-1 h-96 rounded-2xl overflow-hidden shadow-xl animate-fade-up"
          style={{ animationDelay: '150ms' }}
        >
          <img src={heroPhoto} alt="B-Trans" className="w-full h-full object-cover" />
        </div>
      </div>

      <div id="services" className="px-16 py-20">
        <Reveal className="text-center mb-11">
          <h2 className="text-3xl font-bold">{t.landing.servicesTitle}</h2>
          <p className="text-slate mt-2.5">{t.landing.servicesSubtitle}</p>
        </Reveal>
        <div className="flex gap-6">
          {t.landing.serviceItems.map((s, i) => (
            <Reveal key={s.title} delay={i * 100} className="flex-1">
              <div className="h-full p-8 border border-gray-100 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {SERVICE_ICONS[i]}
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-slate mt-2 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="bg-platinum px-16 py-16 flex items-center gap-14">
        <Reveal className="flex-1">
          <h2 className="text-2xl font-bold">{t.landing.driversTitle}</h2>
          <p className="text-slate mt-3 max-w-sm">{t.landing.driversText}</p>
        </Reveal>
        <Reveal delay={150} className="flex-1">
          <form onSubmit={submitCv} className="bg-white rounded-2xl p-7 shadow-sm">
            <div className="flex gap-3.5 mb-3.5">
              <input
                value={cv.name}
                onChange={(e) => setCv((c) => ({ ...c, name: e.target.value }))}
                placeholder={t.landing.formName}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
              />
              <input
                value={cv.phone}
                onChange={(e) => setCv((c) => ({ ...c, phone: e.target.value }))}
                placeholder={t.landing.formPhone}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
              />
            </div>
            <input
              value={cv.email}
              onChange={(e) => setCv((c) => ({ ...c, email: e.target.value }))}
              placeholder={t.landing.formEmail}
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3.5 focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center mb-5 text-sm text-slate">
              {t.landing.upload} <span className="text-accent font-semibold">{t.landing.uploadAction}</span> {t.landing.uploadHint}
            </div>
            <button
              type="submit"
              disabled={cvStatus === 'sending'}
              className="w-full bg-accent text-white rounded-lg py-3 font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {cvStatus === 'sending' ? t.landing.sending : t.landing.submitCv}
            </button>
            {cvStatus === 'sent' && <p className="text-sm text-green-600 mt-3">{t.landing.cvSent}</p>}
            {cvStatus === 'error' && <p className="text-sm text-red-600 mt-3">{t.landing.submitError}</p>}
          </form>
        </Reveal>
      </div>

      <div id="contact" className="bg-ink text-white px-16 py-14 flex items-center justify-between">
        <Reveal>
          <h2 className="text-2xl font-bold">{t.landing.contactTitle}</h2>
          <p className="text-white/65 mt-2">{t.landing.contactText}</p>
        </Reveal>
        <Reveal delay={150} className="flex gap-10 text-sm">
          <div><div className="text-white/50 text-xs mb-1">{t.landing.phone}</div><div className="font-semibold">+421 908 585 550</div></div>
          <div><div className="text-white/50 text-xs mb-1">{t.landing.email}</div><div className="font-semibold">b.huncik@gmail.com</div></div>
          <div><div className="text-white/50 text-xs mb-1">{t.landing.address}</div><div className="font-semibold">{t.landing.location}</div></div>
        </Reveal>
      </div>

      <div className="px-16 py-6 flex justify-between text-xs text-gray-400 border-t border-gray-100">
        <div>{t.landing.footer}</div>
        <div>{t.landing.location}</div>
      </div>
    </div>
  )
}
