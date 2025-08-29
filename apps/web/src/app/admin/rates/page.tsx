'use client';

import { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Settings, DollarSign, Percent, Calculator, Save, RefreshCw, AlertCircle, Plus, Edit, Trash2, Calendar } from 'lucide-react';

interface InterestRateRange {
  id: number;
  name: string;
  description?: string;
  yearFrom: number;
  yearTo: number;
  interestRate: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface RateRangeFormData {
  name: string;
  description: string;
  yearFrom: number;
  yearTo: number;
  interestRate: number;
  isActive: boolean;
  priority: number;
}

export default function RatesPage() {
  const [rateRanges, setRateRanges] = useState<InterestRateRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRange, setEditingRange] = useState<InterestRateRange | null>(null);
  const [formData, setFormData] = useState<RateRangeFormData>({
    name: '',
    description: '',
    yearFrom: new Date().getFullYear() - 10,
    yearTo: new Date().getFullYear(),
    interestRate: 0.45,
    isActive: true,
    priority: 0
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Función para obtener token desde cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return value;
      }
    }
    return null;
  };

  // Cargar rangos de tasas desde la API
  const fetchRateRanges = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getTokenFromCookies();
      const response = await fetch('/api/admin/rates', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar rangos de tasas');
      }
      
      const result = await response.json();
      if (result.success) {
        setRateRanges(result.data);
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión al cargar rangos de tasas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRateRanges();
  }, []);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getTokenFromCookies();
      const url = editingRange 
        ? `/api/admin/rates/${editingRange.id}`
        : '/api/admin/rates';
      
      const method = editingRange ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message || 'Operación exitosa');
        setShowCreateModal(false);
        setEditingRange(null);
        resetForm();
        await fetchRateRanges();
      } else {
        setError(result.error || 'Error en la operación');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar rango de tasas
  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este rango de tasas?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = getTokenFromCookies();
      const response = await fetch(`/api/admin/rates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Rango eliminado exitosamente');
        await fetchRateRanges();
      } else {
        setError(result.error || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      yearFrom: new Date().getFullYear() - 10,
      yearTo: new Date().getFullYear(),
      interestRate: 0.45,
      isActive: true,
      priority: 0
    });
  };

  // Abrir modal de edición
  const handleEdit = (range: InterestRateRange) => {
    setEditingRange(range);
    setFormData({
      name: range.name,
      description: range.description || '',
      yearFrom: range.yearFrom,
      yearTo: range.yearTo,
      interestRate: range.interestRate,
      isActive: range.isActive,
      priority: range.priority
    });
    setShowCreateModal(true);
  };

  // Formatear tasa como porcentaje
  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <AdminNavigation 
        title="Gestión de Tasas por Años"
        subtitle="Configuración de tasas de interés según el año del vehículo"
        stats={{
          count: rateRanges.length,
          label: "rangos configurados"
        }}
      />

      <div className="container mx-auto px-6 sm:px-8 py-6">
        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Header con acciones */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rangos de Tasas por Años</h2>
                <p className="text-gray-600 text-sm">
                  Configure tasas de interés según el año del modelo del vehículo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRateRanges}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setEditingRange(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Rango
              </button>
            </div>
          </div>
        </div>

        {/* Lista de rangos de tasas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 border-blue-200 text-blue-700">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Rangos de Tasas Configurados</h3>
                <p className="text-sm text-gray-600">{rateRanges.length} rangos activos</p>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Cargando rangos de tasas...</p>
              </div>
            ) : rateRanges.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay rangos configurados</h4>
                <p className="text-gray-600 mb-4">Cree el primer rango de tasas para comenzar</p>
                <button
                  onClick={() => {
                    resetForm();
                    setEditingRange(null);
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Crear Primer Rango
                </button>
              </div>
            ) : (
              rateRanges.map((range) => (
                <div key={range.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{range.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            range.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {range.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {range.priority > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Prioridad {range.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      {range.description && (
                        <p className="text-gray-600 text-sm mb-3">{range.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Años: {range.yearFrom} - {range.yearTo}</span>
                        <span>•</span>
                        <span>Tasa: {formatRate(range.interestRate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => handleEdit(range)}
                        className="p-2 text-gray-600 hover:text-brand-primary-600 hover:bg-brand-primary-50 rounded-lg transition-all"
                        title="Editar rango"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(range.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar rango"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal para crear/editar rango */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRange ? 'Editar Rango de Tasas' : 'Crear Nuevo Rango de Tasas'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Configure las tasas de interés según el año del modelo del vehículo
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Rango *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Ej: Vehículos 2005-2015"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Descripción opcional del rango"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año Desde *
                    </label>
                    <input
                      type="number"
                      value={formData.yearFrom}
                      onChange={(e) => setFormData({ ...formData, yearFrom: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min="1900"
                      max="2050"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año Hasta *
                    </label>
                    <input
                      type="number"
                      value={formData.yearTo}
                      onChange={(e) => setFormData({ ...formData, yearTo: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min="1900"
                      max="2050"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tasa de Interés Anual (%) *
                    </label>
                    <input
                      type="number"
                      value={formData.interestRate * 100}
                      onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) / 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min="0.01"
                      max="100"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingrese el porcentaje (ej: 45.5 para 45.5%)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mayor prioridad en caso de solapamiento
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Rango activo
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Solo los rangos activos se utilizan en los cálculos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingRange(null);
                      setError('');
                      setSuccess('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingRange ? 'Actualizar' : 'Crear'} Rango
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Información del Sistema de Tasas</h4>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• Los rangos de años no pueden solaparse entre sí</p>
                <p>• La calculadora del concesionario aplicará automáticamente la tasa según el año del vehículo</p>
                <p>• En caso de solapamiento, se usa el rango con mayor prioridad</p>
                <p>• Los concesionarios pueden ver las tasas pero no modificarlas</p>
                <p>• Los cambios se aplican inmediatamente en todas las calculadoras</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}