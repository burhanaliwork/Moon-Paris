import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';

import { Plus, Edit, Trash2, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

interface Brand { id: number; name: string; }

type ImageStatus = 'idle' | 'loading' | 'valid' | 'invalid';

interface SampleProduct {
  id: number;
  nameAr: string;
  name: string;
  descriptionAr?: string;
  description?: string;
  imageUrl?: string;
  brand?: string;
  price3ml?: number | null;
  price5ml?: number | null;
  price10ml?: number | null;
  inStock: boolean;
}

function ImageUrlInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [status, setStatus] = useState<ImageStatus>('idle');
  useEffect(() => {
    if (!value) { setStatus('idle'); return; }
    setStatus('loading');
    const img = new Image();
    const timeout = setTimeout(() => setStatus('invalid'), 5000);
    img.onload = () => { clearTimeout(timeout); setStatus('valid'); };
    img.onerror = () => { clearTimeout(timeout); setStatus('invalid'); };
    img.src = value;
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <LuxuryInput value={value} onChange={e => onChange(e.target.value)} dir="ltr" placeholder="https://..."
          className={`pe-10 ${status === 'valid' ? 'border-green-500' : status === 'invalid' ? 'border-red-500' : ''}`} />
        <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
          {status === 'loading' && <Loader className="w-4 h-4 text-muted-foreground animate-spin" />}
          {status === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === 'invalid' && value && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      {status === 'invalid' && value && <p className="text-xs text-red-400">رابط الصورة غير صالح</p>}
      {status === 'valid' && (
        <div className="rounded-xl overflow-hidden border border-green-500/30 bg-background/50 p-2 flex items-center justify-center">
          <img src={value} alt="preview" className="max-h-32 object-contain" />
        </div>
      )}
    </div>
  );
}

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api/samples${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'خطأ في الخادم');
  return res.json();
}

const emptyForm = { name: '', nameAr: '', description: '', descriptionAr: '', imageUrl: '', brand: '', price3ml: '', price5ml: '', price10ml: '', inStock: true };

export default function AdminSamples() {
  const [samples, setSamples] = useState<SampleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`, { credentials: 'include' })
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const loadSamples = async () => {
    try {
      const data = await apiFetch('/');
      setSamples(data);
    } catch (e) {
      toast({ title: "خطأ في تحميل البيانات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSamples(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (s: SampleProduct) => {
    setEditingId(s.id);
    setFormData({
      name: s.name, nameAr: s.nameAr,
      description: s.description || '', descriptionAr: s.descriptionAr || '',
      imageUrl: s.imageUrl || '', brand: s.brand || '',
      price3ml: s.price3ml?.toString() || '',
      price5ml: s.price5ml?.toString() || '',
      price10ml: s.price10ml?.toString() || '',
      inStock: s.inStock,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه التقسيمة؟')) return;
    try {
      await apiFetch(`/${id}`, { method: 'DELETE' });
      setSamples(prev => prev.filter(s => s.id !== id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        price3ml: formData.price3ml ? Number(formData.price3ml) : null,
        price5ml: formData.price5ml ? Number(formData.price5ml) : null,
        price10ml: formData.price10ml ? Number(formData.price10ml) : null,
      };
      if (editingId) {
        const updated = await apiFetch(`/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        setSamples(prev => prev.map(s => s.id === editingId ? updated : s));
        toast({ title: "تم التحديث بنجاح" });
      } else {
        const created = await apiFetch('/', { method: 'POST', body: JSON.stringify(payload) });
        setSamples(prev => [...prev, created]);
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsDialogOpen(false);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const f = formData;
  const set = (k: string, v: any) => setFormData(prev => ({ ...prev, [k]: v }));

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">تقسيمات العطور</h1>
          <p className="text-muted-foreground">إدارة عطور التقسيمات (3مل - 5مل - 10مل)</p>
        </div>
        <LuxuryButton onClick={openCreate} className="gap-2"><Plus className="w-5 h-5"/> إضافة تقسيمة</LuxuryButton>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-white/5 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">صورة</th>
                <th className="px-6 py-4">العطر</th>
                <th className="px-6 py-4">3 مل</th>
                <th className="px-6 py-4">5 مل</th>
                <th className="px-6 py-4">10 مل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {samples.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-background border border-white/5 overflow-hidden flex items-center justify-center p-1">
                      {s.imageUrl ? <img src={s.imageUrl} alt={s.nameAr} className="w-full h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{s.nameAr}</div>
                    <div className="text-xs text-muted-foreground">{s.brand}</div>
                  </td>
                  <td className="px-6 py-4 text-primary font-bold">{s.price3ml ? formatPrice(s.price3ml) : <span className="text-muted-foreground">-</span>}</td>
                  <td className="px-6 py-4 text-primary font-bold">{s.price5ml ? formatPrice(s.price5ml) : <span className="text-muted-foreground">-</span>}</td>
                  <td className="px-6 py-4 text-primary font-bold">{s.price10ml ? formatPrice(s.price10ml) : <span className="text-muted-foreground">-</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${s.inStock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {s.inStock ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-destructive hover:bg-destructive hover:text-white transition-colors bg-destructive/10 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {samples.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">لا توجد تقسيمات مضافة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsDialogOpen(false)} className="absolute top-6 left-6 text-muted-foreground hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold font-display mb-6">{editingId ? 'تعديل التقسيمة' : 'إضافة تقسيمة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الاسم (عربي) *</label>
                  <LuxuryInput required value={f.nameAr} onChange={e => set('nameAr', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">الاسم (انجليزي) *</label>
                  <LuxuryInput required value={f.name} onChange={e => set('name', e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">اسم الشركة</label>
                  <LuxurySelect value={f.brand} onChange={e => set('brand', e.target.value)}>
                    <option value="">-- اختر الشركة --</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </LuxurySelect>
                  {brands.length === 0 && <p className="text-xs text-amber-400 mt-1">لا توجد شركات — أضف من قسم الشركات أولاً</p>}
                </div>
              </div>

              {/* Prices */}
              <div>
                <h3 className="text-sm font-bold text-primary mb-3 border-b border-white/10 pb-2">أسعار الأحجام (دينار عراقي)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">3 مل</label>
                    <LuxuryInput type="number" min="0" placeholder="0" value={f.price3ml} onChange={e => set('price3ml', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">5 مل</label>
                    <LuxuryInput type="number" min="0" placeholder="0" value={f.price5ml} onChange={e => set('price5ml', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">10 مل</label>
                    <LuxuryInput type="number" min="0" placeholder="0" value={f.price10ml} onChange={e => set('price10ml', e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">رابط الصورة (URL)</label>
                <ImageUrlInput value={f.imageUrl} onChange={val => set('imageUrl', val)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">وصف العطر (عربي)</label>
                <textarea className="w-full h-20 rounded-xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={f.descriptionAr} onChange={e => set('descriptionAr', e.target.value)} />
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={f.inStock} onChange={e => set('inStock', e.target.checked)} className="w-5 h-5 accent-primary bg-background border-border rounded" />
                  <span>متوفر</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <LuxuryButton type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>إلغاء</LuxuryButton>
                <LuxuryButton type="submit" isLoading={isSaving}>حفظ</LuxuryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
