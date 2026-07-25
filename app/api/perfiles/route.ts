import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  let { data: perfil, error } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single()

  // Si no existe el perfil, lo creamos automáticamente
  if (error && error.code === "PGRST116") {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || ""
    const nombre = clerkUser.firstName || clerkUser.username || "Sin nombre"
    const apellido = clerkUser.lastName || null

    const { data: nuevoPerfil, error: insertError } = await supabaseAdmin
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
      .select()
      .single()

    if (insertError) {
      console.error("Error al crear perfil:", insertError)
      return NextResponse.json({ error: "Error al crear perfil" }, { status: 500 })
    }

    return NextResponse.json({ perfil: nuevoPerfil })
  }

  if (error) {
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
  const { nombre, apellido, username, telefono, cuil, alias_mp, intereses, roles } = body

  const updates: Record<string, any> = {}
  if (nombre !== undefined) updates.nombre = nombre
  if (apellido !== undefined) updates.apellido = apellido
  if (username !== undefined) updates.username = username
  if (telefono !== undefined) updates.telefono = telefono
  if (cuil !== undefined) updates.cuil = cuil
  if (alias_mp !== undefined) updates.alias_mp = alias_mp
  if (intereses !== undefined) updates.intereses = intereses
  if (roles !== undefined) updates.roles = roles
  // Si se actualiza roles, también sincronizar rol singular
  if (roles !== undefined) {
    updates.rol = roles.includes("anfitrion") ? "anfitrion" : "participante"
  }

  const { error } = await supabaseAdmin
    .from("perfiles")
    .update(updates)
    .eq("id", userId)

  if (error) {
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}