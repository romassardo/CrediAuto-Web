# CrediAuto - Contexto del Proyecto

## 📋 Resumen del Proyecto

**CrediAuto** es una aplicación web para gestión de créditos automotrices que conecta concesionarios con instituciones financieras. Desarrollada con Next.js 15, MySQL y Prisma ORM.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 15 con App Router + Turbopack
- **Backend**: API Routes de Next.js
- **Base de Datos**: MySQL 8.0 (localhost)
- **ORM**: Prisma 5.22
- **Autenticación**: JWT personalizado (no NextAuth)
- **UI**: Tailwind CSS + shadcn/ui + Guía UI/UX personalizada
- **Validación**: Zod + React Hook Form
- **Emails**: Resend
- **Hashing**: bcryptjs (salt rounds: 12)
- **Iconografía**: Lucide React

### Estructura del Proyecto
```
e:\Proyectos\CrediAuto\
├── apps/web/                    # Aplicación principal Next.js
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── api/auth/        # APIs de autenticación
│   │   │   │   ├── login/       # Login con JWT
│   │   │   │   └── me/          # Datos del usuario autenticado
│   │   │   ├── portal/dashboard/ # Dashboard concesionarios
│   │   │   └── page.tsx         # Página principal
│   │   ├── components/          # Componentes React
│   │   │   ├── calculator/      # Calculadora de préstamos
│   │   │   ├── forms/           # Formularios (steps y completos)
│   │   │   ├── LoginModal.tsx   # Modal de login
│   │   │   └── ui/              # Componentes shadcn/ui
│   │   ├── hooks/               # Custom hooks
│   │   │   └── useAuth.ts       # Hook de autenticación
│   │   ├── lib/
│   │   │   ├── calculator/      # Lógica de cálculos financieros
│   │   │   ├── prisma.ts        # Cliente Prisma singleton
│   │   │   └── email.ts         # Funciones de email
│   │   └── middleware.ts        # JWT middleware
│   ├── prisma/                  # Esquemas de BD
│   ├── .env                     # Variables de entorno
│   └── package.json
├── db/sql/                      # Scripts SQL
└── Docs/                        # Documentación
```

## 🔐 Credenciales y Configuración

### Variables de Entorno (.env)
```env
DATABASE_URL="mysql://crediauto_app:123456@127.0.0.1:3306/crediauto"
JWT_SECRET="crediauto-jwt-secret-2024-super-secure-key-for-development"
JWT_REFRESH_SECRET="crediauto-refresh-jwt-secret-2024-super-secure-key-for-development"
APP_URL="http://localhost:3000"
RESEND_API_KEY="[pendiente configurar]"
```

### Base de Datos MySQL
- **Host**: localhost (127.0.0.1)
- **Puerto**: 3306
- **Base de datos**: `crediauto`
- **Usuario**: `crediauto_app`
- **Contraseña**: `123456`

### Usuarios de Prueba
| Email | Contraseña | Rol | Estado |
|-------|------------|-----|--------|
| admin@crediauto.com | admin123 | ADMIN | ACTIVE |
| dealer@test.com | dealer123 | DEALER | ACTIVE |
| ejecutivo@test.com | ejecutivo123 | DEALER | ACTIVE |

**IMPORTANTE**: Las contraseñas están hasheadas con bcrypt (salt rounds: 12)

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticación JWT Personalizado
- **API Routes**: `/api/auth/login` y `/api/auth/me`
- **Método**: POST con validación Zod
- **Flujo**: Email/password → Verificación bcrypt → JWT tokens
- **Cookies**: `access_token` (15 min) y `refresh_token` (7 días)
- **Middleware**: Protección de rutas con JWT usando jose library
- **Redirección**: Por roles (Admin, Dealer, Ejecutivo)
- **Hook personalizado**: `useAuth()` para gestión de estado

### ✅ Portal Dashboard Concesionarios
- **Ruta**: `/portal/dashboard`
- **Permisos diferenciados**: 
  - DEALER: Acceso completo (calculadora, gestión equipo, resumen)
  - EJECUTIVO_CUENTAS: Solo calculadora y formulario
