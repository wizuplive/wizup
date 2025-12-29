
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Image as ImageIcon, Smile, Mic, 
  MoreHorizontal, Phone, Video, Check, CheckCheck 
} from 'lucide-react';

interface DirectMessageOverlayProps {
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOnline?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  read: boolean;
}

const DirectMessageOverlay: React.FC<DirectMessageOverlayProps> = ({ user, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hey ${user.name.split(' ')[0]}! Love the new design system update.`, isMe: true, time: 'Yesterday', read: true },
    { id: '2', text: "Thanks! Currently working on the dark mode tokens. Should be live soon.", isMe: false, time: 'Yesterday', read: true },
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: message,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setMessages([...messages, newMsg]);
    setMessage('');

    // Simulate reply
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: "Just saw this! Let me check my schedule for a sync.",
            isMe: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true
        }]);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Window */}
      <div 
        className={`
          relative w-full max-w-[440px] h-[600px] max-h-[90vh] 
          bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden
          transform transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
          ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0F0F0F]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
               <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full animate-pulse" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-white leading-tight">{user.name}</h3>
               <p className="text-[10px] text-gray-400 font-medium">Active now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Phone size={18} />
             </button>
             <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Video size={18} />
             </button>
             <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-1">
                <X size={18} />
             </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
           <div className="text-center py-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                 Chat started
              </span>
           </div>

           {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                 {!msg.isMe && (
                    <img src={user.avatar} className="w-6 h-6 rounded-full border border-white/10 mr-2 self-end mb-1" alt="" />
                 )}
                 <div className={`max-w-[75%] relative group`}>
                    <div 
                       className={`px-4 py-2.5 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                          msg.isMe 
                             ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[20px] rounded-tr-sm border border-white/10' 
                             : 'bg-[#1A1A1A] border border-white/5 text-gray-200 rounded-[20px] rounded-tl-sm'
                       }`}
                    >
                       {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-1 opacity-60 text-[10px] ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                       <span>{msg.time}</span>
                       {msg.isMe && (
                          <span className={msg.read ? 'text-blue-400' : 'text-gray-500'}>
                             {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                          </span>
                       )}
                    </div>
                 </div>
              </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t border-white/5 bg-[#0F0F0F]/80 backdrop-blur-md">
           <div className="relative flex items-end gap-2 p-1.5 rounded-[24px] bg-[#161616] border border-white/5 transition-all focus-within:border-purple-500/30 focus-within:ring-1 focus-within:ring-purple-500/20">
              <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                 <MoreHorizontal size={20} />
              </button>
              
              <textarea 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Message..."
                 rows={1}
                 className="flex-1 bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none resize-none py-3 max-h-32"
              />

              {!message && (
                 <div className="flex items-center gap-1 pb-0.5">
                    <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><ImageIcon size={20} /></button>
                    <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><Mic size={20} /></button>
                 </div>
              )}

              {message && (
                 <button 
                    onClick={handleSend}
                    className="p-2.5 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-lg hover:scale-105 active:scale-95"
                 >
                    <Send size={18} fill="currentColor" />
                 </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default DirectMessageOverlay;
