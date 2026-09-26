import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../LanguageContext.jsx'
import { api } from '../api.js'
import Logo from '../components/Logo.jsx'
import Reveal from '../components/Reveal.jsx'
import truckPhoto from '../assets/dodavka.webp'

const SERVICE_ICONS = [
  <path key="truck" d="M1 7h15v10H1z M16 10h4l3 3v4h-7z M6 19a2 2 0 100-4 2 2 0 000 4z M18 19a2 2 0 100-4 2 2 0 000 4z" />,
  <path key="box" d="M3 8l9-5 9 5-9 5-9-5z M3 8v9l9 5 9-5V8 M12 13v9" />,
  <g key="sliders">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </g>,
]

function ServiceIcon({ index }) {
  return (
    <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center mb-4">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {SERVICE_ICONS[index]}
      </svg>
    </div>
  )
}

export default function Landing() {
  const { t } = useLanguage()

  const renderTitle = (title) => {
    const lines = title.split('\n')
    return lines.map((line, index) => {
      if (index !== lines.length - 1) {
        return (
          <span key={`${line}-${index}`} className="block">
            {line}
          </span>
        )
      }
      const words = line.split(' ')
      const lastWord = words.pop()
      const [firstWord, ...restWords] = words
      return (
        <span key={`${line}-${index}`} className="block">
          <span className="text-accent">{firstWord}</span>{restWords.length ? ` ${restWords.join(' ')}` : ''}{' '}
          <span className="text-accent">{lastWord}</span>
        </span>
      )
    })
  }

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  const [truckArrived, setTruckArrived] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setTruckArrived(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const vanRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    let frameId
    let stop = false
    const start = performance.now()

    const tick = () => {
      if (vanRef.current && textRef.current) {
        const vanEdgeOffset = 120 // the van image has transparent padding, so its visible edge sits this many px inside the box
        const vanLeft = vanRef.current.getBoundingClientRect().left + vanEdgeOffset
        const textRect = textRef.current.getBoundingClientRect()
        const fraction = textRect.width > 0 ? (vanLeft - textRect.left) / textRect.width : 0
        const clamped = Math.min(1, Math.max(0, fraction))
        textRef.current.style.clipPath = `inset(-140px ${(1 - clamped) * 100}% -140px 0)`
        textRef.current.style.transform = `scale(${0.85 + 0.15 * clamped})`
        if (clamped >= 1 && performance.now() - start > 500) stop = true
      }
      if (!stop) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

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
      <div className="sticky top-0 z-50 flex items-center justify-between px-16 py-4 border-b border-white/10 bg-ink/90 backdrop-blur-md text-white">
        <Link to="/">
          <Logo variant="light" />
        </Link>
        <nav className="flex gap-9 text-sm font-medium text-white/70">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative py-1 hover:text-white transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
          >
            {t.landing.navHome}
          </button>
          {[
            { href: '#services', label: t.landing.navServices },
            { href: '#contact', label: t.landing.navContact },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-white transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3.5">
          <Link
            to="/login"
            title={t.landing.loginHint}
            className="flex items-center gap-1.5 text-sm font-semibold hover:text-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            {t.landing.login}
          </Link>
        </div>
      </div>

      <div className="relative min-h-screen bg-ink text-white overflow-hidden px-16 flex items-center">
        <div className="absolute -top-20 -left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-a" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl animate-float-b" />

        <div className="relative z-10 flex items-center gap-24 w-full">
          <div className="flex-1 mt-16">
            <div
              ref={textRef}
              style={{ clipPath: 'inset(-140px 100% -140px 0)', transformOrigin: 'left center' }}
            >
              <div
                style={{
                  transform: truckArrived ? 'translateY(-115px)' : 'translateY(0)',
                  transitionProperty: 'transform',
                  transitionDuration: '700ms',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                  transitionDelay: truckArrived ? '2800ms' : '0ms',
                }}
              >
                <div className="inline-block bg-accent-light text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
                  {t.landing.badge}
                </div>
                <h1 className="text-6xl font-bold leading-[1.05]">{renderTitle(t.landing.title)}</h1>
              </div>
            </div>
            <div
              style={{
                opacity: truckArrived ? 1 : 0,
                transform: truckArrived ? 'translateY(-85px)' : 'translateY(10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '700ms',
                transitionDelay: truckArrived ? '2900ms' : '0ms',
              }}
              className="mt-6"
            >
              <p className="text-white/65 max-w-md leading-relaxed">{t.landing.description}</p>
            </div>
            <div
              style={{
                opacity: truckArrived ? 1 : 0,
                transform: truckArrived ? 'translateY(-85px)' : 'translateY(10px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '700ms',
                transitionDelay: truckArrived ? '3100ms' : '0ms',
              }}
              className="mt-5"
            >
              <div className="text-white/50 text-xs font-medium mb-2">{t.landing.callUs}</div>
              <a
                href="tel:+421908585550"
                className="inline-block bg-accent text-ink rounded-lg px-6.5 py-3.5 font-semibold text-sm hover:bg-accent/85 transition-colors"
              >
                {t.landing.phoneLabel}
              </a>
            </div>
          </div>

          <div className="flex-1 relative" style={{ perspective: '1200px' }}>
            <div
              ref={vanRef}
              className="relative transition-transform duration-[3200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: truckArrived
                  ? 'translateX(-70px) translateY(40px) translateZ(0) rotateY(0deg) scale(1.2)'
                  : 'translateX(-160vw) translateY(-220px) translateZ(-800px) rotateY(60deg) scale(0.5)',
              }}
            >
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
              <div className={truckArrived ? 'animate-idle-bob' : ''}>
                <img
                  src={truckPhoto}
                  alt="Dodávka B-Trans"
                  className="w-full h-auto drop-shadow-2xl"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            </div>
          </div>
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
                <ServiceIcon index={i} />
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
