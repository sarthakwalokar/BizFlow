import React from 'react';
import { Database, Shield, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-bold text-slate-200">BizFlow SaaS</span>
          <span>•</span>
          <span>Java 17 &amp; Spring Boot 3.3.4</span>
          <span>•</span>
          <span>PostgreSQL + Flyway</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Stateless JWT</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Flyway Migrations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>CORS Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
