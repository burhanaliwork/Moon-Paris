import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStats } from '@workspace/api-client-react';
import { ShoppingCart, DollarSign, Package, Users, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) return <AdminLayout><div className="text-primary">جاري التحميل...</div></AdminLayout>;

  const cards = [
    { title: 'إجمالي المبيعات', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'طلبات قيد الانتظار', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'العملاء', value: stats?.totalUsers || 0, icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المتجر</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <span className="text-muted-foreground text-sm font-medium">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bg}`}><Icon className={`w-5 h-5 ${card.color}`} /></div>
              </div>
              <div className="text-2xl font-bold text-foreground relative z-10">{card.value}</div>
              {/* decorative blur */}
              <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${card.bg.replace('/10', '')}`} />
            </motion.div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
