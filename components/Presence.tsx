
import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface PresenceProps {
  currentView: string;
  subView?: string;
}

const Presence: React.FC<PresenceProps> = ({ currentView, subView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'You’re inside WIZUP. Let’s take this one step at a time.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle ESC and Background Scroll Lock for Mobile
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithGemini(textToSend);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const getSuggestions = () => {
    if (currentView === 'pricing') return ["What is included in Studio?", "How do ZAPs work?"];
    if (currentView === 'dashboard' && subView === 'communities') return ["Find a Space", "Create a Space"];
    return ["What is WIZUP?", "How do I earn Aura?"];
  };

  return (
    <>
      {/* Dimmed Backdrop (Mobile Only Focus) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Launcher (Ritualistic Pulse) - Globally Fixed Bottom-Right */}
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Open Presence"
        className={`fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-[calc(env(safe-area-inset-right)+16px)] md:bottom-12 md:right-12 z-[101] p-5 md:p-6 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 text-white shadow-2xl transition-all duration-1000 hover:scale-110 aura-shimmer group ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-presence-pulse" />
          <div className="absolute inset-0 w-8 h-8 border border-white/10 rounded-full scale-150 opacity-20" />
        </div>
      </button>

      {/* Presence Interaction Surface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`
              fixed z-[110] bg-black/95 backdrop-blur-3xl border border-white/10 flex flex-col overflow-hidden origin-bottom-right
              bottom-[calc(env(safe-area-inset-bottom)+12px)] right-[calc(env(safe-area-inset-right)+12px)] 
              w-[min(92vw,460px)] h-[min(78dvh,720px)]
              rounded-[40px] md:rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]
            `}
          >
            {/* Minimal Header */}
            <div className="px-8 md:px-12 pt-8 md:pt-12 pb-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-white animate-presence-pulse" />
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.6em]">Presence</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                aria-label="Close"
                className="p-4 -mr-4 text-white/20 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Editorial Flow) */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-6 space-y-12 no-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[100%] text-lg md:text-xl font-light leading-relaxed tracking-tight ${
                    msg.role === 'user' 
                      ? 'text-white/40 text-right italic' 
                      : 'text-white'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3 opacity-20">
                   {[0, 0.2, 0.4].map(delay => (
                     <div key={delay} className="w-1.5 h-1.5 bg-white rounded-full animate-presence-pulse" style={{ animationDelay: `${delay}s` }} />
                   ))}
                </div>
              )}
              
              {!isLoading && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {getSuggestions().map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(s)}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] md:text-[11px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Intent Composer (Keyboard Safe Dock) */}
            <div className="px-8 md:px-12 pb-10 md:pb-12 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/[0.01] rounded-[28px] md:rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className="relative flex items-center bg-white/5 border border-white/5 rounded-[28px] md:rounded-[32px] px-6 py-4 md:px-8 md:py-6 focus-within:bg-white/[0.08] focus-within:border-white/20 transition-all duration-700 shadow-2xl">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="State your intent..."
                    className="flex-1 bg-transparent border-none text-base md:text-lg text-white placeholder-white/20 focus:outline-none font-light tracking-tight"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="p-2 md:p-3 ml-2 md:ml-4 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-0 transition-all active:scale-90"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Presence;
