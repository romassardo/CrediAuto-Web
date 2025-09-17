'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Briefcase, Car, Upload, Heart, FileText, CheckCircle, ArrowRight, ArrowLeft, Calculator } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import { type Result } from '@/lib/calculator/loan-calculator';

interface LoanApplicationStepsProps {
  calculationResult?: Result | null;
  calculationData?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

interface FormData {
  // Datos Personales
  nombre: string;
  apellido: string;
  cuil: string;
  fechaNacimiento: string;
  provincia: string;
  localidad: string;
  domicilio: string;
  codigoPostal: string;
  email: string;
  telefono: string;
  estadoCivil: string;
  
  // Datos del Cónyuge (condicional)
  tieneConyugue: boolean;
  cuilConyugue?: string;
  nombreConyugue?: string;
  apellidoConyugue?: string;
  ingresoConyugue?: string;
  
  // Datos Laborales
  relacionLaboral: string;
  otraRelacionLaboral?: string;
  empresa: string;
  telefonoEmpresa: string;
  antiguedad: string;
  
  // Datos del Vehículo
  condicionVehiculo: string;
  marca: string;
  modelo: string;
  anio: string;
  version: string;
  
  // Documentación
  documentos: File[];
}

const steps = [
  {
    id: 'personal',
    title: 'Datos Personales',
    icon: User,
    description: 'Información básica del solicitante'
  },
  {
    id: 'spouse',
    title: 'Datos del Cónyuge',
    icon: Heart,
    description: 'Información del cónyuge (si aplica)'
  },
  {
    id: 'work',
    title: 'Datos Laborales',
    icon: Briefcase,
    description: 'Información laboral y de ingresos'
  },
  {
    id: 'vehicle',
    title: 'Datos del Vehículo',
    icon: Car,
    description: 'Información del vehículo a financiar'
  },
  {
    id: 'documents',
    title: 'Documentación',
    icon: Upload,
    description: 'Adjuntar documentos requeridos'
  }
];

export default function LoanApplicationSteps({ calculationResult, calculationData, onSubmit, isSubmitting = false }: LoanApplicationStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, trigger, getValues } = useForm<FormData>();
  
  const tieneConyugue = watch('tieneConyugue');
  const relacionLaboral = watch('relacionLaboral');
  const condicionVehiculo = watch('condicionVehiculo');

  const nextStep = async () => {
    const stepFields = getStepFields(currentStep);
    const isValid = await trigger(stepFields);
    
    if (isValid) {
      if (currentStep === 1 && !tieneConyugue) {
        setCurrentStep(2); // Saltar paso del cónyuge si no tiene
      } else {
        setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 2 && !tieneConyugue) {
      setCurrentStep(0); // Volver a datos personales si no tiene cónyuge
    } else {
      setCurrentStep(Math.max(currentStep - 1, 0));
    }
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0: return ['nombre', 'apellido', 'cuil', 'fechaNacimiento', 'provincia', 'localidad', 'domicilio', 'codigoPostal', 'email', 'telefono', 'estadoCivil'];
      case 1: return tieneConyugue ? ['cuilConyugue', 'nombreConyugue', 'apellidoConyugue', 'ingresoConyugue'] : [];
      case 2: return ['relacionLaboral', 'empresa', 'telefonoEmpresa', 'antiguedad'];
      case 3: return ['condicionVehiculo', 'marca', 'modelo', 'anio', 'version'];
      case 4: return [];
      default: return [];
    }
  };

  const handleFinalSubmit = handleSubmit((formData) => {
    // Guard adicional: si no hay cálculo, simplemente cerrar el modal y no enviar
    if (!calculationResult) {
      setShowConfirmation(false);
      return;
    }
    // Llama a onSubmit (que es handleLoanSubmit en el hook) con los datos del formulario.
    // El hook se encargará de mapear y añadir los datos de cálculo.
    onSubmit(formData);
    setShowConfirmation(false);
  });

