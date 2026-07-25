'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { MessageSquare, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
  const { isSignedIn, user } = useUser()
  const [cargando, setCargando] = useState(true)
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [cargandoChat, setCargandoChat] = useState(false)
  const [textoEnvio, setTextoEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [perfilesCache, setPerfilesCache] = useState<Record<string, string>>({})

  const obtenerNombre = async (usuarioId: string): Promise<string> => {
    if (perfilesCache[usuarioId]) return perfilesCache[usuarioId]
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, apellido')
      .eq('id', usuarioId)
      .single()
    const nombre = data ? `${data.nombre} ${data.apellido}` : 'Usuario'
    setPerfilesCache((c) => ({ ...c, [usuarioId]: nombre }))
    return nombre
  }

  const cargarConversaciones = async () => {
    if (!user) return
    let todosMensajes: any[] = []

    // Mensajes donde es emisor
    const { data: emitidos } = await supabase
      .from('mensajes')
      .select('*')
      .eq('emisor_id', user.id)
      .order('created_at', { ascending: false })

    // Mensajes donde es receptor
    const { data: recibidos } = await supabase
      .from('mensajes')
      .select('*')
      .eq('receptor_id', user.id)
      .order('created_at', { ascending: false })

    todosMensajes = [...(emitidos || []), ...(recibidos || [])]

    // Agrupar por conversación
    const grupos: Record<string, any> = {}
    for (const msg of todosMensajes) {
      const otroId = msg.emisor_id === user.id ? msg.receptor_id : msg.emisor_id
      if (!grupos[otroId] || new Date(msg.created_at) > new Date(grupos[otroId].created_at)) {
        grupos[otroId] = msg
      }
    }

    const nombres = await Promise.all(
      Object.keys(grupos).map(async (otroId) => ({
        otroId,
        nombre: await obtenerNombre(otroId),
      }))
    )
    const nombreMap = Object.fromEntries(nombres.map((n) => [n.otroId, n.nombre]))

    const convs = await Promise.all(
      Object.entries(grupos).map(async ([otroId, msg]) => {
        const { count } = await supabase
          .from('mensajes')
          .select('*', { count: 'exact', head: true })
          .eq('emisor_id', otroId)
          .eq('receptor_id', user.id)
          .eq('leido', false)
        return {
          otroUsuarioId: otroId,
          otroNombre: nombreMap[otroId] || 'Usuario',
          ultimoMensaje: msg.contenido,
          ultimaFecha: msg.created_at,
          noLeidos: count || 0,
        }
      })
    )

    convs.sort((a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime())
    setConversaciones(convs)
    setCargando(false)
  }

  const abrirChat = async (otroId: string) => {
    if (!user) return
    setChatAbierto(otroId)
    setCargandoChat(true)

    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .or(`and(emisor_id.eq.${user.id},receptor_id.eq.${otroId}),and(emisor_id.eq.${otroId},receptor_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMensajes(data || [])
    setCargandoChat(false)

    // Marcar como leídos
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('emisor_id', otroId)
      .eq('receptor_id', user.id)
      .eq('leido', false)
  }

  const enviarMensaje = async () => {
    if (!user || !chatAbierto || !textoEnvio.trim()) return
    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      emisor_id: user.id,
      receptor_id: chatAbierto,
      contenido: textoEnvio.trim(),
    })
    setEnviando(false)
    if (error) {
      toast.error('Error al enviar mensaje')
      return
    }
    setTextoEnvio('')
    abrirChat(chatAbierto)
    cargarConversaciones()
  }

  useEffect(() => {
    if (user) cargarConversaciones()
    else setCargando(false)
  }, [user])

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-titulos text-2xl font-bold text-texto">Iniciá sesión</h1>
        <p className="text-texto-secundario">Necesitás iniciar sesión para ver tus mensajes.</p>
        <Link href="/login" className="rounded-lg bg-primario px-4 py-2 font-semibold text-white">
          Ingresar
        </Link>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-texto-secundario">Cargando mensajes…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] gap-6">
      {/* Lista de conversaciones */}
      <div className={`w-full lg:w-80 ${chatAbierto ? 'hidden lg:block' : 'block'}`}>
        <h1 className="font-titulos text-2xl font-bold text-texto mb-4">Mensajes</h1>
        {conversaciones.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300" />
            <p className="text-texto-secundario">No tenés mensajes.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversaciones.map((c) => (
              <button
                key={c.otroUsuarioId}
                onClick={() => abrirChat(c.otroUsuarioId)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl p-4 text-left transition hover:bg-gray-50',
                  chatAbierto === c.otroUsuarioId && 'bg-primario/5'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primario/10 text-sm font-semibold text-primario">
                  {c.otroNombre.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.otroNombre}</p>
                  <p className="mt-0.5 truncate text-xs text-texto-secundario">{c.ultimoMensaje}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {new Date(c.ultimaFecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {c.noLeidos > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primario px-1.5 text-[10px] font-bold text-white">
                    {c.noLeidos}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className={`flex-1 ${!chatAbierto ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex flex-col'}`}>
        {!chatAbierto ? (
          <p className="text-texto-secundario">Seleccioná una conversación</p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b pb-3">
              <button onClick={() => setChatAbierto(null)} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primario/10 text-sm font-semibold text-primario">
                {conversaciones.find((c) => c.otroUsuarioId === chatAbierto)?.otroNombre?.charAt(0) || '?'}
              </div>
              <span className="font-medium text-sm">
                {conversaciones.find((c) => c.otroUsuarioId === chatAbierto)?.otroNombre}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {cargandoChat ? (
                <p className="text-center text-sm text-texto-secundario">Cargando mensajes…</p>
              ) : mensajes.length === 0 ? (
                <p className="text-center text-sm text-texto-secundario">Sin mensajes todavía</p>
              ) : (
                mensajes.map((m) => (
                  <div key={m.id} className={cn(
                    'flex',
                    m.emisor_id === user?.id ? 'justify-end' : 'justify-start'
                  )}>
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2',
                      m.emisor_id === user?.id
                        ? 'bg-primario text-white'
                        : 'bg-gray-100 text-texto'
                    )}>
                      <p className="text-sm">{m.contenido}</p>
                      <div className={cn(
                        'mt-1 flex items-center justify-end gap-1',
                        m.emisor_id === user?.id ? 'text-white/60' : 'text-gray-400'
                      )}>
                        <span className="text-[10px]">
                          {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {m.emisor_id === user?.id && (
                          m.leido ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 border-t pt-3">
              <input
                type="text"
                value={textoEnvio}
                onChange={(e) => setTextoEnvio(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Escribí un mensaje…"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
              />
              <button
                onClick={enviarMensaje}
                disabled={enviando || !textoEnvio.trim()}
                className="flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-medium text-white transition hover:bg-primario-dark disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}