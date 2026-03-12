import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { Plus, Trash2, X, Tag, Percent, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API = '/api/promotions';
const CATEGORIES = ['رجالي', 'نسائي', 'عربي', 'للجنسين'];

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  badgeText: string | null;
  discountPercent: number | null;
  targetCategory: string | null;
  active: boolean;
  bgColor: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bulkForm, setBulkForm] = useState({ category: CATEGORIES[0], discountPercent: '' });
  const [bulkLoading, setBulkLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    badgeText: '',
    discountPercent: '',
    targetCategory: '',
    active: true,
    bgColor: '#b8860b',
    expiresAt: '',
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/all`, { credentials: 'include' });
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch { setPromotions([]); }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', description: '', badgeText: '', discountPercent: '', targetCategory: '', active: true, bgColor: '#b8860b', expiresAt: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || '',
      badgeText: p.badgeText || '',
      discountPercent: p.discountPercent?.toString() || '',
      targetCategory: p.targetCategory || '',
      active: p.active,
      bgColor: p.bgColor,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      expiresAt: form.expiresAt || null,
    };
    try {
      const res = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast({ title: editingId ? 'تم التحديث بنجاح' : 'تم إضافة العرض بنجاح' });
      setIsDialogOpen(false);
      load();
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل تريد حذف هذا العرض؟')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'تم الحذف' });
      load();
    } catch { toast({ title: 'خطأ', variant: 'destructive' }); }
  };

  const toggleActive = async (p: Promotion) => {
    try {
      await fetch(`${API}/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      load();
    } catch { }
  };

  const handleBulkPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/bulk-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: bulkForm.category, discountPercent: Number(bulkForm.discountPercent) }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `✅ ${data.message}` });
        setIsBulkOpen(false);
      } else {
        throw new Error();
      }
    } catch { toast({ title: 'خطأ', variant: 'destructive' }); }
    setBulkLoading(false);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">العروض والإعلانات</h1>
          <p className="text-muted-foreground">أضف عروضاً وتخفيضات وإعلانات تظهر للزبائن في صفحة المتجر</p>
        </div>
        <div className="flex gap-3">
          <LuxuryButton variant="ghost" onClick={() => setIsBulkOpen(true)} className="gap-2 border border-primary/30">
            <Percent className="w-4 h-4" /> تخفيض بالجملة
          </LuxuryButton>
          <LuxuryButton onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> إضافة عرض
          </LuxuryButton>
        </div>
      </div>

      {/* Promotions Grid */}
      {isLoading ? (
        <div className="text-primary text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map(p => (
            <div key={p.id} className="bg-card border border-white/5 rounded-2xl overflow-hidden relative">
              {/* Color stripe */}
              <div className="h-2" style={{ background: p.bgColor }} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                      {p.badgeText && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold text-black" style={{ background: p.bgColor }}>
                          {p.badgeText}
                        </span>
                      )}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-primary bg-secondary/50 rounded-lg transition-colors">
                      <RefreshCw size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive bg-secondary/50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-4">
                  {p.discountPercent && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md font-medium">
                      خصم {p.discountPercent}%
                    </span>
                  )}
                  {p.targetCategory && (
                    <span className="px-2 py-1 bg-secondary rounded-md">قسم: {p.targetCategory}</span>
                  )}
                  {p.expiresAt && (
                    <span className="px-2 py-1 bg-secondary rounded-md">
                      ينتهي: {new Date(p.expiresAt).toLocaleDateString('ar-IQ')}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm text-muted-foreground">الحالة</span>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      p.active ? 'bg-green-500/10 text-green-400' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {p.active ? '● نشط' : '○ موقوف'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {promotions.length === 0 && (
            <div className="col-span-2 text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد عروض حالياً. أضف عرضك الأول!</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsDialogOpen(false)} className="absolute top-6 left-6 text-muted-foreground hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold font-display mb-6">{editingId ? 'تعديل العرض' : 'إضافة عرض جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">عنوان العرض *</label>
                  <LuxuryInput required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثال: عروض الصيف 🔥" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">وصف العرض</label>
                  <textarea
                    className="w-full h-20 rounded-xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="تفاصيل إضافية تظهر للزبون"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">نص الشارة (badge)</label>
                  <LuxuryInput value={form.badgeText} onChange={e => setForm({...form, badgeText: e.target.value})} placeholder="مثال: خصم 20%" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">نسبة الخصم % (اختياري)</label>
                  <LuxuryInput type="number" min="1" max="90" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: e.target.value})} placeholder="20" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">القسم المستهدف (اختياري)</label>
                  <LuxurySelect value={form.targetCategory} onChange={e => setForm({...form, targetCategory: e.target.value})}>
                    <option value="">كل الأقسام</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </LuxurySelect>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">لون العرض</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={form.bgColor} onChange={e => setForm({...form, bgColor: e.target.value})} className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent" />
                    <LuxuryInput value={form.bgColor} onChange={e => setForm({...form, bgColor: e.target.value})} dir="ltr" className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">تاريخ انتهاء العرض</label>
                  <LuxuryInput type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-5 h-5 accent-primary" />
                <span>العرض نشط (يظهر للزبائن)</span>
              </label>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <LuxuryButton type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>إلغاء</LuxuryButton>
                <LuxuryButton type="submit">حفظ العرض</LuxuryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Price Discount Dialog */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsBulkOpen(false)} className="absolute top-6 left-6 text-muted-foreground hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold font-display mb-2">تخفيض بالجملة</h2>
            <p className="text-muted-foreground text-sm mb-6">طبّق نسبة خصم على جميع منتجات قسم معين دفعة واحدة. سيُحفظ السعر الأصلي تلقائياً.</p>
            <form onSubmit={handleBulkPrice} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">القسم</label>
                <LuxurySelect value={bulkForm.category} onChange={e => setBulkForm({...bulkForm, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </LuxurySelect>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">نسبة الخصم %</label>
                <LuxuryInput required type="number" min="1" max="90" value={bulkForm.discountPercent} onChange={e => setBulkForm({...bulkForm, discountPercent: e.target.value})} placeholder="مثال: 20 (يعني خصم 20%)" />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400">
                ⚠️ سيتم تعديل أسعار جميع منتجات هذا القسم. تأكد من النسبة قبل الحفظ.
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <LuxuryButton type="button" variant="ghost" onClick={() => setIsBulkOpen(false)}>إلغاء</LuxuryButton>
                <LuxuryButton type="submit" isLoading={bulkLoading}>تطبيق الخصم</LuxuryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
