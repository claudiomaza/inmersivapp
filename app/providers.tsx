'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'
import { LangProvider, useLang } from '@/lib/lang-context'
import { esAR } from '@/lib/clerk-localization'

function ClerkWithLang({ children }: { children: ReactNode }) {
  const { localization } = useLang()
  return (
    <ClerkProvider localization={localization}>
      {children}
    </ClerkProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <ClerkWithLang>
        {children}
      </ClerkWithLang>
    </LangProvider>
  )
}