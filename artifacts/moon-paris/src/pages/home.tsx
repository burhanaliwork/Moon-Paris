import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useGetProducts, useGetSiteSettings } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { LuxuryButton } from '@/components/ui/luxury-components';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ArrowLeft, Grid2X2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/use-store';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = ['عطور رجالية', 'عطور نسائية', 'عطور للجنسين', 'عطور نيش'];

export default function Home() {
  const { data: settings } = useGetSiteSettings();
  const { data: products = [], isLoading } = useGetProducts();
  const addToCart = useStore(state => state.addToCart);

  const [viewMode, setViewMode] = useState<'all' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = viewMode === 'categories' && selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
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
              <LuxuryButton size="lg" onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                تسوق الآن
              </LuxuryButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-24 bg-background">
        <div className="container px-4 md:px-8">

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <button
              onClick={() => { setViewMode('all'); setSelectedCategory(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                viewMode === 'all'
                  ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                  : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary bg-card'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
              العطور كاملة
            </button>
            <button
              onClick={() => { setViewMode('categories'); setSelectedCategory(selectedCategory || CATEGORIES[0]); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                viewMode === 'categories'
                  ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                  : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary bg-card'
              }`}
            >
              <Layers className="w-4 h-4" />
              تقسيمات العطور
            </button>

            {/* Category sub-buttons */}
            {viewMode === 'categories' && (
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                      selectedCategory === cat
                        ? 'bg-white/10 text-white border-white/30'
                        : 'border-white/5 text-muted-foreground hover:text-foreground bg-card'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mb-1">
                {viewMode === 'categories' && selectedCategory ? selectedCategory : 'جميع العطور'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {filteredProducts.length} عطر متاح
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-card rounded-2xl h-72 border border-white/5"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">لا توجد عطور في هذا القسم</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
                  >
                    <div className="aspect-square relative bg-secondary/30 p-4 flex items-center justify-center overflow-hidden">
                      <img 
                        src={product.imageUrl || product.images[0] || `${import.meta.env.BASE_URL}images/perfume-placeholder.png`} 
                        alt={product.nameAr}
                        className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop"; }}
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                          خصم
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-5">
                      <div className="text-xs text-primary mb-1 font-medium tracking-wider truncate">{product.brand || product.category}</div>
                      <h3 className="text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2 leading-snug">{product.nameAr}</h3>
                      <div className="flex items-center justify-between gap-1 mb-3">
                        <span className="text-sm md:text-base font-bold gold-gradient-text">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 hover:bg-primary hover:text-black text-primary text-xs font-bold transition-all duration-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> أضف للسلة
                      </button>
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
                {settings?.infoSectionTitle || "الجودة الأصيلة، مباشرة من باريس"}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {settings?.aboutText || "نحرص في Moon Paris على اختيار أجود أنواع العطور التي تعكس الفخامة والرقي. كل قطرة تحكي قصة، وكل زجاجة هي تحفة فنية مصممة لتدوم طويلاً وتترك أثراً لا ينسى في كل مكان تذهب إليه."}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{settings?.stat1Value || "عطور أصلية"}</h4>
                  <p className="text-sm text-muted-foreground">{settings?.stat1Label || "100%"}</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-2">{settings?.stat2Value || "توصيل سريع"}</h4>
                  <p className="text-sm text-muted-foreground">{settings?.stat2Label || "لكافة محافظات العراق"}</p>
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
