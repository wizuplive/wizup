
import React, { useEffect, useState } from 'react';
import { ModAction } from '../../types/modTypes';
import { modCaseService } from '../../services/modCaseService';
import { User, Bot, Shield, FileText, Check, X } from 'lucide-react';

interface ModEventLogProps {
  communityId: string;
}

const ModEventLog: React.FC<ModEventLogProps> = ({ communityId }) => {
  const [actions, setActions] = useState<ModAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        const data = await modCaseService.listActions(communityId);
        // Sort descending by time
        setActions(data.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
    };
    load();
  }, [communityId]);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] text-gray-600 font-medium tracking-wider uppercase">Loading History</p>
        </div>
    );
  }

  if (actions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                <FileText size={18} className="text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">No history yet</h3>
            <p className="text-[10px] text-gray-600 max-w-[200px] leading-relaxed">
                Moderation actions taken by you or the AI will appear here.
            </p>
        </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
        {actions.map((action) => (
            <div 
                key={action.id} 
                className="group flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 relative"
            >
                {/* Timeline Line (Visual Only) */}
                <div className="absolute left-[19px] top-8 bottom-[-12px] w-px bg-white/5 group-last:hidden" />

                {/* Actor Icon */}
                <div className={`relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center border z-10 ${
                    action.actor === 'AI_MOD' 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                    {action.actor === 'AI_MOD' ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-gray-200">
                            {formatActionType(action.action)}
                        </span>
                        <span className="text-[9px] text-gray-600 font-mono">
                            {formatTime(action.timestamp)}
                        </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 leading-relaxed truncate group-hover:text-gray-400 transition-colors">
                        {action.rationale || "No context provided."}
                    </p>
                </div>
            </div>
        ))}
        
        <div className="pt-8 pb-4 text-center">
            <p className="text-[9px] text-gray-700 uppercase tracking-widest font-bold">End of Log</p>
        </div>
    </div>
  );
};

// Helpers
function formatActionType(type: string) {
    switch (type) {
        case 'HOLD': return 'Hidden Content';
        case 'TAG': return 'Tagged Content';
        case 'NOTE': return 'Added Warning';
        case 'RESTORE': return 'Restored';
        case 'NO_ACTION': return 'Dismissed';
        default: return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
}

function formatTime(ts: number) {
    const d = new Date(ts);
    // If today, show time only
    if (Date.now() - ts < 86400000 && d.getDate() === new Date().getDate()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default ModEventLog;
