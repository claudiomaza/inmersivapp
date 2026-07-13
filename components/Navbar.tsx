'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'

const enlaces = [
  { href: '/actividades', label: 'Explorar' },
]

export default function Navbar() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('roles')
          .eq('id', data.session.user.id)
          .single()
        setEsAdmin(perfil?.roles?.includes('anfitrion') ?? false)
        cargarNoLeidos(data.session)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        supabase.from('perfiles').select('roles').eq('id', session.user.id).single()
          .then(({ data }) => setEsAdmin(data?.roles?.includes('anfitrion') ?? false))
        cargarNoLeidos(session)
      } else {
        setEsAdmin(false)
        setNoLeidos(0)
      }
    })
    return () => sub?.subscription.unsubscribe()
  }, [])

  const cargarNoLeidos = async (session: any) => {
    const { count } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', session.user.id)
      .eq('leido', false)
    setNoLeidos(count ?? 0)
  }

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
                href="/actividades/nueva"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Crear
              </Link>
              <Link
                href="/reservas"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Mis Reservas
              </Link>
              <Link
                href="/mensajes"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Mensajes
              </Link>
              {esAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-yellow-300 transition hover:text-yellow-200"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/notificaciones"
                className="relative text-sm font-medium text-white/80 transition hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {noLeidos > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
                    {noLeidos > 99 ? '99+' : noLeidos}
                  </span>
                )}
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
                <Link href="/actividades/nueva" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Crear
                </Link>
                <Link href="/reservas" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Mis Reservas
                </Link>
                <Link href="/mensajes" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Mensajes
                </Link>
                {esAdmin && (
                  <Link href="/admin" className="rounded px-3 py-2 text-sm font-semibold text-yellow-300 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link href="/perfil" className="rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Perfil
                </Link>
                <Link href="/notificaciones" className="relative flex items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  <Bell className="h-4 w-4" />
                  Notificaciones
                  {noLeidos > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold leading-none text-white">
                      {noLeidos > 99 ? '99+' : noLeidos}
                    </span>
                  )}
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