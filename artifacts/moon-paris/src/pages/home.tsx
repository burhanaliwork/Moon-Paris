import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useGetProducts, useGetSiteSettings } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { LuxuryButton } from '@/components/ui/luxury-components';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Grid2X2, Layers, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/use-store';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = ['عطور رجالية', 'عطور نسائية', 'عطور للجنسين', 'عطور نيش'];
const SIZES = ['3ml', '5ml', '10ml'] as const;

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface SampleProduct {
  id: number;
  nameAr: string;
  name: string;
  descriptionAr?: string;
  imageUrl?: string;
  brand?: string;
  price3ml?: number | null;
  price5ml?: number | null;
  price10ml?: number | null;
  inStock: boolean;
}

function getSamplePrice(s: SampleProduct, size: '3ml' | '5ml' | '10ml'): number | null {
  if (size === '3ml') return s.price3ml ?? null;
  if (size === '5ml') return s.price5ml ?? null;
  if (size === '10ml') return s.price10ml ?? null;
  return null;
}

export default function Home() {
  const { data: settings } = useGetSiteSettings();
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { addProductToCart, addSampleToCart } = useStore();

  const [viewMode, setViewMode] = useState<'all' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [samples, setSamples] = useState<SampleProduct[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'categories') {
      setSamplesLoading(true);
      fetch(`${BASE_URL}/api/samples`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => setSamples(Array.isArray(data) ? data : []))
        .catch(() => setSamples([]))
        .finally(() => setSamplesLoading(false));
    }
  }, [viewMode]);

  const filteredProducts = products;

  const handleAddProduct = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addProductToCart(product, 1);
    toast({ title: "تم الإضافة بنجاح", description: `تم إضافة ${product.nameAr} إلى عربة التسوق` });
  };

  const handleAddSample = (sample: SampleProduct, size: typeof SIZES[number]) => {
    const price = getSamplePrice(sample, size);
    if (!price) return;
    addSampleToCart(sample, size, price, 1);
    toast({ title: "تم الإضافة بنجاح", description: `${sample.nameAr} - ${size}` });
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
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>
        <div className="container relative z-10 px-4 md:px-8 mt-20 md:mt-0">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight">
              {settings?.heroTitle || "سحر العطور الباريسية"}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed font-light">
              {settings?.heroSubtitle || "اكتشف مجموعتنا الحصرية من العطور الفاخرة التي تعكس شخصيتك الفريدة وتدوم طويلاً."}
            </p>
            <LuxuryButton size="lg" onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
              تسوق الآن
            </LuxuryButton>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-24 bg-background">
        <div className="container px-4 md:px-8">

          {/* Mode Tabs */}
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <button
              onClick={() => setViewMode('all')}
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
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                viewMode === 'categories'
                  ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                  : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary bg-card'
              }`}
            >
              <Layers className="w-4 h-4" />
              تقسيمات العطور
            </button>
          </div>

          {/* ALL PRODUCTS VIEW */}
          {viewMode === 'all' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mb-1">جميع العطور</h2>
                <p className="text-muted-foreground text-sm">{filteredProducts.length} عطر متاح</p>
              </div>
              {productsLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-card rounded-2xl h-72 border border-white/5"></div>)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">لا توجد عطور مضافة بعد</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
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
                            <div className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">خصم</div>
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
                            onClick={(e) => handleAddProduct(e, product)}
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
            </>
          )}

          {/* SAMPLES VIEW */}
          {viewMode === 'categories' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mb-1">تقسيمات العطور</h2>
                <p className="text-muted-foreground text-sm">اختر الحجم الذي يناسبك — 3مل، 5مل، أو 10مل</p>
              </div>
              {samplesLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-card rounded-2xl h-80 border border-white/5"></div>)}
                </div>
              ) : samples.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>لا توجد تقسيمات متاحة حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {samples.map((sample, index) => (
                    <motion.div
                      key={sample.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 shadow-lg"
                    >
                      {/* Image */}
                      <div className="aspect-square relative bg-secondary/30 p-4 flex items-center justify-center overflow-hidden">
                        <img
                          src={sample.imageUrl || `${import.meta.env.BASE_URL}images/perfume-placeholder.png`}
                          alt={sample.nameAr}
                          className="w-full h-full object-contain drop-shadow-2xl"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop"; }}
                        />
                        <div className="absolute top-2 right-2 bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30">
                          تقسيمة
                        </div>
                      </div>

                      {/* Info + Size Selector */}
                      <div className="p-3 md:p-4">
                        <div className="text-xs text-primary mb-1 font-medium truncate">{sample.brand}</div>
                        <h3 className="text-sm md:text-base font-bold text-foreground mb-3 line-clamp-2">{sample.nameAr}</h3>

                        {/* Size Buttons */}
                        <div className="space-y-2">
                          {SIZES.map(size => {
                            const price = getSamplePrice(sample, size);
                            if (!price) return null;
                            return (
                              <button
                                key={size}
                                onClick={() => handleAddSample(sample, size)}
                                disabled={!sample.inStock}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-background/60 hover:bg-primary/10 border border-white/5 hover:border-primary/40 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors w-8">{size}</span>
                                  <span className="text-sm font-bold gold-gradient-text">{formatPrice(price)}</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-all">
                                  <Plus className="w-3.5 h-3.5 text-primary group-hover:text-black" />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {!sample.inStock && (
                          <p className="text-xs text-red-400 text-center mt-2">غير متوفر حالياً</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
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
                {settings?.aboutText || "نحرص في Moon Paris على اختيار أجود أنواع العطور التي تعكس الفخامة والرقي."}
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
                <img src={`${import.meta.env.BASE_URL}images/perfume-placeholder.png`} alt="Quality" className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1615397323101-38cb56d2cf74?auto=format&fit=crop&q=80&w=800"; }} />
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
