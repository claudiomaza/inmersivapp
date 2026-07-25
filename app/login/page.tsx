import { SignIn } from '@clerk/nextjs'
import { LayoutDashboard } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primario/10">
          <LayoutDashboard className="h-8 w-8 text-primario" />
        </div>
        <h1 className="font-titulos text-2xl font-bold text-texto">Inmersivapp</h1>
        <p className="mt-1 text-sm text-texto-secundario">
          Ingresá para descubrir experiencias únicas
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-sm',
            card: 'shadow-none border border-gray-200 rounded-xl',
            headerTitle: 'font-titulos text-xl text-texto',
            headerSubtitle: 'text-texto-secundario',
            formButtonPrimary:
              'bg-primario hover:bg-primario-dark text-white rounded-lg font-semibold',
            formFieldInput:
              'rounded-lg border-gray-300 focus:border-primario focus:ring-primario/20',
            footerActionLink: 'text-primario hover:text-primario-dark',
            dividerLine: 'bg-gray-200',
            socialButtonsBlockButton:
              'border border-gray-200 rounded-lg hover:bg-gray-50',
          },
        }}
        signUpUrl="/registro"
      />
    </div>
  )
}