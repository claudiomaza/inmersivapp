'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, MapPin, Clock } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function NuevaActividadPage() {
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
    fechas: '',
    horaInicio: '18:00',
    horaFin: '20:00',
    diasActivos: [] as string[],
  })

  const toggleDia = (dia: string) =>
    setForm((f) => ({
      ...f,
      diasActivos: f.diasActivos.includes(dia)
        ? f.diasActivos.filter((d) => d !== dia)
        : [...f.diasActivos, dia],
    }))

  const crearActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Iniciá sesión para crear actividades')
      setCargando(false)
      return
    }

    if (!form.titulo || !form.precio || !form.categoria || !form.provincia) {
      toast.error('Completá todos los campos obligatorios')
      setCargando(false)
      return
    }

    // Build horarios JSON
    const horarios: Record<string, { activo: boolean; inicio: string; fin: string }> = {}
    form.diasActivos.forEach((dia) => {
      horarios[dia] = { activo: true, inicio: form.horaInicio, fin: form.horaFin }
    })

    // Parse fechas
    const fechasArray = form.fechas
      ? form.fechas.split(',').map((f) => f.trim()).filter(Boolean)
      : []

    const { error } = await supabase.from('actividades').insert({
      titulo: form.titulo,
      descripcion: form.descripcion || 'Sin descripción',
      precio: Number(form.precio),
      categoria: form.categoria,
      ubicacion: {
        provincia: form.provincia,
        departamento: form.departamento || form.provincia,
        direccion: form.direccion || 'A confirmar',
      },
      fotos: form.foto ? [form.foto] : [],
      anfitrion_id: user.id,
      anfitrion_nombre: user.user_metadata?.username || '',
      horarios: Object.keys(horarios).length > 0 ? horarios : null,
      fechas: fechasArray.length > 0 ? fechasArray : null,
      activa: true,
    })

    if (error) {
      toast.error(error.message)
      setCargando(false)
      return
    }

    toast.success('Actividad creada')
    router.push('/actividades')
    router.refresh()
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <h1 className="font-titulos text-3xl font-bold text-primario">Nueva actividad</h1>
      <p className="mt-1 text-texto-secundario">Publicá tu experiencia y conectá con participantes.</p>

      <form onSubmit={crearActividad} className="mt-6 space-y-5 rounded-xl bg-superficie p-6 shadow-sm">
        {/* Título */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título *</label>
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Ej: Taller de Cerámica Sensorial"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Describí tu experiencia, qué incluye, para quién es..."
          />
        </div>

        {/* Grid: Precio + Categoría */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Precio ($) *</label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="45000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            >
              <option value="">Seleccioná una categoría</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-texto">
            <MapPin className="h-4 w-4" />
            Ubicación
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Provincia *"
            />
            <input
              value={form.departamento}
              onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Departamento"
            />
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="Dirección"
            />
          </div>
        </div>

        {/* Horarios */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-texto">
            <Clock className="h-4 w-4" />
            Días y horarios
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {DIAS.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  form.diasActivos.includes(dia)
                    ? 'bg-primario text-white'
                    : 'bg-gray-100 text-texto hover:bg-gray-200'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-texto-secundario">Inicio</label>
              <input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-texto-secundario">Fin</label>
              <input
                type="time"
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
          </div>
        </div>

        {/* Foto + Fechas */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">URL de foto</label>
            <input
              value={form.foto}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Fechas disponibles</label>
            <input
              value={form.fechas}
              onChange={(e) => setForm({ ...form, fechas: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="2026-07-20, 2026-07-27"
            />
            <p className="mt-1 text-xs text-texto-secundario">Separadas por coma: YYYY-MM-DD</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primario px-6 py-3 font-titulos text-lg font-bold text-white shadow-lg transition hover:bg-primario-dark disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          {cargando ? 'Publicando…' : 'Publicar actividad'}
        </button>
      </form>
    </div>
  )
}