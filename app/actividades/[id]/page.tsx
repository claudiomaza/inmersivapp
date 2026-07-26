'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import { Star, MessageCircle, Ticket, Calendar, Pencil, Clock, MapPin } from 'lucide-react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface SlotInfo {
  fecha: string
  hora_inicio: string
  hora_fin: string
  label: string
}

function expandirHorarios(horarios: any[]): SlotInfo[] {
  if (!horarios || !Array.isArray(horarios) || horarios.length === 0) return []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const slots: SlotInfo[] = []

  for (const b of horarios) {
    const hora = b.hora?.slice(0, 5) || '09:00'
    const hora_fin = b.hora_fin?.slice(0, 5) || '18:00'
    const duracion = b.duracion_turno || 0

    // Fecha puntual
    if (b.fecha) {
      const d = new Date(b.fecha + 'T23:59:59')
      if (d >= hoy) {
        agregarSlots(slots, b.fecha, hora, hora_fin, duracion)
      }
      continue
    }

    // Rango de fechas
    if (b.fecha_desde || b.fecha_hasta) {
      const desde = b.fecha_desde || b.fecha
      const hasta = b.fecha_hasta || b.fecha_desde || b.fecha
      if (desde && hasta) {
        let current = new Date(desde + 'T12:00:00')
        const end = new Date(hasta + 'T12:00:00')
        while (current <= end) {
          if (current >= hoy) {
            const fechaStr = current.toISOString().split('T')[0]
            agregarSlots(slots, fechaStr, hora, hora_fin, duracion)
          }
          current.setDate(current.getDate() + 1)
        }
      }
      continue
    }

    // Día de la semana
    if (b.dia_semana) {
      for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const diaSem = d.getDay() === 0 ? 7 : d.getDay() // domingo=7
        if (diaSem === b.dia_semana) {
          const fechaStr = d.toISOString().split('T')[0]
          agregarSlots(slots, fechaStr, hora, hora_fin, duracion)
        }
      }
      continue
    }

    // Rango de días
    if (b.dia_desde || b.dia_hasta) {
      const desde = b.dia_desde || b.dia_semana || 1
      const hasta = b.dia_hasta || b.dia_desde || b.dia_semana || 7
      for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const diaSem = d.getDay() === 0 ? 7 : d.getDay()
        if (diaSem >= desde && diaSem <= hasta) {
          const fechaStr = d.toISOString().split('T')[0]
          agregarSlots(slots, fechaStr, hora, hora_fin, duracion)
        }
      }
    }
  }

  // Ordenar por fecha y hora
  slots.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio))
  return slots
}

function agregarSlots(slots: SlotInfo[], fecha: string, hora: string, hora_fin: string, duracion: number) {
  if (duracion > 0) {
    // Generar slots de duracion minutos dentro del rango
    const [hIni, mIni] = hora.split(':').map(Number)
    const [hFin, mFin] = hora_fin.split(':').map(Number)
    let minActual = hIni * 60 + mIni
    const minFin = hFin * 60 + mFin
    while (minActual + duracion <= minFin) {
      const h = Math.floor(minActual / 60)
      const m = minActual % 60
      const hh = Math.floor((minActual + duracion) / 60)
      const mm = (minActual + duracion) % 60
      const inicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      const fin = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
      slots.push({
        fecha,
        hora_inicio: inicio,
        hora_fin: fin,
        label: `${inicio} - ${fin} (${duracion}min)`,
      })
      minActual += duracion
    }
  } else {
    // Bloque completo como un solo turno
    slots.push({
      fecha,
      hora_inicio: hora,
      hora_fin,
      label: `${hora} - ${hora_fin}`,
    })
  }
}

