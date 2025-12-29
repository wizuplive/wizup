import React from 'react';
import { X as XIcon, Github, Youtube, MessageCircle } from 'lucide-react';

interface FooterProps {
  onManifestoClick?: () => void;
  onSpacesClick?: () => void;
  onPricingClick?: () => void;
  onLogoClick?: () => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  onSafetyClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  onManifestoClick, 
  onSpacesClick, 
  onPricingClick, 
  onLogoClick,
  onPrivacyClick,
  onTermsClick,
  onSafetyClick
}) => {
  return (
    <footer className="bg-black pt-32 pb-16 md:pt-64 md:pb-24 border-t border-white/[0.02] selection:bg-purple-500/10 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 mb-32 md:mb-48">
           
           {/* LEFT — Identity */}
           <div className="md:col-span-6 space-y-8 md:space-y-12">
              <div 
                className="cursor-pointer group inline-block" 
                onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
              >
                <h3 className="text-2xl md:text-3xl font-black tracking-[0.4em] text-white/90 uppercase leading-none group-hover:text-white transition-all">WIZUP</h3>
              </div>
              <p className="text-white/20 font-light text-lg md:text-xl max-w-sm leading-relaxed tracking-tight">
                 The structural home for digital belonging. <br className="hidden md:block" />
                 Built once. Owned forever.
              </p>
              <div className="space-y-1 pt-4">
                <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">&copy; 2025 WIZUP</p>
                <p className="text-[9px] text-white/[0.03] uppercase tracking-[0.4em]">VERSION 2.0 — STRUCTURAL INTENT</p>
              </div>
           </div>
           
           {/* CENTER — Foundation */}
           <div className="md:col-span-3 space-y-8">
              <h4 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">Foundation</h4>
              <ul className="space-y-5 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                 <li 
                   onClick={onManifestoClick} 
                   className="hover:text-white transition-all cursor-pointer w-fit"
                 >
                   Manifesto
                 </li>
                 <li 
                   onClick={onSpacesClick} 
                   className="hover:text-white transition-all cursor-pointer w-fit"
                 >
                   Spaces
                 </li>
                 <li 
                   onClick={onPricingClick} 
                   className="hover:text-white transition-all cursor-pointer w-fit"
                 >
                   Pricing
                 </li>
                 <li className="hover:text-white/40 transition-all cursor-not-allowed opacity-40 w-fit">
                   Ethics
                 </li>
              </ul>
           </div>

           {/* RIGHT — Legal */}
           <div className="md:col-span-3 space-y-8">
              <h4 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">Legal</h4>
              <ul className="space-y-5 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                 <li onClick={onPrivacyClick} className="hover:text-white transition-all cursor-pointer w-fit text-white/30">Privacy</li>
                 <li onClick={onTermsClick} className="hover:text-white transition-all cursor-pointer w-fit text-white/30">Terms</li>
                 <li onClick={onSafetyClick} className="hover:text-white transition-all cursor-pointer w-fit text-white/30">Safety</li>
              </ul>
           </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-12 border-t border-white/[0.02]">
          {/* Social Icons */}
          <div className="flex items-center gap-8 md:gap-10">
            <a href="#" className="text-white/30 hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <XIcon size={18} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <MessageCircle size={18} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <Github size={18} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <Youtube size={18} strokeWidth={1.5} />
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-white/5 font-bold uppercase tracking-[0.3em] order-first md:order-last">
             <span>Presence is Sovereignty</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;