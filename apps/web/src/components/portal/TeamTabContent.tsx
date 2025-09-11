import React, { useMemo, useState } from 'react';
import { Plus, Users, User, Mail, Phone, Calendar, PlayCircle, PauseCircle, Trash2, Pencil, Save as SaveIcon, X, KeyRound } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfirmActionModal from '@/components/ui/ConfirmActionModal';
import { type User as UserType } from '@/hooks/portal/usePortalDashboard';

type NewUserForm = { email: string; firstName: string; lastName: string; phone: string; password: string; confirmPassword: string };

interface TeamTabContentProps {
  users: UserType[];
  loading: boolean;
  showCreateUser: boolean;
  setShowCreateUser: (show: boolean) => void;
  newUser: NewUserForm;
  setNewUser: (user: NewUserForm) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  onActivate: (user: UserType) => void;
  onSuspend: (user: UserType) => void;
  onDelete: (user: UserType) => void;
  onUpdate: (user: UserType, changes: { email?: string; phone?: string | null }) => void;
  onResetPassword: (user: UserType) => void;
}

const TeamTabContent: React.FC<TeamTabContentProps> = ({ 
  users, 
  loading, 
  showCreateUser, 
  setShowCreateUser, 
  newUser, 
  setNewUser, 
  handleCreateUser,
  onActivate,
  onSuspend,
  onDelete,
  onUpdate,
  onResetPassword,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'warning' | 'danger' | 'info'>('warning');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});

  // Estado de edición por fila
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ email: string; phone: string }>({ email: '', phone: '' });

  const startEdit = (u: UserType) => {
    setEditingId(u.publicId);
    setEditForm({ email: u.email, phone: u.phone || '' });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ email: '', phone: '' });
  };
  const saveEdit = (u: UserType) => {
    const changes: { email?: string; phone?: string | null } = {};
    if (editForm.email && editForm.email !== u.email) changes.email = editForm.email;
    if ((editForm.phone || '') !== (u.phone || '')) changes.phone = editForm.phone || null;
    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }
    onUpdate(u, changes);
    cancelEdit();
  };

  const openConfirm = (opts: { title: string; message: string; type?: 'warning'|'danger'|'info'; onConfirm: () => void }) => {
    setConfirmTitle(opts.title);
    setConfirmMessage(opts.message);
    setConfirmType(opts.type || 'warning');
    setConfirmAction(() => opts.onConfirm);
    setConfirmOpen(true);
  };

  const closeConfirm = () => setConfirmOpen(false);

  const columns = useMemo(() => [
    { key: 'name', label: 'Nombre' },
    { key: 'contact', label: 'Contacto' },
    { key: 'created', label: 'Creado' },
    { key: 'status', label: 'Estado' },
    { key: 'lastLogin', label: 'Último Acceso' },
    { key: 'actions', label: 'Acciones', align: 'right' as const },
  ], []);

  return (
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

      {showCreateUser && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Crear Ejecutivo de Cuentas</h3>
          <p className="text-xs text-gray-500 mb-4">Definí una contraseña inicial. En el primer ingreso, el ejecutivo deberá cambiarla.</p>
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
                placeholder="+54 9 11 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña inicial</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                placeholder="Repetir contraseña"
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
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse bg-white rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 border-b ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-900">
              {users.map((u) => (
                <tr key={u.publicId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-primary-100 to-brand-primary-200 shadow-sm">
                        <User className="w-4 h-4 text-brand-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {editingId === u.publicId ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                            placeholder="email@ejemplo.com"
                          />
                          <Mail className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="relative">
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                            placeholder="+54 9 11 1234 5678"
                          />
                          <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-gray-400" />{u.email}</span>
                        {u.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400" />{u.phone}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="font-medium">{new Date(u.createdAt).toLocaleDateString('es-AR')}</div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <StatusBadge status={u.status} type="user" />
                  </td>
                  <td className="px-4 py-3 align-middle text-xs text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === u.publicId ? (
                        <>
                          <button
                            disabled={loading}
                            onClick={() => saveEdit(u)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                            title="Guardar cambios"
                          >
                            <SaveIcon className="w-4 h-4" /> Guardar
                          </button>
                          <button
                            disabled={loading}
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                            title="Cancelar edición"
                          >
                            <X className="w-4 h-4" /> Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={loading}
                            onClick={() => startEdit(u)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                          <button
                            disabled={loading}
                            onClick={() =>
                              openConfirm({
                                title: 'Resetear contraseña',
                                message: `¿Resetear la contraseña de ${u.firstName} ${u.lastName}? Se generará una temporal y se cerrarán sus sesiones activas.`,
                                type: 'warning',
                                onConfirm: () => { onResetPassword(u); closeConfirm(); },
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            title="Resetear contraseña"
                          >
                            <KeyRound className="w-4 h-4" /> Reset Pass
                          </button>
                        </>
                      )}
                      {u.status !== 'ACTIVE' ? (
                        <button
                          disabled={loading}
                          onClick={() =>
                            openConfirm({
                              title: 'Activar usuario',
                              message: `¿Desea activar a ${u.firstName} ${u.lastName} (${u.email})?`,
                              type: 'info',
                              onConfirm: () => { onActivate(u); closeConfirm(); },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                          title="Activar"
                        >
                          <PlayCircle className="w-4 h-4" /> Activar
                        </button>
                      ) : (
                        <button
                          disabled={loading}
                          onClick={() =>
                            openConfirm({
                              title: 'Suspender usuario',
                              message: `¿Suspender a ${u.firstName} ${u.lastName}? Se cerrarán sus sesiones activas.`,
                              type: 'warning',
                              onConfirm: () => { onSuspend(u); closeConfirm(); },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                          title="Suspender"
                        >
                          <PauseCircle className="w-4 h-4" /> Suspender
                        </button>
                      )}

                      <button
                        disabled={loading}
                        onClick={() =>
                          openConfirm({
                            title: 'Eliminar usuario',
                            message: `¿Eliminar a ${u.firstName} ${u.lastName}? Esto es un borrado lógico y podrá crearse nuevamente si es necesario.`,
                            type: 'danger',
                            onConfirm: () => { onDelete(u); closeConfirm(); },
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmActionModal
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        loading={loading}
        onConfirm={confirmAction}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default TeamTabContent;
