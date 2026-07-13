'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('resumen')
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [esAdmin, setEsAdmin] = useState(false)

  // Datos
  const [totalActividades, setTotalActividades] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalReservas, setTotalReservas] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)
  const [actividades, setActividades] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setAutenticado(true)

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('roles')
      .eq('id', session.user.id)
      .single()

    if (!perfil?.roles?.includes('anfitrion')) {
      toast.error('No tenés permisos de administración')
      router.push('/')
      return
    }
    setEsAdmin(true)

    // Cargar datos
    const [
      { count: cAct }, { count: cUsr }, { count: cRes }, { count: cResenas },
      { data: acts }, { data: usrs }, { data: resvs }, { data: resns },
    ] = await Promise.all([
      supabase.from('actividades').select('*', { count: 'exact', head: true }),
      supabase.from('perfiles').select('*', { count: 'exact', head: true }),
      supabase.from('reservas').select('*', { count: 'exact', head: true }),
      supabase.from('resenas').select('*', { count: 'exact', head: true }),
      supabase.from('actividades').select('*').order('created_at', { ascending: false }),
      supabase.from('perfiles').select('*').order('username'),
      supabase.from('reservas').select('*, actividades(titulo)').order('created_at', { ascending: false }).limit(20),
      supabase.from('resenas').select('*, actividades(titulo)').order('created_at', { ascending: false }),
    ])

    setTotalActividades(cAct || 0)
    setTotalUsuarios(cUsr || 0)
    setTotalReservas(cRes || 0)
    setTotalResenas(cResenas || 0)
    setActividades(acts || [])
    setUsuarios(usrs || [])
    setReservas(resvs || [])
    setResenas(resns || [])
    setCargando(false)
  }

  const toggleActividad = async (id: string, activa: boolean) => {
    await supabase.from('actividades').update({ activa }).eq('id', id)
    setActividades((prev) => prev.map((a) => a.id === id ? { ...a, activa } : a))
    toast.success(activa ? 'Actividad publicada' : 'Actividad desactivada')
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando panel…</p>
  if (!autenticado || !esAdmin) return null

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-titulos text-3xl font-bold text-primario">Panel Admin</h1>
        <button
          onClick={() => { supabase.auth.signOut(); router.push('/') }}
          className="flex items-center gap-1.5 text-sm text-error hover:underline"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-primario text-white'
                : 'text-texto-secundario hover:bg-gray-100'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="mt-6">
        {tab === 'resumen' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Actividades', valor: totalActividades, color: 'bg-primario' },
              { label: 'Usuarios', valor: totalUsuarios, color: 'bg-secundario' },
              { label: 'Reservas', valor: totalReservas, color: 'bg-accento' },
              { label: 'Reseñas', valor: totalResenas, color: 'bg-accento-light' },
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
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.titulo}</td>
                    <td className="px-4 py-3 text-texto-secundario">{a.categoria}</td>
                    <td className="px-4 py-3">{formatPrecio(a.precio)}</td>
                    <td className="px-4 py-3 text-texto-secundario">{a.anfitrion_nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {a.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActividad(a.id, !a.activa)}
                        className={`text-xs font-medium ${a.activa ? 'text-error hover:underline' : 'text-exito hover:underline'}`}
                      >
                        {a.activa ? 'Desactivar' : 'Activar'}
                      </button>
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
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Intereses</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3">{u.nombre} {u.apellido}</td>
                    <td className="px-4 py-3 text-texto-secundario">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles || []).map((r: string) => (
                          <span key={r} className="rounded-full bg-primario/10 px-2 py-0.5 text-xs text-primario">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-texto-secundario">
                      {(u.intereses || []).slice(0, 3).join(', ')}
                      {(u.intereses?.length || 0) > 3 ? '…' : ''}
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
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Actividad</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.codigo_confirmacion || '—'}</td>
                    <td className="px-4 py-3">{r.actividades?.titulo || '—'}</td>
                    <td className="px-4 py-3 text-texto-secundario">
                      {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                        r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.estado}
                      </span>
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