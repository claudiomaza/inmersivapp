'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

export default function PerfilPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
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
    if (!isSignedIn) return
    if (!user) return

    supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data: perfil }) => {
        if (perfil) {
          setForm({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            username: perfil.username || '',
            telefono: perfil.telefono || '',
            intereses: perfil.intereses || [],
          })
        }
        setCargando(false)
      })
  }, [isSignedIn, user])

  const toggleInteres = (cat: string) =>
    setForm((f) => ({
      ...f,
      intereses: f.intereses.includes(cat)
        ? f.intereses.filter((i) => i !== cat)
        : [...f.intereses, cat],
    }))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setGuardando(true)

    const { error } = await supabase
      .from('perfiles')
      .upsert({
        id: user.id,
        nombre: form.nombre,
        apellido: form.apellido,
        username: form.username,
        telefono: form.telefono,
        intereses: form.intereses,
        email: user.primaryEmailAddress?.emailAddress || '',
      })
      .eq('id', user.id)

    setGuardando(false)
    if (error) {
      toast.error('Error al guardar: ' + error.message)
      return
    }
    toast.success('Perfil actualizado ✅')
    setEditando(false)
  }

  if (!isSignedIn) {
    router.push('/login')
    return null
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="font-titulos text-2xl font-bold text-texto">
              {form.nombre || user?.fullName || 'Mi perfil'}
            </h1>
            <p className="text-sm text-texto-secundario">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <form onSubmit={guardar} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Apellido</label>
              <input
                type="text"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInteres(cat)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    form.intereses.includes(cat)
                      ? 'bg-primario text-white'
                      : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium transition hover:bg-gray-50"
            >
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
            <p><span className="font-medium text-texto-secundario">Email:</span> {user?.primaryEmailAddress?.emailAddress}</p>
            <p><span className="font-medium text-texto-secundario">Teléfono:</span> {form.telefono || '—'}</p>
            <p><span className="font-medium text-texto-secundario">Intereses:</span>{' '}
              {form.intereses?.length > 0 ? form.intereses.join(', ') : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}