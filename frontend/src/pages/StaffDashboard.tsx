import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  UserCheck, 
  LogOut, 
  MapPin, 
  Phone, 
  Mail, 
  IndianRupee, 
  Layers, 
  ShieldAlert 
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user, business, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-tight">{business?.name || 'Assigned Business'}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {business?.businessType || 'RETAIL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Staff Portal • Logged in as <span className="text-slate-200 font-medium">{user?.fullName}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>STAFF Role</span>
            </div>

            <button
              onClick={logout}
              id="staff-logout-btn"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Role Notice */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Operational Staff Workspace</p>
            <p className="text-slate-400">
              You are signed in as a staff operator for <strong>{business?.name}</strong>. You have operational permissions for POS checkouts and daily tasks.
            </p>
          </div>
        </div>

        {/* Assigned Business Profile Card */}
        <div className="bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-sm space-y-6">
          <div className="border-b border-slate-700 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{business?.name}</h3>
                <p className="text-xs text-slate-400">Assigned Commercial Tenant Establishment</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              TENANT ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs text-slate-300">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Location Address</span>
                <span>{business?.address || 'No address specified'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Store Phone</span>
                <span>{business?.phone || 'No phone specified'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Store Contact</span>
                <span>{business?.email || 'No email specified'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IndianRupee className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">Operational Currency</span>
                <span>₹ {business?.currency || 'INR'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 block mb-0.5">My Staff Account</span>
                <span>{user?.fullName} ({user?.email})</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
