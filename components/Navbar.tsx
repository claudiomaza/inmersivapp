'use client'

import Link from 'next/link'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, Menu, X, UserCircle, Sun, Moon, MessageSquare, Languages } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const [esAdmin, setEsAdmin] = useState(false)
  const [esAnfitrion, setEsAnfitrion] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const [oscuro, setOscuro] = useState(false)
  const { locale, setLocale } = useLang()

  useEffect(() => {
    // Inicializar desde localStorage
    const guardado = localStorage.getItem('tema')
    const prefiereOscuro = guardado === 'oscuro' || (!guardado && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setOscuro(prefiereOscuro)
    document.documentElement.setAttribute('data-theme', prefiereOscuro ? 'oscuro' : 'claro')
  }, [])

  const toggleTema = () => {
    const nuevo = !oscuro
    setOscuro(nuevo)
    document.documentElement.setAttribute('data-theme', nuevo ? 'oscuro' : 'claro')
    localStorage.setItem('tema', nuevo ? 'oscuro' : 'claro')
  }

  useEffect(() => {
    if (!isSignedIn || !user) {
      setEsAdmin(false)
      setEsAnfitrion(false)
      setNoLeidos(0)
      return
    }

    supabase
      .from('perfiles')
      .select('roles')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setEsAdmin(data?.roles?.includes('admin') ?? false)
        setEsAnfitrion(data?.roles?.includes('anfitrion') ?? false)
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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-superficie/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primario text-sm font-bold text-white">
            I
          </span>
          <span className="font-titulos text-lg font-bold text-texto">Inmersivapp</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/actividades"
            className="px-3 py-2 text-sm font-medium text-texto-secundario transition hover:text-texto"
          >
            Explorar
          </Link>
          <Link
            href="/primeros-pasos"
            className="px-3 py-2 text-sm font-medium text-texto-secundario transition hover:text-texto"
          >
            Primeros pasos
          </Link>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'es-AR' ? 'en-US' : 'es-AR')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-texto-secundario transition hover:bg-gray-100"
            aria-label="Cambiar idioma"
          >
            <span className="text-xs font-bold">{locale === 'es-AR' ? 'EN' : 'ES'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTema}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-texto-secundario transition hover:bg-gray-100"
            aria-label="Cambiar tema"
          >
            {oscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isSignedIn ? (
            <>
              <Link
                href="/notificaciones"
                className="relative p-2 text-texto-secundario transition hover:text-texto"
              >
                <Bell className="h-5 w-5" />
                {noLeidos > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold leading-none text-white">
                    {noLeidos > 99 ? '99+' : noLeidos}
                  </span>
                )}
              </Link>

              {esAnfitrion && (
                <Link
                  href="/anfitrion"
                  className="rounded-lg bg-primario/10 px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/20"
                >
                  Panel Anfitrión
                </Link>
              )}
              {esAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-primario/10 px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/20"
                >
                  Panel Admin
                </Link>
              )}

              <Link
                href="/reservas"
                className="px-3 py-2 text-sm font-medium text-texto-secundario transition hover:text-texto"
              >
                Mis reservas
              </Link>
              <Link
                href="/mensajes"
                className="px-3 py-2 text-sm font-medium text-texto-secundario transition hover:text-texto"
              >
                Mensajes
              </Link>

              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
              >
                <UserCircle className="h-5 w-5" />
                {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'Perfil'}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primario px-5 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center p-2 md:hidden"
          aria-label="Menú"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-superficie md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/actividades"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Explorar
            </Link>
            <Link
              href="/primeros-pasos"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Primeros pasos
            </Link>

            {/* Language toggle mobile */}
            <button
              onClick={() => { setLocale(locale === 'es-AR' ? 'en-US' : 'es-AR'); setMenuOpen(false) }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
            >
              <Languages className="h-5 w-5" />
              {locale === 'es-AR' ? 'English' : 'Español'}
            </button>

            {/* Theme toggle mobile */}
            <button
              onClick={() => { toggleTema(); setMenuOpen(false) }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
            >
              {oscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {oscuro ? 'Modo claro' : 'Modo oscuro'}
            </button>

            {isSignedIn ? (
              <>
                <Link
                  href="/notificaciones"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bell className="h-5 w-5" />
                  Notificaciones
                  {noLeidos > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold text-white">
                      {noLeidos}
                    </span>
                  )}
                </Link>
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle className="h-5 w-5" />
                  {user?.fullName || 'Perfil'}
                </Link>
                <Link
                  href="/reservas"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis reservas
                </Link>
                <Link
                  href="/mensajes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <MessageSquare className="h-5 w-5" />
                  Mensajes
                </Link>
                {esAnfitrion && (
                  <Link
                    href="/anfitrion"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Panel Anfitrión
                  </Link>
                )}
                {esAdmin && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-primario transition hover:bg-primario/10"
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
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error/10"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg bg-primario px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-primario-dark"
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