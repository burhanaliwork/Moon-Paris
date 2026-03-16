import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/use-store';
import { useCreateOrder } from '@workspace/api-client-react';
import { formatPrice, IRAQI_GOVERNORATES } from '@/lib/utils';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, User, Phone, MapPin, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const IRAQI_PHONE_REGEX = /^07[3-9]\d{8}$/;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();
  const createOrderMutation = useCreateOrder();

  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [guestInfo, setGuestInfo] = useState({ fullName: '', phone: '', governorate: '', district: '' });
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setGuestInfo({ ...guestInfo, phone: cleaned });
    if (cleaned && !IRAQI_PHONE_REGEX.test(cleaned)) {
      setPhoneError('رقم الهاتف يجب أن يكون عراقياً صحيحاً (07XXXXXXXXX)');
    } else {
      setPhoneError('');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!IRAQI_PHONE_REGEX.test(guestInfo.phone)) {
      setPhoneError('يرجى إدخال رقم هاتف عراقي صحيح (07XXXXXXXXX)');
      return;
    }
    try {
      const items = cart.map(item => 
        item.type === 'sample'
          ? { sampleProductId: item.sampleProductId, size: item.size, quantity: item.cartQuantity }
          : { productId: item.productId, quantity: item.cartQuantity }
      );
      await createOrderMutation.mutateAsync({
        data: {
          items: items as any,
          guestName: guestInfo.fullName,
          guestPhone: guestInfo.phone,
          guestGovernorate: guestInfo.governorate,
          guestDistrict: guestInfo.district,
          notes
        }
      });
      setIsSuccess(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء إتمام الطلب", variant: "destructive" });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center p-10 glass-panel rounded-3xl">
            <CheckCircle className="w-24 h-24 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-display font-bold mb-4">تم تأكيد الطلب!</h1>
            <p className="text-muted-foreground mb-8 text-lg">شكراً لتسوقك من Moon Paris. سنتواصل معك قريباً لتأكيد التوصيل.</p>
            <Link href="/"><LuxuryButton className="w-full">العودة للرئيسية</LuxuryButton></Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 pt-32 pb-24">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-10 flex items-center gap-4">
          <ShoppingBag className="text-primary w-8 h-8" /> عربة التسوق
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-white/10">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">عربة التسوق فارغة</h2>
            <p className="text-muted-foreground mb-8">لم تقم بإضافة أي عطور بعد.</p>
            <Link href="/"><LuxuryButton>تصفح المتجر</LuxuryButton></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 p-4 bg-card rounded-2xl border border-white/5 relative group">
                  <div className="w-20 h-20 bg-background rounded-xl p-2 shrink-0 border border-white/5 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} alt={item.nameAr} 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150&h=150&fit=crop"; }}
                      />
                    ) : (
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start pe-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-primary font-medium">{item.brand}</span>
                          {item.type === 'sample' && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">تقسيمة</span>
                          )}
                        </div>
                        <h3 className="font-bold text-base leading-tight">{item.nameAr}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="absolute top-4 left-4 text-muted-foreground hover:text-destructive transition-colors p-2 bg-background/50 rounded-full opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold gold-gradient-text">{formatPrice(item.price)}</span>
                      <div className="flex items-center bg-background border border-border rounded-lg px-2 h-9">
                        <button onClick={() => updateQuantity(item.cartId, item.cartQuantity - 1)} className="text-muted-foreground hover:text-primary px-2"><Minus size={14} /></button>
                        <span className="text-sm font-bold w-8 text-center">{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.cartQuantity + 1)} className="text-muted-foreground hover:text-primary px-2"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl sticky top-24">
                <h3 className="text-xl font-bold mb-6 font-display border-b border-border pb-4">ملخص الطلب</h3>
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold">{formatPrice(cartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التوصيل</span>
                    <span className="text-primary font-bold">يحدد لاحقاً</span>
                  </div>
                  <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold gold-gradient-text">{formatPrice(cartTotal())}</span>
                  </div>
                </div>

                {!showCheckoutForm ? (
                  <LuxuryButton className="w-full h-14 text-lg" onClick={() => setShowCheckoutForm(true)}>
                    إتمام الطلب <ArrowRight className="ms-2 w-5 h-5 rotate-180" />
                  </LuxuryButton>
                ) : (
                  <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCheckout} className="space-y-4">
                    <h4 className="font-bold text-sm text-primary border-b border-border pb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> معلومات التوصيل
                    </h4>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> الاسم الكامل</label>
                      <LuxuryInput placeholder="أدخل اسمك الكامل" required value={guestInfo.fullName} onChange={e => setGuestInfo({ ...guestInfo, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> رقم الهاتف</label>
                      <LuxuryInput placeholder="07XXXXXXXXX" type="tel" dir="ltr" required maxLength={11} value={guestInfo.phone} onChange={e => handlePhoneChange(e.target.value)} className={`text-left ${phoneError ? 'border-red-500' : ''}`} />
                      {phoneError && <p className="text-xs text-red-400">{phoneError}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">المحافظة</label>
                      <LuxurySelect required value={guestInfo.governorate} onChange={e => setGuestInfo({ ...guestInfo, governorate: e.target.value })}>
                        <option value="" disabled>اختر المحافظة</option>
                        {IRAQI_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                      </LuxurySelect>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">المدينة أو القضاء</label>
                      <LuxuryInput placeholder="اكتب اسم المدينة أو القضاء" required value={guestInfo.district} onChange={e => setGuestInfo({ ...guestInfo, district: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">ملاحظة خاصة بتسليم الطلب</label>
                      <textarea placeholder="مثال: التوصيل بعد الساعة 5 مساءً، أو أي تفاصيل مساعدة للتوصيل..." className="w-full h-20 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    <LuxuryButton type="submit" className="w-full h-12 text-base" isLoading={createOrderMutation.isPending}>
                      تأكيد الطلب <ArrowRight className="ms-2 w-4 h-4 rotate-180" />
                    </LuxuryButton>
                    <button type="button" onClick={() => setShowCheckoutForm(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1">رجوع</button>
                  </motion.form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
