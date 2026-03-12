import React from 'react';
import { Link } from 'wouter';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
               <img src={`${import.meta.env.BASE_URL}images/logo-gold.png`} alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
               <span className="font-display text-2xl font-bold gold-gradient-text">مون باريس</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              نقدم لكم أرقى العطور المستوحاة من سحر باريس، مصممة خصيصاً لتناسب الذوق العراقي الرفيع.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"><Facebook size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-foreground">روابط سريعة</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">عطورنا</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">عربة التسوق</Link></li>
              <li><Link href="/welcome" className="hover:text-primary transition-colors">حسابي</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-foreground">الخدمات</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">سياسة الشحن</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">سياسة الاسترجاع</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-foreground">تواصل معنا</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>العراق - بغداد - المنصور</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span dir="ltr">+964 770 000 0000</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} مون باريس للعطور. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-muted-foreground">صنع بحب في Replit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
