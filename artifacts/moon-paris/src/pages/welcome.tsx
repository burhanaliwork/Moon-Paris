import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginUser, useRegisterUser } from '@workspace/api-client-react';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { IRAQI_GOVERNORATES } from '@/lib/utils';
import { User, LogIn, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ViewState = 'options' | 'register' | 'login';

const IRAQI_PHONE_REGEX = /^07[3-9]\d{8}$/;

function validateIraqiPhone(phone: string): boolean {
  return IRAQI_PHONE_REGEX.test(phone);
}

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<ViewState>('options');
  
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const [regData, setRegData] = useState({
    fullName: '', phone: '', email: '', password: '', governorate: '', district: ''
  });
  const [regPhoneError, setRegPhoneError] = useState('');

  const [loginData, setLoginData] = useState({ phone: '', email: '', password: '' });
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginPhoneError, setLoginPhoneError] = useState('');

  const handleRegPhoneChange = (val: string) => {
    setRegData({ ...regData, phone: val });
    if (val && !validateIraqiPhone(val)) {
      setRegPhoneError('رقم الهاتف يجب أن يكون عراقياً صحيحاً (11 رقم يبدأ بـ 07)');
    } else {
      setRegPhoneError('');
    }
  };

  const handleLoginPhoneChange = (val: string) => {
    setLoginData({ ...loginData, phone: val });
    if (val && !validateIraqiPhone(val)) {
      setLoginPhoneError('رقم الهاتف يجب أن يكون عراقياً صحيحاً (11 رقم يبدأ بـ 07)');
    } else {
      setLoginPhoneError('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIraqiPhone(regData.phone)) {
      return toast({ title: "خطأ", description: "يرجى إدخال رقم هاتف عراقي صحيح (11 رقم يبدأ بـ 07)", variant: "destructive" });
    }
    try {
      await registerMutation.mutateAsync({ data: regData });
      toast({ title: "أهلاً بك", description: "تم إنشاء حسابك بنجاح" });
      setLocation('/');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "فشل إنشاء الحساب", variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'phone' && !validateIraqiPhone(loginData.phone)) {
      return toast({ title: "خطأ", description: "يرجى إدخال رقم هاتف عراقي صحيح", variant: "destructive" });
    }
    try {
      await loginMutation.mutateAsync({ data: loginData });
      toast({ title: "أهلاً بك", description: "تم تسجيل الدخول بنجاح" });
      setLocation('/');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "بيانات الدخول غير صحيحة", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl relative z-10">
          
          <AnimatePresence mode="wait">

            {/* OPTIONS */}
            {view === 'options' && (
              <motion.div key="options" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                <div className="text-center mb-6">
                  <img src={`${import.meta.env.BASE_URL}images/moon-paris-logo2-nobg.png`} alt="Moon Paris" className="w-40 h-40 mx-auto mb-4 object-contain drop-shadow-xl" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.35))' }} />
                  <h2 className="text-2xl font-bold text-foreground mb-2 font-display">مرحباً بك في Moon Paris</h2>
                  <p className="text-muted-foreground text-sm">اختر طريقة الدخول للمتجر</p>
                </div>
                <LuxuryButton variant="primary" size="lg" className="w-full flex justify-between group" onClick={() => setView('login')}>
                  <span className="flex items-center gap-3"><LogIn className="w-5 h-5" /> تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </LuxuryButton>
                <LuxuryButton variant="outline" size="lg" className="w-full flex justify-between group bg-background/50" onClick={() => setView('register')}>
                  <span className="flex items-center gap-3"><User className="w-5 h-5" /> إنشاء حساب جديد</span>
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </LuxuryButton>
              </motion.div>
            )}

            {/* REGISTER */}
            {view === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setView('options')} className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-5 font-display">إنشاء حساب جديد</h2>

                <form onSubmit={handleRegister} className="space-y-4">
                  <LuxuryInput placeholder="الاسم الكامل" required value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} />

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm text-muted-foreground">رقم الهاتف</span>
                      <span className="text-xs text-red-400 font-medium">(إجباري)</span>
                    </div>
                    <LuxuryInput
                      placeholder="07XXXXXXXXX"
                      type="tel"
                      dir="ltr"
                      required
                      maxLength={11}
                      value={regData.phone}
                      onChange={e => handleRegPhoneChange(e.target.value.replace(/\D/g, ''))}
                      className="text-left"
                    />
                    {regPhoneError && <p className="text-xs text-red-400 mt-1">{regPhoneError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <LuxurySelect required value={regData.governorate} onChange={e => setRegData({...regData, governorate: e.target.value})}>
                      <option value="" disabled>المحافظة</option>
                      {IRAQI_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </LuxurySelect>
                    <LuxuryInput placeholder="المنطقة" required value={regData.district} onChange={e => setRegData({...regData, district: e.target.value})} />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-3">
                    <p className="text-xs text-muted-foreground text-center">البريد الإلكتروني وكلمة المرور (اختياري)</p>
                    <LuxuryInput placeholder="البريد الإلكتروني" type="email" dir="ltr" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                    <LuxuryInput placeholder="كلمة المرور" type="password" dir="ltr" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                  </div>

                  <LuxuryButton type="submit" variant="primary" className="w-full mt-2" isLoading={registerMutation.isPending}>
                    تسجيل الحساب
                  </LuxuryButton>
                </form>
              </motion.div>
            )}

            {/* LOGIN */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setView('options')} className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6 font-display">تسجيل الدخول</h2>

                <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
                  <button onClick={() => setLoginMethod('phone')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground'}`}>رقم الهاتف</button>
                  <button onClick={() => setLoginMethod('email')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground'}`}>البريد الإلكتروني</button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {loginMethod === 'phone' ? (
                    <div className="space-y-1">
                      <LuxuryInput
                        placeholder="07XXXXXXXXX"
                        type="tel"
                        dir="ltr"
                        required
                        maxLength={11}
                        value={loginData.phone}
                        onChange={e => handleLoginPhoneChange(e.target.value.replace(/\D/g, ''))}
                        className="text-left"
                      />
                      {loginPhoneError && <p className="text-xs text-red-400 mt-1">{loginPhoneError}</p>}
                    </div>
                  ) : (
                    <>
                      <LuxuryInput placeholder="البريد الإلكتروني" type="email" dir="ltr" required value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
                      <LuxuryInput placeholder="كلمة المرور" type="password" dir="ltr" required value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                    </>
                  )}

                  <LuxuryButton type="submit" variant="primary" className="w-full mt-6" isLoading={loginMutation.isPending}>
                    دخول
                  </LuxuryButton>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
