'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/lib/lang-context'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import { Star, MessageCircle, Ticket, Users, Clock } from 'lucide-react'
import {
  calcularPrecioUnitario,
  calcularPrecioTotal,
  descripcionPrecio,
  descripcionPrecioBloque,
  duracionEnHoras,
  type BloqueHorario,
} from '@/lib/precio-utils'

export default function DetalleActividadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [actividad, setActividad] = useState<any>(null)
  const [resenas, setResenas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [reservando, setReservando] = useState(false)
  const [fechaSel, setFechaSel] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [bloqueSel, setBloqueSel] = useState<BloqueHorario | null>(null)

  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)

  // Participantes para reserva grupal
  const { t } = useLang()
  const [participantes, setParticipantes] = useState<{ nombre: string; dni: string }[]>([])

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
    ]).finally(() => setCargando(false))
  }, [id, cargarResenas])

  // Reset cantidad cuando cambia el bloque
  useEffect(() => {
    setCantidad(1)
    setParticipantes([])
  }, [bloqueSel])

  // Sincronizar participantes con la cantidad
  useEffect(() => {
    setParticipantes(prev => {
      const nuevos = Array.from({ length: cantidad }, (_, i) => prev[i] || { nombre: '', dni: '' })
      return nuevos
    })
  }, [cantidad])

  // Calcular precio actual
  const precioUnitario = calcularPrecioUnitario(actividad || {}, bloqueSel)
  const precioTotal = calcularPrecioTotal(actividad || {}, cantidad, bloqueSel)
  const descPrecio = descripcionPrecio(actividad || {})

  // {t("cupon.aplicar")} descuento de cupón
  const descuento = cuponValido?.valido ? (cuponValido.descuento / 100) : 0
  const precioFinal = Math.round(precioTotal * (1 - descuento))

  const reservar = async () => {
    if (!isSignedIn) return router.push('/login')
    if (!fechaSel) return toast.error(t("actividad.seleccionar_fecha"))
    if (!actividad.es_grupal && cantidad < 1) return toast.error(t("actividad.seleccionar_personas"))

    // Validate participants if grupal
    if (bloqueSel?.es_grupal) {
      const incompletos = participantes.some(p => !p.nombre.trim() || !p.dni.trim())
      if (incompletos) return toast.error(t("actividad.completar_datos"))
    }

    setReservando(true)

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actividad_id: id,
        fecha: fechaSel,
        cantidad: bloqueSel?.es_grupal ? cantidad : cantidad,
        monto: precioFinal,
        cupon_codigo: cuponValido?.valido ? cuponCodigo : undefined,
        participantes: bloqueSel?.es_grupal ? participantes : undefined,
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
        titulo: `${actividad.titulo}${!actividad.es_grupal && cantidad > 1 ? ` (×${cantidad})` : ''}`,
        monto: precioFinal,
        cantidad: cantidad,
        usuario_id: user?.id,
      }),
    })

    if (!pagoRes.ok) {
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

    window.location.href = init_point
  }

  const verificarCupon = async () => {
    if (!cuponCodigo.trim()) return
    setVerificandoCupon(true)

    const res = await fetch('/api/cupones/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: cuponCodigo, monto: precioTotal }),
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
        <p className="text-texto-secundario">{t("actividad.no_encontrada")}</p>
      </div>
    )
  }

  const horarios = (actividad.horarios || []) as BloqueHorario[]

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

          {/* {t("actividad.horarios_disponibles")} */}
          {horarios.length > 0 && (
            <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-titulos font-semibold text-texto">
                <Clock className="h-4 w-4" /> {t("actividad.horarios_disponibles")}
              </h3>
              <div className="mt-3 space-y-2">
                {horarios.map((h, i) => {
                  const precio = calcularPrecioUnitario(actividad, h)
                  const hs = duracionEnHoras(h)
                  const sel = bloqueSel === h
                  return (
                    <button
                      key={i}
                      onClick={() => setBloqueSel(sel ? null : h)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        sel
                          ? 'border-primario bg-primario/5 ring-2 ring-primario/20'
                          : 'border-gray-200 hover:border-primario/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-texto">
                            {h.hora}{h.hora_fin ? ` — ${h.hora_fin}` : ''}
                            {hs > 0 && <span className="ml-2 text-sm text-texto-secundario">({hs}h)</span>}
                          </p>
                          <p className="text-sm text-texto-secundario">
                            {h.dia_semana !== undefined
                              ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][h.dia_semana]
                              : h.fecha
                                ? new Date(h.fecha).toLocaleDateString('es-AR')
                                : ''}
                          </p>
                        </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primario">
                          {formatPrecio(precio)}
                        </p>
                        {h.es_grupal && h.personas_grupo && (
                          <p className="text-xs text-texto-secundario">
                            hasta {h.personas_grupo} pers.
                          </p>
                        )}
                      </div>
                    </div>
                    {actividad.precio_por_hora && !h.precio && (
                      <p className="mt-1 text-xs text-texto-secundario">
                        ${actividad.precio_por_hora.toLocaleString('es-AR')}/hora
                      </p>
                    )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* {t("actividad.resenas")} */}
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-titulos font-semibold text-texto">
              <MessageCircle className="h-4 w-4" /> {t("actividad.resenas")} ({resenas.length})
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

            {isSignedIn && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-titulos text-base font-semibold text-texto">{t("actividad.dejar_resena")}</h3>
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
                  {enviandoResena ? t("actividad.enviando") : t("actividad.enviar_resena")}
                </button>
              </div>
            )}
          </div>

          {/* Cupón */}
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-titulos font-semibold text-texto">
              <Ticket className="h-4 w-4" /> {t("actividad.tenes_cupon")}
            </h3>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={cuponCodigo}
                onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
                placeholder={t("cupon.codigo")}
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
        </div>

        {/* Sidebar — Reserva */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-xl bg-white p-6 shadow-sm">
            {/* Precio */}
            <div className="text-center">
              <p className="font-titulos text-3xl font-bold text-primario">
                {formatPrecio(precioFinal)}
              </p>
              <p className="mt-1 text-sm text-texto-secundario">
                {actividad.es_grupal
                  ? 'por grupo'
                  : bloqueSel
                    ? descripcionPrecioBloque(actividad, bloqueSel)
                    : descPrecio
                }
              </p>
              {descuento > 0 && (
                <p className="mt-1 text-xs text-green-600">
                  {cuponValido?.descuento}% OFF aplicado
                </p>
              )}
            </div>

            {/* Capacidad */}
            {actividad.capacidad_max && (
              <p className="mt-3 text-center text-sm text-texto-secundario">
                <Users className="mr-1 inline h-4 w-4" />
                {bloqueSel?.es_grupal
                  ? `Hasta ${actividad.capacidad_max} grupos`
                  : `{t("actividad.capacidad_max")}: ${actividad.capacidad_max} personas`
                }
              </p>
            )}

            {/* Selector de personas */}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-texto">
                {bloqueSel?.es_grupal ? 'Cantidad de grupos' : 'Cantidad de personas'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  disabled={cantidad <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition hover:bg-gray-50 disabled:opacity-30"
                >
                  –
                </button>
                <span className="min-w-[2rem] text-center text-lg font-semibold text-texto">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(Math.min(actividad.capacidad_max || 10, cantidad + 1))}
                  disabled={cantidad >= (actividad.capacidad_max || 10)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium transition hover:bg-gray-50 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Formulario de participantes para reserva grupal */}
            {bloqueSel?.es_grupal && cantidad > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-texto">{t("actividad.datos_participantes")}</p>
                {participantes.map((p, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold text-texto-secundario">
                      {t("actividad.persona_label")} {i + 1}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={p.nombre}
                        onChange={(e) => {
                          const nuevos = [...participantes]
                          nuevos[i] = { ...nuevos[i], nombre: e.target.value }
                          setParticipantes(nuevos)
                        }}
                        placeholder="Nombre completo"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                      />
                      <input
                        type="text"
                        value={p.dni}
                        onChange={(e) => {
                          const nuevos = [...participantes]
                          nuevos[i] = { ...nuevos[i], dni: e.target.value.replace(/\D/g, '') }
                          setParticipantes(nuevos)
                        }}
                        placeholder="DNI"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fecha */}
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

            {/* Botón de reserva */}
            <button
              onClick={reservar}
              disabled={reservando || !fechaSel}
              className="mt-4 w-full rounded-lg bg-primario py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              {reservando
                ? t("actividad.procesando")
                : `${t("actividad.reservar")} — ${formatPrecio(precioFinal)}${!bloqueSel?.es_grupal && cantidad > 1 ? ` (×${cantidad})` : ''}${bloqueSel?.es_grupal && cantidad > 1 ? ` (×${cantidad} grupo${cantidad > 1 ? 's' : ''})` : ''}`
              }
            </button>

            {!isSignedIn && (
              <p className="mt-3 text-center text-xs text-texto-secundario">
                <button onClick={() => router.push('/login')} className="text-primario underline">
                  {t("actividad.iniciar_sesion")}
                </button>
              </p>
            )}

            {isSignedIn && (
              <p className="mt-3 text-center text-xs text-texto-secundario">
                {t("reserva.no_cobro")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}