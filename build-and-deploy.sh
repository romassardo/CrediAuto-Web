#!/bin/bash

# 🚀 BUILD Y DEPLOYMENT FINAL CREDIAUTO
# Ejecutar DESPUÉS de instalar dependencias

echo "🚀 Iniciando build de producción CrediAuto..."
echo "📁 Directorio: $(pwd)"

# Verificar que estamos en apps/web
if [ ! -f "next.config.ts" ]; then
    echo "❌ Error: No se encontró next.config.ts. Navega a apps/web"
    exit 1
fi

# Build de producción con configuración standalone
echo "🏗️ Ejecutando build de producción..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
else
    echo "❌ Error en el build. Revisa los logs arriba."
    exit 1
fi

# Configurar PM2 con next start (recomendado por Context7)
echo "🔧 Configurando PM2..."

# Crear archivo ecosystem para PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'crediauto-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/crediauto/apps/web',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/crediauto-error.log',
    out_file: '/var/log/pm2/crediauto-out.log',
    log_file: '/var/log/pm2/crediauto.log',
    time: true
  }]
}
EOF

# Crear directorio de logs PM2 si no existe
sudo mkdir -p /var/log/pm2
sudo chown -R soporte:soporte /var/log/pm2

# Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js

# Configurar PM2 para auto-start en boot
pm2 startup
pm2 save

echo ""
echo "✅ DEPLOYMENT COMPLETADO!"
echo "🌐 Aplicación disponible en: http://4.201.148.83:3000"
echo ""
echo "📊 Comandos útiles PM2:"
echo "  pm2 status                 # Ver estado"
echo "  pm2 logs crediauto-app     # Ver logs"
echo "  pm2 restart crediauto-app  # Reiniciar"
echo "  pm2 stop crediauto-app     # Detener"
echo ""