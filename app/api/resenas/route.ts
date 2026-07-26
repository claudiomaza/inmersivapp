import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const actividad_id = searchParams.get("actividad_id")

  if (actividad_id) {
    const { data: resenas, error } = await supabaseAdmin
      .from("resenas")
      .select("*, perfiles!resenas_usuario_id_fkey(nombre, avatar_url)")
      .eq("actividad_id", actividad_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 })
    }

    return NextResponse.json({ resenas })
  }

  return NextResponse.json({ error: "actividad_id requerido" }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { actividad_id, puntuacion, comentario } = body

  if (!actividad_id || !puntuacion) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  // Verificar que el usuario haya reservado y pagado esta actividad
  const { data: reserva, error: errReserva } = await supabaseAdmin
    .from("reservas")
    .select("id, estado")
    .eq("usuario_id", userId)
    .eq("actividad_id", actividad_id)
    .in("estado", ["confirmada", "completada", "pagada"])
    .maybeSingle()

  if (errReserva) {
    return NextResponse.json({ error: "Error al verificar la reserva" }, { status: 500 })
  }

  if (!reserva) {
    return NextResponse.json(
      { error: "Tenés que reservar y asistir a la actividad antes de dejar una reseña" },
      { status: 403 }
    )
  }

  const { data: existente } = await supabaseAdmin
    .from("resenas")
    .select("id")
    .eq("usuario_id", userId)
    .eq("actividad_id", actividad_id)
    .single()

  if (existente) {
    return NextResponse.json({ error: "Ya dejaste una reseña para esta actividad" }, { status: 409 })
  }

  const { error } = await supabaseAdmin
    .from("resenas")
    .insert({
      usuario_id: userId,
      actividad_id,
      puntuacion,
      comentario: comentario || "",
    })

  if (error) {
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}