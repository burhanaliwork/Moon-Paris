import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useGetProducts, useGetSiteSettings } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { LuxuryButton } from '@/components/ui/luxury-components';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/use-store';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const { data: settings } = useGetSiteSettings();
  const { data: products = [], isLoading } = useGetProducts();
  const addToCart = useStore(state => state.addToCart);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const latestProducts = products.slice(0, 8);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); // prevent navigation
    addToCart(product, 1);
    toast({ title: "تم الإضافة بنجاح", description: `تم إضافة ${product.nameAr} إلى عربة التسوق` });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings?.heroImageUrl || `${import.meta.env.BASE_URL}images/hero-perfume.png`}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-50"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-8 mt-20 md:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight">
              {settings?.heroTitle || "سحر العطور الباريسية"}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed font-light">
              {settings?.heroSubtitle || "اكتشف مجموعتنا الحصرية من العطور الفاخرة التي تعكس شخصيتك الفريدة وتدوم طويلاً."}
            </p>
            <div className="flex flex-wrap gap-4">
              <LuxuryButton size="lg" onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}>
                تسوق الآن
              </LuxuryButton>
              <Link href="/products">
                <LuxuryButton variant="outline" size="lg" className="bg-black/20 backdrop-blur-sm">
                  عرض كل العطور
                </LuxuryButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mb-2">عطور مميزة</h2>
              <p className="text-muted-foreground">أكثر العطور مبيعاً وطلباً في متجرنا</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-card rounded-2xl h-96 border border-white/5"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="group bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
                  >
                    <div className="aspect-[4/5] relative bg-secondary/30 p-8 flex items-center justify-center overflow-hidden">
                      <img 
                        src={product.imageUrl || product.images[0] || `${import.meta.env.BASE_URL}images/perfume-placeholder.png`} 
                        alt={product.nameAr}
                        className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop"; }}
                      />
                      {/* Action Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <LuxuryButton 
                          className="w-full shadow-xl" 
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingBag className="w-4 h-4 me-2" /> أضف للسلة
                        </LuxuryButton>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs text-primary mb-2 font-medium tracking-wider">{product.brand || product.category}</div>
                      <h3 className="text-xl font-bold text-foreground mb-2 truncate">{product.nameAr}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-card border-y border-white/5 relative overflow-hidden">
        <div className="absolute -right-64 -top-64 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="container px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
                الجودة الأصيلة، <br/><span className="gold-gradient-text">مباشرة من باريس</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {settings?.aboutText || "نحرص في Moon Paris على اختيار أجود أنواع العطور التي تعكس الفخامة والرقي. كل قطرة تحكي قصة، وكل زجاجة هي تحفة فنية مصممة لتدوم طويلاً وتترك أثراً لا ينسى في كل مكان تذهب إليه."}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">100%</h4>
                  <p className="text-sm text-muted-foreground">عطور أصلية</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">توصيل سريع</h4>
                  <p className="text-sm text-muted-foreground">لكافة محافظات العراق</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full border border-primary/20 p-4 relative z-10">
                <img 
                  src={`${import.meta.env.BASE_URL}images/perfume-placeholder.png`} 
                  alt="Quality"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1615397323101-38cb56d2cf74?auto=format&fit=crop&q=80&w=800"; }}
                />
              </div>
              <div className="absolute -inset-4 border border-dashed border-primary/30 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
