import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Sparkles, Globe, TrendingUp, ChevronDown, Lock, ShieldCheck, Heart, ArrowRight, Atom, Gem, Activity, BrainCircuit, Layout } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

interface Plan {
  id: string;
  title: string;
  price: number | 'Custom';
  desc: string;
  features: string[];
  zapsIncluded: string;
  aiCredits: string;
  aiAnchor: string;
  auraValue: string;
  btnText: string;
  color: string;
  isRecommended?: boolean;
  accentIcon: any;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    title: "Free",
    price: 0,
    desc: "Start a space. Learn how WIZUP feels.",
    color: "green",
    accentIcon: Globe,
    features: [
      "Create 1 dedicated space",
      "AI community setup guide",
      "Influencer hub (manual outreach)",
      "Basic moderation assistance",
      "Standard discussion"
    ],
    zapsIncluded: "500 ZAPs / month",
    aiCredits: "Limited AI assists",
    aiAnchor: "~5 setups or outlines",
    auraValue: "Aura unlocks at 5,000 ZAPs",
    btnText: "Get started",
  },
  {
    id: 'pro',
    title: "Pro",
    price: 29,
    desc: "Build faster. Reach people easier.",
    color: "blue",
    accentIcon: TrendingUp,
    features: [
      "Up to 3 dedicated spaces",
      "AI curriculum creation",
      "AI finds partners for you",
      "Priority moderation tools",
      "Discovery network placement"
    ],
    zapsIncluded: "3,000 ZAPs / month",
    aiCredits: "Moderate AI credits",
    aiAnchor: "~30 automations or matchings",
    auraValue: "3 Aura Passes / mo",
    btnText: "Upgrade to Pro",
  },
  {
    id: 'studio',
    title: "Studio",
    price: 79,
    desc: "Run communities like a craft.",
    color: "purple",
    accentIcon: Sparkles,
    isRecommended: true,
    features: [
      "Up to 10 dedicated spaces",
      "AI runs ops for you",
      "Advanced matchmaking engine",
      "Automated partner outreach",
      "Deeper community analytics"
    ],
    zapsIncluded: "10,000 ZAPs / month",
    aiCredits: "High AI credits",
    aiAnchor: "Runs your space on autopilot",
    auraValue: "15 Aura Passes / mo",
    btnText: "Move to Studio",
  },
  {
    id: 'enterprise',
    title: "Enterprise",
    price: 'Custom',
    desc: "When communities are infrastructure.",
    color: "zinc",
    accentIcon: Shield,
    features: [
      "Unlimited dedicated spaces",
      "Private agents, your rules",
      "Custom governance protocols",
      "Dedicated onboarding & support",
      "Advanced security & audit"
    ],
    zapsIncluded: "Custom allocation",
    aiCredits: "Custom terms",
    aiAnchor: "Unlimited within contract",
    auraValue: "Custom Aura allocation",
    btnText: "Contact us",
  }
];

