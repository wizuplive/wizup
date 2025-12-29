import React, { useState } from 'react';
import { 
  Search, Plus, MoreHorizontal, Phone, Video, 
  Image as ImageIcon, Smile, Mic, Send, Check, CheckCheck, 
  Zap, Bell
} from 'lucide-react';
import { Conversation, Message } from '../../types';

// Mock Data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: "Design Systems Mastery",
    avatar: "https://picsum.photos/seed/design/200/200",
    lastMessage: "Don't forget to check the new Figma variables update in Module 3!",
    time: "2m ago",
    unreadCount: 3,
    isOnline: true,
    type: 'community',
    zapReward: true
  },
  {
    id: '2',
    name: "Sarah Jenkins",
    avatar: "https://picsum.photos/seed/p1/200/200",
    lastMessage: "Thanks for the feedback! I'll update the PR shortly.",
    time: "1h ago",
    unreadCount: 0,
    isOnline: true,
    isVerified: true,
    type: 'direct'
  },
  {
    id: '3',
    name: "Crypto Alpha Group",
    avatar: "https://picsum.photos/seed/crypto/200/200",
    lastMessage: "BTC hitting resistance at 68k. Watch the charts.",
    time: "3h ago",
    unreadCount: 12,
    isOnline: false,
    type: 'group'
  },
  {
    id: '4',
    name: "Alex Chain",
    avatar: "https://picsum.photos/seed/web3/200/200",
    lastMessage: "Let's sync up tomorrow regarding the smart contract audit.",
    time: "1d ago",
    unreadCount: 0,
    isOnline: false,
    type: 'direct'
  }
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: 'other', text: "Hey! Just wanted to welcome you to the Design Systems Mastery community.", timestamp: "10:30 AM", isMe: false, type: 'text' },
  { id: '2', senderId: 'me', text: "Thanks Sarah! Really excited to dive into the course materials.", timestamp: "10:32 AM", isMe: true, type: 'text', read: true },
  { id: '3', senderId: 'other', text: "We have a live session this Friday covering auto-layout advanced techniques.", timestamp: "10:33 AM", isMe: false, type: 'text' },
  { id: '4', senderId: 'other', text: "Don't forget to check the new Figma variables update in Module 3!", timestamp: "10:35 AM", isMe: false, type: 'text' },
];

const ConversationItem: React.FC<{ 
  conversation: Conversation; 
  isSelected: boolean; 
  onClick: () => void; 
}> = ({ conversation, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${
      isSelected 
        ? 'bg-white/10 border-white/5 shadow-lg backdrop-blur-md' 
        : 'hover:bg-white/5 hover:border-white/5'
    }`}
  >
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img 
          src={conversation.avatar} 
          alt={conversation.name} 
          className={`w-12 h-12 rounded-full object-cover border border-white/10 ${conversation.type === 'community' ? 'rounded-xl' : ''}`} 
        />
        {conversation.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-sm font-medium truncate flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
            {conversation.name}
            {conversation.isVerified && <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>}
          </h4>
          <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
            {conversation.time}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate max-w-[180px] ${isSelected ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
            {conversation.lastMessage}
          </p>
          
          <div className="flex items-center gap-2">
            {conversation.zapReward && (
              <Zap size={12} className="text-purple-400 fill-purple-400/20" />
            )}
            {conversation.unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`flex w-full mb-6 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
      {!message.isMe && (
        <div className="mr-3 flex-shrink-0 self-end">
          <img src="https://picsum.photos/seed/p1/100/100" className="w-8 h-8 rounded-full border border-white/10" alt="Sender" />
        </div>
      )}
      
      <div className={`max-w-[70%] relative group`}>
        <div 
          className={`px-5 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-md ${
            message.isMe 
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm border border-white/10' 
              : 'bg-white/10 text-gray-200 rounded-2xl rounded-tl-sm border border-white/5 hover:bg-white/15 transition-colors'
          }`}
        >
          {message.text}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 px-1 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-500 font-medium">{message.timestamp}</span>
          {message.isMe && (
            <span className="text-gray-500">
              {message.read ? <CheckCheck size={12} className="text-purple-400" /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MessagesView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  
  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-black overflow-hidden relative">
      
      {/* Middle Column - Conversation List */}
      <div className={`w-full lg:w-[400px] flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-white tracking-tight">Messages</h2>
            <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10">
              <Plus size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full h-10 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-purple-500/30 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            {['All', 'Unread', 'Communities', 'Direct'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {MOCK_CONVERSATIONS.map(conv => (
            <ConversationItem 
              key={conv.id} 
              conversation={conv} 
              isSelected={selectedId === conv.id}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
          
          {/* Empty Space Filler */}
          <div className="h-20"></div>
        </div>

        {/* Create Float (Mobile only usually, but good for quick access) */}
      </div>

      {/* Right Column - Chat Window */}
      <div className={`flex-1 flex flex-col bg-[#050505] relative ${!selectedId ? 'hidden lg:flex' : 'flex'}`}>
        
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-black/60 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedId(null)} className="lg:hidden text-gray-400 hover:text-white">
                  <span className="text-2xl">←</span>
                </button>
                <div className="relative">
                  <img src={selectedConversation.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10" />
                  {selectedConversation.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></span>}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    {selectedConversation.name}
                    {selectedConversation.isVerified && <span className="text-blue-500 text-[10px]">✓</span>}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><Phone size={20} /></button>
                <button className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><Video size={20} /></button>
                <button className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
              <div className="flex flex-col justify-end min-h-full">
                {/* Date Divider */}
                <div className="flex justify-center mb-8">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Today</span>
                </div>
                
                {MOCK_MESSAGES.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="p-6 pt-2 bg-gradient-to-t from-black via-black to-transparent">
              <div className="relative flex items-end gap-2 p-2 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl focus-within:border-white/20 transition-all">
                
                <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <Plus size={20} />
                </button>
                
                <textarea 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-sm focus:outline-none resize-none py-3 max-h-32 min-h-[44px]"
                  rows={1}
                />

                <div className="flex items-center gap-1 pb-1">
                   <button className="p-2 text-gray-400 hover:text-white transition-colors"><ImageIcon size={20} /></button>
                   <button className="p-2 text-gray-400 hover:text-white transition-colors"><Smile size={20} /></button>
                   <button className="p-2 text-gray-400 hover:text-white transition-colors"><Mic size={20} /></button>
                </div>

                <button className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95">
                  <Send size={18} fill="currentColor" className="ml-0.5" />
                </button>

              </div>
            </div>

          </>
        ) : (
          /* Empty State - Right Column */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#050505] to-black">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
               <Bell size={40} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Select a conversation</h2>
            <p className="text-gray-500 max-w-sm font-light">
              Choose a thread to start chatting with your community, students, or collaborators.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MessagesView;