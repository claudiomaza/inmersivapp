import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generarCodigoConfirmacion } from "@/lib/utils"

// Auto-crear perfil si no existe
async function asegurarPerfil(userId: string) {
  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("id")
    .eq("id", userId)
    .single()

  if (perfil) return perfil

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || ""
  const nombre = clerkUser.firstName || clerkUser.username || "Sin nombre"
  const apellido = clerkUser.lastName || null

  const { error } = await supabaseAdmin
    .from("perfiles")
    .insert({
      id: userId,
      email,
      nombre,
      apellido,
      username: clerkUser.username || null,
      rol: "participante",
      roles: ["participante"],
    })

  if (error) {
    console.error("Error al crear perfil desde reservas:", error)
    // Intentar de nuevo — podría ser race condition de inserción
    await new Promise(r => setTimeout(r, 500))
    const { data: retry } = await supabaseAdmin
      .from("perfiles")
      .select("id")
      .eq("id", userId)
      .single()
    return retry
  }

  return { id: userId }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Asegurar perfil
  await asegurarPerfil(userId)

  const { searchParams } = new URL(req.url)
  const actividadId = searchParams.get("actividad_id")

  let query = supabaseAdmin
    .from("reservas")
    .select("*, actividades(*)")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false })

  if (actividadId) {
    query = query.eq("actividad_id", actividadId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 })
  }

  return NextResponse.json({ reservas: data || [] })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Asegurar que el perfil existe antes de crear la reserva
  const perfil = await asegurarPerfil(userId)
  if (!perfil) {
    return NextResponse.json({ error: "Error al crear perfil de usuario" }, { status: 500 })
  }

  const body = await req.json()
  const { actividad_id, fecha, cupon_codigo, cantidad = 1 } = body

  if (!actividad_id || !fecha) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  const { data: reserva, error } = await supabaseAdmin
    .from("reservas")
    .insert({
      usuario_id: userId,
      actividad_id,
      fecha,
      estado: "pendiente",
      codigo_confirmacion: generarCodigoConfirmacion(),
      cupon_codigo: cupon_codigo || null,
      cantidad,
    })
    .select()
    .single()

  if (error) {
    console.error("Error al crear reserva:", error)
    return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 })
  }

  return NextResponse.json({ reserva })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { reserva_id, estado } = body

  if (!reserva_id || !estado) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("reservas")
    .update({ estado })
    .eq("id", reserva_id)
    .eq("usuario_id", userId)

  if (error) {
    return NextResponse.json({ error: "Error al actualizar reserva" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}