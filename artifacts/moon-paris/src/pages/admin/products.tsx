import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from '@workspace/api-client-react';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
interface Brand { id: number; name: string; }

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useGetProducts();
  const createMutation = useCreateProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/products'] }) } });
  const updateMutation = useUpdateProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/products'] }) } });
  const deleteMutation = useDeleteProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/products'] }) } });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`, { credentials: 'include' })
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '', nameAr: '', description: '', descriptionAr: '', price: 0, originalPrice: 0,
    imageUrl: '', category: 'عطور رجالية', brand: '', volume: '100 مل',
    inStock: true, stockQuantity: 10, featured: false
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ name: '', nameAr: '', description: '', descriptionAr: '', price: 0, originalPrice: 0, imageUrl: '', category: 'عطور رجالية', brand: '', volume: '100 مل', inStock: true, stockQuantity: 10, featured: false });
    setIsDialogOpen(true);
  };

  const openEditDialog = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, nameAr: p.nameAr, description: p.description || '', descriptionAr: p.descriptionAr || '',
      price: p.price, originalPrice: p.originalPrice || 0, imageUrl: p.imageUrl || (p.images?.[0] || ''),
      category: p.category, brand: p.brand || '', volume: p.volume || '',
      inStock: p.inStock, stockQuantity: p.stockQuantity, featured: p.featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "تم الحذف بنجاح" });
      } catch (e) {
        toast({ title: "خطأ", variant: "destructive" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stockQuantity: Number(formData.stockQuantity),
      images: formData.imageUrl ? [formData.imageUrl] : []
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsDialogOpen(false);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ أثناء الحفظ", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">المنتجات</h1>
          <p className="text-muted-foreground">إدارة المنتجات المخزنة والتسعير</p>
        </div>
        <LuxuryButton onClick={openCreateDialog} className="gap-2"><Plus className="w-5 h-5"/> إضافة منتج</LuxuryButton>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">صورة</th>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">المخزون</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-background border border-white/5 overflow-hidden flex items-center justify-center p-1">
                      {p.imageUrl || p.images?.[0] ? (
                        <img src={p.imageUrl || p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                      ) : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{p.nameAr}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </td>
                  <td className="px-6 py-4 text-primary font-bold">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${p.inStock && p.stockQuantity > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {p.stockQuantity} متوفر
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditDialog(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-destructive hover:bg-destructive hover:text-white transition-colors bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">لا توجد منتجات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsDialogOpen(false)} className="absolute top-6 left-6 text-muted-foreground hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold font-display mb-6">{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الاسم (عربي) *</label>
                  <LuxuryInput required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الاسم (انجليزي) *</label>
                  <LuxuryInput required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">السعر (دينار) *</label>
                  <LuxuryInput required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value as any})} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">السعر قبل الخصم (اختياري)</label>
                  <LuxuryInput type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value as any})} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">القسم *</label>
                  <LuxurySelect required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="عطور رجالية">عطور رجالية</option>
                    <option value="عطور نسائية">عطور نسائية</option>
                    <option value="عطور للجنسين">عطور للجنسين</option>
                    <option value="عطور نيش">عطور نيش</option>
                  </LuxurySelect>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">اسم الشركة</label>
                  <LuxurySelect value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                    <option value="">-- اختر الشركة --</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </LuxurySelect>
                  {brands.length === 0 && <p className="text-xs text-amber-400 mt-1">لا توجد شركات — أضف من قسم الشركات أولاً</p>}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الكمية في المخزون *</label>
                  <LuxuryInput required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value as any})} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الحجم</label>
                  <LuxuryInput value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">صورة المنتج</label>
                <ImageUploadInput value={formData.imageUrl} onChange={val => setFormData({...formData, imageUrl: val})} />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">وصف المنتج (عربي)</label>
                <textarea className="w-full h-24 rounded-xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none" value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} />
              </div>

              <div className="flex gap-6 pt-4 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 accent-primary bg-background border-border rounded" />
                  <span>متوفر في المخزون</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-5 h-5 accent-primary bg-background border-border rounded" />
                  <span>عرض في الرئيسية (منتج مميز)</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <LuxuryButton type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>إلغاء</LuxuryButton>
                <LuxuryButton type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>حفظ المنتج</LuxuryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
