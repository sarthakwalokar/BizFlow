import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ShieldAlert,
  Percent,
  ChevronRight,
  Receipt,
  CircleDollarSign,
  TrendingDown,
  Contact,
  Star,
  Boxes,
  BarChart3,
  FileText,
  Sparkles,
  FolderTree,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LucideIcon,
  UtensilsCrossed,
  ChefHat,
  CalendarCheck,
  Scissors,
  Smartphone,
  ShieldCheck,
  Wrench,
  Activity,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export interface InventoryAlert {
  id: number;
  type: 'OUT_OF_STOCK' | 'LOW_STOCK';
  productName: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface NavGroup {
  groupTitle?: string;
  items: {
    label: string;
    path: string;
    icon: LucideIcon;
    roles: ('OWNER' | 'STAFF' | 'ADMIN')[];
    requiresInventory?: boolean;
    ownerOnly?: boolean;
  }[];
}

export const AppLayout: React.FC = () => {
  const { user, business, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bizflow_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bizflow_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const fetchInventoryAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await productsApi.getProducts({ size: 100, active: true });
      const items = res.content || [];
      const derivedAlerts: InventoryAlert[] = [];

      items.forEach((p) => {
        const stock = p.stockQuantity ?? 0;
        const threshold = p.lowStockThreshold ?? 5;

        if (p.trackStock || p.productType === 'PHYSICAL') {
          if (stock === 0) {
            derivedAlerts.push({
              id: p.id,
              type: 'OUT_OF_STOCK',
              productName: p.name,
              stockQuantity: 0,
              lowStockThreshold: threshold,
            });
          } else if (stock <= threshold) {
            derivedAlerts.push({
              id: p.id,
              type: 'LOW_STOCK',
              productName: p.name,
              stockQuantity: stock,
              lowStockThreshold: threshold,
            });
          }
        }
      });

      setAlerts(derivedAlerts);
    } catch (err) {
      console.error('Failed to fetch inventory alerts', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchInventoryAlerts();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSpecializedNavGroup = (): NavGroup | null => {
    const bType = business?.businessType?.toUpperCase();

    if (bType === 'RESTAURANT' || bType === 'CAFE') {
      return {
        groupTitle: t('nav.diningTables', 'Dining & Tables'),
        items: [
          {
            label: t('nav.tablesOrders', 'Tables & Orders'),
            path: '/dashboard/restaurant/tables',
            icon: UtensilsCrossed,
            roles: ['OWNER', 'STAFF'],
          },
          {
            label: t('nav.kitchenKot', 'Kitchen KOT'),
            path: '/dashboard/restaurant/kot',
            icon: ChefHat,
            roles: ['OWNER', 'STAFF'],
          },
        ],
      };
    }

    if (bType === 'SALON' || bType === 'BEAUTY_PARLOUR') {
      return {
        groupTitle: t('nav.salonManagement', 'Salon Management'),
        items: [
          {
            label: t('nav.appointments', 'Appointments'),
            path: '/dashboard/salon/appointments',
            icon: CalendarCheck,
            roles: ['OWNER', 'STAFF'],
          },
          {
            label: t('nav.serviceCatalog', 'Service Catalog'),
            path: '/dashboard/salon/services',
            icon: Scissors,
            roles: ['OWNER', 'STAFF'],
          },
        ],
      };
    }

    if (bType === 'ELECTRONICS' || bType === 'MOBILE_STORE') {
      return {
        groupTitle: t('nav.electronicsWarranty', 'Electronics & Warranty'),
        items: [
          {
            label: t('nav.serialImeiTracker', 'Serial & IMEI Tracker'),
            path: '/dashboard/electronics/serials',
            icon: Smartphone,
            roles: ['OWNER', 'STAFF'],
          },
          {
            label: t('nav.warrantyLookup', 'Warranty Lookup'),
            path: '/dashboard/electronics/warranty-lookup',
            icon: ShieldCheck,
            roles: ['OWNER', 'STAFF'],
          },
        ],
      };
    }

    if (bType === 'REPAIR' || bType === 'SERVICE') {
      return {
        groupTitle: t('nav.repairsService', 'Repairs & Service'),
        items: [
          {
            label: t('nav.jobCards', 'Job Cards'),
            path: '/dashboard/repairs/job-cards',
            icon: Wrench,
            roles: ['OWNER', 'STAFF'],
          },
          {
            label: t('nav.repairTracking', 'Repair Tracking'),
            path: '/dashboard/repairs/tracking',
            icon: Activity,
            roles: ['OWNER', 'STAFF'],
          },
        ],
      };
    }

    if (bType === 'EDUCATION') {
      return null;
    }

    return null;
  };

  const isEducation = business?.businessType?.toUpperCase() === 'EDUCATION';
  const isRestaurant = business?.businessType?.toUpperCase() === 'RESTAURANT' || business?.businessType?.toUpperCase() === 'CAFE';
  const specializedGroup = getSpecializedNavGroup();

  const educationNavGroups: NavGroup[] = [
    {
      items: [
        {
          label: t('nav.overview', 'Dashboard'),
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.studentsGroup', 'Students'),
      items: [
        {
          label: t('nav.students', 'Students'),
          path: '/dashboard/education/students',
          icon: GraduationCap,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.coursesBatches', 'Courses & Batches'),
          path: '/dashboard/education/courses',
          icon: BookOpen,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.feesGroup', 'Fees'),
      items: [
        {
          label: t('nav.feeManagement', 'Fee Management'),
          path: '/dashboard/education/fees',
          icon: CircleDollarSign,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.insights', 'Insights'),
      items: [
        {
          label: t('nav.analytics', 'Analytics'),
          path: '/dashboard/analytics',
          icon: BarChart3,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.reports', 'Reports'),
          path: '/dashboard/reports',
          icon: FileText,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
  ];

  const baseNavGroups: NavGroup[] = [
    {
      items: [
        {
          label: t('nav.overview', 'Overview'),
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.business', 'Business'),
      items: [
        {
          label: t('nav.products', 'Products & Services'),
          path: '/dashboard/products',
          icon: Package,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.categories', 'Categories'),
          path: '/dashboard/categories',
          icon: FolderTree,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.customers', 'Customers'),
          path: '/dashboard/customers',
          icon: Contact,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.operations', 'Operations'),
      items: [
        ...(isRestaurant
          ? []
          : [
              {
                label: t('nav.pos', 'POS Billing'),
                path: '/dashboard/pos',
                icon: Receipt,
                roles: ['OWNER', 'STAFF'] as ('OWNER' | 'STAFF' | 'ADMIN')[],
              },
            ]),
        {
          label: t('nav.bills', 'Invoices & Orders'),
          path: '/dashboard/bills',
          icon: CircleDollarSign,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.expenses', 'Expenses'),
          path: '/dashboard/expenses',
          icon: TrendingDown,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.inventory', 'Inventory'),
          path: '/dashboard/inventory',
          icon: Boxes,
          roles: ['OWNER', 'STAFF'],
          requiresInventory: true,
        },
      ],
    },
    ...(specializedGroup ? [specializedGroup] : []),
    {
      groupTitle: t('nav.insights', 'Insights'),
      items: [
        {
          label: t('nav.analytics', 'Analytics'),
          path: '/dashboard/analytics',
          icon: BarChart3,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.reviews', 'Reviews'),
          path: '/dashboard/reviews',
          icon: Star,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.tools', 'Tools'),
      items: [
        {
          label: t('nav.aiAssistant', 'AI Assistant'),
          path: '/dashboard/ai-assistant',
          icon: Sparkles,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.reports', 'Reports'),
          path: '/dashboard/reports',
          icon: FileText,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
  ];

  const navGroups = isEducation ? educationNavGroups : baseNavGroups;


  const getBusinessTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'RETAIL':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'RESTAURANT':
      case 'CAFE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'BAKERY':
      case 'SWEET_SHOP':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'SALON':
      case 'BEAUTY_PARLOUR':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'MOBILE_STORE':
      case 'ELECTRONICS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REPAIR':
      case 'SERVICE':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'EDUCATION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-950 text-white border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="flex items-center bg-slate-950 px-2 py-1 rounded-xl">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-7 sm:h-8 w-auto max-w-[130px] object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBusinessTypeBadgeColor(
              business?.businessType || 'RESTAURANT'
            )}`}
          >
            {business?.businessType || 'RESTAURANT'}
          </span>
        </div>
      </header>

      {/* Sidebar Navigation - Sleek Minimalist Navy / Clay Accent */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-950 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:inset-auto md:min-h-screen shadow-2xl md:shadow-none border-r border-slate-800/80 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          sidebarCollapsed
            ? 'md:w-0 md:opacity-0 md:-translate-x-full md:border-r-0 md:pointer-events-none md:overflow-hidden'
            : 'w-64 md:w-64 md:opacity-100'
        }`}
      >
        <div className="flex flex-col h-full w-64 min-w-[16rem]">
          {/* Logo & Business Brand Badge */}
          <div className="p-4 border-b border-slate-800/80">
            <Link to="/dashboard" className="flex items-center group py-1">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:scale-102 transition-transform"
              />
            </Link>

            {/* Restaurant / Store Badge Card */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center space-x-3 shadow-inner">
              {business?.logo ? (
                <img
                  src={business.logo}
                  alt={business.name || 'Spice Garden Fine Dine'}
                  className="w-9 h-9 rounded-xl object-contain border border-slate-700 bg-white p-0.5 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  <Store size={16} />
                </div>
              )}
              <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {business?.name || 'Spice Garden Fine Dine'}
                </h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-[10px] text-cyan-300/90 font-semibold tracking-wider uppercase truncate">
                    {business?.businessType || 'RESTAURANT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links Hierarchy */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {navGroups.map((group, gIdx) => {
              const visibleItems = group.items.filter((item) => {
                if (!user || !item.roles.includes(user.role)) return false;
                if (item.requiresInventory && business?.inventoryEnabled === false) return false;
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  {group.groupTitle && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.groupTitle}
                    </div>
                  )}

                  {visibleItems.map((item) => {
                    const active = isItemActive(item.path);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? 'bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-brand-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {active && <ChevronRight size={13} className="text-white/80" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {/* Owner Section: Settings & Staff */}
            {isOwner && (
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('nav.administration', 'Administration')}
                </div>
                <Link
                  to="/dashboard/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/staff')
                      ? 'bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users size={16} className={location.pathname.startsWith('/dashboard/staff') ? 'text-white' : 'text-slate-400'} />
                    <span>{isEducation ? t('nav.staffManagement', 'Staff Management') : t('nav.staff', 'Staff Team')}</span>
                  </div>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/settings')
                      ? 'bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings size={16} className={location.pathname.startsWith('/dashboard/settings') ? 'text-white' : 'text-slate-400'} />
                    <span>{isEducation ? t('nav.instituteSettings', 'Institute Settings') : t('nav.settings', 'Business Settings')}</span>
                  </div>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  {t('admin.portal', 'Platform Admin')}
                </div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors mt-1"
                >
                  <ShieldAlert size={16} />
                  <span>{t('nav.adminDashboard', 'Admin Portal')}</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Bottom AI Callout: Grow Your Business (Hidden for Education) */}
          {!isEducation && (
            <div className="p-3 border-t border-slate-800/80">
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">{t('nav.growBusiness', 'Grow Your Business')}</h5>
                    <span className="text-[10px] text-cyan-400 font-medium">BizFlow AI</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {t('nav.smartRecommendations', 'Smart recommendations grounded in your store data.')}
                </p>
                <Link
                  to="/dashboard/ai-assistant"
                  className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>{t('nav.askAi', 'Ask AI')}</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 overflow-hidden flex-1 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'J'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {user?.fullName || 'jay'}
                  </p>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {user?.role || 'OWNER'}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title={t('nav.logout', 'Logout')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F6FB]">
        {/* Top Header - Minimalist Claymorphic Surface */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Left: Sidebar Toggle + Business Branding Header */}
          <div className="flex items-center space-x-3.5">
            {/* Sidebar Hide / Unhide Toggle Button - Three Line Menu Icon */}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Show sidebar (Ctrl+B)" : "Hide sidebar (Ctrl+B)"}
              className={`p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                sidebarCollapsed
                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 ring-1 ring-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              <Menu size={19} />
            </button>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Store size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {business?.name || 'Spice Garden Fine Dine'}
              </h2>
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">
                {business?.businessType || 'RESTAURANT'}
              </span>
            </div>
          </div>

          {/* Right actions: Interactive Notification Center, GST : 5%, User & Email */}
          <div className="flex items-center space-x-3.5">
            {/* Interactive Notification Bell & Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title={t('nav.notifications', 'Notifications')}
                className="relative p-2 rounded-xl clay-btn-secondary text-slate-600 hover:text-brand-600 transition-colors cursor-pointer flex items-center justify-center"
              >
                <Bell size={17} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Menu */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 clay-card p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{t('nav.notifications', 'Notifications')}</h4>
                      {alerts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                          {alerts.length} {alerts.length === 1 ? t('nav.alert', 'alert') : t('nav.alerts', 'alerts')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={fetchInventoryAlerts}
                      title={t('common.refresh', 'Refresh')}
                      disabled={loadingAlerts}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} className={loadingAlerts ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {/* Alert List */}
                  <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                    {alerts.length === 0 ? (
                      <div className="py-8 px-4 text-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                          <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-800">{t('nav.allCaughtUp', "You're all caught up")}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {t('nav.noAlerts', 'No inventory alerts right now.')}
                        </p>
                      </div>
                    ) : (
                      alerts.map((alert) => {
                        const isOutOfStock = alert.type === 'OUT_OF_STOCK';

                        return (
                          <Link
                            key={`${alert.id}-${alert.type}`}
                            to="/dashboard/inventory"
                            onClick={() => setNotificationsOpen(false)}
                            className={`block p-3 rounded-2xl border transition-all cursor-pointer ${
                              isOutOfStock
                                ? 'bg-rose-50/70 border-rose-200/90 hover:bg-rose-100/80 hover:border-rose-300'
                                : 'bg-amber-50/70 border-amber-200/90 hover:bg-amber-100/80 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                                  isOutOfStock
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {isOutOfStock ? (
                                  <AlertTriangle size={15} />
                                ) : (
                                  <AlertCircle size={15} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`text-xs font-bold ${
                                      isOutOfStock ? 'text-rose-700' : 'text-amber-800'
                                    }`}
                                  >
                                    {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                      isOutOfStock
                                        ? 'bg-rose-200/80 text-rose-900'
                                        : 'bg-amber-200/80 text-amber-900'
                                    }`}
                                  >
                                    {isOutOfStock ? '0 units' : `${alert.stockQuantity} left`}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                                  {isOutOfStock
                                    ? `${alert.productName} is currently out of stock.`
                                    : `${alert.productName} has only ${alert.stockQuantity} ${
                                        alert.stockQuantity === 1 ? 'unit' : 'units'
                                      } remaining.`}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  {alerts.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                      <Link
                        to="/dashboard/inventory"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{t('inventory.manageInventory', 'Manage Inventory')}</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GST : 5% badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full clay-badge-blue text-xs font-bold">
              <Percent size={12} className="text-brand-600" />
              <span>
                {business?.taxName || 'GST'} : {business?.taxRate !== undefined && business?.taxRate > 0 ? `${business.taxRate}%` : '5%'}
              </span>
            </div>

            <div className="h-5 w-px bg-slate-200"></div>

            {/* User Profile Info: User "jay", Email "jay@gmail.com" */}
            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-3 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || 'jay'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {user?.email || 'jay@gmail.com'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'J'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 bg-[#F4F6FB]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
