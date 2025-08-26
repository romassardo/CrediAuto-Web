import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir solicitudes desde la IP local en desarrollo para evitar bloqueo futuro
  // Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  allowedDevOrigins: ["192.168.0.84", "200.123.154.48"],
  
  // Configurar dominios permitidos para next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
