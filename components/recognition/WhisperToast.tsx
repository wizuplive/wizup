import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { RecognitionEvent } from '../../types/recognitionTypes';

interface WhisperToastProps {
  event: RecognitionEvent | null;
  onClose: () => void;
}

const WhisperToast: React.FC<WhisperToastProps> = ({ event, onClose }) => {
  useEffect(() => {
    if (event) {
      const timer = setTimeout(onClose, 2400);
      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[320px] px-4"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-purple-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recognition received</h4>
              <p className="text-[10px] text-gray-400 leading-tight truncate">
                {event.label} recorded in {event.communityId}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-gray-600 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhisperToast;