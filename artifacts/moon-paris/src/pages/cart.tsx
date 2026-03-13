import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/use-store';
import { useGetMe, useCreateOrder } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { LuxuryButton } from '@/components/ui/luxury-components';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, User, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();
  const { data: user } = useGetMe({ query: { retry: false } });
  const createOrderMutation = useCreateOrder();

  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!user?.fullName || !user?.phone || !user?.governorate || !user?.district) {
      toast({ title: "معلومات ناقصة", description: "يرجى إكمال بيانات حسابك (الاسم، الهاتف، المحافظة، المنطقة) من صفحة الإعدادات", variant: "destructive" });
      return;
    }

    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.cartQuantity }));
      await createOrderMutation.mutateAsync({
        data: {
          items,
          guestName: user.fullName,
          guestPhone: user.phone,
          guestGovernorate: user.governorate,
          guestDistrict: user.district,
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
                  {/* معلومات التوصيل من الحساب */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-primary mb-3">معلومات التوصيل</h4>
                    <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <span>{user?.fullName || <span className="text-destructive">الاسم غير مكتمل</span>}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        <span dir="ltr">{user?.phone || <span className="text-destructive">الهاتف غير مكتمل</span>}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          {user?.governorate && user?.district
                            ? `${user.governorate} - ${user.district}`
                            : <span className="text-destructive">العنوان غير مكتمل</span>
                          }
                        </span>
                      </div>
                    </div>
                    {(!user?.phone || !user?.governorate || !user?.district) && (
                      <p className="text-xs text-destructive">يرجى إكمال بيانات حسابك من الإعدادات قبل الطلب</p>
                    )}
                  </div>

                  <textarea
                    placeholder="ملاحظات للطلب (اختياري)"
                    className="w-full h-20 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />

                  <LuxuryButton type="submit" className="w-full h-14 text-lg mt-2" isLoading={createOrderMutation.isPending}>
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
