import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Clock, CheckCircle2, Zap, Star, PlayCircle, 
  MessageCircle, Layers, ArrowRight, ShieldCheck, Globe,
  CreditCard, Wallet, ChevronDown, Calendar, Eye
} from 'lucide-react';
import { DashboardCommunity } from '../../types';
import { zapsSpendService } from '../../services/zapsSpend/zapsSpendService';
import { dataService } from '../../services/dataService';
import { motion, useScroll, useTransform } from 'framer-motion';

interface CommunitySalesViewProps {
  community: DashboardCommunity;
  isPreview?: boolean;
  onJoin: () => void;
  onBack: () => void;
}

const FeatureTile = ({ icon: Icon, title, subtitle, isPreview }: { icon: any, title: string, subtitle: string, isPreview?: boolean }) => (
  <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 transition-all cursor-default group relative overflow-hidden ${isPreview ? 'hover:bg-white/[0.07]' : 'hover:bg-white/10'}`}>
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
    <p className="text-xs text-gray-400 leading-snug">{subtitle}</p>
    
    {isPreview && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
            <ShieldCheck size={16} className="text-white/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Join to access</span>
        </div>
    )}
  </div>
);

const ChannelRow = ({ name, desc, active, isPreview }: { name: string, desc: string, active?: boolean, isPreview?: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border border-transparent transition-all group ${isPreview ? 'cursor-default hover:bg-white/[0.03]' : 'hover:bg-white/5 cursor-pointer'}`}>
    <div className="flex items-center gap-4 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}`}>
            <span className="text-lg font-light">#</span>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-white">{name}</h5>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
    </div>
    {isPreview && (
        <span className="text-[9px] font-black text-white/5 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pr-2">Join to enter</span>
    )}
  </div>
);

