'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'warning' | 'danger' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const styleByType = {
  warning: {
    header: 'bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200',
    iconWrap: 'bg-amber-600',
    title: 'text-amber-900',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700',
  },
  danger: {
    header: 'bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200',
    iconWrap: 'bg-red-600',
    title: 'text-red-900',
    confirmBtn: 'bg-red-600 hover:bg-red-700',
  },
  info: {
    header: 'bg-gradient-to-r from-brand-primary-50 to-brand-primary-100 border-b border-brand-primary-200',
    iconWrap: 'bg-brand-primary-600',
    title: 'text-brand-primary-900',
    confirmBtn: 'bg-brand-primary-600 hover:bg-brand-primary-700',
  },
} as const;

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  type = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const styles = styleByType[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100/50 max-w-md w-full overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 ${styles.header}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconWrap}`}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-lg font-bold ${styles.title}`}>{title}</h3>
          <button onClick={onCancel} className="ml-auto p-2 text-gray-400 hover:text-gray-600" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${styles.confirmBtn} disabled:opacity-50`}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
