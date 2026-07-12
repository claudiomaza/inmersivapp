'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrecio } from '@/lib/utils'
import Link from 'next/link'

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      if (data.session) {
        cargarReservas(data.session.user.id)
      } else {
        setCargando(false)
      }
    })
  }, [])

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
    cargarReservas(sesion.user.id)
  }

  if (!sesion) {
    return (
      <div className="mt-16 text-center">
        <h1 className="font-titulos text-2xl font-bold text-primario">Mis reservas</h1>
        <p className="mt-2 text-texto-secundario">Iniciá sesión para ver tus reservas.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-primario px-6 py-2 text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando…</p>

  return (
    <div>
      <h1 className="font-titulos text-3xl font-bold text-primario">Mis reservas</h1>

      {reservas.length === 0 ? (
        <p className="mt-8 text-center text-texto-secundario">
          No tenés reservas todavía.{' '}
          <Link href="/actividades" className="text-primario hover:underline">
            Explorar actividades
          </Link>
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {reservas.map((r) => {
            const act = r.actividades
            const colores: Record<string, string> = {
              pendiente: 'bg-yellow-100 text-yellow-800',
              confirmada: 'bg-green-100 text-green-800',
              cancelada: 'bg-red-100 text-red-800',
              completada: 'bg-blue-100 text-blue-800',
            }
            return (
              <div key={r.id} className="rounded-xl bg-superficie p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-titulos text-lg font-bold text-texto">
                      {act?.titulo || 'Actividad'}
                    </h2>
                    <p className="mt-1 text-sm text-texto-secundario">
                      {new Date(r.fecha).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {r.codigo_confirmacion && (
                      <p className="mt-1 text-sm text-texto-secundario">
                        Código: <span className="font-mono font-bold text-primario">{r.codigo_confirmacion}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colores[r.estado] || 'bg-gray-100'}`}>
                      {r.estado}
                    </span>
                    {act?.precio && (
                      <p className="mt-1 font-bold text-primario">
                        {formatPrecio(act.precio)}
                      </p>
                    )}
                  </div>
                </div>
                {r.estado === 'pendiente' && (
                  <button
                    onClick={() => cancelar(r.id)}
                    className="mt-3 text-sm font-medium text-error hover:underline"
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}