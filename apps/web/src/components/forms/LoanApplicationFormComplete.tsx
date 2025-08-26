'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Briefcase, Car, Upload, Heart, FileText, X } from 'lucide-react';
import { type Result } from '@/lib/calculator/loan-calculator';

interface LoanApplicationData {
  // Datos Personales
  apellidos: string;
  nombre: string;
  cuitCuil: string;
  fechaNacimiento: string;
  provincia: string;
  localidad: string;
  domicilio: string;
  codigoPostal: string;
  email: string;
  telefono: string;
  estadoCivil: string;
  
  // Datos del Cónyuge (condicional)
  tieneConyuge: boolean;
  conyugeNombre?: string;
  conyugeCuitCuil?: string;
  conyugeIngresos?: number;
  
  // Datos Laborales
  relacionLaboral: string;
  relacionLaboralOtro?: string;
  empresa: string;
  antiguedad: string;
  telefonoEmpresa: string;
  ingresosMensuales: number;
  
  // Datos del Vehículo
  marca: string;
  modelo: string;
  version: string;
  esNuevo: boolean;
  anoVehiculo?: number;
  valorTotal: number;
  saldoFinanciar: number;
  cantidadCuotas: number;
}

interface LoanApplicationFormProps {
  calculationResult?: Result | null;
  onSubmit?: (data: LoanApplicationData) => void;
}

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
  'Tucumán', 'Ciudad Autónoma de Buenos Aires'
];

const ESTADOS_CIVILES = [
  'Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Convivencial'
];

const RELACIONES_LABORALES = [
  'Relación de dependencia', 'Monotributo', 'Jubilado', 'Autónomo', 'Otro'
];

const CUOTAS_DISPONIBLES = [6, 12, 24, 36, 48];

