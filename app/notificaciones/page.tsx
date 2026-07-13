'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, ChevronRight } from 'lucide-react'
import type { Notificacion } from '@/types'
import { cn } from '@/lib/utils'

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      if (data.session) {
        cargarNotificaciones(data.session.user.id)
      } else {
        setCargando(false)
      }
    })
  }, [])

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

  const agruparPorFecha = (notifs: Notificacion[]) => {
    const grupos: Record<string, Notificacion[]> = {}
    for (const n of notifs) {
      const fecha = new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(n.created_at))
      if (!grupos[fecha]) grupos[fecha] = []
      grupos[fecha].push(n)
    }
    return grupos
  }

  if (!sesion) {
    return (
      <div className="mt-16 text-center">
        <Bell className="mx-auto h-12 w-12 text-texto-secundario" />
        <h1 className="mt-4 font-titulos text-2xl font-bold text-primario">
          Notificaciones
        </h1>
        <p className="mt-2 text-texto-secundario">
          Iniciá sesión para ver tus notificaciones
        </p>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        <p className="mt-4 text-texto-secundario">Cargando notificaciones…</p>
      </div>
    )
  }

  const grupos = agruparPorFecha(notificaciones)
  const fechas = Object.keys(grupos)

  return (
    <div>
      <h1 className="font-titulos text-2xl font-bold text-primario">
        Notificaciones
      </h1>

      {fechas.length === 0 ? (
        <div className="mt-16 text-center">
          <Bell className="mx-auto h-12 w-12 text-texto-secundario" />
          <p className="mt-4 text-lg text-texto-secundario">
            No tenés notificaciones
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {fechas.map((fecha) => (
            <section key={fecha}>
              <h2 className="mb-3 text-sm font-semibold text-texto-secundario uppercase tracking-wider">
                {fecha}
              </h2>
              <div className="space-y-2">
                {grupos[fecha].map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => marcarLeida(notif)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl p-4 text-left transition',
                      notif.leido
                        ? 'bg-superficie shadow-sm'
                        : 'bg-primario/5 shadow-sm ring-1 ring-primario/20'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-1 h-3 w-3 shrink-0 rounded-full',
                        notif.leido ? 'bg-transparent' : 'bg-primario'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'font-titulos text-sm font-semibold',
                          notif.leido ? 'text-texto' : 'text-primario'
                        )}
                      >
                        {notif.titulo}
                      </p>
                      {notif.cuerpo && (
                        <p className="mt-1 text-sm text-texto-secundario line-clamp-2">
                          {notif.cuerpo}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-texto-secundario/60">
                        {new Date(notif.created_at).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-texto-secundario/40" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}