  const handleSubmitClick = () => {
    setShowConfirmation(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
      {/* Header con Steps */}
      <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-brand-accent-500 rounded-full flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4 text-gray-900 font-bold" />
          </div>
          <h2 className="text-2xl font-bold text-white">Solicitud de Préstamo</h2>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isSkipped = index === 1 && !tieneConyugue && currentStep > 1;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-brand-accent-500 text-gray-900' 
                    : isActive 
                      ? 'bg-white text-brand-primary-600 ring-4 ring-white/30' 
                      : isSkipped
                        ? 'bg-gray-400 text-white'
                        : 'bg-white/20 text-white/60'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-white' : isCompleted ? 'text-brand-accent-500' : 'text-white/70'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-white/50 max-w-[80px] leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/20">
            <div 
              className="h-full bg-brand-accent-500 transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resumen de Cálculo */}
      {calculationData && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Calculator className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Valores Calculados para tu Préstamo</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">Monto del Vehículo</p>
                <p className="text-lg font-bold text-green-900">
                  ${calculationData.vehiclePrice?.toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">Cuota Mensual</p>
                <p className="text-lg font-bold text-green-900">
                  ${calculationData.monthlyPayment?.toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">Plazo</p>
                <p className="text-lg font-bold text-green-900">
                  {calculationData.loanTerm} meses
                </p>
              </div>
            </div>
            
            <div className="bg-green-100 rounded-lg p-2 text-center border border-green-200">
              <p className="text-xs text-green-800">
                <strong>✓ Estos valores serán incluidos en tu solicitud.</strong> Completa los datos personales a continuación para enviar tu solicitud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-8">
        {/* Step 0: Datos Personales */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  {...register('nombre', { required: 'Nombre es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Juan"
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                <input
                  {...register('apellido', { required: 'Apellido es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Pérez"
                />
                {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CUIL *</label>
                <input
                  {...register('cuil', { required: 'CUIL es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="20-12345678-9"
                />
                {errors.cuil && <p className="text-red-500 text-sm mt-1">{errors.cuil.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  {...register('fechaNacimiento', { required: 'Fecha de nacimiento es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                />
                {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                <input
                  {...register('provincia', { required: 'Provincia es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Buenos Aires"
                />
                {errors.provincia && <p className="text-red-500 text-sm mt-1">{errors.provincia.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localidad *</label>
                <input
                  {...register('localidad', { required: 'Localidad es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="CABA"
                />
                {errors.localidad && <p className="text-red-500 text-sm mt-1">{errors.localidad.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio *</label>
                <input
                  {...register('domicilio', { required: 'Domicilio es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Av. Corrientes 1234"
                />
                {errors.domicilio && <p className="text-red-500 text-sm mt-1">{errors.domicilio.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal *</label>
                <input
                  {...register('codigoPostal', { required: 'Código postal es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="1043"
                />
                {errors.codigoPostal && <p className="text-red-500 text-sm mt-1">{errors.codigoPostal.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="usuario@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <input
                  {...register('telefono', { required: 'Teléfono es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil *</label>
                <select
                  {...register('estadoCivil', { required: 'Estado civil es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900"
                >
                  <option value="">Seleccionar...</option>
                  <option value="soltero">Soltero/a</option>
                  <option value="casado">Casado/a</option>
                  <option value="divorciado">Divorciado/a</option>
                  <option value="viudo">Viudo/a</option>
                  <option value="union_convivencial">Unión Convivencial</option>
                </select>
                {errors.estadoCivil && <p className="text-red-500 text-sm mt-1">{errors.estadoCivil.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Datos del Cónyuge */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-brand-accent-500/10 rounded-lg border border-brand-accent-500/20">
              <Heart className="w-5 h-5 text-brand-primary-600" />
              <div>
                <p className="font-medium text-brand-primary-600">¿Tiene cónyuge?</p>
                <p className="text-sm text-gray-600">Marque si está casado/a o en unión convivencial</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('tieneConyugue')}
                  className="w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
                />
                <span className="text-sm font-medium text-gray-700">Sí, tengo cónyuge</span>
              </label>
            </div>

            {tieneConyugue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CUIL del Cónyuge *</label>
                  <input
                    {...register('cuilConyugue', { 
                      required: tieneConyugue ? 'CUIL del cónyuge es requerido' : false 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="27-12345678-9"
                  />
                  {errors.cuilConyugue && <p className="text-red-500 text-sm mt-1">{errors.cuilConyugue.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cónyuge *</label>
                  <input
                    {...register('nombreConyugue', { 
                      required: tieneConyugue ? 'Nombre del cónyuge es requerido' : false 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="María"
                  />
                  {errors.nombreConyugue && <p className="text-red-500 text-sm mt-1">{errors.nombreConyugue.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido del Cónyuge *</label>
                  <input
                    {...register('apellidoConyugue', { 
                      required: tieneConyugue ? 'Apellido del cónyuge es requerido' : false 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="González"
                  />
                  {errors.apellidoConyugue && <p className="text-red-500 text-sm mt-1">{errors.apellidoConyugue.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingreso Mensual del Cónyuge *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('ingresoConyugue', {
                      required: tieneConyugue ? 'Ingreso del cónyuge es requerido' : false,
                      validate: (v) => !tieneConyugue || (!!v && !isNaN(Number(v)) && Number(v) > 0) || 'Ingrese un monto válido',
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="500000"
                  />
                  {errors.ingresoConyugue && <p className="text-red-500 text-sm mt-1">{errors.ingresoConyugue.message}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Datos Laborales */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relación Laboral *</label>
                <select
                  {...register('relacionLaboral', { required: 'Relación laboral es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900"
                >
                  <option value="">Seleccionar...</option>
                  <option value="empleado_relacion_dependencia">Empleado en Relación de Dependencia</option>
                  <option value="empleado_publico">Empleado Público</option>
                  <option value="jubilado_pensionado">Jubilado/Pensionado</option>
                  <option value="trabajador_autonomo">Trabajador Autónomo</option>
                  <option value="profesional_independiente">Profesional Independiente</option>
                  <option value="comerciante">Comerciante</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.relacionLaboral && <p className="text-red-500 text-sm mt-1">{errors.relacionLaboral.message}</p>}
              </div>

              {relacionLaboral === 'otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especificar Relación Laboral *</label>
                  <input
                    {...register('otraRelacionLaboral', { 
                      required: relacionLaboral === 'otro' ? 'Debe especificar la relación laboral' : false 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Especificar..."
                  />
                  {errors.otraRelacionLaboral && <p className="text-red-500 text-sm mt-1">{errors.otraRelacionLaboral.message}</p>}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
                <input
                  {...register('empresa', { required: 'Empresa es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Nombre de la empresa"
                />
                {errors.empresa && <p className="text-red-500 text-sm mt-1">{errors.empresa.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono Empresa *</label>
                <input
                  {...register('telefonoEmpresa', { required: 'Teléfono de empresa es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefonoEmpresa && <p className="text-red-500 text-sm mt-1">{errors.telefonoEmpresa.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Antigüedad *</label>
                <input
                  {...register('antiguedad', { required: 'Antigüedad es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="2 años"
                />
                {errors.antiguedad && <p className="text-red-500 text-sm mt-1">{errors.antiguedad.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Datos del Vehículo */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Car className="w-5 h-5 text-brand-primary-600" />
              <div>
                <p className="font-medium text-brand-primary-600">Información del Vehículo</p>
                <p className="text-sm text-gray-600">Complete los datos del vehículo que desea financiar</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condición del Vehículo *</label>
                <select
                  {...register('condicionVehiculo', { required: 'Condición del vehículo es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900"
                >
                  <option value="">Seleccionar...</option>
                  <option value="nuevo">Nuevo (0 km)</option>
                  <option value="usado">Usado</option>
                </select>
                {errors.condicionVehiculo && <p className="text-red-500 text-sm mt-1">{errors.condicionVehiculo.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                <input
                  {...register('marca', { required: 'Marca es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Toyota, Ford, Chevrolet..."
                />
                {errors.marca && <p className="text-red-500 text-sm mt-1">{errors.marca.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                <input
                  {...register('modelo', { required: 'Modelo es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Corolla, Focus, Onix..."
                />
                {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                <input
                  type="number"
                  min="2000"
                  max="2025"
                  {...register('anio', { required: 'Año es requerido' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="2024"
                />
                {errors.anio && <p className="text-red-500 text-sm mt-1">{errors.anio.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Versión *</label>
                <input
                  {...register('version', { required: 'Versión es requerida' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all text-gray-900 placeholder-gray-500"
                  placeholder="XEI 1.8 CVT, SE 1.6, LTZ 1.4 Turbo..."
                />
                {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version.message}</p>}
              </div>
            </div>

            {/* Nota sobre documentación según condición del vehículo eliminada por solicitud del cliente */}
          </div>
        )}

        {/* Step 4: Documentación */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Sección simplificada: solo una descripción antes del uploader */}
            <p className="text-sm text-gray-700">
              Adjuntá aquí la documentación necesaria para procesar tu solicitud.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjuntar Documentos *
              </label>
              <FileUpload
                onFilesChange={(files) => {
                  // Actualizar el valor en react-hook-form
                  register('documentos').onChange({
                    target: { value: files, name: 'documentos' }
                  });
                }}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={true}
                maxSize={10}
                maxFiles={10}
                error={errors.documentos?.message}
              />
            </div>

            {/* Se eliminó el bloque de "Resumen de la Solicitud" a pedido del cliente */}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting || (currentStep === 1 && !calculationResult)}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : (currentStep === 1 && !calculationResult ? 'Complete el Cálculo Primero' : 'Siguiente')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={!calculationResult || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-accent-500 to-yellow-500 hover:from-yellow-500 hover:to-brand-accent-500 text-gray-900 px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : (calculationResult ? 'Enviar Solicitud' : 'Complete el Cálculo Primero')}
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-accent-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-900" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Confirmar Envío de Solicitud?
              </h3>
              
              <p className="text-gray-600 mb-6">
                Una vez enviada, la solicitud será procesada por nuestro equipo. 
                Asegúrate de haber cargado todos los documentos requeridos.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Envío'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}