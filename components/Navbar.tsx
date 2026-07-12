'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const enlaces = [
  { href: '/actividades', label: 'Explorar' },
]

export default function Navbar() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    )
    return () => sub?.subscription.unsubscribe()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-primario text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-titulos text-xl font-bold tracking-tight">
          INMERSIVAPP
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {e.label}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/reservas"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Mis Reservas
              </Link>
              <Link
                href="/perfil"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Perfil
              </Link>
              <button
                onClick={cerrarSesion}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/20"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-primario transition hover:bg-white/90"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white sm:hidden"
          aria-label="Menú"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-2">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="rounded px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {e.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/reservas" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Mis Reservas
                </Link>
                <Link href="/perfil" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Perfil
                </Link>
                <button onClick={cerrarSesion} className="rounded px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded bg-white px-3 py-2 text-sm font-semibold text-primario hover:bg-white/90" onClick={() => setMenuOpen(false)}>
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}