import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import CardActividad from '@/components/CardActividad'

export const dynamic = 'force-dynamic'

const CATEGORIAS_PORTFOLIO = [
  { emoji: '🎨', titulo: 'Arte', desc: 'Talleres, cerámica, acuarela, fotografía' },
  { emoji: '🥾', titulo: 'Naturaleza', desc: 'Senderismo, cabalgatas, aventura al aire libre' },
  { emoji: '🍲', titulo: 'Gastronomía', desc: 'Cocina regional, degustaciones, sabores locales' },
]

export default async function Home() {
  const { userId } = await auth()

  const { data: actividades } = await supabaseAdmin
    .from('actividades')
    .select('*')
    .order('created_at', { ascending: false })

  const todas = actividades || []

  // No tenemos intereses en el nuevo schema, mostramos las primeras 6
  const recomendadas = todas.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="hero-glow relative -mx-4 -mt-6 overflow-hidden px-4 pb-24 pt-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="font-titulos text-4xl font-extrabold leading-tight tracking-tight text-texto sm:text-5xl lg:text-6xl">
            Viví experiencias
            <br />
            <span className="text-primario">que transforman</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-texto-secundario">
            Conectá con experiencias auténticas y multisensoriales cerca tuyo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/actividades"
              className="rounded-xl bg-primario px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-primario-dark"
            >
              Explorar actividades
            </Link>
            <Link
              href="/primeros-pasos"
              className="rounded-xl border border-gray-300 bg-white/80 px-8 py-3.5 font-semibold text-texto shadow-sm backdrop-blur transition hover:bg-white"
            >
              Primeros pasos
            </Link>
          </div>
        </div>
      </section>

      {/* Recomendadas */}
      {recomendadas.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-titulos text-2xl font-bold text-texto">
              Recomendadas
            </h2>
            <Link
              href="/actividades"
              className="text-sm font-medium text-primario transition hover:underline"
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
              href={'/actividades?categoria=' + encodeURIComponent(cat.titulo)}
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