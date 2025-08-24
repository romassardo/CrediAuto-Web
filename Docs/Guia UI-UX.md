# Crediexpress Auto — Prompt Maestro para Agente de Código (UI/UX → Código)

---

## 0) Modo de trabajo (obligatorio)
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript 5 + Tailwind CSS + shadcn/ui + Zustand + Zod + React Hook Form + Playwright + Jest + Storybook.
- **Estilo:** implementar **Design Tokens** y **componentes** exactamente como la guía. Nada de colores o tamaños hardcodeados.
- **Arquitectura:** CSR/SSR híbrido. Simulador SSR para primer paint + hydrate. Portal con cache por ruta.
- **A11y:** WCAG 2.1 AA, navegación por teclado, `aria-*` y foco visible.
- **i18n:** `es-AR` por defecto; numerales con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`.
- **Rendimiento:** LCP < 2.5 s, INP < 200 ms, CLS < 0.1. Imágenes WebP/AVIF, `next/image` con `sizes` y `priority` cuando corresponda.
- **QA:** cada componente con Story, pruebas unitarias, y flujos E2E clave.

---

## 1) Monorepo / Estructura inicial
```
apps/
  web/              # sitio público + portal (Next.js)
packages/
  ui/               # design system (tokens + componentes)
  config/           # contratos de datos, zod schemas, utilidades comunes
  testing/          # helpers de test (msw, fixtures)
```

**Web (Next):**
```
app/
  (public)/
    layout.tsx
    page.tsx                     # Home
    simulador/page.tsx
    solicitud/
      layout.tsx
      paso-1/page.tsx            # Datos personales
      paso-2/page.tsx            # Vehículo
      paso-3/page.tsx            # Documentación
      confirmacion/page.tsx
  (portal)/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    solicitudes/
      page.tsx                   # Tabla
      nueva/page.tsx             # Wizard B2B
    soporte/page.tsx
  api/                           # rutas mock de API para dev
  globals.css
