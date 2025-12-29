import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Shield, Zap, TrendingUp, Info } from 'lucide-react';
import { DashboardCommunity } from '../../types';
import { useCommunityContext } from '../../store/useCommunityContext';
import { dataService } from '../../services/dataService';
import { CommunityHeader } from '../community/CommunityHeader';
import { useCommunityZapsLedger } from '../../hooks/useCommunityLedgers';
import CommunityPulseChip from '../recognition/CommunityPulseChip';
import { RECOGNITION_FLAGS } from '../../config/featureFlagsRecognition';
import { featureFlags } from '../../config/featureFlags';
import { zapsTreasuryService } from '../../services/zapsTreasury/zapsTreasuryService';
import { TreasurySummary, TreasuryAction } from '../../services/zapsTreasury/types';
import TreasuryTransparency from '../community/TreasuryTransparency';

interface CommunityDetailViewProps {
  community: DashboardCommunity;
  onBack: () => void;
}

const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({ community, onBack }) => {
  const [activeTab, setActiveTab] = useState('Feed');
  const [treasury, setTreasury] = useState<TreasurySummary | null>(null);
  
  const user = dataService.getCurrentUser();
  const setActiveCommunityId = useCommunityContext(s => s.setActiveCommunityId);
  
  // Set authoritative community context on mount
  useEffect(() => {
    setActiveCommunityId(community.title);
    
    if (featureFlags.ZAPS_TREASURY_V1) {
        setTreasury(zapsTreasuryService.getSummary(community.title));
    }

    return () => setActiveCommunityId(null);
  }, [community.title, setActiveCommunityId]);

  // Scoped zaps for the sidebar info
  const zaps = useCommunityZapsLedger(user?.id || '', community.title);

  return (
    <div className="min-h-screen bg-black text-white pb-20 animate-fade-in-up">
      <div className="relative h-[45vh] min-h-[400px] group overflow-hidden">
        <img src={community.image} alt="" className="w-full h-full object-cover opacity-60 transition-transform duration-[3s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        
        <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16} /> Back</button>
          
          {RECOGNITION_FLAGS.ZAPS_RECOGNITION_SURFACES && (
            <CommunityPulseChip />
          )}
        </div>

        <div className="absolute bottom-0 w-full p-8 md:p-12 z-10">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-10">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F0F] relative shrink-0">
                 <img src={community.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 pb-2">
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{community.title}</h1>
                 <p className="text-lg text-gray-300 font-light max-w-2xl leading-relaxed">{community.description}</p>
              </div>
              <button className="px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest bg-white text-black hover:scale-105 transition-all shadow-2xl shadow-purple-500/20 active:scale-95">
                Enter Space
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
           {/* Authoritative scoped header */}
           <CommunityHeader userId={user?.id || ''} />
           
           <div className="flex gap-8 border-b border-white/5 overflow-x-auto no-scrollbar pb-0">
             {['Feed', 'Resources', 'Governance', 'About'].map(t => (
               <button key={t} onClick={() => setActiveTab(t)} className={`py-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                 {t}
                 {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
               </button>
             ))}
           </div>

           <div className="min-h-[400px] flex flex-col items-center justify-center text-center py-20 opacity-40">
              <Activity size={48} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{activeTab} Stream</h3>
              <p className="text-sm">Populating local community shards...</p>
           </div>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
           {/* New Treasury Transparency Surface */}
           {featureFlags.ZAPS_TREASURY_V1 && treasury && (
              <TreasuryTransparency communityId={community.title} userId={user?.id || ''} />
           )}

           <div className="p-8 bg-[#0F0F0F] border border-white/5 rounded-[32px] shadow-xl">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8">Provenance</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Season Rank</span>
                    <span className="text-sm font-bold text-white tabular-nums">#{Math.floor(Math.random() * 100) + 1} / 1.2k</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Local Yield</span>
                    <span className="text-sm font-bold text-green-400">+{Math.floor(Math.random() * 20)}%</span>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Lifetime ZAPS</span>
                    <span className="text-base font-bold text-yellow-400 tabular-nums">
                       {zaps.data ? zaps.data.earnedTotal.toLocaleString() : '0'}
                    </span>
                 </div>
              </div>
              <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                 View Proof of Work
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailView;