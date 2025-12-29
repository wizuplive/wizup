import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Instagram, Globe, ArrowRight, 
  ShieldCheck, X, Loader2, Bookmark, MoreHorizontal,
  Star, Users, Play, Atom, Heart, Twitter,
  TrendingUp, LayoutGrid, Map as MapIcon, Activity, ExternalLink, Search,
  MessageCircle, Zap, Box, ZapOff, Sparkle
} from 'lucide-react';
import { DashboardView, Influencer, PlatformStat } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA V5.2 ---

const MOCK_INFLUENCERS: Influencer[] = [
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    handle: '@designsarah', 
    category: 'Design', 
    oneLiner: 'Known for high-performing short-form design breakdowns.', 
    img: 'https://picsum.photos/seed/sarah1/400/400', 
    followerCountCombined: '1.4M',
    credibilitySignal: 'Worked with Figma',
    platforms: [
      { platform: 'tiktok', followers: '1.1M', handle: 'sarah.design' },
      { platform: 'instagram', followers: '320k', handle: 'designsarah' }
    ],
    collaboratedWith: ['Figma', 'Notion', 'Adobe'],
    insightChips: ['Strong Gen Z audience', 'US + EU reach', 'High save rate'],
    momentum: { label: 'Engagement up 42%', trend: 'up', value: '42%', description: 'Rapid growth this week' },
    audience: { location: '🇺🇸 United States', ageRange: '18–34', genderSplit: 'Balanced', interests: ['Design', 'AI tools', 'Productivity'] },
    aura: { reach: "Broad", resonance: "Vibrant", consistency: "Stable", sizeScalar: 1.4, glowIntensity: 0.9, pulseSpeed: 4 },
    badges: ['Resonant Presence', 'Verified'],
    bio: 'Architecting the next generation of digital interfaces. Founder of Design Systems Mastery.',
    mediaLinks: [
      { title: 'The Future of Systems', type: 'YouTube', thumbnail: 'https://picsum.photos/seed/m1/300/200', url: '#' },
      { title: 'Designing for Humans', type: 'Podcast', thumbnail: 'https://picsum.photos/seed/m2/300/200', url: '#' }
    ]
  },
  { 
    id: 2, 
    name: 'David Chen', 
    handle: '@fit_dave', 
    category: 'Wellness', 
    oneLiner: 'Master of minimalist healthy rituals and longevity.', 
    img: 'https://picsum.photos/seed/dave1/400/400', 
    followerCountCombined: '3.2M',
    credibilitySignal: 'Trusted by Whoop',
    platforms: [
      { platform: 'instagram', followers: '850k', handle: 'fit_dave' },
      { platform: 'youtube', followers: '2.4M', handle: 'DavidFitness' }
    ],
    collaboratedWith: ['Whoop', 'Lululemon', 'Huel'],
    insightChips: ['US + AU reach', 'High retention', 'Expert status'],
    momentum: { label: 'Resonance stable', trend: 'stable', value: 'Stable', description: 'Consistent resonance' },
    audience: { location: 'Global / US', ageRange: '25–45', genderSplit: '60% Male', interests: ['Health', 'Fitness', 'Biohacking'] },
    aura: { reach: "Broad", resonance: "Strong", consistency: "Stable", sizeScalar: 1.2, glowIntensity: 0.7, pulseSpeed: 2 },
    badges: ['Trusted Reviewer'],
    bio: 'Functional fitness and metabolic health. Simplifying wellness for peak performance.'
  },
  { 
    id: 3, 
    name: 'Elena Rivera', 
    handle: '@elenacode', 
    category: 'Tech', 
    oneLiner: 'Known for simplifying complexity for builders.', 
    img: 'https://picsum.photos/seed/elena1/400/400', 
    followerCountCombined: '570k',
    credibilitySignal: 'Featured in Vercel',
    platforms: [
      { platform: 'x', followers: '120k', handle: 'elena_codes' },
      { platform: 'tiktok', followers: '450k', handle: 'elena.tech' }
    ],
    collaboratedWith: ['Vercel', 'Supabase', 'GitHub'],
    insightChips: ['Dev-heavy audience', 'Global reach', 'High conversion'],
    momentum: { label: 'Trending now', trend: 'up', value: 'Hot', description: 'Strong pull in Tech' },
    audience: { location: 'Europe / US', ageRange: '18–30', genderSplit: 'Balanced', interests: ['Coding', 'Startup', 'Web3'] },
    aura: { reach: "Growing", resonance: "Strong", consistency: "Rising", sizeScalar: 0.9, glowIntensity: 0.6, pulseSpeed: 5 },
    badges: ['High Signal'],
    bio: 'Fullstack engineer and educator. Making software engineering accessible to everyone.'
  },
  { 
    id: 4, 
    name: 'Marcus Thorne', 
    handle: '@culture_marcus', 
    category: 'Culture', 
    oneLiner: 'Known for analyzing the zeitgeist with precision.', 
    img: 'https://picsum.photos/seed/marcus1/400/400', 
    followerCountCombined: '265k',
    credibilitySignal: 'Vogue Spotlight',
    platforms: [
      { platform: 'instagram', followers: '210k', handle: 'marcus_zeit' },
      { platform: 'x', followers: '55k', handle: 'marcus_thorne' }
    ],
    collaboratedWith: ['Vogue', 'Hypebeast', 'Nike'],
    insightChips: ['Gen Z Trendsetter', 'US Reach', 'High engagement'],
    momentum: { label: 'Stable presence', trend: 'stable', value: 'Nominal', description: 'Consistent resonance' },
    audience: { location: '🇺🇸 US', ageRange: '16–28', genderSplit: 'Balanced', interests: ['Fashion', 'Art', 'Music'] },
    aura: { reach: "Focused", resonance: "Quiet", consistency: "Stable", sizeScalar: 0.7, glowIntensity: 0.4, pulseSpeed: 1 },
    badges: ['Trend Forecaster'],
    bio: 'Culture critic and brand strategist. Exploring the intersection of fashion and technology.'
  },
];

