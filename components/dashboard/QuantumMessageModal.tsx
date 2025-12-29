
import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuantumMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    handle: string;
    avatar: string;
    isOnline?: boolean;
  };
}

const QuantumMessageModal: React.FC<QuantumMessageModalProps> = ({ isOpen, onClose, user }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      // Reset state on close
      setTimeout(() => {
        setSent(false);
        setMessage('');
        setIsSending(false);
      }, 500);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    // Simulate network delay for effect
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSending(false);
    setSent(true);
    // Auto dismiss
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed Background (90% Opacity) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#020202]/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Success Overlay */}
        <AnimatePresence>
          {sent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-[#0F0F0F] flex flex-col items-center justify-center text-center p-8"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20"
              >
                <CheckCircle2 size={32} className="text-green-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Message Sent</h3>
              <p className="text-gray-400 text-sm">Your thought has been delivered.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
               <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-sm" />
               <img src={user.avatar} alt={user.name} className="relative w-12 h-12 rounded-full object-cover border border-white/10" />
               {user.isOnline && (
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F0F0F] rounded-full" />
               )}
            </div>
            <div>
               <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
               <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                 {user.isOnline ? (
                   <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online • Open to messages</>
                 ) : (
                   <><span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Offline</>
                 )}
               </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-4 flex-1">
           <div className="relative group">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a thoughtful message..."
                className="w-full h-40 bg-transparent border-none text-white text-lg font-light placeholder-gray-600 focus:ring-0 resize-none leading-relaxed p-0 selection:bg-purple-500/30"
                autoFocus
              />
              {/* Glow Ring Effect on Focus (Simulated via adjacent element or css) */}
           </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 flex items-center justify-between">
           <button 
             onClick={onClose}
             className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
           >
             Cancel
           </button>
           
           <button 
             onClick={handleSend}
             disabled={!message.trim() || isSending}
             className={`
               relative px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300
               ${message.trim() && !isSending
                 ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                 : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
               }
             `}
           >
             {isSending ? (
                <>Sending...</>
             ) : (
                <>
                   Send Message 
                   <Send size={14} className={message.trim() ? "text-purple-600" : ""} />
                </>
             )}
           </button>
        </div>

      </motion.div>
    </div>
  );
};

export default QuantumMessageModal;
