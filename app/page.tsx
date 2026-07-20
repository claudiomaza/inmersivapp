import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import CardActividad from '@/components/CardActividad'
import CarruselAnuncios from '@/components/CarruselAnuncios'

export const dynamic = 'force-dynamic'

const CATEGORIAS_PORTFOLIO = [
  { emoji: '🎨', titulo: 'Arte', desc: 'Talleres, cerámica, acuarela, fotografía' },
  { emoji: '🥾', titulo: 'Naturaleza', desc: 'Senderismo, cabalgatas, aventura al aire libre' },
  { emoji: '🍲', titulo: 'Gastronomía', desc: 'Cocina regional, degustaciones, sabores locales' },
]

export default async function Home() {
  const { userId } = await auth()

  const [actividadesRes, anunciosRes] = await Promise.all([
    supabaseAdmin
      .from('actividades')
      .select('*')
      .eq('activa', true)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('anuncios')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const anuncios = anunciosRes.data || []
  const todas = actividadesRes.data || []

  let perfil = null
  if (userId) {
    const { data } = await supabaseAdmin
      .from('perfiles')
      .select('intereses')
      .eq('id', userId)
      .single()
    perfil = data
  }

  const recomendadas = perfil?.intereses?.length
    ? todas.filter((a) => perfil.intereses.includes(a.categoria)).slice(0, 6)
    : todas.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="hero-glow -mx-4 -mt-6 flex min-h-[65vh] flex-col items-center justify-center rounded-b-3xl px-4 text-center sm:-mx-6 lg:-mx-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-primario/10 px-4 py-1.5 text-xs font-medium text-primario">
            Descubrí experiencias únicas
          </span>
          <h1 className="mt-6 font-titulos text-4xl font-extrabold tracking-tight text-texto sm:text-5xl lg:text-6xl">
            Viví momentos que
            <span className="text-primario"> transforman</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-texto-secundario">
            Explorá actividades auténticas, conectá con anfitriones locales y viví
            experiencias que van más allá de lo cotidiano.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/actividades"
              className="card-lift inline-flex items-center gap-2 rounded-xl bg-primario px-6 py-3 font-semibold text-white transition hover:bg-primario-dark"
            >
              Explorar actividades
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="/actividades?categoria=Arte"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-medium text-texto transition hover:bg-gray-50"
            >
              Ver categorías
            </Link>
          </div>
        </div>
      </section>

      {/* Anuncios patrocinados */}
      {anuncios.length > 0 && (
        <section className="mt-16">
          <CarruselAnuncios anuncios={anuncios} />
        </section>
      )}

      {/* Recomendadas */}
      {recomendadas.length > 0 && (
        <section className="mt-16 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-titulos text-2xl font-bold text-texto">
              {perfil?.intereses?.length ? 'Recomendadas para vos' : 'Actividades destacadas'}
            </h2>
            <Link
              href="/actividades"
              className="text-sm font-medium text-primario transition hover:text-primario-light"
            >
              Ver todas →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recomendadas.map((act) => (
              <CardActividad key={act.id} actividad={act} />
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="mt-16 mb-8">
        <h2 className="font-titulos mb-6 text-2xl font-bold text-texto">
          Explorá por categoría
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {CATEGORIAS_PORTFOLIO.map((cat) => (
            <Link
              key={cat.titulo}
              href={`/actividades?categoria=${cat.titulo}`}
              className="card-lift group relative rounded-2xl bg-superficie p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primario/10 text-2xl">
                {cat.emoji}
              </div>
              <h3 className="mt-4 font-titulos text-lg font-semibold text-texto">
                {cat.titulo}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-texto-secundario">
                {cat.desc}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-primario opacity-0 transition group-hover:opacity-100">
                Explorar →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}