'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import { Star, MessageCircle, Ticket, Calendar, Pencil } from 'lucide-react'

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

  const esAnfitrion = user?.id === actividad?.anfitrion_id

  const cargarResenas = useCallback(async () => {
    const res = await fetch(`/api/resenas?actividad_id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setResenas(data.resenas || [])
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      const [actividadRes, resenasRes] = await Promise.all([
        fetch(`/api/actividades?id=${id}`),
        fetch(`/api/resenas?actividad_id=${id}`),
      ])
      if (actividadRes.ok) {
        const data = await actividadRes.json()
        setActividad(data.actividad)
        // Auto-seleccionar primera fecha disponible
        if (data.actividad?.fechas?.length > 0) {
          setFechaSel(data.actividad.fechas[0])
        }
      }
      if (resenasRes.ok) {
        const data = await resenasRes.json()
        setResenas(data.resenas || [])
      }
      setCargando(false)
    }
    cargar()
  }, [id])

  useEffect(() => {
    if (!isSignedIn || !user || !id) return
    fetch(`/api/reservas?actividad_id=${id}&usuario_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reservas && data.reservas.length > 0) {
          setTieneReservaPagada(true)
        }
      })
      .catch(() => {})
  }, [isSignedIn, user, id])

  const reservar = async () => {
    if (!isSignedIn || !user) {
      toast.error('Iniciá sesión para reservar')
      return
    }
    if (!fechaSel) {
      toast.error('Seleccioná una fecha')
      return
    }
    setReservando(true)
    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        fecha: fechaSel,
        cupon: cuponValido?.valido ? cuponCodigo : undefined,
      }),
    })
    setReservando(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Error al reservar')
      return
    }
    toast.success('Reserva confirmada')
    router.push('/actividades')
  }

  const enviarResena = async () => {
    if (!puntuacion) {
      toast.error('Seleccioná una puntuación')
      return
    }
    setEnviandoResena(true)
    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        puntuacion,
        comentario: comentario || '',
      }),
    })
    setEnviandoResena(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Error al enviar reseña')
      return
    }
    toast.success('Reseña enviada')
    setPuntuacion(0)
    setComentario('')
    cargarResenas()
  }

  const verificarCupon = async () => {
    if (!cuponCodigo.trim()) {
      toast.error('Ingresá un código de cupón')
      return
    }
    setVerificandoCupon(true)
    const res = await fetch('/api/cupones/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: cuponCodigo.trim(), actividad_id: id }),
    })
    setVerificandoCupon(false)
    if (!res.ok) {
      setCuponValido(null)
      toast.error('Cupón inválido')
      return
    }
    const data = await res.json()
    setCuponValido(data)
  }

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
      </div>
    )
  }

  if (!actividad) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-texto-secundario">Actividad no encontrada</p>
        <button onClick={() => router.push('/actividades')} className="rounded-lg bg-primario px-6 py-2 text-white">
          Volver
        </button>
      </div>
    )
  }

  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null

  const fechasDisponibles = actividad.fechas?.length > 0
    ? actividad.fechas.filter((f: string) => new Date(f + 'T23:59:59') >= new Date())
    : (actividad.fecha ? [actividad.fecha] : [])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {actividad.imagen_url && (
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={actividad.imagen_url}
              alt={actividad.titulo}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primario/10 px-3 py-0.5 text-xs font-medium text-primario">
                  {actividad.categoria}
                </span>
                {esAnfitrion && (
                  <button
                    onClick={() => router.push(`/actividades/${id}/editar`)}
                    className="rounded-full bg-gray-100 p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-primario"
                    title="Editar actividad"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <h1 className="mt-2 font-titulos text-2xl font-bold text-texto">{actividad.titulo}</h1>
              {actividad.perfiles && (
                <p className="mt-1 text-sm text-texto-secundario">
                  Por {actividad.perfiles.nombre} {actividad.perfiles.apellido}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primario">{formatPrecio(actividad.precio)}</p>
              {promedio && (
                <p className="mt-1 text-sm text-amber-500">★ {promedio} ({resenas.length})</p>
              )}
            </div>
          </div>

          <p className="mt-4 text-texto">{actividad.descripcion}</p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-texto-secundario">
            {actividad.lugar && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {actividad.lugar}
              </span>
            )}
            {actividad.hora && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actividad.hora?.slice(0, 5)}{actividad.hora_fin ? ` - ${actividad.hora_fin.slice(0, 5)}` : ''}
              </span>
            )}
          </div>

          {/* Fechas disponibles */}
          {fechasDisponibles.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-texto">📅 Fechas disponibles</p>
              <div className="flex flex-wrap gap-2">
                {fechasDisponibles.map((f: string) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFechaSel(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      fechaSel === f
                        ? 'bg-primario text-white'
                        : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                    }`}
                  >
                    {new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cupón */}
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-texto-secundario" />
              <span className="text-xs font-medium text-texto-secundario">¿Tenés un cupón?</span>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={cuponCodigo}
                onChange={(e) => { setCuponCodigo(e.target.value); setCuponValido(null) }}
                placeholder="Código"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={verificarCupon}
                disabled={verificandoCupon}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-medium text-texto transition hover:bg-gray-200 disabled:opacity-50"
              >
                {verificandoCupon ? '…' : 'Aplicar'}
              </button>
            </div>
            {cuponValido && (
              <p className={`mt-1 text-xs ${cuponValido.valido ? 'text-green-600' : 'text-red-600'}`}>
                {cuponValido.mensaje}
              </p>
            )}
          </div>

          {/* Botón de reserva */}
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

      {/* Reseñas */}
      <div className="mt-6">
        <h2 className="mb-4 font-titulos text-xl font-bold text-texto">Reseñas</h2>
        {resenas.length === 0 ? (
          <p className="text-sm text-texto-secundario">Todavía no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <div className="space-y-3">
            {resenas.map((r: any) => (
              <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-texto">{r.perfiles?.nombre || 'Usuario'}</span>
                  <span className="text-sm text-amber-500">{'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}</span>
                </div>
                {r.comentario && <p className="mt-1 text-sm text-texto-secundario">{r.comentario}</p>}
              </div>
            ))}
          </div>
        )}

        {isSignedIn && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-texto">Dejá tu reseña</h3>
            <div className="mb-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setPuntuacion(n)}
                  className={`text-xl transition ${n <= puntuacion ? 'text-amber-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Contá tu experiencia..."
            />
            <button
              onClick={enviarResena}
              disabled={enviandoResena || !puntuacion}
              className="mt-2 rounded-lg bg-primario px-6 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              {enviandoResena ? 'Enviando…' : 'Enviar reseña'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}