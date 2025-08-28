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

  const [results, setResults] = useState<{[key: number]: Result}>({});
  const [selectedTerm, setSelectedTerm] = useState<number>(24);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableTerms = [6, 12, 24, 48];

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
                Valor de la Tasa (%) *
              </label>
              <input
                type="number"
                value={inputs.tasa.valor * 100}
                onChange={(e) => updateTasa('valor', Number(e.target.value) / 100)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm"
                placeholder="60"
                min="1"
                max="200"
                step="0.1"
              />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {availableTerms.map((term) => {
                const result = results[term];
                if (!result) return null;
                
                return (
                  <div key={term} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{term} meses</h4>
                        <p className="text-sm text-gray-600">
                          {term === 6 ? 'Pago rápido' : term === 12 ? 'Equilibrado' : term === 24 ? 'Recomendado' : 'Cuotas bajas'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">CFT Anual</div>
                        <div className="text-lg font-bold text-brand-accent-500">
                          {(result.totales.cftEfectivoAnual * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Cuota destacada */}
                    <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 rounded-xl p-4 text-white mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-brand-primary-100">Cuota mensual</div>
                          <div className="text-2xl font-bold">
                            ${Math.round(result.rows[0]?.cuotaTotal || 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-brand-primary-100">Total a pagar</div>
                          <div className="text-lg font-semibold">
                            ${Math.round(result.totales.sumaCuotas).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto que recibís:</span>
                        <span className="font-semibold text-green-600">
                          ${Math.round(result.totales.desembolsoNeto).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costos iniciales:</span>
                        <span className="font-semibold text-gray-900">
                          ${Math.round(result.totales.costosIniciales).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {/* Botón de solicitud */}
                    <button
                      onClick={() => {
                        if (onCalculationComplete) {
                          const calculationData = {
                            vehiclePrice: inputs.monto,
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
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Solicitar en {term} meses
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}