import React from 'react';
import { Database, Shield, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 text-sm">BizFlow SaaS Platform</span>
              <p className="text-xs text-zinc-500 mt-0.5">Unified Operations, POS Billing & Business Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              <span>Stateless JWT Auth</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-brand-600" />
              <span>PostgreSQL Multi-Tenant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} BizFlow Platform. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-zinc-600 transition-colors">Business Login</Link>
            <Link to="/signup" className="hover:text-zinc-600 transition-colors">Create Account</Link>
            <Link to="/admin/login" className="hover:text-zinc-600 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
