'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Calculator, FileText, Settings, User, Mail, Phone, Calendar, Eye, Trash2 } from 'lucide-react';

interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function PortalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dealer/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/dealer/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        alert('Ejecutivo de cuentas creado exitosamente');
        setNewUser({ email: '', firstName: '', lastName: '', phone: '' });
        setShowCreateUser(false);
        fetchUsers();
      } else {
        alert(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') {
      fetchUsers();
    }
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INVITED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      ACTIVE: 'Activo',
      INVITED: 'Invitado',
      SUSPENDED: 'Suspendido',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-brand-primary-600/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-accent-500/10 rounded-full blur-xl animate-bounce"></div>
      
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100 relative z-10">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-accent-500/10 border border-brand-accent-500/20">
                <span className="text-sm font-medium text-brand-primary-600">🏢 Portal Concesionario</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard Concesionario</h1>
              <p className="text-xl text-gray-600">Gestiona tu equipo y solicitudes de crédito</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-primary-600/25 flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-semibold">Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 py-12 relative">
        {/* Navegación por pestañas */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/50 mb-8 relative overflow-hidden">
          {/* Elementos decorativos del header */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-600/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent-500/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 px-8 py-6 relative overflow-hidden">
            {/* Elementos decorativos del header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent-500/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <nav className="flex space-x-2">
                {[
                  { id: 'overview', label: 'Resumen', icon: Eye },
                  { id: 'team', label: 'Equipo', icon: Users },
                  { id: 'calculator', label: 'Calculadora', icon: Calculator },
                  { id: 'requests', label: 'Solicitudes', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-white text-brand-primary-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Resumen del Dashboard</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-primary-600/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brand-primary-100 text-sm font-medium">Ejecutivos</p>
                        <p className="text-3xl font-bold">{users.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Solicitudes</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-brand-accent-500 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-lg shadow-brand-accent-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">Pendientes</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-900/20 rounded-xl flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Aprobadas</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 relative overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent-500/20 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">✨</span>
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900">¡Bienvenido a CrediAuto!</h3>
                    </div>
                    <p className="text-blue-800 mb-6 text-lg leading-relaxed">
                      Desde aquí puedes gestionar tu equipo de ejecutivos de cuentas, calcular préstamos y enviar solicitudes de crédito.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Equipo</p>
                          <p className="text-sm text-blue-700">Crea y gestiona ejecutivos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Calculadora</p>
                          <p className="text-sm text-blue-700">Calcula préstamos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Solicitudes</p>
                          <p className="text-sm text-blue-700">Envía y hace seguimiento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Gestión de Equipo</h2>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="flex items-center gap-2 bg-brand-primary-600 hover:bg-brand-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Ejecutivo
                  </button>
                </div>

                {/* Formulario para crear usuario */}
                {showCreateUser && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Ejecutivo de Cuentas</h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                          type="text"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="Apellido"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Creando...' : 'Crear Ejecutivo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateUser(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de usuarios */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando equipo...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay ejecutivos de cuentas creados</p>
                    <p className="text-sm text-gray-400">Crea tu primer ejecutivo para comenzar</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <div key={user.publicId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-brand-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-brand-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                  </span>
                                  {user.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {user.phone}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(user.status)}
                              {user.lastLoginAt && (
                                <span className="text-xs text-gray-500">
                                  Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'calculator' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculadora de Préstamos</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <Calculator className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-center text-yellow-800">
                    La calculadora de préstamos estará disponible próximamente.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Solicitudes de Crédito</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-center text-blue-800">
                    El sistema de solicitudes estará disponible próximamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}