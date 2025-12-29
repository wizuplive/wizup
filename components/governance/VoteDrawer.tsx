import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Proposal } from '../../types/governanceTypes';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface VoteDrawerProps {
  proposal: Proposal | null;
  onClose: () => void;
  onCast: (choice: 'YES' | 'NO') => Promise<void>;
}

const VoteDrawer: React.FC<VoteDrawerProps> = ({ proposal, onClose, onCast }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleChoice = async (choice: 'YES' | 'NO') => {
    setIsProcessing(true);
    try {
      await onCast(choice);
      setStatus('success');
      setTimeout(onClose, 1500);
    } catch (e) {
      alert("Process interrupted. Please verify your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!proposal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-[#0A0A0A] border-t border-white/10 rounded-t-[40px] p-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/10 rounded-full" />
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Decision Logged</h3>
              <p className="text-gray-500 text-sm">Your authority has been applied silently.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Community Decision</h2>
                <p className="text-sm text-gray-500 font-light px-4">
                  {proposal.title}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleChoice('NO')}
                  disabled={isProcessing}
                  className="flex-1 py-5 rounded-[24px] bg-white/5 border border-white/5 text-white font-bold hover:bg-white/10 transition-all flex flex-col items-center gap-2 group"
                >
                  <span className="text-lg">No</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-400">Reject</span>
                </button>
                <button 
                  onClick={() => handleChoice('YES')}
                  disabled={isProcessing}
                  className="flex-1 py-5 rounded-[24px] bg-white text-black font-bold hover:scale-[1.02] transition-all flex flex-col items-center gap-2 shadow-lg"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span className="text-lg">Yes</span>
                      <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Approve</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] text-gray-600 font-medium leading-relaxed max-w-xs mx-auto italic">
                  "Authority is earned through presence. Participation is a choice, never an obligation."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VoteDrawer;