import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { data: perfil, error } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
  }

  return NextResponse.json({ perfil })
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { nombre, apellido, username, telefono, intereses, roles } = body

  const updates: Record<string, any> = {}
  if (nombre !== undefined) updates.nombre = nombre
  if (apellido !== undefined) updates.apellido = apellido
  if (username !== undefined) updates.username = username
  if (telefono !== undefined) updates.telefono = telefono
  if (intereses !== undefined) updates.intereses = intereses
  if (roles !== undefined) updates.roles = roles

  const { error } = await supabaseAdmin
    .from("perfiles")
    .update(updates)
    .eq("id", userId)

  if (error) {
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
