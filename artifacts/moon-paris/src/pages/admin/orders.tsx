import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const statusMap: Record<string, { label: string, color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-500 bg-yellow-500/10' },
  processing: { label: 'قيد التجهيز', color: 'text-blue-500 bg-blue-500/10' },
  shipped: { label: 'تم الشحن', color: 'text-purple-500 bg-purple-500/10' },
  delivered: { label: 'تم التوصيل', color: 'text-green-500 bg-green-500/10' },
  cancelled: { label: 'ملغي', color: 'text-red-500 bg-red-500/10' },
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useGetOrders();
  const updateStatusMutation = useUpdateOrderStatus({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/orders'] }) } });

  const handleStatusChange = async (id: number, status: any) => {
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status } });
      toast({ title: "تم تحديث حالة الطلب" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">الطلبات</h1>
        <p className="text-muted-foreground">إدارة طلبات العملاء وحالات التوصيل</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold">طلب #{order.id}</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${statusMap[order.status].color}`}>
                    {statusMap[order.status].label}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2 border border-white/5">
                <span className="text-sm text-muted-foreground px-2">تغيير الحالة:</span>
                <select 
                  className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary text-foreground cursor-pointer"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد التجهيز</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-sm text-primary mb-4 uppercase tracking-widest">تفاصيل العميل والتوصيل</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">الاسم:</span> <span className="font-medium">{order.guestName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">الهاتف:</span> <span className="font-medium text-left" dir="ltr">{order.guestPhone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">المحافظة:</span> <span className="font-medium">{order.guestGovernorate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">المنطقة:</span> <span className="font-medium">{order.guestDistrict}</span></div>
                  {order.notes && (
                     <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-white/5 text-muted-foreground">
                       <span className="font-bold block mb-1 text-foreground">ملاحظات:</span>
                       {order.notes}
                     </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-primary mb-4 uppercase tracking-widest">المنتجات المطلوبة</h4>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm items-center border-b border-white/5 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-bold">{item.quantity}x</span>
                        <span>{item.productNameAr}</span>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                    <span className="font-bold text-lg">الإجمالي</span>
                    <span className="font-bold text-2xl gold-gradient-text">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && !isLoading && (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">لا توجد طلبات حالياً</div>
        )}
      </div>
    </AdminLayout>
  );
}
