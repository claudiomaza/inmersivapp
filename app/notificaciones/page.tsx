'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Bell, ChevronRight } from 'lucide-react'
import type { Notificacion } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function NotificacionesPage() {
  const { isSignedIn, user } = useUser()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarNotificaciones = async (userId: string) => {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })

    setNotificaciones(data || [])
    setCargando(false)
  }

  const marcarLeida = async (notif: Notificacion) => {
    if (notif.leido) return
    await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('id', notif.id)
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, leido: true } : n))
    )
  }

  useEffect(() => {
    if (user) cargarNotificaciones(user.id)
    else setCargando(false)
  }, [user])

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Iniciá sesión</h1>
        <p className="text-texto-secundario">Necesitás iniciar sesión para ver tus notificaciones.</p>
        <Link href="/login" className="rounded-lg bg-primario px-4 py-2 font-semibold text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando notificaciones…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-titulos text-2xl font-bold text-texto">Notificaciones</h1>

      {notificaciones.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <Bell className="h-12 w-12 text-gray-300" />
          <p className="text-texto-secundario">No tenés notificaciones.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notificaciones.map((n) => (
            <button
              key={n.id}
              onClick={() => marcarLeida(n)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl p-4 text-left transition hover:bg-gray-50',
                !n.leido && 'bg-primario/5'
              )}
            >
              <div className={cn(
                'mt-1 h-2 w-2 shrink-0 rounded-full',
                n.leido ? 'bg-transparent' : 'bg-primario'
              )} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', !n.leido && 'font-semibold')}>
                  {n.titulo}
                </p>
                {n.cuerpo && (
                  <p className="mt-1 text-xs text-texto-secundario line-clamp-2">
                    {n.cuerpo}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(n.created_at).toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}