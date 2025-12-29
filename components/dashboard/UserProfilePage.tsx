
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MessageCircle, 
  Zap, Activity, TrendingUp, 
  Sparkles, Atom,
  Network, Gem, ShieldCheck, Check, MoreHorizontal,
  Loader2
} from 'lucide-react';
import { Post, DashboardView } from '../../types';
import { activationService, IdentityMetrics } from '../../services/activationService';
import { SignalTab } from '../profile/SignalTab';
import { StreamTab } from '../profile/StreamTab';
import AuraBadgeLanding from '../profile/personalization/AuraBadgeLanding';
import { ThemeVariant } from '../profile/personalization/types';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW IMPORTS ---
import QuantumMessageModal from './QuantumMessageModal';
import QuantumZapModal from './QuantumZapModal';

// --- TYPES ---

interface UserProfilePageProps {
  user: any;
  onBack: () => void;
  onNavigate?: (view: DashboardView, context?: any) => void;
  onPostClick?: (post: Post) => void;
  onCommunityClick?: (community: any) => void;
  onUserClick?: (user: any) => void;
}

// --- MOCK DATA ---

const MOCK_USER_STATIC = {
  id: "1",
  name: "Sarah Jenkins",
  handle: "@designsarah",
  avatar: "https://picsum.photos/seed/p1/200/200",
  bio: "Architecting the next generation of digital interfaces. Founder of Design Systems Mastery.",
  badges: ["Creator", "Top Earner", "Verified"],
  role: "Quantum",
  crystals: [
    { id: 1, name: "Viral Spark", date: "Nov 2023", desc: "Post reached 100k views", rarity: "Legendary", color: "from-amber-400 to-orange-500", visible: true },
    { id: 2, name: "Community Pillar", date: "Oct 2023", desc: "Top 1% contributor", rarity: "Epic", color: "from-purple-400 to-indigo-500", visible: true },
    { id: 3, name: "Knowledge Source", date: "Sept 2023", desc: "Created 5 Courses", rarity: "Rare", color: "from-blue-400 to-cyan-500", visible: true },
  ]
};

// --- HOOKS ---

const useIdentityEngine = (userId: string) => {
  const [metrics, setMetrics] = useState<IdentityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [m, f] = await Promise.all([
        activationService.getIdentityMetrics(userId),
        activationService.checkFollowStatus(userId)
      ]);
      setMetrics(m);
      setIsFollowing(f);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const toggleFollow = async () => {
    setIsFollowing(prev => !prev);
    try {
      if (isFollowing) await activationService.unfollowUser(userId);
      else await activationService.followUser(userId);
    } catch (e) {
      setIsFollowing(prev => !prev);
      console.error(e);
    }
  };

  return { metrics, loading, isFollowing, toggleFollow };
};

// --- V5.0 COMPONENTS ---

