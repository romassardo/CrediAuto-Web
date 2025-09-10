#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT CREDIAUTO - SERVIDOR PRODUCCIÓN
# Servidor: 4.201.148.83 (Ubuntu 24.04)
# Usuario: soporte
# Contraseña: Pr3nd4rios!!

echo "🎯 Iniciando deployment de CrediAuto en servidor de producción..."
echo "📅 $(date)"
echo ""

# Paso 1: Actualizar sistema
echo "📦 Paso 1: Actualizando sistema Ubuntu..."
sudo apt update
sudo apt upgrade -y

# Paso 2: Instalar Node.js 18 (LTS recomendado para Next.js 15)
echo "📦 Paso 2: Instalando Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
echo "✅ Verificando instalación de Node.js..."
node --version
npm --version

# Paso 3: Instalar PM2 globalmente
echo "📦 Paso 3: Instalando PM2 para gestión de procesos..."
sudo npm install -g pm2

# Paso 4: Verificar MySQL
echo "📦 Paso 4: Verificando MySQL..."
mysql --version

# Paso 5: Crear directorio del proyecto
echo "📦 Paso 5: Creando directorio del proyecto..."
sudo mkdir -p /var/www/crediauto
sudo chown -R soporte:soporte /var/www/crediauto
cd /var/www/crediauto

# Paso 6: Instalar Git si no está disponible
echo "📦 Paso 6: Verificando Git..."
if ! command -v git &> /dev/null; then
    echo "Instalando Git..."
    sudo apt install -y git
fi

# Paso 7: Preservar configuración de dominio Apache
echo "📦 Paso 7: Verificando configuración de dominio crediexpressautos.com.ar..."
if [ -f "./preserve-apache-config.sh" ]; then
    echo "Ejecutando script de preservación de Apache..."
    chmod +x ./preserve-apache-config.sh
    ./preserve-apache-config.sh
else
    echo "⚠️  Script preserve-apache-config.sh no encontrado"
    echo "💡 Asegúrate de subir este archivo al servidor"
fi

echo ""
echo "✅ PREPARACIÓN COMPLETADA"
echo "🔗 Siguiente paso: Clonar repositorio de GitHub"
echo "📁 Directorio preparado: /var/www/crediauto"
echo "🌐 Dominio configurado: crediexpressautos.com.ar"
echo ""
echo "Ejecuta manualmente:"
echo "cd /var/www/crediauto"
echo "git clone https://github.com/romassardo/CrediAuto-Web.git ."
echo ""