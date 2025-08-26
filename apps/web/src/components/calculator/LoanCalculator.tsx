'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';
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

  const [result, setResult] = useState<Result | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    try {
      const calculationResult = calcular(inputs);
      setResult(calculationResult);
      onCalculationChange?.(calculationResult);
    } catch (error) {
      console.error('Error en cálculo:', error);
      setResult(null);
      onCalculationChange?.(null);
    }
  }, [inputs, onCalculationChange]);

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
                Plazo en Meses *
              </label>
              <select
                value={inputs.plazoMeses}
                onChange={(e) => updateInput('plazoMeses', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
                <option value={36}>36 meses</option>
                <option value={48}>48 meses</option>
              </select>
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
        </div>

        {/* Configuración avanzada */}
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-brand-primary-600 hover:text-brand-primary-700 font-medium transition-colors"
          >
            <Percent className="w-4 h-4" />
            {showAdvanced ? 'Ocultar' : 'Mostrar'} configuración avanzada
          </button>

          {showAdvanced && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gastos de Otorgamiento (%)
                  </label>
                  <input
                    type="number"
                    value={(inputs.gastosOtorgamientoPct || 0) * 100}
                    onChange={(e) => updateInput('gastosOtorgamientoPct', Number(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="3"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impuesto de Sellos (%)
                  </label>
                  <input
                    type="number"
                    value={(inputs.sellosPct || 0) * 100}
                    onChange={(e) => updateInput('sellosPct', Number(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="1.2"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gastos Fijos Iniciales ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.gastosFijosIniciales || 0}
                    onChange={(e) => updateInput('gastosFijosIniciales', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seguro Auto Mensual ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.seguroAutoMensual || 0}
                    onChange={(e) => updateInput('seguroAutoMensual', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Resultados del Cálculo</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cuota Mensual - Destacada */}
              <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-primary-100">Cuota Mensual</div>
                      <div className="text-xs text-brand-primary-200">Durante {result.rows.length} meses</div>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2">${Math.round(result.rows[0]?.cuotaTotal || 0).toLocaleString('es-AR')}</div>
                  <div className="text-sm text-brand-primary-200">
                    Incluye capital, intereses e IVA
                  </div>
                </div>
              </div>

              {/* CFT Anual */}
              <div className="bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-2xl p-8 text-gray-900 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-full translate-y-10 -translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                      <Percent className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 font-medium">CFT Anual</div>
                      <div className="text-xs text-gray-700">Costo Financiero Total</div>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2">{(result.totales.cftEfectivoAnual * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-700">
                    Incluye todos los costos
                  </div>
                </div>
              </div>

              {/* Monto que Recibís */}
              <div className="bg-white border-2 border-green-200 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-green-800 font-medium">Monto que Recibís</div>
                      <div className="text-xs text-green-600">Después de gastos</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    ${Math.round(result.totales.desembolsoNeto).toLocaleString('es-AR')}
                  </div>
                  <div className="text-sm text-green-600">
                    De ${Math.round(result.totales.desembolsoBruto).toLocaleString('es-AR')} solicitados
                  </div>
                </div>
              </div>

              {/* Total a Pagar */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gray-50 rounded-full translate-y-14 -translate-x-14"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 font-medium">Total a Pagar</div>
                      <div className="text-xs text-gray-600">Suma de todas las cuotas</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    ${Math.round(result.totales.sumaCuotas).toLocaleString('es-AR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    En {result.rows.length} cuotas mensuales
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Detalle de Costos</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Monto Bruto:</span>
                  <span className="font-semibold text-blue-900 ml-2">{formatCurrency(result.totales.desembolsoBruto)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Costos Iniciales:</span>
                  <span className="font-semibold text-blue-900 ml-2">{formatCurrency(result.totales.costosIniciales)}</span>
                </div>
                <div>
                  <span className="text-blue-700">CFT Mensual:</span>
                  <span className="font-semibold text-blue-900 ml-2">{formatPercent(result.totales.cftMensual)}</span>
                </div>
              </div>
            </div>

            {/* Botón para solicitar préstamo */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-900 mb-2">¿Te convencen estos números?</h4>
                <p className="text-green-700 mb-4">Solicita tu préstamo con estos valores calculados</p>
                <button
                  onClick={() => {
                    if (onCalculationComplete) {
                      const calculationData = {
                        // Parámetros de entrada
                        vehiclePrice: inputs.monto,
                        downPayment: 0, // Por ahora sin anticipo
                        loanTerm: inputs.plazoMeses,
                        interestRate: inputs.tasa.valor,
                        
                        // Resultados calculados
                        loanAmount: result.totales.desembolsoNeto,
                        monthlyPayment: result.rows[0]?.cuotaTotal || 0,
                        totalAmount: result.totales.sumaCuotas,
                        cft: result.totales.cftEfectivoAnual
                      };
                      
                      // Llamar al callback para pasar los datos al formulario
                      onCalculationComplete(calculationData);
                    }
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                >
                  <DollarSign className="w-5 h-5" />
                  Solicitar con estos valores
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}