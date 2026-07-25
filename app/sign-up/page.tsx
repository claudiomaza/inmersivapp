import { SignUp } from '@clerk/nextjs'
import { UserPlus } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-primario">
        <UserPlus className="h-8 w-8" />
        Creá tu cuenta
      </div>
      <p className="mb-6 text-center text-texto-secundario">
        Unite a la comunidad de experiencias unicas
      </p>
      <SignUp
        appearance={{
          elements: {
            socialButtons: 'hidden',
            dividerRow: 'hidden',
          },
        }}
        afterSignInUrl="/"
        afterSignUpUrl="/perfil/completar"
      />
    </div>
  )
}
