'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import MotoRatesSection from '@/components/admin/rates/MotoRatesSection';
import { Percent, Plus, RefreshCw, Save, AlertCircle, Calendar, Edit, Trash2, Layers, Car, Bike } from 'lucide-react';

interface AutoRateRow {
  id: number;
  name: string;
  description?: string;
  yearFrom: number;
  yearTo: number;
  termMonths: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupedRange {
  key: string; // `${yearFrom}-${yearTo}`
  name: string;
  description?: string;
  yearFrom: number;
  yearTo: number;
  isActive: boolean; // true si al menos 1 está activo
  terms: Record<6 | 12 | 18 | 24 | 36 | 48, number | null>;
}

export default function AdminAutoRatesPage() {
  const [rows, setRows] = useState<AutoRateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null); // "yearFrom-yearTo"
  const [showCreateMoto, setShowCreateMoto] = useState(false);

  // Helpers para formatear/normalizar porcentajes
  const toPercentStr = (rate: number) => {
    const v = rate * 100;
    const s = (Math.round(v * 100) / 100).toFixed(2);
    return s.replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  };

  const parseOr = (s: string, fallback: number) => {
    const n = normalizePercentInput(s);
    return n != null ? n / 100 : fallback; // devuelve fracción 0-1
  };

  const normalizePercentInput = (s: string): number | null => {
    if (typeof s !== 'string') return null;
    const cleaned = s.replace(',', '.').replace(/[^0-9.]/g, '');
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    if (Number.isNaN(num)) return null;
    return Math.max(0.01, Math.min(100, num));
  };

  const [form, setForm] = useState({
    name: '',
    description: '',
    yearFrom: new Date().getFullYear() - 5,
    yearTo: new Date().getFullYear(),
    isActive: true,
    rates: { m6: 0.45, m12: 0.45, m18: 0.45, m24: 0.45, m36: 0.45, m48: 0.45 },
  });

