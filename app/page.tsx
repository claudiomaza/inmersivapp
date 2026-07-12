import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
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
        <Link
          href="/registro"
          className="rounded-xl border-2 border-primario px-8 py-3 text-lg font-semibold text-primario transition hover:bg-primario hover:text-white"
        >
          Crear cuenta
        </Link>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
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
    </div>
  )
}