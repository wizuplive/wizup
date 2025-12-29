import React, { useState } from 'react';
import { Zap, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { zapsSpendService } from '../../services/zapsSpend/zapsSpendService';
import { dataService } from '../../services/dataService';

interface QuantumZapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetId: string;
}

const AMOUNTS = [10, 25, 50, 100];

const QuantumZapModal: React.FC<QuantumZapModalProps> = ({ isOpen, onClose, targetName, targetId }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset state on close
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedAmount(null);
        setCustomAmount('');
        setSuccess(false);
        setIsSending(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const amount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);
    if (!amount || amount <= 0) return;

    setIsSending(true);
    try {
      const user = dataService.getCurrentUser();
      if (!user) throw new Error("No user");
      
      const result = await zapsSpendService.executeSpend({
        userId: user.id,
        communityId: "Direct Recognition",
        category: "CONTRIBUTION",
        amount: amount,
        description: `Recognition for ${targetName}`,
        metadata: { targetUserId: targetId }
      });
      
      if (result.success) {
        setIsSending(false);
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      console.error(e);
      setIsSending(false);
      alert(e.message || "Protocol Error. Insufficient presence or system interruption.");
    }
  };

  const activeAmount = selectedAmount || (customAmount ? parseInt(customAmount) : null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#020202]/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
        className="relative w-full max-w-sm bg-[#0F0F0F] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 flex flex-col items-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode='wait'>
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
                 <Zap size={32} className="text-yellow-400 fill-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Recognition Logged</h3>
              <p className="text-gray-400 text-sm">You acknowledged {targetName} with {activeAmount} ZAPs.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Header */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)] border border-yellow-500/20">
                 <Zap size={28} className="text-yellow-400 fill-yellow-400 animate-pulse-slow" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">Acknowledge Contribution</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-8">Direct Participation Signal</p>

              {/* Amount Selector */}
              <div className="grid grid-cols-4 gap-3 w-full mb-6">
                 {AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`
                        py-3 rounded-2xl text-sm font-bold transition-all duration-300 border
                        ${selectedAmount === amt 
                           ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105' 
                           : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                       {amt}
                    </button>
                 ))}
              </div>

              {/* Custom Input */}
              <div className="w-full relative mb-8">
                 <input 
                   type="number" 
                   placeholder="Custom Amount" 
                   value={customAmount}
                   onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                   className={`
                     w-full bg-[#050505] border rounded-xl py-3 px-4 text-center text-sm font-bold text-white placeholder-gray-600 focus:outline-none transition-colors
                     ${customAmount ? 'border-yellow-500/50' : 'border-white/10 focus:border-white/20'}
                   `}
                 />
                 {customAmount && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-500">ZAPS</span>}
              </div>

              {/* Context */}
              <p className="text-[10px] text-gray-500 text-center mb-6 italic">
                 "You’re acknowledging value, not performing a transaction."
              </p>

              {/* Actions */}
              <div className="w-full flex gap-3">
                 <button 
                   onClick={onClose}
                   className="flex-1 py-3.5 rounded-full font-bold text-sm text-gray-400 hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSend}
                   disabled={!activeAmount || isSending}
                   className={`
                     flex-[2] py-3.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2
                     ${activeAmount 
                        ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                     }
                   `}
                 >
                    {isSending ? <Loader2 className="animate-spin" size={16} /> : 'Acknowledge'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default QuantumZapModal;