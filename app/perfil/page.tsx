'use client'

import { useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft, UserPlus, Shield, AlertCircle, Trash2, UserMinus } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

export const dynamic = 'force-dynamic'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

export default function PerfilPage() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const { t, locale } = useLang()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [roles, setRoles] = useState<string[]>([])
  const [activando, setActivando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    username: '',
    telefono: '',
    cuil: '',
    alias_mp: '',
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
            cuil: perfil.cuil || '',
            alias_mp: perfil.alias_mp || '',
            intereses: perfil.intereses || [],
          })
          setRoles(perfil.roles || [])
        }
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [isSignedIn, user])

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await fetch('/api/perfiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Perfil guardado')
      setEditando(false)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const activarAnfitrion = async () => {
    setActivando(true)
    try {
      const res = await fetch('/api/perfiles/rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: 'anfitrion' }),
      })
      if (!res.ok) throw new Error()
      setRoles([...roles, 'anfitrion'])
      toast.success('¡Ahora sos anfitrión!')
    } catch {
      toast.error('Error al activar rol')
    } finally {
      setActivando(false)
    }
  }

  const desactivarAnfitrion = async () => {
    setDesactivando(true)
    try {
      const res = await fetch('/api/perfiles/rol', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: 'anfitrion' }),
      })
      if (!res.ok) throw new Error()
      setRoles(roles.filter(r => r !== 'anfitrion'))
      toast.success('Rol de anfitrión desactivado')
    } catch {
      toast.error('Error al desactivar rol')
    } finally {
      setDesactivando(false)
    }
  }

  const eliminarPerfil = async () => {
    setEliminando(true)
    try {
      const res = await fetch('/api/perfiles/cuenta', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Perfil eliminado')
      await signOut()
      router.push('/')
    } catch {
      toast.error('Error al eliminar perfil')
      setConfirmandoEliminar(false)
    } finally {
      setEliminando(false)
    }
  }

  const toggleInteres = (cat: string) => {
    setForm(prev => ({
      ...prev,
      intereses: prev.intereses.includes(cat)
        ? prev.intereses.filter(i => i !== cat)
        : [...prev.intereses, cat],
    }))
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-texto-secundario" />
        <h1 className="font-titulos text-2xl font-bold text-texto">{t('panel.iniciar_sesion_h1')}</h1>
        <p className="text-texto-secundario">{t('panel.iniciar_sesion_p')}</p>
        <button
          onClick={() => router.push('/login')}
          className="rounded-lg bg-primario px-6 py-2 font-semibold text-white hover:bg-primario-dark"
        >
          {t('panel.ingresar')}
        </button>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-texto-secundario">{t('panel.cargando')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-sm text-texto-secundario transition hover:text-texto"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="mb-6">
        <h1 className="font-titulos text-2xl font-bold text-texto">Mi Perfil</h1>
        <p className="mt-1 text-sm text-texto-secundario">
          {user?.emailAddresses?.[0]?.emailAddress}
        </p>
      </div>

      <div className="space-y-6">
        {/* Datos personales */}
        <section className="rounded-xl border border-gray-200 bg-superficie p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-titulos text-lg font-semibold text-texto">Datos personales</h2>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-sm font-medium text-primario hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-texto">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-texto">Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">CUIL</label>
                <input
                  type="text"
                  value={form.cuil}
                  onChange={(e) => setForm({ ...form, cuil: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">Alias MP</label>
                <input
                  type="text"
                  value={form.alias_mp}
                  onChange={(e) => setForm({ ...form, alias_mp: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-texto">Intereses</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleInteres(cat)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
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

              <div className="flex gap-3 pt-2">
                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditando(false); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-texto-secundario">Nombre</p>
                  <p className="text-sm font-medium text-texto">{form.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-texto-secundario">Apellido</p>
                  <p className="text-sm font-medium text-texto">{form.apellido || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Username</p>
                <p className="text-sm font-medium text-texto">@{form.username || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Teléfono</p>
                <p className="text-sm font-medium text-texto">{form.telefono || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">CUIL</p>
                <p className="text-sm font-medium text-texto">{form.cuil || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Alias MP</p>
                <p className="text-sm font-medium text-texto">{form.alias_mp || '—'}</p>
              </div>
              {form.intereses.length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-texto-secundario">Intereses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.intereses.map((i) => (
                      <span key={i} className="rounded-full bg-primario/10 px-2.5 py-0.5 text-xs font-medium text-primario">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Roles */}
        <section className="rounded-xl border border-gray-200 bg-superficie p-6">
          <h2 className="mb-4 font-titulos text-lg font-semibold text-texto">Roles</h2>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <span
                key={r}
                className="rounded-full bg-primario/10 px-3 py-1 text-sm font-medium text-primario"
              >
                {r === 'anfitrion' ? 'Anfitrión' : r === 'admin' ? 'Admin' : r === 'participante' ? 'Participante' : r}
              </span>
            ))}
          </div>
        </section>

        {/* Activar / Desactivar anfitrión */}
        {!roles.includes('anfitrion') ? (
          <section className="rounded-xl border border-dashed border-primario/30 bg-primario/5 p-6">
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
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-error/30 bg-error/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10">
                <UserMinus className="h-5 w-5 text-error" />
              </div>
              <div className="flex-1">
                <h3 className="font-titulos font-semibold text-texto">Anfitrión activo</h3>
                <p className="mt-1 text-sm text-texto-secundario">
                  Tenés el rol de anfitrión. Podés desactivarlo si no querés seguir publicando experiencias.
                </p>
                <button
                  onClick={desactivarAnfitrion}
                  disabled={desactivando}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-error px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/10 disabled:opacity-50"
                >
                  <UserMinus className="h-4 w-4" />
                  {desactivando ? 'Desactivando…' : 'Desactivar rol anfitrión'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Eliminar perfil */}
        <section className="rounded-xl border border-error/20 bg-error/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10">
              <Trash2 className="h-5 w-5 text-error" />
            </div>
            <div className="flex-1">
              <h3 className="font-titulos font-semibold text-texto">Eliminar cuenta</h3>
              <p className="mt-1 text-sm text-texto-secundario">
                Esta acción eliminará tu perfil y todos tus datos. No se puede deshacer.
              </p>
              {confirmandoEliminar ? (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={eliminarPerfil}
                    disabled={eliminando}
                    className="flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition hover:bg-error-dark disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {eliminando ? 'Eliminando…' : 'Confirmar eliminación'}
                  </button>
                  <button
                    onClick={() => setConfirmandoEliminar(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-texto-secundario transition hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmandoEliminar(true)}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-error px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar mi cuenta
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