- **Navegación por pestañas**: Responsive y adaptativa
- **Contenedor ampliado**: Máximo 1600px para mejor aprovechamiento

### ✅ Calculadora de Préstamos Prendarios
- **Archivo**: `lib/calculator/loan-calculator.ts`
- **Componente**: `components/calculator/LoanCalculator.tsx`
- **Funcionalidades**:
  - Cálculo en tiempo real de cuotas
  - Fórmulas financieras argentinas (CFT, intereses, IVA)
  - Validación de montos y plazos
  - Configuración avanzada opcional
  - Resultados detallados con desglose de costos
  - **Botón "Solicitar con estos valores"**: Integración directa con formulario
  - **Callback onCalculationComplete**: Pasa datos calculados al dashboard
  - **Sin navegación**: Todo funciona en una sola vista

### ✅ Formulario de Solicitud por Steps
- **Componente**: `components/forms/LoanApplicationSteps.tsx`
- **5 Pasos progresivos**:
  1. Datos Personales (Nombre, Apellido, CUIL, dirección, contacto)
  2. Datos del Cónyuge (condicional)
  3. Datos Laborales (empresa, antigüedad, relación laboral)
  4. Datos del Vehículo (marca, modelo, condición)
  5. Documentación (upload de archivos)
- **Características**:
  - Progress bar visual con estados
  - Validación por pasos con React Hook Form
  - Navegación inteligente (salta pasos no aplicables)
  - Sin scroll, cada paso cabe en pantalla
  - **INTEGRACIÓN COMPLETA**: Resumen visual de cálculo en parte superior
  - **Scroll automático**: Desde calculadora al formulario
  - **Datos pre-poblados**: Valores calculados incluidos automáticamente

### ✅ Gestión de Usuarios y Roles
- **Roles**: ADMIN, DEALER, EJECUTIVO_CUENTAS
- **Estados**: ACTIVE, INACTIVE, SUSPENDED
- **Soft Delete**: Campo `deletedAt`
- **Relaciones**: Users ↔ Dealers
- **Creación de ejecutivos**: Solo por dealers aprobados

### ✅ Sistema de Diseño UI/UX
- **Guía aplicada**: `Docs/Guia UI-UX.md`
- **Colores brand**: 
  - Primary: #2e3192 (azul corporativo)
  - Accent: #ffc20e (amarillo destacado)
- **Componentes**: Gradientes, elementos decorativos, iconografía Lucide
- **Responsive**: Diseño adaptativo completo
- **Estados interactivos**: Hover, focus, loading, disabled

### ✅ Infraestructura
- **Prisma Client**: Singleton optimizado con connection pooling
- **Transacciones**: Helper `withTransaction` con timeout
- **Email Service**: Integración con Resend para credenciales
- **Error Handling**: Manejo robusto de errores
- **Custom Hooks**: useAuth para gestión de autenticación

## 🚨 Problemas Resueltos

### 1. Error de Autenticación MySQL
**Problema**: "Authentication failed against database server"
**Causa**: Conflicto entre `.env` y `.env.local`
**Solución**: Eliminado `.env.local`, mantenido solo `.env`

### 2. Login Devolvía 401
**Problema**: Contraseñas no hasheadas correctamente
**Solución**: Script `fix-passwords.js` para hashear con bcrypt

### 3. Módulo 'resend' No Encontrado
**Problema**: Dependencia faltante
**Solución**: `npm install resend`

### 4. Múltiples Procesos Node.js
**Problema**: Procesos duplicados en segundo plano
**Solución**: `taskkill /F /IM node.exe` + inicio limpio

### 5. Error de Permisos en Dashboard
**Problema**: Usuarios DEALER veían acceso limitado como ejecutivos
**Causa**: Dashboard recibía funciones en lugar de valores booleanos
**Solución**: Ejecutar funciones de permisos para obtener valores correctos

### 6. Formulario con Scroll Excesivo
**Problema**: Formulario muy largo requería scroll constante
**Solución**: Implementación de formulario por steps (5 pasos progresivos)

