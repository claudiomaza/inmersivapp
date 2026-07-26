'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  LayoutDashboard, CalendarDays, Star, DollarSign, MessageSquare, Send, HelpCircle, Tag, Pencil,
} from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'mensajes' | 'reservas' | 'resenas' | 'actividades' | 'ingresos' | 'resumen' | 'cupones'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'mensajes', label: 'Mensajes', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
  { key: 'actividades', label: 'Mis Experiencias', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'cupones', label: 'Cupones', icon: <Tag className="h-4 w-4" /> },
  { key: 'ingresos', label: 'Ingresos', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="h-4 w-4" /> },
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
  const [filtroFecha, setFiltroFecha] = useState('')
  const [reservas, setReservas] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [pagosPendientes, setPagosPendientes] = useState<any[]>([])
  const [totalPagado, setTotalPagado] = useState(0)
  const [mensajesConv, setMensajesConv] = useState<any[]>([])
  const [participantes, setParticipantes] = useState<any[]>([])
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [chatMensajes, setChatMensajes] = useState<any[]>([])
  const [textoEnvio, setTextoEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Cupones
  const [comercio, setComercio] = useState<any>(null)
  const [cupones, setCupones] = useState<any[]>([])
  const [creandoCupon, setCreandoCupon] = useState(false)
  const [formCupon, setFormCupon] = useState({
    codigo: '',
    descuento_tipo: 'porcentaje' as 'porcentaje' | 'fijo',
    descuento_valor: '',
    condiciones: '',
    usos_maximos: '100',
  })
  const [creando, setCreando] = useState(false)

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

  const cargarMensajes = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=mensajes')
    if (!res.ok) return
    const data = await res.json()
    setMensajesConv(data.mensajes || [])
    setParticipantes(data.participantes || [])
  }

  const cargarCupones = async () => {
    const res = await fetch('/api/anfitrion/datos?tipo=cupones')
    if (!res.ok) return
    const data = await res.json()
    setComercio(data.comercio)
    setCupones(data.cupones || [])
  }

  const crearCupon = async () => {
    if (!formCupon.codigo.trim() || !formCupon.descuento_valor || !comercio) {
      toast.error('Completá el código y el valor del descuento')
      return
    }
    setCreando(true)
    const res = await fetch('/api/cupones/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: formCupon.codigo,
        comercio_id: comercio.id,
        descuento_tipo: formCupon.descuento_tipo,
        descuento_valor: Number(formCupon.descuento_valor),
        condiciones: formCupon.condiciones,
        usos_maximos: Number(formCupon.usos_maximos),
      }),
    })
    setCreando(false)
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || 'Error al crear cupón')
      return
    }
    toast.success('¡Cupón creado!')
    setCreandoCupon(false)
    setFormCupon({ codigo: '', descuento_tipo: 'porcentaje', descuento_valor: '', condiciones: '', usos_maximos: '100' })
    cargarCupones()
  }

  const abrirChat = async (usuarioId: string) => {
    setChatAbierto(usuarioId)
    setChatMensajes(mensajesConv.filter((m: any) =>
      (m.emisor_id === usuarioId && m.receptor_id === user?.id) ||
      (m.emisor_id === user?.id && m.receptor_id === usuarioId)
    ))
  }

  const enviarMensaje = async () => {
    if (!textoEnvio.trim() || !chatAbierto || !user) return
    setEnviando(true)
    const res = await fetch('/api/mensajes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receptor_id: chatAbierto, contenido: textoEnvio.trim() }),
    })
    setEnviando(false)
    if (!res.ok) { toast.error('Error al enviar'); return }
    setTextoEnvio('')
    setChatMensajes(prev => [...prev, {
      id: 'temp-' + Date.now(),
      emisor_id: user.id,
      contenido: textoEnvio.trim(),
      leido: false,
      created_at: new Date().toISOString(),
    }])
    cargarMensajes()
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
      cargarMensajes(),
      cargarCupones(),
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-texto-secundario">{actividades.filter(a => !filtroFecha || a.fechas?.includes(filtroFecha) || a.fecha === filtroFecha).length} experiencia(s)</p>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              {filtroFecha && (
                <button
                  onClick={() => setFiltroFecha('')}
                  className="text-xs text-primario hover:underline"
                >
                  Limpiar filtro
                </button>
              )}
              <a
                href="/actividades/nueva"
                className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark"
              >
                + Nueva experiencia
              </a>
            </div>
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
                    <th className="px-4 py-3">Próximas fechas</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {actividades
                    .filter(a => !filtroFecha || a.fechas?.includes(filtroFecha) || a.fecha === filtroFecha)
                    .map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-texto">
                        <a href={`/actividades/${a.id}`} className="hover:text-primario">
                          {a.titulo}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-texto-secundario">{a.categoria}</td>
                      <td className="px-4 py-3 font-semibold text-primario">{formatPrecio(a.precio)}</td>
                      <td className="px-4 py-3 text-xs text-texto-secundario">
                        {a.fechas && a.fechas.length > 0
                          ? a.fechas.slice(0, 3).map((f: string) => new Date(f).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })).join(', ') + (a.fechas.length > 3 ? ` +${a.fechas.length - 3}` : '')
                          : a.fecha
                            ? new Date(a.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                            : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Activa
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/actividades/editar/${a.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-texto-secundario transition hover:bg-gray-200 hover:text-texto"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </a>
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
      )}

      {/* Cupones */}
      {tab === 'cupones' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-texto-secundario">
              {comercio
                ? `Cupones de ${comercio.nombre} (${cupones.length})`
                : 'Todavía no tenés un comercio registrado'}
            </p>
            {comercio && (
              <button
                onClick={() => setCreandoCupon(!creandoCupon)}
                className="rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark"
              >
                {creandoCupon ? 'Cancelar' : '+ Nuevo cupón'}
              </button>
            )}
          </div>

          {creandoCupon && comercio && (
            <div className="mb-6 rounded-xl bg-superficie p-5 shadow-sm">
              <h3 className="mb-4 font-titulos text-lg font-bold text-texto">Crear cupón de descuento</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-texto-secundario">Código del cupón</label>
                  <input type="text" value={formCupon.codigo} onChange={(e) => setFormCupon({ ...formCupon, codigo: e.target.value })} placeholder="Ej: ASTRO15" className="w-full rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-texto-secundario">Usos máximos</label>
                  <input type="number" value={formCupon.usos_maximos} onChange={(e) => setFormCupon({ ...formCupon, usos_maximos: e.target.value })} min="1" className="w-full rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-texto-secundario">Tipo de descuento</label>
                  <select value={formCupon.descuento_tipo} onChange={(e) => setFormCupon({ ...formCupon, descuento_tipo: e.target.value as 'porcentaje' | 'fijo' })} className="w-full rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-texto-secundario">{formCupon.descuento_tipo === 'porcentaje' ? 'Valor %' : 'Valor $'}</label>
                  <input type="number" value={formCupon.descuento_valor} onChange={(e) => setFormCupon({ ...formCupon, descuento_valor: e.target.value })} min="1" max={formCupon.descuento_tipo === 'porcentaje' ? 100 : undefined} placeholder={formCupon.descuento_tipo === 'porcentaje' ? 'Ej: 15' : 'Ej: 500'} className="w-full rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-texto-secundario">Condiciones (opcional)</label>
                  <input type="text" value={formCupon.condiciones} onChange={(e) => setFormCupon({ ...formCupon, condiciones: e.target.value })} placeholder="Ej: Válido solo para experiencias de astroturismo" className="w-full rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
                </div>
              </div>
              <button onClick={crearCupon} disabled={creando || !formCupon.codigo.trim() || !formCupon.descuento_valor} className="mt-4 rounded-lg bg-primario px-6 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50">
                {creando ? 'Creando…' : 'Crear cupón'}
              </button>
            </div>
          )}

          {!comercio ? (
            <div className="rounded-xl bg-superficie p-8 text-center shadow-sm">
              <Tag className="mx-auto mb-3 h-12 w-12 text-texto-secundario/50" />
              <p className="text-sm text-texto-secundario">Para crear cupones primero necesitás registrar un comercio.</p>
              <p className="mt-1 text-xs text-texto-secundario/70">Contactá al administrador para que te registre como comercio.</p>
            </div>
          ) : cupones.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">Todavía no creaste ningún cupón. ¡Crea el primero!</p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-superficie shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-medium uppercase tracking-wider text-texto-secundario">
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Descuento</th>
                    <th className="px-4 py-3">Usos</th>
                    <th className="px-4 py-3">Condiciones</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cupones.map((c) => (
                    <tr key={c.codigo} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-primario">{c.codigo}</td>
                      <td className="px-4 py-3 font-semibold text-texto">{c.descuento_tipo === 'porcentaje' ? `${c.descuento_valor}%` : `$${c.descuento_valor}`}</td>
                      <td className="px-4 py-3 text-texto-secundario">{c.usos_actuales} / {c.usos_maximos}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-texto-secundario">{c.condiciones || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.activo ? 'Activo' : 'Inactivo'}
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

      {tab === 'ingresos' && (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Pendiente de cobro</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-primario">{formatPrecio(pagosPendientes.reduce((s, p) => s + p.monto, 0))}</p>
            </div>
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Ya cobrado</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-green-600">{formatPrecio(totalPagado)}</p>
            </div>
            <div className="rounded-xl bg-superficie p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texto-secundario">Comisión (10%)</p>
              <p className="mt-2 font-titulos text-2xl font-bold text-texto-secundario">{formatPrecio(pagosPendientes.reduce((s, p) => s + p.comision, 0))}</p>
            </div>
          </div>
          {pagosPendientes.length === 0 ? (
            <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">No tenés pagos pendientes. Cuando alguien reserve y pague, vas a verlo acá.</p>
          ) : (
            <div className="space-y-3">
              {pagosPendientes.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-superficie p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-texto">{formatPrecio(p.monto)}</p>
                    <p className="mt-0.5 text-xs text-texto-secundario">Comisión: {formatPrecio(p.comision)} — {new Date(p.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">Pendiente</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensajes */}
      {tab === 'mensajes' && (
        <div>
          {chatAbierto ? (
            <div>
              <button onClick={() => setChatAbierto(null)} className="mb-4 flex items-center gap-2 text-sm text-primario hover:underline">← Volver a conversaciones</button>
              <div className="rounded-xl bg-superficie p-4 shadow-sm">
                <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                  {chatMensajes.length === 0 ? (
                    <p className="text-center text-sm text-texto-secundario">Sin mensajes aún</p>
                  ) : (
                    chatMensajes.map((m) => (
                      <div key={m.id} className={`flex ${m.emisor_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${m.emisor_id === user?.id ? 'bg-primario text-white' : 'bg-gray-100 text-texto'}`}>
                          <p>{m.contenido}</p>
                          <p className="mt-1 text-xs opacity-70">{new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 border-t pt-3">
                  <input type="text" value={textoEnvio} onChange={(e) => setTextoEnvio(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()} placeholder="Escribí un mensaje…" className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
                  <button onClick={enviarMensaje} disabled={enviando || !textoEnvio.trim()} className="flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-texto-secundario">{participantes.length} participante(s) de tus experiencias</p>
              {participantes.length === 0 ? (
                <p className="rounded-xl bg-superficie p-8 text-center text-sm text-texto-secundario">Cuando alguien reserve tu experiencia, podrás chatear con ellos acá.</p>
              ) : (
                <div className="space-y-3">
                  {participantes.map((p) => (
                    <button key={p.id} onClick={() => abrirChat(p.id)} className="flex w-full items-center gap-3 rounded-xl bg-superficie p-4 shadow-sm transition hover:bg-gray-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primario/10 text-sm font-bold text-primario">{(p.nombre || 'U')[0].toUpperCase()}</div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-texto">{p.nombre} {p.apellido}</p>
                        <p className="text-xs text-texto-secundario">{mensajesConv.filter((m: any) => m.emisor_id === p.id || m.receptor_id === p.id).length} mensajes</p>
                      </div>
                      <MessageSquare className="h-4 w-4 text-primario" />
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { fetch('/api/admin/contacto').then(r => r.json()).then(d => { if (d.adminId) { setChatAbierto(d.adminId); setChatMensajes(mensajesConv.filter((m: any) => (m.emisor_id === d.adminId && m.receptor_id === user?.id) || (m.emisor_id === user?.id && m.receptor_id === d.adminId))) } }) }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primario/10 p-3 text-sm font-medium text-primario transition hover:bg-primario/20">
                <HelpCircle className="h-4 w-4" /> Contactar al administrador
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}