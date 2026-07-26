'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { formatPrecio } from '@/lib/utils'
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

  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [tieneReservaPagada, setTieneReservaPagada] = useState(false)

  const [cuponCodigo, setCuponCodigo] = useState('')
  const [cuponValido, setCuponValido] = useState<{ valido: boolean; descuento: number; mensaje: string } | null>(null)
  const [verificandoCupon, setVerificandoCupon] = useState(false)

  const cargarResenas = useCallback(async () => {
    const res = await fetch(`/api/resenas?actividad_id=${id}`)
    if (!res.ok) return
    const { resenas: data } = await res.json()
    setResenas(data || [])
  }, [id])

  useEffect(() => {
    Promise.all([
      fetch(`/api/actividades?id=${id}`).then(r => r.json()).then(d => setActividad(d.actividad)),
      cargarResenas(),
    ]).finally(() => {
      // Verificar si el usuario tiene reserva pagada para esta actividad
      if (isSignedIn && user) {
        fetch(`/api/reservas?actividad_id=${id}`)
          .then(r => r.json())
          .then(d => {
            const reservas = d.reservas || []
            setTieneReservaPagada(reservas.some((r: any) =>
              ['confirmada', 'completada', 'pagada'].includes(r.estado)
            ))
          })
          .catch(() => {})
      }
      setCargando(false)
    })
  }, [id, isSignedIn, user, cargarResenas])

  const reservar = async () => {
    if (!isSignedIn) return router.push('/login')
    if (!fechaSel) return toast.error('Seleccioná una fecha')
    setReservando(true)

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        fecha: fechaSel,
        cupon_codigo: cuponValido?.valido ? cuponCodigo : undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setReservando(false)
      toast.error('Error al crear la reserva: ' + (data.error || 'Error desconocido'))
      return
    }

    // Crear preferencia de pago en MercadoPago y redirigir
    const pagoRes = await fetch('/api/pagos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        reserva_id: data.reserva.id,
        titulo: actividad.titulo,
        monto: actividad.precio,
        usuario_id: user?.id,
      }),
    })

    if (!pagoRes.ok) {
      // Si falla MP, cancelar la reserva y avisar
      await fetch('/api/reservas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserva_id: data.reserva.id, estado: 'cancelada' }),
      })
      setReservando(false)
      toast.error('Error al conectar con el medio de pago. Intentalo de nuevo.')
      return
    }

    const { init_point } = await pagoRes.json()
    if (!init_point) {
      await fetch('/api/reservas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserva_id: data.reserva.id, estado: 'cancelada' }),
      })
      setReservando(false)
      toast.error('Error al generar el pago. Intentalo de nuevo.')
      return
    }

    // Redirigir a MercadoPago — el webhook aprueba la reserva
    window.location.href = init_point
  }

  const verificarCupon = async () => {
    if (!cuponCodigo.trim()) return
    setVerificandoCupon(true)

    const res = await fetch('/api/cupones/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: cuponCodigo }),
    })

    const data = await res.json()
    setVerificandoCupon(false)
    setCuponValido(data)
    if (!data.valido) toast.error(data.mensaje)
    else toast.success(data.mensaje)
  }

  const enviarResena = async () => {
    if (!user || puntuacion === 0) return
    setEnviandoResena(true)

    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actividad_id: id, puntuacion, comentario }),
    })

    setEnviandoResena(false)
    if (!res.ok) {
      const { error } = await res.json()
      toast.error('Error al enviar reseña: ' + error)
      return
    }
    toast.success('Reseña publicada gracias!')
    setPuntuacion(0)
    setComentario('')
    cargarResenas()
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando actividad...</p>
      </div>
    )
  }

  if (!actividad) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Actividad no encontrada</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Columna principal */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <span className="inline-block rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
              {actividad.categoria}
            </span>
            <h1 className="mt-3 font-titulos text-3xl font-bold text-texto">{actividad.titulo}</h1>
            <p className="mt-3 text-texto-secundario leading-relaxed">{actividad.descripcion}</p>

            {actividad.lugar && (
              <p className="mt-4 text-sm text-texto-secundario">
                📍 {actividad.lugar}
              </p>
            )}
          </div>

          {/* Reseñas */}
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-titulos font-semibold text-texto">
              <MessageCircle className="h-4 w-4" /> Reseñas ({resenas.length})
            </h3>

            {resenas.length === 0 ? (
              <p className="mt-3 text-sm text-texto-secundario">Todavía no hay reseñas. Sé el primero en opinar.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {resenas.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-texto">{r.perfiles?.nombre || 'Anónimo'}</p>
                      <span className="text-yellow-500">{'★'.repeat(r.puntuacion)}</span>
                    </div>
                    <p className="mt-1 text-sm text-texto-secundario">{r.comentario}</p>
                  </div>
                ))}
              </div>
            )}

            {isSignedIn && tieneReservaPagada && (
              <div className="mt-6 border-t pt-4">
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
            {isSignedIn && !tieneReservaPagada && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-texto-secundario">
                  Para dejar una reseña necesitás haber reservado y asistido a esta actividad.
                </p>
              </div>
            )}
          </div>

          </div>

        {/* Sidebar — Cupón + Reserva */}
        <div className="lg:col-span-2">
          {/* Cupón — justo arriba del panel de reserva */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-titulos font-semibold text-texto">
              <Ticket className="h-4 w-4" /> ¿Tenés un cupón?
            </h3>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={cuponCodigo}
                onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
                placeholder="Código"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={verificarCupon}
                disabled={verificandoCupon || !cuponCodigo.trim()}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200 disabled:opacity-50"
              >
                {verificandoCupon ? '...' : 'Verificar'}
              </button>
            </div>
            {cuponValido && (
              <p className={`mt-2 text-sm ${cuponValido.valido ? 'text-green-600' : 'text-red-600'}`}>
                {cuponValido.mensaje}
              </p>
            )}
          </div>

          {/* Contactar anfitrión */}
          {isSignedIn && actividad.perfiles && actividad.perfiles.id !== user?.id && (
            <button
              onClick={() => {
                const anfitrionId = actividad.perfiles.id
                router.push(`/participante?contactar=${anfitrionId}`)
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primario/10 py-2.5 text-sm font-medium text-primario transition hover:bg-primario/20"
            >
              <MessageCircle className="h-4 w-4" /> Contactar al anfitrión
            </button>
          )}

          {/* Reserva */}
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <p className="font-titulos text-3xl font-bold text-primario">{formatPrecio(actividad.precio)}</p>
            <p className="mt-1 text-sm text-texto-secundario">por persona</p>

            {actividad.capacidad_max && (
              <p className="mt-2 text-sm text-texto-secundario">
                Capacidad máxima: {actividad.capacidad_max} personas
              </p>
            )}

            {actividad.fecha && (
              <p className="mt-2 text-sm text-texto-secundario">
                📅 {new Date(actividad.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-texto">Fecha de reserva</label>
              <input
                type="date"
                value={fechaSel}
                onChange={(e) => setFechaSel(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>

            <button
              onClick={reservar}
              disabled={reservando || !fechaSel}
              className="mt-4 w-full rounded-lg bg-primario py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              {reservando ? 'Reservando…' : 'Reservar ahora'}
            </button>

            <p className="mt-3 text-center text-xs text-texto-secundario">
              No se te cobrará hasta confirmar la actividad
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}