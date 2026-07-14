import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none' } }[]) {
          cookiesToSet.forEach(({ name, value }) => res.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas que requieren sesion
  if (!user) {
    const path = req.nextUrl.pathname
    if (path.startsWith('/perfil') || path.startsWith('/reservas') || path.startsWith('/admin') || path.startsWith('/actividades/nueva')) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/perfil/:path*', '/reservas/:path*', '/admin/:path*', '/actividades/nueva/:path*'],
}
