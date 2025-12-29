
import React from 'react';
import { useCommunityContext } from "../../store/useCommunityContext";
import { useCommunityReputationLedger, useCommunityZapsLedger } from "../../hooks/useCommunityLedgers";
import { TierProgressRing } from "../reputation/TierProgressRing";
import { TierBadge } from "../reputation/TierBadge";
import { Shield, Zap } from "lucide-react";

export function CommunityHeader({ userId }: { userId: string }) {
  const { activeCommunityId } = useCommunityContext();

  const rep = useCommunityReputationLedger(userId, activeCommunityId);
  const zaps = useCommunityZapsLedger(userId, activeCommunityId);

  if (!activeCommunityId) return null;

  if (!rep.data) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-black border border-white/5 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <TierProgressRing progress={rep.data.tierProgress} size={64} />
            <div className="absolute inset-2 bg-[#0F0F0F] rounded-full flex items-center justify-center border border-white/5 shadow-inner">
               <Shield size={24} className="text-purple-400/80" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
               <h4 className="text-2xl font-bold text-white tracking-tight">{rep.data.tierLabel}</h4>
               <TierBadge tier={rep.data.tier} />
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-3 font-medium uppercase tracking-widest">
               <span className="text-gray-300">{rep.data.standingLabel}</span>
               <span className="w-1 h-1 rounded-full bg-gray-800" />
               {zaps.data ? (
                 <span className="text-yellow-500/80 flex items-center gap-1">
                   <Zap size={10} fill="currentColor" /> {zaps.data.earnedSeason.toLocaleString()} ZAPS this season
                 </span>
               ) : (
                 <span>0 ZAPS</span>
               )}
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <div className={`px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] ${rep.data.decayState === 'fresh' ? 'text-green-400' : 'text-gray-500'}`}>
             {rep.data.decayState} Standing
          </div>
          <p className="text-[10px] text-gray-600 font-bold mt-2 uppercase tracking-widest">
            {Math.round(rep.data.tierProgress * 100)}% to next tier
          </p>
        </div>
      </div>
    </div>
  );
}
