import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

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