function resumirHorarios(horarios: any[]): string[] {
  if (!horarios || !Array.isArray(horarios)) return []
  return horarios.map((b) => {
    if (b.fecha) return `📅 ${new Date(b.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} — ${b.hora?.slice(0, 5)} a ${b.hora_fin?.slice(0, 5)}`
    if (b.fecha_desde) return `📅 ${b.fecha_desde} → ${b.fecha_hasta || ''} — ${b.hora?.slice(0, 5)} a ${b.hora_fin?.slice(0, 5)}`
    if (b.dia_semana) return `🔄 ${DIAS[b.dia_semana - 1]} — ${b.hora?.slice(0, 5)} a ${b.hora_fin?.slice(0, 5)}`
    if (b.dia_desde) return `🔄 ${DIAS[b.dia_desde - 1]} → ${b.dia_hasta ? DIAS[b.dia_hasta - 1] : ''} — ${b.hora?.slice(0, 5)} a ${b.hora_fin?.slice(0, 5)}`
    return ''
  }).filter(Boolean)
}

export default function DetalleActividadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [actividad, setActividad] = useState<any>(null)
  const [resenas, setResenas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [reservando, setReservando] = useState(false)
  const [slotSel, setSlotSel] = useState<SlotInfo | null>(null)

  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [tieneReservaPagada, setTieneReservaPagada] = useState(false)

  const [cuponCodigo, setCuponCodigo] = useState('')
  const [cuponValido, setCuponValido] = useState<{ valido: boolean; descuento: number; mensaje: string } | null>(null)
  const [verificandoCupon, setVerificandoCupon] = useState(false)

  const esAnfitrion = user?.id === actividad?.anfitrion_id

  const cargarActividad = useCallback(async () => {
    const res = await fetch(`/api/actividades?id=${id}`)
    if (!res.ok) {
      toast.error('No se pudo cargar la actividad')
      router.push('/actividades')
      return
    }
    const data = await res.json()
    setActividad(data.actividad)
    setCargando(false)
  }, [id, router])

  const cargarResenas = useCallback(async () => {
    const res = await fetch(`/api/resenas?actividad_id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setResenas(data.resenas || [])
    }
  }, [id])

  useEffect(() => {
    cargarActividad()
    cargarResenas()
  }, [cargarActividad, cargarResenas])

  const reservar = async () => {
    if (!slotSel) {
      toast.error('Seleccioná un horario')
      return
    }
    setReservando(true)
    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        fecha: slotSel.fecha,
        hora_inicio: slotSel.hora_inicio,
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

  const horarios = actividad.horarios || []
  const slotsDisponibles = expandirHorarios(horarios)

  // Agrupar slots por fecha
  const slotsPorFecha: Record<string, SlotInfo[]> = {}
  for (const s of slotsDisponibles) {
    if (!slotsPorFecha[s.fecha]) slotsPorFecha[s.fecha] = []
    slotsPorFecha[s.fecha].push(s)
  }

  const resumenHorarios = resumirHorarios(horarios)

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
                    onClick={() => router.push(`/actividades/editar/${id}`)}
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
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </div>

          {/* Horarios */}
          {resumenHorarios.length > 0 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Horarios
              </p>
              <div className="space-y-1">
                {resumenHorarios.map((r, i) => (
                  <p key={i} className="text-sm text-texto">{r}</p>
                ))}
              </div>
            </div>
          )}

          {/* Slots disponibles */}
          {slotsDisponibles.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-texto">📅 Elegí tu turno</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {Object.entries(slotsPorFecha).map(([fecha, slots]) => (
                  <div key={fecha}>
                    <p className="mb-1 text-xs font-semibold text-texto-secundario">
                      {new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((s, i) => (
                        <button
                          key={`${s.fecha}-${s.hora_inicio}-${i}`}
                          type="button"
                          onClick={() => setSlotSel(s)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            slotSel?.fecha === s.fecha && slotSel?.hora_inicio === s.hora_inicio
                              ? 'bg-primario text-white'
                              : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                          }`}
                        >
                          <Clock className="mr-1 inline h-3 w-3" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
            disabled={reservando || !slotSel}
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