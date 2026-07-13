'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

export default function PerfilPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    username: '',
    telefono: '',
    intereses: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session)
      if (data.session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()
        if (perfil) {
          setForm({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            username: perfil.username || '',
            telefono: perfil.telefono || '',
            intereses: perfil.intereses || [],
          })
        }
      }
      setCargando(false)
    })
  }, [])

  const toggleInteres = (cat: string) =>
    setForm((f) => ({
      ...f,
      intereses: f.intereses.includes(cat)
        ? f.intereses.filter((i) => i !== cat)
        : [...f.intereses, cat],
    }))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion) return
    setGuardando(true)

    const { error } = await supabase
      .from('perfiles')
      .upsert({
        id: sesion.user.id,
        ...form,
      })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Perfil actualizado')
      setEditando(false)
    }
    setGuardando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando…</p>

  if (!sesion) {
    return (
      <div className="mt-16 text-center">
        <h1 className="font-titulos text-2xl font-bold text-primario">Perfil</h1>
        <p className="mt-2 text-texto-secundario">Iniciá sesión para ver tu perfil.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-titulos text-3xl font-bold text-primario">Mi perfil</h1>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark"
          >
            Editar perfil
          </button>
        )}
      </div>

      {editando ? (
        <form onSubmit={guardar} className="mt-6 rounded-xl bg-superficie p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-texto">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInteres(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    form.intereses.includes(cat)
                      ? 'bg-primario text-white'
                      : 'bg-gray-100 text-texto hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-texto transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-xl bg-superficie p-6 shadow-sm">
          <div className="space-y-3">
            <p><span className="font-medium text-texto-secundario">Nombre:</span> {form.nombre} {form.apellido}</p>
            <p><span className="font-medium text-texto-secundario">Username:</span> {form.username || '—'}</p>
            <p><span className="font-medium text-texto-secundario">Email:</span> {sesion.user.email}</p>
            <p><span className="font-medium text-texto-secundario">Teléfono:</span> {form.telefono || '—'}</p>
            <p><span className="font-medium text-texto-secundario">Intereses:</span>{' '}
              {form.intereses?.length > 0 ? form.intereses.join(', ') : '—'}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={cerrarSesion}
        className="mt-6 w-full rounded-lg bg-error px-4 py-2.5 font-semibold text-white transition hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </div>
  )
}