import { SignIn } from '@clerk/nextjs'
import { LayoutDashboard } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-primario">
        <LayoutDashboard className="h-8 w-8" />
        Inmersivapp
      </div>
      <p className="mb-6 text-center text-texto-secundario">
        Ingresá para descubrir experiencias únicas
      </p>
      <SignIn
        appearance={{
          elements: {
            socialButtons: { display: 'none' },
            dividerRow: { display: 'none' },
          },
        }}
      />
    </div>
  )
}
