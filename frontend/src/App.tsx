import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { 
  Receipt,
  Package,
  Users,
  TrendingDown,
  BarChart3,
  Star,
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle,
  QrCode,
  Download,
  Printer,
  Building2,
  Coffee,
  Bot
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const coreFeatures = [
    {
      title: t('nav.billing', 'Billing'),
      desc: t('landing.billingDesc', 'Create and manage bills quickly with thermal receipts and barcode support.'),
      icon: Receipt,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: t('nav.products', 'Products & Services'),
      desc: t('landing.productsDesc', 'Keep your products and services organized with pricing and variants.'),
      icon: Package,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: t('nav.customers', 'Customers'),
      desc: t('landing.customersDesc', 'Understand customer activity, purchase history and outstanding balances.'),
      icon: Users,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: t('nav.expenses', 'Expenses'),
      desc: t('landing.expensesDesc', 'Track where your money goes with categorized daily operating costs.'),
      icon: TrendingDown,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: t('nav.analytics', 'Analytics'),
      desc: t('landing.analyticsDesc', 'Understand your sales, profit margins, and business performance trends.'),
      icon: BarChart3,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: t('nav.reviews', 'Review Boost'),
      desc: t('landing.reviewsDesc', 'Collect feedback via QR code and build your online 5-star reputation.'),
      icon: Star,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: t('nav.aiAssistant', 'AI Assistant'),
      desc: t('landing.aiDesc', 'Get instant answers and proactive growth recommendations from store data.'),
      icon: Sparkles,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      title: t('nav.reports', 'Reports'),
      desc: t('landing.reportsDesc', 'Generate clear business, sales, tax, and inventory reports in PDF & CSV.'),
      icon: FileText,
      color: 'text-zinc-600 bg-zinc-50 border-zinc-200',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-zinc-900 font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-24">
        
        {/* =========================================================================
            SECTION 1: HERO SECTION
           ========================================================================= */}
        <section className="text-center space-y-6 pt-6 sm:pt-12 max-w-4xl mx-auto">
          {/* Small Label */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            <span className="tracking-wide uppercase text-[11px] font-bold text-zinc-600">
              {t('landing.heroBadge', 'SMART RETAIL & BILLING PLATFORM')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            {t('landing.heroTitle', 'Manage and grow your business with ease')}
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle', 'Modern billing, fast inventory, AI customer reviews and detailed analytics — all in one platform.')}
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              id="hero-register-btn"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>{t('landing.startFreeTrial', 'Start Free Trial')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#core-features"
              id="hero-features-btn"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>{t('landing.watchDemo', 'Explore Features')}</span>
            </a>
          </div>

          {/* Hero Visual: Realistic BizFlow Dashboard Preview Mockup */}
          <div className="pt-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-card max-w-5xl mx-auto text-left overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 text-xs text-zinc-500">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                  </div>
                  <span className="font-semibold text-zinc-700 pl-2">BizFlow Workspace</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                    {t('dashboard.activeStore', 'Live Store')}
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Mockup KPI 1 */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.todaySales', "Today's Sales")}</div>
                  <div className="text-2xl font-bold text-zinc-900 mt-1">₹24,850.00</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">+8.4% vs yesterday</div>
                </div>

                {/* Mockup KPI 2 */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.todayOrders', 'Orders')}</div>
                  <div className="text-2xl font-bold text-zinc-900 mt-1">42</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{t('dashboard.completedBills', 'Completed bills')}</div>
                </div>

                {/* Mockup KPI 3 */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.todayExpenses', 'Expenses')}</div>
                  <div className="text-2xl font-bold text-zinc-900 mt-1">₹3,400.00</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{t('dashboard.dailyOverhead', 'Daily overhead')}</div>
                </div>

                {/* Mockup KPI 4 */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('reviews.googleRating', 'Review Rating')}</div>
                  <div className="text-2xl font-bold text-zinc-900 mt-1 flex items-center gap-1">
                    4.9 <Star className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">128 {t('reviews.totalReviews', 'verified reviews')}</div>
                </div>
              </div>

              {/* Mini Table Preview */}
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-2">
                  <span>{t('dashboard.recentTransactions', 'Recent Transactions')}</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">POS Terminal Connected</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50">
                    <span className="font-mono font-semibold text-zinc-800">INV-2026-089</span>
                    <span className="text-zinc-600">Walk-in Customer</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold">CARD</span>
                    <span className="font-bold text-zinc-900">₹1,240.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50">
                    <span className="font-mono font-semibold text-zinc-800">INV-2026-088</span>
                    <span className="text-zinc-600">Online Order</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold">CASH</span>
                    <span className="font-bold text-zinc-900">₹850.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: TRUSTED / SIMPLE BUSINESS MANAGEMENT MESSAGE
           ========================================================================= */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 shadow-card text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {t('landing.builtForCommerce', 'Built for Modern Commerce')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {t('landing.featuresTitle', 'Powerful features designed to empower your business')}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              {t('landing.featuresSubtitle', 'From superfast POS billing to smart inventory tracking, BizFlow is crafted for every merchant.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">{t('landing.speed', 'Speed')}</div>
              <div className="text-base font-bold text-zinc-900 mt-1">{t('landing.feature1Title', 'Instant Checkout')}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t('billing.searchProducts', 'Quick barcode & SKU lookup')}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">{t('landing.security', 'Security')}</div>
              <div className="text-base font-bold text-zinc-900 mt-1">{t('landing.isolatedData', 'Isolated Data')}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t('footer.postgresDb', 'Multi-tenant protection')}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">{t('landing.flexibility', 'Flexibility')}</div>
              <div className="text-base font-bold text-zinc-900 mt-1">{t('landing.adaptableScale', 'Adaptable Scale')}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t('landing.smallToEnterprise', 'Small shops to enterprises')}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">{t('landing.simplicity', 'Simplicity')}</div>
              <div className="text-base font-bold text-zinc-900 mt-1">{t('landing.zeroClutter', 'Zero Clutter')}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t('landing.noLearningCurve', 'No complex learning curve')}</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: CORE FEATURES (8 Clean Cards)
           ========================================================================= */}
        <section id="core-features" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('landing.featuresBadge', 'Features')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {t('landing.essentialTools', 'Essential Tools for Every Business')}
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              {t('landing.essentialToolsDesc', 'Everything your staff and management need to run operations smoothly.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">{feat.title}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: EVERYTHING YOUR BUSINESS NEEDS
           ========================================================================= */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 shadow-card space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('landing.workflowBadge', 'All-in-One Workflow')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {t('landing.workflowTitle', 'Everything your business needs')}
            </h2>
            <p className="text-sm text-zinc-600">
              {t('landing.workflowSubtitle', 'One central hub connects your front-desk checkout with back-office inventory, accounts, and reports.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-brand-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-zinc-900">{t('landing.feature1Title', 'Fast Front-Desk Billing')}</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t('landing.feature1Desc', 'Scan products, add discounts, select payment modes (Cash, UPI, Card), and print thermal or standard receipts in seconds.')}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-brand-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-zinc-900">{t('landing.feature2Title', 'Adaptive Stock Tracking')}</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t('landing.feature2Desc', 'Automated stock deduction on billing with low-stock alerts and automatic re-ordering suggestions.')}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-brand-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-zinc-900">{t('landing.feature4Title', 'Real Financial Overview')}</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t('landing.feature4Desc', 'Monitor real revenues, log daily operating expenses, track net margins, and download consolidated tax and sales reports.')}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: REVIEW BOOST
           ========================================================================= */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{t('nav.reviews', 'Review Boost')}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {t('landing.reviewsHeading', 'Let customers share their experience.')}
              </h2>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {t('landing.feature3Desc', 'Generate a custom QR code for your counter. Customers can quickly rate your service, submit direct private feedback, and share 5-star ratings online.')}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs text-zinc-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{t('landing.qrCodePrint', 'Instant counter QR code download and print')}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-zinc-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{t('landing.privateFeedback', 'Capture private customer suggestions & resolve issues early')}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-zinc-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{t('landing.trackRatings', 'Track rating trends, star distributions, and review growth')}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>{t('landing.startCollectingReviews', 'Start collecting reviews')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Clean QR Visual Card */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex flex-col items-center text-center space-y-4 max-w-sm mx-auto w-full">
              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <QrCode className="w-32 h-32 text-zinc-900" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">{t('reviews.qrCodeTitle', 'Scan & Review Our Store')}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{t('reviews.qrCodeSubtitle', 'Quick rating & customer feedback')}</div>
              </div>

              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>

              <div className="flex items-center gap-2 w-full pt-1">
                <div className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-700 flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{t('common.download', 'Download')}</span>
                </div>
                <div className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-700 flex items-center justify-center gap-1">
                  <Printer className="w-3 h-3" />
                  <span>{t('common.print', 'Print')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: AI BUSINESS ASSISTANT (Realistic Subtle Chat)
           ========================================================================= */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>{t('ai.title', 'AI Business Assistant')}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {t('landing.askQuestionsAi', 'Ask questions about your business.')}
              </h2>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {t('ai.welcomeMessage', 'Connect your business numbers with an intelligent conversational assistant. Get fast answers regarding sales, top products, expenses, and inventory needs.')}
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-700 font-medium">
                  "{t('ai.prompt1', 'How were my sales this month?')}"
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-700 font-medium">
                  "{t('ai.prompt2', 'What are my best-selling products?')}"
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-700 font-medium">
                  "{t('ai.prompt3', 'Which products need restocking?')}"
                </div>
              </div>
            </div>

            {/* Realistic Chat Interface Mockup */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 space-y-4 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{t('ai.title', 'AI Business Assistant')}</div>
                    <div className="text-[10px] text-zinc-500">{t('ai.connectedStoreData', 'Connected to Store Data')}</div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 text-xs">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="bg-brand-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] leading-relaxed font-medium">
                    {t('ai.prompt1', 'How were my sales this month?')}
                  </div>
                </div>

                {/* AI Bubble */}
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 text-zinc-800 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] shadow-xs space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-zinc-900">
                      {t('ai.salesIncreaseDemo', 'Your sales increased 12% compared with last month.')}
                    </p>
                    <p className="text-zinc-600 text-[11px]">
                      {t('ai.salesStatsDemo', 'Total revenue reached ₹184,200 across 312 orders. Your top-performing category was Beverages.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input Bar */}
              <div className="pt-2">
                <div className="flex items-center p-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-400 justify-between">
                  <span>{t('ai.placeholder', 'Ask a question about sales or inventory...')}</span>
                  <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: SMALL VS LARGE BUSINESS COMPARISON
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{t('landing.scalabilityBadge', 'Scalability')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {t('landing.adaptsToSize', 'Adapts Seamlessly to Your Business Size')}
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              {t('landing.adaptsToSizeSubtitle', 'Whether running a single neighborhood café or a multi-location enterprise retail chain.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Small Business Tier */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                  {t('landing.smallBusiness', 'Small Business')}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900">{t('landing.leanSetup', 'Lean & Fast Setup')}</h3>
                <p className="text-xs text-zinc-600 mt-1">
                  {t('landing.leanSetupDesc', 'Ideal for cafes, bakeries, salons, and retail counters wanting fast point of sale without clutter.')}
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700 border-t border-zinc-100 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.fastPosBilling', 'Simple lightning POS billing')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.catalogManagement', 'Products and service catalog')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.customerHistory', 'Customer directory and history')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.dailyExpenseTracking', 'Daily operating expense tracking')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.basicAnalytics', 'Basic revenue analytics')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.reputationBoost', 'Review Boost customer reputation')}</span>
                </li>
              </ul>
            </div>

            {/* Large Business Tier */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                  {t('landing.largeBusiness', 'Large Business')}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900">{t('landing.enterpriseOperations', 'Enterprise Operations')}</h3>
                <p className="text-xs text-zinc-600 mt-1">
                  {t('landing.enterpriseDesc', 'Built for growing establishments managing warehouses, multiple staff, and advanced supply chains.')}
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700 border-t border-zinc-100 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.multiLocationInventory', 'Advanced multi-location inventory & transfers')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.supplierLedgers', 'Supplier ledgers & inward purchase orders')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.multiBranchAnalytics', 'Multi-branch performance breakdown')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.taxReportsExport', 'Comprehensive PDF & Excel tax reports')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.aiInsightsDeep', 'AI Business Assistant & deep insights')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('landing.reputationBoost', 'Review Boost customer reputation')}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: FINAL CTA
           ========================================================================= */}
        <section className="bg-zinc-900 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('landing.ctaTitle', 'Digitize your business today')}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t('landing.ctaSubtitle', 'Get started with BizFlow in minutes. Join thousands of successful businesses.')}
            </p>
          </div>

          <div>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>{t('landing.ctaButton', 'Start Free Trial')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Live System Diagnostic */}
        <section>
          <HealthStatus />
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
