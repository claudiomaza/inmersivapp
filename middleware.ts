import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/perfil(.*)',
  '/reservas(.*)',
  '/admin(.*)',
  '/actividades/nueva(.*)',
  '/mensajes(.*)',
  '/notificaciones(.*)',
])

const isPublicRoute = createRouteMatcher([
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return // skip auth for webhooks
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}