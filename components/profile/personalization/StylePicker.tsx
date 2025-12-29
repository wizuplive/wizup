import React from 'react';
import { ThemeVariant } from "./types";
import { Lock, Sparkles, LayoutTemplate, Palette } from "lucide-react";

const STANDARD_OPTIONS: { id: ThemeVariant; label: string; description: string }[] = [
  {
    id: "standard-classic",
    label: "Standard Classic",
    description: "Dark charcoal. Clean & efficient.",
  },
  {
    id: "standard-compact",
    label: "Compact",
    description: "High density. Minimized headers.",
  },
  {
    id: "standard-creator",
    label: "Creator Classic",
    description: "Highlights stats & communities.",
  }
];

const AURA_OPTIONS: { id: ThemeVariant; label: string; description: string; chip?: string }[] = [
  {
    id: "aura-v13",
    label: "Aura v13",
    description: "Cinematic gradients. Quantum identity.",
    chip: "Default",
  },
  {
    id: "aura-minimal",
    label: "Aura Minimal",
    description: "Low noise. Invisible chrome.",
  },
  {
    id: "aura-neon",
    label: "Neon Tech",
    description: "High-energy glows. Futuristic edge.",
  },
  {
    id: "aura-nature",
    label: "Nature Aura",
    description: "Earthy gradients. Calm presence.",
  },
  {
    id: "aura-creator",
    label: "Creator Mode",
    description: "Showcase heavy. Portfolio focus.",
  },
  {
    id: "aura-pro",
    label: "Studio Pro",
    description: "Editorial, clean, presentation-grade.",
  },
];

const DYNAMIC_THEMES = [
  {
    id: 'aura-quantum',
    name: 'Quantum Flux',
    tagline: 'Living gradients. Chromatic consciousness.',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500'
  },
  {
    id: 'aura-luma',
    name: 'Luma Noir',
    tagline: 'Liquid metal. Apple-grade luxury.',
    gradient: 'from-gray-700 via-gray-900 to-black'
  },
  {
    id: 'aura-solar',
    name: 'Solar Tone',
    tagline: 'Atmospheric haze. Golden hour.',
    gradient: 'from-orange-400 via-amber-500 to-purple-600'
  },
  {
    id: 'aura-zero',
    name: 'Zero Chrome',
    tagline: 'Invisible UI. Pure content.',
    gradient: 'from-zinc-800 to-black'
  },
  {
    id: 'aura-prisma',
    name: 'Prisma Core',
    tagline: 'Neon splines. Futuristic vibrance.',
    gradient: 'from-cyan-400 via-blue-500 to-fuchsia-500'
  }
] as const;

interface StylePickerProps {
  value: ThemeVariant;
  onChange: (value: ThemeVariant) => void;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

interface AuraThemeCardProps { 
  name: string;
  tagline: string;
  gradient: string;
  isActive: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const AuraThemeCard: React.FC<AuraThemeCardProps> = ({ 
  name, 
  tagline, 
  gradient, 
  isActive, 
  onSelect,
  disabled
}) => {
  return (
    <button 
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-500 group text-left ${
        isActive 
          ? 'border-white/40 ring-1 ring-white/20 scale-[1.02]' 
          : disabled 
            ? 'border-white/5 opacity-50 cursor-not-allowed' 
            : 'border-white/5 hover:border-white/10'
      }`}
    >
      {/* Background Preview */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      {/* Active Glow */}
      {isActive && <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 blur-xl`} />}

      <div className="relative p-4 z-10">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {name}
            </span>
            {disabled && <Lock size={12} className="text-zinc-600" />}
          </div>
          {isActive && (
            <div className="flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase opacity-80 group-hover:opacity-100 transition-opacity">
          {tagline}
        </p>
      </div>
      
      {/* "Apply" Overlay on Hover if not active */}
      {!isActive && !disabled && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="text-xs font-bold text-white uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full bg-black/40 shadow-xl">Apply Theme</span>
        </div>
      )}
    </button>
  );
};

export default function StylePicker({ value, onChange, isPremium = false, onUpgradeClick }: StylePickerProps) {
  return (
    <div className="rounded-[32px] bg-black/40 p-6 backdrop-blur-xl border border-white/5 shadow-2xl">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
        Profile Appearance
      </h2>

      <div className="space-y-8">
        {/* Standard Section */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
             <LayoutTemplate size={14} className="text-zinc-400" />
             <span className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">Standard Themes</span>
          </div>
          <div className="space-y-3">
            {STANDARD_OPTIONS.map((opt) => {
              const isActive = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange(opt.id)}
                  className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all duration-300 border
                    ${
                      isActive
                        ? "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-[1.02]"
                        : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.08] hover:border-white/10 hover:text-zinc-200"
                    }`}
                >
                  <div>
                    <span className="text-sm font-bold block mb-0.5">{opt.label}</span>
                    <span className={`text-[10px] font-medium ${isActive ? "text-zinc-600" : "text-zinc-500"}`}>{opt.description}</span>
                  </div>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-black shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aura Section */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-purple-900/10 to-transparent rounded-[32px] pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between mb-4 px-1">
             <span className="text-[11px] font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5 shadow-purple-500/20 drop-shadow-sm">
                <Sparkles size={14} /> Aura Premium
             </span>
             {!isPremium && (
               <button onClick={onUpgradeClick} className="text-[10px] font-bold text-white bg-purple-600 px-3 py-1 rounded-full hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/40">
                 Unlock
               </button>
             )}
          </div>
          
          <div className="grid grid-cols-1 gap-3 relative z-10">
            {AURA_OPTIONS.map((opt) => {
              const isActive = opt.id === value;
              const isDisabled = !isPremium;
              
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => !isDisabled && onChange(opt.id)}
                  className={`group relative flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all duration-300 border overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 text-white shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-[1.02]"
                        : isDisabled 
                          ? "bg-white/[0.02] text-zinc-600 border-white/5 cursor-not-allowed opacity-50" 
                          : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.08] hover:border-white/10 hover:text-white"
                    }
                  `}
                >
                  {/* Neon Glow Border Effect for Active */}
                  {isActive && <div className="absolute inset-0 border border-purple-400/50 rounded-2xl blur-[1px]" />}
                  
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold tracking-tight ${isActive ? "text-white" : ""}`}>{opt.label}</span>
                        {isDisabled && <Lock size={12} className="text-zinc-600" />}
                      </div>
                      {opt.chip && !isDisabled && (
                        <span className="text-[9px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-zinc-300 border border-white/5">{opt.chip}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium leading-tight block ${isActive ? "text-purple-200" : "text-zinc-500"}`}>{opt.description}</span>
                  </div>
                  
                  {isActive && (
                    <div className="relative z-10 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc] ml-3 border border-white/20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Variants Section (v4.0) */}
        <div className="mt-8 pt-6 border-t border-white/5 relative">
           <div className="flex items-center justify-between mb-4 px-1">
             <span className="text-[11px] font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-wider flex items-center gap-1.5">
                <Palette size={14} className="text-indigo-400" /> Dimensional Variants <span className="text-[9px] text-gray-400 font-bold bg-white/10 px-1.5 py-0.5 rounded ml-1 border border-white/5">v4.0</span>
             </span>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {DYNAMIC_THEMES.map(theme => (
                 <AuraThemeCard
                   key={theme.id}
                   name={theme.name}
                   tagline={theme.tagline}
                   gradient={theme.gradient}
                   isActive={value === theme.id}
                   onSelect={() => isPremium && onChange(theme.id as ThemeVariant)}
                   disabled={!isPremium}
                 />
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}