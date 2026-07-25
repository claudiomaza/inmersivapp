import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generarCodigoConfirmacion } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

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

  const body = await req.json()
  const { actividad_id, fecha, cupon_codigo } = body

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
      cantidad: 1,
    })
    .select()
    .single()

  if (error) {
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
