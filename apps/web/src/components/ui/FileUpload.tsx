'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
  maxFiles?: number;
  className?: string;
  error?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
}

export default function FileUpload({
  onFilesChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = true,
  maxSize = 10,
  maxFiles = 10,
  className = "",
  error
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo "${file.name}" excede el tamaño máximo de ${maxSize}MB`;
    }

    // Validar tipo
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(type => 
      type === fileExtension || 
      file.type.startsWith(type.replace('*', ''))
    );

    if (!isValidType) {
      return `El archivo "${file.name}" no es un tipo válido. Tipos permitidos: ${accept}`;
    }

    return null;
  }, [maxSize, accept]);

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    // Validar límite de archivos
    if (files.length + fileArray.length > maxFiles) {
      setUploadError(`No puede subir más de ${maxFiles} archivos`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9)
        });

        // Crear preview para imágenes
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        validFiles.push(fileWithPreview);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('. '));
      return;
    }

    setUploadError('');
    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, maxFiles, maxSize, accept, onFilesChange, validateFile]);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => {
      if (file.id === fileId && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return file.id !== fileId;
    });
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de Drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-brand-primary-600 bg-brand-primary-50' 
            : 'border-gray-300 hover:border-brand-primary-600'
          }
          ${error || uploadError ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          isDragOver ? 'text-brand-primary-600' : 'text-gray-400'
        }`} />
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <p className="text-brand-primary-600 font-medium hover:text-brand-primary-700">
            Haga clic para seleccionar archivos
          </p>
          <p className="text-gray-500">o arrastre y suelte aquí</p>
          <p className="text-xs text-gray-500">
            Formatos permitidos: {accept} (máximo {maxSize}MB por archivo)
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-gray-500">
              Máximo {maxFiles} archivos
            </p>
          )}
        </div>
      </div>

      {/* Mensajes de Error */}
      {(error || uploadError) && (
        <div className="text-red-500 text-sm">
          {error || uploadError}
        </div>
      )}

      {/* Lista de Archivos Subidos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({files.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Preview o Icono */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <Image
                        src={file.preview as string}
                        alt={file.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  
                  {/* Info del Archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Botón Eliminar */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
