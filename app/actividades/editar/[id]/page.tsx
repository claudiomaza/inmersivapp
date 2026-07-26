'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

type TipoBloque = 'fecha' | 'rango_fechas' | 'dia_semana' | 'rango_dias'

interface BloqueForm {
  id: string
  tipo: TipoBloque
  fecha?: string
  fecha_desde?: string
  fecha_hasta?: string
  dia_semana?: number
  dia_desde?: number
  dia_hasta?: number
  hora: string
  hora_fin: string
  duracion_turno: number
}

let bloqueIdCounter = 0

function nuevoBloqueId() {
  return `bloque_${++bloqueIdCounter}`
}

function inferirTipo(bloque: any): TipoBloque {
  if (bloque.fecha) return 'fecha'
  if (bloque.fecha_desde || bloque.fecha_hasta) return 'rango_fechas'
  if (bloque.dia_semana) return 'dia_semana'
  if (bloque.dia_desde || bloque.dia_hasta) return 'rango_dias'
  return 'fecha'
}

function bloqueDesdeAPI(b: any): BloqueForm {
  return {
    id: nuevoBloqueId(),
    tipo: inferirTipo(b),
    fecha: b.fecha || undefined,
    fecha_desde: b.fecha_desde || undefined,
    fecha_hasta: b.fecha_hasta || undefined,
    dia_semana: b.dia_semana || undefined,
    dia_desde: b.dia_desde || undefined,
    dia_hasta: b.dia_hasta || undefined,
    hora: b.hora?.slice(0, 5) || '09:00',
    hora_fin: b.hora_fin?.slice(0, 5) || '18:00',
    duracion_turno: b.duracion_turno || 0,
  }
}

