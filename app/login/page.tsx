'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message)
      setCargando(false)
      return
    }
    router.push('/actividades')
    router.refresh()
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="font-titulos text-3xl font-bold text-primario">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-texto-secundario">
        Ingresá con tu cuenta para reservar actividades.
      </p>

      <form onSubmit={iniciarSesion} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-texto">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="text-center text-sm text-texto-secundario">
          ¿No tenés cuenta?{' '}
          <a href="/registro" className="font-medium text-primario hover:underline">
            Registrate
          </a>
        </p>
      </form>
    </div>
  )
}