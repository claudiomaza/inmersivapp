'use client'

import Link from 'next/link'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Bell, Menu, X, UserCircle } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const [esAdmin, setEsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)

  useEffect(() => {
    if (!isSignedIn || !user) {
      setEsAdmin(false)
      setNoLeidos(0)
      return
    }

    supabase
      .from('perfiles')
      .select('roles')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setEsAdmin(data?.roles?.includes('anfitrion') ?? false)
      })

    supabase
      .from('notificaciones')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
      .eq('leido', false)
      .then(({ count }) => setNoLeidos(count ?? 0))
  }, [isSignedIn, user])

  const cerrarSesion = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="font-titulos text-xl font-bold text-texto">Inmersivapp</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/actividades" className="text-sm font-medium text-texto/70 transition hover:text-texto">
            Explorar
          </Link>

          {isSignedIn ? (
            <>
              <Link href="/notificaciones" className="relative p-2 text-texto/70 transition hover:text-texto">
                <Bell className="h-5 w-5" />
                {noLeidos > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold leading-none text-white">
                    {noLeidos > 99 ? '99+' : noLeidos}
                  </span>
                )}
              </Link>

              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-gray-100 hover:text-texto"
              >
                <UserCircle className="h-5 w-5" />
                {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'Perfil'}
              </Link>

              {esAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-primario/10 px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/20"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={cerrarSesion}
                className="rounded-lg px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-texto transition hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/actividades"
              className="rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-black/5"
              onClick={() => setMenuOpen(false)}
            >
              Explorar
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  Perfil
                </Link>
                <Link
                  href="/reservas"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis reservas
                </Link>
                <Link
                  href="/mensajes"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Mensajes
                </Link>
                <Link
                  href="/notificaciones"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-texto/70 transition hover:bg-black/5"
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
                {esAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg bg-primario/10 px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/20"
                    onClick={() => setMenuOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    cerrarSesion()
                  }}
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