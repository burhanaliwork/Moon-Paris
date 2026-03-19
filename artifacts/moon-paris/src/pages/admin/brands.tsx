import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LuxuryButton, LuxuryInput } from '@/components/ui/luxury-components';
import { Plus, Trash2, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface Brand { id: number; name: string; }

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBrand, setNewBrand] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/api/brands`, { credentials: 'include' });
      const data = await r.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    setAdding(true);
    try {
      const r = await fetch(`${BASE_URL}/api/brands`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrand.trim() }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.message || 'فشل الإضافة');
      }
      setNewBrand('');
      toast({ title: 'تم الإضافة', description: `تم إضافة شركة "${newBrand.trim()}"` });
      await fetchBrands();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally { setAdding(false); }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`هل تريد حذف "${brand.name}"؟`)) return;
    setDeletingId(brand.id);
    try {
      await fetch(`${BASE_URL}/api/brands/${brand.id}`, { method: 'DELETE', credentials: 'include' });
      toast({ title: 'تم الحذف', description: `تم حذف شركة "${brand.name}"` });
      await fetchBrands();
    } catch {
      toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    } finally { setDeletingId(null); }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">إدارة الشركات</h1>
          <p className="text-muted-foreground text-sm mt-1">أضف أو احذف شركات العطور التي تظهر في فلتر الموقع</p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <LuxuryInput
            placeholder="اسم الشركة (مثال: Dior)"
            value={newBrand}
            onChange={e => setNewBrand(e.target.value)}
            className="flex-1"
          />
          <LuxuryButton type="submit" isLoading={adding} className="flex items-center gap-2 px-6">
            <Plus className="w-4 h-4" /> إضافة
          </LuxuryButton>
        </form>

        {/* Brands List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-14 bg-card rounded-xl border border-white/5"></div>)}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>لا توجد شركات مضافة بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {brands.map(brand => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between px-5 py-4 bg-card rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{brand.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(brand)}
                    disabled={deletingId === brand.id}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          إجمالي الشركات: <span className="text-primary font-bold">{brands.length}</span>
        </p>
      </div>
    </AdminLayout>
  );
}
