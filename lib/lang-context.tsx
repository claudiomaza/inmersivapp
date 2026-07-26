'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { esAR } from '@/lib/clerk-localization'
import { getTranslations } from '@/lib/translations'

type Locale = 'es-AR' | 'en-US'

interface LangCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  localization: any
  t: (key: string, params?: Record<string, string | number>) => string
}

const LangContext = createContext<LangCtx>({
  locale: 'es-AR',
  setLocale: () => {},
  localization: esAR,
  t: (key: string) => key,
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

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = getTranslations(locale)
    let text = dict[key] || key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }, [locale])

  return (
    <LangContext.Provider value={{ locale, setLocale, localization, t }}>
      {children}
    </LangContext.Provider>
  )
}