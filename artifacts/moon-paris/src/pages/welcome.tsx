import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useLoginUser } from '@workspace/api-client-react';
import { LuxuryButton, LuxuryInput } from '@/components/ui/luxury-components';
import { ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const loginMutation = useLoginUser();

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ data: loginData });
      const role = (result as any)?.user?.role ?? (result as any)?.role;
      if (role !== 'admin') {
        toast({ title: "غير مصرح", description: "هذه الصفحة للإدارة فقط", variant: "destructive" });
        return;
      }
      toast({ title: "أهلاً بك", description: "تم تسجيل الدخول بنجاح" });
      setLocation('/admin');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "بيانات الدخول غير صحيحة", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <img
            src={`${import.meta.env.BASE_URL}images/moon-paris-logo2-nobg.png`}
            alt="Moon Paris"
            className="w-24 h-24 mx-auto mb-4 object-contain"
            style={{ filter: 'drop-shadow(0 0 16px rgba(201,168,76,0.3))' }}
          />
          <h2 className="text-2xl font-bold text-foreground font-display">تسجيل دخول الإدارة</h2>
          <p className="text-muted-foreground text-sm mt-1">للدخول إلى لوحة التحكم فقط</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">البريد الإلكتروني</label>
            <LuxuryInput
              placeholder="admin@example.com"
              type="email"
              dir="ltr"
              required
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">كلمة المرور</label>
            <LuxuryInput
              placeholder="••••••••"
              type="password"
              dir="ltr"
              required
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>

          <LuxuryButton type="submit" variant="primary" className="w-full mt-6 h-12" isLoading={loginMutation.isPending}>
            دخول
          </LuxuryButton>
        </form>
      </motion.div>
    </div>
  );
}
