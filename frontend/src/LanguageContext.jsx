import { createContext, useContext } from 'react'
import { t } from './i18n.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
