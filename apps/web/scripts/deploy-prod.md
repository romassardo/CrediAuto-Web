# 🚀 Guía de Deploy a Producción - CrediAuto (sin Vercel)

Esta guía describe un despliegue estándar en tu propio servidor (o VPS) usando PM2 y, opcionalmente, Nginx como reverse proxy.

## 📋 Checklist Pre-Deploy

### 1) Base de Datos en Producción (MySQL)

Elige una opción y obtén tu `DATABASE_URL`:

- PlanetScale (MySQL serverless)
- Railway (MySQL gestionado)
- MySQL en tu propio servidor (Docker o nativo)

Ejemplo de `DATABASE_URL` con SSL:

```
mysql://username:password@host:3306/crediauto?sslaccept=strict
```

### 2) Variables de Entorno (servidor)

Crea un archivo `.env` junto a `apps/web` (o usar variables del sistema) con:

```env
DATABASE_URL="mysql://username:password@host/crediauto?sslaccept=strict"
JWT_SECRET="<64-hex>"
JWT_REFRESH_SECRET="<64-hex>"
APP_URL="https://tu-dominio.com"  # usado por metadataBase para URLs absolutas
NODE_ENV="production"

# Opcional: Email
RESEND_API_KEY="<tu-resend-api-key>"
```

Sugerencia: genera secretos seguros con el script incluido:

```bash
node apps/web/scripts/generate-secrets.js
```

### 3) Preparar build y Prisma

```bash
npm install
npx prisma generate --workspace=web
DATABASE_URL="<prod-url>" npx prisma migrate deploy --workspace=web
npm run build --workspace=web
```

## 🚀 Despliegue con PM2

Instala PM2 en el servidor y arranca la app:

```bash
npm i -g pm2
pm2 start "npm run start --workspace=web" --name crediauto-web
pm2 save
pm2 status
```

Logs y mantenimiento:

```bash
pm2 logs crediauto-web --lines 100
pm2 restart crediauto-web
pm2 stop crediauto-web && pm2 delete crediauto-web
```

## 🌐 (Opcional) Nginx como Reverse Proxy

Archivo `/etc/nginx/sites-available/crediauto`:

```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Habilitar el sitio y recargar:

```bash
sudo ln -s /etc/nginx/sites-available/crediauto /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Importante: Ajusta `APP_URL` a `https://tu-dominio.com` para que las URLs de metadata sean absolutas correctas.

## ✅ Post-Deploy Check

- `curl https://tu-dominio.com/api/health` debe responder `{ ok: true, db: true }`
- Revisar OG/Twitter cards con meta tags correctas (revisar el `<head>`)
- Validar login y flujos principales

## 🆘 Troubleshooting

**Conexión a BD:**
- Verifica `DATABASE_URL` y que el servidor de MySQL acepte conexiones remotas y SSL si aplica.

**Errores JWT:**
- Regenera secretos (`generate-secrets.js`). Revisa variables cargadas en el proceso PM2.

**Build/arranque:**
- Asegúrate de ejecutar `prisma generate` y `migrate deploy` antes de `next start`.
- Comprueba versiones de Node compatibles (LTS reciente).

**Nginx 502/404:**
- Revisa que PM2 esté corriendo en puerto 3000 y que el proxy_pass apunte a 127.0.0.1:3000.