const QuantumAtmosphere = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Deep Space Base */}
    <div className="absolute inset-0 bg-[#020202]" />
    
    {/* Ambient Breathing Gradients */}
    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] rounded-full bg-indigo-900/20 blur-[150px]" 
    />
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-purple-900/10 blur-[180px]" 
    />
    
    {/* Noise Texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
  </div>
);

const IdentityOrbitHeader = ({ 
  user, 
  isFollowing, 
  onFollow, 
  onZapClick,
  onMessage
}: { 
  user: any, 
  isFollowing: boolean, 
  onFollow: () => void,
  onZapClick: () => void,
  onMessage: () => void
}) => {
  const theme = user.personalization?.themeVariant as ThemeVariant || 'standard-classic';
  const isAura = theme.startsWith('aura');

  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      
      {/* Avatar Orbit */}
      <div className="relative mb-6 group cursor-pointer">
        {/* Polarized Light Ring */}
        <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-purple-500/50 via-cyan-400/50 to-white/50 blur-[2px] animate-[spin_8s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -inset-[3px] rounded-full bg-gradient-to-bl from-purple-500/50 via-cyan-400/50 to-white/50 blur-[2px] animate-[spin_12s_linear_infinite_reverse] opacity-70 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-32 h-32 rounded-full p-[4px] bg-[#050505] relative overflow-hidden z-10">
           <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} />
           {/* Lens Flare Overlay */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>

        {/* Quantum Role Badge */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 backdrop-blur-xl border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20"
        >
           <Atom size={12} className="text-cyan-300 animate-spin-slow" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{user.role || "Quantum"}</span>
        </motion.div>
      </div>

      {/* Identity Text */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
          {user.name}
        </h1>
        {isAura ? <AuraBadgeLanding /> : <ShieldCheck size={24} className="text-blue-400" />}
      </div>
      
      <p className="text-gray-400 text-sm font-medium mb-5 tracking-wide">{user.handle}</p>
      
      <p className="text-gray-300/90 text-sm max-w-lg leading-relaxed mb-8 font-light drop-shadow-sm">
        {user.bio}
      </p>

      {/* Glass-Metal Action Panel */}
      <div className="flex items-center gap-3 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
         <button 
            onClick={onFollow}
            className={`h-[40px] px-6 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
               isFollowing 
                  ? 'bg-transparent text-white border border-white/20 hover:bg-white/5' 
                  : 'bg-white text-black hover:scale-105'
            }`}
         >
            {isFollowing ? 'Following' : 'Follow'}
         </button>
         
         <button onClick={onMessage} className="h-[40px] w-[40px] rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white flex items-center justify-center hover:scale-105 active:scale-95 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle size={18} />
         </button>

         <button onClick={onZapClick} className="h-[40px] w-[40px] rounded-full bg-gradient-to-b from-[#2a2a2a] to-black border border-white/10 hover:border-purple-500/50 transition-all text-yellow-400 flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.1)] group">
            <Zap size={18} fill="currentColor" className="group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] transition-all" />
         </button>
         
         <button className="h-[40px] w-[40px] rounded-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white transition-colors flex items-center justify-center">
            <MoreHorizontal size={18} />
         </button>
      </div>
    </div>
  );
};

// --- RIGHT RAIL: DYNAMIC METRICS V5.0 ---

const MetricCardBase = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-lg">
     <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
     <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5 flex items-center gap-2 relative z-10">
        <Icon size={12} /> {title}
     </h3>
     <div className="relative z-10">
        {children}
     </div>
  </div>
);

const PresencePulseCard = ({ metrics }: { metrics: IdentityMetrics | null }) => {
  const score = metrics?.resonanceScore ?? 0;
  
  return (
    <MetricCardBase title="Presence Pulse" icon={Activity}>
       <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
             {/* Animated Rings */}
             <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
             <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full border-t-transparent animate-spin-slow" />
             <div className="text-xl font-bold text-white">{Math.round(score)}</div>
          </div>
          <div className="flex-1 space-y-2">
             <div className="flex justify-between text-[10px] font-medium text-gray-400">
                <span>Resonance</span>
                <span className="text-white">High</span>
             </div>
             {/* Audio-reactive bars simulation */}
             <div className="flex gap-1 h-6 items-end">
                {[40, 70, 30, 80, 50, 90, 60, 40].map((h, i) => (
                   <div 
                     key={i} 
                     className="w-1 bg-purple-500/50 rounded-full animate-pulse" 
                     style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
                   />
                ))}
             </div>
          </div>
       </div>
    </MetricCardBase>
  );
};

const RelationalTethers = ({ metrics }: { metrics: IdentityMetrics | null }) => {
  const strength = metrics?.connectionStrength || { sharedCommunities: 0, mutualConnections: 0, zapsExchanged: 0 };
  
  return (
    <MetricCardBase title="Connection Strength" icon={Network}>
       <div className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
             <span className="text-xs text-gray-400">Communities</span>
             <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[40%]" />
                </div>
                <span className="text-xs font-bold text-white tabular-nums">{strength.sharedCommunities}</span>
             </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
             <span className="text-xs text-gray-400">Mutuals</span>
             <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 w-[70%]" />
                </div>
                <span className="text-xs font-bold text-white tabular-nums">{strength.mutualConnections}</span>
             </div>
          </div>
       </div>
    </MetricCardBase>
  );
};

const MemoryCrystals = ({ crystals }: { crystals: typeof MOCK_USER_STATIC.crystals }) => (
  <MetricCardBase title="Memory Crystals" icon={Gem}>
     <div className="grid grid-cols-1 gap-2">
        {crystals.filter(c => c.visible).map(crystal => (
           <div key={crystal.id} className="group relative p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/20 transition-all cursor-default overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${crystal.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="flex justify-between items-center relative z-10">
                 <span className="text-xs font-bold text-white group-hover:tracking-wide transition-all duration-300">{crystal.name}</span>
                 <Gem size={10} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{crystal.date}</p>
           </div>
        ))}
     </div>
  </MetricCardBase>
);

// --- MAIN PAGE ---

const UserProfilePage: React.FC<UserProfilePageProps> = ({ 
  user: initialUser, 
  onBack, 
  onNavigate,
  onPostClick,
  onCommunityClick,
  onUserClick
}) => {
  const user = { ...MOCK_USER_STATIC, ...initialUser };
  const { metrics, loading, isFollowing, toggleFollow } = useIdentityEngine(user.id);
  const [activeTab, setActiveTab] = useState<'Stream' | 'Signal'>('Stream');
  
  // MODAL STATES
  const [showZapModal, setShowZapModal] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);

  // PREPARE USER DATA FOR MODALS
  const modalUser = {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    isOnline: true // Assuming online for demo
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white relative overflow-hidden selection:bg-purple-500/30">
      
      <QuantumAtmosphere />
      
      {/* QUANTUM MODALS */}
      <QuantumZapModal 
         isOpen={showZapModal} 
         onClose={() => setShowZapModal(false)} 
         targetName={user.name} 
         targetId={user.id} 
      />

      <QuantumMessageModal 
         isOpen={showDmModal} 
         onClose={() => setShowDmModal(false)} 
         user={modalUser}
      />

      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference pointer-events-none">
         <button onClick={onBack} className="flex items-center gap-2 text-white hover:opacity-70 transition-all pointer-events-auto group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-xs font-bold tracking-widest uppercase">Return</span>
         </button>
         <button className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors pointer-events-auto">Report</button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
         
         <IdentityOrbitHeader 
            user={user} 
            isFollowing={isFollowing} 
            onFollow={toggleFollow}
            onZapClick={() => setShowZapModal(true)}
            onMessage={() => setShowDmModal(true)}
         />

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 min-h-[800px]">
               
               {/* Frictionless Glide Tabs */}
               <div className="relative flex gap-8 mb-10 border-b border-white/5 pb-0">
                  {['Stream', 'Signal'].map((tab) => {
                     const isActive = activeTab === tab;
                     return (
                        <button 
                           key={tab} 
                           onClick={() => setActiveTab(tab as any)}
                           className={`relative pb-4 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                           {tab}
                           {isActive && (
                              <motion.div 
                                 layoutId="activeTab"
                                 className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_10px_white]"
                                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                           )}
                        </button>
                     );
                  })}
               </div>

               <AnimatePresence mode="wait">
                  <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3 }}
                  >
                     {activeTab === 'Stream' && (
                        <StreamTab 
                           userId={user.id} 
                           onPostClick={onPostClick}
                           onCommunityClick={onCommunityClick}
                           onUserClick={onUserClick}
                        />
                     )}

                     {activeTab === 'Signal' && (
                        <SignalTab metrics={metrics} loading={loading} />
                     )}
                  </motion.div>
               </AnimatePresence>
            </div>

            {/* Context Rail */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
               <div className="sticky top-24 space-y-6">
                  <RelationalTethers metrics={metrics} />
                  <PresencePulseCard metrics={metrics} />
                  <MemoryCrystals crystals={user.crystals} />
               </div>
            </div>

         </div>

      </div>

    </div>
  );
};

export default UserProfilePage;
