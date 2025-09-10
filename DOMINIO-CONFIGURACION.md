# 🌐 Configuración Dominio crediexpressautos.com.ar

## ✅ Cambios Realizados en el Proyecto

### 1. Next.js Configuration
**Archivo:** `apps/web/next.config.ts`
- ✅ Agregado `crediexpressautos.com.ar` y `www.crediexpressautos.com.ar` a `allowedDevOrigins`
- Esto previene bloqueos de CORS cuando Next.js recibe requests del nuevo dominio

### 2. Script de Preservación Apache
**Archivo:** `preserve-apache-config.sh`
- ✅ Crea/preserva automáticamente la configuración de Apache
- ✅ Hace backup de configuraciones existentes
- ✅ Habilita módulos necesarios (proxy, proxy_http, headers)
- ✅ Configura headers CORS y seguridad
- ✅ Verifica y recarga Apache automáticamente

### 3. Deploy Script Actualizado
**Archivo:** `deploy-production.sh`
- ✅ Incluye ejecución automática del script de preservación Apache
- ✅ Verifica configuración del dominio durante deploy

## 🚀 Instrucciones para el Servidor

### Pasos para aplicar los cambios:

1. **Subir archivos al servidor:**
```bash
# En el servidor, ir al directorio del proyecto
cd /var/www/crediauto

# Subir los archivos nuevos/modificados:
# - preserve-apache-config.sh
# - apps/web/next.config.ts 
# - deploy-production.sh
```

2. **Ejecutar script de configuración:**
```bash
# Hacer ejecutable
chmod +x preserve-apache-config.sh

# Ejecutar
./preserve-apache-config.sh
```

3. **Rebuild y restart de la aplicación:**
```bash
cd apps/web
npm run build
pm2 restart crediauto-web
```

## 🔧 Configuración Apache Actual

Tu archivo `crediexpressautos.com.ar.conf` es correcto, pero el script lo mejora con:

```apache
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

    # Headers adicionales para CORS y seguridad
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff

    ErrorLog ${APACHE_LOG_DIR}/crediexpressautos_error.log
    CustomLog ${APACHE_LOG_DIR}/crediexpressautos_access.log combined
</VirtualHost>
```

## ✅ Verificación

Para verificar que todo funciona:

```bash
# Test local en el servidor
curl -H 'Host: crediexpressautos.com.ar' http://localhost

# Test desde navegador
http://crediexpressautos.com.ar
http://www.crediexpressautos.com.ar
```

## 🔒 Consideraciones de Seguridad

### Para HTTPS (Recomendado):
1. Obtener certificado SSL (Let's Encrypt)
2. Crear VirtualHost para puerto 443
3. Cambiar cookies a `secure: true` en producción
4. Agregar redirects HTTP → HTTPS

### DNS:
- Asegurar que el dominio apunte a la IP: `4.201.148.83`
- Configurar tanto `@` como `www` en el proveedor DNS

## 🎯 Próximos Pasos

1. ✅ Aplicar cambios en servidor con el script
2. ✅ Verificar funcionamiento del dominio
3. ⚠️ Considerar implementar HTTPS
4. ⚠️ Configurar DNS si aún no está hecho

Los cambios en el proyecto aseguran que la configuración Apache se preserve automáticamente en futuros deploys.