const PlanCard: React.FC<{ plan: Plan; onSelect: (p: Plan) => void }> = ({ plan, onSelect }) => (
  <motion.div 
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`snap-center shrink-0 w-[88vw] md:w-auto md:flex-1 group relative flex flex-col p-8 md:p-12 rounded-[40px] md:rounded-[48px] bg-white/[0.02] border transition-all duration-700 h-full ${
      plan.isRecommended ? 'border-white/20 bg-white/[0.03] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]' : 'border-white/5'
    }`}
  >
    <div className="mb-8 md:mb-12">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 bg-${plan.color}-500/10 border border-${plan.color}-500/20`}>
        <plan.accentIcon size={22} className={`text-${plan.color}-400`} />
      </div>
      
      <div className="space-y-1 mb-8 md:mb-10">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{plan.title}</h3>
        {plan.isRecommended && (
          <p className="text-[9px] md:text-[10px] font-bold text-purple-400 uppercase tracking-widest">Most creators choose Studio</p>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-4 md:mb-6">
        <span className="text-4xl md:text-5xl font-medium tracking-tighter text-white">
          {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
        </span>
        {typeof plan.price === 'number' && <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] ml-2">/ mo</span>}
      </div>
      <p className="text-xs md:text-sm text-white/40 font-light leading-relaxed min-h-[32px]">{plan.desc}</p>
    </div>

    <div className="flex-1 space-y-8 md:space-y-12 mb-10 md:mb-12">
      <div className="space-y-4 md:space-y-6">
        <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">The Tools</h4>
        <ul className="space-y-4 md:space-y-5">
          {plan.features.slice(0, 5).map((feat, i) => (
            <li key={i} className="flex items-start gap-3 text-[12px] md:text-[13px] text-white/60 font-light leading-snug">
              <Check size={12} className="mt-0.5 text-white/20 shrink-0" />
              {feat}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 pt-6 md:pt-8 border-t border-white/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap size={14} className="text-yellow-500/40" />
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">ZAPs</p>
          </div>
          <p className="text-[11px] text-white/70 font-bold text-right truncate max-w-[50%]">{plan.zapsIncluded.split(' ')[0]}</p>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-purple-500/40" />
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">AI</p>
          </div>
          <p className="text-[11px] text-white/70 font-bold text-right truncate max-w-[50%]">{plan.aiCredits.split(' ')[0]}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Atom size={14} className="text-purple-400/60" />
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Aura</p>
          </div>
          <p className="text-[11px] text-white/70 font-bold text-right whitespace-normal md:whitespace-nowrap leading-tight">
            {plan.auraValue}
          </p>
        </div>
      </div>
    </div>

    <button 
      onClick={() => onSelect(plan)}
      className={`w-full py-4 md:py-5 rounded-full font-bold text-[9px] md:text-[10px] tracking-[0.4em] uppercase transition-all duration-700 active:scale-95 ${
        plan.isRecommended 
          ? 'bg-white text-black hover:bg-zinc-100 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)]' 
          : 'bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black'
      }`}
    >
      {plan.btnText}
    </button>
  </motion.div>
);

const PricingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section className="relative min-h-screen bg-black pt-32 md:pt-40 pb-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[100vh] bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.06)_0%,_transparent_70%)] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-16 md:mb-32 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 md:space-y-10"
          >
            <h1 className="text-[clamp(36px,9vw,80px)] font-bold text-white tracking-tighter leading-[1.1]">
              Pricing for building communities that last.
            </h1>
            <div className="space-y-3 md:space-y-4">
              <p className="text-base md:text-xl text-white/40 font-light tracking-tight text-balance leading-relaxed">
                Choose how much help you want. Everything else stays human.
              </p>
              <p className="text-[9px] md:text-[11px] font-bold text-white/20 uppercase tracking-[0.4em]">
                For creators. Members join spaces freely.
              </p>
            </div>
          </motion.div>
        </header>

        {/* Mobile: Horizontal Snap Carousel | Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-24 md:mb-32 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar -mx-6 px-6 pb-8 md:pb-0 items-stretch">
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
          ))}
        </div>

        {/* Accordion Style Comparison for Mobile */}
        <div className="flex flex-col items-center mb-32 md:mb-48">
            <button 
              onClick={() => setShowComparison(!showComparison)}
              className="group flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] text-white/30 hover:text-white transition-all"
            >
              Compare all features <ChevronDown size={14} className={`transition-transform duration-500 ${showComparison ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showComparison && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full max-w-4xl mt-12 overflow-hidden px-4 md:px-0"
                >
                   <div className="divide-y divide-white/5 border-y border-white/5 py-4">
                      {[
                        { label: 'Spaces', val: ['1', '3', '10', 'Unlimited'] },
                        { label: 'AI Assistance', val: ['Manual', 'Assisted', 'Ops Pilot', 'Private'] },
                        { label: 'ZAPs / Mo', val: ['500', '3,000', '10,000', 'Custom'] },
                        { label: 'Aura Passes', val: ['—', '3', '15', 'Custom'] },
                        { label: 'Network Discovery', val: ['Basic', 'Priority', 'Deep', 'Global'] }
                      ].map((row, i) => (
                        <div key={i} className="py-4 flex flex-col md:grid md:grid-cols-5 gap-4">
                           <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{row.label}</div>
                           <div className="grid grid-cols-4 md:col-span-4 text-center text-[11px] font-medium text-white/40">
                              {row.val.map((v, idx) => <span key={idx}>{v}</span>)}
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* ZAPs Explainer */}
        <div className="max-w-4xl mx-auto mb-16 md:mb-20 py-16 md:pt-20 md:pb-20 px-8 md:px-20 rounded-[48px] md:rounded-[64px] bg-white/[0.01] border border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 blur-[120px] pointer-events-none" />
          
          <Zap size={28} className="text-yellow-500/30 mx-auto mb-8 md:mb-10" />
          <h3 className="text-2xl md:text-5xl font-bold text-white mb-6 md:mb-8 tracking-tighter">What is ZAPs Energy?</h3>
          <p className="text-sm md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12 md:mb-16">
            ZAPs are how activity moves inside WIZUP. They make participation feel intentional, not transactional.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 text-left border-t border-white/5 pt-12 md:pt-16">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Globe size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-white tracking-wide uppercase">High-Intent Access</h4>
              <p className="text-[11px] text-white/30 leading-relaxed">Join premium, focused spaces without ads or noise.</p>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Heart size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-white tracking-wide uppercase">Recognize Value</h4>
              <p className="text-[11px] text-white/30 leading-relaxed">Reward great contributions and members instantly.</p>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <ShieldCheck size={14} />
              </div>
              <h4 className="text-[11px] font-bold text-white tracking-wide uppercase">Build Legitimacy</h4>
              <p className="text-[11px] text-white/30 leading-relaxed">Build reputation through visible participation.</p>
            </div>
          </div>
        </div>

        {/* Aura Profiles - Identity Layer */}
        <div 
          id="aura-section"
          className="max-w-4xl mx-auto mb-32 md:mb-48 pt-20 md:pt-28 pb-16 md:pb-20 px-8 md:px-20 rounded-[48px] md:rounded-[64px] bg-white/[0.03] border border-white/10 text-center relative overflow-hidden shadow-[0_40px_100px_-30px_rgba(168,85,247,0.1)] scroll-mt-24"
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full flex justify-center px-6">
             <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.6em] bg-black px-6 py-2 rounded-full border border-purple-500/20 shadow-xl max-w-full truncate">Identity Layer</span>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,_rgba(168,85,247,0.1)_0%,_transparent_60%)] blur-[100px] pointer-events-none" />
          
          <Atom size={32} className="text-purple-400/40 mx-auto mb-8 md:mb-10 animate-spin-slow" />
          <h3 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tighter">Aura Profiles</h3>
          <p className="text-purple-200/60 text-xs md:text-base font-medium tracking-wide uppercase mb-10">A living identity, unlocked through participation.</p>
          
          <p className="text-sm md:text-lg text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Aura Profiles represent the highest expression of presence on WIZUP. 
            They replace static profiles with a cinematic, breathing identity that reflects intent, history, and contribution — not follower counts.
          </p>

          <div className="bg-white/5 rounded-2xl p-5 md:p-6 mb-16 inline-block border border-white/5 backdrop-blur-sm">
             <p className="text-xs md:text-sm text-purple-200 font-medium">
               Unlocked by holding 5,000 ZAPs Energy, Aura Profiles are permanent once earned.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 text-left border-t border-white/5 pt-16">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white">
                 <Sparkles size={16} className="text-purple-400" />
                 <h4 className="text-sm font-bold tracking-tight">Atmospheric Aesthetics</h4>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed pl-7">Cinematic gradients and dimensional backgrounds that subtly evolve with your presence.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white">
                 <BrainCircuit size={16} className="text-blue-400" />
                 <h4 className="text-sm font-bold tracking-tight">Conscious Thought</h4>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed pl-7">A single, intentional statement that represents your current focus — not a feed.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white">
                 <Gem size={16} className="text-emerald-400" />
                 <h4 className="text-sm font-bold tracking-tight">Memory Crystals</h4>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed pl-7">Visual markers of meaningful milestones, stored as living history instead of metrics.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white">
                 <Activity size={16} className="text-rose-400" />
                 <h4 className="text-sm font-bold tracking-tight">Neural Matrix & Presence Pulse</h4>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed pl-7">A qualitative visualization of engagement, resonance, and contribution across the network.</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-3 text-white">
                 <Layout size={16} className="text-yellow-400" />
                 <h4 className="text-sm font-bold tracking-tight">Personalization Studio</h4>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed pl-7">Advanced themes, layouts, and identity physics — sealed once applied.</p>
            </div>
          </div>

          <div className="mt-20 opacity-40">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Aura Profiles are not purchased. They are earned.</p>
          </div>
        </div>

        {/* Footer Reassurance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 pt-24 border-t border-white/5">
           {[
             { label: "No lock-in", desc: "Cancel anytime. Your spaces and connections remain yours." },
             { label: "Private by default", desc: "Nothing is indexed or shared without explicit intent." },
             { label: "Human support", desc: "Direct access to real people, not automated ticket queues." }
           ].map((item, i) => (
             <div key={i} className="space-y-3">
                <h5 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">{item.label}</h5>
                <p className="text-[11px] text-white/20 leading-relaxed font-light">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <CheckoutModal 
            plan={selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
            onSuccess={() => {
              setSelectedPlan(null);
              onEnter();
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default PricingPage;