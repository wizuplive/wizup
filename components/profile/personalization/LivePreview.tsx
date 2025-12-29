import React, { useState } from 'react';
import { AccentMood, LayoutVariant, ThemeVariant, UserProfile } from "./types";
import { 
  Sparkles, Zap, 
  MessageCircle, 
  Atom, Activity, Network, Gem, Globe, BarChart2,
  LayoutTemplate, Star, MoreHorizontal
} from "lucide-react";
import AuraVerifiedBadge from "./AuraVerifiedBadge";

interface LivePreviewProps {
  profile: UserProfile;
  themeVariant: ThemeVariant;
  layoutVariant: LayoutVariant;
  accentMood: AccentMood;
  bannerURL?: string;
}

// --- CONSTANTS & HELPERS ---

function getThemeStyles(theme: ThemeVariant, accent: AccentMood) {
  const accentColors: Record<AccentMood, string> = {
    calm: "#38bdf8",    // sky-400
    energy: "#fbbf24",  // amber-400
    focus: "#94a3b8",   // slate-400
    playful: "#f472b6", // pink-400
    mystic: "#2dd4bf",  // teal-400
  };

  const c = accentColors[accent];

  if (theme.startsWith('standard')) {
    return { 
      type: 'standard',
      bg: "bg-[#121212]", 
      text: "text-zinc-200", 
      cardBg: "bg-[#1E1E1E]", 
      border: "border-white/5",
      accent: "#fff", 
      headerOverlay: "bg-black/50" 
    };
  }

  // Aura Themes
  switch (theme) {
    case "aura-minimal":
      return { type: 'aura', bg: "bg-[#050505]", text: "text-zinc-300", border: "border-zinc-800", accent: c, cardBg: "bg-zinc-900/40", headerOverlay: "bg-gradient-to-b from-transparent to-[#050505]" };
    case "aura-neon":
      return { type: 'aura', bg: "bg-black", text: "text-white", border: "border-white/20", accent: c, cardBg: "bg-[#111] border border-white/10", headerOverlay: "bg-gradient-to-b from-purple-900/20 to-black" };
    case "aura-nature":
      return { type: 'aura', bg: "bg-[#0c120e]", text: "text-emerald-50", border: "border-emerald-900/30", accent: c, cardBg: "bg-emerald-950/20", headerOverlay: "bg-gradient-to-b from-emerald-900/20 to-[#0c120e]" };
    case "aura-creator":
      return { type: 'aura', bg: "bg-[#0f0714]", text: "text-fuchsia-50", border: "border-fuchsia-900/30", accent: c, cardBg: "bg-fuchsia-950/20", headerOverlay: "bg-gradient-to-b from-fuchsia-900/20 to-[#0f0714]" };
    case "aura-pro":
      return { type: 'aura', bg: "bg-[#080808]", text: "text-gray-100", border: "border-gray-800", accent: c, cardBg: "bg-gray-900", headerOverlay: "bg-black/80" };
    
    // v4.0 Dynamic Themes
    case "aura-quantum":
      return { 
        type: 'aura', 
        bg: "bg-[#050014]", 
        text: "text-white", 
        border: "border-white/10", 
        accent: "#8b5cf6", 
        cardBg: "bg-white/5 backdrop-blur-xl border-t border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]", 
        headerOverlay: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-transparent" 
      };
    case "aura-luma":
      return { 
        type: 'aura', 
        bg: "bg-[#080808]", 
        text: "text-gray-200", 
        border: "border-white/5", 
        accent: "#ffffff", 
        cardBg: "bg-[#111] border border-white/5 shadow-inner", 
        headerOverlay: "bg-gradient-to-b from-white/5 via-transparent to-black" 
      };
    case "aura-solar":
      return { 
        type: 'aura', 
        bg: "bg-[#120800]", 
        text: "text-orange-50", 
        border: "border-orange-500/20", 
        accent: "#fbbf24", 
        cardBg: "bg-orange-950/20 border-orange-500/10 backdrop-blur-md", 
        headerOverlay: "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-orange-900/40 via-amber-900/20 to-transparent" 
      };
    case "aura-zero":
      return { 
        type: 'aura', 
        bg: "bg-black", 
        text: "text-zinc-400", 
        border: "border-transparent", 
        accent: "#525252", 
        cardBg: "bg-transparent", // Zero chrome means no backgrounds
        headerOverlay: "hidden" 
      };
    case "aura-prisma":
      return { 
        type: 'aura', 
        bg: "bg-[#050505]", 
        text: "text-cyan-50", 
        border: "border-cyan-500/30", 
        accent: "#22d3ee", 
        cardBg: "bg-black border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]", 
        headerOverlay: "bg-[conic-gradient(from_90deg_at_50%_-20%,_var(--tw-gradient-stops))] from-fuchsia-500/30 via-cyan-500/30 to-black" 
      };

    case "aura-v13":
    default:
      return { type: 'aura', bg: "bg-[#020202]", text: "text-white", border: "border-white/10", accent: c, cardBg: "bg-white/5 backdrop-blur-md", headerOverlay: "bg-gradient-to-b from-[#020202]/30 via-transparent to-[#020202]" };
  }
}

