# TaskMaster — Crediexpress Auto (Fases 1 y 2)

Fecha: 2025-08-22 (Actualizado)
Alcance: Implementación de Fase 1 (Fundación y Sitio Público, ajustada) y Fase 2 (Autenticación) según `Docs/Proyecto Crediauto.md`, cumpliendo estrictamente las reglas de `c:\Users\RodrigoMassardo\.codeium\windsurf\memories\global_rules.md` y la guía maestro `Docs/Guia UI-UX.md`.
Stack objetivo: Next.js 15 + Node.js + MySQL (contemplar Prisma) + Strapi.

---

## Reglas de Oro (Gates obligatorios)

- [x] Context7 MCP: Antes de escribir código, consultar mejores prácticas actuales y anotar hallazgos. Frase de control en PR/commits: "Consultando las mejores prácticas actuales...".
- [x] Cumplimiento de `c:\Users\RodrigoMassardo\.codeium\windsurf\memories\global_rules.md` en comunicación, flujo de trabajo y entregables.
- [x] Diseño/UI: Ninguna decisión/implementación sin validar y trazar a `Docs/Guia UI-UX.md` (tokens, componentes, A11y, rutas). Prohibido hardcodear colores/tamaños.
- [x] Desktop Commander/automatización: usar herramientas MCP para crear/verificar estructura, instalaciones y backups antes de cambios grandes.
- [ ] Seguridad básica habilitada desde el inicio (Helmet, CORS restrictivo, validación inputs, logs).
- [x] Documentación viva: registrar decisiones en `README.md` y checklist de DoD.

> Nota: Según lineamiento interno, la calculadora pública se EXCLUYE de Fase 1. La calculadora avanza recién en Portal (post-registro) en Fase 3.

---

## Fase 1 — Fundación y Sitio Público (ajustada)

Objetivo: Base de backend + frontend público sin calculadora, CMS conectado, performance y A11y altos.

### 1) Preparación y estructura
- [x] Context7: verificar compatibilidad Next.js 15 (App Router), Node LTS, Prisma + MySQL, Strapi.
- [ ] Monorepo según `Docs/Guia UI-UX.md` (apps/web, packages/ui|config|testing).
- [x] Configurar linting, Prettier, Husky (pre-commit: typecheck, lint, test).
- [ ] `.env.example` para web, api y CMS. `.env.local` ignorado.
- [x] README inicial con comandos y decisiones.

### 2) Backend inicial (Node.js + MySQL)
- [x] Elegir framework (Next.js API Routes elegido por simplicidad y unificación del stack).
- [x] Conexión MySQL y ORM (Prisma configurado). 
- [x] Migraciones iniciales: esquema base configurado en `prisma/schema.prisma`.
- [x] Endpoints públicos mínimos: `/api/health` implementado con validación DB.
- [ ] Logs estructurados (pino) y manejo de errores centralizado.
- [ ] Validación de entradas (Zod) y CORS restrictivo.

### 3) CMS (Strapi)
- [ ] Docker compose para Strapi local.
- [ ] Collections: `pages`, `banners`, `faq`, `testimonios` (según `Docs/Guia UI-UX.md` §13).
- [ ] Poblado de contenido base (Home, Cómo funciona, Requisitos, FAQ).
- [ ] Publicación de API REST y llaves seguras en `.env`.

### 4) Frontend público (Next.js 15 + TS)
- [x] Configurar Tailwind + shadcn/ui + tokens desde `Docs/Guia UI-UX.md` (sin hardcode).
- [x] Rutas públicas: `/` (Hero + CTA) implementada con diseño profesional.
- [ ] Rutas adicionales: `/como-funciona`, `/requisitos`, `/faq`, `portal/login`.
- [ ] Consumo de CMS para textos/medios (actualmente hardcodeado, pendiente CMS).
- [x] Estados de carga, vacíos y error accesibles (A11y: aria-live, foco visible).

