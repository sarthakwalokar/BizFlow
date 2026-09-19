import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { businessApi, StaffCreateRequest, StaffUpdateRequest } from '../../api/business';
import { User } from '../../api/auth';
import {
  Users,
  UserPlus,
  KeyRound,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Search,
} from 'lucide-react';

export const StaffManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [resetPasswordStaff, setResetPasswordStaff] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['pos_access']);
  const [newPassword, setNewPassword] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const list = await businessApi.getStaff();
      setStaffList(list);
    } catch (err: any) {
      setErrorMessage('Failed to load staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setPermissions(['pos_access']);
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: User) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setPhone(staff.phone || '');
    setPermissions(staff.permissions ? staff.permissions.split(',') : ['pos_access']);
  };

  const openResetPasswordModal = (staff: User) => {
    setResetPasswordStaff(staff);
    setNewPassword('');
  };

  const handleTogglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const data: StaffCreateRequest = {
        fullName,
        email,
        password,
        phone: phone || undefined,
        permissions: permissions.join(','),
      };
      await businessApi.createStaff(data);
      setSuccessMessage(`Staff member "${fullName}" was successfully onboarded!`);
      setIsAddModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to add staff member.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const data: StaffUpdateRequest = {
        fullName,
        phone: phone || undefined,
        permissions: permissions.join(','),
      };
      await businessApi.updateStaff(editingStaff.id, data);
      setSuccessMessage(`Staff details for "${fullName}" updated!`);
      setEditingStaff(null);
      fetchStaff();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update staff member.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (staff: User) => {
    try {
      const updated = await businessApi.updateStaffStatus(staff.id, !staff.enabled);
      setStaffList(staffList.map((s) => (s.id === staff.id ? updated : s)));
      setSuccessMessage(
        `Staff account "${staff.fullName}" is now ${updated.enabled ? 'Enabled' : 'Disabled'}.`
      );
    } catch (err: any) {
      setErrorMessage('Failed to update staff account status.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStaff) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await businessApi.resetStaffPassword(resetPasswordStaff.id, { newPassword });
      setSuccessMessage(`Password for "${resetPasswordStaff.fullName}" was successfully updated.`);
      setResetPasswordStaff(null);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to reset staff password.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? s.enabled
        : !s.enabled;
    return matchesSearch && matchesStatus;
  });

  const activeCount = staffList.filter((s) => s.enabled).length;
  const disabledCount = staffList.filter((s) => !s.enabled).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('staff.title')}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('staff.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus size={15} />
          <span>{t('staff.addStaff')}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-brand-50 border border-brand-200 flex items-center gap-2.5 text-brand-800 text-xs">
          <CheckCircle2 size={16} className="text-brand-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('staff.title')}</span>
          <div className="text-xl font-bold text-zinc-900 mt-1">{staffList.length}</div>
          <span className="text-[11px] text-zinc-400">{t('staff.registeredEmployees', 'Registered employees')}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-brand-600 uppercase tracking-wider">{t('staff.activeStaff')}</span>
          <div className="text-xl font-bold text-brand-700 mt-1">{activeCount}</div>
          <span className="text-[11px] text-brand-600">{t('staff.canLoginOperate', 'Can log in and operate')}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('common.inactive')}</span>
          <div className="text-xl font-bold text-zinc-600 mt-1">{disabledCount}</div>
          <span className="text-[11px] text-zinc-400">{t('staff.accessSuspended', 'Access suspended')}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs bg-zinc-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t('common.all')} ({staffList.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-brand-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t('common.active')} ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('DISABLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'DISABLED'
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t('common.inactive')} ({disabledCount})
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
                <th className="px-4 py-3">{t('staff.staffName', 'Employee')}</th>
                <th className="px-4 py-3">{t('customers.phone', 'Contact')}</th>
                <th className="px-4 py-3">{t('staff.permissions', 'Permissions')}</th>
                <th className="px-4 py-3">{t('common.status', 'Status')}</th>
                <th className="px-4 py-3 text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                    {t('common.loading', 'Loading...')}
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 space-y-1">
                    <Users size={28} className="mx-auto text-zinc-300 mb-2" />
                    <p className="font-medium text-zinc-700">{t('staff.noStaffFound', 'No staff members found')}</p>
                    <p className="text-[11px] text-zinc-400">
                      {search ? t('common.notFound', 'Try adjusting your search criteria.') : t('staff.inviteStaff', 'Click "Add Team Member" to invite your first employee.')}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center text-xs border border-zinc-200">
                          {staff.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{staff.fullName}</div>
                          <div className="text-[11px] text-zinc-400">{t('common.id', 'ID')} #{staff.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="text-zinc-700 text-xs flex items-center gap-1.5">
                          <Mail size={12} className="text-zinc-400" />
                          <span>{staff.email}</span>
                        </div>
                        {staff.phone && (
                          <div className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                            <Phone size={11} className="text-zinc-400" />
                            <span>{staff.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions ? (
                          staff.permissions.split(',').map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium border border-zinc-200"
                            >
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400">{t('common.none', 'Standard')}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        title={staff.enabled ? t('common.inactive') : t('common.active')}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          staff.enabled
                            ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {staff.enabled ? (
                          <>
                            <CheckCircle2 size={12} className="text-brand-600" />
                            <span>{t('common.active')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="text-zinc-400" />
                            <span>{t('common.inactive')}</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(staff)}
                          title={t('staff.editStaff')}
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(staff)}
                          title={t('profile.changePassword')}
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <KeyRound size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{t('staff.addStaff')}</h3>
                  <p className="text-xs text-zinc-500">{t('staff.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('profile.fullName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="john@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder={t('profile.min8Chars')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.phone')}
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              {/* Permissions checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.permissions')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pos_access', label: t('staff.permBilling', 'POS Billing Access') },
                    { id: 'inventory_view', label: t('staff.permInventory', 'Inventory Access') },
                    { id: 'billing_access', label: t('staff.permReports', 'Financial Reports Access') },
                    { id: 'service_appointments', label: t('staff.permSettings', 'Settings Access') },
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer text-xs text-zinc-700"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? t('settings.saving') : t('staff.addStaff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{t('staff.editStaff')}</h3>
                  <p className="text-xs text-zinc-500">{editingStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('profile.fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.phone')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                />
              </div>

              {/* Permissions */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('staff.permissions')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pos_access', label: t('staff.permBilling', 'POS Billing Access') },
                    { id: 'inventory_view', label: t('staff.permInventory', 'Inventory Access') },
                    { id: 'billing_access', label: t('staff.permReports', 'Financial Reports Access') },
                    { id: 'service_appointments', label: t('staff.permSettings', 'Settings Access') },
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer text-xs text-zinc-700"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? t('settings.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{t('profile.changePassword')}</h3>
                  <p className="text-xs text-zinc-500">{resetPasswordStaff.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordStaff(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {t('profile.newPassword')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder={t('profile.min8Chars')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {t('profile.min8Chars')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordStaff(null)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? t('settings.saving') : t('profile.changePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


