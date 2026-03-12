import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/use-store';
import { useGetMe, useCreateOrder } from '@workspace/api-client-react';
import { formatPrice, IRAQI_GOVERNORATES } from '@/lib/utils';
import { LuxuryButton, LuxuryInput, LuxurySelect } from '@/components/ui/luxury-components';
import { Link, useLocation } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();
  const { data: user, isLoading: isAuthLoading } = useGetMe({ query: { retry: false } });
  const createOrderMutation = useCreateOrder();
  const [, setLocation] = useLocation();

  const [checkoutData, setCheckoutData] = useState({
    guestName: '', guestPhone: '', guestGovernorate: '', guestDistrict: '', notes: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Pre-fill if logged in
    if (user && !isAuthLoading) {
      setCheckoutData(prev => ({
        ...prev,
        guestName: user.fullName || '',
        guestPhone: user.phone || '',
        guestGovernorate: user.governorate || '',
        guestDistrict: user.district || ''
      }));
    }
  }, [user, isAuthLoading]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.cartQuantity }));
      await createOrderMutation.mutateAsync({
        data: {
          items,
          guestName: checkoutData.guestName,
          guestPhone: checkoutData.guestPhone,
          guestGovernorate: checkoutData.guestGovernorate,
          guestDistrict: checkoutData.guestDistrict,
          notes: checkoutData.notes
        }
      });
      setIsSuccess(true);
      clearCart();
      window.scrollTo(0,0);
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
            <p className="text-muted-foreground mb-8 text-lg">شكراً لتسوقك من مون باريس. سنتواصل معك قريباً لتأكيد التوصيل.</p>
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
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-white/5 relative group">
                  <div className="w-24 h-24 bg-background rounded-xl p-2 shrink-0 border border-white/5">
                    <img 
                      src={item.imageUrl || item.images?.[0] || `${import.meta.env.BASE_URL}images/perfume-placeholder.png`} 
                      alt={item.nameAr} 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150&h=150&fit=crop"; }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start pe-6">
                      <div>
                        <div className="text-xs text-primary mb-1">{item.brand}</div>
                        <h3 className="font-bold text-lg leading-tight">{item.nameAr}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-4 left-4 text-muted-foreground hover:text-destructive transition-colors p-2 bg-background/50 rounded-full opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold gold-gradient-text">{formatPrice(item.price)}</span>
                      <div className="flex items-center bg-background border border-border rounded-lg px-2 h-9">
                        <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} className="text-muted-foreground hover:text-primary px-2"><Minus size={14} /></button>
                        <span className="text-sm font-bold w-8 text-center">{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} className="text-muted-foreground hover:text-primary px-2"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl sticky top-24">
                <h3 className="text-xl font-bold mb-6 font-display border-b border-border pb-4">ملخص وتأكيد الطلب</h3>
                
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

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-primary mb-2">معلومات التوصيل</h4>
                    <LuxuryInput required placeholder="الاسم الكامل" value={checkoutData.guestName} onChange={e => setCheckoutData({...checkoutData, guestName: e.target.value})} />
                    <LuxuryInput required placeholder="رقم الهاتف" type="tel" dir="ltr" className="text-right" value={checkoutData.guestPhone} onChange={e => setCheckoutData({...checkoutData, guestPhone: e.target.value})} />
                    <LuxurySelect required value={checkoutData.guestGovernorate} onChange={e => setCheckoutData({...checkoutData, guestGovernorate: e.target.value})}>
                      <option value="" disabled>اختر المحافظة</option>
                      {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                    </LuxurySelect>
                    <LuxuryInput required placeholder="المنطقة / أقرب نقطة دالة" value={checkoutData.guestDistrict} onChange={e => setCheckoutData({...checkoutData, guestDistrict: e.target.value})} />
                    <textarea 
                      placeholder="ملاحظات للطلب (اختياري)"
                      className="w-full h-24 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      value={checkoutData.notes}
                      onChange={e => setCheckoutData({...checkoutData, notes: e.target.value})}
                    />
                  </div>
                  
                  <LuxuryButton type="submit" className="w-full h-14 text-lg mt-6" isLoading={createOrderMutation.isPending}>
                    تأكيد الطلب <ArrowRight className="ms-2 w-5 h-5 rotate-180" />
                  </LuxuryButton>
                </form>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
