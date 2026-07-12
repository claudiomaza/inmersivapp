'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPrecio, generarCodigoConfirmacion } from '@/lib/utils'
import { toast } from 'sonner'

export default function DetalleActividadPage() {
  const { id } = useParams<{ id: string }>()
  const [actividad, setActividad] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [reservando, setReservando] = useState(false)
  const [sesion, setSesion] = useState<any>(null)
  const [fechaSel, setFechaSel] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    supabase
      .from('actividades')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setActividad(data)
        setCargando(false)
      })
  }, [id])

  const reservar = async () => {
    if (!sesion) {
      toast.error('Iniciá sesión para reservar')
      return
    }
    if (!fechaSel) {
      toast.error('Seleccioná una fecha')
      return
    }

    setReservando(true)

    // 1. Crear reserva en Supabase
    const codigo = generarCodigoConfirmacion()
    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        usuario_id: sesion.user.id,
        actividad_id: id,
        fecha: fechaSel,
        estado: 'pendiente',
        codigo_confirmacion: codigo,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al crear la reserva')
      setReservando(false)
      return
    }

    // 2. Crear preferencia de pago en MP
    toast.loading('Redirigiendo al pago…')
    const res = await fetch('/api/pagos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        reserva_id: reserva.id,
        titulo: actividad.titulo,
        monto: actividad.precio,
        usuario_id: sesion.user.id,
      }),
    })

    const data = await res.json()

    if (data.init_point) {
      window.location.href = data.init_point
    } else {
      toast.error('Error al iniciar el pago')
    }
    setReservando(false)
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando actividad…</p>
  if (!actividad) return <p className="mt-8 text-center text-texto-secundario">Actividad no encontrada</p>

  const foto = actividad.fotos?.[0] || 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <div className="overflow-hidden rounded-xl">
        <img src={foto} alt={actividad.titulo} className="h-72 w-full object-cover sm:h-96" />
      </div>

      <div className="mt-6">
        <span className="rounded-full bg-secundario/20 px-3 py-1 text-sm font-medium text-secundario-dark">
          {actividad.categoria}
        </span>
        <h1 className="mt-3 font-titulos text-3xl font-bold text-texto">
          {actividad.titulo}
        </h1>
        <p className="mt-2 whitespace-pre-line text-texto-secundario">
          {actividad.descripcion}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-superficie p-4 shadow-sm">
            <p className="text-sm text-texto-secundario">Ubicación</p>
            <p className="font-medium">
              {actividad.ubicacion?.direccion}, {actividad.ubicacion?.departamento},{' '}
              {actividad.ubicacion?.provincia}
            </p>
          </div>
          <div className="rounded-lg bg-superficie p-4 shadow-sm">
            <p className="text-sm text-texto-secundario">Anfitrión</p>
            <p className="font-medium">{actividad.anfitrion_nombre}</p>
          </div>
        </div>

        {/* Sección de reserva y pago */}
        <div className="mt-8 rounded-xl bg-superficie p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-titulos text-2xl font-bold text-primario">
              {formatPrecio(actividad.precio)}
            </h2>
            <span className="text-sm text-texto-secundario">por persona</span>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-texto">
              Seleccioná una fecha disponible
            </label>
            <select
              value={fechaSel}
              onChange={(e) => setFechaSel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            >
              <option value="">Elegí una fecha…</option>
              {(actividad.fechas || []).map((f: string) => (
                <option key={f} value={f}>
                  {new Date(f).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={reservar}
            disabled={reservando || !fechaSel}
            className="mt-6 w-full rounded-xl bg-primario px-6 py-3 font-titulos text-lg font-bold text-white shadow-lg transition hover:bg-primario-dark disabled:opacity-50"
          >
            {reservando ? 'Procesando…' : sesion ? 'Reservar y pagar' : 'Iniciá sesión para reservar'}
          </button>
          <p className="mt-2 text-center text-xs text-texto-secundario">
            Pagá con MercadoPago — débito, crédito o efectivo
          </p>
        </div>
      </div>
    </div>
  )
}