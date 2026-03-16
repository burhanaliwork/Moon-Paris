import React from 'react';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 pt-12 pb-8 mt-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/moon-paris-logo2-nobg.png`} alt="Moon Paris" className="w-10 h-10 object-contain" />
            <span className="font-display text-2xl font-bold gold-gradient-text">Moon Paris</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            نقدم لكم أرقى العطور المستوحاة من سحر باريس، مصممة خصيصاً لتناسب الذوق العراقي الرفيع.
          </p>
          <a href="https://www.instagram.com/moonparis.iq" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
            <Instagram size={18} />
          </a>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Moon Paris للعطور. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
