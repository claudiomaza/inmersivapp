'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
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

    const fechasArray = form.fechas
      ? form.fechas.split(',').map((f) => f.trim()).filter(Boolean)
      : []

    const res = await fetch('/api/actividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo,
        descripcion: form.descripcion || 'Sin descripción',
        categoria: form.categoria,
        fecha: fechasArray.length > 0 ? fechasArray[0] : null,
        hora: form.horaInicio || null,
        lugar: [form.direccion, form.departamento, form.provincia].filter(Boolean).join(', ') || 'A confirmar',
        precio: Number(form.precio),
        capacidad_max: 20,
        imagen_url: form.foto || null,
      }),
    })

    setCargando(false)

    if (!res.ok) {
      toast.error('Error al crear la actividad')
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Fechas</label>
            <input
              type="text"
              value={form.fechas}
              onChange={(e) => setForm({ ...form, fechas: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="2026-08-01, 2026-08-08"
            />
          </div>
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