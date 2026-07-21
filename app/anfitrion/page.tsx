'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  LayoutDashboard, CalendarDays, Star, DollarSign, MessageSquare,
} from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'resumen' | 'actividades' | 'reservas' | 'resenas' | 'ingresos'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'actividades', label: 'Mis Experiencias', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
  { key: 'ingresos', label: 'Ingresos', icon: <DollarSign className="h-4 w-4" /> },
]

export default function AnfitrionPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('resumen')
  const [cargando, setCargando] = useState(true)

  // Resumen
  const [totalActividades, setTotalActividades] = useState(0)
  const [totalReservas, setTotalReservas] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)
  const [ingresos, setIngresos] = useState(0)

  // Listas
  const [actividades, setActividades] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [pagosPendientes, setPagosPendientes] = useState<any[]>([])
  const [totalPagado, setTotalPagado] = useState(0)

  const cargarResumen = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=resumen')
    if (!res.ok) return
    const data = await res.json()
    setTotalActividades(data.totalActividades)
    setTotalReservas(data.totalReservas)
    setTotalResenas(data.totalResenas)
    setIngresos(data.ingresos)
  }

  const cargarActividades = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=actividades')
    if (!res.ok) return
    setActividades(await res.json())
  }

  const cargarReservas = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=reservas')
    if (!res.ok) return
    setReservas(await res.json())
  }

  const cargarResenas = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=resenas')
    if (!res.ok) return
    setResenas(await res.json())
  }

  const cargarIngresos = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=ingresos')
    if (!res.ok) return
    const data = await res.json()
    setPagosPendientes(data.pendientes || [])
    setTotalPagado(data.totalPagado || 0)
  }

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login')
      return
    }
    setCargando(true)
    Promise.all([
      cargarResumen(),
      cargarActividades(),
      cargarReservas(),
      cargarResenas(),
      cargarIngresos(),
    ]).finally(() => setCargando(false))
  }, [isSignedIn])

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando panel…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-titulos text-2xl font-bold text-texto">Panel de Anfitrión</h1>
        <p className="mt-1 text-sm text-texto-secundario">
          Bienvenido, {user?.fullName || 'anfitrión'} — administrá tus experiencias
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-primario text-white'
                : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Resumen */}
      {tab === 'resumen' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Experiencias</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalActividades}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Reservas</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalReservas}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Reseñas</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-texto">{totalResenas}</p>
          </div>
          <div className="rounded-xl bg-superficie p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Ingresos estimados</p>
            <p className="mt-2 font-titulos text-3xl font-bold text-primario">{formatPrecio(ingresos)}</p>
          </div>
        </div>
      )}

      {/* Mis actividades */}
      {tab === 'actividades' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-texto-secundario">{actividades.length} experiencia(s)</p>
            <a
              href="/actividades/nueva"
              className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark"
            >
              + Nueva experiencia
            </a>
          </div>
          {actividades.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
              Todavía no publicaste ninguna experiencia. ¡Creá la primera!
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-superficie shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-medium uppercase tracking-wider text-texto-secundario">
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Ubicación</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-texto">
                        <a href={`/actividades/${a.id}`} className="hover:text-primario">
                          {a.titulo}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-texto-secundario">{a.categoria}</td>
                      <td className="px-4 py-3 font-semibold text-primario">{formatPrecio(a.precio)}</td>
                      <td className="px-4 py-3 text-texto-secundario">{a.ubicacion?.departamento}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
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
        </div>
      )}

      {/* Reservas */}
      {tab === 'reservas' && (
        <div>
          <p className="mb-4 text-sm text-texto-secundario">{reservas.length} reserva(s)</p>
          {reservas.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
              Aún no tenés reservas en tus experiencias.
            </p>
          ) : (
            <div className="space-y-3">
              {reservas.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-superficie p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-texto">{r.actividades?.titulo}</p>
                    <p className="mt-0.5 text-xs text-texto-secundario">
                      {new Date(r.fecha).toLocaleDateString('es-AR')} — Código: {r.codigo_confirmacion || '—'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                    r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    r.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reseñas */}
      {tab === 'resenas' && (
        <div>
          <p className="mb-4 text-sm text-texto-secundario">{resenas.length} reseña(s)</p>
          {resenas.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
              Todavía no recibiste reseñas.
            </p>
          ) : (
            <div className="space-y-4">
              {resenas.map((r) => (
                <div key={r.id} className="rounded-xl bg-superficie p-4 shadow-sm">
                  <p className="font-medium text-texto">{r.actividades?.titulo}</p>
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
      {/* Ingresos */}
      {tab === 'ingresos' && (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Pendiente de cobro</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-primario">
                {formatPrecio(pagosPendientes.reduce((s, p) => s + p.monto, 0))}
              </p>
            </div>
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Ya cobrado</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-green-600">
                {formatPrecio(totalPagado)}
              </p>
            </div>
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Comisión (10%)</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-texto-secundario">
                {formatPrecio(pagosPendientes.reduce((s, p) => s + p.comision, 0))}
              </p>
            </div>
          </div>
          {pagosPendientes.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
              No tenés pagos pendientes. Cuando alguien reserve y pague, vas a verlo acá.
            </p>
          ) : (
            <div className="space-y-3">
              {pagosPendientes.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-superficie p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-texto">{formatPrecio(p.monto)}</p>
                    <p className="mt-0.5 text-xs text-texto-secundario">
                      Comisión: {formatPrecio(p.comision)} — {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    Pendiente
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}