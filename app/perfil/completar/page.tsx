'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Star } from 'lucide-react'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

export default function CompletarPerfilPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [intereses, setIntereses] = useState<string[]>([])
  const [rol, setRol] = useState<'participante' | 'anfitrion'>('participante')
  const [cuil, setCuil] = useState('')
  const [aliasMp, setAliasMp] = useState('')

  const toggleInteres = (cat: string) => {
    setIntereses((prev) =>
      prev.includes(cat) ? prev.filter((i) => i !== cat) : [...prev, cat]
    )
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (rol === 'anfitrion') {
      if (!cuil.trim()) {
        toast.error('El CUIL es obligatorio para ser anfitrión')
        return
      }
      if (!aliasMp.trim()) {
        toast.error('El alias de Mercado Pago es obligatorio para ser anfitrión')
        return
      }
    }

    setCargando(true)

    const body: Record<string, any> = { intereses, roles: [rol] }
    if (rol === 'anfitrion') {
      body.cuil = cuil.trim()
      body.alias_mp = aliasMp.trim()
    }

    const res = await fetch('/api/perfiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setCargando(false)

    if (!res.ok) {
      toast.error('Error al guardar')
      return
    }

    toast.success('¡Perfil completado!')

    if (rol === 'anfitrion') {
      router.push('/actividades/nueva')
    } else {
      router.push('/actividades')
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <h1 className="font-titulos text-2xl font-bold text-texto">¡Bienvenido a Inmersivapp!</h1>
        <p className="mt-2 text-texto-secundario">
          Primero, decinos cómo querés participar
        </p>
      </div>

      <form onSubmit={guardar} className="mt-8">
        <label className="mb-3 block text-sm font-medium text-texto">
          ¿Qué rol querés tener?
        </label>
        <div className="mb-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRol('participante')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition ${
              rol === 'participante'
                ? 'border-primario bg-primario/5 text-primario'
                : 'border-gray-200 text-texto-secundario hover:border-gray-300'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="font-semibold">Participante</span>
            <span className="text-xs">Reservar y vivir experiencias</span>
          </button>
          <button
            type="button"
            onClick={() => setRol('anfitrion')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition ${
              rol === 'anfitrion'
                ? 'border-primario bg-primario/5 text-primario'
                : 'border-gray-200 text-texto-secundario hover:border-gray-300'
            }`}
          >
            <Star className="h-6 w-6" />
            <span className="font-semibold">Anfitrión</span>
            <span className="text-xs">Crear y publicar experiencias</span>
          </button>
        </div>

        <label className="mb-3 block text-sm font-medium text-texto">
          Seleccioná tus intereses
        </label>
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleInteres(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                intereses.includes(cat)
                  ? 'bg-primario text-white'
                  : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {rol === 'anfitrion' && (
          <div className="mb-8 rounded-xl border border-primario/20 bg-primario/5 p-4">
            <h3 className="font-titulos font-semibold text-texto">Datos de cobro</h3>
            <p className="mb-3 text-xs text-texto-secundario">
              El alias de Mercado Pago debe pertenecer al mismo titular que el CUIL registrado.
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">CUIL</label>
                <input
                  type="text"
                  value={cuil}
                  onChange={(e) => setCuil(e.target.value)}
                  placeholder="20-12345678-9"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-texto">Alias de Mercado Pago</label>
                <input
                  type="text"
                  value={aliasMp}
                  onChange={(e) => setAliasMp(e.target.value)}
                  placeholder="alias.mp"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-xl bg-primario py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          {cargando ? 'Guardando…' : 'Comenzá a explorar'}
        </button>
      </form>
    </div>
  )
}