import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminUsers, useDeleteUser } from '@workspace/api-client-react';
import { Trash2, ShieldCheck, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useGetAdminUsers();
  const deleteMutation = useDeleteUser({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] }) } });

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "تم حذف المستخدم بنجاح" });
      } catch (e: any) {
        toast({ title: "خطأ", description: e.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">المستخدمين</h1>
        <p className="text-muted-foreground">قائمة المسجلين في الموقع</p>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">معلومات الاتصال</th>
                <th className="px-6 py-4">العنوان</th>
                <th className="px-6 py-4">تاريخ التسجيل</th>
                <th className="px-6 py-4">الصلاحية</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{u.fullName}</td>
                  <td className="px-6 py-4">
                    <div dir="ltr" className="text-right text-muted-foreground">{u.phone || '-'}</div>
                    <div className="text-xs text-muted-foreground/70">{u.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {u.governorate ? `${u.governorate} - ${u.district}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded w-max text-xs"><ShieldCheck size={14}/> مدير</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground bg-secondary px-2 py-1 rounded w-max text-xs"><User size={14}/> مستخدم</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id)} disabled={deleteMutation.isPending} className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">لا يوجد مستخدمين</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
