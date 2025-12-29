import React from 'react';
import { Sparkles } from 'lucide-react';

interface RecognitionPillProps {
  label: string;
}

const RecognitionPill: React.FC<RecognitionPillProps> = ({ label }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-[0.1em] text-purple-300 animate-fade-in-up">
      <Sparkles size={8} className="animate-pulse" />
      <span>{label} recorded</span>
    </div>
  );
};

export default RecognitionPill;