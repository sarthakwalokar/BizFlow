import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { businessApi, StaffCreateRequest, BusinessUpdateRequest } from '../api/business';
import { User, BusinessType } from '../api/auth';
import { 
  Building, 
  Users, 
  Settings, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Save, 
  UserPlus, 
  DollarSign, 
  Clock,
  X,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, business, logout, updateBusinessState } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'staff'>('overview');
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Business Edit Form State
  const [bizName, setBizName] = useState(business?.name || '');
  const [bizType, setBizType] = useState<BusinessType>(business?.businessType || 'RETAIL');
  const [bizAddress, setBizAddress] = useState(business?.address || '');
  const [bizPhone, setBizPhone] = useState(business?.phone || '');
  const [bizEmail, setBizEmail] = useState(business?.email || '');
  const [bizCurrency, setBizCurrency] = useState(business?.currency || 'USD');
  const [bizTimezone, setBizTimezone] = useState(business?.timezone || 'Asia/Kolkata');
  const [bizLogo, setBizLogo] = useState(business?.logo || '');
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (business) {
      setBizName(business.name);
      setBizType(business.businessType);
      setBizAddress(business.address || '');
      setBizPhone(business.phone || '');
      setBizEmail(business.email || '');
      setBizCurrency(business.currency || 'USD');
      setBizTimezone(business.timezone || 'Asia/Kolkata');
      setBizLogo(business.logo || '');
    }
  }, [business]);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const data = await businessApi.getStaff();
      setStaffList(data);
    } catch {
      // Ignore or handle
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const updateData: BusinessUpdateRequest = {
        name: bizName,
        businessType: bizType,
        address: bizAddress,
        phone: bizPhone,
        email: bizEmail,
        currency: bizCurrency,
        timezone: bizTimezone,
        logo: bizLogo,
      };

      const updated = await businessApi.updateMyBusiness(updateData);
      updateBusinessState(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('settings.saveError', 'Failed to update business settings.');
      setSettingsError(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStaff(true);
    setStaffError(null);
    setStaffSuccess(null);

    try {
      const staffReq: StaffCreateRequest = {
        fullName: staffFullName,
        email: staffEmail,
        password: staffPassword,
        phone: staffPhone,
      };

      await businessApi.createStaff(staffReq);
      setStaffSuccess(t('staff.addedSuccess', 'Staff member onboarded successfully!'));
      setStaffFullName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
      await loadStaff();
      setTimeout(() => {
        setStaffSuccess(null);
        setShowAddStaffModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('staff.addFailed', 'Failed to onboard staff member.');
      setStaffError(msg);
    } finally {
      setAddingStaff(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/Bizflow-logo-dark.png"
              alt="BizFlow"
              className="h-8 sm:h-9 w-auto max-w-[160px] object-contain"
            />
            <div className="border-l border-slate-800 pl-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white tracking-tight">{business?.name || t('nav.business', 'My Business')}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                  {business?.businessType || 'RETAIL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('staff.ownerWorkspace', 'Owner Workspace • Logged in as')} <span className="text-slate-300 font-medium">{user?.fullName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('staff.ownerAccess', 'OWNER Access')}</span>
            </div>

            <button
              onClick={logout}
              id="owner-logout-btn"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('nav.logout', 'Log out')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t('nav.overview', 'Business Overview')}</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('nav.staff', 'Staff Members')} ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('nav.settings', 'Settings & Profile')}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('dashboard.verticalType', 'Business Vertical')}</span>
                  <Building className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-xl font-bold text-white tracking-tight">{business?.businessType}</div>
                <p className="text-[11px] text-slate-500">{t('dashboard.customPosLayout', 'Custom POS & Catalog Layout')}</p>
              </div>

              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('staff.activeStaff', 'Active Staff')}</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-white tracking-tight">{staffList.length} {t('staff.teamMembers', 'Team Members')}</div>
                <p className="text-[11px] text-slate-500">{t('staff.authorizedOperators', 'Authorized operators')}</p>
              </div>

              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('settings.currencyRegion', 'Currency & Region')}</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white tracking-tight">{business?.currency || 'USD'} / {business?.timezone || 'Asia/Kolkata'}</div>
                <p className="text-[11px] text-slate-500">{t('settings.invoicingStandard', 'Invoicing standard')}</p>
              </div>

              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('admin.tenantStatus', 'Tenant Status')}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 tracking-tight">{t('common.active', 'ACTIVE')}</div>
                <p className="text-[11px] text-slate-500">{t('admin.multiTenantIsolation', 'Multi-tenant isolation enabled')}</p>
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{business?.name}</h3>
                  <p className="text-xs text-slate-400">{t('settings.registeredInfo', 'Registered Business Information & Operational Identity')}</p>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer self-start sm:self-auto"
                >
                  {t('profile.editProfile', 'Edit Profile')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('staff.locationAddress', 'Address')}</span>
                    <span>{business?.address || t('staff.noAddress', 'No physical address specified')}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('settings.contactPhone', 'Contact Phone')}</span>
                    <span>{business?.phone || t('staff.noPhone', 'No phone number specified')}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('settings.officialEmail', 'Official Email')}</span>
                    <span>{business?.email || t('staff.noEmail', 'No email specified')}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('admin.createdOn', 'Created On')}</span>
                    <span>{business?.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('settings.timezone', 'Timezone')}</span>
                    <span>{business?.timezone || 'UTC'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">{t('admin.primaryOwner', 'Primary Owner')}</span>
                    <span>{user?.fullName} ({user?.email})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{t('nav.staff', 'Staff Members')}</h3>
                <p className="text-xs text-slate-400">{t('staff.onboardEmployeesDesc', 'Onboard employees and cashiers to manage business operations')}</p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                id="add-staff-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('staff.onboardNewStaff', 'Onboard New Staff')}</span>
              </button>
            </div>

            {/* Staff List Table */}
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {loadingStaff ? (
                <div className="p-12 text-center text-xs text-slate-400">{t('common.loading', 'Loading team members...')}</div>
              ) : staffList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{t('staff.noStaffYet', 'No staff members onboarded yet')}</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {t('staff.inviteEmployeesHint', 'Invite employees and cashier operators to help manage orders, tables, and services.')}
                  </p>
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('staff.addFirstStaff', 'Add First Staff User')}</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">{t('staff.staffName', 'Staff Name')}</th>
                        <th className="px-6 py-3.5">{t('staff.email', 'Email')}</th>
                        <th className="px-6 py-3.5">{t('staff.phone', 'Phone')}</th>
                        <th className="px-6 py-3.5">{t('staff.role', 'Role')}</th>
                        <th className="px-6 py-3.5">{t('common.status', 'Status')}</th>
                        <th className="px-6 py-3.5">{t('admin.createdAt', 'Created At')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {staffList.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{member.fullName}</td>
                          <td className="px-6 py-4 text-slate-300">{member.email}</td>
                          <td className="px-6 py-4 text-slate-400">{member.phone || '—'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {member.role || 'STAFF'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{t('common.active', 'Active')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="glass-card rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6 max-w-3xl">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-bold text-white">{t('settings.preferencesTitle', 'Business Settings & Preferences')}</h3>
              <p className="text-xs text-slate-400">{t('settings.preferencesSubtitle', 'Update company identity, contact channels, and localized options')}</p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('settings.savedSuccess', 'Business settings saved successfully!')}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-center space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBusiness} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-name">
                    {t('settings.businessName', 'Business Name')} *
                  </label>
                  <input
                    id="edit-biz-name"
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-type">
                    {t('settings.businessVertical', 'Business Vertical')}
                  </label>
                  <select
                    id="edit-biz-type"
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value as BusinessType)}
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="RETAIL">{t('business.typeRetail', 'Retail Shop')}</option>
                    <option value="RESTAURANT">{t('business.typeRestaurant', 'Restaurant')}</option>
                    <option value="CAFE">{t('business.typeCafe', 'Café / Bistro')}</option>
                    <option value="BAKERY">{t('business.typeBakery', 'Bakery')}</option>
                    <option value="SALON">{t('business.typeSalon', 'Salon / Spa')}</option>
                    <option value="SERVICE">{t('business.typeService', 'Service Business')}</option>
                    <option value="OTHER">{t('business.typeOther', 'Other Commercial')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-currency">
                    {t('settings.billingCurrency', 'Billing Currency')}
                  </label>
                  <input
                    id="edit-biz-currency"
                    type="text"
                    value={bizCurrency}
                    onChange={(e) => setBizCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-address">
                    {t('settings.address', 'Address')}
                  </label>
                  <input
                    id="edit-biz-address"
                    type="text"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-phone">
                    {t('settings.phone', 'Phone Number')}
                  </label>
                  <input
                    id="edit-biz-phone"
                    type="tel"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="edit-biz-email">
                    {t('settings.email', 'Official Email')}
                  </label>
                  <input
                    id="edit-biz-email"
                    type="email"
                    value={bizEmail}
                    onChange={(e) => setBizEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="edit-biz-logo">
                    {t('settings.businessLogoLabel', 'Business Logo (PNG, JPG, WebP, SVG)')}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/80">
                    <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {bizLogo ? (
                        <img
                          src={bizLogo}
                          alt="Business Logo Preview"
                          className="w-full h-full object-contain"
                          onError={() => setLogoError(t('settings.displayImageError', 'Failed to display image.'))}
                        />
                      ) : (
                        <ImageIcon size={20} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {/* Logo Status Indicator */}
                      {bizLogo !== (business?.logo || '') ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                          <AlertCircle size={12} className="text-amber-400" />
                          <span>{t('settings.unsavedLogo', 'Unsaved logo changes • Click "Save Settings" or "Save Logo" to apply')}</span>
                        </div>
                      ) : business?.logo ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>{t('settings.savedLogo', 'Saved & active across all invoices and documents')}</span>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!file.type.startsWith('image/')) {
                              setLogoError(t('settings.invalidImageType', 'Please select a valid image file (PNG, JPG, WebP, SVG).'));
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setLogoError(t('settings.imageTooLarge', 'Image size must be less than 5MB.'));
                              return;
                            }
                            setLogoProcessing(true);
                            setLogoError(null);

                            try {
                              if (file.type === 'image/svg+xml') {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  setBizLogo(evt.target?.result as string);
                                  setLogoProcessing(false);
                                };
                                reader.readAsDataURL(file);
                                return;
                              }

                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const img = new Image();
                                img.onload = () => {
                                  const maxDim = 512;
                                  let width = img.width;
                                  let height = img.height;
                                  if (width > maxDim || height > maxDim) {
                                    if (width > height) {
                                      height = Math.round((height * maxDim) / width);
                                      width = maxDim;
                                    } else {
                                      width = Math.round((width * maxDim) / height);
                                      height = maxDim;
                                    }
                                  }
                                  const canvas = document.createElement('canvas');
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  if (!ctx) {
                                    setBizLogo(evt.target?.result as string);
                                    setLogoProcessing(false);
                                    return;
                                  }
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const dataUrl = canvas.toDataURL('image/png', 0.9);
                                  setBizLogo(dataUrl);
                                  setLogoProcessing(false);
                                };
                                img.onerror = () => {
                                  setLogoError(t('settings.parseImageError', 'Failed to parse image file.'));
                                  setLogoProcessing(false);
                                };
                                img.src = evt.target?.result as string;
                              };
                              reader.onerror = () => {
                                setLogoError(t('settings.readFileError', 'Failed to read file.'));
                                setLogoProcessing(false);
                              };
                              reader.readAsDataURL(file);
                            } catch (err: any) {
                              setLogoError(err.message || t('settings.processImageError', 'Failed to process image.'));
                              setLogoProcessing(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={logoProcessing || savingSettings}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Upload size={13} />
                          <span>{bizLogo ? t('settings.changeLogo', 'Change Logo') : t('settings.uploadLogo', 'Upload Logo')}</span>
                        </button>
                        {bizLogo && (
                          <button
                            type="button"
                            disabled={logoProcessing || savingSettings}
                            onClick={() => setBizLogo('')}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            <span>{t('common.remove', 'Remove')}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={savingSettings || logoProcessing || bizLogo === (business?.logo || '')}
                          onClick={handleUpdateBusiness}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Save size={13} />
                          <span>{t('settings.saveLogo', 'Save Logo')}</span>
                        </button>
                      </div>
                      <input
                        id="edit-biz-logo"
                        type="url"
                        value={bizLogo}
                        onChange={(e) => {
                          setBizLogo(e.target.value);
                          setLogoError(null);
                        }}
                        placeholder={t('settings.pasteUrlPlaceholder', 'Or paste image URL (https://...)')}
                        className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                      {logoError && (
                        <p className="text-[11px] text-rose-400 font-medium">{logoError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  id="save-biz-settings-btn"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? t('settings.saving', 'Saving Settings...') : t('common.save', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ADD STAFF MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">{t('staff.onboardStaffModalTitle', 'Onboard Staff Member')}</h3>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{staffSuccess}</span>
              </div>
            )}

            {staffError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-center space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{staffError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-staff-name">
                  {t('staff.fullName', 'Full Name')} *
                </label>
                <input
                  id="new-staff-name"
                  type="text"
                  required
                  value={staffFullName}
                  onChange={(e) => setStaffFullName(e.target.value)}
                  placeholder={t('staff.namePlaceholder', 'e.g. Alex Cashier')}
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-staff-email">
                  {t('staff.email', 'Email Address')} *
                </label>
                <input
                  id="new-staff-email"
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="alex@business.com"
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-staff-password">
                  {t('staff.tempPassword', 'Temporary Password')} *
                </label>
                <input
                  id="new-staff-password"
                  type="password"
                  required
                  minLength={6}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder={t('auth.minSixChars', 'Min 6 characters')}
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-staff-phone">
                  {t('staff.phoneOptional', 'Phone (Optional)')}
                </label>
                <input
                  id="new-staff-phone"
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={addingStaff}
                  id="submit-staff-btn"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {addingStaff ? t('staff.onboardingInProgress', 'Onboarding...') : t('staff.addStaffBtn', 'Add Staff User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