const CommunitySalesView: React.FC<CommunitySalesViewProps> = ({ community, isPreview = false, onJoin, onBack }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleZapsUnlock = async () => {
    if (isPreview) {
        onJoin(); // Hybrid demo: join immediately
        return;
    }

    const user = dataService.getCurrentUser();
    if (!user) return;

    setIsProcessing(true);
    const result = await zapsSpendService.executeSpend({
      userId: user.id,
      communityId: community.title,
      category: "ACCESS",
      amount: 500,
      description: `Unlocked access to ${community.title}`
    });

    if (result.success) {
      onJoin();
    } else {
      alert(result.error);
    }
    setIsProcessing(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white pb-20 relative animate-fade-in-up selection:bg-purple-500/30">
      
      {/* 👁 PREVIEW MODE INDICATOR */}
      {isPreview && (
        <motion.div 
            style={{ opacity: indicatorOpacity }}
            className="sticky top-2 z-[60] w-full flex justify-center pointer-events-none"
        >
            <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/90 border border-white/10 rounded-full shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-r border-white/10 pr-3">
                    <Eye size={10} className="text-purple-400" /> Preview Mode
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">You’re viewing a Space preview. Join to participate.</span>
            </div>
        </motion.div>
      )}

      {/* --- CINEMATIC HERO --- */}
      <div className="relative w-full h-[65vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={community.image} 
            alt={community.title} 
            className="w-full h-full object-cover opacity-80 scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 mix-blend-overlay" />
        </div>

        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all group"
        >
          <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="absolute bottom-0 w-full z-20 px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-6 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
               {community.isFeatured && (
                 <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold tracking-widest uppercase">
                   Featured Premiere
                 </span>
               )}
               <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase">
                 {community.category}
               </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-white mb-6 leading-tight max-w-4xl animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
              {community.title}
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl leading-relaxed mb-8 animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
              {community.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium animate-slide-up-fade" style={{ animationDelay: '0.4s' }}>
               <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span>{community.members} Members</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-gray-600" />
               <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>2-4 hrs/week</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-gray-600" />
               <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border border-black bg-gray-800 overflow-hidden">
                           <img src={`https://picsum.photos/seed/u${i}/100/100`} className="w-full h-full object-cover" alt="" />
                        </div>
                     ))}
                  </div>
                  <span className="text-green-400">+142 Online</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
           <section className="space-y-6">
              <h3 className="text-2xl font-medium text-white">About This Community</h3>
              <div className="prose prose-invert max-w-none text-gray-400 font-light leading-relaxed text-lg">
                 <p>
                    Welcome to the ultimate ecosystem for {community.category.toLowerCase()} professionals. 
                    We've stripped away the noise to focus on what matters: actionable insights, 
                    high-value networking, and resource sharing that actually moves the needle.
                 </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">You'll Learn How To</h4>
                    <ul className="space-y-3">
                       {['Master the core principles', 'Scale your systems efficiently', 'Collaborate with top 1% talent'].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                             <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Who This Is For</h4>
                    <ul className="space-y-3">
                       {['Creators & Builders', 'Product Designers', 'Growth Hackers'].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                             <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </section>

           <section>
              <h3 className="text-2xl font-medium text-white mb-8">What You Get Inside</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FeatureTile isPreview={isPreview} icon={PlayCircle} title="Live Sessions" subtitle="Weekly deep dives & Q&A" />
                 <FeatureTile isPreview={isPreview} icon={Layers} title="Resource Library" subtitle="Templates, PDFs & Assets" />
                 <FeatureTile isPreview={isPreview} icon={MessageCircle} title="Private Chat" subtitle="High-signal discussions" />
                 <FeatureTile isPreview={isPreview} icon={Users} title="Cohorts" subtitle="Accountability groups" />
                 <FeatureTile isPreview={isPreview} icon={Star} title="Exclusive Drops" subtitle="Early access to tools" />
                 <FeatureTile isPreview={isPreview} icon={Zap} title="ZAP Rewards" subtitle="Earn while you learn" />
              </div>
           </section>

           <section>
              <h3 className="text-2xl font-medium text-white mb-8">Channel Structure</h3>
              <div className="bg-[#0F0F0F] border border-white/5 rounded-3xl p-2 space-y-1">
                 <ChannelRow isPreview={isPreview} name="Announcements" desc="Official updates & major drops." active />
                 <ChannelRow isPreview={isPreview} name="General Chat" desc="Day-to-day discussion & questions." active />
                 <ChannelRow isPreview={isPreview} name="Intros" desc="New members introduce themselves." />
                 <ChannelRow isPreview={isPreview} name="Resources" desc="Saved frameworks, PDFs, tools." />
                 <ChannelRow isPreview={isPreview} name="Events" desc="Upcoming sessions, replays." />
                 <ChannelRow isPreview={isPreview} name="Q&A" desc="Focused questions & expert answers." />
              </div>
           </section>

           <section className="pb-10">
              <h3 className="text-2xl font-medium text-white mb-8">Membership Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div 
                   onClick={handleZapsUnlock}
                   className="group relative p-6 rounded-3xl border border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20 cursor-pointer transition-all"
                 >
                    <div className="absolute top-4 right-4">
                       <div className="w-6 h-6 rounded-full border border-purple-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                       </div>
                    </div>
                    <Zap className="text-purple-400 mb-4" size={28} />
                    <h4 className="text-lg font-bold text-white mb-1">Pay with ZAPs</h4>
                    <p className="text-3xl font-medium text-white mb-4">500 <span className="text-sm text-purple-300 font-normal">ZAP</span></p>
                    <p className="text-xs text-purple-200/70 mb-6">Instant access using your earned participation balance.</p>
                    <button 
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm group-hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                       {isProcessing ? "Processing..." : "Unlock with ZAPs"}
                    </button>
                 </div>

                 <div className="group p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all opacity-60 hover:opacity-100">
                    <div className="absolute top-4 right-4">
                       <div className="w-6 h-6 rounded-full border border-white/20" />
                    </div>
                    <CreditCard className="text-white mb-4" size={28} />
                    <h4 className="text-lg font-bold text-white mb-1">Pay with Card</h4>
                    <p className="text-3xl font-medium text-white mb-4">$19 <span className="text-sm text-gray-400 font-normal">/ month</span></p>
                    <p className="text-xs text-gray-400 mb-6">Secure payment via Stripe. Cancel anytime.</p>
                    <button className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/10">
                       Subscribe
                    </button>
                 </div>
              </div>
           </section>
        </div>

        <div className="lg:col-span-4 relative">
           <div className={`space-y-6 transition-all duration-300 ${isSticky ? 'sticky top-24' : ''}`}>
              <div className="p-6 rounded-[32px] bg-[#0F0F0F] border border-white/10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <img src={community.image} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
                    <div>
                       <h3 className="font-bold text-white leading-tight">{community.title}</h3>
                       <div className="flex items-center gap-1 text-xs text-yellow-400 font-medium mt-1">
                          <Star size={12} fill="currentColor" /> 4.9 (1.2k reviews)
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Access</span>
                       <span className="font-medium text-white">Lifetime</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Certificate</span>
                       <span className="font-medium text-white">Included</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleZapsUnlock}
                   disabled={isProcessing}
                   className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                 >
                   {isProcessing ? "Processing..." : isPreview ? "Join Space" : "Join with ZAPs"} <ArrowRight size={16} />
                 </button>
                 <button className="w-full py-3 rounded-2xl bg-white/5 text-white font-medium text-xs hover:bg-white/10 transition-colors">
                   Preview Content
                 </button>
              </div>

              <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Meet Your Host</h4>
                 <div className="flex items-center gap-3 mb-3">
                    <img src={community.creator.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                    <div>
                       <div className="flex items-center gap-1">
                          <span className="font-bold text-white">{community.creator.name}</span>
                          {community.creator.verified && <ShieldCheck size={12} className="text-blue-400" />}
                       </div>
                       <span className="text-xs text-gray-400">Founder, WIZUP</span>
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Helping creators build sustainable digital ecosystems. Previously at Stripe & Airbnb.
                 </p>
                 <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><Globe size={14} /></button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><MessageCircle size={14} /></button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySalesView;