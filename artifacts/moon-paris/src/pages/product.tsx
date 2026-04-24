import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct } from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LuxuryButton } from '@/components/ui/luxury-components';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/store/use-store';
import { toast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductPage() {
  const [, params] = useRoute('/product/:id');
  const productId = parseInt(params?.id || '0', 10);
  
  const { data: product, isLoading, isError } = useGetProduct(productId, { 
    query: { queryKey: [`/api/products/${productId}`], enabled: !!productId } 
  });
  
  const addProductToCart = useStore(state => state.addProductToCart);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl || product.images?.[0] || '');
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addProductToCart(product, quantity);
      toast({ title: "تم الإضافة", description: `تم إضافة ${quantity} من ${product.nameAr} للسلة` });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background pt-32 text-center text-primary">جاري التحميل...</div>;
  if (isError || !product) return <div className="min-h-screen bg-background pt-32 text-center text-destructive">المنتج غير موجود</div>;

  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Product Gallery */}
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-card rounded-3xl border border-white/5 flex items-center justify-center p-8 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={activeImage || `${import.meta.env.BASE_URL}images/perfume-placeholder.png`}
                alt={product.nameAr}
                className="w-full h-full object-contain drop-shadow-2xl z-10 relative"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop"; }}
              />
            </motion.div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-24 h-24 rounded-xl border-2 transition-all p-2 bg-card ${activeImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{product.brand || 'Moon Paris'}</span>
                {product.featured && <span className="px-3 py-1 bg-secondary text-foreground text-xs font-bold rounded-full">الأكثر مبيعاً</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">{product.nameAr}</h1>
              <p className="text-lg text-muted-foreground uppercase tracking-widest">{product.name}</p>
            </div>

            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-border">
              <span className="text-4xl font-bold gold-gradient-text">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <div className="prose prose-invert prose-p:text-muted-foreground max-w-none mb-10">
              <p className="leading-relaxed text-lg">{product.descriptionAr || 'عطر فاخر يجسد الأناقة والجاذبية، مصمم بعناية ليمنحك حضوراً لا ينسى.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-white/5">
                <Droplet className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">الحجم</div>
                  <div className="font-bold text-foreground">{product.volume || '100 مل'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-white/5">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">الضمان</div>
                  <div className="font-bold text-foreground">أصلي 100%</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 h-14 w-full sm:w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-muted-foreground hover:text-primary transition-colors"><Minus size={18} /></button>
                <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors"><Plus size={18} /></button>
              </div>
              
              <LuxuryButton 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity < 1}
              >
                <ShoppingBag className="w-5 h-5 me-2" />
                {product.inStock ? 'إضافة إلى السلة' : 'نفذت الكمية'}
              </LuxuryButton>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground justify-center sm:justify-start">
              <Truck className="w-4 h-4 text-primary" /> توصيل لجميع محافظات العراق خلال 24-48 ساعة
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