  // Estados de texto para inputs de % (evita "saltos" al escribir)
  const [formStrRates, setFormStrRates] = useState({ m6: '45', m12: '45', m18: '45', m24: '45', m36: '45', m48: '45' });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    yearFrom: new Date().getFullYear() - 5,
    yearTo: new Date().getFullYear(),
    isActive: true,
    rates: { m6: 0.45, m12: 0.45, m18: 0.45, m24: 0.45, m36: 0.45, m48: 0.45 },
  });

  const [editStrRates, setEditStrRates] = useState({ m6: '45', m12: '45', m18: '45', m24: '45', m36: '45', m48: '45' });

  const TERMS: Array<6 | 12 | 18 | 24 | 36 | 48> = [6, 12, 18, 24, 36, 48];

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') return value;
    }
    return null;
  };

  const fetchRows = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getTokenFromCookies();
      const res = await fetch('/api/admin/rates/auto', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error || 'Error al cargar');
      setRows(json.data as AutoRateRow[]);
    } catch (e: any) {
      setError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const grouped = useMemo<GroupedRange[]>(() => {
    const map = new Map<string, GroupedRange>();
    for (const r of rows) {
      const key = `${r.yearFrom}-${r.yearTo}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: r.name,
          description: r.description,
          yearFrom: r.yearFrom,
          yearTo: r.yearTo,
          isActive: r.isActive,
          terms: { 6: null, 12: null, 18: null, 24: null, 36: null, 48: null },
        });
      }
      const g = map.get(key)!;
      g.terms[r.termMonths as 6 | 12 | 18 | 24 | 36 | 48] = r.interestRate;
      g.isActive = g.isActive || r.isActive;
      if (!g.name && r.name) g.name = r.name;
      if (!g.description && r.description) g.description = r.description;
    }
    return Array.from(map.values()).sort((a, b) => a.yearFrom - b.yearFrom);
  }, [rows]);

  const formatRate = (x: number | null) => (x == null ? '—' : `${(x * 100).toFixed(2)}%`);

  const onEdit = (g: GroupedRange) => {
    setEditingKey(`${g.yearFrom}-${g.yearTo}`);
    setEditForm({
      name: g.name || '',
      description: g.description || '',
      yearFrom: g.yearFrom,
      yearTo: g.yearTo,
      isActive: g.isActive,
      rates: {
        m6: g.terms[6] ?? 0.45,
        m12: g.terms[12] ?? 0.45,
        m18: g.terms[18] ?? 0.45,
        m24: g.terms[24] ?? 0.45,
        m36: g.terms[36] ?? 0.45,
        m48: g.terms[48] ?? 0.45,
      },
    });
    setEditStrRates({
      m6: toPercentStr(g.terms[6] ?? 0.45),
      m12: toPercentStr(g.terms[12] ?? 0.45),
      m18: toPercentStr(g.terms[18] ?? 0.45),
      m24: toPercentStr(g.terms[24] ?? 0.45),
      m36: toPercentStr(g.terms[36] ?? 0.45),
      m48: toPercentStr(g.terms[48] ?? 0.45),
    });
    setError('');
    setSuccess('');
    setShowEdit(true);
  };

  const onDelete = async (g: GroupedRange) => {
    if (!confirm(`¿Eliminar el rango ${g.yearFrom}-${g.yearTo}? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = getTokenFromCookies();
      const res = await fetch(`/api/admin/rates/auto/${g.yearFrom}-${g.yearTo}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error || 'Error al eliminar rango');
      setSuccess('Rango AUTO eliminado correctamente');
      await fetchRows();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = getTokenFromCookies();
      // Normalizar por si el usuario no salió del input (sin blur)
      const normalizedRates = {
        m6: parseOr(editStrRates.m6, editForm.rates.m6),
        m12: parseOr(editStrRates.m12, editForm.rates.m12),
        m18: parseOr(editStrRates.m18, editForm.rates.m18),
        m24: parseOr(editStrRates.m24, editForm.rates.m24),
        m36: parseOr(editStrRates.m36, editForm.rates.m36),
        m48: parseOr(editStrRates.m48, editForm.rates.m48),
      };
      const body = {
        name: editForm.name || undefined,
        description: editForm.description || undefined,
        yearFrom: Number(editForm.yearFrom),
        yearTo: Number(editForm.yearTo),
        isActive: Boolean(editForm.isActive),
        terms: {
          6: Number(normalizedRates.m6),
          12: Number(normalizedRates.m12),
          18: Number(normalizedRates.m18),
          24: Number(normalizedRates.m24),
          36: Number(normalizedRates.m36),
          48: Number(normalizedRates.m48),
        },
      } as const;

      const res = await fetch(`/api/admin/rates/auto/${editingKey}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json?.overlaps) {
          setError(`Solapamientos detectados en plazos: ${json.overlaps.map((o: any) => o.term).join(', ')}`);
        } else {
          setError(json?.error || 'Error al actualizar rango');
        }
        return;
      }
      setSuccess('Rango AUTO actualizado correctamente');
      setShowEdit(false);
      setEditingKey(null);
      await fetchRows();
    } catch (e: any) {
      setError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = getTokenFromCookies();
      // Normalizar por si el usuario no salió del input (sin blur)
      const normalizedRates = {
        m6: parseOr(formStrRates.m6, form.rates.m6),
        m12: parseOr(formStrRates.m12, form.rates.m12),
        m18: parseOr(formStrRates.m18, form.rates.m18),
        m24: parseOr(formStrRates.m24, form.rates.m24),
        m36: parseOr(formStrRates.m36, form.rates.m36),
        m48: parseOr(formStrRates.m48, form.rates.m48),
      };
      const body = {
        name: form.name,
        description: form.description || undefined,
        yearFrom: Number(form.yearFrom),
        yearTo: Number(form.yearTo),
        isActive: Boolean(form.isActive),
        terms: {
          6: Number(normalizedRates.m6),
          12: Number(normalizedRates.m12),
          18: Number(normalizedRates.m18),
          24: Number(normalizedRates.m24),
          36: Number(normalizedRates.m36),
          48: Number(normalizedRates.m48),
        },
      } as const;

      const res = await fetch('/api/admin/rates/auto', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json?.overlaps) {
          setError(`Solapamientos detectados en plazos: ${json.overlaps.map((o: any) => o.term).join(', ')}`);
        } else {
          setError(json?.error || 'Error al crear rango');
        }
        return;
      }
      setSuccess('Rango AUTO creado correctamente (6/12/18/24/36/48)');
      setShowCreate(false);
      setForm({
        name: '', description: '',
        yearFrom: new Date().getFullYear() - 5,
        yearTo: new Date().getFullYear(),
        isActive: true,
        rates: { m6: 0.45, m12: 0.45, m18: 0.45, m24: 0.45, m36: 0.45, m48: 0.45 },
      });
      await fetchRows();
    } catch (e: any) {
      setError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <AdminNavigation
        title="Tasas AUTO por plazo"
        subtitle="Configure tasas por rango de años y plazos 6/12/18/24/36/48"
        subtitleClassName="text-brand-accent-500 text-sm"
        stats={{ count: grouped.length, label: 'rangos' }}
      />

      <div className="container mx-auto px-6 sm:px-8 py-6">
        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Modal editar */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Editar rango AUTO (6 plazos)</h3>
                <p className="text-gray-600 text-sm">Actualiza nombre, rango de años, estado y tasas 6/12/18/24/36/48</p>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Vehículos 2015 al 2025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año desde *</label>
                    <input
                      type="number"
                      value={editForm.yearFrom}
                      onChange={(e) => setEditForm({ ...editForm, yearFrom: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min={1900}
                      max={2050}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año hasta *</label>
                    <input
                      type="number"
                      value={editForm.yearTo}
                      onChange={(e) => setEditForm({ ...editForm, yearTo: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min={1900}
                      max={2050}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Opcional"
                    />
                  </div>

                  {/* Tasas */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-4">
                    {TERMS.map((t) => (
                      <div key={t}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t} meses (%) *</label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editStrRates[`m${t}` as 'm6' | 'm12' | 'm18' | 'm24' | 'm36' | 'm48']}
                            onChange={(e) => setEditStrRates({ ...editStrRates, [`m${t}`]: e.target.value } as any)}
                            onBlur={() => {
                              const raw = editStrRates[`m${t}` as 'm6' | 'm12' | 'm18' | 'm24' | 'm36' | 'm48'];
                              const normalized = normalizePercentInput(raw);
                              if (normalized != null) {
                                setEditForm((prev) => ({
                                  ...prev,
                                  rates: { ...prev.rates, [`m${t}`]: normalized / 100 } as any,
                                }));
                                setEditStrRates((prev) => ({
                                  ...prev,
                                  [`m${t}`]: toPercentStr(normalized / 100),
                                } as any));
                              }
                            }}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                            placeholder="Ej: 58.5"
                            required
                          />
                          <Percent className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Save className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Header acciones - Sección AUTO */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-300 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tasas para Automóviles</h2>
                <p className="text-gray-600">Plazos disponibles: 6, 12, 18, 24, 36 y 48 meses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRows}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Rango
              </button>
            </div>
          </div>
        </div>

        {/* Matriz mejorada */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-9 gap-3 font-bold text-gray-800 text-sm">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">RANGO</span>
                Años del vehículo
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">6m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">12m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">18m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">24m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">36m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">48m</div>
                <div className="text-xs text-gray-500">meses</div>
              </div>
              <div className="text-center">Estado</div>
              <div className="text-center">Acciones</div>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay rangos configurados</h4>
              <p className="text-gray-600 mb-4">Cree el primer rango para comenzar</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Rango
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {grouped.map((g, index) => (
                <li key={g.key} className={`px-6 py-6 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <div className="grid grid-cols-9 gap-3 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {g.yearFrom} - {g.yearTo}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-800">{g.name}</div>
                    </div>
                    
                    {/* Tasas mejoradas - más grandes y visibles */}
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[6] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[6] ? `${(g.terms[6] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[12] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[12] ? `${(g.terms[12] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[18] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[18] ? `${(g.terms[18] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[24] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[24] ? `${(g.terms[24] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[36] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[36] ? `${(g.terms[36] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold tabular-nums ${g.terms[48] ? 'text-blue-700' : 'text-gray-400'}`}>
                        {g.terms[48] ? `${(g.terms[48] * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${g.isActive ? 'bg-green-100 text-green-800 ring-1 ring-green-200' : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                        {g.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(g)}
                        className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                        title="Editar rango"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(g)}
                        className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                        title="Eliminar rango"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal crear */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Nuevo rango AUTO (6 plazos)</h3>
                <p className="text-gray-600 text-sm">Crea 6 tasas para 6/12/18/24/36/48 meses en un solo paso</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Vehículos 2015 al 2025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año desde *</label>
                    <input
                      type="number"
                      value={form.yearFrom}
                      onChange={(e) => setForm({ ...form, yearFrom: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min={1900}
                      max={2050}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año hasta *</label>
                    <input
                      type="number"
                      value={form.yearTo}
                      onChange={(e) => setForm({ ...form, yearTo: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      min={1900}
                      max={2050}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                      placeholder="Opcional"
                    />
                  </div>

                  {/* Tasas */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-4">
                    {TERMS.map((t) => (
                      <div key={t}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t} meses (%) *</label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formStrRates[`m${t}` as 'm6' | 'm12' | 'm18' | 'm24' | 'm36' | 'm48']}
                            onChange={(e) => setFormStrRates({ ...formStrRates, [`m${t}`]: e.target.value } as any)}
                            onBlur={() => {
                              const raw = formStrRates[`m${t}` as 'm6' | 'm12' | 'm18' | 'm24' | 'm36' | 'm48'];
                              const normalized = normalizePercentInput(raw);
                              if (normalized != null) {
                                setForm((prev) => ({
                                  ...prev,
                                  rates: { ...prev.rates, [`m${t}`]: normalized / 100 } as any,
                                }));
                                setFormStrRates((prev) => ({
                                  ...prev,
                                  [`m${t}`]: toPercentStr(normalized / 100),
                                } as any));
                              }
                            }}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 text-gray-900"
                            placeholder="Ej: 58.5"
                            required
                          />
                          <Percent className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sección de Motos - Header unificado */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-300 p-6 mb-6 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tasas para Motocicletas</h2>
                <p className="text-gray-600">Plazos disponibles: 6, 12 y 24 meses únicamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <button
                onClick={() => {
                  // Trigger crear rango en MotoRatesSection
                  const createButton = document.querySelector('[data-moto-create-button]') as HTMLButtonElement;
                  if (createButton) createButton.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Rango
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido de la sección Motos */}
        <MotoRatesSection />
      </div>
    </div>
  );
}
