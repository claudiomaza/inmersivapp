'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, MapPin, Clock, X, Trash2 } from 'lucide-react'

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
  duracion_turno: number // 0 = sin duración (bloque completo)
}

let bloqueIdCounter = 0

function nuevoBloqueId() {
  return `bloque_${++bloqueIdCounter}`
}

function crearBloque(tipo: TipoBloque): BloqueForm {
  return {
    id: nuevoBloqueId(),
    tipo,
    hora: '09:00',
    hora_fin: '18:00',
    duracion_turno: 0,
  }
}

export default function NuevaActividadPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    precio_por_hora: '',
    es_grupal: false,
    precio_grupo: '',
    categoria: '',
    lugar: '',
    foto: '',
  })
  const [bloques, setBloques] = useState<BloqueForm[]>([])

  const actualizarBloque = (id: string, cambios: Partial<BloqueForm>) =>
    setBloques((b) => b.map((bl) => (bl.id === id ? { ...bl, ...cambios } : bl)))

  const eliminarBloque = (id: string) =>
    setBloques((b) => b.filter((bl) => bl.id !== id))

  const agregarBloque = (tipo: TipoBloque) =>
    setBloques((b) => [...b, crearBloque(tipo)])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignedIn) {
      toast.error('Iniciá sesión para publicar')
      return
    }

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
      return
    }

    setCargando(true)
    const res = await fetch('/api/actividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        horarios,
        precio_por_hora: form.precio_por_hora ? Number(form.precio_por_hora) : null,
        es_grupal: form.es_grupal,
        precio_grupo: form.precio_grupo ? Number(form.precio_grupo) : null,
      }),
    })
    setCargando(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Error al publicar')
      return
    }

    toast.success('Actividad publicada')
    router.push('/anfitrion')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 font-titulos text-3xl font-bold text-texto">Nueva experiencia</h1>

      <form onSubmit={guardar} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título</label>
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Ej: Taller de cerámica"
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
            placeholder="Contá de qué se trata..."
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
              placeholder="0"
            />
          </div>
        </div>

        {/* Configuración de precios dinámicos */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-texto">Configuración de precios</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Precio por hora ($)</label>
              <input
                type="number"
                min={0}
                value={form.precio_por_hora}
                onChange={(e) => setForm({ ...form, precio_por_hora: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                placeholder="Dejalo vacío para calcularlo automáticamente del precio base"
              />
              <p className="mt-1 text-xs text-texto-secundario">
                Si lo completás, se usa este valor × duración del bloque. Si no, se calcula del precio base.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="es_grupal"
                checked={form.es_grupal}
                onChange={(e) => setForm({ ...form, es_grupal: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primario focus:ring-primario"
              />
              <label htmlFor="es_grupal" className="text-sm font-medium text-texto">
                Es grupal (precio fijo por grupo)
              </label>
            </div>
            {form.es_grupal && (
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">Precio por grupo ($)</label>
                <input
                  type="number"
                  min={0}
                  value={form.precio_grupo}
                  onChange={(e) => setForm({ ...form, precio_grupo: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                  placeholder="Ej: 12000"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Lugar</label>
          <input
            type="text"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Ej: Salta 123, Mendoza"
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
                  {/* Fecha puntual */}
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

                  {/* Rango de fechas */}
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

                  {/* Día de la semana */}
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

                  {/* Rango de días */}
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

                  {/* Horas */}
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

                {/* Duración de turno */}
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-texto-secundario">
                    Duración del turno{' '}
                    <span className="italic text-gray-400">(en minutos, 0 = bloque completo)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={b.duracion_turno}
                    onChange={(e) => actualizarBloque(b.id, { duracion_turno: Number(e.target.value) })}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                    placeholder="Ej: 60"
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
                Todavía no hay bloques horarios. Hacé clic en los botones de arriba para agregar.
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
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primario py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          {cargando ? 'Publicando…' : 'Publicar experiencia'}
        </button>
      </form>
    </div>
  )
}