'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft, UserPlus, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
  const [roles, setRoles] = useState<string[]>([])
  const [activando, setActivando] = useState(false)
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

    fetch('/api/perfiles')
      .then((r) => r.json())
      .then(({ perfil }) => {
        if (perfil) {
          setForm({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            username: perfil.username || '',
            telefono: perfil.telefono || '',
            intereses: perfil.intereses || [],
          })
          setRoles(perfil.roles || [])
        }
        setCargando(false)
      })
      .catch(() => setCargando(false))
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

    const res = await fetch('/api/perfiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        username: form.username,
        telefono: form.telefono,
        intereses: form.intereses,
      }),
    })

    setGuardando(false)
    if (!res.ok) {
      const { error } = await res.json()
      toast.error('Error al guardar: ' + error)
      return
    }
    toast.success('Perfil actualizado ✅')
    setEditando(false)
  }

  const activarAnfitrion = async () => {
    if (!user) return
    setActivando(true)
    const nuevosRoles = [...roles, 'anfitrion']

    const res = await fetch('/api/perfiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: nuevosRoles }),
    })

    setActivando(false)
    if (!res.ok) {
      const { error } = await res.json()
      toast.error('Error al activar: ' + error)
      return
    }
    setRoles(nuevosRoles)
    toast.success('¡Ya sos anfitrión! 🎉')
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
              />
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
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-texto">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInteres(cat)}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    form.intereses.includes(cat)
                      ? 'bg-primario text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Nombre</p>
                <p className="mt-1 font-medium text-texto">{form.nombre || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Apellido</p>
                <p className="mt-1 font-medium text-texto">{form.apellido || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Username</p>
                <p className="mt-1 font-medium text-texto">{form.username || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Teléfono</p>
                <p className="mt-1 font-medium text-texto">{form.telefono || '—'}</p>
              </div>
            </div>
            {form.intereses.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Intereses</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {form.intereses.map((i) => (
                    <span key={i} className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">{i}</span>
                  ))}
                </div>
              </div>
            )}
            {roles.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-texto-secundario">Roles</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <span key={r} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {r === 'anfitrion' ? 'Anfitrión' : r === 'participante' ? 'Participante' : r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {!roles.includes('anfitrion') && (
            <div className="mt-6 rounded-xl border border-dashed border-primario/30 bg-primario/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primario/10">
                  <UserPlus className="h-5 w-5 text-primario" />
                </div>
                <div className="flex-1">
                  <h3 className="font-titulos font-semibold text-texto">¿Querés crear experiencias?</h3>
                  <p className="mt-1 text-sm text-texto-secundario">
                    Activá el rol de anfitrión para publicar tus propias actividades y recibir reservas.
                  </p>
                  <button
                    onClick={activarAnfitrion}
                    disabled={activando}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
                  >
                    <Shield className="h-4 w-4" />
                    {activando ? 'Activando…' : 'Activar modo anfitrión'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}