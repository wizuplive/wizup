
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Archive, Inbox, Filter, Settings, History, List, Crown, Siren, Activity } from 'lucide-react';
import { modCaseService } from '../../services/modCaseService';
import { modPolicyService } from '../../services/modPolicyService';
import { feedService } from '../../services/feedService';
import { ModCase, CaseStatus, SuggestedAction, EscalationLane } from '../../types/modTypes';
import ModCaseDrawer from './ModCaseDrawer';
import ModEventLog from './ModEventLog';
import SovereignConsole from './SovereignConsole';
import AiModsSettingsPanel from './AiModsSettingsPanel';
import AgentOverviewPanel from './AgentOverviewPanel';
import { Post } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';

interface ModConsoleProps {
  communityId: string;
}

const ModConsole: React.FC<ModConsoleProps> = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'log' | 'sovereign'>('queue');
  const [cases, setCases] = useState<ModCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ModCase | null>(null);
  const [selectedContent, setSelectedContent] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSovereign, setIsSovereign] = useState(false);
  const [currentMode, setCurrentMode] = useState<'ASSIST' | 'AUTOPILOT' | 'SOVEREIGN'>('ASSIST');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [caseData, policy] = await Promise.all([
        modCaseService.listCases(communityId),
        modPolicyService.get(communityId)
    ]);
    
    // Filter for OPEN cases and Sort by Urgency > Time
    const openCases = caseData.filter(c => c.status === CaseStatus.OPEN);
    
    // Urgency Weights for Sorting
    const urgencyWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const getUrgency = (c: ModCase) => c.escalation?.urgency || 'LOW';

    openCases.sort((a, b) => {
        const uA = urgencyWeight[getUrgency(a)];
        const uB = urgencyWeight[getUrgency(b)];
        
        // 1. Sort by Urgency (High to Low)
        if (uA !== uB) return uB - uA;
        
        // 2. Sort by Time (Newest First)
        return b.createdAt - a.createdAt;
    });

    setCases(openCases);
    
    const mode = policy.mode === 'OFF' ? 'ASSIST' : policy.mode; // Simplify for UI
    setCurrentMode(mode as any);
    setIsSovereign(mode === 'SOVEREIGN');
    
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'queue') {
        loadData();
    }
  }, [communityId, activeTab]);

  // Load content when a case is selected
  useEffect(() => {
    const fetchContent = async () => {
        if (selectedCase) {
            const allPosts = await feedService.getPosts(communityId);
            const post = allPosts.find(p => String(p.id) === selectedCase.contentId);
            setSelectedContent(post || null);
        } else {
            setSelectedContent(null);
        }
    };
    fetchContent();
  }, [selectedCase, communityId]);

  const handleCaseResolve = async () => {
      if (selectedCase) {
          setCases(prev => prev.filter(c => c.id !== selectedCase.id));
          setSelectedCase(null);
          loadData();
      }
  };

  const handlePanicPause = async () => {
      // Revert to ASSIST mode
      const policy = await modPolicyService.get(communityId);
      await modPolicyService.set({ ...policy, mode: 'ASSIST' });
      setIsSovereign(false);
      setCurrentMode('ASSIST');
      setActiveTab('queue');
      alert("⚠️ Sovereign Agent Paused. Reverted to Assist Mode.");
  };

  const getLaneBadge = (lane: EscalationLane | undefined) => {
      if (!lane || lane === EscalationLane.NORMAL_REVIEW) return null;
      
      if (lane === EscalationLane.PRIORITY_REVIEW) {
          return (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                  <Siren size={8} /> Priority
              </span>
          );
      }
      if (lane === EscalationLane.SENSITIVE_REVIEW) {
          return (
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                  Sensitive
              </span>
          );
      }
      return null;
  };

  // If in Sovereign View, render full console override
  if (activeTab === 'sovereign') {
      return <SovereignConsole onBack={() => setActiveTab('queue')} onPanicPause={handlePanicPause} />;
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#050505] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
      
      {/* SETTINGS PANEL SLIDE-OVER */}
      <AnimatePresence>
        {showSettings && (
            <div className="absolute inset-0 z-50 pointer-events-none">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowSettings(false)} />
                <div className="pointer-events-auto h-full">
                    <AiModsSettingsPanel communityId={communityId} onClose={() => { setShowSettings(false); loadData(); }} />
                </div>
            </div>
        )}
      </AnimatePresence>

      {/* AGENT OVERVIEW MODAL */}
      <AnimatePresence>
        {showOverview && (
            <AgentOverviewPanel onClose={() => setShowOverview(false)} mode={currentMode} />
        )}
      </AnimatePresence>

      {/* LEFT PANEL: NAVIGATION & LIST */}
      <div className="w-[360px] flex flex-col border-r border-white/5 bg-[#0A0A0A] shrink-0">
         
         {/* Header & Tabs */}
         <div className="p-6 pb-0 border-b border-white/5 bg-[#0A0A0A] z-10">
            <div className="flex items-start justify-between mb-4">
                <div>
                   <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      AI Mods 
                      {isSovereign && <Crown size={12} className="text-amber-400 fill-amber-400" />}
                   </h2>
                   {/* V3: Status Click Trigger */}
                   <button 
                     onClick={() => setShowOverview(true)}
                     className="text-[10px] text-gray-500 font-medium hover:text-white transition-colors flex items-center gap-1.5"
                   >
                      <div className={`w-1.5 h-1.5 rounded-full ${isSovereign ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                      {isSovereign ? 'Sovereign Agent Active' : currentMode === 'AUTOPILOT' ? 'Autopilot Active' : 'Assist Mode Active'}
                   </button>
                </div>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                   <Settings size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-4">
                <button 
                    onClick={() => { setActiveTab('queue'); setSelectedCase(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        activeTab === 'queue' 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <List size={12} strokeWidth={2.5} /> Queue
                    {cases.length > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-[9px]">{cases.length}</span>}
                </button>
                <button 
                    onClick={() => { setActiveTab('log'); setSelectedCase(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        activeTab === 'log' 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <History size={12} strokeWidth={2.5} /> Log
                </button>
                {isSovereign && (
                    <button 
                        onClick={() => setActiveTab('sovereign')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all text-amber-400 hover:bg-amber-900/20"
                    >
                        <Crown size={12} strokeWidth={2.5} /> Console
                    </button>
                )}
            </div>
         </div>

         {/* List Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'queue' ? (
                <div className="p-3 space-y-2">
                    {loading ? (
                        <div className="p-8 text-center text-xs text-gray-600 animate-pulse">Syncing...</div>
                    ) : cases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                              <CheckCircle2 size={18} className="text-gray-600" />
                           </div>
                           <h3 className="text-sm font-medium text-gray-400 mb-1">All Clear</h3>
                           <p className="text-[10px] text-gray-600 max-w-[200px] leading-relaxed">
                              No open cases requiring your attention.
                           </p>
                        </div>
                    ) : (
                        cases.map(c => (
                           <div 
                             key={c.id}
                             onClick={() => setSelectedCase(c)}
                             className={`
                                group p-4 rounded-xl border cursor-pointer transition-all duration-300 relative
                                ${selectedCase?.id === c.id 
                                    ? 'bg-white/10 border-white/10 shadow-lg' 
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
                             `}
                           >
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        c.severity === 'HIGH' ? 'bg-amber-400' : 
                                        c.severity === 'MED' ? 'bg-amber-600' : 'bg-gray-500'
                                    }`} />
                                    <span className="text-xs font-bold text-white">Suggested: {c.suggestedAction === SuggestedAction.HOLD ? 'Hide Content' : c.suggestedAction === SuggestedAction.NOTE ? 'Add Warning' : 'Review'}</span>
                                  </div>
                                  {getLaneBadge(c.escalation?.lane)}
                              </div>
                              
                              <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 pl-4.5">
                                 {c.rationale}
                              </p>
                              
                              <div className="pl-4.5 flex items-center gap-2 text-[9px] text-gray-600 font-medium uppercase tracking-wider">
                                 <span>{c.contentType}</span>
                                 <span>•</span>
                                 <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                           </div>
                        ))
                    )}
                </div>
            ) : (
                <ModEventLog communityId={communityId} />
            )}
         </div>
      </div>

      {/* RIGHT PANEL: DETAILS OR EMPTY STATE */}
      <div className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col">
         {selectedCase ? (
             <ModCaseDrawer 
                modCase={selectedCase} 
                content={selectedContent}
                onClose={() => setSelectedCase(null)} 
                onResolve={handleCaseResolve}
             />
         ) : (
             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="text-center">
                    {activeTab === 'queue' ? (
                        <ShieldCheck size={64} className="mx-auto text-gray-700 mb-4" />
                    ) : (
                        <History size={64} className="mx-auto text-gray-700 mb-4" />
                    )}
                    <p className="text-sm text-gray-500 font-medium">
                        {activeTab === 'queue' ? 'Select a case to review' : 'Select a log entry'}
                    </p>
                    {activeTab === 'log' && (
                        <p className="text-[10px] text-gray-600 mt-2 max-w-xs mx-auto">
                            Event logs are read-only records of actions taken by you or the AI.
                        </p>
                    )}
                </div>
             </div>
         )}
      </div>

    </div>
  );
};

export default ModConsole;
