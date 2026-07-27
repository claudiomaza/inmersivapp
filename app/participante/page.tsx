'use client'

import { Suspense, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MessageSquare, Ticket, Star, Send, MessageCircle, HelpCircle } from 'lucide-react'
import { useLang } from '@/lib/lang-context'
import { formatPrecio } from '@/lib/utils'

type Tab = 'mensajes' | 'reservas' | 'resenas'

export default function ParticipantePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><p className="text-texto-secundario">Cargando...</p></div>}>
      <ParticipanteContent />
    </Suspense>
  )
}

function ParticipanteContent() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const { t } = useLang()
  const searchParams = useSearchParams()
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "mensajes", label: t("panel.mensajes"), icon: <MessageSquare className="h-4 w-4" /> },
    { key: "reservas", label: t("panel.reservas"), icon: <Ticket className="h-4 w-4" /> },
    { key: "resenas", label: t("panel.resenas"), icon: <Star className="h-4 w-4" /> },
  ]
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
    const contactoId = searchParams?.get('contactar')
    if (contactoId) {
      setChatAbierto(contactoId)
      setTab('mensajes')
      fetch(`/api/mensajes/conversacion/${contactoId}`).then(r => r.json()).then(d => {
        setChatMensajes(d.mensajes || [])
      })
    }

    setCargando(false)
  }, [isSignedIn, user, searchParams])

  // ─── Mensajes ───

  const cargarConversaciones = async () => {
    const res = await fetch('/api/mensajes/conversaciones')
    if (!res.ok) return
    const data = await res.json()
    setConversaciones(data.conversaciones || [])
  }

  const abrirChat = async (usuarioId: string) => {
    setChatAbierto(usuarioId)
    const res = await fetch(`/api/mensajes/conversacion/${usuarioId}`)
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
      cargarConversaciones()
    } else {
      toast.error(t("panel.error_enviar"))
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
      toast.success(t("panel.reserva_cancelada"))
      cargarReservas()
    } else {
      toast.error(t("panel.error_cancelar"))
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
        <h1 className="font-titulos text-2xl font-bold text-texto">{t("panel.iniciar_sesion_h1")}</h1>
        <p className="text-texto-secundario">{t("panel.iniciar_sesion_p")}</p>
        <Link href="/login" className="rounded-lg bg-primario px-4 py-2 font-semibold text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">{t("panel.cargando")}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-titulos text-2xl font-bold text-texto">{t("panel.titulo")}</h1>

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

      {/* ─── Mensajes — estilo WhatsApp ─── */}
      {tab === 'mensajes' && (
        <div className="mx-auto max-w-2xl">
          {chatAbierto ? (
            <div className="flex flex-col rounded-xl bg-white shadow-sm">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <button
                  onClick={() => setChatAbierto(null)}
                  className="flex items-center gap-1 text-sm font-medium text-primario hover:underline"
                >
                  ← Volver
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primario/10 text-sm font-bold text-primario">
                  {(() => {
                    const conv = conversaciones.find(c => c.otroUsuarioId === chatAbierto)
                    return (conv?.otroNombre || '?')[0].toUpperCase()
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-texto">
                    {(() => {
                      const conv = conversaciones.find(c => c.otroUsuarioId === chatAbierto)
                      return conv ? `${conv.otroNombre} ${conv.otroApellido}` : 'Chat'
                    })()}
                  </p>
                </div>
              </div>
              {/* Messages */}
              <div className="flex h-80 flex-col gap-2 overflow-y-auto px-4 py-4">
                {chatMensajes.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-center text-sm text-texto-secundario">No hay mensajes aún. Enviá el primero.</p>
                  </div>
                ) : (
                  chatMensajes.map((m, i) => {
                    const esMio = m.emisor_id === user?.id
                    const mostrarFecha = i === 0 || new Date(m.created_at).toDateString() !== new Date(chatMensajes[i-1]?.created_at).toDateString()
                    return (
                      <div key={m.id || i}>
                        {mostrarFecha && (
                          <p className="my-2 text-center text-[10px] text-texto-secundario">
                            {new Date(m.created_at).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        )}
                        <div className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            esMio
                              ? 'bg-primario text-white rounded-br-md'
                              : 'bg-gray-100 text-texto rounded-bl-md'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                            <p className={`mt-1 text-right text-[10px] ${esMio ? 'text-white/70' : 'text-texto-secundario'}`}>
                              {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              {esMio && ' ✓'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
              {/* Input */}
              <div className="flex items-center gap-2 border-t px-4 py-3">
                <input
                  type="text"
                  value={textoEnvio}
                  onChange={(e) => setTextoEnvio(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      enviarMensaje()
                    }
                  }}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 rounded-full border border-gray-300 px-5 py-2.5 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/20"
                />
                <button
                  onClick={enviarMensaje}
                  disabled={enviando || !textoEnvio.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primario text-white transition hover:bg-primario-dark disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y overflow-hidden rounded-xl bg-white shadow-sm">
              {conversaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="mb-3 h-10 w-10 text-texto-secundario/40" />
                  <p className="text-sm text-texto-secundario">{t("panel.no_mensajes")}</p>
                </div>
              ) : (
                conversaciones.map((conv) => (
                  <button
                    key={conv.otroUsuarioId}
                    onClick={() => abrirChat(conv.otroUsuarioId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primario/10 text-base font-bold text-primario">
                      {conv.otroNombre?.charAt(0)?.toUpperCase() || '?'}
                      {conv.noLeidos > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
                          {conv.noLeidos}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <p className="truncate text-sm font-medium text-texto">
                          {conv.otroNombre} {conv.otroApellido}
                        </p>
                        <p className="ml-2 shrink-0 text-[11px] text-texto-secundario">
                          {new Date(conv.ultimaFecha).toLocaleDateString('es-AR', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-texto-secundario">
                        {conv.ultimoMensaje || 'Sin mensajes'}
                      </p>
                    </div>
                  </button>
                ))
              )}
              {adminId && adminId !== user?.id && (
                <button
                  onClick={() => abrirChat(adminId)}
                  className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-sm font-medium text-primario transition hover:bg-primario/5"
                >
                  <HelpCircle className="h-4 w-4" /> {t("panel.contactar_admin")}
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
            <p className="text-center text-texto-secundario">{t("panel.no_reservas")}</p>
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
                    {t("panel.cancelar_reserva")}
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
            <p className="text-center text-texto-secundario">{t("panel.no_resenas")}</p>
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
