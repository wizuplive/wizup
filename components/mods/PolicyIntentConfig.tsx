
import React from 'react';
import { Shield, Zap, AlertTriangle, Link, Coffee, Scale, Lock } from 'lucide-react';
import { PolicySeverity, PolicyCategory } from '../../types/policyTypes';

interface PolicyIntentConfigProps {
  severity: PolicySeverity;
  categories: PolicyCategory[];
  onChange: (updates: { severity?: PolicySeverity; categories?: PolicyCategory[] }) => void;
  disabled?: boolean;
}

const PolicyIntentConfig: React.FC<PolicyIntentConfigProps> = ({ 
  severity, 
  categories, 
  onChange,
  disabled = false
}) => {

  const tones: { id: PolicySeverity, label: string, icon: any, desc: string }[] = [
    { id: 'RELAXED', label: 'Open', icon: Coffee, desc: 'Prioritizes free expression. Only blocks egregious violations.' },
    { id: 'STANDARD', label: 'Balanced', icon: Scale, desc: 'Standard safety. Blocks toxicity and spam, allows debate.' },
    { id: 'STRICT', label: 'Professional', icon: Lock, desc: 'High standards. Zero tolerance for profanity or conflict.' },
  ];

  const safeguards: { id: PolicyCategory, label: string, icon: any }[] = [
    { id: 'TOXICITY', label: 'Harassment', icon: AlertTriangle },
    { id: 'SPAM', label: 'Spam', icon: Zap },
    { id: 'SCAM', label: 'Fraud', icon: Shield },
    { id: 'LINK_RISK', label: 'Links', icon: Link },
  ];

  const toggleCategory = (cat: PolicyCategory) => {
    if (categories.includes(cat)) {
      onChange({ categories: categories.filter(c => c !== cat) });
    } else {
      onChange({ categories: [...categories, cat] });
    }
  };

  const getPreviewText = () => {
    const activeCount = categories.length;
    if (activeCount === 0) return "All automated safeguards are disabled.";
    
    let summary = "";
    if (severity === 'RELAXED') summary = "Light touch moderation.";
    if (severity === 'STANDARD') summary = "Balanced protection.";
    if (severity === 'STRICT') summary = "Strict enforcement.";

    return `${summary} ${activeCount} active safeguards.`;
  };

  return (
    <div className={`space-y-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* TONE SELECTOR */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Community Tone</label>
        <div className="grid grid-cols-1 gap-2">
          {tones.map((t) => {
            const isSelected = severity === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ severity: t.id })}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200
                  ${isSelected 
                    ? 'bg-white/10 border-white/20 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-white/5'}
                `}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
                  <t.icon size={16} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{t.label}</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SAFEGUARDS SELECTOR */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Active Safeguards</label>
        <div className="flex flex-wrap gap-2">
          {safeguards.map((s) => {
            const isActive = categories.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleCategory(s.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'}
                `}
              >
                <s.icon size={12} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PREVIEW FOOTER */}
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
        <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-400 mt-0.5">
          <Shield size={14} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Effect Preview</div>
          <p className="text-xs text-gray-300 leading-relaxed">{getPreviewText()}</p>
        </div>
      </div>

    </div>
  );
};

export default PolicyIntentConfig;
