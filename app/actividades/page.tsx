import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import CardActividad from '@/components/CardActividad'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const supabase = await createClient()

  const { data: actividades } = await supabase
    .from('actividades')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-titulos text-3xl font-bold text-primario">
        Explorar actividades
      </h1>
      <p className="mt-1 text-texto-secundario">
        Encontrá experiencias únicas cerca tuyo
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!actividades || actividades.length === 0 ? (
          <p className="col-span-full text-center text-texto-secundario">
            No hay actividades disponibles todavía.
          </p>
        ) : (
          actividades.map((act: any) => (
            <CardActividad key={act.id} actividad={act} />
          ))
        )}
      </div>
    </div>
  )
}