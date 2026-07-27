import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Mensajes donde el usuario es emisor o receptor
  // Usamos alias explícitos para los perfiles para evitar ambigüedad
  const { data: emitidos, error: err1 } = await supabaseAdmin
    .from('mensajes')
    .select('*, emisor:perfiles!emisor_id(nombre, apellido), receptor:perfiles!receptor_id(nombre, apellido)')
    .eq('emisor_id', userId)
    .order('created_at', { ascending: false })

  const { data: recibidos, error: err2 } = await supabaseAdmin
    .from('mensajes')
    .select('*, emisor:perfiles!emisor_id(nombre, apellido), receptor:perfiles!receptor_id(nombre, apellido)')
    .eq('receptor_id', userId)
    .order('created_at', { ascending: false })

  if (err1 || err2) {
    console.error('Error fetching messages:', err1 || err2)
  }

  const todos = [...(emitidos || []), ...(recibidos || [])]

  // Agrupar por conversación (el otro usuario)
  const grupos: Record<string, any> = {}
  for (const msg of todos) {
    const otroId = msg.emisor_id === userId ? msg.receptor_id : msg.emisor_id
    if (!grupos[otroId] || new Date(msg.created_at) > new Date(grupos[otroId].created_at)) {
      grupos[otroId] = msg
    }
  }

  // No leídos por conversación (mensajes recibidos por mi que no están leídos)
  const noLeidosMap: Record<string, number> = {}
  if (recibidos) {
    for (const msg of recibidos) {
      if (!msg.leido) {
        noLeidosMap[msg.emisor_id] = (noLeidosMap[msg.emisor_id] || 0) + 1
      }
    }
  }

  const conversaciones = Object.entries(grupos).map(([otroId, msg]) => {
    // Si yo soy el emisor, el otro es el receptor
    const otroPerfil = msg.emisor_id === userId ? msg.receptor : msg.emisor
    
    return {
      otroUsuarioId: otroId,
      otroNombre: otroPerfil?.nombre || 'Usuario',
      otroApellido: otroPerfil?.apellido || '',
      ultimoMensaje: msg.contenido,
      ultimaFecha: msg.created_at,
      noLeidos: noLeidosMap[otroId] || 0,
    }
  })

  // Ordenar por más reciente
  conversaciones.sort((a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime())

  return NextResponse.json({ conversaciones })
}

