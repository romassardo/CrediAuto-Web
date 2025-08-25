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
- **UI**: Tailwind CSS + shadcn/ui
- **Validación**: Zod
- **Emails**: Resend
- **Hashing**: bcryptjs (salt rounds: 12)

### Estructura del Proyecto
```
e:\Proyectos\CrediAuto\
├── apps/web/                    # Aplicación principal Next.js
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── api/auth/login/  # API de autenticación
│   │   │   └── page.tsx         # Página principal
│   │   ├── components/          # Componentes React
│   │   │   ├── LoginModal.tsx   # Modal de login
│   │   │   └── ui/              # Componentes shadcn/ui
│   │   ├── lib/
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
NEXTAUTH_URL="http://localhost:3000"
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

### ✅ Sistema de Autenticación
- **API Route**: `/api/auth/login`
- **Método**: POST con validación Zod
- **Flujo**: Email/password → Verificación bcrypt → JWT tokens
- **Middleware**: Protección de rutas con JWT
- **Cookies**: HTTP-only, secure para tokens
- **Redirección**: Por roles (Admin, Dealer, Ejecutivo)

### ✅ Gestión de Usuarios
- **Roles**: ADMIN, DEALER, EJECUTIVO_CUENTAS
- **Estados**: ACTIVE, INACTIVE, SUSPENDED
- **Soft Delete**: Campo `deletedAt`
- **Relaciones**: Users ↔ Dealers

### ✅ Componentes UI
- **LoginModal**: Modal de autenticación con validación
- **Componentes shadcn/ui**: Dialog, Button, Input, Label
- **Responsive**: Diseño adaptativo con Tailwind CSS

### ✅ Infraestructura
- **Prisma Client**: Singleton optimizado con connection pooling
- **Transacciones**: Helper `withTransaction` con timeout
- **Email Service**: Integración con Resend para credenciales
- **Error Handling**: Manejo robusto de errores

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
- `apps/web/src/app/api/auth/login/route.ts` - API de login
- `apps/web/src/lib/prisma.ts` - Cliente de BD
- `apps/web/src/middleware.ts` - Protección JWT
- `apps/web/src/components/LoginModal.tsx` - UI de login

### Scripts SQL
- `db/sql/crediauto_f1_f2.sql` - Estructura de BD
- `db/sql/test_users.sql` - Usuarios de prueba

## 🔄 Estado Actual del Desarrollo

### ✅ Completado
- [x] Configuración inicial del proyecto
- [x] Esquema de base de datos
- [x] Sistema de autenticación JWT
- [x] API de login funcional
- [x] Middleware de protección
- [x] Componentes UI básicos
- [x] Usuarios de prueba
- [x] Integración con MySQL
- [x] Manejo de errores

### 🚧 En Desarrollo
- [ ] Dashboards por rol (Admin, Dealer, Ejecutivo)
- [ ] CRUD de concesionarios
- [ ] Gestión de ejecutivos de cuentas
- [ ] Calculadora de préstamos
- [ ] Sistema de solicitudes de crédito
- [ ] Notificaciones por email
- [ ] Reportes y estadísticas

### 📋 Próximas Tareas Prioritarias
1. **Dashboard Admin**: Panel de administración completo
2. **Gestión Dealers**: CRUD de concesionarios
3. **Calculadora**: Herramienta de cálculo de préstamos
4. **API Solicitudes**: Endpoints para gestión de créditos
5. **Email Templates**: Plantillas para notificaciones

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

**Desarrollador**: Trabajando con Windsurf Cascade AI
**Proyecto**: CrediAuto - Sistema de Gestión de Créditos Automotrices
**Última actualización**: 24 de Agosto, 2025

---

**NOTA IMPORTANTE**: Este archivo contiene información sensible de desarrollo. No compartir en repositorios públicos sin antes remover credenciales y configuraciones de producción.
