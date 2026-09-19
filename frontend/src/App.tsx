import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
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
import { 
  Receipt,
  Package,
  Users,
  TrendingDown,
  BarChart3,
  Star,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Layers,
  Bell,
  Store
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-cyan-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-grow w-full overflow-hidden">
        
        {/* =========================================================================
            1. HERO SECTION (Normal Light Theme)
           ========================================================================= */}
        <section id="hero" className="relative pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: Headline & Real Value Proposition */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Brand Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Business Management Platform</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                  Manage and grow your business with{' '}
                  <span className="gradient-text-bizflow font-black">BizFlow</span>
                </h1>

                {/* Supporting Description */}
                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                  The all-in-one business management platform built for retail stores, services, and growing enterprises. High-speed POS billing, real-time inventory, expense tracking, invoice management, Review Boost, and grounded AI analytics.
                </p>

                {/* CTA Buttons (NO SEARCH BAR) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/signup"
                    id="hero-get-started-btn"
                    className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all hover:shadow-cyan-500/35 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#features"
                    id="hero-explore-features-btn"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all hover:border-slate-400 cursor-pointer shadow-xs"
                  >
                    <span>Explore Features</span>
                  </a>
                </div>

                {/* Core Architectural Highlights */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 max-w-lg">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">High-Speed POS</div>
                      <div className="text-[10px] text-slate-500">Barcode & thermal prints</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Grounded AI</div>
                      <div className="text-[10px] text-slate-500">18 languages supported</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Net Margin Control</div>
                      <div className="text-[10px] text-slate-500">Sales minus expenses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Realistic Live BizFlow Dashboard Frame (Sleek High-Contrast Device Mockup) */}
              <div className="lg:col-span-6 relative">
                {/* Glow behind device */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-3xl blur-2xl transform scale-95" />

                {/* Device Window Frame */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 p-2 sm:p-3 shadow-2xl overflow-hidden">
                  
                  {/* Browser Bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="font-mono text-slate-400 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>bizflow.app/dashboard</span>
                    </div>
                    <div className="text-[10px] text-cyan-400 font-semibold">Live POS</div>
                  </div>

                  {/* Platform Interface Preview */}
                  <div className="grid grid-cols-12 bg-slate-900 rounded-xl overflow-hidden text-left border border-slate-800">
                    
                    {/* Dark Sidebar */}
                    <div className="col-span-4 sm:col-span-3 bg-slate-950 p-3 flex flex-col justify-between border-r border-slate-800">
                      <div className="space-y-4">
                        {/* Logo in Mockup */}
                        <div className="flex items-center pt-1 px-1">
                          <img
                            src="/Bizflow-logo-dark.png"
                            alt="BizFlow"
                            className="h-6 w-auto object-contain"
                          />
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-1 text-[10px] font-medium">
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold shadow-xs">
                            <Layers className="w-3 h-3 shrink-0" />
                            <span className="truncate">Dashboard</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white">
                            <Receipt className="w-3 h-3 shrink-0" />
                            <span className="truncate">POS Billing</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white">
                            <Package className="w-3 h-3 shrink-0" />
                            <span className="truncate">Inventory</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white">
                            <TrendingDown className="w-3 h-3 shrink-0" />
                            <span className="truncate">Expenses</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white">
                            <Star className="w-3 h-3 shrink-0" />
                            <span className="truncate">Review Boost</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span className="truncate">AI Assistant</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 px-1">
                        BizFlow OS
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-8 sm:col-span-9 bg-slate-900 p-3 sm:p-4 flex flex-col justify-between space-y-3">
                      
                      {/* Store Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                            Store Operations Active
                          </h4>
                          <p className="text-[10px] text-slate-400">Terminal Ready • Multi-Channel Active</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Bell className="w-3 h-3" />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-bold">
                            B
                          </div>
                        </div>
                      </div>

                      {/* Real BizFlow Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Sales */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                          <span className="text-[9px] text-slate-400 font-medium block">Gross Sales</span>
                          <span className="text-sm sm:text-base font-extrabold text-white block mt-0.5">₹42,850</span>
                          <span className="text-[8px] text-cyan-400 font-semibold">POS + Orders</span>
                        </div>

                        {/* Expenses */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                          <span className="text-[9px] text-slate-400 font-medium block">Expenses</span>
                          <span className="text-sm sm:text-base font-extrabold text-rose-400 block mt-0.5">₹8,200</span>
                          <span className="text-[8px] text-rose-300 font-semibold">Logged Today</span>
                        </div>

                        {/* Net Margin */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                          <span className="text-[9px] text-slate-400 font-medium block">Net Margin</span>
                          <span className="text-sm sm:text-base font-extrabold text-emerald-400 block mt-0.5">₹34,650</span>
                          <span className="text-[8px] text-emerald-300 font-semibold">80.8% Profit</span>
                        </div>

                        {/* Review Boost */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                          <span className="text-[9px] text-slate-400 font-medium block">Review Boost</span>
                          <span className="text-sm sm:text-base font-extrabold text-amber-400 block mt-0.5">4.9 ★</span>
                          <span className="text-[8px] text-amber-300 font-semibold">QR Standee</span>
                        </div>
                      </div>

                      {/* Split: Live POS Feed + AI Advisor Snip */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                        {/* Live POS Stream */}
                        <div className="sm:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
                            <span>Recent POS Invoices</span>
                            <span className="text-cyan-400 text-[9px]">Receipts →</span>
                          </div>
                          <div className="space-y-1 text-[9px]">
                            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="truncate">
                                <span className="font-semibold text-slate-200">INV-1082 • Walk-in</span>
                                <span className="text-slate-400 block text-[8px]">UPI • 3 items</span>
                              </div>
                              <span className="font-bold text-cyan-400">₹1,450</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="truncate">
                                <span className="font-semibold text-slate-200">INV-1081 • Counter</span>
                                <span className="text-slate-400 block text-[8px]">Cash • 1 item</span>
                              </div>
                              <span className="font-bold text-cyan-400">₹320</span>
                            </div>
                          </div>
                        </div>

                        {/* Grounded AI Assistant Response */}
                        <div className="sm:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              AI Business Assistant
                            </span>
                            <span className="text-[8px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50">Grounded</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[9px] text-slate-300 space-y-1">
                            <p className="text-slate-400 italic">"3 items are below minimum stock: Coffee Beans (2 left), Takeaway Cups (10 left)."</p>
                            <p className="text-emerald-400 font-semibold text-[8px]">💡 Recommendation: Restock before weekend rush.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FEATURES SECTION (Normal Light Theme)
           ========================================================================= */}
        <section id="features" className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase font-mono">
                PRODUCT CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Built Around Your Real Business Operations
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Every tool inside BizFlow is purpose-built to streamline store workflows, automate accounting, and boost profitability.
              </p>
            </div>

            {/* 10 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              
              {/* Feature 1: AI Business Assistant */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">AI Business Assistant</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Grounded AI intelligence answering live queries on sales trends, low inventory, and margin optimization with OpenRouter primary and Gemini fallback across 18 languages.
                </p>
              </div>

              {/* Feature 2: Sales & Revenue Analytics */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Sales & Revenue Analytics</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Real-time financial performance metrics: daily/monthly revenue trends, gross sales, net profit margins, top-selling items, and payment method distributions.
                </p>
              </div>

              {/* Feature 3: Billing / POS Terminal */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Billing / POS Terminal</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Ultra-fast counter checkout with instant barcode scanning, automated GST/tax calculation, customizable item discounts, and 80mm thermal receipt printing.
                </p>
              </div>

              {/* Feature 4: Products & Services */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Products & Services</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Comprehensive catalog management with custom SKUs, barcodes, category taxonomies, unit definitions, cost price margins, and active/inactive status toggles.
                </p>
              </div>

              {/* Feature 5: Expense Management */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-rose-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Expense Management</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Log and categorize daily overhead expenses (Rent, Utilities, Wages, Raw Materials) to compute verified gross revenues, operating costs, and true net profit.
                </p>
              </div>

              {/* Feature 6: Inventory Management */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Inventory Management</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Live stock quantity tracking with automated minimum threshold warnings, inward restock logging, and out-of-stock prevention to keep shelves supplied.
                </p>
              </div>

              {/* Feature 7: Invoice Management */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Invoice Management</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Centralized transaction history, searchable invoices by customer or order ID, payment status tracking (Paid/Pending), and instant receipt reprints.
                </p>
              </div>

              {/* Feature 8: Review Boost */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Review Boost</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Custom QR code generation for counter standees and thermal receipts that prompts happy customers to leave 5-star Google reviews and boost local store ranking.
                </p>
              </div>

              {/* Feature 9: Business Insights */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Business Insights</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Detailed summaries of business performance, staff sales tracking, audit logs, and exportable CSV and PDF reports for bookkeeping and tax compliance.
                </p>
              </div>

              {/* Feature 10: Multilingual Support */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Multilingual Support</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Complete 18-language localization (English, Hindi, Marathi, Gujarati, Tamil, Telugu, Spanish, French, etc.) allowing owners and staff to operate comfortably.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            3. AI ASSISTANT SECTION (Normal Light Theme)
           ========================================================================= */}
        <section id="ai-assistant" className="py-20 bg-white border-b border-slate-200/80 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: AI Value Proposition */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <span className="text-xs font-bold text-purple-600 tracking-widest uppercase font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI BUSINESS ASSISTANT
                </span>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Understand Your Store Data Through Grounded AI
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  BizFlow AI connects directly to your live sales, inventory, and expense records. Business owners can ask natural language questions and get immediate, grounded answers without digging through spreadsheets.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Dual-Provider Resilience</h4>
                      <p className="text-xs text-slate-600">Powered by OpenRouter as primary with seamless Google Gemini fallback for uninterrupted intelligence.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Live Inventory & Sales Querying</h4>
                      <p className="text-xs text-slate-600">Ask about bestselling products, low stock warnings, revenue summaries, or expense anomalies in seconds.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Speaks 18 Native Languages</h4>
                      <p className="text-xs text-slate-600">Interact naturally in your preferred language including Hindi, Marathi, Gujarati, English, and more.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all hover:shadow-lg"
                  >
                    <span>Try BizFlow AI Assistant</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: AI Conversation Frame */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-left space-y-4">
                
                {/* AI Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">BizFlow AI Assistant</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Grounded on live store data
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700 font-mono">
                    OpenRouter + Gemini
                  </span>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3 text-xs">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] shadow-sm">
                      "Which products generated the highest margin this week, and what needs restocking?"
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] space-y-2 shadow-sm">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Weekly Store Analysis:
                      </div>
                      <p className="text-slate-300">
                        1. <strong className="text-cyan-400">Espresso Roast 1kg</strong> generated highest margin (₹14,200 net profit, 72% margin).
                      </p>
                      <p className="text-slate-300">
                        2. <strong className="text-cyan-400">Cold Brew Bottles</strong> were second (₹9,800 net profit).
                      </p>
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px]">
                        ⚠️ <strong>Restock Alert:</strong> Oat Milk 1L is down to 3 units (Min threshold: 10). Reorder recommended today.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Prompt Chips */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">"Show today's gross vs net margin"</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">"Summarize logged expenses"</span>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            4. ANALYTICS SECTION (Normal Light Theme)
           ========================================================================= */}
        <section id="analytics" className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase font-mono">
                FINANCIAL VISIBILITY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Sales, Expense & Net Margin Analytics
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Track exact revenue and overhead in real time so you know your true profitability every single day.
              </p>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              {/* Card 1: Revenue vs Net Profit */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-600" />
                    Revenue & Profit Calculation
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Real-time
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gross sales from POS receipts minus verified overhead expenses equals true net profit.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Gross Sales</span>
                    <span className="font-bold text-slate-900">₹1,84,500</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Logged Expenses</span>
                    <span className="font-bold text-rose-600">- ₹38,200</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="font-semibold text-emerald-800">True Net Margin</span>
                    <span className="font-bold text-emerald-700">₹1,46,300 (79.3%)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Payment Methods Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    Tender & Payment Channels
                  </h3>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                    Multi-tender
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instant breakdown across payment modes for simplified daily cash-drawer and bank reconciliation.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>UPI & QR Payments</span>
                      <span className="font-bold text-cyan-700">62% (₹1,14,390)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-600 h-full rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Cash Register</span>
                      <span className="font-bold text-emerald-700">26% (₹47,970)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '26%' }} />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Card POS</span>
                      <span className="font-bold text-blue-700">12% (₹22,140)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Expense Categories */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    Overhead Categorization
                  </h3>
                  <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
                    Categorized
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Identify cost leakages across utilities, inventory inwards, store rent, and staff compensation.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Inventory Restock</span>
                    <span className="font-bold text-slate-900">₹22,400</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Rent & Utilities</span>
                    <span className="font-bold text-slate-900">₹11,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Store Supplies & Misc</span>
                    <span className="font-bold text-slate-900">₹4,800</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            5. REVIEW BOOST SECTION (Normal Light Theme)
           ========================================================================= */}
        <section id="review-boost" className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: QR Review Generator Workflow */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <span className="text-xs font-bold text-amber-600 tracking-widest uppercase font-mono flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  REVIEW BOOST SYSTEM
                </span>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Turn Happy Customers into 5-Star Online Reviews
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Review Boost gives your store a dedicated QR reputation system. Capture customer feedback right at the counter or through thermal receipts, and channel positive ratings directly to your public reputation.
                </p>

                {/* 3 Step QR Flow */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Generate QR Standee & Receipt Codes</h4>
                      <p className="text-xs text-slate-600">BizFlow produces a custom QR code for your store counter standee and automatically prints the review QR on customer receipts.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Customer Scans & Rates with Phone</h4>
                      <p className="text-xs text-slate-600">No app installation needed. Customers quickly tap their star rating and leave remarks directly from their mobile browser.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Channel 5-Star Reviews to Google</h4>
                      <p className="text-xs text-slate-600">Delighted customers are directed to post their review on Google, ranking your store higher in local search results.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:shadow-lg"
                  >
                    <span>Activate Review Boost</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual QR Card + Receipt Illustration */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="max-w-sm w-full bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-5 text-center relative">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-800 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Live Customer Feedback</span>
                  </div>

                  {/* QR Graphic Container */}
                  <div className="bg-white p-5 rounded-2xl max-w-[200px] mx-auto shadow-sm border border-slate-200">
                    <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-lg mb-2">
                        B
                      </div>
                      <div className="text-[10px] font-mono text-slate-700 font-bold">SCAN TO REVIEW</div>
                      <div className="text-[8px] text-slate-500">bizflow.app/review</div>
                    </div>
                  </div>

                  {/* Rating Stars Mock */}
                  <div className="space-y-2">
                    <div className="flex justify-center space-x-1 text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <p className="text-xs text-slate-800 font-semibold">
                      "Fast checkout, great coffee, and clean digital receipts!"
                    </p>
                    <span className="text-[10px] text-slate-500 block">Verified Store Customer</span>
                  </div>

                  {/* Thermal Receipt Attachment Badge */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between shadow-xs">
                    <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      Auto-prints on 80mm receipts
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Enabled</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            6. FINAL CTA SECTION (Vibrant High-Contrast SaaS Banner)
           ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 sm:p-14 text-white text-center shadow-xl relative overflow-hidden">
              
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                
                {/* Mini Logo */}
                <div className="flex justify-center">
                  <img
                    src="/Bizflow-logo-dark.png"
                    alt="BizFlow"
                    className="h-8 sm:h-9 w-auto max-w-[160px] object-contain brightness-200"
                  />
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Start Managing and Growing Your Business
                </h2>
                
                <p className="text-sm sm:text-base text-cyan-50 font-normal leading-relaxed">
                  Join retailers, service businesses, and modern store owners running rapid POS checkout, tight inventory control, expense tracking, and grounded AI insights with BizFlow.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    to="/signup"
                    className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3.5 rounded-full bg-blue-900/40 hover:bg-blue-900/60 text-white border border-white/30 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Sign In to Store
                  </Link>
                </div>

              </div>
            </div>
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
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Public Customer Review Link */}
          <Route path="/review/:slug" element={<PublicReviewPage />} />

          {/* Protected Business Dashboard (Owner & Staff) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'STAFF']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="pos" element={<POSBillingPage />} />
            <Route path="orders" element={<OrdersHistoryPage />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="expenses" element={<ExpenseListPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="analytics" element={<AnalyticsDashboardPage />} />
            <Route path="reports" element={<ReportsCenterPage />} />
            <Route path="ai" element={<AiAssistantPage />} />
            <Route path="reviews" element={<ReviewBoostDashboardPage />} />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="settings" element={<BusinessSettingsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
          </Route>

          {/* Protected Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardOverviewPage />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="config" element={<AdminSystemConfigPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
