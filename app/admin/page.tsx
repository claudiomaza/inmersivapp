'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Ticket, Star, ChevronRight, Shield } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'resumen' | 'actividades' | 'usuarios' | 'reservas' | 'resenas'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'actividades', label: 'Actividades', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <Ticket className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
]

export default function AdminPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('resumen')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Resumen
  const [totalActividades, setTotalActividades] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalReservas, setTotalReservas] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)

  // Listas
  const [actividades, setActividades] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  useEffect(() => {
    if (!isSignedIn) return

    const cargar = async () => {
      setCargando(true)
      setError('')

      const res = await fetch(`/api/admin/datos?tipo=${tab}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al cargar datos')
        setCargando(false)
        return
      }

      const data = await res.json()

      if (tab === 'resumen') {
        setTotalActividades(data.totalActividades)
        setTotalUsuarios(data.totalUsuarios)
        setTotalReservas(data.totalReservas)
        setTotalResenas(data.totalResenas)
      } else if (tab === 'actividades') setActividades(data)
      else if (tab === 'usuarios') setUsuarios(data)
      else if (tab === 'reservas') setReservas(data)
      else if (tab === 'resenas') setResenas(data)

      setCargando(false)
    }

    cargar()
  }, [isSignedIn, tab])

  if (!isSignedIn) return null

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primario" />
        <div>
          <h1 className="font-titulos text-2xl font-bold text-texto">Panel de Administración</h1>
          <p className="text-sm text-texto-secundario">Gestión general de la plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-superficie p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-primario text-white'
                : 'text-texto-secundario hover:bg-primario/5 hover:text-texto'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Resumen */}
      {tab === 'resumen' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Actividades</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalActividades}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Usuarios</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalUsuarios}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Reservas</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalReservas}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Reseñas</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalResenas}</p>
          </div>
        </div>
      )}

      {/* Actividades */}
      {tab === 'actividades' && (
        <div className="space-y-3">
          {actividades.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">No hay actividades</p>
          ) : (
            actividades.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl bg-superficie p-4 shadow-sm">
                {a.imagen_url && (
                  <img src={a.imagen_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-texto truncate">{a.titulo}</p>
                  <p className="text-xs text-texto-secundario">
                    {(a.perfiles as any)?.nombre || 'Sin anfitrión'} · {formatPrecio(a.precio)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
                  {a.categoria}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Usuarios */}
      {tab === 'usuarios' && (
        <div className="space-y-3">
          {usuarios.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">No hay usuarios</p>
          ) : (
            usuarios.map((u) => (
              <div key={u.id} className="flex items-center gap-4 rounded-xl bg-superficie p-4 shadow-sm">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primario/10 text-lg font-bold text-primario">
                    {(u.nombre || '?')[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-texto truncate">{u.nombre} {u.apellido || ''}</p>
                  <p className="text-xs text-texto-secundario truncate">{u.email || 'Sin email'}</p>
                </div>
                <div className="flex gap-1">
                  {(u.roles || [u.rol]).map((r: string) => (
                    <span key={r} className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reservas */}
      {tab === 'reservas' && (
        <div className="space-y-3">
          {reservas.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">No hay reservas</p>
          ) : (
            reservas.map((r) => (
              <div key={r.id} className="flex items-center gap-4 rounded-xl bg-superficie p-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-texto">
                    {(r.actividades as any)?.titulo || 'Actividad'}
                  </p>
                  <p className="text-xs text-texto-secundario">
                    Usuario: {r.usuario_id?.slice(0, 12)}... · {r.cantidad} cupo{r.cantidad > 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                  r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  r.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {r.estado}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reseñas */}
      {tab === 'resenas' && (
        <div className="space-y-3">
          {resenas.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">No hay reseñas</p>
          ) : (
            resenas.map((r) => (
              <div key={r.id} className="rounded-xl bg-superficie p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}</span>
                  <span className="text-xs text-texto-secundario">
                    {(r.actividades as any)?.titulo || 'Actividad'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-texto-secundario">{r.comentario}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}