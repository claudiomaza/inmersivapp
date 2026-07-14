'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Bell, Menu, X } from 'lucide-react'

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
    setMenuOpen(false)
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-titulos text-xl font-bold tracking-tight text-primario">
            inmersivapp
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/actividades"
            className="text-sm font-medium text-texto/80 transition hover:text-primario"
          >
            Explorar
          </Link>
          {session ? (
            <>
              {esAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-primario/10 px-3 py-1.5 text-sm font-medium text-primario transition hover:bg-primario/20"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/perfil"
                className="text-sm font-medium text-texto/80 transition hover:text-primario"
              >
                Perfil
              </Link>
              <Link
                href="/notificaciones"
                className="relative text-sm font-medium text-texto/80 transition hover:text-primario"
              >
                <Bell className="h-5 w-5" />
                {noLeidos > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold leading-none text-white">
                    {noLeidos > 9 ? '9+' : noLeidos}
                  </span>
                )}
              </Link>
              <button
                onClick={cerrarSesion}
                className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-texto transition hover:bg-black/5 md:hidden"
          aria-label="Menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-white/90 px-4 pb-4 pt-2 backdrop-blur-lg md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/actividades"
              className="rounded-lg px-3 py-2 text-sm font-medium text-texto/80 transition hover:bg-black/5"
              onClick={() => setMenuOpen(false)}
            >
              Explorar
            </Link>
            {session ? (
              <>
                {esAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-primario transition hover:bg-primario/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-texto/80 transition hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Perfil
                </Link>
                <Link
                  href="/notificaciones"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-texto/80 transition hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bell className="h-4 w-4" />
                  Notificaciones
                  {noLeidos > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold leading-none text-white">
                      {noLeidos > 99 ? '99+' : noLeidos}
                    </span>
                  )}
                </Link>
                <button
                  onClick={cerrarSesion}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error/10"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primario px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-primario-dark"
                onClick={() => setMenuOpen(false)}
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
