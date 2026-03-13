import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginUser, useRegisterUser, useSendOtp, useVerifyOtp } from '@workspace/api-client-react';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { IRAQI_GOVERNORATES } from '@/lib/utils';
import { User, LogIn, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ViewState = 'options' | 'register' | 'login';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<ViewState>('options');
  
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  // Registration State
  const [regData, setRegData] = useState({
    fullName: '', phone: '', email: '', password: '', governorate: '', district: '', otpCode: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Login State
  const [loginData, setLoginData] = useState({ phone: '', email: '', password: '', otpCode: '' });
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  const handleSendOtpRegister = async () => {
    if (!regData.phone) return toast({ title: "خطأ", description: "يرجى إدخال رقم الهاتف", variant: "destructive" });
    try {
      await sendOtpMutation.mutateAsync({ data: { phone: regData.phone } });
      setOtpSent(true);
      toast({ title: "تم الإرسال", description: "تم إرسال كود التحقق إلى واتساب" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "فشل إرسال الكود", variant: "destructive" });
    }
  };

  const handleVerifyOtpRegister = async () => {
    try {
      await verifyOtpMutation.mutateAsync({ data: { phone: regData.phone, code: regData.otpCode } });
      setOtpVerified(true);
      toast({ title: "نجاح", description: "تم التحقق من الرقم بنجاح" });
    } catch (e: any) {
      toast({ title: "خطأ", description: "كود التحقق غير صحيح", variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return toast({ title: "تنبيه", description: "يجب التحقق من رقم الهاتف أولاً", variant: "destructive" });
    
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
    try {
      if (loginMethod === 'phone' && !loginOtpSent) {
        await sendOtpMutation.mutateAsync({ data: { phone: loginData.phone } });
        setLoginOtpSent(true);
        toast({ title: "تم الإرسال", description: "تم إرسال كود التحقق إلى واتساب" });
        return;
      }

      await loginMutation.mutateAsync({ data: loginData });
      toast({ title: "أهلاً بك", description: "تم تسجيل الدخول بنجاح" });
      setLocation('/');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "بيانات الدخول غير صحيحة", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      
      {/* Auth Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        
        <div className="w-full max-w-md w-full glass-panel p-8 md:p-10 rounded-3xl relative z-10">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW: OPTIONS */}
            {view === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-6">
                  <img
                    src={`${import.meta.env.BASE_URL}images/moon-paris-logo2-nobg.png`}
                    alt="Moon Paris"
                    className="w-40 h-40 mx-auto mb-4 object-contain drop-shadow-xl"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.35))' }}
                  />
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

            {/* VIEW: REGISTER */}
            {view === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={() => setView('options')} className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6 font-display">إنشاء حساب جديد</h2>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <LuxuryInput placeholder="الاسم الكامل" required value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <LuxuryInput 
                        placeholder="رقم الهاتف" 
                        type="tel" 
                        dir="auto" 
                        required 
                        disabled={otpVerified}
                        value={regData.phone} 
                        onChange={e => setRegData({...regData, phone: e.target.value})} 
                        className="text-right"
                      />
                      {!otpVerified && (
                        <LuxuryButton type="button" variant="secondary" onClick={handleSendOtpRegister} isLoading={sendOtpMutation.isPending} className="shrink-0 text-xs">
                          إرسال كود للواتساب
                        </LuxuryButton>
                      )}
                    </div>
                    {otpSent && !otpVerified && (
                      <div className="flex gap-2 animate-in slide-in-from-top-2">
                        <LuxuryInput placeholder="كود التحقق" required value={regData.otpCode} onChange={e => setRegData({...regData, otpCode: e.target.value})} />
                        <LuxuryButton type="button" variant="primary" onClick={handleVerifyOtpRegister} isLoading={verifyOtpMutation.isPending} className="shrink-0">
                          تحقق
                        </LuxuryButton>
                      </div>
                    )}
                    {otpVerified && <div className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> تم التحقق من الرقم</div>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <LuxurySelect required value={regData.governorate} onChange={e => setRegData({...regData, governorate: e.target.value})}>
                      <option value="" disabled>المحافظة</option>
                      {IRAQI_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </LuxurySelect>
                    <LuxuryInput placeholder="المنطقة" required value={regData.district} onChange={e => setRegData({...regData, district: e.target.value})} />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-3 text-center">أدخل البريد الإلكتروني وكلمة المرور لتأمين حسابك</p>
                    <div className="space-y-3">
                      <LuxuryInput 
                        placeholder="البريد الإلكتروني (اختياري)" 
                        type="email" 
                        dir="ltr"
                        value={regData.email} 
                        onChange={e => setRegData({...regData, email: e.target.value})} 
                      />
                      <LuxuryInput 
                        placeholder="كلمة المرور (اختياري)" 
                        type="password" 
                        dir="ltr"
                        value={regData.password} 
                        onChange={e => setRegData({...regData, password: e.target.value})} 
                      />
                    </div>
                  </div>

                  <LuxuryButton type="submit" variant="primary" className="w-full mt-6" isLoading={registerMutation.isPending}>
                    تسجيل الحساب
                  </LuxuryButton>
                </form>
              </motion.div>
            )}

            {/* VIEW: LOGIN */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={() => setView('options')} className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 text-sm transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> رجوع
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6 font-display">تسجيل الدخول</h2>

                <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
                  <button 
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground'}`}
                  >
                    رقم الهاتف
                  </button>
                  <button 
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground'}`}
                  >
                    البريد الإلكتروني
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  
                  {loginMethod === 'phone' ? (
                    <>
                      <LuxuryInput 
                        placeholder="رقم الهاتف" 
                        type="tel" 
                        dir="auto" 
                        required 
                        disabled={loginOtpSent}
                        value={loginData.phone} 
                        onChange={e => setLoginData({...loginData, phone: e.target.value})} 
                        className="text-right"
                      />
                      {loginOtpSent && (
                        <LuxuryInput 
                          placeholder="كود التحقق (من واتساب)" 
                          required 
                          value={loginData.otpCode} 
                          onChange={e => setLoginData({...loginData, otpCode: e.target.value})} 
                          className="animate-in slide-in-from-top-2"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <LuxuryInput 
                        placeholder="البريد الإلكتروني" 
                        type="email" 
                        dir="ltr" 
                        required 
                        value={loginData.email} 
                        onChange={e => setLoginData({...loginData, email: e.target.value})} 
                      />
                      <LuxuryInput 
                        placeholder="كلمة المرور" 
                        type="password" 
                        dir="ltr" 
                        required 
                        value={loginData.password} 
                        onChange={e => setLoginData({...loginData, password: e.target.value})} 
                      />
                    </>
                  )}

                  <LuxuryButton type="submit" variant="primary" className="w-full mt-6" isLoading={loginMutation.isPending || sendOtpMutation.isPending}>
                    {(loginMethod === 'phone' && !loginOtpSent) ? 'إرسال كود التحقق' : 'دخول'}
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
