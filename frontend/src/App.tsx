import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { HealthStatus } from './components/HealthStatus';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardOverviewPage } from './pages/admin/AdminDashboardOverviewPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSystemConfigPage } from './pages/admin/AdminSystemConfigPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage';
import { ProductListPage } from './pages/products/ProductListPage';
import { CategoryListPage } from './pages/products/CategoryListPage';
import { StaffManagementPage } from './pages/staff/StaffManagementPage';
import { BusinessSettingsPage } from './pages/business/BusinessSettingsPage';
import { UserProfilePage } from './pages/profile/UserProfilePage';
import { POSBillingPage } from './pages/billing/POSBillingPage';
import { OrdersHistoryPage } from './pages/billing/OrdersHistoryPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { ExpenseListPage } from './pages/expenses/ExpenseListPage';
import { PublicReviewPage } from './pages/reviews/PublicReviewPage';
import { ReviewBoostDashboardPage } from './pages/reviews/ReviewBoostDashboardPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { AnalyticsDashboardPage } from './pages/analytics/AnalyticsDashboardPage';
import { ReportsCenterPage } from './pages/reports/ReportsCenterPage';
import { AiAssistantPage } from './pages/ai/AiAssistantPage';
import { SWAGGER_DOCS_URL } from './api/axios';
import { 
  Store, 
  Utensils, 
  Coffee, 
  Cake, 
  Scissors, 
  Wrench, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Briefcase, 
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Receipt,
  Boxes,
  Sparkles,
  TrendingDown,
  Users,
  Star,
  Laptop
} from 'lucide-react';

