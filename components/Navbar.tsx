import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onSignIn?: () => void;
  onLogoClick?: () => void;
  onSpacesClick?: () => void;
  onPricingClick?: () => void;
  onManifestoClick?: () => void;
  onCreateClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignIn, onLogoClick, onSpacesClick, onPricingClick, onManifestoClick, onCreateClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
        const user = await authService.loginWithGoogle();
        if (user && onSignIn) onSignIn();
    } finally {
        setIsSigningIn(false);
    }
  };

  const navItems = [
    { label: 'Spaces', id: 'spaces', action: () => { onSpacesClick?.(); setIsMobileMenuOpen(false); } },
    { label: 'Pricing', id: 'pricing', action: () => { onPricingClick?.(); setIsMobileMenuOpen(false); } },
    { label: 'Manifesto', id: 'manifesto', action: () => { onManifestoClick?.(); setIsMobileMenuOpen(false); } }
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-8 px-4 md:px-6 pointer-events-none"
      >
        <div className={`
          flex items-center justify-between w-full max-w-5xl h-14 px-4 md:px-8 rounded-full transition-all duration-1000 pointer-events-auto
          ${scrolled 
            ? 'bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]' 
            : 'bg-transparent border border-transparent'}
        `}>
          
          {/* Left: Brand */}
          <div 
            className="flex justify-start cursor-pointer group" 
            onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
          >
            <span className="text-[10px] md:text-[11px] font-black tracking-[0.5em] text-white/90 group-hover:text-white transition-all uppercase leading-none">WIZUP</span>
          </div>

          {/* Center: Navigation (Desktop Only) */}
          <div className="hidden md:flex justify-center items-center gap-10">
             {navItems.filter(i => i.id !== 'manifesto').map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => item.action?.()}
                  className="text-[9px] font-medium text-white/50 hover:text-white transition-all tracking-[0.4em] uppercase relative group py-2"
               >
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-white/40 transition-all group-hover:w-full opacity-0 group-hover:opacity-100" />
               </button>
             ))}
          </div>

          {/* Mobile Current Page Pill (Optional context) */}
          <div className="md:hidden flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1 gap-1.5 opacity-60">
             <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Explore</span>
             <ChevronDown size={10} className="text-white/20" />
          </div>

          {/* Right: Actions */}
          <div className="flex justify-end items-center gap-2 md:gap-3">
             <button 
                onClick={onCreateClick}
                className="hidden sm:flex px-4 md:px-5 h-9 rounded-full border border-white/10 text-white/60 text-[9px] font-medium tracking-[0.2em] uppercase transition-all duration-500 hover:text-white hover:border-white/30 active:scale-95 items-center justify-center"
             >
                Create
             </button>
             
             <button 
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="relative px-5 md:px-7 h-9 rounded-full bg-white text-black text-[9px] font-black tracking-[0.3em] uppercase transition-all duration-700 hover:scale-105 active:scale-95 group overflow-hidden disabled:opacity-50 flex items-center justify-center gap-2"
             >
                <span className="relative z-10">{isSigningIn ? <Loader2 size={12} className="animate-spin" /> : 'Access'}</span>
                {!isSigningIn && <ArrowRight size={12} className="hidden md:block relative z-10 transition-transform group-hover:translate-x-1" />}
                <div className="absolute inset-0 bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>

             {/* Mobile Menu Trigger */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-white/40 hover:text-white transition-colors"
             >
                <Menu size={18} />
             </button>
          </div>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col p-12 justify-center items-center text-center space-y-12"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.action?.()}
                className="text-3xl font-light tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-12 flex flex-col w-full gap-4 max-w-xs">
              <button 
                onClick={() => { onCreateClick?.(); setIsMobileMenuOpen(false); }}
                className="w-full py-5 rounded-full border border-white/10 text-white font-bold text-sm tracking-widest uppercase"
              >
                Create
              </button>
              <button 
                onClick={() => { handleGoogleLogin(); setIsMobileMenuOpen(false); }}
                className="w-full py-5 rounded-full bg-white text-black font-bold text-sm tracking-widest uppercase"
              >
                Access
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;