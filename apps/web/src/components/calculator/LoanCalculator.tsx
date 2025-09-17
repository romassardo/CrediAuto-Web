'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, CheckCircle } from 'lucide-react';
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
    gastosOtorgamientoPct: 0, // 0%
    gastosFijosIniciales: 0,
    sellosPct: 0.012, // 1.2% sellos
    svsPctMensual: 0,
    seguroAutoMensual: 0,
  });

  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear());
  const [product, setProduct] = useState<'AUTO' | 'MOTO'>('AUTO');
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string>('');
  const [rateInfo, setRateInfo] = useState<string>('');
  const [results, setResults] = useState<{[key: number]: Result}>({});
  const [ratesByTerm, setRatesByTerm] = useState<Record<number, number | null>>({});
  const [selectedTerm, setSelectedTerm] = useState<number>(24);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lockRateTypeToTNA, setLockRateTypeToTNA] = useState(false); // cuando hay tasas del panel admin, forzamos TNA
  const [fallbackTerms, setFallbackTerms] = useState<number[]>([]);

  const availableTerms = useMemo(() => (product === 'AUTO' ? [6, 12, 18, 24, 36, 48] : [6, 12, 18]), [product]);

  // Asegurar que el plazo seleccionado esté disponible para el producto actual
  useEffect(() => {
    if (!availableTerms.includes(selectedTerm)) {
      setSelectedTerm(availableTerms[0]);
    }
  }, [availableTerms, selectedTerm]);

  // Obtener tasas por plazo según producto y año
  const fetchRatesByProductYear = async (prod: 'AUTO' | 'MOTO', year: number) => {
    setLoadingRate(true);
    setRateError('');
    setRateInfo('');
    try {
      const queries = availableTerms.map(async (term) => {
        const res = await fetch(`/api/rates/lookup?product=${prod}&year=${year}&term=${term}`);
        if (!res.ok) {
          return { term, rate: null as number | null, unit: undefined as string | undefined, fallback: false, error: await res.json().catch(() => ({})) };
        }
        const json = await res.json();
        const rate = (json?.success && json?.data?.interestRate != null) ? Number(json.data.interestRate) : null;
        const unit = json?.data?.unit as string | undefined;
        const fallback = Boolean(json?.data?.fallback);
        return { term, rate, unit, fallback };
      });
      const results = await Promise.all(queries);
      const map: Record<number, number | null> = {};
      let missing: number[] = [];
      const usedFallback: number[] = [];
      let anyUnitTNA = false;
      results.forEach(({ term, rate, unit, fallback }) => {
        map[term] = rate;
        if (rate == null) missing.push(term);
        if (fallback) usedFallback.push(term);
        if (unit === 'TNA') anyUnitTNA = true;
      });
      setRatesByTerm(map);
      setFallbackTerms(usedFallback);
      setLockRateTypeToTNA(anyUnitTNA);
      if (missing.length === availableTerms.length) {
        setRateError(`No hay tasas configuradas para ${prod} en el año ${year}.`);
      } else {
        const infoParts: string[] = [];
        if (missing.length > 0) {
          infoParts.push(`Se aplicaron tasas para ${availableTerms.filter(t => !missing.includes(t)).join(', ')} meses. Faltan: ${missing.join(', ')}.`);
        } else {
          infoParts.push('Tasas por plazo aplicadas correctamente.');
        }
        if (usedFallback.length > 0 && prod === 'AUTO') {
          infoParts.push(`Se usó tasa general (sin plazo) para: ${usedFallback.join(', ')} meses.`);
        }
        setRateInfo(infoParts.join(' '));
      }
    } catch (err) {
      console.error('Error al obtener tasas por plazo:', err);
      setRateError('Error al obtener las tasas.');
      setRatesByTerm({});
    } finally {
      setLoadingRate(false);
    }
  };

  // Efecto: cargar tasas por plazo al cambiar producto o año
  useEffect(() => {
    if (vehicleYear >= 1990 && vehicleYear <= new Date().getFullYear() + 1) {
      fetchRatesByProductYear(product, vehicleYear);
    }
  }, [vehicleYear, product]);

  // Si las tasas provienen del panel admin (unit=TNA), forzamos el tipo de tasa a TNA en el UI
  useEffect(() => {
    if (lockRateTypeToTNA && inputs.tasa.tipo !== 'TNA') {
      updateTasa('tipo', 'TNA');
    }
  }, [lockRateTypeToTNA]);

  useEffect(() => {
    try {
      const newResults: {[key: number]: Result} = {};
      availableTerms.forEach(term => {
        const rate = ratesByTerm[term];
        if (rate != null) {
          const tasaForTerm = lockRateTypeToTNA
            ? ({ tipo: 'TNA', valor: rate } as any)
            : ({ ...inputs.tasa, valor: rate } as any);
          const inputsForTerm = { ...inputs, plazoMeses: term, tasa: tasaForTerm };
          newResults[term] = calcular(inputsForTerm);
        }
      });
      setResults(newResults);

      if (newResults[selectedTerm]) {
        onCalculationChange?.(newResults[selectedTerm]);
      } else {
        onCalculationChange?.(null);
      }
    } catch (error) {
      console.error('Error en cálculo:', error);
      setResults({});
      onCalculationChange?.(null);
    }
  }, [inputs.monto, inputs.ivaInteres, inputs.gastosOtorgamientoPct, inputs.gastosFijosIniciales, inputs.sellosPct, inputs.svsPctMensual, inputs.seguroAutoMensual, inputs.tasa.tipo, ratesByTerm, selectedTerm, onCalculationChange, lockRateTypeToTNA]);

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
            <h2 className="text-3xl font-bold text-white">Simulador de Préstamos</h2>
          </div>
          <p className="text-brand-primary-100 text-lg">Simulá tu préstamo prendario en tiempo real</p>
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
                Producto *
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as 'AUTO' | 'MOTO')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-600 focus:border-brand-primary-600 transition-all bg-white text-gray-900 shadow-sm"
              >
                <option value="AUTO">Auto</option>
                <option value="MOTO">Moto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tasa *
              </label>
              <select
                value={inputs.tasa.tipo}
                onChange={(e) => updateTasa('tipo', e.target.value)}
                disabled={lockRateTypeToTNA}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all bg-white text-gray-900 shadow-sm ${lockRateTypeToTNA ? 'border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-brand-primary-600 focus:border-brand-primary-600'}`}
              >
                <option value="TNA">TNA (Tasa Nominal Anual)</option>
                <option value="TEA">TEA (Tasa Efectiva Anual)</option>
                <option value="MENSUAL">Tasa Mensual</option>
              </select>
              {lockRateTypeToTNA && (
                <p className="mt-1 text-xs text-gray-500">Fijado en TNA por tasas configuradas desde el panel de administración.</p>
              )}
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
                    placeholder="0"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados por Plazo */}
        {availableTerms.length > 0 && (
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
                  const rate = ratesByTerm[term];
                  
                  return (
                    <li key={term} className="bg-white">
                      <details className="group">
                        <summary className="flex items-center justify-between w-full cursor-pointer px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600">
                          <div className="flex items-baseline gap-4">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">{term} meses</span>
                          </div>
                          <div className="text-right">
                            {rate == null ? (
                              <div className="text-sm font-medium text-red-600">Sin tasa configurada</div>
                            ) : (
                              <>
                                <div className="text-xs text-gray-500">Cuota mensual</div>
                                <div className="text-lg sm:text-xl font-bold text-gray-900">
                                  ${result ? Math.round(result.rows[0]?.cuotaTotal || 0).toLocaleString('es-AR') : '—'}
                                </div>
                              </>
                            )}
                          </div>
                        </summary>
                        <div className="px-4 sm:px-6 pb-5">
                          {rate == null || !result ? (
                            <div className="text-sm text-red-600">No hay tasa configurada para este plazo. No es posible calcular.</div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">{lockRateTypeToTNA ? 'Tasa de Interés (TNA)' : `Tasa de Interés (${inputs.tasa.tipo})`}</span>
                                  <span className="font-semibold text-brand-accent-500">{(rate * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Monto que recibís</span>
                                  <span className="font-semibold text-green-600">${Math.round(result.totales.desembolsoNeto).toLocaleString('es-AR')}</span>
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
                                        interestRate: rate,
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
                            </>
                          )}
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