
import React from 'react';
import { useCommunityContext } from "../../store/useCommunityContext";
import { useCommunityReputationLedger, useCommunityZapsLedger } from "../../hooks/useCommunityLedgers";
import { ENABLE_LEDGER_DEBUG } from "../../config/dev";

export function LedgerDebugPanel({ userId }: { userId: string }) {
  if (!ENABLE_LEDGER_DEBUG) return null;

  const { activeCommunityId } = useCommunityContext();

  // We use standard React Hooks, but we skip rendering if no context
  const rep = useCommunityReputationLedger(userId, activeCommunityId);
  const zaps = useCommunityZapsLedger(userId, activeCommunityId);

  if (!activeCommunityId) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[9999] w-[280px] rounded-2xl border border-red-500/30 bg-black/90 p-4 text-[10px] text-white/80 font-mono backdrop-blur-xl shadow-2xl">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
         <span className="font-bold text-red-400 uppercase tracking-widest">Ledger Debug</span>
         <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-gray-500">communityId:</span> <span className="text-white truncate max-w-[140px]">{activeCommunityId}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">repTier:</span> <span className="text-purple-400 font-bold">{rep.data?.tier || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">tierLabel:</span> <span className="text-gray-200">{rep.data?.tierLabel || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">progress:</span> <span className="text-gray-200">{Math.round((rep.data?.tierProgress || 0) * 100)}%</span></div>
          <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span className="text-gray-500">zapsSeason:</span> <span className="text-yellow-400 font-bold">{zaps.data?.earnedSeason.toLocaleString() || '0'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">zapsTotal:</span> <span className="text-yellow-200">{zaps.data?.earnedTotal.toLocaleString() || '0'}</span></div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/10 text-[8px] text-gray-600 text-center uppercase tracking-tighter">
         Simulation Layer Active
      </div>
    </div>
  );
}
