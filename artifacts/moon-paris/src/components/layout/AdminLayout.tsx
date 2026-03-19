import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Store, Tag, Layers, Building2 } from 'lucide-react';
import { useLogoutUser, useGetMe } from '@workspace/api-client-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogoutUser();
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });

  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  const navItems = [
    { name: 'الرئيسية', path: '/admin', icon: LayoutDashboard },
    { name: 'العطور كاملة', path: '/admin/products', icon: Package },
    { name: 'تقسيمات العطور', path: '/admin/samples', icon: Layers },
    { name: 'الشركات', path: '/admin/brands', icon: Building2 },
    { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
    { name: 'العروض والإعلانات', path: '/admin/promotions', icon: Tag },
    { name: 'المستخدمين', path: '/admin/users', icon: Users },
    { name: 'إعدادات الموقع', path: '/admin/settings', icon: Settings },
  ];

  if (isLoading || !user || user.role !== 'admin') return <div className="min-h-screen bg-background text-primary p-10">جاري التحقق من الصلاحيات...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row dir-rtl">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/moon-paris-logo2-nobg.png`} alt="Moon Paris" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="font-display font-bold gold-gradient-text text-xl leading-none">الإدارة</h2>
              <span className="text-xs text-muted-foreground">Moon Paris</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Store className="w-5 h-5" /> <span className="font-medium text-sm">عرض المتجر</span>
          </Link>
          <button 
            onClick={() => { logoutMutation.mutate(); setLocation('/welcome'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all text-right"
          >
            <LogOut className="w-5 h-5" /> <span className="font-medium text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
