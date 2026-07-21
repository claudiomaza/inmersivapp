'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { formatPrecio, generarCodigoConfirmacion } from '@/lib/utils'
import { toast } from 'sonner'
import { Star, MessageCircle, Ticket } from 'lucide-react'

export default function DetalleActividadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [actividad, setActividad] = useState<any>(null)
  const [resenas, setResenas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [reservando, setReservando] = useState(false)
  const [fechaSel, setFechaSel] = useState('')

  // Formulario de reseña
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)

  // Cupón
  const [cuponCodigo, setCuponCodigo] = useState('')
  const [cuponValido, setCuponValido] = useState<{ valido: boolean; descuento: number; mensaje: string } | null>(null)
  const [verificandoCupon, setVerificandoCupon] = useState(false)

  const cargarResenas = useCallback(async () => {
    const { data } = await supabase
      .from('resenas')
      .select('*, perfiles!resenas_usuario_id_fkey(nombre, apellido, avatar_url)')
      .eq('actividad_id', id)
      .order('created_at', { ascending: false })
    setResenas(data || [])
  }, [id])

  useEffect(() => {
    Promise.all([
      supabase.from('actividades').select('*').eq('id', id).single(),
      cargarResenas(),
    ]).then(([act]) => {
      setActividad(act.data)
      setCargando(false)
    })
  }, [id, cargarResenas])

  const reservar = async () => {
    if (!isSignedIn) {
      toast.error('Primero iniciá sesión')
      router.push('/login')
      return
    }
    if (!fechaSel) {
      toast.error('Seleccioná una fecha')
      return
    }

    setReservando(true)

    // Crear reserva
    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        usuario_id: user.id,
        actividad_id: id,
        fecha: fechaSel,
        estado: 'pendiente',
        codigo_confirmacion: generarCodigoConfirmacion(),
        cupon_codigo: cuponValido?.valido ? cuponCodigo.toUpperCase() : null,
      })
      .select()
      .single()

    if (error || !reserva) {
      toast.error('Error al crear la reserva')
      setReservando(false)
      return
    }

    // Crear preferencia de pago
    const res = await fetch('/api/pagos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        reserva_id: reserva.id,
        titulo: actividad.titulo,
        monto: cuponValido?.valido
          ? actividad.precio * (1 - cuponValido.descuento / 100)
          : actividad.precio,
        usuario_id: user.id,
      }),
    })

    const data = await res.json()

    if (data.init_point) {
      window.location.href = data.init_point
    } else {
      toast.error('Error al procesar el pago')
    }

    setReservando(false)
  }

  const enviarResena = async () => {
    if (!isSignedIn || puntuacion === 0) return
    setEnviandoResena(true)
    const { error } = await supabase.from('resenas').insert({
      usuario_id: user.id,
      actividad_id: id,
      puntuacion,
      comentario,
    })
    setEnviandoResena(false)
    if (error) {
      toast.error('Ya dejaste una reseña para esta actividad')
      return
    }
    toast.success('Reseña publicada')
    setPuntuacion(0)
    setComentario('')
    cargarResenas()
  }

  const verificarCupon = async () => {
    if (!cuponCodigo) return
    setVerificandoCupon(true)
    const { data } = await supabase
      .from('cupones')
      .select('*')
      .eq('codigo', cuponCodigo.toUpperCase())
      .eq('activo', true)
      .single()
    setVerificandoCupon(false)

    if (!data) {
      setCuponValido({ valido: false, descuento: 0, mensaje: 'Cupón inválido o vencido' })
      return
    }
    if (data.usos_actuales >= data.usos_maximos) {
      setCuponValido({ valido: false, descuento: 0, mensaje: 'Este cupón ya no tiene usos disponibles' })
      return
    }
    setCuponValido({ valido: true, descuento: data.descuento_porcentaje, mensaje: `${data.descuento_porcentaje}% de descuento aplicado` })
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando actividad…</p>
      </div>
    )
  }

  if (!actividad) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Actividad no encontrada</h1>
        <p className="text-texto-secundario">Esta actividad no existe o fue eliminada.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <span className="inline-block rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
          {actividad.categoria}
        </span>
        <h1 className="mt-3 font-titulos text-3xl font-bold text-texto">{actividad.titulo}</h1>
        <p className="mt-2 text-lg text-texto-secundario">{actividad.descripcion}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl bg-superficie p-6 shadow-sm">
            <h2 className="font-titulos text-lg font-semibold text-texto">Detalles</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="font-medium text-texto-secundario">Anfitrión:</span> {actividad.anfitrion_nombre}</p>
              <p><span className="font-medium text-texto-secundario">Precio:</span> <span className="font-semibold text-primario">{formatPrecio(actividad.precio)}</span></p>
              <p><span className="font-medium text-texto-secundario">Ubicación:</span> {actividad.ubicacion?.direccion}, {actividad.ubicacion?.departamento}, {actividad.ubicacion?.provincia}</p>
            </div>
          </div>

          {/* Cupón */}
          <div className="rounded-xl bg-superficie p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-titulos text-base font-semibold text-texto">
              <Ticket className="h-4 w-4" /> ¿Tenés un cupón?
            </h3>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={cuponCodigo}
                onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={verificarCupon}
                disabled={verificandoCupon || !cuponCodigo}
                className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50"
              >
                {verificandoCupon ? '…' : 'Aplicar'}
              </button>
            </div>
            {cuponValido && (
              <p className={`mt-2 text-sm ${cuponValido.valido ? 'text-green-600' : 'text-error'}`}>
                {cuponValido.mensaje}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Selección de fecha */}
          <div className="rounded-xl bg-superficie p-6 shadow-sm">
            <h2 className="font-titulos text-lg font-semibold text-texto">Reservá tu lugar</h2>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-texto-secundario">Elegí una fecha</label>
              <input
                type="date"
                value={fechaSel}
                onChange={(e) => setFechaSel(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <button
              onClick={reservar}
              disabled={reservando || !fechaSel}
              className="mt-4 w-full rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              {reservando ? 'Procesando…' : `Reservar — ${formatPrecio(
                cuponValido?.valido
                  ? actividad.precio * (1 - cuponValido.descuento / 100)
                  : actividad.precio
              )}`}
            </button>
            {!isSignedIn && (
              <p className="mt-2 text-center text-xs text-texto-secundario">Iniciá sesión para reservar</p>
            )}
          </div>

          {/* Reseñas */}
          <div className="rounded-xl bg-superficie p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-titulos text-lg font-semibold text-texto">
              <Star className="h-4 w-4 text-yellow-500" /> Reseñas
            </h2>
            <div className="mt-4 space-y-4">
              {resenas.length === 0 ? (
                <p className="text-sm text-texto-secundario">No hay reseñas todavía. ¡Sé el primero!</p>
              ) : (
                resenas.map((r) => (
                  <div key={r.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.perfiles?.nombre} {r.perfiles?.apellido}</span>
                      <span className="text-yellow-500 text-xs">{'★'.repeat(r.puntuacion)}</span>
                    </div>
                    <p className="mt-1 text-sm text-texto-secundario">{r.comentario}</p>
                  </div>
                ))
              )}

              {isSignedIn && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-titulos text-base font-semibold text-texto">Dejá tu reseña</h3>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPuntuacion(n)}
                        className={`text-xl transition ${n <= puntuacion ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Contá tu experiencia…"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                  />
                  <button
                    onClick={enviarResena}
                    disabled={enviandoResena || puntuacion === 0}
                    className="mt-2 rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50"
                  >
                    {enviandoResena ? 'Enviando…' : 'Publicar reseña'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}