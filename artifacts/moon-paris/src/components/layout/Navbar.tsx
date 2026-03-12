import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/use-store';
import { useGetMe, useLogoutUser } from '@workspace/api-client-react';
import { LuxuryButton } from '../ui/luxury-components';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const cart = useStore(state => state.cart);
  const { data: user } = useGetMe({ query: { retry: false } });
  const logoutMutation = useLogoutUser();
  const setGuestMode = useStore(state => state.setGuestMode);

  const cartCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setGuestMode(false);
      setLocation('/welcome');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo-gold.png`} 
              alt="Moon Paris" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1596462502278-27bf84033001?w=100&h=100&fit=crop&q=80"; // fallback
              }}
            />
            <span className="font-display text-2xl font-bold tracking-wider gold-gradient-text">مون باريس</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">الرئيسية</Link>
            <Link href="/products" className="text-foreground hover:text-primary transition-colors">عطورنا</Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">من نحن</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-3">
                    <User className="w-4 h-4 text-primary" />
                    <span>{user.fullName.split(' ')[0]}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-primary hover:text-primary/80 transition-colors" title="لوحة التحكم">
                      <ShieldCheck className="w-5 h-5" />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/welcome">
                  <LuxuryButton variant="outline" size="sm">تسجيل الدخول</LuxuryButton>
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass-panel border-t-0 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            <Link href="/" className="text-lg text-foreground pb-2 border-b border-border" onClick={() => setMobileMenuOpen(false)}>الرئيسية</Link>
            <Link href="/products" className="text-lg text-foreground pb-2 border-b border-border" onClick={() => setMobileMenuOpen(false)}>عطورنا</Link>
            
            {user ? (
              <>
                <div className="py-2 text-primary font-bold">{user.fullName}</div>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-lg text-foreground pb-2 border-b border-border" onClick={() => setMobileMenuOpen(false)}>لوحة الإدارة</Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-lg text-destructive text-right pb-2">تسجيل الخروج</button>
              </>
            ) : (
              <Link href="/welcome" onClick={() => setMobileMenuOpen(false)}>
                <LuxuryButton className="w-full mt-2">تسجيل الدخول</LuxuryButton>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
