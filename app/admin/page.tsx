'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LayoutDashboard, CalendarDays, Users, Ticket, Star, ChevronRight, Shield, DollarSign, TrendingUp, PiggyBank, CheckCircle, MessageSquare, Send, MessageCircle } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'mensajes' | 'reservas' | 'resenas' | 'actividades' | 'usuarios' | 'liquidaciones' | 'resumen'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'mensajes', label: 'Mensajes', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <Ticket className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
  { key: 'actividades', label: 'Actividades', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'usuarios', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  { key: 'liquidaciones', label: 'Liquidaciones', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="h-4 w-4" /> },
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

  // Recaudación
  const [totalBruto, setTotalBruto] = useState(0)
  const [comisionTotal, setComisionTotal] = useState(0)
  const [totalAnfitriones, setTotalAnfitriones] = useState(0)
  const [comisionPorcentaje, setComisionPorcentaje] = useState(0.1)
  const [pagosPendientes, setPagosPendientes] = useState(0)
  const [comisionesPendientes, setComisionesPendientes] = useState(0)
  const [cantidadReservasPagadas, setCantidadReservasPagadas] = useState(0)

  // Listas
  const [actividades, setActividades] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  // Liquidaciones
  const [liquidacionesPendientes, setLiquidacionesPendientes] = useState<any[]>([])
  const [liquidacionesHistorial, setLiquidacionesHistorial] = useState<any[]>([])
  const [liquidando, setLiquidando] = useState(false)

  // Mensajes (reclamos/consultas de usuarios)
  const [mensajesAdmin, setMensajesAdmin] = useState<any[]>([])
  const [chatAdminAbierto, setChatAdminAbierto] = useState<string | null>(null)
  const [chatAdminMensajes, setChatAdminMensajes] = useState<any[]>([])
  const [textoAdminEnvio, setTextoAdminEnvio] = useState('')
  const [enviandoAdmin, setEnviandoAdmin] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return

    const cargar = async () => {
      setCargando(true)
      setError('')

      const url = tab === 'liquidaciones'
        ? '/api/admin/liquidar'
        : tab === 'mensajes'
        ? '/api/mensajes/conversaciones'
        : `/api/admin/datos?tipo=${tab}`

      const res = await fetch(url)
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
        setTotalBruto(data.totalBruto || 0)
        setComisionTotal(data.comisionTotal || 0)
        setTotalAnfitriones(data.totalAnfitriones || 0)
        setComisionPorcentaje(data.comisionPorcentaje || 0.1)
        setPagosPendientes(data.pagosPendientes || 0)
        setComisionesPendientes(data.comisionesPendientes || 0)
        setCantidadReservasPagadas(data.cantidadReservasPagadas || 0)
      } else if (tab === 'actividades') setActividades(data)
      else if (tab === 'usuarios') setUsuarios(data)
      else if (tab === 'reservas') setReservas(data)
      else if (tab === 'resenas') setResenas(data)
      else if (tab === 'liquidaciones') {
        setLiquidacionesPendientes(data.pendientes || [])
        setLiquidacionesHistorial(data.historial || [])
      } else if (tab === 'mensajes') {
        setMensajesAdmin(data.conversaciones || [])
      }

      setCargando(false)
    }

    cargar()
  }, [isSignedIn, tab])

  if (!isSignedIn) return null

  const liquidarAnfitrion = async (anfitrionId: string, pagoIds: string[]) => {
    setLiquidando(true)
    const res = await fetch('/api/admin/liquidar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anfitrion_id: anfitrionId, pago_ids: pagoIds }),
    })
    setLiquidando(false)
    if (!res.ok) {
      toast.error('Error al liquidar')
      return
    }
    toast.success('Liquidación registrada ✅')
    // Recargar datos
    const cargar = async () => {
      const url = tab === 'liquidaciones'
        ? '/api/admin/liquidar'
        : tab === 'mensajes'
        ? '/api/mensajes/conversaciones'
        : `/api/admin/datos?tipo=${tab}`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setLiquidacionesPendientes(data.pendientes || [])
      setLiquidacionesHistorial(data.historial || [])
    }
    cargar()
  }

  const abrirChatAdmin = async (usuarioId: string) => {
    setChatAdminAbierto(usuarioId)
    const res = await fetch(`/api/mensajes/conversaciones/${usuarioId}`)
    if (!res.ok) return
    const data = await res.json()
    setChatAdminMensajes(data.mensajes || [])
  }

  const enviarMensajeAdmin = async () => {
    if (!textoAdminEnvio.trim() || !chatAdminAbierto || !user) return
    setEnviandoAdmin(true)
    const res = await fetch('/api/mensajes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receptor_id: chatAdminAbierto, contenido: textoAdminEnvio.trim() }),
    })
    setEnviandoAdmin(false)
    if (!res.ok) { toast.error('Error al enviar'); return }
    setTextoAdminEnvio('')
    setChatAdminMensajes(prev => [...prev, {
      id: 'temp-' + Date.now(),
      emisor_id: user.id,
      contenido: textoAdminEnvio.trim(),
      leido: false,
      created_at: new Date().toISOString(),
    }])
    const r = await fetch('/api/mensajes/conversaciones')
    if (r.ok) setMensajesAdmin((await r.json()).conversaciones || [])
  }

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
        <>
          {/* Métricas generales */}
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

          {/* Recaudación */}
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 font-titulos text-lg font-semibold text-texto">
              <DollarSign className="h-5 w-5 text-primario" />
              Recaudación
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="text-xs font-medium uppercase tracking-wider text-green-700">Total Bruto</p>
                </div>
                <p className="mt-2 font-titulos text-2xl font-bold text-green-800">{formatPrecio(totalBruto)}</p>
                <p className="mt-1 text-xs text-green-600">{cantidadReservasPagadas} reservas pagadas</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-700">Comisión Plataforma ({Math.round(comisionPorcentaje * 100)}%)</p>
                </div>
                <p className="mt-2 font-titulos text-2xl font-bold text-blue-800">{formatPrecio(comisionTotal)}</p>
                <p className="mt-1 text-xs text-blue-600">{formatPrecio(comisionesPendientes)} pendientes de cobro</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <p className="text-xs font-medium uppercase tracking-wider text-purple-700">Para Anfitriones</p>
                </div>
                <p className="mt-2 font-titulos text-2xl font-bold text-purple-800">{formatPrecio(totalAnfitriones)}</p>
                <p className="mt-1 text-xs text-purple-600">{formatPrecio(pagosPendientes)} pendientes de pago</p>
              </div>
            </div>
          </div>
        </>
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
                <div className="flex gap-1 items-center">
                  {(u.roles || [u.rol]).map((r: string) => (
                    <span key={r} className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium text-primario">
                      {r}
                    </span>
                  ))}
                  <button
                    onClick={() => abrirChatAdmin(u.id)}
                    className="ml-2 rounded-full bg-primario/10 p-2 text-primario transition hover:bg-primario/20"
                    title="Contactar"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
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
                    {(r.actividades as any)?.precio && ` · ${formatPrecio((r.actividades as any).precio)}`}
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

      {/* Liquidaciones */}
      {tab === 'liquidaciones' && (
        <div>
          <h2 className="mb-4 font-titulos text-xl font-bold text-texto">Pagos pendientes a anfitriones</h2>
          {liquidacionesPendientes.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
              No hay pagos pendientes a anfitriones.
            </p>
          ) : (
            <div className="space-y-4">
              {liquidacionesPendientes.map((g: any) => (
                <div key={g.anfitrion_id} className="rounded-xl bg-superficie p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-texto">{g.anfitrion_nombre} {g.anfitrion_apellido}</p>
                      <p className="text-xs text-texto-secundario">{g.anfitrion_email}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="text-texto-secundario">CUIL: <strong className="text-texto">{g.anfitrion_cuil}</strong></span>
                        <span className="text-texto-secundario">Alias MP: <strong className="text-primario">{g.anfitrion_alias}</strong></span>
                      </div>
                      <p className="mt-2 font-titulos text-2xl font-bold text-primario">{formatPrecio(g.total)}</p>
                      <p className="text-xs text-texto-secundario">
                        Comisión plataforma: {formatPrecio(g.comision)} · {g.pagos.length} pago(s)
                      </p>
                    </div>
                    <button
                      onClick={() => liquidarAnfitrion(g.anfitrion_id, g.pagos.map((p: any) => p.id))}
                      disabled={liquidando}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {liquidando ? 'Liquidando…' : 'Marcar como pagado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {liquidacionesHistorial.length > 0 && (
            <>
              <h2 className="mb-4 mt-8 font-titulos text-xl font-bold text-texto">Historial de liquidaciones</h2>
              <div className="space-y-2">
                {liquidacionesHistorial.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-superficie p-4 shadow-sm">
                    <div>
                      <p className="font-medium text-texto">{formatPrecio(p.monto)}</p>
                      <p className="text-xs text-texto-secundario">
                        {p.perfiles?.nombre} {p.perfiles?.apellido} · {p.pagado_en ? new Date(p.pagado_en).toLocaleDateString('es-AR') : '—'}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Pagado</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Mensajes — reclamos/consultas */}
      {tab === 'mensajes' && (
        <div>
          {chatAdminAbierto ? (
            <div>
              <button
                onClick={() => setChatAdminAbierto(null)}
                className="mb-4 flex items-center gap-2 text-sm text-primario hover:underline"
              >
                ← Volver a conversaciones
              </button>
              <div className="rounded-xl bg-superficie p-4 shadow-sm">
                <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                  {chatAdminMensajes.length === 0 ? (
                    <p className="text-center text-sm text-texto-secundario">Sin mensajes</p>
                  ) : (
                    chatAdminMensajes.map((m: any) => (
                      <div
                        key={m.id}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          m.emisor_id === user?.id
                            ? 'ml-8 bg-primario text-white'
                            : 'mr-8 bg-gray-100 text-texto'
                        }`}
                      >
                        <p>{m.contenido}</p>
                        <p className="mt-1 text-right text-[10px] opacity-70">
                          {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 border-t pt-3">
                  <input
                    type="text"
                    value={textoAdminEnvio}
                    onChange={(e) => setTextoAdminEnvio(e.target.value)}
                    placeholder="Escribí tu respuesta…"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                    onKeyDown={(e) => e.key === 'Enter' && enviarMensajeAdmin()}
                  />
                  <button
                    onClick={enviarMensajeAdmin}
                    disabled={enviandoAdmin || !textoAdminEnvio.trim()}
                    className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-texto-secundario">
                {mensajesAdmin.length} conversación(es) — usuarios que te escribieron
              </p>
              {mensajesAdmin.length === 0 ? (
                <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">
                  No hay mensajes de usuarios todavía.
                </p>
              ) : (
                <div className="space-y-2">
                  {mensajesAdmin.map((conv: any) => (
                    <button
                      key={conv.otroUsuarioId}
                      onClick={() => abrirChatAdmin(conv.otroUsuarioId)}
                      className="flex w-full items-center gap-3 rounded-xl bg-superficie p-4 text-left shadow-sm transition hover:bg-primario/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primario/10 text-sm font-bold text-primario">
                        {conv.otroNombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-texto truncate">
                          {conv.otroNombre} {conv.otroApellido}
                          {conv.noLeidos > 0 && (
                            <span className="ml-2 rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white">
                              {conv.noLeidos}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-texto-secundario">{conv.ultimoMensaje}</p>
                      </div>
                      <p className="shrink-0 text-xs text-texto-secundario">
                        {new Date(conv.ultimaFecha).toLocaleDateString('es-AR')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}