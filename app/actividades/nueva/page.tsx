'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
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
      anfitrion_nombre: user.fullName || '',
      horarios: Object.keys(horarios).length > 0 ? horarios : null,
      fechas: fechasArray.length > 0 ? fechasArray : null,
      activa: true,
    })

    setCargando(false)

    if (error) {
      toast.error('Error al crear la actividad')
      return
    }

    toast.success('Actividad creada')
    router.push('/admin')
  }

  if (!isSignedIn) return null // middleware ya redirige

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primario/10">
          <Plus className="h-6 w-6 text-primario" />
        </div>
        <div>
          <h1 className="font-titulos text-2xl font-bold text-texto">Nueva actividad</h1>
          <p className="text-sm text-texto-secundario">Completá los datos para publicar tu experiencia</p>
        </div>
      </div>

      <form onSubmit={crearActividad} className="space-y-6">
        {/* Título */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Título *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Ej: Taller de cerámica artesanal"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="Contá de qué se trata tu experiencia…"
          />
        </div>

        {/* Precio y categoría */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Precio ($ARS) *</label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="5000"
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
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
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-texto">
            <MapPin className="h-4 w-4" /> Ubicación
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-texto-secundario">Provincia *</label>
              <input
                type="text"
                value={form.provincia}
                onChange={(e) => setForm((f) => ({ ...f, provincia: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                placeholder="Mendoza"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-texto-secundario">Departamento</label>
              <input
                type="text"
                value={form.departamento}
                onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                placeholder="Luján de Cuyo"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-texto-secundario">Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                placeholder="Calle 123"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-texto">
            <Clock className="h-4 w-4" /> Horarios
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-texto-secundario">Hora inicio</label>
              <input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-texto-secundario">Hora fin</label>
              <input
                type="time"
                value={form.horaFin}
                onChange={(e) => setForm((f) => ({ ...f, horaFin: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-xs text-texto-secundario">Días activos</label>
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
          </div>
        </div>

        {/* Fechas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Fechas disponibles</label>
          <input
            type="text"
            value={form.fechas}
            onChange={(e) => setForm((f) => ({ ...f, fechas: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="2026-08-01, 2026-08-08, 2026-08-15"
          />
          <p className="mt-1 text-xs text-texto-secundario">Separadas por coma, formato YYYY-MM-DD</p>
        </div>

        {/* Foto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">URL de foto (opcional)</label>
          <input
            type="url"
            value={form.foto}
            onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primario px-4 py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          {cargando ? 'Publicando…' : 'Publicar actividad'}
        </button>
      </form>
    </div>
  )
}