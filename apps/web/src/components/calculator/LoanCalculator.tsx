'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent, CheckCircle } from 'lucide-react';
import { calcular, type Inputs, type Result } from '@/lib/calculator/loan-calculator';

interface LoanCalculatorProps {
  className?: string;
  onCalculationComplete?: (result: any) => void;
  onCalculationChange?: (result: Result | null) => void;
}

export default function LoanCalculator({ onCalculationChange, onCalculationComplete }: LoanCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>({
    monto: 5000000,
    plazoMeses: 36,
    tasa: { tipo: 'TNA', valor: 0.60 }, // 60% TNA
    ivaInteres: 0.21, // 21% IVA
    gastosOtorgamientoPct: 0.03, // 3%
    gastosFijosIniciales: 0,
    sellosPct: 0.012, // 1.2% sellos
    svsPctMensual: 0,
    seguroAutoMensual: 0,
  });

  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear());
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string>('');
  const [rateInfo, setRateInfo] = useState<string>('');
  const [results, setResults] = useState<{[key: number]: Result}>({});
  const [selectedTerm, setSelectedTerm] = useState<number>(24);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableTerms = [6, 12, 24, 48];

  // Función para obtener la tasa según el año del vehículo
  const fetchRateByYear = async (year: number) => {
    setLoadingRate(true);
    setRateError('');
    setRateInfo('');
    
    try {
      const response = await fetch(`/api/rates/by-year?year=${year}`);
      const json = await response.json();
      
      if (json?.success && json?.data?.interestRate != null) {
        // Actualizar la tasa en los inputs
        const { interestRate, rateRange } = json.data;
        updateTasa('valor', Number(interestRate));
        const yFrom = rateRange?.yearFrom ?? '';
        const yTo = rateRange?.yearTo ?? '';
        setRateInfo(`Tasa aplicada: ${(Number(interestRate) * 100).toFixed(1)}% ${yFrom && yTo ? `para vehículos ${yFrom}-${yTo}` : ''}`);
      } else {
        setRateError(json?.error || 'No se encontró una tasa para este año');
        // Mantener tasa por defecto
        updateTasa('valor', 0.60); // 60% por defecto
      }
    } catch (error) {
      console.error('Error al obtener tasa:', error);
      setRateError('Error al obtener la tasa. Se usará la tasa por defecto.');
      updateTasa('valor', 0.60); // 60% por defecto
    } finally {
      setLoadingRate(false);
    }
  };

  // Efecto para obtener tasa cuando cambia el año
  useEffect(() => {
    if (vehicleYear >= 1990 && vehicleYear <= new Date().getFullYear() + 1) {
      fetchRateByYear(vehicleYear);
    }
  }, [vehicleYear]);

  useEffect(() => {
    try {
      // Calcular para todos los plazos disponibles
      const newResults: {[key: number]: Result} = {};
      
      availableTerms.forEach(term => {
        const inputsForTerm = { ...inputs, plazoMeses: term };
        newResults[term] = calcular(inputsForTerm);
      });
      
      setResults(newResults);
      
      // Notificar el resultado del plazo seleccionado
      if (newResults[selectedTerm]) {
        onCalculationChange?.(newResults[selectedTerm]);
      }
    } catch (error) {
      console.error('Error en cálculo:', error);
      setResults({});
      onCalculationChange?.(null);
    }
  }, [inputs, selectedTerm, onCalculationChange]);

  const updateInput = (field: keyof Inputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateTasa = (field: 'tipo' | 'valor', value: any) => {
    setInputs(prev => ({
      ...prev,
      tasa: { ...prev.tasa, [field]: value }
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
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
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Calculadora de Préstamos</h2>
          </div>
          <p className="text-brand-primary-100 text-lg">Calcula tu préstamo prendario en tiempo real</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Campos básicos */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Datos del Préstamo</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Financiar *
              </label>
              <input
                type="number"
                value={inputs.monto}
                onChange={(e) => updateInput('monto', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="5.000.000"
                min="100000"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año del Vehículo *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                  placeholder={new Date().getFullYear().toString()}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
                {loadingRate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary-600"></div>
                  </div>
                )}
              </div>
              {rateInfo && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {rateInfo}
                </p>
              )}
              {rateError && (
                <p className="text-sm text-red-600 mt-1">
                  {rateError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tasa *
              </label>
              <select
                value={inputs.tasa.tipo}
                onChange={(e) => updateTasa('tipo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value="TNA">TNA (Tasa Nominal Anual)</option>
                <option value="TEA">TEA (Tasa Efectiva Anual)</option>
                <option value="MENSUAL">Tasa Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Interés (%) - Solo Lectura
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputs.tasa.valor * 100}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed shadow-sm"
                  placeholder="60"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Percent className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La tasa se asigna automáticamente según el año del vehículo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA sobre Intereses *
              </label>
              <select
                value={inputs.ivaInteres}
                onChange={(e) => updateInput('ivaInteres', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value={0}>Sin IVA (0%)</option>
                <option value={0.105}>IVA Reducido (10.5%)</option>
                <option value={0.21}>IVA General (21%)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-sm font-medium text-brand-primary-700 hover:text-brand-primary-800 underline"
            >
              {showAdvanced ? 'Ocultar configuración avanzada' : 'Mostrar configuración avanzada'}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Configuración avanzada</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gastos de Otorgamiento (%)
                  </label>
                  <input
                    type="number"
                    value={(inputs.gastosOtorgamientoPct ?? 0) * 100}
                    onChange={(e) => updateInput('gastosOtorgamientoPct', Number(e.target.value) / 100)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                    placeholder="3"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                La cuota se calcula con tasa mensual que <strong>incluye IVA</strong> y se <strong>redondea a entero</strong>. Conversión TNA→TEM: 365/30. El CFT anual se obtiene sobre el desembolso neto (descontando <strong>solo</strong> gastos de otorgamiento <em>netos de IVA</em>) y se anualiza con 365/30.
              </div>
            </div>
          )}
        </div>

        {/* Resultados por Plazo */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Resultados por Plazo</h3>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {availableTerms.map((term) => {
                  const result = results[term];
                  if (!result) return null;
                  
                  return (
                    <li key={term} className="bg-white">
                      <details className="group">
                        <summary className="flex items-center justify-between w-full cursor-pointer px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600">
                          <div className="flex items-baseline gap-4">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">{term} meses</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Cuota mensual</div>
                            <div className="text-lg sm:text-xl font-bold text-gray-900">
                              ${Math.round(result.rows[0]?.cuotaTotal || 0).toLocaleString('es-AR')}
                            </div>
                          </div>
                        </summary>
                        <div className="px-4 sm:px-6 pb-5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">CFT Anual</span>
                              <span className="font-semibold text-brand-accent-500">{(result.totales.cftEfectivoAnual * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monto que recibís</span>
                              <span className="font-semibold text-green-600">${Math.round(result.totales.desembolsoNeto).toLocaleString('es-AR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Costos iniciales</span>
                              <span className="font-semibold text-gray-900">${Math.round(result.totales.costosIniciales).toLocaleString('es-AR')}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                if (onCalculationComplete) {
                                  const calculationData = {
                                    vehiclePrice: inputs.monto,
                                    vehicleYear: vehicleYear,
                                    downPayment: 0,
                                    loanTerm: term,
                                    interestRate: inputs.tasa.valor,
                                    loanAmount: result.totales.desembolsoNeto,
                                    monthlyPayment: result.rows[0]?.cuotaTotal || 0,
                                    totalAmount: result.totales.sumaCuotas,
                                    cft: result.totales.cftEfectivoAnual
                                  };
                                  onCalculationComplete(calculationData);
                                }
                              }}
                              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Solicitar en {term} meses
                            </button>
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}