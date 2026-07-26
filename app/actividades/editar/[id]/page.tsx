'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Save, ArrowLeft, X } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

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
    hora: '18:00',
    hora_fin: '20:00',
  })
  const [fechasList, setFechasList] = useState<string[]>([])
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [diasActivos, setDiasActivos] = useState<string[]>([])

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

      // Verificar que sea el dueño
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
        hora: a.hora?.slice(0, 5) || '18:00',
        hora_fin: a.hora_fin?.slice(0, 5) || '20:00',
      })
      setFechasList(a.fechas || (a.fecha ? [a.fecha] : []))
      if (a.dias_semana) {
        setDiasActivos(a.dias_semana.map((d: number) => DIAS[d - 1]))
      }
      setCargando(false)
    }
    cargar()
  }, [id, user, router])

  const toggleDia = (dia: string) =>
    setDiasActivos((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    )

  const agregarFecha = () => {
    if (!nuevaFecha) return
    if (fechasList.includes(nuevaFecha)) {
      toast.error('Esa fecha ya está')
      return
    }
    setFechasList([...fechasList, nuevaFecha])
    setNuevaFecha('')
  }

  const sacarFecha = (f: string) => setFechasList(fechasList.filter((x) => x !== f))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    const res = await fetch('/api/actividades', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        fechas: fechasList,
        fecha: fechasList.length > 0 ? fechasList[0] : null,
        hora: form.hora || null,
        hora_fin: form.hora_fin || null,
        lugar: form.lugar,
        precio: Number(form.precio),
        imagen_url: form.foto || null,
        dias_semana: diasActivos.map((d) => DIAS.indexOf(d) + 1),
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
        <div>
          <h1 className="font-titulos text-2xl font-bold text-texto">Editar actividad</h1>
          <p className="text-sm text-texto-secundario">Actualizá los datos de tu experiencia</p>
        </div>
      </div>

      <form onSubmit={guardar} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Categoría</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Precio ($)</label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Ubicación</label>
          <input
            type="text"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>

        {/* Fechas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Fechas disponibles</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            />
            <button
              type="button"
              onClick={agregarFecha}
              disabled={!nuevaFecha}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-texto transition hover:bg-gray-200 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
          {fechasList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {fechasList.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
                  {new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  <button type="button" onClick={() => sacarFecha(f)} className="ml-0.5 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Horario</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <span className="text-texto-secundario">a</span>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
          </div>
        </div>

        {/* Días de la semana */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Días de la semana (recurrencia)</label>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  diasActivos.includes(dia)
                    ? 'bg-primario text-white'
                    : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                }`}
              >
                {dia}
              </button>
            ))}
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