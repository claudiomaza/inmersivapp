'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { MessageSquare, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Conversacion {
  otroUsuarioId: string
  otroNombre: string
  ultimoMensaje: string
  ultimaFecha: string
  noLeidos: number
  actividadNombre?: string
}

interface MensajeChat {
  id: string
  emisor_id: string
  contenido: string
  leido: boolean
  created_at: string
}

export default function MensajesPage() {
  const [sesion, setSesion] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [cargandoChat, setCargandoChat] = useState(false)
  const [textoEnvio, setTextoEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [perfilesCache, setPerfilesCache] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      if (data.session) {
        cargarConversaciones(data.session.user.id)
      } else {
        setCargando(false)
      }
    })
  }, [])

  const obtenerNombre = async (userId: string): Promise<string> => {
    if (perfilesCache[userId]) return perfilesCache[userId]
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, apellido')
      .eq('id', userId)
      .single()
    const nombre = data ? `${data.nombre} ${data.apellido}` : 'Usuario'
    setPerfilesCache((prev) => ({ ...prev, [userId]: nombre }))
    return nombre
  }

  const cargarConversaciones = async (userId: string) => {
    const { data: mensajes } = await supabase
      .from('mensajes')
      .select(`*, actividad:actividades(titulo)`)
      .or(`emisor_id.eq.${userId},receptor_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!mensajes) {
      setCargando(false)
      return
    }

    // Agrupar por el otro usuario
    const otrosMap = new Map<string, any[]>()
    for (const m of mensajes) {
      const otroId = m.emisor_id === userId ? m.receptor_id : m.emisor_id
      if (!otrosMap.has(otroId)) otrosMap.set(otroId, [])
      otrosMap.get(otroId)!.push(m)
    }

    const convs: Conversacion[] = []
    for (const [otroId, msgs] of otrosMap) {
      const nombre = await obtenerNombre(otroId)
      const ultimo = msgs[0]
      const noLeidos = msgs.filter(
        (m: any) => m.receptor_id === userId && !m.leido
      ).length

      convs.push({
        otroUsuarioId: otroId,
        otroNombre: nombre,
        ultimoMensaje: ultimo.contenido,
        ultimaFecha: ultimo.created_at,
        noLeidos,
        actividadNombre: ultimo.actividad?.titulo,
      })
    }

    convs.sort(
      (a, b) =>
        new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime()
    )

    setConversaciones(convs)
    setCargando(false)
  }

  const abrirChat = async (otroId: string) => {
    if (!sesion) return
    setChatAbierto(otroId)
    setCargandoChat(true)

    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .or(
        `and(emisor_id.eq.${sesion.user.id},receptor_id.eq.${otroId}),and(emisor_id.eq.${otroId},receptor_id.eq.${sesion.user.id})`
      )
      .order('created_at', { ascending: true })

    setMensajes(data || [])

    // Marcar como leídos los mensajes recibidos
    const idsNoLeidos = (data || [])
      .filter((m) => m.receptor_id === sesion.user.id && !m.leido)
      .map((m) => m.id)

    if (idsNoLeidos.length > 0) {
      await supabase
        .from('mensajes')
        .update({ leido: true })
        .in('id', idsNoLeidos)
    }

    setCargandoChat(false)

    // Actualizar contadores
    setConversaciones((prev) =>
      prev.map((c) =>
        c.otroUsuarioId === otroId ? { ...c, noLeidos: 0 } : c
      )
    )
  }

  const enviarMensaje = async () => {
    if (!textoEnvio.trim() || !sesion || !chatAbierto) return
    setEnviando(true)

    const res = await fetch('/api/mensajes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receptor_id: chatAbierto,
        contenido: textoEnvio.trim(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error('Error al enviar mensaje')
      setEnviando(false)
      return
    }

    setMensajes((prev) => [
      ...prev,
      {
        id: data.mensaje.id,
        emisor_id: sesion.user.id,
        contenido: textoEnvio.trim(),
        leido: false,
        created_at: data.mensaje.created_at,
      },
    ])
    setTextoEnvio('')
    setEnviando(false)

    // Actualizar conversaciones
    cargarConversaciones(sesion.user.id)
    toast.success('Mensaje enviado')
  }

  const cerrarChat = () => {
    setChatAbierto(null)
    setMensajes([])
  }

  if (!sesion) {
    return (
      <div className="mt-16 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-texto-secundario" />
        <h1 className="mt-4 font-titulos text-2xl font-bold text-primario">
          Mensajes
        </h1>
        <p className="mt-2 text-texto-secundario">
          Iniciá sesión para ver tus mensajes
        </p>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        <p className="mt-4 text-texto-secundario">Cargando mensajes…</p>
      </div>
    )
  }

  const nombreChat = conversaciones.find(
    (c) => c.otroUsuarioId === chatAbierto
  )

  return (
    <div>
      <h1 className="font-titulos text-2xl font-bold text-primario">
        Mensajes
      </h1>

      {conversaciones.length === 0 ? (
        <div className="mt-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-texto-secundario" />
          <p className="mt-4 text-lg text-texto-secundario">
            No tenés conversaciones todavía
          </p>
        </div>
      ) : chatAbierto ? (
        /* ── Chat inline ── */
        <div className="mt-6">
          {/* Header del chat */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={cerrarChat}
              className="flex items-center gap-1 text-sm font-medium text-primario hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="font-titulos text-lg font-bold text-texto">
              {nombreChat?.otroNombre}
            </h2>
          </div>

          {/* Mensajes */}
          <div className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-superficie p-4 shadow-sm">
            {cargandoChat ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primario border-t-transparent" />
              </div>
            ) : mensajes.length === 0 ? (
              <p className="py-8 text-center text-texto-secundario">
                No hay mensajes. Enviá el primero.
              </p>
            ) : (
              mensajes.map((m) => {
                const esMio = m.emisor_id === sesion.user.id
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex',
                      esMio ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                        esMio
                          ? 'bg-primario text-white'
                          : 'bg-fondo text-texto'
                      )}
                    >
                      <p>{m.contenido}</p>
                      <div
                        className={cn(
                          'mt-1 flex items-center justify-end gap-1 text-[10px]',
                          esMio ? 'text-white/70' : 'text-texto-secundario/60'
                        )}
                      >
                        <span>
                          {new Date(m.created_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {esMio &&
                          (m.leido ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
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
              placeholder="Escribí un mensaje…"
              className="flex-1 rounded-xl border border-gray-200 bg-superficie px-4 py-2.5 text-sm outline-none transition focus:border-primario focus:ring-1 focus:ring-primario"
              disabled={enviando}
            />
            <button
              onClick={enviarMensaje}
              disabled={!textoEnvio.trim() || enviando}
              className="rounded-xl bg-primario px-4 py-2.5 text-white transition hover:bg-primario-dark disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        /* ── Lista de conversaciones ── */
        <div className="mt-6 space-y-2">
          {conversaciones.map((conv) => (
            <button
              key={conv.otroUsuarioId}
              onClick={() => abrirChat(conv.otroUsuarioId)}
              className="flex w-full items-center gap-4 rounded-xl bg-superficie p-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primario/10 text-sm font-bold text-primario">
                {conv.otroNombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-titulos text-sm font-semibold text-texto">
                    {conv.otroNombre}
                  </span>
                  <span className="text-xs text-texto-secundario/60">
                    {new Date(conv.ultimaFecha).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                {conv.actividadNombre && (
                  <p className="text-xs text-primario/60">
                    {conv.actividadNombre}
                  </p>
                )}
                <p className="mt-0.5 truncate text-sm text-texto-secundario">
                  {conv.ultimoMensaje}
                </p>
              </div>
              {conv.noLeidos > 0 && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error text-xs font-bold text-white">
                  {conv.noLeidos}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}