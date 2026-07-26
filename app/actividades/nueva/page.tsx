'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, MapPin, Clock, X } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function NuevaActividadPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    categoria: '',
    provincia: '',
    departamento: '',
    direccion: '',
    foto: '',
    horaInicio: '18:00',
    horaFin: '20:00',
    diasActivos: [] as string[],
  })
  const [fechasList, setFechasList] = useState<string[]>([])
  const [nuevaFecha, setNuevaFecha] = useState('')

  const toggleDia = (dia: string) =>
    setForm((f) => ({
      ...f,
      diasActivos: f.diasActivos.includes(dia)
        ? f.diasActivos.filter((d) => d !== dia)
        : [...f.diasActivos, dia],
    }))

  const agregarFecha = () => {
    if (!nuevaFecha) return
    if (fechasList.includes(nuevaFecha)) {
      toast.error('Esa fecha ya está agregada')
      return
    }
    setFechasList([...fechasList, nuevaFecha])
    setNuevaFecha('')
  }

  const sacarFecha = (f: string) => setFechasList(fechasList.filter((x) => x !== f))

  const crearActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignedIn || !user) {
      toast.error('Iniciá sesión para crear actividades')
      return
    }
    setCargando(true)

    if (!form.titulo || !form.precio || !form.categoria || !form.provincia) {
      toast.error('Completá todos los campos obligatorios')
      setCargando(false)
      return
    }

    const res = await fetch('/api/actividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo,
        descripcion: form.descripcion || 'Sin descripción',
        categoria: form.categoria,
        fechas: fechasList,
        fecha: fechasList.length > 0 ? fechasList[0] : null,
        hora: form.horaInicio || null,
        hora_fin: form.horaFin || null,
        lugar: [form.direccion, form.departamento, form.provincia].filter(Boolean).join(', ') || 'A confirmar',
        precio: Number(form.precio),
        capacidad_max: 20,
        imagen_url: form.foto || null,
        dias_semana: form.diasActivos.map((d) => DIAS.indexOf(d) + 1),
      }),
    })

    setCargando(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Error al crear la actividad')
      return
    }

    toast.success('Actividad creada')
    router.push('/anfitrion')
  }

  if (!isSignedIn) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-titulos text-2xl font-bold text-texto">Nueva actividad</h1>
        <p className="mt-1 text-sm text-texto-secundario">
          Completá los datos para publicar tu experiencia
        </p>
      </div>

      <form onSubmit={crearActividad} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Ej: Taller de cerámica artesanal"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Describí de qué se trata la experiencia..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            >
              <option value="">Seleccioná...</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Precio * ($)</label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="2500"
              min="0"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-texto">Provincia *</label>
            <input
              type="text"
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Buenos Aires"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Departamento</label>
            <input
              type="text"
              value={form.departamento}
              onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Gral. Pueyrredón"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Dirección</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Av. Colón 1234"
          />
        </div>

        {/* Fechas múltiples */}
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
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <span className="text-texto-secundario">a</span>
              <input
                type="time"
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
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
                  form.diasActivos.includes(dia)
                    ? 'bg-primario text-white'
                    : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-texto-secundario">
            Opcional: elegí los días de la semana si la actividad se repite semanalmente
          </p>
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