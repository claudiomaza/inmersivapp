import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const { codigo } = await req.json()
  if (!codigo) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from("cupones")
    .select("*")
    .eq("codigo", codigo.toUpperCase())
    .eq("activo", true)
    .single()

  if (!data) {
    return NextResponse.json({ valido: false, descuento: 0, mensaje: "Cupón inválido o vencido" })
  }

  if (data.usos_actuales >= data.usos_maximos) {
    return NextResponse.json({ valido: false, descuento: 0, mensaje: "Este cupón ya no tiene usos disponibles" })
  }

  return NextResponse.json({
    valido: true,
    descuento: data.descuento_valor,
    tipo: data.descuento_tipo,
    mensaje: `Cupón aplicado: ${data.descuento_tipo === "porcentaje" ? data.descuento_valor + "%" : "$" + data.descuento_valor} de descuento`,
  })
}