// --- STANDARD COMPONENTS v2.0 ---

function ProfileStats({ variant }: { variant: 'classic' | 'compact' | 'creator' }) {
  return (
    <div className={`flex items-center gap-4 text-xs ${variant === 'compact' ? 'text-zinc-500' : 'text-zinc-400'} font-medium`}>
       <span className="hover:text-white cursor-pointer transition-colors"><strong className="text-white">12.4k</strong> Followers</span>
       <span className="hover:text-white cursor-pointer transition-colors"><strong className="text-white">1.2k</strong> Following</span>
       {variant !== 'compact' && <span className="hover:text-white cursor-pointer transition-colors"><strong className="text-white">42</strong> Mutual</span>}
    </div>
  );
}

function ProfileActions({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
       <button className={`${compact ? 'px-4 py-1.5 text-[10px]' : 'px-6 py-2 text-xs'} rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-1`}>
          Follow
       </button>
       <button className={`${compact ? 'p-1.5' : 'px-4 py-2 text-xs'} rounded-full bg-[#2a2a2a] text-white font-semibold border border-white/10 hover:bg-[#333] transition-colors flex items-center justify-center`}>
          {compact ? <MessageCircle size={14} /> : 'Message'}
       </button>
       <button className={`${compact ? 'p-1.5 w-7 h-7' : 'w-8 h-8'} rounded-full bg-[#2a2a2a] text-yellow-400 flex items-center justify-center border border-white/10 hover:bg-[#333] hover:text-yellow-300 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]`}>
          <Zap size={14} fill="currentColor" />
       </button>
    </div>
  );
}

