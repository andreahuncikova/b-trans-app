import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './i18n.js'

const LanguageContext = createContext(null)

const getInitialLanguage = () => {
  const saved = localStorage.getItem('btrans-lang')
  return saved === 'en' ? 'en' : 'sk'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage)

  useEffect(() => {
    localStorage.setItem('btrans-lang', lang)
  }, [lang])

  const value = useMemo(() => ({
    lang,
    setLang,
    t: translations[lang],
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
