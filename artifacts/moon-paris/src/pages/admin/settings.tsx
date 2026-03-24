import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetSiteSettings, useUpdateSiteSettings } from '@workspace/api-client-react';
import { LuxuryButton, LuxuryInput } from '@/components/ui/luxury-components';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle } from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateMutation = useUpdateSiteSettings({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] }) } });

  const [formData, setFormData] = useState({
    siteName: '', heroTitle: '', heroSubtitle: '', heroImageUrl: '',
    contactPhone: '', contactEmail: '', aboutText: '',
    infoSectionTitle: '', stat1Value: '', stat1Label: '', stat2Value: '', stat2Label: '',
    infoImageUrl: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroImageUrl: settings.heroImageUrl || '',
        contactPhone: settings.contactPhone || '',
        contactEmail: settings.contactEmail || '',
        aboutText: settings.aboutText || '',
        infoSectionTitle: settings.infoSectionTitle || '',
        stat1Value: settings.stat1Value || '',
        stat1Label: settings.stat1Label || '',
        stat2Value: settings.stat2Value || '',
        stat2Label: settings.stat2Label || '',
        infoImageUrl: (settings as any).infoImageUrl || '',
      });
    }
  }, [settings]);

  // Change password state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ data: formData });
      toast({ title: "تم تحديث الإعدادات بنجاح" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة وتأكيدها غير متطابقتين", variant: "destructive" });
      return;
    }
    if (pwData.newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pwData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'حدث خطأ');
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  if (isLoading) return <AdminLayout><div className="text-primary">جاري التحميل...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">إعدادات الموقع</h1>
        <p className="text-muted-foreground">تخصيص نصوص وصور الواجهة الرئيسية ومعلومات التواصل</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-white/5 rounded-2xl p-8 max-w-3xl space-y-8">
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold font-display text-primary border-b border-white/5 pb-2">المعلومات الأساسية</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">اسم الموقع</label>
            <LuxuryInput required value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold font-display text-primary border-b border-white/5 pb-2">الواجهة الرئيسية (Hero)</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">العنوان الرئيسي</label>
            <LuxuryInput required value={formData.heroTitle} onChange={e => setFormData({...formData, heroTitle: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">النص الفرعي</label>
            <textarea className="w-full h-24 rounded-xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none" required value={formData.heroSubtitle} onChange={e => setFormData({...formData, heroSubtitle: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">صورة الخلفية الرئيسية</label>
            <ImageUploadInput value={formData.heroImageUrl} onChange={val => setFormData({...formData, heroImageUrl: val})} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold font-display text-primary border-b border-white/5 pb-2">قسم المعلومات (أسفل المنتجات)</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">عنوان القسم</label>
            <LuxuryInput value={formData.infoSectionTitle} onChange={e => setFormData({...formData, infoSectionTitle: e.target.value})} placeholder="الجودة الأصيلة، مباشرة من باريس" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">صورة العطر في الدائرة</label>
            <p className="text-xs text-muted-foreground/60 mb-3">ارفع صورة العطر التي تريد عرضها في القسم الدائري — ستُزال الخلفية تلقائياً</p>
            <ImageUploadInput value={formData.infoImageUrl} onChange={val => setFormData({...formData, infoImageUrl: val})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">الإحصاء 1 - العنوان</label>
              <LuxuryInput value={formData.stat1Value} onChange={e => setFormData({...formData, stat1Value: e.target.value})} placeholder="عطور أصلية" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">الإحصاء 1 - النص الفرعي</label>
              <LuxuryInput value={formData.stat1Label} onChange={e => setFormData({...formData, stat1Label: e.target.value})} placeholder="100%" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">الإحصاء 2 - العنوان</label>
              <LuxuryInput value={formData.stat2Value} onChange={e => setFormData({...formData, stat2Value: e.target.value})} placeholder="توصيل سريع" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">الإحصاء 2 - النص الفرعي</label>
              <LuxuryInput value={formData.stat2Label} onChange={e => setFormData({...formData, stat2Label: e.target.value})} placeholder="لكافة محافظات العراق" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold font-display text-primary border-b border-white/5 pb-2">معلومات التواصل وعن المتجر</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">رقم الهاتف</label>
              <LuxuryInput value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} dir="ltr" className="text-right" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">البريد الإلكتروني</label>
              <LuxuryInput value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} dir="ltr" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">نص "من نحن" (أسفل الصفحة)</label>
            <textarea className="w-full h-32 rounded-xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none" value={formData.aboutText} onChange={e => setFormData({...formData, aboutText: e.target.value})} />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <LuxuryButton type="submit" size="lg" isLoading={updateMutation.isPending}>حفظ التغييرات</LuxuryButton>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="mt-8 bg-card border border-white/5 rounded-2xl p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">تغيير كلمة المرور</h2>
            <p className="text-sm text-muted-foreground">يجب إدخال كلمة المرور الحالية للتأكيد</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Current password */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">كلمة المرور الحالية</label>
            <div className="relative">
              <input
                type={pwShow.current ? 'text' : 'password'}
                required
                value={pwData.currentPassword}
                onChange={e => setPwData({ ...pwData, currentPassword: e.target.value })}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="أدخل كلمة المرور الحالية"
                dir="ltr"
              />
              <button type="button" tabIndex={-1} onClick={() => setPwShow(s => ({ ...s, current: !s.current }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                {pwShow.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={pwShow.newPw ? 'text' : 'password'}
                required
                value={pwData.newPassword}
                onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="6 أحرف على الأقل"
                dir="ltr"
              />
              <button type="button" tabIndex={-1} onClick={() => setPwShow(s => ({ ...s, newPw: !s.newPw }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                {pwShow.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={pwShow.confirm ? 'text' : 'password'}
                required
                value={pwData.confirmPassword}
                onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })}
                className={`w-full rounded-xl border bg-background/50 px-4 py-3 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : pwData.confirmPassword && pwData.newPassword === pwData.confirmPassword
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                    : 'border-border focus:border-primary'
                }`}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                dir="ltr"
              />
              <button type="button" tabIndex={-1} onClick={() => setPwShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                {pwShow.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {pwData.confirmPassword && (
                <div className="absolute left-9 top-1/2 -translate-y-1/2">
                  {pwData.newPassword === pwData.confirmPassword
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-red-500" />}
                </div>
              )}
            </div>
            {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> كلمتا المرور غير متطابقتين
              </p>
            )}
            {pwData.confirmPassword && pwData.newPassword === pwData.confirmPassword && (
              <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> كلمتا المرور متطابقتان
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <LuxuryButton type="submit" size="lg" isLoading={pwLoading}>تغيير كلمة المرور</LuxuryButton>
        </div>
      </form>
    </AdminLayout>
  );
}