function StandardHeader({ profile, variant }: { profile: UserProfile, variant: 'classic' | 'compact' | 'creator' }) {
  // 1. COMPACT (High Density)
  if (variant === 'compact') {
     return (
        <div className="w-full bg-[#121212] border-b border-white/5">
           <div className="h-20 bg-gradient-to-r from-zinc-800 via-zinc-900 to-black opacity-80" />
           <div className="px-4 pb-3 -mt-6 flex items-end justify-between relative z-20">
              <div className="flex items-end gap-3">
                 <div className="w-[58px] h-[58px] rounded-full border-[3px] border-[#121212] overflow-hidden bg-zinc-800 shadow-lg relative z-10">
                    <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="pb-0.5">
                    <h1 className="text-base font-bold text-white leading-tight flex items-center gap-1">
                       {profile.displayName} <span className="text-zinc-500 font-normal text-xs">{profile.handle}</span>
                    </h1>
                    <div className="mt-0.5 flex gap-3 text-[10px] text-zinc-500 font-medium">
                        <span><strong className="text-zinc-300">12.4k</strong> Followers</span>
                        <span><strong className="text-zinc-300">1.2k</strong> Following</span>
                    </div>
                 </div>
              </div>
              <div className="pb-0.5">
                 <ProfileActions compact />
              </div>
           </div>
        </div>
     );
  }

  // 2. CREATOR CLASSIC (Studio Mode)
  if (variant === 'creator') {
     return (
        <div className="w-full bg-[#0F0F0F] border-b border-white/5">
           <div className="h-44 bg-gradient-to-b from-zinc-800 via-[#1a1a1a] to-[#0F0F0F] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
           </div>
           <div className="px-8 pb-6 -mt-16 flex flex-col gap-4 relative z-20">
              <div className="flex justify-between items-end">
                 <div className="w-32 h-32 rounded-full border-4 border-[#0F0F0F] overflow-hidden bg-zinc-800 shadow-2xl relative z-10">
                    <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="" />
                 </div>
              </div>
              
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2 tracking-tight">
                       {profile.displayName} 
                       <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Creator</span>
                    </h1>
                    <p className="text-sm text-zinc-500 mb-3 font-medium">{profile.handle}</p>
                    <p className="text-sm text-zinc-300 max-w-lg leading-relaxed">{profile.bio}</p>
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                       <ProfileStats variant={variant} />
                       <div className="h-1 w-1 rounded-full bg-zinc-700" />
                       <span className="text-xs text-zinc-400 flex items-center gap-1.5"><BarChart2 size={12} /> 400k Monthly Reach</span>
                       <div className="h-1 w-1 rounded-full bg-zinc-700" />
                       <span className="text-xs text-zinc-400 flex items-center gap-1.5"><LayoutTemplate size={12} /> 38 Communities</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 items-end">
                    <ProfileActions />
                    <button className="px-4 py-2 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-colors">
                       Creator Dashboard
                    </button>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  // 3. STANDARD CLASSIC (Default)
  return (
     <div className="w-full bg-[#121212] border-b border-white/5 pb-2">
        <div className="h-36 bg-gradient-to-b from-zinc-700 via-zinc-900 to-[#121212] opacity-80" />
        <div className="px-6 pb-6 relative z-20 flex justify-between items-end -mt-12">
           <div className="flex flex-col gap-3">
              <div className="w-[88px] h-[88px] rounded-full border-4 border-[#121212] overflow-hidden bg-zinc-800 shadow-xl relative z-10 ring-1 ring-white/10">
                 <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight mb-0.5">{profile.displayName}</h1>
                 <p className="text-sm text-zinc-500 font-medium mb-3">{profile.handle}</p>
                 <ProfileStats variant={variant} />
              </div>
           </div>
           
           <div className="flex flex-col items-end gap-4 mb-1">
              <ProfileActions />
              <div className="flex -space-x-2 items-center mr-1">
                 {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#121212]" />)}
                 <span className="text-[10px] text-zinc-500 pl-3 font-medium">Followed by Alex + 42 others</span>
              </div>
           </div>
        </div>
        <div className="px-6 pb-4">
           <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">{profile.bio}</p>
        </div>
     </div>
  );
}

const StandardFeedItem: React.FC<{ i: number; variant: 'classic' | 'compact' | 'creator' }> = ({ i, variant }) => {
  return (
    <div className={`
       bg-[#1E1E1E] border border-white/5 rounded-xl transition-colors hover:border-white/10 group cursor-pointer
       ${variant === 'compact' ? 'p-3 mb-2 flex gap-4' : 'p-4 mb-4'}
       ${variant === 'creator' ? 'border-l-4 border-l-purple-500/50 bg-[#161616]' : ''}
    `}>
       {variant === 'compact' ? (
          <>
             <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-2 w-24 bg-zinc-700 rounded-full" />
                   <div className="h-2 w-12 bg-zinc-800 rounded-full" />
                </div>
                <div className="h-2 w-3/4 bg-zinc-700 rounded-full mb-2" />
                <div className="h-2 w-1/2 bg-zinc-700 rounded-full" />
             </div>
          </>
       ) : (
          <>
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700" />
                <div>
                   <div className="h-2.5 w-32 bg-zinc-700 rounded-full mb-1.5" />
                   <div className="h-2 w-16 bg-zinc-800 rounded-full" />
                </div>
                <div className="ml-auto text-zinc-600"><MoreHorizontal size={16} /></div>
             </div>
             <div className="space-y-2 mb-4">
                <div className="h-2.5 w-full bg-zinc-700 rounded-full" />
                <div className="h-2.5 w-[90%] bg-zinc-700 rounded-full" />
                <div className="h-2.5 w-[60%] bg-zinc-700 rounded-full" />
             </div>
             {variant === 'creator' && i === 1 && (
                <div className="w-full h-48 bg-zinc-900 rounded-lg border border-white/5 mb-4 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
                   <div className="absolute center inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                         <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                      </div>
                   </div>
                </div>
             )}
             <div className="flex justify-between items-center text-zinc-600 pt-2">
                <div className="flex gap-6">
                   <div className="h-4 w-4 bg-zinc-800 rounded-full" />
                   <div className="h-4 w-4 bg-zinc-800 rounded-full" />
                   <div className="h-4 w-4 bg-zinc-800 rounded-full" />
                </div>
                <div className="h-4 w-4 bg-zinc-800 rounded-full" />
             </div>
          </>
       )}
    </div>
  );
};

function StandardFeed({ variant }: { variant: 'classic' | 'compact' | 'creator' }) {
   return (
      <div className={`bg-[#121212] min-h-[400px] ${variant === 'compact' ? 'px-0 py-2' : 'px-4 py-4'}`}>
         {variant === 'creator' && (
            <div className="mb-6 px-2">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Star size={10} className="text-yellow-500" /> Featured Work
               </h3>
               <div className="flex gap-3 overflow-hidden pb-2">
                  {[1,2,3].map(i => (
                     <div key={i} className="w-48 h-32 bg-zinc-800 rounded-lg border border-white/5 shrink-0 relative group cursor-pointer hover:border-white/20 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                           <div className="h-2 w-3/4 bg-zinc-600 rounded-full mb-1.5" />
                           <div className="h-2 w-1/2 bg-zinc-700 rounded-full" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
         
         {variant === 'compact' ? (
            <div className="px-4 pb-2 border-b border-white/5 mb-2">
               <span className="text-xs font-bold text-white">Latest Posts</span>
            </div>
         ) : (
            <div className="flex border-b border-white/10 mb-6 mx-2">
               <button className="px-4 py-3 text-xs font-bold text-white border-b-2 border-white">Posts</button>
               <button className="px-4 py-3 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">Replies</button>
               <button className="px-4 py-3 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">Media</button>
            </div>
         )}

         <div className="px-2">
            {[1, 2, 3].map(i => <StandardFeedItem key={i} i={i} variant={variant} />)}
         </div>
      </div>
   );
}

// --- AURA COMPONENTS ---

function AuraHeader({ profile, styles, bannerURL, themeVariant }: { profile: UserProfile, styles: any, bannerURL?: string, themeVariant: ThemeVariant }) {
  const isZeroChrome = themeVariant === 'aura-zero';

  return (
    <div className="relative w-full shrink-0">
      {/* Banner */}
      {!isZeroChrome && (
        <div className="absolute inset-0 h-full w-full z-0 overflow-hidden">
           {bannerURL ? (
             <img src={bannerURL} className="w-full h-full object-cover opacity-60" alt="Banner" />
           ) : (
             <div className={`w-full h-full bg-gradient-to-br ${styles.accent === '#38bdf8' ? 'from-slate-900 to-slate-800' : 'from-purple-900/40 to-black'}`} />
           )}
           <div className={`absolute inset-0 ${styles.headerOverlay}`} />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center px-4 ${isZeroChrome ? 'pt-12 pb-4' : 'pt-8 pb-6'}`}>
         {/* Avatar */}
         <div className="relative mb-4 group cursor-pointer">
            {!isZeroChrome && (
               <div className="absolute inset-[-2px] rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite] opacity-50" />
            )}
            <div className={`w-20 h-20 rounded-full ${isZeroChrome ? '' : 'p-[2px] bg-black/50 backdrop-blur-md ring-1 ring-white/10'} relative overflow-hidden`}>
               <img src={profile.avatarUrl} className="w-full h-full rounded-full object-cover" alt={profile.displayName} />
            </div>
            {/* Badge */}
            {!isZeroChrome && (
               <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-xl">
                  <Atom size={10} style={{ color: styles.accent }} />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white">{profile.quantumBadge || 'Quantum'}</span>
               </div>
            )}
         </div>

         {/* Name & Handle */}
         <div className="text-center mb-3">
            <div className={`text-xl font-bold tracking-tight flex items-center justify-center gap-1.5 ${styles.text}`}>
               {profile.displayName} 
               <AuraVerifiedBadge theme={themeVariant} />
            </div>
            <p className={`text-xs ${isZeroChrome ? 'text-zinc-500' : 'text-white/50'}`}>{profile.handle}</p>
         </div>

         {/* Bio */}
         <p className={`text-[10px] text-center max-w-xs leading-relaxed mb-4 line-clamp-2 ${isZeroChrome ? 'text-zinc-400' : 'text-white/70'}`}>
            {profile.bio || "Architecting the next generation of digital interfaces."}
         </p>

         {/* Meta Row */}
         <div className={`flex items-center gap-3 text-[9px] font-medium mb-5 ${isZeroChrome ? 'text-zinc-600' : 'text-white/40'}`}>
            <span className="flex items-center gap-1"><Globe size={10} /> Global</span>
            <span>•</span>
            <span>SF, CA</span>
            <span>•</span>
            <span className={`${isZeroChrome ? 'hover:text-zinc-300' : 'text-white/60 hover:text-white'} cursor-pointer`}>designsystems.com</span>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-2">
            <button className={`h-8 px-5 rounded-full text-xs font-medium transition-colors ${isZeroChrome ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-white/10 border border-white/5 text-white hover:bg-white/20'}`}>Follow</button>
            <button className={`h-8 px-5 rounded-full text-xs font-medium transition-colors ${isZeroChrome ? 'bg-transparent border border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'}`}>Message</button>
            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${isZeroChrome ? 'bg-zinc-200 text-black' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}>
               <Zap size={14} fill="currentColor" />
            </button>
         </div>
      </div>
    </div>
  );
}

function FeedItem({ styles }: { styles: any }) {
  const isZeroChrome = styles.cardBg === 'bg-transparent';
  return (
    <div className={`p-4 rounded-2xl ${styles.cardBg} ${styles.border} border mb-3 ${isZeroChrome ? 'pl-0 border-b border-zinc-900 rounded-none' : ''}`}>
       <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-white/10" />
          <div className="h-2 w-20 bg-white/10 rounded-full" />
          <div className="h-2 w-8 bg-white/5 rounded-full ml-auto" />
       </div>
       <div className="h-3 w-3/4 bg-white/10 rounded-full mb-2" />
       <div className="h-3 w-1/2 bg-white/10 rounded-full mb-3" />
       <div className={`w-full h-24 rounded-xl ${isZeroChrome ? 'bg-zinc-900' : 'bg-black/40 border border-white/5'} mb-3`} />
       <div className="flex justify-between items-center text-white/30">
          <div className="flex gap-3">
             <div className="w-4 h-4 rounded-full bg-white/10" />
             <div className="w-4 h-4 rounded-full bg-white/10" />
          </div>
          <div className="w-4 h-4 rounded-full bg-white/10" />
       </div>
    </div>
  );
}

function ConsciousThought({ styles, accentColor }: { styles: any, accentColor: string }) {
  const isZeroChrome = styles.cardBg === 'bg-transparent';
  return (
    <div className={`${isZeroChrome ? 'mb-6' : `p-1 rounded-[20px] bg-gradient-to-r from-${accentColor}/20 to-purple-500/20 mb-4`}`}>
       <div className={`${styles.bg} rounded-[18px] p-4 ${isZeroChrome ? '' : 'border border-white/10'} relative overflow-hidden`}>
          <div className="flex items-center gap-1.5 mb-2">
             <Sparkles size={10} style={{ color: accentColor }} />
             <span className={`text-[9px] font-bold uppercase tracking-widest ${isZeroChrome ? 'text-zinc-500' : 'text-white/60'}`}>Conscious Thought</span>
          </div>
          <p className={`text-sm font-medium ${isZeroChrome ? 'text-zinc-200' : 'text-white'} leading-snug`}>
             Identity is no longer a static page. It is a fluid, breathing representation of our digital energy.
          </p>
       </div>
    </div>
  );
}

// Extracted WidgetBase to fix re-render context issue
const WidgetBase = ({ children, styles }: { children?: React.ReactNode, styles: any }) => {
  const isZeroChrome = styles.cardBg === 'bg-transparent';
  return (
     <div className={`${isZeroChrome ? 'bg-zinc-900/50' : styles.cardBg} ${styles.border} border rounded-2xl p-4 flex items-center justify-between`}>
        {children}
     </div>
  );
};

function SignalWidgets({ styles, accentColor }: { styles: any, accentColor: string }) {
  const isZeroChrome = styles.cardBg === 'bg-transparent';
  
  return (
    <div className="space-y-3">
       {/* Stability Gauge */}
       <WidgetBase styles={styles}>
          <div>
             <div className={`text-[9px] font-bold uppercase tracking-wider ${isZeroChrome ? 'text-zinc-500' : 'text-white/50'} mb-1`}>Signal Stability</div>
             <div className={`text-xl font-bold ${isZeroChrome ? 'text-zinc-200' : 'text-white'}`}>92%</div>
          </div>
          <div className="relative w-10 h-10 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90"><circle cx="50%" cy="50%" r="16" stroke="white" strokeOpacity="0.1" strokeWidth="3" fill="none" /><circle cx="50%" cy="50%" r="16" stroke={accentColor} strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset="8" strokeLinecap="round" /></svg>
          </div>
       </WidgetBase>
       {/* Pulse */}
       <div className={`${isZeroChrome ? 'bg-zinc-900/50' : styles.cardBg} ${styles.border} border rounded-2xl p-4`}>
          <div className="flex justify-between items-center mb-2">
             <div className={`text-[9px] font-bold uppercase tracking-wider ${isZeroChrome ? 'text-zinc-500' : 'text-white/50'} mb-1`}>Presence Pulse</div>
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex items-end gap-1 h-8">
             {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                <div key={i} className={`flex-1 ${isZeroChrome ? 'bg-zinc-700' : 'bg-white/20'} rounded-t-sm`} style={{ height: `${h}%` }} />
             ))}
          </div>
       </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function LivePreview({
  profile,
  themeVariant,
  layoutVariant,
  accentMood,
  bannerURL,
}: LivePreviewProps) {
  const styles = getThemeStyles(themeVariant, accentMood);
  const isAura = styles.type === 'aura';
  const isZeroChrome = themeVariant === 'aura-zero';
  const [activeTab, setActiveTab] = useState<'Stream' | 'Signal'>('Stream');

  // Determine standard variant type
  const standardType = themeVariant.startsWith('standard') 
    ? themeVariant.replace('standard-', '') as 'classic' | 'compact' | 'creator' 
    : 'classic';

  // LAYOUT ENGINE LOGIC (Aura Only)
  const showFeedFirst = layoutVariant === 'feed-first';
  const showStoryFirst = layoutVariant === 'story-first';
  const showStatsFirst = layoutVariant === 'stats-first';
  const showSplit = layoutVariant === 'split-view';

  // --- STANDARD RENDER ---
  if (!isAura) {
    return (
      <div className={`w-full h-full bg-[#121212] overflow-y-auto no-scrollbar rounded-[40px] border-[8px] border-[#1f1f1f] shadow-2xl relative`}>
         {/* Notch */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1f1f1f] rounded-b-2xl z-50 pointer-events-none" />
         
         <StandardHeader profile={profile} variant={standardType} />
         
         <StandardFeed variant={standardType} />
      </div>
    );
  }

  // --- AURA RENDER ---
  return (
    <div className={`w-full h-full ${styles.bg} overflow-y-auto no-scrollbar rounded-[40px] border-[8px] border-[#1f1f1f] shadow-2xl relative`}>
       {/* Notch */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1f1f1f] rounded-b-2xl z-50 pointer-events-none" />

       {/* Aura Header */}
       <AuraHeader profile={profile} styles={styles} bannerURL={bannerURL} themeVariant={themeVariant} />

       {/* Aura Tabs */}
       <div className={`relative z-10 border-b border-white/5 flex justify-center gap-8 py-0 mb-4 ${isZeroChrome ? 'bg-black/80' : 'bg-gradient-to-b from-transparent to-black/20'}`}>
          {['Stream', 'Signal'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border-b-2 ${activeTab === tab ? `border-${styles.accent} ${isZeroChrome ? 'text-zinc-200' : 'text-white'}` : 'border-transparent text-white/40'}`}
               style={{ borderColor: activeTab === tab ? styles.accent : 'transparent' }}
             >
                {tab}
             </button>
          ))}
       </div>

       {/* CONTENT AREA */}
       <div className={`p-4 min-h-[400px] ${isZeroChrome ? 'px-6' : ''}`}>
          {activeTab === 'Stream' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Story First Layout - Big Thought */}
                {showStoryFirst && <ConsciousThought styles={styles} accentColor={styles.accent} />}

                {/* Split View - Top Widgets */}
                {(showSplit || showStatsFirst) && (
                   <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className={`${isZeroChrome ? 'bg-zinc-900/50' : styles.cardBg} ${styles.border} border rounded-xl p-3 flex flex-col justify-between`}>
                         <Activity size={14} style={{ color: styles.accent }} />
                         <span className={`text-[10px] font-bold ${isZeroChrome ? 'text-zinc-300' : 'text-white'} mt-1`}>Rising</span>
                      </div>
                      <div className={`${isZeroChrome ? 'bg-zinc-900/50' : styles.cardBg} ${styles.border} border rounded-xl p-3 flex flex-col justify-between`}>
                         <Network size={14} style={{ color: styles.accent }} />
                         <span className={`text-[10px] font-bold ${isZeroChrome ? 'text-zinc-300' : 'text-white'} mt-1`}>Strong</span>
                      </div>
                   </div>
                )}

                {/* Normal Feed */}
                {!showStoryFirst && <ConsciousThought styles={styles} accentColor={styles.accent} />}
                
                <FeedItem styles={styles} />
                <FeedItem styles={styles} />
             </div>
          )}

          {activeTab === 'Signal' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SignalWidgets styles={styles} accentColor={styles.accent} />
                
                {/* Memory Crystals */}
                <div className={`${isZeroChrome ? 'bg-zinc-900/50' : styles.cardBg} ${styles.border} border rounded-2xl p-4`}>
                   <h3 className="text-[9px] font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-1">
                      <Gem size={10} /> Memory Crystals
                   </h3>
                   <div className="space-y-2">
                      {['Viral Spark', 'Community Pillar'].map((c, i) => (
                         <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-white">{c}</span>
                            <span className="text-[8px] text-white/40">Nov 2023</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
}