'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  LayoutDashboard, Users, CalendarDays, Star, LogOut,
} from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'resumen' | 'actividades' | 'usuarios' | 'reservas' | 'resenas'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'actividades', label: 'Actividades', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
]

export default function AdminPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('resumen')
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  // Datos
  const [totalActividades, setTotalActividades] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalReservas, setTotalReservas] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)
  const [actividades, setActividades] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  const fetchDatos = async (tipo: string) => {
    const res = await fetch(`/api/admin/datos?tipo=${tipo}`)
    if (!res.ok) {
      if (res.status === 403) {
        setEsAdmin(false)
        toast.error('No tenés permisos de administración')
      }
      return null
    }
    const data = await res.json()
    setEsAdmin(true)
    return data
  }

  const cargarResumen = async () => {
    const data = await fetchDatos('resumen')
    if (!data) return
    setTotalActividades(data.totalActividades)
    setTotalUsuarios(data.totalUsuarios)
    setTotalReservas(data.totalReservas)
    setTotalResenas(data.totalResenas)
    setCargando(false)
  }

  const cargarActividades = async () => {
    const data = await fetchDatos('actividades')
    if (data) setActividades(data)
  }

  const cargarUsuarios = async () => {
    const data = await fetchDatos('usuarios')
    if (data) setUsuarios(data)
  }

  const cargarReservas = async () => {
    const data = await fetchDatos('reservas')
    if (data) setReservas(data)
  }

  const cargarResenas = async () => {
    const data = await fetchDatos('resenas')
    if (data) setResenas(data)
  }

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login')
      return
    }
    cargarResumen()
  }, [isSignedIn])

  useEffect(() => {
    if (tab === 'actividades') cargarActividades()
    if (tab === 'usuarios') cargarUsuarios()
    if (tab === 'reservas') cargarReservas()
    if (tab === 'resenas') cargarResenas()
  }, [tab])

  if (!isSignedIn) return null

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Verificando permisos…</p>
      </div>
    )
  }

  if (esAdmin === false) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Acceso restringido</h1>
        <p className="text-texto-secundario">No tenés permisos de administración.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-titulos text-2xl font-bold text-texto">Panel de administración</h1>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? 'bg-white text-texto shadow-sm' : 'text-texto-secundario hover:text-texto'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'resumen' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Actividades', valor: totalActividades, color: 'bg-primario' },
              { label: 'Usuarios', valor: totalUsuarios, color: 'bg-verde' },
              { label: 'Reservas', valor: totalReservas, color: 'bg-amarillo' },
              { label: 'Reseñas', valor: totalResenas, color: 'bg-rosa' },
            ].map((card) => (
              <div key={card.label} className="rounded-xl bg-superficie p-6 shadow-sm">
                <p className="text-sm text-texto-secundario">{card.label}</p>
                <p className={`mt-2 font-titulos text-3xl font-bold ${card.color} bg-clip-text text-transparent`}>
                  {card.valor}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'actividades' && (
          <div className="overflow-x-auto rounded-xl bg-superficie shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Anfitrión</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.titulo}</td>
                    <td className="px-4 py-3">{a.categoria}</td>
                    <td className="px-4 py-3">{formatPrecio(a.precio)}</td>
                    <td className="px-4 py-3">{a.anfitrion_nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {a.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="overflow-x-auto rounded-xl bg-superficie shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.nombre} {u.apellido}</td>
                    <td className="px-4 py-3 text-texto-secundario">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-texto-secundario">{u.username || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.roles?.map((r: string) => (
                          <span key={r} className="rounded-full bg-primario/10 px-2 py-0.5 text-xs font-medium text-primario">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-texto-secundario">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reservas' && (
          <div className="overflow-x-auto rounded-xl bg-superficie shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Actividad</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.actividades?.titulo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-texto-secundario">
                      {new Date(r.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                        r.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                        r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-texto-secundario">
                      {r.codigo_confirmacion || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'resenas' && (
          <div className="rounded-xl bg-superficie p-6 shadow-sm">
            {resenas.length === 0 ? (
              <p className="text-texto-secundario">No hay reseñas todavía.</p>
            ) : (
              <div className="space-y-4">
                {resenas.map((r) => (
                  <div key={r.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">{r.actividades?.titulo || '—'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-yellow-500">
                        {'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}
                      </span>
                      <span className="text-xs text-texto-secundario">
                        {new Date(r.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-texto-secundario">{r.comentario}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}