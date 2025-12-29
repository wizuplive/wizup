
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ToggleLeft, ToggleRight, Lock, 
  Info, X, AlertTriangle, Check, Shield, Eye,
  Zap, PlayCircle, PauseCircle, Activity, Sparkles, BrainCircuit,
  Crown, Fingerprint
} from 'lucide-react';
import { modPolicyService } from '../../services/modPolicyService';
import { autopilotEligibilityService } from '../../services/autopilotEligibilityService';
import { entitlementsService } from '../../services/entitlementsService';
import { ModPolicy, AutopilotEligibility, AutopilotState } from '../../types/modTypes';
import { motion, AnimatePresence } from 'framer-motion';
import PolicyIntentConfig from './PolicyIntentConfig';
import { PolicySeverity, PolicyCategory } from '../../types/policyTypes';

interface AiModsSettingsPanelProps {
  communityId: string;
  onClose: () => void;
}

const AiModsSettingsPanel: React.FC<AiModsSettingsPanelProps> = ({ communityId, onClose }) => {
  const [policy, setPolicy] = useState<ModPolicy | null>(null);
  const [eligibility, setEligibility] = useState<AutopilotEligibility | null>(null);
  const [uiState, setUiState] = useState<AutopilotState>('LOCKED');
  const [entitlements, setEntitlements] = useState(entitlementsService.get());
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  
  // State for the Enablement Confirmation Modal
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);
  const [showSovereignConfirm, setShowSovereignConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, e] = await Promise.all([
        modPolicyService.get(communityId),
        autopilotEligibilityService.evaluate(communityId)
      ]);
      setPolicy(p);
      setEligibility(e);
      setUiState(autopilotEligibilityService.getAutopilotState(p, e));
      setLoading(false);
    };
    load();
  }, [communityId]);

  const handleUpdate = useCallback(async (updates: Partial<ModPolicy>) => {
    if (!policy || !eligibility) return;
    const next = { ...policy, ...updates, updatedAt: Date.now() };
    setPolicy(next);
    
    // Recalculate UI State immediately
    setUiState(autopilotEligibilityService.getAutopilotState(next, eligibility));

    // Optimistic UI update, async save
    await modPolicyService.set(next);
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [policy, eligibility]);

  // Transition: ELIGIBLE/PAUSED -> ENABLED
  const handleEnableAutopilot = () => {
    setShowEnableConfirm(true);
  };

  const confirmEnable = () => {
    handleUpdate({ mode: 'AUTOPILOT' });
    setShowEnableConfirm(false);
  };

  // Transition: ENABLED -> PAUSED (Instant)
  const handlePauseAutopilot = () => {
    handleUpdate({ mode: 'ASSIST' });
  };

  // Transition: SOVEREIGN ENABLEMENT
  const handleEnableSovereign = () => {
    setShowSovereignConfirm(true);
  };

  const confirmSovereign = () => {
    handleUpdate({ mode: 'SOVEREIGN' });
    setShowSovereignConfirm(false);
  };

  // Dev Tool: Upgrade Plan
  const handleDevUpgrade = () => {
    entitlementsService.unlockEnterprise();
    setEntitlements(entitlementsService.get());
  }

  // --- Helpers for Intent Mapping ---
  // If policy lacks new fields (legacy), we map them on the fly for the UI
  const currentSeverity: PolicySeverity = policy?.severity || 
    (policy?.strictness ? (policy.strictness < 0.3 ? 'RELAXED' : policy.strictness > 0.7 ? 'STRICT' : 'STANDARD') : 'STANDARD');
    
  const currentCategories: PolicyCategory[] = policy?.categories || ['TOXICITY', 'SPAM', 'SCAM', 'LINK_RISK'];

  const handleIntentChange = (updates: { severity?: PolicySeverity; categories?: PolicyCategory[] }) => {
    handleUpdate(updates);
  };

  if (loading || !policy || !eligibility) return null;

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 flex flex-col"
    >
      {/* HEADER */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0A0A0A] z-20">
        <div>
          <h2 className="text-sm font-bold text-white">AI Mods</h2>
          <p className="text-[10px] text-gray-500 font-medium">Configure Intelligence Layer</p>
        </div>
        <div className="flex gap-2">
            {/* Dev Upgrade for Demo */}
            {entitlements.plan !== 'ENTERPRISE' && (
                <button onClick={handleDevUpgrade} className="p-1.5 text-[8px] bg-white/5 rounded border border-white/5 text-gray-500 hover:text-white uppercase font-bold">
                    Dev: Upgrade
                </button>
            )}
            <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors"
            >
            <X size={18} />
            </button>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
        
        {/* --- CONFIRMATION MODAL (Autopilot) --- */}
        <AnimatePresence>
            {showEnableConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
                    >
                        <div className="flex items-center gap-3 mb-4 text-purple-400">
                            <Shield size={20} />
                            <h3 className="text-sm font-bold text-white">Enable Autopilot?</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
                            You are delegating authority to the system to execute actions based on your established patterns.
                            <br/><br/>
                            You remain responsible for all automated decisions.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowEnableConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold text-xs hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmEnable}
                                className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                                Confirm & Enable
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* --- CONFIRMATION MODAL (Sovereign) --- */}
        <AnimatePresence>
            {showSovereignConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0f0f0f] border border-amber-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.1)] w-full max-w-sm"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Crown size={24} className="text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white text-center mb-2">Sovereign Authority</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-8 font-light text-center">
                            You are granting this agent <span className="text-amber-400 font-bold">autonomous execution</span> rights. 
                            It will act on its own accord to protect community health, simulating manual intervention when necessary.
                            <br/><br/>
                            This is a binding operational contract.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmSovereign}
                                className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
                            >
                                Accept & Activate
                            </button>
                            <button 
                                onClick={() => setShowSovereignConfirm(false)}
                                className="w-full py-3 rounded-xl bg-transparent text-gray-500 font-bold text-xs hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* 1. SOVEREIGN CARD (Enterprise Only) */}
        {entitlements.plan === 'ENTERPRISE' && (
            <section>
                <div className={`
                    rounded-2xl border p-1 relative overflow-hidden transition-all duration-500
                    ${policy.mode === 'SOVEREIGN' ? 'bg-amber-900/10 border-amber-500/40' : 'bg-white/5 border-white/10'}
                `}>
                    <div className="bg-[#0c0c0c] rounded-xl p-6 relative z-10 h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Crown size={16} className={policy.mode === 'SOVEREIGN' ? 'text-amber-400' : 'text-gray-500'} />
                                <span className={`text-xs font-bold uppercase tracking-widest ${policy.mode === 'SOVEREIGN' ? 'text-amber-400' : 'text-gray-500'}`}>Sovereign Mode</span>
                            </div>
                            {policy.mode === 'SOVEREIGN' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                        
                        {policy.mode === 'SOVEREIGN' ? (
                            <>
                                <h3 className="text-lg font-bold text-white mb-2">Agent is Autonomous</h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                    Operating in Shadow Mode v0. High-confidence actions are being executed. Audit trail active.
                                </p>
                                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-gray-300 font-bold text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <Activity size={14} /> Open Sovereign Console
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-gray-400 mb-2">Dormant</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                                    Enable to grant full autonomy. Requires calibration period.
                                </p>
                                <button 
                                    onClick={handleEnableSovereign}
                                    className="w-full py-3 rounded-xl border border-white/10 text-gray-300 font-bold text-xs hover:bg-white/5 transition-colors"
                                >
                                    Activate
                                </button>
                            </>
                        )}
                    </div>
                    {/* Golden Glow for Active State */}
                    {policy.mode === 'SOVEREIGN' && <div className="absolute inset-0 bg-amber-500/10 blur-xl pointer-events-none" />}
                </div>
            </section>
        )}

        {/* 2. AUTOPILOT STATUS CARD */}
        {policy.mode !== 'SOVEREIGN' && (
            <section>
                <div className={`
                    rounded-2xl border p-6 transition-all duration-500 relative overflow-hidden
                    ${uiState === 'LOCKED' ? 'bg-white/5 border-white/5' : ''}
                    ${uiState === 'ELIGIBLE' ? 'bg-purple-900/10 border-purple-500/30' : ''}
                    ${uiState === 'ENABLED' ? 'bg-green-900/10 border-green-500/30' : ''}
                    ${uiState === 'PAUSED' ? 'bg-amber-900/10 border-amber-500/30' : ''}
                `}>
                    
                    {/* State: LOCKED */}
                    {uiState === 'LOCKED' && (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-white/5 text-gray-500"><Lock size={18} /></div>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">Calibration</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Calibrating...</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                System is observing your manual decisions to establish alignment.
                            </p>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="relative w-2 h-2">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400">Observing...</span>
                            </div>
                        </>
                    )}

                    {/* State: ELIGIBLE */}
                    {uiState === 'ELIGIBLE' && (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300"><Sparkles size={18} /></div>
                                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest border border-purple-500/20 px-2 py-1 rounded bg-purple-500/10">Ready</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Ready to Automate</h3>
                            <p className="text-xs text-purple-100/70 leading-relaxed mb-6">
                                Sufficient alignment established. You may now delegate routine actions.
                            </p>
                            <button 
                                onClick={handleEnableAutopilot}
                                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:scale-[1.02] transition-transform shadow-lg"
                            >
                                Enable Autopilot
                            </button>
                        </>
                    )}

                    {/* State: ENABLED */}
                    {uiState === 'ENABLED' && (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-300"><Activity size={18} /></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Autopilot Active</h3>
                            <p className="text-xs text-green-100/70 leading-relaxed mb-6">
                                System is applying your established standards.
                            </p>
                            <button 
                                onClick={handlePauseAutopilot}
                                className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 font-bold text-xs hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Pause
                            </button>
                        </>
                    )}
                </div>
            </section>
        )}

        {/* 3. POLICY INTENT CONFIG (Phase 4) */}
        <section className={uiState === 'LOCKED' ? 'opacity-30 pointer-events-none filter grayscale' : ''}>
          <PolicyIntentConfig 
            severity={currentSeverity}
            categories={currentCategories}
            onChange={handleIntentChange}
            disabled={policy.mode === 'SOVEREIGN'}
          />
          {policy.mode === 'SOVEREIGN' && <p className="text-[9px] text-amber-500/70 mt-2 text-center">Locked by Sovereign Agent</p>}
        </section>

      </div>

      {/* FOOTER */}
      <div className="h-12 border-t border-white/5 flex items-center justify-center shrink-0">
         <AnimatePresence>
            {saveStatus === 'saved' && (
               <motion.span 
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="text-[10px] text-green-500 font-medium flex items-center gap-1"
               >
                  <Check size={10} /> Settings updated
               </motion.span>
            )}
         </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default AiModsSettingsPanel;
