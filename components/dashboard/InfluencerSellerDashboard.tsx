import React, { useState } from 'react';
import { 
  LayoutDashboard, ImageIcon, ShoppingBag, Wallet, 
  MessageCircle, Settings, ShieldCheck, Activity, 
  ChevronRight, ArrowUpRight, Atom, Waves, Heart
} from 'lucide-react';
import { DashboardView } from '../../types';
import { motion } from 'framer-motion';

const StatInstrument = ({ label, val, trend }: { label: string, val: string, trend?: string }) => (
  <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 flex flex-col justify-between h-44 hover:bg-white/[0.02] transition-all duration-700 group cursor-default">
     <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] group-hover:text-white/30 transition-colors">{label}</span>
        <Activity size={14} className="text-white/5 group-hover:text-white/20 transition-colors" />
     </div>
     <div>
        <div className="text-4xl font-bold text-white tracking-tighter mb-1">{val}</div>
        {trend && <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">{trend}</span>}
     </div>
  </div>
);

const InfluencerSellerDashboard: React.FC<{ onNavigate?: (view: DashboardView) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  const renderOverview = () => (
    <div className="space-y-16 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatInstrument label="Economic Flow" val="$12,450" trend="+12% Seasonal" />
          <StatInstrument label="Active Shards" val="4" />
          <StatInstrument label="Rating" val="4.9" />
          <StatInstrument label="Network Reach" val="1.2M" trend="High Signal" />
       </div>

       {/* Active Collaborations Control */}
       <div className="bg-white/[0.01] border border-white/5 rounded-[64px] p-16">
          <div className="flex justify-between items-center mb-12">
             <h3 className="text-3xl font-bold text-white tracking-tight">Active Workflows</h3>
             <button className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all">Audit History</button>
          </div>
          
          <div className="space-y-4">
             {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-700 cursor-pointer group">
                   <div className="w-16 h-16 rounded-2xl bg-black overflow-hidden mr-8 border border-white/5">
                      <img src={`https://picsum.photos/seed/brand${i}/100/100`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">Partner Workflow {i+1}</h4>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Awaiting review • 2d Remaining</p>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Status</span>
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20">Operational</span>
                      </div>
                      <ChevronRight size={20} className="text-white/10 group-hover:text-white transition-colors" />
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 lg:py-24 font-sans selection:bg-purple-500/20">
       
       <header className="flex flex-col md:flex-row justify-between items-end mb-32">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <ShieldCheck size={14} className="text-purple-500" /> System Authorized
             </div>
             <h1 className="text-7xl font-bold tracking-tighter text-white">Seller Centre</h1>
             <p className="text-xl text-white/20 font-light tracking-tight">Your professional workspace.</p>
          </div>
          <div className="flex items-center gap-3 mt-12 md:mt-0">
             <button className="px-10 py-4 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:scale-105 transition-all">View Identity</button>
             <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"><Settings size={20} /></button>
          </div>
       </header>

       {/* Instrument Selection */}
       <div className="flex items-center gap-2 overflow-x-auto pb-8 mb-24 border-b border-white/5 no-scrollbar">
          {[
             { id: 'Overview', icon: LayoutDashboard },
             { id: 'Portfolio', icon: ImageIcon },
             { id: 'Offers', icon: ShoppingBag },
             { id: 'Analytics', icon: Activity },
             { id: 'Wallet', icon: Wallet },
             { id: 'Inbox', icon: MessageCircle },
          ].map(tab => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id)} 
               className={`flex items-center gap-4 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-black' 
                    : 'text-white/20 hover:text-white'
               }`}
             >
               <tab.icon size={16} />
               {tab.id}
             </button>
          ))}
       </div>

       <div className="min-h-[500px]">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab !== 'Overview' && (
             <div className="py-48 text-center flex flex-col items-center gap-12 opacity-5">
                <Atom size={64} className="animate-spin-slow" />
                <span className="text-[11px] font-black uppercase tracking-[1em]">Shard Calibrating</span>
             </div>
          )}
       </div>

       <footer className="mt-64 pt-12 border-t border-white/5 text-center">
          <p className="text-[9px] font-black text-white/5 uppercase tracking-[0.6em]">System Version 5.0 • Identity Persists</p>
       </footer>

    </div>
  );
};

export { InfluencerSellerDashboard };