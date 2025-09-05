'use client';

import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface ReconsiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; files: File[] }) => Promise<void>;
  applicationId: string;
  isLoading?: boolean;
}

export default function ReconsiderModal({
  isOpen,
  onClose,
  onSubmit,
  applicationId,
  isLoading = false
}: ReconsiderModalProps) {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    try {
      await onSubmit({ reason: reason.trim(), files });
      
      // Limpiar formulario después del envío exitoso
      setReason('');
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error al enviar reconsideración:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 p-6 rounded-t-2xl relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Solicitar Reconsideración</h2>
              <p className="text-brand-primary-100 mt-1">
                Solicitud #{applicationId}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white hover:text-brand-primary-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-20 w-20 h-20 bg-brand-accent-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-2 left-10 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-orange-800 font-medium">Información importante</h3>
                <p className="text-orange-700 text-sm mt-1">
                  Esta solicitud fue rechazada anteriormente. Puedes agregar observaciones y documentación adicional para que sea reconsiderada por el administrador.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de observaciones */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica por qué consideras que esta solicitud debería ser reconsiderada..."
                rows={4}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe los motivos de la reconsideración y cualquier información adicional relevante.
              </p>
            </div>

            {/* Área de subida de archivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentación adicional (opcional)
              </label>
              
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-brand-primary-500 bg-brand-primary-50'
                    : 'border-gray-300 hover:border-brand-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Arrastra archivos aquí o{' '}
                  <label className="text-brand-primary-600 hover:text-brand-primary-700 cursor-pointer underline">
                    selecciona archivos
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileSelect}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, DOC, DOCX (máx. 10MB por archivo)
                </p>
              </div>

              {/* Lista de archivos seleccionados */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Archivos seleccionados ({files.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !reason.trim()}
                className="flex-1 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 text-white px-6 py-3 rounded-xl hover:from-brand-primary-700 hover:to-brand-primary-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary-600/25"
              >
                {isLoading ? 'Enviando...' : 'Enviar Reconsideración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}