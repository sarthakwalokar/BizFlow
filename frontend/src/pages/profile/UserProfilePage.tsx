import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import { ButtonSpinner } from '../../components/common/LoadingStates';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, business } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security / Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await usersApi.updateMyProfile({
        fullName,
        phone: phone || undefined,
      });
      setProfileSuccess('Profile details successfully updated!');
    } catch (err: any) {
      setProfileError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update profile details.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password successfully changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to change password. Please verify current password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Account & Security</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your personal credentials, contact details, and security passwords.
        </p>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
              <User size={15} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">User Account</span>
              <p className="text-xs font-semibold text-zinc-900 truncate">{user?.fullName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
              <Shield size={15} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">System Role</span>
              <p className="text-xs font-semibold text-zinc-900">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
              <Building2 size={15} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Business Unit</span>
              <p className="text-xs font-semibold text-zinc-900 truncate">{business?.name || 'Default'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Profile info vs Password reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Profile Form */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Personal Details</h3>
                <p className="text-xs text-zinc-500">Your profile name and direct phone</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-medium">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form id="profileForm" onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Full Name <span className="text-rose-500">*</span>
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
                  Primary Email (Read-only)
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Direct Phone
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
            </form>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              form="profileForm"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? (
                <ButtonSpinner text="Saving..." spinnerColor="text-white" />
              ) : (
                <>
                  <Save size={14} />
                  <span>Update Details</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Change Password Security Form */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Change Password</h3>
                <p className="text-xs text-zinc-500">Maintain strong account security</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-medium">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form id="passwordForm" onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                />
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              form="passwordForm"
              disabled={savingPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? (
                <ButtonSpinner text="Updating..." spinnerColor="text-white" />
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
