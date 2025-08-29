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

export default function KPIsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);

  const kpiData: KPIData[] = [
    {
      id: 'total_applications',
      title: 'Solicitudes Totales',
      value: '1,247',
      change: 12.5,
      changeType: 'increase',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Solicitudes recibidas en el período'
    },
    {
      id: 'approval_rate',
      title: 'Tasa de Aprobación',
      value: '68.3%',
      change: -2.1,
      changeType: 'decrease',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'Porcentaje de solicitudes aprobadas'
    },
    {
      id: 'avg_loan_amount',
      title: 'Préstamo Promedio',
      value: '$3.2M',
      change: 8.7,
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Monto promedio de préstamos aprobados'
    },
    {
      id: 'active_dealers',
      title: 'Dealers Activos',
      value: '89',
      change: 5.2,
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: 'Concesionarios con actividad reciente'
    },
    {
      id: 'avg_processing_time',
      title: 'Tiempo Promedio',
      value: '2.4 días',
      change: -15.3,
      changeType: 'increase',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Tiempo promedio de procesamiento'
    },
    {
      id: 'monthly_volume',
      title: 'Volumen Mensual',
      value: '$127.5M',
      change: 23.8,
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-emerald-500',
      description: 'Volumen total de préstamos del mes'
    }
  ];

  const statusDistribution: ChartData[] = [
    { name: 'Aprobadas', value: 68.3, color: '#10b981' },
    { name: 'Pendientes', value: 18.2, color: '#f59e0b' },
    { name: 'Rechazadas', value: 10.1, color: '#ef4444' },
    { name: 'Canceladas', value: 3.4, color: '#6b7280' }
  ];

  const monthlyTrend = [
    { month: 'Ene', applications: 980, approved: 668 },
    { month: 'Feb', applications: 1120, approved: 756 },
    { month: 'Mar', applications: 1050, approved: 714 },
    { month: 'Apr', applications: 1180, approved: 826 },
    { month: 'May', applications: 1247, approved: 851 }
  ];

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
    setLoading(true);
    setTimeRange(range);
    // Simular carga de datos
    setTimeout(() => setLoading(false), 800);
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
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {item.value}%
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
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(month.applications / 1300) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${(month.approved / 1300) * 100}%` }}
                      ></div>
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
              <div className="text-2xl font-bold mb-1">+12.5%</div>
              <div className="text-sm text-brand-primary-100">Crecimiento en solicitudes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">68.3%</div>
              <div className="text-sm text-brand-primary-100">Tasa de aprobación actual</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">2.4 días</div>
              <div className="text-sm text-brand-primary-100">Tiempo promedio de respuesta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
