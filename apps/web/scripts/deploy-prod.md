# 🚀 Guía de Deploy a Producción - CrediAuto

## 📋 Checklist Pre-Deploy

### 1. Base de Datos en Producción

**Opción A: PlanetScale (Recomendada)**
```bash
# 1. Crear cuenta en planetscale.com
# 2. Crear base de datos: crediauto-prod
# 3. Obtener connection string desde dashboard
# 4. Configurar en Vercel Environment Variables
```

**Opción B: Railway**
```bash
# 1. Crear cuenta en railway.app
# 2. Deploy MySQL database
# 3. Obtener connection string
# 4. Configurar en Vercel
```

### 2. Variables de Entorno en Vercel

En Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Base de datos (usar connection string real)
DATABASE_URL="mysql://username:password@host/crediauto-prod?sslaccept=strict"

# JWT Secrets (ejecutar: node scripts/generate-secrets.js)
JWT_SECRET="[64-character-hex-string]"
JWT_REFRESH_SECRET="[64-character-hex-string]"

# App configuration
APP_URL="https://tu-dominio.vercel.app"
NODE_ENV="production"

# Email service (opcional por ahora)
RESEND_API_KEY="[cuando-configures-email]"
```

### 3. Migraciones de Base de Datos

```bash
# Generar secretos para producción
node scripts/generate-secrets.js

# Aplicar migraciones (después de configurar DATABASE_URL)
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Insertar datos de prueba (opcional)
npx prisma db seed
```

### 4. Configuración de Build en Vercel

Asegúrate que `package.json` tenga:
```json
{
  "scripts": {
    "build": "next build --turbopack",
    "postinstall": "prisma generate"
  }
}
```

### 5. Deploy Steps

1. **Configurar base de datos** (PlanetScale/Railway)
2. **Generar secretos JWT** con el script
3. **Configurar variables de entorno** en Vercel
4. **Push código** a repositorio
5. **Deploy automático** en Vercel
6. **Ejecutar migraciones** desde terminal local
7. **Probar funcionalidad** completa

## 🔧 Comandos Útiles

```bash
# Generar secretos seguros
node scripts/generate-secrets.js

# Aplicar migraciones en producción
DATABASE_URL="[prod-url]" npx prisma migrate deploy

# Ver estado de la base de datos
DATABASE_URL="[prod-url]" npx prisma studio

# Reset completo (solo desarrollo)
npx prisma migrate reset
```

## ⚠️ Consideraciones Importantes

1. **Secretos JWT**: Nunca uses los mismos secretos de desarrollo en producción
2. **Base de datos**: Asegúrate que la conexión sea SSL/TLS
3. **Variables de entorno**: Configúralas ANTES del deploy
4. **Migraciones**: Ejecuta siempre después del primer deploy
5. **Datos de prueba**: Inserta usuarios admin y dealer para testing

## 🎯 Resultado Esperado

Después del deploy tendrás:
- ✅ Aplicación funcionando en Vercel
- ✅ Base de datos MySQL en la nube
- ✅ Sistema de autenticación JWT
- ✅ Dashboard completo con calculadora
- ✅ Formulario de solicitudes por steps
- ✅ Gestión de usuarios y permisos

## 🆘 Troubleshooting

**Error de conexión a BD:**
- Verificar DATABASE_URL en variables de entorno
- Comprobar que la base de datos esté activa
- Revisar configuración SSL/TLS

**Error de JWT:**
- Verificar que JWT_SECRET esté configurado
- Generar nuevos secretos si es necesario

**Error de build:**
- Verificar que `prisma generate` se ejecute en postinstall
- Comprobar que todas las dependencias estén instaladas