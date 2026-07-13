import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import CardActividad from '@/components/CardActividad'
import CarruselAnuncios from '@/components/CarruselAnuncios'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const [actividadesRes, anunciosRes] = await Promise.all([
    supabase
      .from('actividades')
      .select('*')
      .eq('activa', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('anuncios')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const actividades = actividadesRes.data
  const anuncios = anunciosRes.data || []

  const { data: { session } } = await supabase.auth.getSession()
  let perfil = null
  if (session) {
    const { data } = await supabase
      .from('perfiles')
      .select('intereses')
      .eq('id', session.user.id)
      .single()
    perfil = data
  }

  const todas = actividades || []

  // Actividades recomendadas para usuarios logueados
  const recomendadas = perfil?.intereses?.length
    ? todas
        .filter((a) => perfil.intereses.includes(a.categoria))
        .slice(0, 6)
    : todas.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="font-titulos text-4xl font-extrabold tracking-tight text-primario sm:text-5xl lg:text-6xl">
          INMERSIVAPP
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-texto-secundario sm:text-xl">
          Conectá con experiencias auténticas cerca tuyo. Talleres, salidas, arte,
          cocina, naturaleza — todo lo que te saque del piloto automático.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/actividades"
            className="rounded-xl bg-primario px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-primario-dark"
          >
            Explorar actividades
          </Link>
          {!session ? (
            <Link
              href="/registro"
              className="rounded-xl border-2 border-primario px-8 py-3 text-lg font-semibold text-primario transition hover:bg-primario hover:text-white"
            >
              Crear cuenta
            </Link>
          ) : null}
        </div>
      </div>

      {/* Anuncios patrocinados */}
      <CarruselAnuncios anuncios={anuncios} />

      {/* Recomendaciones */}
      {recomendadas.length > 0 && (
        <section className="mt-8">
          <h2 className="font-titulos text-2xl font-bold text-texto">
            {perfil?.intereses?.length
              ? 'Recomendado para vos ✨'
              : 'Actividades destacadas'}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recomendadas.map((act) => (
              <CardActividad key={act.id} actividad={act} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/actividades"
              className="inline-block rounded-lg border-2 border-primario px-6 py-2.5 font-semibold text-primario transition hover:bg-primario hover:text-white"
            >
              Ver todas las actividades
            </Link>
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="mt-16 mb-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { titulo: '🎨', desc: 'Talleres de arte, cerámica, fotografía' },
            { titulo: '🥾', desc: 'Senderismo, naturaleza, aventura' },
            { titulo: '🍝', desc: 'Cocina, gastronomía, sabores locales' },
          ].map((item) => (
            <div
              key={item.titulo}
              className="rounded-xl bg-superficie p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="text-4xl">{item.titulo}</div>
              <p className="mt-2 text-sm text-texto-secundario">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}