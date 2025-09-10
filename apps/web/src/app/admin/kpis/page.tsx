'use client';

import { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Clock, Target, BarChart3, PieChart, Activity } from 'lucide-react';

interface KPIData {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface APIResponse {
  success: boolean;
  data: {
    kpiData: KPIData[];
    statusDistribution: ChartData[];
    monthlyTrend: MonthlyTrendData[];
    summary: {
      totalGrowth: number;
      approvalRate: number;
      avgProcessingTime: number;
    };
  };
  error?: string;
}

interface MonthlyTrendData {
  month: string;
  applications: number;
  approved: number;
}

export default function KPIsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<ChartData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Función para agregar iconos a los KPIs
  const addIconsToKPIs = (kpis: KPIData[]): KPIData[] => {
    const iconMap: { [key: string]: { icon: React.ReactNode; color: string } } = {
      'total_applications': { icon: <FileText className="w-6 h-6" />, color: 'bg-blue-500' },
      'approval_rate': { icon: <Target className="w-6 h-6" />, color: 'bg-green-500' },
      'avg_loan_amount': { icon: <DollarSign className="w-6 h-6" />, color: 'bg-purple-500' },
      'active_dealers': { icon: <Users className="w-6 h-6" />, color: 'bg-orange-500' },
      'avg_processing_time': { icon: <Clock className="w-6 h-6" />, color: 'bg-indigo-500' },
      'monthly_volume': { icon: <TrendingUp className="w-6 h-6" />, color: 'bg-emerald-500' },
    };

    return kpis.map(kpi => ({
      ...kpi,
      icon: iconMap[kpi.id]?.icon || <Activity className="w-6 h-6" />,
      color: iconMap[kpi.id]?.color || 'bg-gray-500'
    }));
  };

  // Función para obtener datos del API
  const fetchKPIData = async (period: '7d' | '30d' | '90d' | '1y') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/kpis?period=${period}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: APIResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al cargar KPIs');
      }

      // Agregar iconos y colores a los KPIs
      const kpisWithIcons = addIconsToKPIs(data.data.kpiData);
      
      setKpiData(kpisWithIcons);
      setStatusDistribution(data.data.statusDistribution);
      setMonthlyTrend(data.data.monthlyTrend);
      
    } catch (error) {
      console.error('❌ Error cargando KPIs:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Fallback a datos por defecto en caso de error
      setKpiData([]);
      setStatusDistribution([]);
      setMonthlyTrend([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambie el período
  useEffect(() => {
    fetchKPIData(timeRange);
  }, [timeRange]);

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return <TrendingUp className="w-4 h-4" />;
    if (changeType === 'decrease') return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === 'increase') return 'text-green-600 bg-green-50';
    if (changeType === 'decrease') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    // Los datos se cargarán automáticamente por el useEffect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <AdminNavigation 
        title="Dashboard de KPIs"
        subtitle="Métricas y análisis de rendimiento del sistema"
        stats={{
          count: kpiData.length,
          label: "métricas"
        }}
      />

      <div className="container mx-auto px-6 sm:px-8 py-6">
        {/* Filtros de tiempo */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-primary-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Período de Análisis</h2>
                <p className="text-gray-600 text-sm">Selecciona el rango de tiempo para las métricas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    timeRange === range
                      ? 'bg-brand-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' && 'Últimos 7 días'}
                  {range === '30d' && 'Últimos 30 días'}
                  {range === '90d' && 'Últimos 90 días'}
                  {range === '1y' && 'Último año'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Estado de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Error al cargar métricas</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => fetchKPIData(timeRange)}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Estado de Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary-600"></div>
                <span className="text-gray-700 font-medium">Cargando métricas...</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid de KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiData.map((kpi) => (
            <div key={kpi.id} className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${kpi.color} rounded-xl flex items-center justify-center text-white`}>
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getChangeColor(kpi.changeType)}`}>
                  {getChangeIcon(kpi.changeType)}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              </div>
              
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </div>
          ))}
        </div>

        {/* Gráficos y análisis detallado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución por Estado */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Distribución por Estado</h3>
                <p className="text-sm text-gray-600">Porcentaje de solicitudes por estado</p>
              </div>
            </div>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 w-1/2 sm:w-2/3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-14 text-right tabular-nums">
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tendencia Mensual */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tendencia Mensual</h3>
                <p className="text-sm text-gray-600">Solicitudes recibidas vs aprobadas</p>
              </div>
            </div>
            <div className="space-y-3">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="flex items-center justify-between py-2">
                  <div className="text-sm font-medium text-gray-700 w-12">{month.month}</div>
                  <div className="flex-1 flex items-center gap-2 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(month.applications / 1300) * 100}%` }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(month.approved / 1300) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{month.applications}</div>
                    <div className="text-xs text-green-600">{month.approved}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Recibidas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Aprobadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen ejecutivo */}
        {!loading && !error && kpiData.length > 0 && (
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Resumen Ejecutivo</h3>
                <p className="text-brand-primary-100">Análisis del período seleccionado</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">
                  {kpiData.find(k => k.id === 'total_applications')?.changeType === 'increase' ? '+' : ''}
                  {kpiData.find(k => k.id === 'total_applications')?.change.toFixed(1) || '0'}%
                </div>
                <div className="text-sm text-brand-primary-100">Crecimiento en solicitudes</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">
                  {kpiData.find(k => k.id === 'approval_rate')?.value || '0%'}
                </div>
                <div className="text-sm text-brand-primary-100">Tasa de aprobación actual</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">
                  {kpiData.find(k => k.id === 'avg_processing_time')?.value || '0 días'}
                </div>
                <div className="text-sm text-brand-primary-100">Tiempo promedio de respuesta</div>
              </div>
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay datos */}
        {!loading && !error && kpiData.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sin datos disponibles</h3>
            <p className="text-gray-600">No hay información suficiente para mostrar métricas en el período seleccionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
