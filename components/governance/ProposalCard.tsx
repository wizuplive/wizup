import React from 'react';
import { Proposal } from '../../types/governanceTypes';
import { Shield, Users, Lock, Sparkles, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  canVote: boolean;
  onVoteClick: (proposal: Proposal) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, canVote, onVoteClick }) => {
  const getIcon = () => {
    switch (proposal.type) {
      case 'POLICY_INTENT_PRESET': return Shield;
      case 'SAFEGUARDS_FOCUS': return Lock;
      case 'ACCESS_MODEL': return Users;
      case 'STEWARD_PROMOTION': return Sparkles;
      default: return Shield;
    }
  };

  const Icon = getIcon();
  const isOpen = proposal.status === 'OPEN';

  return (
    <div className={`group relative p-6 rounded-[28px] bg-white/[0.02] border transition-all duration-500 ${
      isOpen ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 group-hover:text-white transition-colors">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{proposal.title}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mt-1">
              {proposal.type.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        {isOpen && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400 font-light leading-relaxed mb-8">
        {proposal.description}
      </p>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Clock size={12} />
          <span>Ends in 4 days</span>
        </div>
        
        {isOpen ? (
          canVote ? (
            <button 
              onClick={() => onVoteClick(proposal)}
              className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
            >
              Cast Decision <ChevronRight size={14} />
            </button>
          ) : (
            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              Steward-Led Process
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-green-500/50">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Enacted</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;