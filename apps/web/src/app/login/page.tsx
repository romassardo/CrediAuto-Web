import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";

export const metadata = {
  title: "Iniciar sesión | CrediAuto",
  description: "Accede al Portal de Concesionarios de CrediAuto",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Modal de login abierto por defecto para navegación directa a /login */}
      <LoginModal defaultOpen />

      {/* Contenido de fondo por si el usuario cierra el modal */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="pointer-events-auto bg-white/70 backdrop-blur-md rounded-xl px-6 py-4 shadow hidden sm:block">
          <p className="text-sm text-gray-600">
            Cierra el modal para volver o <Link href="/" className="text-brand-primary-700 underline">ir al inicio</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