```

---

## 2) Design Tokens (CSS Variables + Tailwind)
**`packages/ui/styles/tokens.css`**
```css
:root{
  --color-bg:#FFFFFF; --color-surface:#F5F7FA; --color-text:#333333;
  --brand-primary-600:#0B4FA9; --brand-primary-700:#09438F; --brand-accent-500:#FFC20E;
  --state-success-500:#00A859; --state-warning-500:#FF6B35; --state-error-500:#E53935;
  --border-200:#E6EAF0; --shadow:0 8px 24px rgba(15,23,42,.12);
  --radius-8:8px; --radius-12:12px;
}
@media (prefers-color-scheme: dark){
  :root{ --color-bg:#0B1220; --color-surface:#111827; --color-text:#E5E7EB; --border-200:#273248; }
}
```

**`tailwind.config.ts`** (extracto)
```ts
theme:{
  extend:{
    colors:{ bg:"var(--color-bg)", surface:"var(--color-surface)", text:"var(--color-text)",
      brand:{ primary:{600:"var(--brand-primary-600)",700:"var(--brand-primary-700)"}, accent:{500:"var(--brand-accent-500)"}},
      state:{ success:{500:"var(--state-success-500)"}, warning:{500:"var(--state-warning-500)"}, error:{500:"var(--state-error-500)"}},
      border:{200:"var(--border-200)"}
    },
    borderRadius:{ md:"var(--radius-8)", lg:"var(--radius-12)"},
    boxShadow:{ card:"var(--shadow)"},
    container:{ center:true, screens:{ lg:"1200px" } }
  }
}
```

---

## 3) Tipografía & Escalas
- **Fuente:** Inter o Montserrat (import via `next/font`).
- **Escala:** H1 2.25rem, H2 1.75rem, H3 1.375rem, Body 1rem, Caption 0.875rem.
- **Line-height:** 1.4. Ancho de párrafo ≤ 80 caracteres.

---

## 4) Componentes del Design System (packages/ui)
Cada componente debe exportarse con: `Props`, variantes, `disabled/loading`, estados de error, accesibilidad y Storybook.

1. **Button** (`variant: primary|secondary|tertiary|danger|link; size: sm|md|lg; icon?:left|right`).
2. **Input** (`type:text|email|number`, `mask?:dni|cuit|patente|vin|ars`), helper/error.
3. **Select/Combobox** (búsqueda, teclado, `onChange` controlado).
4. **Slider** (monto/plazo, `min|max|step`, tooltip con valor, teclado `Home/End`).
5. **Datepicker** (bloqueo de fechas inválidas, navegación por teclado y lector de pantalla).
6. **Upload** (drag&drop, validación por tamaño/tipo, progreso, estados `cargado|en_revision|observado|aprobado|rechazado`).
7. **Alert** (`info|success|warning|error`, dismissible, `aria-live`).
8. **Card** (header|content|footer; sombra `shadow-card`).
9. **DataTable** (sort, filtro, paginación, selección múltiple, `<th scope>` correcto).
10. **Stepper/Progress** (pasos con títulos cortos, persistencia de estado).
11. **Modal/Drawer** (trampa de foco, cerrar con `Esc`, devolver foco al invocador).
12. **Skeleton** (listas, tarjetas, tablas). Empty States con CTA.

> **Nota:** mapear a shadcn/ui donde aplique y extender con tokens.

---

## 5) Rutas y Vistas (sitio público)
### `/` Home
- **Hero**: H1 + subtítulo + Button primary “Simulá tu crédito” + imagen.
- **Calculadora rápida**: Slider (monto y plazo) → calcula **cuota estimada**, TNA/TEA/CFT.
- **Cómo funciona**: 3–4 tarjetas.
- **Beneficios/Testimonios**: tarjetas + logos de concesionarios.
- **CTA final**.

### `/simulador`
- Controles arriba; resultado sticky con **cuota**, **TNA/TEA/CFT** y **tabla de amortización (resumen)**.
- CTA “Continuar con preaprobación”.

### `/solicitud/*` (multi‑paso)
1. **Paso 1 – Datos personales**: DNI, CUIL/CUIT (con verificador), domicilio, ingresos. Máscaras.
2. **Paso 2 – Vehículo**: marca, modelo, año, VIN, patente, valuación.
3. **Paso 3 – Documentación**: DNI frente/dorso, recibos, presupuesto. Validación tamaño/tipo.
4. **Confirmación**: resumen + aceptación legal + número de trámite.

---

## 6) Portal de Concesionarios (B2B)
### `/portal/login`
- Login con email + 2FA opcional. Estados de error claros.

### `/portal/dashboard`
- KPIs: enviadas/aprobadas/rechazadas, gráfico simple.

### `/portal/solicitudes`
- Tabla con filtros avanzados (estado, fecha, agencia), sort, paginación. Acciones masivas (enviar/retirar).

### `/portal/solicitudes/nueva`
- Wizard: datos cliente, vehículo, condiciones, documentación, revisión.
- **Calculadora B2B** con plantillas por marca/modelo; exportar PDF de simulación.

### `/portal/soporte`
- FAQs + enlaces a tutoriales. Bot de ayuda/handoff a humano.

---

## 7) Validaciones & Máscaras (Zod + RHF)
- **DNI:** `z.string().regex(/^\d{8}$/)`.
- **CUIT/CUIL:** formato `XX-XXXXXXXX-X` y dígito verificador (función util `validateCUIT`).
- **Teléfono:** normalizar a `+54 9 AA BBBB-BBBB` (permití variantes).
- **Patente:** MERCOSUR `^[A-Z]{2}\s?\d{3}\s?[A-Z]{2}$` o viejo `^[A-Z]{3}\s?\d{3}$`.
- **VIN:** 17 chars alfanuméricos.
- **ARS:** parseo robusto a número (`1.234.567,89`).

Mensajes de error: **título breve + acción** (ej.: “CUIT inválido. Revisá el formato XX‑XXXXXXXX‑X”).

---

## 8) Parámetros de negocio (defaults configurables)
- **Autos:** 0–15 años, hasta **70%** del valor, **6–48** cuotas.
- **Motos:** 0–2 años, hasta **50%**, **6–24** cuotas.
- Estos límites viven en `packages/config/business.ts` y se referencian en UI.

---

## 9) Transparencia financiera (UI)
- Siempre mostrar **TNA, TEA y CFT** con ejemplo de cálculo.
- Tabla de amortización resumida (primeras 3 y últimas 3 cuotas) + descarga PDF.

---

## 10) Accesibilidad
- Contraste mínimo 4.5:1 (no usar amarillo como texto sobre blanco).
- Tamaño táctil mínimo 44×44 px.
- Focus visible (`outline-offset:2px`).
- `aria-live` para validaciones y banners.

---

## 11) Performance & DX
- Código dividido por rutas, `React.lazy` en módulos pesados.
- `useTransition`/`Suspense` para formas no críticas.
- Imágenes responsive, `preconnect` a fuentes/CDN.
- Linting + Prettier + Husky (pre-commit con `typecheck`, `lint`, `test`).

---

## 12) API Contracts (stubs para dev)
**`/api/simular` (POST)**
```json
{ "monto": 4500000, "plazo": 36, "tipo": "auto", "porcentajeFinanciacion": 70 }
```
**Respuesta**
```json
{ "cuota": 185000, "tna": 70.5, "tea": 100.2, "cft": 118.4, "tabla": [ {"n":1, "capital":..., "interes":..., "cuota":...} ] }
```

**`/api/solicitudes` (POST)** → crea solicitud y devuelve `id` y `estado`.
**`/api/upload` (POST)** → carga documentales con estado inicial `en_revision`.

> En producción, reemplazar por endpoints reales. Mantener tipos en `packages/config/contracts.ts`.

---

## 13) CMS
- **Opción recomendada:** Strapi/Directus dockerizado. Collections: `pages`, `banners`, `faq`, `testimonios`.
- El frontend consume vía REST/GraphQL. No hardcodear textos.

---

## 14) Observabilidad & Métricas
- Eventos: `simulacion_realizada`, `precotizacion_enviada`, `solicitud_enviada`, `doc_subida`, `solicitud_aprobada`.
- Enviar a analytics (ej. PostHog/GA4). Asegurar consentimiento de cookies.

---

## 15) QA – Definition of Done
- Storybook con controles para todas las variantes.
- Tests: ≥80% statements en `packages/ui`.
- E2E Playwright:
  1) Simulación completa → CTA preaprobación.
  2) Solicitud multi‑paso con cargas de archivos y validaciones.
  3) Portal: login, crear solicitud, filtrar tabla, exportar PDF.
- Lighthouse (mobile): Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

---

## 16) Tareas Sprint 1 (Días 1–3)
1. Configurar monorepo, Tailwind, tokens, `next/font` y shadcn/ui.
2. Implementar **Button**, **Input**, **Select**, **Slider**, **Alert**, **Card** con Stories.
3. Home + Calculadora rápida funcional (stubs de `/api/simular`).

## 17) Tareas Sprint 2 (Días 4–6)
1. Simulador completo con tabla de amortización y export PDF.
2. Flujo `/solicitud` paso 1–3 con Zod + RHF + Upload.
3. Confirmación + número de trámite + email mock.

## 18) Tareas Sprint 3 (Días 7–9)
1. Portal login, dashboard KPIs, tabla con filtros.
2. Wizard B2B “nueva solicitud”.
3. Soporte/FAQs consumiendo CMS.

## 19) Tareas Sprint 4 (Días 10–12)
1. A11y, dark mode, micro‑interacciones (120–240 ms), skeletons.
2. E2E Playwright + observabilidad + cookies banner.
3. Ajustes de performance y Lighthouse ≥ 90 mobile.

---

## 20) Snippets de ejemplo
**Máscara ARS (entrada a número):**
```ts
export function parseARS(v:string){
  return Number(v.replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,''));
}
```

**Validación CUIT (dígito verificador):**
```ts
export function validateCUIT(cuit:string){
  const digits=cuit.replace(/[^0-9]/g,''); if(digits.length!==11) return false;
  const mult=[5,4,3,2,7,6,5,4,3,2];
  const sum=mult.reduce((a,m,i)=>a+m*Number(digits[i]),0);
  const dv=(11-(sum%11))%11; return dv===Number(digits[10]);
}
```

---

## 21) Copys base (es‑AR)
- **Hero:** “Financiá tu próximo auto de forma simple y rápida.”
- **CTA:** “Simulá tu crédito”.
- **Éxito:** “¡Listo! Recibimos tu solicitud. Te avisamos por correo cuando esté aprobada.”
- **Advertencia:** “Tenés documentación pendiente. Subila para continuar.”

---

## 22) Entregables esperados
- Repositorio con `apps/web` y `packages/ui|config|testing`.
- Storybook publicado (Chromatic/Static) + reporte Lighthouse.
- Rutas públicas y portal funcionales con stubs.
- Documentación `README.md` con comandos, variables `.env` y decisiones.

> **Mantra:** *Sin fricción. Sin sorpresas. Con transparencia.*

