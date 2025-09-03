'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Heart, FileText } from 'lucide-react';
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
  conyugeApellido?: string;
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

export default function LoanApplicationForm({ calculationResult, onSubmit }: LoanApplicationFormProps) {
  const [files] = useState<File[]>([]);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm<LoanApplicationData>({
    defaultValues: {
      tieneConyuge: false,
      esNuevo: true,
      relacionLaboral: 'Relación de dependencia',
      cantidadCuotas: 36,
    }
  });

  const watchTieneConyuge = watch('tieneConyuge');

  // Sincronizar datos de la calculadora
  if (calculationResult) {
    setValue('valorTotal', calculationResult.totales.desembolsoBruto);
    setValue('saldoFinanciar', calculationResult.totales.desembolsoBruto);
  }

  const onFormSubmit = (data: LoanApplicationData) => {
    const formData = {
      ...data,
      documentos: files,
    };
    onSubmit?.(data);
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Solicitud de Préstamo</h2>
          </div>
          <p className="text-brand-primary-100 text-lg">Complete todos los datos para procesar su solicitud</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-8">
        {/* Datos Personales */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Datos Personales</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                {...register('apellidos', { required: 'Los apellidos son requeridos' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="Ingrese sus apellidos"
              />
              {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                {...register('nombre', { required: 'El nombre es requerido' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="Ingrese su nombre"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CUIT/CUIL *
              </label>
              <input
                {...register('cuitCuil', { 
                  required: 'El CUIT/CUIL es requerido',
                  pattern: {
                    value: /^\d{2}-\d{8}-\d{1}$/,
                    message: 'Formato: 20-12345678-9'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="20-12345678-9"
              />
              {errors.cuitCuil && <p className="text-red-500 text-sm mt-1">{errors.cuitCuil.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                {...register('fechaNacimiento', { required: 'La fecha de nacimiento es requerida' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              />
              {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <select
                {...register('provincia', { required: 'La provincia es requerida' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value="">Seleccione una provincia</option>
                {PROVINCIAS.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
              </select>
              {errors.provincia && <p className="text-red-500 text-sm mt-1">{errors.provincia.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localidad *
              </label>
              <input
                {...register('localidad', { required: 'La localidad es requerida' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="Ingrese su localidad"
              />
              {errors.localidad && <p className="text-red-500 text-sm mt-1">{errors.localidad.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domicilio *
              </label>
              <input
                {...register('domicilio', { required: 'El domicilio es requerido' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="Calle y número"
              />
              {errors.domicilio && <p className="text-red-500 text-sm mt-1">{errors.domicilio.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal *
              </label>
              <input
                {...register('codigoPostal', { required: 'El código postal es requerido' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="1234"
              />
              {errors.codigoPostal && <p className="text-red-500 text-sm mt-1">{errors.codigoPostal.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="email@ejemplo.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                {...register('telefono', { required: 'El teléfono es requerido' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="+54 11 1234-5678"
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Civil *
              </label>
              <select
                {...register('estadoCivil', { required: 'El estado civil es requerido' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value="">Seleccione estado civil</option>
                {ESTADOS_CIVILES.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estadoCivil && <p className="text-red-500 text-sm mt-1">{errors.estadoCivil.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('tieneConyuge')}
                  className="mt-1 w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
                />
                <label className="text-sm text-gray-700 leading-relaxed">
                  ¿Tiene cónyuge?
                </label>
              </div>
            </div>
          </div>

          {/* Datos del Cónyuge (condicional) */}
          {watchTieneConyuge && (
            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900">Datos del Cónyuge</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre y Apellido *
                  </label>
                  <input
                    {...register('conyugeNombre', { 
                      required: watchTieneConyuge ? 'El nombre del cónyuge es requerido' : false 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="Nombre completo del cónyuge"
                  />
                  {errors.conyugeNombre && <p className="text-red-500 text-sm mt-1">{errors.conyugeNombre.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUIT/CUIL *
                  </label>
                  <input
                    {...register('conyugeCuitCuil', { 
                      required: watchTieneConyuge ? 'El CUIT/CUIL del cónyuge es requerido' : false,
                      pattern: {
                        value: /^\d{2}-\d{8}-\d{1}$/,
                        message: 'Formato: 20-12345678-9'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="20-12345678-9"
                  />
                  {errors.conyugeCuitCuil && <p className="text-red-500 text-sm mt-1">{errors.conyugeCuitCuil.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingresos Mensuales *
                  </label>
                  <input
                    type="number"
                    {...register('conyugeIngresos', { 
                      required: watchTieneConyuge ? 'Los ingresos del cónyuge son requeridos' : false,
                      min: { value: 1, message: 'Los ingresos deben ser mayor a 0' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="500000"
                    step="1000"
                  />
                  {errors.conyugeIngresos && <p className="text-red-500 text-sm mt-1">{errors.conyugeIngresos.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continúa en la siguiente parte... */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Formulario continúa con Datos Laborales, Vehículo y Documentación...</p>
        </div>

        {/* Botón de envío temporal */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}