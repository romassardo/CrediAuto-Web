#!/bin/bash

# Script para preservar configuración de Apache durante deploys
# Ejecutar ANTES del deploy para hacer backup de la configuración actual

echo "🔧 Preservando configuración Apache para crediexpressautos.com.ar..."

APACHE_SITES_DIR="/etc/apache2/sites-available"
CONFIG_FILE="crediexpressautos.com.ar.conf"
BACKUP_DIR="/var/backups/apache-crediauto"

# Crear directorio de backup si no existe
sudo mkdir -p "$BACKUP_DIR"

# Hacer backup de la configuración actual
if [ -f "$APACHE_SITES_DIR/$CONFIG_FILE" ]; then
    echo "📋 Haciendo backup de $CONFIG_FILE..."
    sudo cp "$APACHE_SITES_DIR/$CONFIG_FILE" "$BACKUP_DIR/$CONFIG_FILE.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup guardado en $BACKUP_DIR/"
else
    echo "⚠️  Archivo $CONFIG_FILE no encontrado en $APACHE_SITES_DIR"
    echo "🔧 Creando configuración desde cero..."
    
    sudo tee "$APACHE_SITES_DIR/$CONFIG_FILE" > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName crediexpressautos.com.ar
    ServerAlias www.crediexpressautos.com.ar
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyRequests Off

    <Proxy http://localhost:3000/*>
        Require all granted
    </Proxy>

    # Headers para CORS y seguridad
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff

    ErrorLog ${APACHE_LOG_DIR}/crediexpressautos_error.log
    CustomLog ${APACHE_LOG_DIR}/crediexpressautos_access.log combined
</VirtualHost>
EOF
    
    echo "✅ Configuración creada en $APACHE_SITES_DIR/$CONFIG_FILE"
fi

# Verificar si el sitio está habilitado
if sudo a2ensite "$CONFIG_FILE" 2>/dev/null; then
    echo "✅ Sitio habilitado correctamente"
else
    echo "ℹ️  Sitio ya estaba habilitado"
fi

# Verificar módulos necesarios
REQUIRED_MODULES=("proxy" "proxy_http" "headers" "rewrite")
for module in "${REQUIRED_MODULES[@]}"; do
    if sudo a2enmod "$module" 2>/dev/null; then
        echo "✅ Módulo $module habilitado"
    else
        echo "ℹ️  Módulo $module ya estaba habilitado"
    fi
done

# Verificar configuración de Apache
echo "🔍 Verificando configuración de Apache..."
if sudo apache2ctl configtest; then
    echo "✅ Configuración de Apache válida"
    
    echo "🔄 Recargando Apache..."
    sudo systemctl reload apache2
    echo "✅ Apache recargado exitosamente"
else
    echo "❌ Error en la configuración de Apache"
    echo "💡 Revisa los logs: sudo tail -f /var/log/apache2/error.log"
    exit 1
fi

echo ""
echo "🎯 CONFIGURACIÓN COMPLETADA"
echo "✅ Dominio: crediexpressautos.com.ar"
echo "✅ Alias: www.crediexpressautos.com.ar"
echo "✅ Proxy: localhost:3000"
echo "✅ Logs: /var/log/apache2/crediexpressautos_*.log"
echo ""
echo "📝 Para verificar el funcionamiento:"
echo "   curl -H 'Host: crediexpressautos.com.ar' http://localhost"
echo ""