export default function EditarActividadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    categoria: '',
    lugar: '',
    foto: '',
  })
  const [bloques, setBloques] = useState<BloqueForm[]>([])

  useEffect(() => {
    if (!id || !user) return
    const cargar = async () => {
      const res = await fetch(`/api/actividades?id=${id}`)
      if (!res.ok) {
        toast.error('No se pudo cargar la actividad')
        router.push('/anfitrion')
        return
      }
      const data = await res.json()
      const a = data.actividad

      if (a.anfitrion_id !== user.id) {
        toast.error('No tenés permisos para editar esta actividad')
        router.push('/anfitrion')
        return
      }

      setForm({
        titulo: a.titulo || '',
        descripcion: a.descripcion || '',
        precio: a.precio?.toString() || '',
        categoria: a.categoria || '',
        lugar: a.lugar || '',
        foto: a.imagen_url || '',
      })

      // Convertir bloques existentes o migrar desde campos viejos
      if (a.horarios && Array.isArray(a.horarios) && a.horarios.length > 0) {
        setBloques(a.horarios.map(bloqueDesdeAPI))
      } else {
        // Migración desde campos viejos
        const nuevos: BloqueForm[] = []
        if (a.fechas && Array.isArray(a.fechas)) {
          a.fechas.forEach((f: string) => {
            nuevos.push({
              id: nuevoBloqueId(),
              tipo: 'fecha',
              fecha: f,
              hora: (a.hora || '10:00').slice(0, 5),
              hora_fin: (a.hora_fin || '12:00').slice(0, 5),
              duracion_turno: 0,
            })
          })
        } else if (a.fecha) {
          nuevos.push({
            id: nuevoBloqueId(),
            tipo: 'fecha',
            fecha: a.fecha,
            hora: (a.hora || '10:00').slice(0, 5),
            hora_fin: (a.hora_fin || '12:00').slice(0, 5),
            duracion_turno: 0,
          })
        }
        if (a.dias_semana && Array.isArray(a.dias_semana)) {
          a.dias_semana.forEach((d: number) => {
            nuevos.push({
              id: nuevoBloqueId(),
              tipo: 'dia_semana',
              dia_semana: d,
              hora: (a.hora || '10:00').slice(0, 5),
              hora_fin: (a.hora_fin || '12:00').slice(0, 5),
              duracion_turno: 0,
            })
          })
        }
        setBloques(nuevos)
      }

      setCargando(false)
    }
    cargar()
  }, [id, user, router])

  const actualizarBloque = (bid: string, cambios: Partial<BloqueForm>) =>
    setBloques((b) => b.map((bl) => (bl.id === bid ? { ...bl, ...cambios } : bl)))

  const eliminarBloque = (bid: string) =>
    setBloques((b) => b.filter((bl) => bl.id !== bid))

  const agregarBloque = (tipo: TipoBloque) =>
    setBloques((b) => [...b, {
      id: nuevoBloqueId(),
      tipo,
      hora: '09:00',
      hora_fin: '18:00',
      duracion_turno: 0,
    }])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    const horarios = bloques.map((b) => {
      const base: any = { hora: b.hora, hora_fin: b.hora_fin }
      if (b.duracion_turno > 0) base.duracion_turno = b.duracion_turno
      if (b.tipo === 'fecha') base.fecha = b.fecha
      else if (b.tipo === 'rango_fechas') {
        base.fecha_desde = b.fecha_desde
        base.fecha_hasta = b.fecha_hasta
      } else if (b.tipo === 'dia_semana') base.dia_semana = b.dia_semana
      else if (b.tipo === 'rango_dias') {
        base.dia_desde = b.dia_desde
        base.dia_hasta = b.dia_hasta
      }
      return base
    })

    if (horarios.length === 0) {
      toast.error('Agregá al menos un bloque horario')
      setGuardando(false)
      return
    }

    const res = await fetch('/api/actividades', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        horarios,
        lugar: form.lugar,
        precio: Number(form.precio),
        imagen_url: form.foto || null,
      }),
    })

    setGuardando(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Error al guardar')
      return
    }

    toast.success('Actividad actualizada')
    router.push('/anfitrion')
  }

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/anfitrion')}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-texto"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-titulos text-2xl font-bold text-texto">Editar actividad</h1>
      </div>

      <form onSubmit={guardar} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título</label>
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Descripción</label>
          <textarea
            required
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Categoría</label>
            <select
              required
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            >
              <option value="">Seleccionar</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Precio ($)</label>
            <input
              type="number"
              required
              min={0}
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Lugar</label>
          <input
            type="text"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        {/* Bloques horarios */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-medium text-texto">Horarios</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => agregarBloque('fecha')}
                className="rounded-lg bg-primario/10 px-2.5 py-1.5 text-xs font-medium text-primario transition hover:bg-primario/20"
              >
                + Fecha
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('rango_fechas')}
                className="rounded-lg bg-primario/10 px-2.5 py-1.5 text-xs font-medium text-primario transition hover:bg-primario/20"
              >
                + Rango fechas
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('dia_semana')}
                className="rounded-lg bg-primario/10 px-2.5 py-1.5 text-xs font-medium text-primario transition hover:bg-primario/20"
              >
                + Día semanal
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('rango_dias')}
                className="rounded-lg bg-primario/10 px-2.5 py-1.5 text-xs font-medium text-primario transition hover:bg-primario/20"
              >
                + Rango días
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {bloques.map((b) => (
              <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primario">
                    {b.tipo === 'fecha' && 'Fecha puntual'}
                    {b.tipo === 'rango_fechas' && 'Rango de fechas'}
                    {b.tipo === 'dia_semana' && 'Día de la semana'}
                    {b.tipo === 'rango_dias' && 'Rango de días'}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarBloque(b.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {b.tipo === 'fecha' && (
                    <div>
                      <label className="mb-1 block text-xs text-texto-secundario">Fecha</label>
                      <input
                        type="date"
                        value={b.fecha || ''}
                        onChange={(e) => actualizarBloque(b.id, { fecha: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                      />
                    </div>
                  )}

                  {b.tipo === 'rango_fechas' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-texto-secundario">Desde</label>
                        <input
                          type="date"
                          value={b.fecha_desde || ''}
                          onChange={(e) => actualizarBloque(b.id, { fecha_desde: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-texto-secundario">Hasta</label>
                        <input
                          type="date"
                          value={b.fecha_hasta || ''}
                          onChange={(e) => actualizarBloque(b.id, { fecha_hasta: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                        />
                      </div>
                    </>
                  )}

                  {b.tipo === 'dia_semana' && (
                    <div>
                      <label className="mb-1 block text-xs text-texto-secundario">Día</label>
                      <select
                        value={b.dia_semana || ''}
                        onChange={(e) => actualizarBloque(b.id, { dia_semana: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                      >
                        <option value="">Seleccionar</option>
                        {DIAS.map((d, i) => (
                          <option key={i} value={i + 1}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {b.tipo === 'rango_dias' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-texto-secundario">Desde</label>
                        <select
                          value={b.dia_desde || ''}
                          onChange={(e) => actualizarBloque(b.id, { dia_desde: Number(e.target.value) })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                        >
                          <option value="">Seleccionar</option>
                          {DIAS.map((d, i) => (
                            <option key={i} value={i + 1}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-texto-secundario">Hasta</label>
                        <select
                          value={b.dia_hasta || ''}
                          onChange={(e) => actualizarBloque(b.id, { dia_hasta: Number(e.target.value) })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                        >
                          <option value="">Seleccionar</option>
                          {DIAS.map((d, i) => (
                            <option key={i} value={i + 1}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-1 block text-xs text-texto-secundario">Hora inicio</label>
                    <input
                      type="time"
                      value={b.hora}
                      onChange={(e) => actualizarBloque(b.id, { hora: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-texto-secundario">Hora fin</label>
                    <input
                      type="time"
                      value={b.hora_fin}
                      onChange={(e) => actualizarBloque(b.id, { hora_fin: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs text-texto-secundario">
                    Duración del turno{' '}
                    <span className="italic text-gray-400">(minutos, 0 = bloque completo)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={b.duracion_turno}
                    onChange={(e) => actualizarBloque(b.id, { duracion_turno: Number(e.target.value) })}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                  />
                  {b.duracion_turno > 0 && (
                    <p className="mt-1 text-xs text-texto-secundario">
                      Se generarán turnos de {b.duracion_turno} min cada uno
                    </p>
                  )}
                </div>
              </div>
            ))}
            {bloques.length === 0 && (
              <p className="py-4 text-center text-sm text-texto-secundario">
                No hay bloques horarios. Agregá al menos uno.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Foto (URL)</label>
          <input
            type="text"
            value={form.foto}
            onChange={(e) => setForm({ ...form, foto: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primario py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}