#!/bin/bash

# 🔧 CONFIGURACIÓN DE LA APLICACIÓN CREDIAUTO
# Ejecutar DESPUÉS de clonar el repositorio

echo "🔧 Configurando aplicación CrediAuto..."
echo "📁 Directorio actual: $(pwd)"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Navegar al directorio de la app web
cd apps/web

echo "📦 Instalando dependencias de Node.js..."
npm install

echo "🔐 Configurando variables de entorno..."
cat > .env << EOF
# Base de datos MySQL
DATABASE_URL="mysql://admin:autocredito@127.0.0.1:3306/crediauto"

# JWT Secrets (producción)
JWT_SECRET="crediauto-production-jwt-secret-2024-ultra-secure-key"
JWT_REFRESH_SECRET="crediauto-production-refresh-jwt-secret-2024-ultra-secure-key"

# Next.js Config
NEXTAUTH_URL="http://4.201.148.83:3000"
NODE_ENV="production"

# Email (si se usa)
RESEND_API_KEY=""

# Configuración específica de producción
PORT=3000
EOF

echo "✅ Variables de entorno configuradas en .env"

# Generar Prisma Client
echo "🗄️ Generando Prisma Client..."
npx prisma generate

# Test de conexión a MySQL
echo "🔍 Probando conexión a MySQL..."
mysql -u admin -p'autocredito' -h 127.0.0.1 -e "SHOW DATABASES;" 2>/dev/null && echo "✅ MySQL conectado correctamente" || echo "❌ Error conectando a MySQL"

echo ""
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "🚀 Siguiente paso: Build de producción"
echo ""