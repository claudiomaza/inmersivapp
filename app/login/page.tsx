'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Mail, ArrowLeft, LogIn } from 'lucide-react'

type Paso = 'email' | 'codigo'

export default function LoginPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [reenviando, setReenviando] = useState(false)

  const enviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setCargando(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    setCargando(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Código enviado a tu email ✉️')
    setPaso('codigo')
  }

  const verificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codigo.length < 6) return
    setCargando(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    })

    setCargando(false)
    if (error) {
      toast.error('Código incorrecto o vencido')
      return
    }

    toast.success('¡Bienvenido de vuelta!')
    router.push('/actividades')
    router.refresh()
  }

  const reenviar = async () => {
    setReenviando(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setReenviando(false)
    toast.success('Código reenviado')
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="font-titulos text-3xl font-bold text-primario">
        {paso === 'email' ? 'Iniciar sesión' : 'Ingresá el código'}
      </h1>
      <p className="mt-2 text-texto-secundario">
        {paso === 'email'
          ? 'Te enviamos un código a tu correo electrónico.'
          : `Enviamos un código a ${email}`}
      </p>

      {paso === 'email' ? (
        <form onSubmit={enviarCodigo} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="tu@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={cargando || !email}
            className="flex items-center justify-center gap-2 rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {cargando ? 'Enviando…' : 'Enviar código'}
          </button>
          <p className="text-center text-sm text-texto-secundario">
            ¿No tenés cuenta?{' '}
            <a href="/registro" className="font-medium text-primario hover:underline">
              Registrate
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={verificarCodigo} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">
              Código de verificación
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-2xl font-mono tracking-[0.5em] focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            <p className="mt-1 text-xs text-texto-secundario">Código de 6 dígitos</p>
          </div>
          <button
            type="submit"
            disabled={cargando || codigo.length < 6}
            className="flex items-center justify-center gap-2 rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {cargando ? 'Verificando…' : 'Ingresar'}
          </button>
          <button
            type="button"
            onClick={reenviar}
            disabled={reenviando}
            className="text-sm text-primario hover:underline disabled:opacity-50"
          >
            {reenviando ? 'Reenviando…' : 'Reenviar código'}
          </button>
          <button
            type="button"
            onClick={() => setPaso('email')}
            className="flex items-center justify-center gap-1.5 text-sm text-texto-secundario hover:text-texto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cambiar email
          </button>
        </form>
      )}
    </div>
  )
}