import React from 'react';
import { demoSpaces } from "../../services/demo/demoSpaces";
import { useCommunityReputationLedger, useCommunityZapsLedger } from "../../hooks/useCommunityLedgers";
import { TierBadge } from "../reputation/TierBadge";
import { TierProgressRing } from "../reputation/TierProgressRing";
import { Shield } from "lucide-react";

export function ProfileSpacesTab({ userId }: { userId: string }) {
  return (
    <div className="grid gap-4 animate-fade-in-up">
      {demoSpaces.map((s) => (
        <SpaceRow key={s.id} userId={userId} communityId={s.id} name={s.name} />
      ))}
    </div>
  );
}

// Fixed: Explicitly defined props interface and typed SpaceRow as a React.FC to properly support built-in props like 'key' when used in lists.
interface SpaceRowProps {
  userId: string;
  communityId: string;
  name: string;
}

const SpaceRow: React.FC<SpaceRowProps> = ({
  userId,
  communityId,
  name,
}) => {
  const rep = useCommunityReputationLedger(userId, communityId);
  const zaps = useCommunityZapsLedger(userId, communityId);

  return (
    <div className="flex items-center justify-between p-6 rounded-[32px] bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
      <div className="flex items-center gap-6">
        <div className="relative">
          <TierProgressRing progress={rep.data?.tierProgress ?? 0} size={56} />
          <div className="absolute inset-2 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
             <Shield size={20} className="text-purple-400/80" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">{name}</h4>
            {rep.data?.tier && <TierBadge tier={rep.data.tier} />}
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            {rep.data?.standingLabel ?? "Loading…"} • {rep.data?.decayState}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-white tabular-nums">
          {zaps.data ? `${zaps.data.earnedSeason.toLocaleString()}` : "—"} <span className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">ZAPS</span>
        </div>
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Season Earning</div>
      </div>
    </div>
  );
}