const DISCOVERY_MODES = ['Spotlight', 'Trending Now', 'Emerging', 'Category Leaders', 'Open to Collaborate'] as const;
const CATEGORIES = ['All', 'Design', 'Tech', 'Wellness', 'Culture', 'Web3', 'Education', 'Lifestyle'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Design: '#a855f7', Tech: '#06b6d4', Wellness: '#10b981', Culture: '#f59e0b', Web3: '#6366f1', Education: '#3b82f6', Lifestyle: '#ec4899', All: '#ffffff'
};

// --- COMPONENTS ---

const PlatformIcon: React.FC<{ type: PlatformStat['platform'] }> = ({ type }) => {
  const Icon = type === 'tiktok' ? Globe : type === 'instagram' ? Instagram : type === 'youtube' ? Play : Twitter;
  return (
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all hover:bg-white/10">
      <Icon size={12} />
    </div>
  );
};

const ProfileOverlay: React.FC<{ influencer: Influencer; onClose: () => void }> = ({ influencer, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="relative w-full max-w-2xl h-full bg-[#080808] border-l border-white/10 shadow-2xl flex flex-col"
      >
        <div className="flex-1 overflow-y-auto no-scrollbar">
           {/* Cover / Header */}
           <div className="relative h-64 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black" />
              <motion.div 
                className="absolute inset-0 blur-3xl opacity-20"
                style={{ backgroundColor: CATEGORY_COLORS[influencer.category] }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <button onClick={onClose} className="absolute top-8 left-8 p-3 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white transition-all hover:scale-110">
                 <X size={20} />
              </button>
           </div>

           {/* Identity Panel */}
           <div className="px-12 -mt-20 space-y-12 pb-32">
              <div className="space-y-6">
                <div className="relative inline-block group">
                   <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-white/20 to-transparent blur-md group-hover:scale-110 transition-transform" />
                   <div className="relative w-40 h-40 rounded-full p-1 bg-[#080808] border border-white/10 overflow-hidden shadow-2xl">
                      <img src={influencer.img} className="w-full h-full rounded-full object-cover" alt="" />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <h2 className="text-5xl font-bold text-white tracking-tighter">{influencer.name}</h2>
                      <ShieldCheck size={28} className="text-blue-500 mt-2" />
                   </div>
                   <div className="flex gap-4">
                      {influencer.platforms.map(p => (
                        <div key={p.platform} className="flex items-center gap-2 text-white/40">
                           <PlatformIcon type={p.platform} />
                           <span className="text-sm font-bold tabular-nums tracking-tighter text-white/80">{p.followers}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <p className="text-xl text-white/50 font-light leading-relaxed italic">"{influencer.oneLiner}"</p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                 <button className="flex-1 py-5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:scale-[1.02] transition-transform active:scale-95">Connect</button>
                 <button className="p-5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><MessageCircle size={20} /></button>
                 <button className="p-5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Bookmark size={20} /></button>
              </div>

              {/* Scroll Sections */}
              <section className="space-y-8 pt-8 border-t border-white/5">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Presence</h3>
                 <p className="text-lg text-white/70 font-light leading-relaxed">{influencer.bio}</p>
                 <div className="flex flex-wrap gap-4">
                    {influencer.collaboratedWith.map(brand => (
                      <div key={brand} className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-bold text-white/30 uppercase tracking-widest">{brand}</div>
                    ))}
                 </div>
              </section>

              <section className="space-y-8">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Audience</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Location', val: influencer.audience.location, icon: Globe },
                      { label: 'Ages', val: influencer.audience.ageRange, icon: Users },
                      { label: 'Gender', val: influencer.audience.genderSplit, icon: Heart },
                      { label: 'Interests', val: influencer.audience.interests.join(', '), icon: Sparkles }
                    ].map((item, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                         <item.icon size={16} className="text-white/20" />
                         <div>
                            <p className="text-sm font-bold text-white truncate">{item.val}</p>
                            <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">{item.label}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-8">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Momentum</h3>
                 <div className="p-10 rounded-[48px] bg-white/[0.01] border border-white/5 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="space-y-2 relative z-10">
                       <div className="flex items-center gap-3 text-green-400">
                          <TrendingUp size={24} />
                          <span className="text-3xl font-bold tabular-nums tracking-tighter">{influencer.momentum.value}</span>
                       </div>
                       <p className="text-sm text-white/60 font-light italic">{influencer.momentum.description}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 relative z-10">
                       <Activity size={24} />
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

const SmartMatchWizard: React.FC<{ onComplete: () => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, string>>({});

  const steps = [
    { title: "What are you building?", options: ['Launch', 'Community', 'Product', 'Content Series'] },
    { title: "Who do you want to reach?", options: ['Design', 'Tech', 'Wellness', 'Culture', 'Web3'] },
    { title: "How fast?", options: ['This week', 'This month', 'Evergreen'] }
  ];

  const handleSelect = (opt: string) => {
    setSelections({ ...selections, [step]: opt });
    if (step < steps.length) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#121212] border border-white/10 rounded-[48px] p-12 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 space-y-12">
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/10'}`} />)}
             </div>
             <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
               <h3 className="text-4xl font-bold text-white tracking-tight">{steps[step-1].title}</h3>
               <div className="grid grid-cols-1 gap-3">
                  {steps[step-1].options.map(opt => (
                    <button 
                      key={opt} onClick={() => handleSelect(opt)}
                      className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all text-left"
                    >
                       <span className="text-lg font-medium text-white/60 group-hover:text-white">{opt}</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-purple-500 transition-colors shadow-[0_0_10px_#a855f7]" />
                    </button>
                  ))}
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const InfluencerCard: React.FC<{ influencer: Influencer; onClick: () => void }> = ({ influencer, onClick }) => (
  <motion.div 
    whileHover={{ y: -4 }} onClick={onClick}
    className="group relative p-8 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden cursor-pointer hover:bg-white/[0.04] transition-all duration-700"
  >
    <div className="space-y-8 relative z-10">
      <div className="flex items-start justify-between">
         <div className="relative">
            <div className="absolute -inset-2 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
            <div className="relative w-24 h-24 rounded-full p-1 bg-black border border-white/20 overflow-hidden shadow-2xl">
               <img src={influencer.img} className="w-full h-full rounded-full object-cover transition-all group-hover:scale-105" alt="" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-[#121212] shadow-lg">
               <ShieldCheck size={12} />
            </div>
         </div>
         <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
               {influencer.platforms.map(p => <PlatformIcon key={p.platform} type={p.platform} />)}
            </div>
            <span className="text-[10px] font-bold text-white/40 tracking-widest">{influencer.followerCountCombined} Combined</span>
         </div>
      </div>

      <div className="space-y-1">
         <h4 className="text-2xl font-bold text-white tracking-tight">{influencer.name}</h4>
         <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{influencer.category}</span>
      </div>

      <div className="flex flex-col gap-3">
         <p className="text-sm text-white/40 font-light italic leading-relaxed line-clamp-2">"{influencer.oneLiner}"</p>
         <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400/80 uppercase tracking-widest">
            <Star size={12} fill="currentColor" /> {influencer.credibilitySignal}
         </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${influencer.momentum.trend === 'up' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-gray-500'}`} />
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{influencer.momentum.description}</span>
         </div>
         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={16} className="text-white/40" />
         </div>
      </div>
    </div>
  </motion.div>
);

const AuraNode: React.FC<{ influencer: Influencer; onClick: () => void; isMatched?: boolean }> = ({ influencer, onClick, isMatched }) => {
  const [isHovered, setIsHovered] = useState(false);
  const size = 64 * influencer.aura.sizeScalar;
  const color = CATEGORY_COLORS[influencer.category];

  return (
    <motion.div 
      layout layoutId={`node-${influencer.id}`}
      onClick={onClick} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
      className={`absolute z-20 cursor-pointer transition-all duration-1000 ${isMatched === false ? 'opacity-10 grayscale blur-sm' : 'opacity-100'}`}
      animate={{ scale: isMatched ? 1.2 : 1 }}
    >
      <div className="relative flex items-center justify-center">
         {/* Living Glow */}
         <motion.div 
            className="absolute rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: color, width: size * 1.8, height: size * 1.8 }}
            animate={{ 
               scale: [1, 1.1, 1], 
               opacity: isHovered ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 6 / influencer.aura.pulseSpeed, repeat: Infinity }}
         />
         {/* Core */}
         <div 
           className="relative z-10 rounded-full p-[2px] bg-black border border-white/20 overflow-hidden shadow-2xl transition-all duration-700"
           style={{ width: size, height: size, filter: isHovered ? 'grayscale(0)' : 'grayscale(1)' }}
         >
            <img src={influencer.img} className="w-full h-full rounded-full object-cover" alt="" />
         </div>

         {/* Presence Hint */}
         <AnimatePresence>
            {isHovered && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-6 bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 text-center shadow-2xl whitespace-nowrap">
                  <p className="text-sm font-bold text-white tracking-tight">{influencer.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{influencer.momentum.description}</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- MAIN HUB ---

const InfluencerPartnerHubView: React.FC<{ onNavigate?: (view: DashboardView, context?: any) => void }> = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [viewMode, setViewMode] = useState<'Grid' | 'Map'>('Grid');
  const [activeMode, setActiveMode] = useState<typeof DISCOVERY_MODES[number]>('Spotlight');
  const [showSmartMatch, setShowSmartMatch] = useState(false);
  const [matchFilter, setMatchFilter] = useState<string | null>(null);

  const matchedIds = useMemo(() => {
    if (!matchFilter) return null;
    // Simulation: match top 2
    return [1, 3]; 
  }, [matchFilter]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-20 overflow-hidden font-sans selection:bg-purple-500/20 relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-purple-950/10 blur-[200px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-blue-950/10 blur-[180px] rounded-full" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-24 pb-40">
         
         {/* Demo Banner */}
         <div className="absolute top-0 right-0 text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">
            Demo Mode • All actions simulated
         </div>

         {/* Header */}
         <header className="flex flex-col gap-12 border-b border-white/5 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12">
               <div className="space-y-4">
                  <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white">Partners</h1>
                  <p className="text-2xl text-white/20 font-light tracking-tight italic">Discover creators your audience already trusts.</p>
               </div>
               
               <div className="flex items-center gap-4">
                  {/* View Mode Switcher */}
                  <div className="p-1 rounded-full bg-white/5 border border-white/10 flex gap-1">
                     <button onClick={() => setViewMode('Grid')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'Grid' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
                        <LayoutGrid size={14} /> Spotlight
                     </button>
                     <button onClick={() => setViewMode('Map')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'Map' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
                        <MapIcon size={14} /> Explore Aura
                     </button>
                  </div>
                  
                  {/* Primary Feature: Smart Match */}
                  <button 
                    onClick={() => setShowSmartMatch(true)}
                    className="group relative px-10 py-4 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                     <Sparkles size={16} className="text-purple-600 animate-pulse" />
                     Smart Match
                  </button>
               </div>
            </div>

            {/* Discovery Modes */}
            <div className="flex flex-wrap gap-2">
               {DISCOVERY_MODES.map(mode => (
                  <button 
                    key={mode} onClick={() => { setActiveMode(mode); setMatchFilter(null); }}
                    className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${activeMode === mode ? 'bg-purple-600 text-white border-purple-500 shadow-xl' : 'bg-white/5 text-white/30 border-white/5 hover:border-white/10 hover:text-white'}`}
                  >
                     {mode}
                  </button>
               ))}
               {matchFilter && (
                 <button onClick={() => setMatchFilter(null)} className="px-8 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    Matched Result <X size={10} />
                 </button>
               )}
            </div>
         </header>

         {/* Discovery Surface */}
         {viewMode === 'Grid' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
               <div className="flex items-center justify-between">
                  <div className="relative w-full max-w-md group">
                     <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
                     <input type="text" placeholder="Search focus..." className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-16 pr-8 text-sm font-light placeholder:text-white/10 focus:outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-full">
                     {CATEGORIES.map(c => <button key={c} className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">{c}</button>)}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {MOCK_INFLUENCERS.filter(inf => !matchedIds || matchedIds.includes(inf.id)).map(inf => (
                    <InfluencerCard key={inf.id} influencer={inf} onClick={() => setSelectedInfluencer(inf)} />
                  ))}
               </div>
            </motion.div>
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[800px] flex items-center justify-center">
               <div className="absolute inset-0 border border-white/5 rounded-full scale-75 opacity-10 animate-pulse-slow" />
               <div className="absolute inset-0 border border-white/5 rounded-full scale-50 opacity-5" />
               
               {/* Fixed Orbitals */}
               {MOCK_INFLUENCERS.map((inf, i) => {
                  const angle = (i / MOCK_INFLUENCERS.length) * 2 * Math.PI;
                  const radius = 240 + (Math.random() * 100);
                  const isMatched = matchedIds ? matchedIds.includes(inf.id) : undefined;
                  return (
                    <div key={inf.id} style={{ transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)` }}>
                       <AuraNode influencer={inf} onClick={() => setSelectedInfluencer(inf)} isMatched={isMatched} />
                    </div>
                  );
               })}

               <div className="text-center space-y-4 max-w-xs pointer-events-none opacity-20">
                  <Atom size={48} className="mx-auto animate-spin-slow" />
                  <p className="text-[9px] font-black uppercase tracking-[1em]">The Constellation</p>
               </div>
            </motion.div>
         )}

         {/* ENROLLMENT (Subtle) */}
         <footer className="pt-40 border-t border-white/5 flex flex-col items-center gap-12 opacity-50 hover:opacity-100 transition-opacity">
            <div className="text-center space-y-4">
               <h3 className="text-4xl font-bold tracking-tight">Are you a creator?</h3>
               <p className="text-lg text-white/30 font-light">Make your presence discoverable to aligned collaborators.</p>
            </div>
            <button className="px-12 py-6 rounded-full bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.6em] hover:bg-white hover:text-black hover:scale-105 transition-all">
               Join as a partner
            </button>
         </footer>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
         {selectedInfluencer && (
           <ProfileOverlay influencer={selectedInfluencer} onClose={() => setSelectedInfluencer(null)} />
         )}
         {showSmartMatch && (
            <SmartMatchWizard 
               onComplete={() => { setShowSmartMatch(false); setMatchFilter('active'); setViewMode('Map'); }} 
               onClose={() => setShowSmartMatch(false)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
};

export default InfluencerPartnerHubView;
