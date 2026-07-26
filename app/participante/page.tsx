'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MessageSquare, Ticket, Star, Send, MessageCircle, HelpCircle } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'

type Tab = 'mensajes' | 'reservas' | 'resenas'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'mensajes', label: 'Mensajes', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'reservas', label: 'Reservas', icon: <Ticket className="h-4 w-4" /> },
  { key: 'resenas', label: 'Reseñas', icon: <Star className="h-4 w-4" /> },
]

export default function ParticipantePage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [tab, setTab] = useState<Tab>('mensajes')
  const [cargando, setCargando] = useState(true)
  const [adminId, setAdminId] = useState<string | null>(null)

  // Mensajes
  const [conversaciones, setConversaciones] = useState<any[]>([])
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [chatMensajes, setChatMensajes] = useState<any[]>([])
  const [textoEnvio, setTextoEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Reservas
  const [reservas, setReservas] = useState<any[]>([])

  // Reseñas
  const [resenas, setResenas] = useState<any[]>([])

  useEffect(() => {
    if (!isSignedIn || !user) return
    cargarConversaciones()
    cargarReservas()
    cargarResenas()

    // Obtener ID del admin
    fetch('/api/admin/contacto').then(r => r.json()).then(d => {
      setAdminId(d.adminId)
    })

    // Si viene de contactar anfitrión, abrir ese chat
    if (searchParams?.get('contactar')) {
      const contactoId = searchParams.get('contactar')!
      setChatAbierto(contactoId)
      fetch(`/api/mensajes/conversaciones/${contactoId}`).then(r => r.json()).then(d => {
        setChatMensajes(d.mensajes || [])
      })
    }

    setCargando(false)
  }, [isSignedIn, user])

  // ─── Mensajes ───

  const cargarConversaciones = async () => {
    const res = await fetch('/api/mensajes/conversaciones')
    if (!res.ok) return
    const data = await res.json()
    setConversaciones(data.conversaciones || [])
  }

  const abrirChat = async (usuarioId: string) => {
    setChatAbierto(usuarioId)
    const res = await fetch(`/api/mensajes/conversaciones/${usuarioId}`)
    if (!res.ok) return
    const data = await res.json()
    setChatMensajes(data.mensajes || [])
  }

  const enviarMensaje = async () => {
    if (!textoEnvio.trim() || !chatAbierto) return
    setEnviando(true)
    const res = await fetch('/api/mensajes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receptor_id: chatAbierto, contenido: textoEnvio }),
    })
    if (res.ok) {
      setChatMensajes(prev => [...prev, { contenido: textoEnvio, emisor_id: user?.id, created_at: new Date().toISOString() }])
      setTextoEnvio('')
    } else {
      toast.error('Error al enviar mensaje')
    }
    setEnviando(false)
  }

  // ─── Reservas ───

  const cargarReservas = async () => {
    const res = await fetch('/api/reservas')
    if (!res.ok) return
    const data = await res.json()
    setReservas(data.reservas || [])
  }

  const cancelarReserva = async (id: string) => {
    const res = await fetch('/api/reservas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserva_id: id, estado: 'cancelada' }),
    })
    if (res.ok) {
      toast.success('Reserva cancelada')
      cargarReservas()
    } else {
      toast.error('Error al cancelar')
    }
  }

  // ─── Reseñas ───

  const cargarResenas = async () => {
    const res = await fetch('/api/resenas')
    if (!res.ok) return
    const data = await res.json()
    setResenas(data.resenas || [])
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Iniciá sesión</h1>
        <p className="text-texto-secundario">Necesitás iniciar sesión para ver tu panel.</p>
        <Link href="/login" className="rounded-lg bg-primario px-4 py-2 font-semibold text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-titulos text-2xl font-bold text-texto">Mi Panel</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'border-primario text-primario'
                : 'border-transparent text-texto-secundario hover:text-texto'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Mensajes ─── */}
      {tab === 'mensajes' && (
        <div>
          {chatAbierto ? (
            <div>
              <button
                onClick={() => setChatAbierto(null)}
                className="mb-4 text-sm text-primario hover:underline"
              >
                ← Volver a conversaciones
              </button>
              <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl bg-white p-4 shadow-sm">
                {chatMensajes.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.emisor_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                        m.emisor_id === user?.id
                          ? 'bg-primario text-white'
                          : 'bg-gray-100 text-texto'
                      }`}
                    >
                      <p>{m.contenido}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(m.created_at).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={textoEnvio}
                  onChange={(e) => setTextoEnvio(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
                />
                <button
                  onClick={enviarMensaje}
                  disabled={enviando || !textoEnvio.trim()}
                  className="rounded-lg bg-primario px-4 py-2 text-white transition hover:bg-primario-dark disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {conversaciones.length === 0 ? (
                  <p className="text-center text-texto-secundario">No tenés mensajes todavía.</p>
                ) : (
                  conversaciones.map((conv) => (
                    <button
                      key={conv.otroUsuarioId}
                      onClick={() => abrirChat(conv.otroUsuarioId)}
                      className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm transition hover:bg-primario/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primario/10 text-sm font-bold text-primario">
                        {conv.otroNombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-texto">
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
                  ))
                )}
              </div>
              {adminId && adminId !== user?.id && (
                <button
                  onClick={() => abrirChat(adminId)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primario/10 p-3 text-sm font-medium text-primario transition hover:bg-primario/20"
                >
                  <HelpCircle className="h-4 w-4" /> Contactar al administrador
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Reservas ─── */}
      {tab === 'reservas' && (
        <div className="space-y-4">
          {reservas.length === 0 ? (
            <p className="text-center text-texto-secundario">No tenés reservas todavía.</p>
          ) : (
            reservas.map((r) => (
              <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-texto">{r.actividades?.titulo || 'Actividad'}</p>
                    <p className="text-sm text-texto-secundario">
                      {new Date(r.fecha_reserva).toLocaleDateString('es-AR', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                    {r.codigo_confirmacion && (
                      <p className="mt-1 text-xs text-texto-secundario">
                        Código: <span className="font-mono">{r.codigo_confirmacion}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                      r.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                      r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.estado}
                    </span>
                    {r.actividades && (
                      <p className="mt-2 text-sm font-semibold text-primario">
                        {formatPrecio(r.actividades.precio)}
                      </p>
                    )}
                  </div>
                </div>
                {r.estado === 'confirmada' && (
                  <button
                    onClick={() => cancelarReserva(r.id)}
                    className="mt-4 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Reseñas ─── */}
      {tab === 'resenas' && (
        <div className="space-y-4">
          {resenas.length === 0 ? (
            <p className="text-center text-texto-secundario">No hiciste reseñas todavía.</p>
          ) : (
            resenas.map((r) => (
              <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.puntuacion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-texto">{r.comentario}</p>
                <p className="mt-1 text-xs text-texto-secundario">
                  {new Date(r.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}