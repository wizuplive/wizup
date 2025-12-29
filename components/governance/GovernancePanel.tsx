import React, { useState, useEffect } from 'react';
import { Proposal, GovernanceProfile } from '../../types/governanceTypes';
import { proposalService } from '../../services/proposalService';
import { voteService } from '../../services/voteService';
import { governanceWeightService } from '../../services/governanceWeightService';
import { dataService } from '../../services/dataService';
import ProposalCard from './ProposalCard';
import VoteDrawer from './VoteDrawer';
import { AnimatePresence } from 'framer-motion';
import { Info, Shield, History, Activity } from 'lucide-react';

interface GovernancePanelProps {
  communityId: string;
}

const GovernancePanel: React.FC<GovernancePanelProps> = ({ communityId }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [profile, setProfile] = useState<GovernanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const loadData = async () => {
    setLoading(true);
    const user = dataService.getCurrentUser();
    if (!user) return;

    try {
      const [p, prof] = await Promise.all([
        proposalService.listProposals(communityId),
        governanceWeightService.computeProfile(communityId, user.id)
      ]);
      setProposals(p);
      setProfile(prof);
    } catch (e) {
      console.warn("Governance services offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    const seed = async () => {
        const existing = await proposalService.listProposals(communityId);
        if (existing.length === 0) {
            await proposalService.createProposal({
                communityId,
                type: 'POLICY_INTENT_PRESET',
                title: "Shift Moderation Posture to Standard",
                description: "The community has matured. We propose moving from Relaxed to Standard policy to preserve high-signal discussions while maintaining open debate.",
                createdBy: 'steward_system',
                parameters: { preset: 'STANDARD' }
            });
            loadData();
        }
    };
    seed();
  }, [communityId]);

  const handleCastVote = async (choice: 'YES' | 'NO') => {
    const user = dataService.getCurrentUser();
    if (!user || !selectedProposal) return;
    
    await voteService.castVote(selectedProposal, user.id, choice);
    await loadData();
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-50">
        <div className="h-10 w-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Resonance Syncing</span>
    </div>
  );

  const activeProposals = proposals.filter(p => p.status === 'OPEN');
  const pastProposals = proposals.filter(p => p.status !== 'OPEN');
  const canVote = (profile?.computedWeight || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto py-10 animate-fade-in-up">
      <AnimatePresence>
        {selectedProposal && (
          <VoteDrawer 
            proposal={selectedProposal} 
            onClose={() => setSelectedProposal(null)} 
            onCast={handleCastVote} 
          />
        )}
      </AnimatePresence>

      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400">
              <Shield size={20} strokeWidth={1.5} />
           </div>
           <h2 className="text-3xl font-medium text-white tracking-tight">Governance</h2>
        </div>
        <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-xl">
           <div className="flex items-start gap-4">
              <Info size={18} className="text-purple-400 mt-1 shrink-0" />
              <div className="space-y-4">
                 <p className="text-sm text-gray-300 leading-relaxed font-light">
                    Participation in community decisions is reserved for members who have established significant presence and trust.
                 </p>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Authority</span>
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                         canVote ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-gray-600'
                       }`}>
                          {canVote ? 'Sufficient' : 'Observer'}
                       </span>
                    </div>
                    {profile?.decayState === 'DAMPENED' && (
                       <div className="flex items-center gap-2 text-[9px] text-amber-500/70 font-medium">
                          <Activity size={10} />
                          <span>Drift protection active (Inactive)</span>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </header>

      <section className="mb-20">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8 pl-4">Active Decisions</h3>
        {activeProposals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeProposals.map(p => (
              <ProposalCard 
                key={p.id} 
                proposal={p} 
                canVote={canVote} 
                onVoteClick={setSelectedProposal} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-[32px]">
             <p className="text-gray-600 font-light text-sm italic">The space is currently stable. No decisions pending.</p>
          </div>
        )}
      </section>

      {pastProposals.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8 pl-4">
             <History size={14} className="text-gray-600" />
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Decision History</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pastProposals.map(p => (
              <ProposalCard 
                key={p.id} 
                proposal={p} 
                canVote={false} 
                onVoteClick={() => {}} 
              />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-32 pt-12 border-t border-white/5 text-center">
         <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] font-bold">
            Governance v1 — Powered by Reputation Protocol
         </p>
      </footer>
    </div>
  );
};

export default GovernancePanel;