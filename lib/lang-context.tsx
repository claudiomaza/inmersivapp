'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { esAR } from '@/lib/clerk-localization'

type Locale = 'es-AR' | 'en-US'

interface LangCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  localization: any
}

const LangContext = createContext<LangCtx>({
  locale: 'es-AR',
  setLocale: () => {},
  localization: esAR,
})

export function useLang() {
  return useContext(LangContext)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es-AR')
  const [localization, setLocalization] = useState<any>(esAR)

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale | null
    if (saved === 'en-US' || saved === 'es-AR') {
      setLocaleState(saved)
      setLocalization(saved === 'en-US' ? undefined : esAR)
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    setLocalization(l === 'en-US' ? undefined : esAR)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l === 'en-US' ? 'en' : 'es'
  }

  return (
    <LangContext.Provider value={{ locale, setLocale, localization }}>
      {children}
    </LangContext.Provider>
  )
}