const coreCapabilities = [
  {
    title: 'Lightning POS Billing',
    category: 'Billing & Checkout',
    icon: Receipt,
    desc: 'Instant barcode/SKU lookups, customizable GST/tax calculations, multi-mode payment capture (UPI, Cash, Cards), and thermal receipts.',
    badge: 'Sub-100ms',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    title: 'Adaptive Inventory Engine',
    category: 'Stock & Warehousing',
    icon: Boxes,
    desc: 'Lean single-counter stock control for small cafes, or full multi-location warehouses, inward POs, and supplier directories for enterprise retail.',
    badge: 'Multi-Location',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'AI Business Advisor',
    category: 'Intelligence & Audit',
    icon: Sparkles,
    desc: 'Context-aware AI analyzing sales velocity, gross margins, low stock alerts, and providing actionable profit growth recommendations.',
    badge: 'Real-Time Insights',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Expense & Margin Tracking',
    category: 'Financial Control',
    icon: TrendingDown,
    desc: 'Record operational expenditures, supplier payouts, and utility bills. Track real-time net operating profits vs gross revenue.',
    badge: 'Automated P&L',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    title: 'Customer CRM & Loyalty',
    category: 'Growth & Retention',
    icon: Users,
    desc: 'Centralized customer phone directory, transaction histories, loyalty balance tracking, and customer lifetime value metrics.',
    badge: '360° Profile',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: 'Review Boost Reputation',
    category: 'Customer Feedback',
    icon: Star,
    desc: 'Turn happy customers into 5-star Google & social reviews via smart rating links, while capturing feedback privately.',
    badge: 'Reputation',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
];

const businessTypes = [
  { type: 'RETAIL', title: 'Retail & Supermarkets', icon: Store, desc: 'POS checkout, barcode scanner, multi-location stock, inward POs, supplier ledger' },
  { type: 'CAFE', title: 'Cafés & Quick Service', icon: Coffee, desc: 'Rapid counter billing, drink customizations, single-counter inventory tracking' },
  { type: 'RESTAURANT', title: 'Dine-In Restaurants', icon: Utensils, desc: 'Table management, kitchen order tickets (KOT), tax inclusive billing, split checks' },
  { type: 'BAKERY', title: 'Artisan Bakeries', icon: Cake, desc: 'Daily batch tracking, shelf-life alerts, ingredient cost controls, custom orders' },
  { type: 'SALON', title: 'Salons & Wellness', icon: Scissors, desc: 'Appointment booking, stylist commissions, service packages, product upselling' },
  { type: 'SERVICE', title: 'Service & Maintenance', icon: Wrench, desc: 'Work order invoicing, technician tracking, hourly billing, itemized quotes' },
  { type: 'OTHER', title: 'Commercial Enterprises', icon: Building2, desc: 'Adaptable multi-category invoicing, custom tax rules, dynamic workflow schemas' },
];

const backendModules = [
  { name: 'config', desc: 'WebMvc, Cors, OpenApi & Security configuration' },
  { name: 'security', desc: 'Stateless JWT validation & UserPrincipal provider' },
  { name: 'auth', desc: 'Multi-tenant signup, login & profile management' },
  { name: 'user', desc: 'Role-based access control (OWNER, STAFF, ADMIN)' },
  { name: 'business', desc: 'Tenant isolation, tax settings & staff team management' },
  { name: 'product', desc: 'Catalog, physical products, services & categories' },
  { name: 'customer', desc: 'CRM directory, loyalty balances & purchase ledger' },
  { name: 'billing', desc: 'POS checkout engine, invoices & receipt generation' },
  { name: 'payment', desc: 'Cash, Card, UPI, Net Banking & payment records' },
  { name: 'expense', desc: 'Operating expenses, supplier payouts & categorizations' },
  { name: 'inventory', desc: 'Stock movements, multi-locations, suppliers & POs' },
  { name: 'review', desc: 'Customer review boosting & rating feedback capture' },
  { name: 'analytics', desc: 'Real-time sales velocity, revenue trends & margins' },
  { name: 'ai', desc: 'AI Business Assistant & contextual profit audit' },
  { name: 'report', desc: 'Exportable CSV/Excel/PDF tax summaries & statements' },
  { name: 'admin', desc: 'Platform tenant oversight, health & global controls' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-600 selection:text-white text-slate-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-20">
        
        {/* Minimalist Hero Section */}
        <section className="relative text-center space-y-6 pt-6 sm:pt-14 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Enterprise Multi-Tenant SaaS Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            The Complete Operating System for <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Modern Business</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Unified POS billing, adaptive inventory management, AI-powered profit analytics, operational expense tracking, and customer loyalty built on a robust Spring Boot 3 &amp; React stack.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              id="hero-register-btn"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              id="hero-login-btn"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all cursor-pointer"
            >
              <span>Sign In / Demo</span>
            </Link>

            <a
              href={SWAGGER_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium text-sm transition-all"
            >
              <span>REST API Swagger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Stats Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400">Architecture</div>
              <div className="text-sm font-bold text-white mt-0.5">Multi-Tenant</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400">Inventory Mode</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">Adaptive Scale</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400">POS Checkout</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">Sub-100ms</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400">AI Intelligence</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">Context-Aware</div>
            </div>
          </div>
        </section>

        {/* 1-Click Interactive Demo Profiles Section */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Try It Out</span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Interactive Sandbox Demos</h2>
            <p className="text-xs text-slate-400">Jump directly into ready-to-test business accounts with 1 click</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Small Business Demo */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                    Small Biz
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Chai &amp; Bites Café</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Single-counter fast food &amp; cafe with lean stock tracking, quick POS, and real-time sales.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center block transition-colors cursor-pointer"
              >
                Log In as Owner &rarr;
              </Link>
            </div>

            {/* Large Business Demo */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                    Large Enterprise
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Apex Electronics Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-location retail chain with central warehouse, inward PO shipments, and suppliers.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center block transition-colors cursor-pointer"
              >
                Log In as Enterprise Owner &rarr;
              </Link>
            </div>

            {/* Platform Admin Demo */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                    Platform Super Admin
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Platform Governance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Global tenant directory, business activation toggles, user directory, and platform metrics.
                </p>
              </div>
              <Link
                to="/admin/login"
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold text-center block transition-colors cursor-pointer"
              >
                Access Admin Portal &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Live Diagnostics Card */}
        <section>
          <HealthStatus />
        </section>

        {/* Core Capabilities Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Features &amp; Modules</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Everything You Need to Run Your Operations</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Engineered with clean domain boundaries, automated calculations, and complete audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${cap.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {cap.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{cap.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-medium">
                    {cap.category}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Role Architecture & Multi-Tenancy */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Security &amp; Permissions</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Role-Based Access &amp; Multi-Tenancy</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Unified authentication architecture with strict tenant isolation and platform-level administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OWNER */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">OWNER Role</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Business Bound</span>
                </div>
                <p className="text-xs text-slate-400">Proprietors and company executives managing full operational and financial control.</p>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Onboard new business &amp; configure tax rules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Business Assistant &amp; financial reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage products, suppliers &amp; staff roster</span>
                </li>
              </ul>
            </div>

            {/* STAFF */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">STAFF Role</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Business Bound</span>
                </div>
                <p className="text-xs text-slate-400">Employees, cashiers, store managers, and billing specialists.</p>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Execute POS billing &amp; customer lookup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Access catalog, products &amp; stock items</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Self-service profile and password update</span>
                </li>
              </ul>
            </div>

            {/* ADMIN */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">ADMIN Role</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Platform Level</span>
                </div>
                <p className="text-xs text-slate-400">Global SaaS administrators not tied to any individual tenant business.</p>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>View &amp; manage all platform businesses</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Activate / deactivate tenant businesses</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Platform user directory &amp; system metrics</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Business Types Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Industries</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Tailored Across 7 Business Verticals</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Dynamic workflow adaptations engineered specifically for your commercial industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businessTypes.map((biz) => {
              const Icon = biz.icon;
              return (
                <div key={biz.type} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {biz.type}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{biz.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{biz.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Backend Modular Packages Architecture */}
        <section id="backend-modules" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Engineering</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Modular Backend Architecture</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Clean separation of concerns with 16 domain packages in <code className="text-indigo-300 font-mono">com.bizflow.*</code>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {backendModules.map((mod) => (
              <div key={mod.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-slate-700 transition-all">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-bold text-slate-100 font-mono">{mod.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/review/:slugOrId" element={<PublicReviewPage />} />

          {/* Unified Business App Layout for Authenticated Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'STAFF']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home */}
            <Route index element={<DashboardHomePage />} />

            {/* Business Analytics & Insights */}
            <Route path="analytics" element={<AnalyticsDashboardPage />} />

            {/* AI Business Assistant */}
            <Route path="ai-assistant" element={<AiAssistantPage />} />

            {/* POS Fast Billing Terminal */}
            <Route path="pos" element={<POSBillingPage />} />

            {/* Sales & Invoices History */}
            <Route path="bills" element={<OrdersHistoryPage />} />
            <Route path="orders" element={<Navigate to="/dashboard/bills" replace />} />

            {/* Inventory Management (Adaptive: Small Lean vs Large Enterprise) */}
            <Route path="inventory" element={<InventoryPage />} />

            {/* Expense Management */}
            <Route path="expenses" element={<ExpenseListPage />} />

            {/* Reports Center (Sales, Expense, Customer, Product, Review + PDF/Excel) */}
            <Route path="reports" element={<ReportsCenterPage />} />

            {/* Customer Directory & CRM */}
            <Route path="customers" element={<CustomerListPage />} />

            {/* Review Boost Reputation Management */}
            <Route path="reviews" element={<ReviewBoostDashboardPage />} />

            {/* Products & Services Catalog */}
            <Route path="products" element={<ProductListPage />} />

            {/* Categories */}
            <Route path="categories" element={<CategoryListPage />} />

            {/* Staff Management (OWNER Only) */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <StaffManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Business Settings & Tax Configuration (OWNER Only) */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <BusinessSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Self-Service User Profile */}
            <Route path="profile" element={<UserProfilePage />} />
          </Route>

          {/* Legacy route redirects */}
          <Route path="/dashboard/owner" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/staff" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Dedicated Protected Platform Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardOverviewPage />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSystemConfigPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