export default function LoanApplicationFormComplete({ calculationResult, onSubmit }: LoanApplicationFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm<LoanApplicationData>({
    defaultValues: {
      tieneConyuge: false,
      esNuevo: true,
      relacionLaboral: 'Relación de dependencia',
      cantidadCuotas: 36,
    }
  });

  const watchTieneConyuge = watch('tieneConyuge');
  const watchRelacionLaboral = watch('relacionLaboral');
  const watchEsNuevo = watch('esNuevo');

  // Sincronizar datos de la calculadora
  if (calculationResult) {
    setValue('valorTotal', calculationResult.totales.desembolsoBruto);
    setValue('saldoFinanciar', calculationResult.totales.desembolsoBruto);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: LoanApplicationData) => {
    const formData = {
      ...data,
      documentos: files,
    };
    onSubmit?.(data);
    console.log('Datos del formulario:', formData);
    alert('Solicitud enviada correctamente. Será procesada por nuestro equipo.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Solicitud de Préstamo</h2>
          </div>
          <p className="text-brand-primary-100 text-sm">Complete todos los datos para procesar su solicitud</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Datos Personales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <div className="w-6 h-6 bg-brand-primary-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
              <input
                {...register('apellidos', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Apellidos"
              />
              {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                {...register('nombre', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Nombre"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CUIT/CUIL *</label>
              <input
                {...register('cuitCuil', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="20-12345678-9"
              />
              {errors.cuitCuil && <p className="text-red-500 text-xs mt-1">{errors.cuitCuil.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Nacimiento *</label>
              <input
                type="date"
                {...register('fechaNacimiento', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              />
              {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Provincia *</label>
              <select
                {...register('provincia', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              >
                <option value="">Seleccione</option>
                {PROVINCIAS.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
              </select>
              {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Localidad *</label>
              <input
                {...register('localidad', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Localidad"
              />
              {errors.localidad && <p className="text-red-500 text-xs mt-1">{errors.localidad.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Domicilio *</label>
              <input
                {...register('domicilio', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Calle y número"
              />
              {errors.domicilio && <p className="text-red-500 text-xs mt-1">{errors.domicilio.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Código Postal *</label>
              <input
                {...register('codigoPostal', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="1234"
              />
              {errors.codigoPostal && <p className="text-red-500 text-xs mt-1">{errors.codigoPostal.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                {...register('email', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="email@ejemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                {...register('telefono', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="+54 11 1234-5678"
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado Civil *</label>
              <select
                {...register('estadoCivil', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              >
                <option value="">Seleccione</option>
                {ESTADOS_CIVILES.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estadoCivil && <p className="text-red-500 text-xs mt-1">{errors.estadoCivil.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('tieneConyuge')}
                  className="mt-1 w-3 h-3 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
                />
                <label className="text-xs text-gray-700">¿Tiene cónyuge?</label>
              </div>
            </div>
          </div>

          {/* Datos del Cónyuge */}
          {watchTieneConyuge && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">Datos del Cónyuge</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre y Apellido *</label>
                  <input
                    {...register('conyugeNombre', { required: watchTieneConyuge ? 'Requerido' : false })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-primary-600"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CUIT/CUIL *</label>
                  <input
                    {...register('conyugeCuitCuil', { required: watchTieneConyuge ? 'Requerido' : false })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-primary-600"
                    placeholder="20-12345678-9"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ingresos Mensuales *</label>
                  <input
                    type="number"
                    {...register('conyugeIngresos', { required: watchTieneConyuge ? 'Requerido' : false })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-primary-600"
                    placeholder="500000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Datos Laborales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <div className="w-6 h-6 bg-brand-primary-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Laborales</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Relación Laboral *</label>
              <select
                {...register('relacionLaboral', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              >
                {RELACIONES_LABORALES.map(relacion => (
                  <option key={relacion} value={relacion}>{relacion}</option>
                ))}
              </select>
            </div>

            {watchRelacionLaboral === 'Otro' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Especifique *</label>
                <input
                  {...register('relacionLaboralOtro', { required: watchRelacionLaboral === 'Otro' ? 'Requerido' : false })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                  placeholder="Especifique"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Empresa *</label>
              <input
                {...register('empresa', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Nombre empresa"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Antigüedad *</label>
              <input
                {...register('antiguedad', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="2 años"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono Empresa *</label>
              <input
                type="tel"
                {...register('telefonoEmpresa', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ingresos Mensuales *</label>
              <input
                type="number"
                {...register('ingresosMensuales', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="1000000"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Datos del Vehículo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <div className="w-6 h-6 bg-brand-primary-600 rounded-full flex items-center justify-center">
              <Car className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos del Vehículo</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Marca *</label>
              <input
                {...register('marca', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Toyota, Ford..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Modelo *</label>
              <input
                {...register('modelo', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="Corolla, Focus..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Versión *</label>
              <input
                {...register('version', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="XEI, SE, LT..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condición *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('esNuevo')}
                    value="true"
                    className="w-3 h-3 text-brand-primary-600 border-gray-300 focus:ring-brand-primary-600"
                  />
                  <span className="ml-1 text-xs text-gray-700">0 Km</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('esNuevo')}
                    value="false"
                    className="w-3 h-3 text-brand-primary-600 border-gray-300 focus:ring-brand-primary-600"
                  />
                  <span className="ml-1 text-xs text-gray-700">Usado</span>
                </label>
              </div>
            </div>

            {!watchEsNuevo && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Año Vehículo *</label>
                <input
                  type="number"
                  {...register('anoVehiculo', { required: !watchEsNuevo ? 'Requerido' : false })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear()}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor Total *</label>
              <input
                type="number"
                {...register('valorTotal', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="5000000"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Saldo a Financiar *</label>
              <input
                type="number"
                {...register('saldoFinanciar', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
                placeholder="5000000"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad de Cuotas *</label>
              <select
                {...register('cantidadCuotas', { required: 'Requerido' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              >
                {CUOTAS_DISPONIBLES.map(cuotas => (
                  <option key={cuotas} value={cuotas}>{cuotas} cuotas</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <div className="w-6 h-6 bg-brand-primary-600 rounded-full flex items-center justify-center">
              <Upload className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Documentación</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Adjuntar Documentos (DNI, Recibos de sueldo, etc.)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">Archivos adjuntos:</p>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-xs text-gray-600 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón de envío */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}