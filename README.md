# 🚀 Inmersivapp

**Experiencias que transforman.**

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=fff)](https://clerk.com)
[![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-009EE3?logo=mercadopago&logoColor=fff)](https://www.mercadopago.com.ar)
[![Tailwind v4](https://img.shields.io/badge/Tailwind%20v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel)](https://vercel.com)

> 🏁 **Producción:** [inmersivapp.vercel.app](https://inmersivapp.vercel.app)
>
> 📋 **Proyecto final — 3° año Desarrollo de Software**

---

## 📖 Descripción

Inmersivapp es un **marketplace de experiencias inmersivas y aprendizaje vivencial**. Conecta a anfitriones locales (artistas, guías, chefs, instructores) con participantes que buscan experiencias auténticas, hands-on, con carga cultural y narrativa.

A diferencia de una agenda de eventos tradicional, Inmersivapp opera bajo el concepto de **embodied cognition**: el aprendizaje ocurre a través del cuerpo y la experiencia directa, no solo de la observación.

### ¿Qué la hace única?

- **Selección curada** de experiencias con storytelling y carga cultural
- **Marketplace transaccional** con pagos integrados vía Mercado Pago
- **Sistema de cupones** para sponsors y comercios locales
- **Panel de anfitrión** con gestión de reservas y mensajería asincrónica
- **Modelo de comisión** (10%) que alinea los incentivos de la plataforma

---

## ✨ Funcionalidades

| Funcionalidad | Estado |
|---|---|
| Catálogo de actividades con búsqueda y filtros | ✅ |
| Fichas detalladas de experiencia | ✅ |
| Registro y autenticación (Clerk) | ✅ |
| Flujo de reserva y pago (Mercado Pago) | ✅ |
| Gestión de cupones de descuento | ✅ |
| Panel de anfitrión (dashboard) | ✅ |
| Panel de administración | ✅ |
| Mensajería asincrónica (anfitrión ↔ participante) | ✅ |
| Perfil de usuario con historial de reservas | ✅ |
| Página de primeros pasos para onboarding | ✅ |
| Notificaciones internas | ✅ |
| Diseño responsive mobile-first | ✅ |

---

## 🧱 Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, rutas, API Routes |
| **Lenguaje** | TypeScript | Tipado estático en toda la base |
| **UI** | Tailwind CSS v4 | Estilos utilitarios, responsive |
| **Autenticación** | Clerk | OAuth, sesiones, webhooks de sincronización |
| **Base de datos** | Supabase (PostgreSQL) | Perfiles, reservas, actividades, mensajes |
| **Pagos** | Mercado Pago SDK + Webhooks | Checkout, notificaciones de pago, cupones |
| **Hosting** | Vercel (Fluid Compute) | Deploy continuo, Edge Functions |
| **Íconos** | Lucide React | UI consistente |

### Arquitectura

```
inmersivapp/
├── app/                    # App Router (Next.js 15)
│   ├── actividades/        # Catálogo y fichas de experiencias
│   ├── admin/              # Panel de administración
│   ├── anfitrion/          # Dashboard del anfitrión
│   ├── api/                # API Routes + Webhooks
│   │   └── webhook/mercadopago/  # Webhook de pagos MP
│   ├── mensajes/           # Bandeja de mensajes asincrónicos
│   ├── notificaciones/     # Centro de notificaciones
│   ├── perfil/             # Perfil de usuario
│   ├── reservas/           # Gestión de reservas
│   └── sign-in/ & sign-up/ # Auth (Clerk)
├── components/             # Componentes reutilizables
├── hooks/                  # Custom hooks (React)
├── lib/                    # Lógica compartida (Supabase, MP)
├── supabase/               # Migraciones, seeds, RLS
│   ├── reset_completo.sql  # Esquema completo
│   └── poblar.sql          # Datos de ejemplo
└── types/                  # Tipos TypeScript
```

---

## ⚙️ Cómo empezar

### Requisitos

- Node.js 18+
- npm / bun / pnpm
- Una cuenta en [Clerk](https://clerk.com)
- Un proyecto en [Supabase](https://supabase.com)
- Credenciales de [Mercado Pago](https://www.mercadopago.com.ar/developers)

### Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/claudiomaza/inmersivapp.git
cd inmersivapp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Variables de entorno

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_SIGNING_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=
MP_ACCESS_TOKEN=
```

### Base de datos

```bash
# Ejecutar migraciones en tu proyecto Supabase
# El esquema completo está en supabase/reset_completo.sql
# Los datos de ejemplo están en supabase/poblar.sql
```

### Desarrollo

```bash
npm run dev
# Abrir http://localhost:3000
```

---

## 💰 Modelo de Negocio

Inmersivapp opera como un **marketplace de comisión**:

- **Comisión por reserva:** 10% del valor de la experiencia
- **Cupones de sponsor:** Descuentos subsidiados por marcas locales
- **Diferenciación:** Sin costo de suscripción para anfitriones ni participantes

El flujo de fondos:

```
Participante → Pago (100%) → Mercado Pago → Webhook → Liberación automática
                                                          ↓
                                            Anfitrión (90%) + Plataforma (10%)
```

---

## 🧪 Metodología y Desarrollo

El proyecto se desarrolló en **3 sprints de 4 semanas** bajo metodologías ágiles con seguimiento en JIRA:

| Sprint | Enfoque | Hitos |
|---|---|---|
| **Sprint 1** | Fundaciones | Esquema de DB, autenticación base, layout responsive |
| **Sprint 2** | Discovery | Catálogo, fichas, búsqueda, filtros, perfiles |
| **Sprint 3** | Transaccional | Pagos MP, webhooks, cupones, paneles, mensajería |

**166 commits** en main, evolución de prototipo a producto funcional en producción.

---

## 🔐 Seguridad

- **Autenticación:** Clerk (OAuth, sesiones seguras, MFA-ready)
- **Datos:** Supabase Row Level Security (RLS) — cada usuario accede solo a sus datos
- **Pagos:** Webhooks firmados con HMAC de Mercado Pago
- **API:** Next.js API Routes, sin exponer service keys al cliente
- **Secrets:** Variables de entorno en Vercel, `.env` en `.gitignore`

---

## 📈 Roadmap

- [ ] Geolocalización y mapa de actividades
- [ ] Notificaciones push (Service Worker)
- [ ] Valoraciones y reseñas de participantes
- [ ] Programa de referidos para anfitriones
- [ ] App mobile con Capacitor

---

## 👤 Autor

**Claudio Maza** · [@claudiomaza](https://github.com/claudiomaza)

[cm2labs](https://github.com/claudiomaza) — Desarrollo de software, automatización e IA.

---

## 📄 Licencia

Este proyecto forma parte del trabajo final de la carrera Desarrollo de Software — 3° año.