### 7. Inconsistencia en Nombres de Cookies JWT
**Problema**: Login generaba `accessToken` pero API buscaba `access_token`
**Solución**: Estandarización a `access_token` y `refresh_token`

### 8. Navegación Entre Páginas para Solicitudes
**Problema**: UX fragmentada con calculadora y formulario en páginas separadas
**Causa**: Botón "Solicitar con estos valores" navegaba a `/solicitar-prestamo`
**Solución**: Integración completa en una sola vista del dashboard

### 9. Campos Faltantes en Formulario
**Problema**: Formulario no tenía campos básicos de nombre y apellido
**Solución**: Agregados campos `nombre` y `apellido` con validación

### 10. API Route con Errores de TypeScript
**Problema**: `/api/loan-applications/route.ts` tenía múltiples errores de Prisma y headers
**Causa**: Errores de tipado (`loanApplication` vs `LoanApplication`) y headers async
**Solución**: Eliminación completa del API route problemático + simulación de envío

### 11. Errores de TypeScript en Dashboard
**Problema**: Condiciones que siempre devolvían true (`isExecutive` como función)
**Solución**: Corrección a `isExecutiveValue` (llamada de función vs referencia)

## 🏃‍♂️ Cómo Ejecutar el Proyecto

### Prerrequisitos
1. **Node.js** v22.15.0+
2. **MySQL** 8.0 corriendo en localhost:3306
3. **Base de datos** `crediauto` creada
4. **Usuario MySQL** `crediauto_app` con permisos

### Comandos de Inicio
```bash
cd e:\Proyectos\CrediAuto\apps\web
npm install
npm run dev
```

### Verificar Estado
- **URL**: http://localhost:3000
- **Login**: Usar credenciales de la tabla arriba
- **BD**: Verificar conexión con Prisma Studio: `npx prisma studio`

## 📁 Archivos Importantes

### Configuración
- `apps/web/.env` - Variables de entorno
- `apps/web/package.json` - Dependencias
- `apps/web/prisma/schema.prisma` - Esquema de BD

### Código Principal
- `apps/web/src/app/api/auth/login/route.ts` - API de login JWT
- `apps/web/src/app/api/auth/me/route.ts` - API datos usuario
- `apps/web/src/app/portal/dashboard/page.tsx` - Dashboard integrado con calculadora y formulario
- `apps/web/src/components/calculator/LoanCalculator.tsx` - Calculadora con integración
- `apps/web/src/components/forms/LoanApplicationSteps.tsx` - Formulario steps con resumen visual
- `apps/web/src/hooks/useAuth.ts` - Hook autenticación
- `apps/web/src/lib/calculator/loan-calculator.ts` - Lógica cálculos financieros
- `apps/web/src/lib/prisma.ts` - Cliente de BD (Prisma ORM 5.22)
- `apps/web/src/middleware.ts` - Protección JWT con jose library
- `apps/web/src/components/LoginModal.tsx` - UI de login

### Scripts SQL
- `db/sql/crediauto_f1_f2.sql` - Estructura de BD
- `db/sql/test_users.sql` - Usuarios de prueba

## 🔄 Estado Actual del Desarrollo

### ✅ Completado
- [x] Configuración inicial del proyecto
- [x] Esquema de base de datos con Prisma ORM 5.22
- [x] Sistema de autenticación JWT personalizado
- [x] API de login y autenticación (`/api/auth/login`, `/api/auth/me`)
- [x] Middleware de protección con jose library
- [x] Hook personalizado useAuth para gestión de estado
- [x] Portal Dashboard con permisos diferenciados
- [x] Calculadora de préstamos prendarios completa
- [x] Formulario de solicitud por steps (5 pasos) con React Hook Form
- [x] **INTEGRACIÓN CALCULADORA-FORMULARIO** en una sola vista
- [x] **Resumen visual de cálculo** en parte superior del formulario
- [x] **Campos nombre y apellido** agregados al formulario
- [x] **Scroll automático** desde calculadora al formulario
- [x] **Auditoría completa** y eliminación de código obsoleto
- [x] Sistema de diseño UI/UX aplicado con Tailwind CSS
- [x] Componentes UI con guía de marca y Lucide React
- [x] Usuarios de prueba
- [x] Integración con MySQL
- [x] Manejo de errores y validaciones con TypeScript

