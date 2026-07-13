'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPrecio, generarCodigoConfirmacion } from '@/lib/utils'
import { toast } from 'sonner'
import { Star, MessageCircle, Ticket } from 'lucide-react'

export default function DetalleActividadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [actividad, setActividad] = useState<any>(null)
  const [resenas, setResenas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [reservando, setReservando] = useState(false)
  const [sesion, setSesion] = useState<any>(null)
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
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    Promise.all([
      supabase.from('actividades').select('*').eq('id', id).single(),
      cargarResenas(),
    ]).then(([act]) => {
      setActividad(act.data)
      setCargando(false)
    })
  }, [id, cargarResenas])

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

    const codigo = generarCodigoConfirmacion()
    const precioFinal = cuponValido?.valido
      ? Math.round(actividad.precio * (1 - cuponValido.descuento / 100))
      : actividad.precio

    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        usuario_id: sesion.user.id,
        actividad_id: id,
        fecha: fechaSel,
        estado: 'pendiente',
        codigo_confirmacion: codigo,
        precio_final: precioFinal,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al crear la reserva')
      setReservando(false)
      return
    }

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

  const enviarResena = async () => {
    if (!sesion) {
      toast.error('Iniciá sesión para opinar')
      return
    }
    if (puntuacion === 0) {
      toast.error('Seleccioná una puntuación')
      return
    }

    setEnviandoResena(true)
    const { error } = await supabase.from('resenas').insert({
      usuario_id: sesion.user.id,
      actividad_id: id,
      puntuacion,
      comentario,
    })

    if (error) {
      toast.error('Error al enviar la reseña')
    } else {
      toast.success('Reseña publicada')
      setComentario('')
      setPuntuacion(0)
      await cargarResenas()
    }
    setEnviandoResena(false)
  }

  const verificarCupon = async () => {
    setVerificandoCupon(true)
    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .eq('codigo', cuponCodigo.toUpperCase())
      .eq('activo', true)
      .single()

    if (error || !data) {
      setCuponValido({ valido: false, descuento: 0, mensaje: 'Cupón no encontrado' })
    } else if (data.vence && new Date(data.vence) < new Date()) {
      setCuponValido({ valido: false, descuento: 0, mensaje: 'Cupón vencido' })
    } else if (data.usos_actuales >= data.usos_maximos) {
      setCuponValido({ valido: false, descuento: 0, mensaje: 'Cupón agotado' })
    } else {
      setCuponValido({ valido: true, descuento: data.descuento_porcentaje, mensaje: '¡Cupón válido!' })
    }
    setVerificandoCupon(false)
  }

  const contactarAnfitrion = async () => {
    if (!sesion || !actividad.anfitrion_id) return
    const { error } = await supabase.from('mensajes').insert({
      emisor_id: sesion.user.id,
      receptor_id: actividad.anfitrion_id,
      actividad_id: id,
      contenido: `Hola 👋! Me interesa "${actividad.titulo}". ¿Tenés disponibilidad?`,
    })
    if (error) {
      toast.error('Error al enviar el mensaje')
    } else {
      toast.success('Mensaje enviado al anfitrión')
      // Crear notificación para el anfitrión
      await supabase.from('notificaciones').insert({
        usuario_id: actividad.anfitrion_id,
        titulo: 'Nuevo mensaje',
        cuerpo: `Tenés un mensaje sobre "${actividad.titulo}"`,
        tipo: 'mensaje',
        referencia_id: id,
      })
    }
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando actividad…</p>
  if (!actividad) return <p className="mt-8 text-center text-texto-secundario">Actividad no encontrada</p>

  const foto = actividad.fotos?.[0] || 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'
  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <div className="overflow-hidden rounded-xl">
        <img src={foto} alt={actividad.titulo} className="h-72 w-full object-cover sm:h-96" />
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-secundario/20 px-3 py-1 text-sm font-medium text-secundario-dark">
              {actividad.categoria}
            </span>
            <h1 className="mt-3 font-titulos text-3xl font-bold text-texto">
              {actividad.titulo}
            </h1>
          </div>
          {promedio && (
            <div className="flex items-center gap-1.5 rounded-lg bg-superficie px-3 py-2 shadow-sm">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-titulos text-lg font-bold">{promedio}</span>
              <span className="text-sm text-texto-secundario">({resenas.length})</span>
            </div>
          )}
        </div>

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

        {/* Horarios */}
        {actividad.horarios && Object.keys(actividad.horarios).length > 0 && (
          <div className="mt-6 rounded-lg bg-superficie p-4 shadow-sm">
            <p className="text-sm text-texto-secundario">Horarios disponibles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(actividad.horarios as Record<string, {inicio: string; fin: string}>).map(([dia, h]) => (
                <span key={dia} className="rounded-full bg-primario/10 px-3 py-1 text-sm text-primario">
                  {dia} {h.inicio}–{h.fin}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contactar anfitrión */}
        {sesion && (
          <div className="mt-6">
            <button
              onClick={contactarAnfitrion}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primario px-6 py-3 font-semibold text-primario transition hover:bg-primario hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar al anfitrión
            </button>
          </div>
        )}

        {/* Sección de reserva */}
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

          {/* Cupón de descuento */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-texto">
              <Ticket className="mr-1 inline h-4 w-4" />
              ¿Tenés un cupón?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cuponCodigo}
                onChange={(e) => { setCuponCodigo(e.target.value); setCuponValido(null) }}
                placeholder="CÓDIGO"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={verificarCupon}
                disabled={!cuponCodigo || verificandoCupon}
                className="rounded-lg bg-secundario px-4 py-2 text-sm font-semibold text-white transition hover:bg-secundario-dark disabled:opacity-50"
              >
                {verificandoCupon ? '…' : 'Aplicar'}
              </button>
            </div>
            {cuponValido && (
              <p className={`mt-1 text-sm ${cuponValido.valido ? 'text-exito' : 'text-error'}`}>
                {cuponValido.mensaje}
                {cuponValido.valido && ` (${cuponValido.descuento}% OFF)`}
              </p>
            )}
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

        {/* Reseñas */}
        <section className="mt-12">
          <h2 className="font-titulos text-2xl font-bold text-texto">
            Reseñas {promedio && `(${promedio} ★)`}
          </h2>

          {/* Formulario de reseña */}
          {sesion && (
            <div className="mt-4 rounded-xl bg-superficie p-4 shadow-sm">
              <h3 className="font-medium text-texto">Dejá tu opinión</h3>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPuntuacion(n)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        n <= puntuacion
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Contá tu experiencia…"
                rows={3}
                className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={enviarResena}
                disabled={enviandoResena || puntuacion === 0}
                className="mt-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
              >
                {enviandoResena ? 'Enviando…' : 'Publicar reseña'}
              </button>
            </div>
          )}

          {/* Lista de reseñas */}
          <div className="mt-6 space-y-4">
            {resenas.length === 0 ? (
              <p className="text-sm text-texto-secundario">
                Todavía no hay reseñas. ¡Sé el primero en opinar!
              </p>
            ) : (
              resenas.map((r) => (
                <div key={r.id} className="rounded-lg bg-superficie p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-texto">
                      {r.perfiles?.nombre} {r.perfiles?.apellido}
                    </span>
                    <span className="text-xs text-texto-secundario">
                      {new Date(r.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < r.puntuacion
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {r.comentario && (
                    <p className="mt-2 text-sm text-texto-secundario">{r.comentario}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}