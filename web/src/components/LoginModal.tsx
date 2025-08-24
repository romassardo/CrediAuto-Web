"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulación de autenticación - aquí iría la lógica real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir al portal después del login exitoso
      window.location.href = '/portal/dashboard';
    } catch (error) {
      console.error('Error de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-600/20">
              <LogIn className="h-6 w-6 text-brand-primary-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Portal de Concesionarios
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Ingresá tus credenciales para acceder al sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="modal-email" className="text-white">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-brand-primary-600"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-password" className="text-white">Contraseña</Label>
              <Link
                href="/portal/recuperar-password"
                className="text-sm text-brand-accent-500 hover:underline"
                onClick={() => onOpenChange(false)}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-brand-primary-600"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-primary-600 hover:bg-brand-primary-700 text-lg py-6 mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar al Portal'}
          </Button>
        </form>
        
        <div className="text-center text-sm mt-4 pt-4 border-t border-slate-700">
          <span className="text-slate-400">¿No tenés una cuenta? </span>
          <Link 
            href="/portal/registro-concesionario" 
            className="font-semibold text-brand-accent-500 hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Registrá tu concesionario
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}