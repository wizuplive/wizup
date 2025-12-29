import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowUpRight, TrendingUp, Filter, Calendar, 
  Download, ChevronDown, CheckCircle2, AlertCircle,
  CreditCard, Wallet, Settings, Activity, ArrowRight, X, Loader2, Search, Gift, Users, Shield, Sparkles,
  Ticket, Heart, Lock, Key
} from 'lucide-react';
import { dataService, UserProfile } from '../../services/dataService';
import { zapsWalletService } from '../../services/zapsWalletService';
import { zapsSpendService } from '../../services/zapsSpend/zapsSpendService';
import { getRecognitionForWallet } from '../../services/zapsRecognition/selectors';
import { featureFlags } from '../../config/featureFlags';
import { motion, AnimatePresence } from 'framer-motion';

const WalletView: React.FC = () => {
  const [view, setView] = useState<'Overview' | 'Recognition' | 'Spend'>('Overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [attribution, setAttribution] = useState<Record<string, number>>({});
  const [recognitionEvents, setRecognitionEvents] = useState<any[]>([]);
  const [spendHistory, setSpendHistory] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = dataService.getCurrentUser();
    setUser(currentUser);
    setAttribution(zapsWalletService.getAttribution());
    
    if (currentUser) {
      if (featureFlags.ZAPS_RECOGNITION_SURFACES) {
        setRecognitionEvents(getRecognitionForWallet(currentUser.id));
      }
      if (featureFlags.ZAPS_SPEND_V1) {
        setSpendHistory(zapsSpendService.getSpendHistory(currentUser.id));
      }
    }
  }, []);

  const sortedAttribution = Object.entries(attribution).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5);

  const getSpendIcon = (category: string) => {
    switch (category) {
      case 'ACCESS': return <Key size={18} className="text-blue-400" />;
      case 'CONTRIBUTION': return <Heart size={18} className="text-pink-400" />;
      case 'PERK': return <Sparkles size={18} className="text-purple-400" />;
      case 'COMMITMENT': return <Shield size={18} className="text-amber-400" />;
      default: return <Ticket size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-20">
      <div className="max-w-5xl mx-auto space-y-12">
         <header className="flex justify-between items-end">
            <div>
               <h1 className="text-6xl font-bold tracking-tighter mb-2">{user?.walletBalance.toLocaleString() || '0'} <span className="text-2xl text-gray-600 font-medium">ZAP</span></h1>
               <p className="text-gray-500 font-medium">Presence & Access Balance</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/5">
               {['Overview', 'Recognition', 'Spend'].map(v => (
                 <button 
                  key={v} 
                  onClick={() => setView(v as any)} 
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${view === v ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                 >
                   {v}
                 </button>
               ))}
            </div>
         </header>

         {view === 'Overview' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in-up">
              <div className="lg:col-span-7 space-y-8">
                 <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8">Earning Provenance</h3>
                    <div className="space-y-4">
                       {sortedAttribution.length > 0 ? sortedAttribution.map(([cid, amt]) => (
                          <div key={cid} className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A] border border-white/5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20"><Shield size={16} /></div>
                                <span className="text-sm font-bold text-white truncate w-40">{cid}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{amt.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">ZAPS</span>
                             </div>
                          </div>
                       )) : (
                         <p className="text-sm text-gray-600 italic">No participation records yet.</p>
                       )}
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-5 space-y-6">
                 <div className="p-8 rounded-[40px] bg-[#121212] border border-white/5 flex flex-col justify-between h-64">
                    <div>
                       <TrendingUp size={24} className="text-green-400 mb-6" />
                       <h3 className="text-xl font-bold">Yield Potential</h3>
                       <p className="text-sm text-gray-500 mt-2">Your presence in 3 spaces is increasing your seasonal allocation weight by 1.15x.</p>
                    </div>
                    <button className="text-xs font-bold text-white hover:underline flex items-center gap-1">Protocol Lineage <ArrowRight size={12} /></button>
                 </div>
              </div>
           </div>
         )}

         {view === 'Recognition' && (
            <div className="animate-fade-in-up space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Recognition History</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase text-gray-400 hover:text-white transition-all flex items-center gap-2">
                       <Filter size={12} /> Filter
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  {recognitionEvents.length > 0 ? recognitionEvents.map((event) => (
                     <div key={event.id} className="group p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                              event.type === 'STEWARDSHIP' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                              event.type === 'CONTRIBUTION' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                              event.type === 'CIVIC' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                              'bg-white/5 border-white/10 text-gray-400'
                           }`}>
                              <Sparkles size={20} />
                           </div>
                           <div>
                              <div className="text-sm font-bold text-white mb-0.5">Participation acknowledged</div>
                              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                 In {event.communityId} • {new Date(event.occurredAt).toLocaleDateString()}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-bold text-white/40 uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
                              {event.reason.replace("_", " ").toLowerCase()}
                           </div>
                        </div>
                     </div>
                  )) : (
                    <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                       <Sparkles size={40} className="mx-auto text-gray-700 mb-4" />
                       <p className="text-gray-500 text-sm font-light">Recognition history will appear here.</p>
                    </div>
                  )}
               </div>
            </div>
         )}

         {view === 'Spend' && (
            <div className="animate-fade-in-up space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Spend History</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase text-gray-400 hover:text-white transition-all flex items-center gap-2">
                       <Filter size={12} /> Category
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  {spendHistory.length > 0 ? spendHistory.map((entry) => (
                     <div key={entry.id} className="group p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10`}>
                              {getSpendIcon(entry.category)}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-white mb-0.5">{entry.description}</div>
                              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                 Intent: {entry.category} • {new Date(entry.timestamp).toLocaleDateString()}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-bold text-zinc-400 tabular-nums mb-1">
                              -{entry.amount} ZAP
                           </div>
                           <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                              {entry.communityId}
                           </div>
                        </div>
                     </div>
                  )) : (
                    <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                       <Ticket size={40} className="mx-auto text-gray-700 mb-4" />
                       <p className="text-gray-500 text-sm font-light">Your spending record will appear here.</p>
                    </div>
                  )}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default WalletView;