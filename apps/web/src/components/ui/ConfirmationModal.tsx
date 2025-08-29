'use client';

import { Check, X, AlertCircle, Clock } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  autoClose = true,
  autoCloseDelay = 3000
}: ConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-600',
          iconColor: 'text-white',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
          icon: Check
        };
      case 'error':
        return {
          bgColor: 'from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-600',
          iconColor: 'text-white',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          icon: X
        };
      case 'warning':
        return {
          bgColor: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-600',
          iconColor: 'text-white',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          icon: AlertCircle
        };
      case 'info':
      default:
        return {
          bgColor: 'from-blue-50 to-sky-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-brand-primary-600',
          iconColor: 'text-white',
          titleColor: 'text-brand-primary-900',
          messageColor: 'text-brand-primary-700',
          icon: Clock
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden max-w-md w-full transform transition-all duration-300 scale-100 animate-in zoom-in-95 fade-in-0">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* Header con gradiente */}
        <div className={`bg-gradient-to-r ${styles.bgColor} px-8 py-6 relative overflow-hidden border-b ${styles.borderColor}`}>
          <div className="relative flex items-center gap-4">
            {/* Icono */}
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
              <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            
            {/* Título */}
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${styles.titleColor}`}>
                {title}
              </h3>
            </div>
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all transform hover:scale-110"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-8">
          <p className={`text-lg leading-relaxed ${styles.messageColor}`}>
            {message}
          </p>
          
          {autoClose && (
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Se cerrará automáticamente en {autoCloseDelay / 1000} segundos</span>
            </div>
          )}
        </div>
        
        {/* Footer con botón */}
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Check className="w-5 h-5" />
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