### 5) Performance, A11y y DX
- [x] Imágenes optimizadas (`next/image` con `priority`, `sizes` configurado).
- [x] SEO completo: metadata, Open Graph, Twitter cards, robots (es_AR).
- [x] Accesibilidad A11y: roles semánticos, ARIA labels, navegación estructurada.
- [x] Linting: 0 errores, TypeScript estricto, imports optimizados.
- [ ] Medir Lighthouse (mobile/desktop) > 90 en todas.
- [ ] Core Web Vitals en verde; TTFB/INP monitoreados.

### 6) Criterios de aceptación Fase 1
- [x] Sitio responsive y accesible (WCAG 2.1 AA base) conforme a `Docs/Guia UI-UX.md`.
- [ ] Contenido editable desde Strapi (pendiente implementación CMS).
- [ ] Tiempo de carga < 3 s (home en conexiones típicas ARG) - pendiente medición.
- [x] Sin calculadora pública; CTA hacia portal/login implementado.

---

## Fase 2 — Sistema de Autenticación (Dealers)

Objetivo: Registro con aprobación manual, login con JWT + refresh, recuperación de contraseña y roles.

### 1) Backend (Auth)
- [ ] Context7: revisar mejores prácticas JWT + refresh y almacenamiento seguro en cookies/headers.
- [ ] Registro de dealers con aprobación manual:
  - Formulario: firstName, lastName, email (minúsculas), phone, tradeName (agencia), city, province.
  - Al registrarse: `dealers.status = PENDING_APPROVAL`, `users.status = PENDING`, `passwordHash = NULL`.
  - Al aprobar: `dealers.status = APPROVED`, emitir invitación (token de set password) → `users.status = INVITED` → usuario crea contraseña → `users.status = ACTIVE`.
  - Si se rechaza: `dealers.status = REJECTED` y enviar email de notificación; registrar en `audit_log`.
  - Email único global (no se permite reutilizar en varios dealers).
- [ ] Hash de contraseñas (bcrypt), políticas de complejidad y bloqueo por intentos (rate limit/bruteforce protection).
- [ ] Emisión de `access_token` (corto) + `refresh_token` (24h) y rotación segura.
- [ ] Middleware de autorización por roles (`dealer`, `admin`).
- [ ] Emails de invitación (set password) y reset (provider a definir; mail dev en local).
- [ ] Tests unitarios/integración para flujos críticos (registro, login, refresh, reset).

### 2) Frontend (Auth UI)
- [ ] Validar diseños y componentes contra `Docs/Guia UI-UX.md` (formularios con Zod + RHF).
- [ ] Pantallas: registro (validación en tiempo real), login ("recordarme"), recuperación de contraseña.
- [ ] Manejo de sesión y persistencia segura (cookies httpOnly o estrategia acordada).
- [ ] Mensajes de error claros y accesibles.

### 3) Criterios de aceptación Fase 2
- [ ] Login seguro con tokens válidos 24h y rotación de refresh.
- [ ] Emails de confirmación/reset enviados correctamente.
- [ ] Mitigaciones OWASP: SQLi, XSS, CSRF, bruteforce.

---

## Checklist Global de Seguridad y QA

- [ ] Helmet.js activo, CORS restrictivo, sanitización/validación inputs.
- [ ] Auditoría de dependencias y actualizaciones.
- [ ] Unit tests (≥80% en dominios críticos), E2E básicos (Playwright) para flujos auth y navegación pública.
- [ ] Logs y trazabilidad de errores; alertas básicas.

---

## Entregables por Fase

- F1: ✅ **PARCIALMENTE COMPLETADA** - Web pública profesional + API health + Prisma + shadcn/ui + SEO/A11y completos. **Pendiente**: CMS Strapi, rutas adicionales, medición Lighthouse.
- F2: Auth backend + pantallas auth + emails + pruebas + documentación de seguridad.

---

## Referencias

- Proyecto: `Docs/Proyecto Crediauto.md`
- Guía de diseño (obligatoria): `Docs/Guia UI-UX.md`
- Reglas globales (obligatorias): `c:\Users\RodrigoMassardo\.codeium\windsurf\memories\global_rules.md`
