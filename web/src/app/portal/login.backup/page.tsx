import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Building, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-100 p-12">
        <div className="space-y-8 max-w-md">
            <Link href="/" className="flex items-center gap-4">
                <Image
                  src="/crediexpress-logo-sinfondo.png"
                  alt="Crediexpress Automotor"
                  width={300}
                  height={73}
                  className="h-auto object-contain"
                />
            </Link>
            <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-brand-primary-600">
                    Bienvenido de nuevo a tu portal.
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                    Gestioná tus créditos, solicitudes y clientes desde un solo lugar.
                </p>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-600/10">
                        <Building className="h-6 w-6 text-brand-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Gestión Centralizada</h3>
                        <p className="text-sm text-gray-500">Todas tus herramientas en un único dashboard.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-600/10">
                        <Sparkles className="h-6 w-6 text-brand-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Procesos Eficientes</h3>
                        <p className="text-sm text-gray-500">Aprobaciones más rápidas, más ventas.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="mx-auto grid w-[400px] gap-6">
          <Card className="bg-slate-800 border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <CardHeader className="p-8">
                <div className="flex flex-col items-center text-center gap-2">
                    <LogIn className="w-12 h-12 mb-2 text-white opacity-80" />
                    <CardTitle className="text-3xl font-bold text-white">Iniciar Sesión</CardTitle>
                    <CardDescription className="text-slate-300">
                        Ingresá tus credenciales para acceder al sistema.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-brand-primary-600"
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                        <Label htmlFor="password" className="text-white">Contraseña</Label>
                        <Link
                            href="/portal/recuperar-password"
                            className="ml-auto inline-block text-sm text-brand-accent-500 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                        </div>
                        <Input id="password" type="password" required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-brand-primary-600" />
                    </div>
                    <Button type="submit" className="w-full bg-brand-primary-600 hover:bg-brand-primary-700 text-lg py-6 mt-2">
                        Ingresar al Portal
                    </Button>
                </div>
            </CardContent>
          </Card>
          <div className="text-center text-sm">
            ¿No tenés una cuenta?{" "}
            <Link href="/portal/registro-concesionario" className="font-semibold text-brand-primary-600 hover:underline">
              Registrá tu concesionario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}