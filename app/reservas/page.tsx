'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { formatPrecio } from '@/lib/utils'
import Link from 'next/link'

export default function MisReservasPage() {
  const { isSignedIn, user } = useUser()
  const [reservas, setReservas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarReservas = async (userId: string) => {
    const { data } = await supabase
      .from('reservas')
      .select('*, actividades(*)')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
    setReservas(data || [])
    setCargando(false)
  }

  const cancelar = async (id: string) => {
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id)
    if (user) cargarReservas(user.id)
  }

  useEffect(() => {
    if (user) cargarReservas(user.id)
    else setCargando(false)
  }, [user])

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Iniciá sesión</h1>
        <p className="text-texto-secundario">Necesitás iniciar sesión para ver tus reservas.</p>
        <Link href="/login" className="rounded-lg bg-primario px-4 py-2 font-semibold text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando tus reservas…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-titulos text-2xl font-bold text-texto">Mis reservas</h1>

      {reservas.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-texto-secundario">No tenés reservas activas.</p>
          <Link href="/actividades" className="mt-2 inline-block text-primario hover:underline">
            Explorar actividades
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reservas.map((r) => (
            <div key={r.id} className="rounded-xl bg-superficie p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-titulos text-lg font-semibold text-texto">
                    {r.actividades?.titulo || 'Actividad'}
                  </h3>
                  <p className="mt-1 text-sm text-texto-secundario">
                    {new Date(r.fecha).toLocaleDateString('es-AR', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-texto-secundario">
                    Código: <span className="font-mono">{r.codigo_confirmacion || '—'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                    r.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                    r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.estado}
                  </span>
                  {r.actividades && (
                    <p className="mt-2 text-sm font-semibold text-primario">
                      {formatPrecio(r.actividades.precio)}
                    </p>
                  )}
                </div>
              </div>
              {r.estado === 'pendiente' && (
                <button
                  onClick={() => cancelar(r.id)}
                  className="mt-4 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}