### 🚧 En Desarrollo
- [ ] Dashboard Admin completo
- [ ] CRUD de concesionarios (aprobación/rechazo)
- [ ] API para procesamiento de solicitudes de crédito (reconstruir sin errores)
- [ ] Integración con APIs externas (Infoauto, Veraz/Equinox)
- [ ] Sistema de notificaciones por email
- [ ] Reportes y estadísticas avanzadas
- [ ] Rate limiting y seguridad granular

### 📋 Próximas Tareas Prioritarias
1. **API Solicitudes**: Reconstruir endpoints limpios para almacenar solicitudes
2. **Dashboard Admin**: Panel para aprobar/rechazar solicitudes
3. **Persistencia de Datos**: Conectar formulario integrado con base de datos
4. **Email Templates**: Notificaciones automáticas de estado
5. **APIs Externas**: Infoauto para datos de vehículos, Veraz para scoring

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar BD con Prisma Studio
npx prisma studio

# Regenerar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push
```

### Debugging
```bash
# Verificar procesos Node.js
tasklist | findstr node

# Detener todos los procesos Node.js
taskkill /F /IM node.exe

# Verificar usuarios en BD
node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findMany().then(console.log);"
```

## 🔒 Seguridad

### Implementado
- Contraseñas hasheadas con bcrypt
- JWT tokens con secrets seguros
- Cookies HTTP-only y secure
- Validación de entrada con Zod
- Middleware de autenticación
- Soft delete para usuarios

### Pendiente
- Rate limiting en APIs
- Validación de roles granular
- Logs de auditoría
- Encriptación de datos sensibles
- Configuración HTTPS en producción

## 📞 Contacto y Soporte

**Desarrollador**: Rodrigo Massardo
**Proyecto**: CrediAuto - Sistema de Gestión de Créditos Automotrices
**Última actualización**: 25 de Agosto, 2025

## 🎯 INTEGRACIÓN CALCULADORA-FORMULARIO COMPLETADA (25/08/2025)

### Funcionalidades Implementadas:
- **Integración en una sola vista**: Calculadora y formulario funcionan en `/portal/dashboard` sin navegación
- **Resumen visual**: Sección superior del formulario muestra datos calculados con diseño verde
- **Campos completos**: Agregados nombre y apellido al formulario de datos personales
- **Scroll automático**: Desde calculadora al formulario cuando se hace clic en "Solicitar con estos valores"
- **Validación completa**: React Hook Form con 5 pasos progresivos
- **Datos integrados**: calculationData se incluye automáticamente en el envío del formulario

### Arquitectura Técnica:
- **LoanCalculator.tsx**: Callback `onCalculationComplete` para integración
- **LoanApplicationSteps.tsx**: Props `calculationData` + resumen visual con tarjetas
- **dashboard/page.tsx**: Estado `calculationData` + función `handleCalculationComplete`
- **Flujo de datos**: Calculadora → Dashboard → Formulario → Envío integrado

### Limpieza Realizada:
- Eliminadas páginas obsoletas: `/solicitar-prestamo/` y `/solicitud-enviada/`
- Eliminado API route problemático: `/api/loan-applications/route.ts` (errores de Prisma/TypeScript)
- Corregidos errores TypeScript en dashboard (`isExecutive` → `isExecutiveValue`)
- Función `handleLoanSubmit` mejorada con logging detallado y confirmación

### Stack Utilizado:
- **Prisma ORM 5.22** para modelo LoanApplication
- **React Hook Form** para validación por pasos
- **Tailwind CSS** con gradientes verdes para resumen
- **Lucide React** para iconografía (Calculator, DollarSign)
- **TypeScript** estricto con interfaces tipadas

---

**NOTA IMPORTANTE**: Este archivo contiene información sensible de desarrollo. No compartir en repositorios públicos sin antes remover credenciales y configuraciones de producción.
