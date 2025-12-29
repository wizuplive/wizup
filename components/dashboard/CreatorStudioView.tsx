import React, { useState, useRef } from 'react';
import { 
  Users, Video, Mic, Package, ArrowRight, Sparkles,
  Layout, Search, Globe, Image as ImageIcon,
  Loader2, Wand2, Shield, Calendar, MessageSquare, Plus,
  DollarSign, Smartphone, Rocket, Hash, Bell,
  AlertCircle, RefreshCw, X, Save, ImagePlus, Check, ChevronDown, 
  CreditCard, Wallet, Hourglass, Lock, CheckCircle2, Zap,
  GripVertical, FileText, PlayCircle, HelpCircle,
  BookOpen, Layers
} from 'lucide-react';
import { generateImageWithGemini, generateCommunityBlueprint, generateCourseCurriculum, chatWithGemini } from '../../services/geminiService';
import { ImageSize, DashboardCommunity } from '../../types';

// --- Configuration & Data ---

const CATEGORIES = [
  { name: "Business & Entrepreneurship", subs: ["Startups", "Sales & Marketing", "Branding", "Small Business", "Freelancing", "Content Creation", "Leadership"] },
  { name: "Tech & AI", subs: ["Artificial Intelligence", "Tools & Automation", "Coding", "No-Code", "Web3", "App Building", "Cybersecurity"] },
  { name: "Money & Investing", subs: ["Crypto", "Stocks", "Real Estate", "Trading", "Personal Finance", "Wealth Psychology", "Side Income"] },
  { name: "Health, Wellness & Fitness", subs: ["Workouts", "Nutrition", "Mental Health", "Longevity", "Recovery", "Biohacking", "Weight Loss"] },
  { name: "Personal Growth & Mindset", subs: ["Habit Building", "Productivity", "Mental Strength", "Confidence", "Emotional Mastery", "Goal Setting", "Life Design"] },
  { name: "Careers & Skills", subs: ["3D & Animation", "Design & UX", "Writing", "Public Speaking", "Soft Skills"] },
  { name: "Creativity & Art", subs: ["Music", "Digital Art", "Film & Editing", "Photography", "Writing & Poetry", "Fashion", "Crafts"] },
  { name: "Lifestyle & Culture", subs: ["Travel", "Food", "Home & Aesthetic", "Minimalism", "Style", "Gaming", "Books"] },
  { name: "Relationships & Family", subs: ["Dating", "Marriage", "Parenting", "Communication", "Boundaries", "Friendships"] },
  { name: "DIY", subs: ["Crafts", "Home Improvement", "Gardening", "Woodworking", "Repair", "3D Printing"] },
  { name: "Spirituality & Consciousness", subs: ["Meditation", "Healing", "Manifestation", "Astrology", "Energy Work", "Faith & Philosophy"] }
];

type StudioMode = 'hub' | 'select-mode' | 'ai-input' | 'wizard';
type CreationType = 'community' | 'course' | null;
type WizardStep = 'identity' | 'structure' | 'monetization' | 'publish' | 'branding' | 'curriculum';

// Community Data State
interface CommunityState {
  title: string;
  tagline: string;
  description: string;
  category: string;
  subcategory: string;
  coverImage: string;
  profileImage: string; // Placeholder for upload
  channels: string[];
  tags: string[];
  pricingType: 'free' | 'free_zap' | 'zap' | 'usd' | 'mixed' | 'crypto';
  price: number;
  isWaitlist: boolean;
  theme: 'purple' | 'blue' | 'gold' | 'rose';
}

const INITIAL_COMMUNITY_STATE: CommunityState = {
  title: '',
  tagline: '',
  description: '',
  category: '',
  subcategory: '',
  coverImage: '',
  profileImage: '',
  channels: ['Announcements', 'General Chat', 'Intros'],
  tags: [],
  pricingType: 'free',
  price: 0,
  isWaitlist: false,
  theme: 'purple'
};

// Course Data State
interface Lesson {
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface CourseState {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  subcategory: string;
  coverImage: string;
  theme: 'purple' | 'blue' | 'gold' | 'rose';
  modules: Module[];
  pricingType: 'free' | 'free_zap' | 'zap' | 'usd' | 'mixed' | 'crypto';
  price: number;
  isWaitlist: boolean;
  tags: string[];
}

const INITIAL_COURSE_STATE: CourseState = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  category: '',
  subcategory: '',
  coverImage: '',
  theme: 'purple',
  modules: [],
  pricingType: 'usd',
  price: 49,
  isWaitlist: false,
  tags: []
};

interface CreatorStudioViewProps {
  onPublish?: (community: DashboardCommunity) => void;
}

// --- Components ---

const ProgressBar = ({ step, type }: { step: WizardStep; type: CreationType }) => {
  let steps: WizardStep[] = [];
  if (type === 'community') {
    steps = ['identity', 'structure', 'monetization', 'publish'];
  } else {
    steps = ['identity', 'branding', 'curriculum', 'monetization', 'publish'];
  }
  
  const currentIndex = steps.indexOf(step);

  if (type === 'course') {
    // Neon Dot Style for Course Flow
    return (
      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-xl">
        {steps.map((s, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          return (
            <div key={s} className="relative flex items-center justify-center group">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-125' 
                    : isCompleted 
                    ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                    : 'bg-white/10'
                }`} 
              />
              {idx < steps.length - 1 && (
                <div className={`absolute left-3 w-4 h-[2px] -mr-4 ${isCompleted ? 'bg-purple-500/50' : 'bg-white/5'}`} />
              )}
              {isActive && (
                <span className="absolute -bottom-6 text-[9px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {s}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Standard Line Style for Community Flow
  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10">
      {steps.map((s, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        return (
          <div key={s} className="flex items-center">
            <div 
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                isActive ? 'w-10 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]' : 
                isCompleted ? 'w-3 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'w-1.5 bg-white/10'
              }`} 
            />
            {idx < steps.length - 1 && <div className="w-1.5" />}
          </div>
        );
      })}
    </div>
  );
};

// --- Main Creator View ---

const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({ onPublish }) => {
  // Navigation State
  const [mode, setMode] = useState<StudioMode>('hub');
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [step, setStep] = useState<WizardStep>('identity');

  // Data State
  const [commData, setCommData] = useState<CommunityState>(INITIAL_COMMUNITY_STATE);
  const [courseData, setCourseData] = useState<CourseState>(INITIAL_COURSE_STATE);
  
  // UI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgPrompt, setImgPrompt] = useState('');
  const [isGenImage, setIsGenImage] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Actions ---

  const handleStartCreation = (type: CreationType) => {
    setCreationType(type);
    if (type === 'community') {
      setMode('select-mode');
    } else {
      // Course goes directly to manual wizard with new flow
      setMode('wizard');
      setStep('identity');
    }
  };

  const handleAIBuildCommunity = async () => {
    if (!aiPrompt.trim()) return;
    setIsProcessing(true);
    try {
      const blueprint = await generateCommunityBlueprint(aiPrompt);
      if (blueprint) {
        setCommData(prev => ({
          ...prev,
          title: blueprint.title,
          tagline: blueprint.tagline,
          description: blueprint.description,
          category: blueprint.category,
          subcategory: blueprint.subcategory,
          channels: blueprint.channels || prev.channels,
          tags: blueprint.tags || [],
        }));
        setImgPrompt(`High quality, cinematic, 4k render of ${blueprint.title} - ${blueprint.tagline}. Abstract, geometric, premium wallpaper.`);
      }
      setMode('wizard');
      setStep('identity');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageGen = async () => {
    if (!imgPrompt) return;
    setIsGenImage(true);
    try {
       const img = await generateImageWithGemini(imgPrompt, ImageSize.SIZE_1K, refImage || undefined);
       if (img) {
         if (creationType === 'community') setCommData(prev => ({ ...prev, coverImage: img }));
         else setCourseData(prev => ({ ...prev, coverImage: img }));
       }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenImage(false);
    }
  };

  const handleAICurriculum = async () => {
    if (!courseData.title) return;
    setIsProcessing(true);
    try {
      const result = await generateCourseCurriculum(courseData.title + (courseData.description ? `: ${courseData.description}` : ''));
      if (result && result.modules) {
        setCourseData(prev => ({ ...prev, modules: result.modules }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleChannel = (channel: string) => {
    setCommData(prev => {
      const exists = prev.channels.includes(channel);
      return {
        ...prev,
        channels: exists ? prev.channels.filter(c => c !== channel) : [...prev.channels, channel]
      };
    });
  };

  const handleLaunch = () => {
    if (!onPublish) return;

    let newCommunity: DashboardCommunity;

    if (creationType === 'community') {
      const accessType = 
        commData.pricingType === 'free' || commData.pricingType === 'free_zap' ? 'free' :
        commData.pricingType === 'zap' ? 'zaps' : 'paid';

      let cost = '';
      if (commData.pricingType === 'zap') cost = '500 ZAPs';
      else if (commData.pricingType === 'usd') cost = '$19/mo';
      else if (commData.pricingType === 'free') cost = 'Free Entry';

      newCommunity = {
        id: Date.now(),
        title: commData.title,
        creator: { name: "Sarah Jenkins", avatar: "https://picsum.photos/seed/p1/100/100", verified: true },
        category: commData.category || 'General',
        image: commData.coverImage || `https://picsum.photos/seed/${commData.title}/800/600`,
        members: "1",
        accessType: accessType,
        cost: cost,
        description: commData.description || commData.tagline,
        isFeatured: false
      };
    } else {
      // Course Launch Logic
      newCommunity = {
        id: Date.now(),
        title: courseData.title,
        creator: { name: "Sarah Jenkins", avatar: "https://picsum.photos/seed/p1/100/100", verified: true },
        category: courseData.category || 'Course',
        image: courseData.coverImage || `https://picsum.photos/seed/${courseData.title}/800/600`,
        members: "0",
        accessType: 'paid',
        cost: courseData.isWaitlist ? 'Waitlist' : '$49',
        description: courseData.description,
        isFeatured: true
      };
    }

    onPublish(newCommunity);
  };

  // --- RENDERERS ---

  const renderHub = () => (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="flex justify-between items-end mb-16">
         <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Creator Studio 5.0</span>
               </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-white mb-6">
               Create.<br />Everything.
            </h1>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Community Card - Hero */}
         <div 
           onClick={() => handleStartCreation('community')}
           className="group relative h-[400px] rounded-[40px] bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:-translate-y-1"
         >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-colors" />
            
            <div className="absolute top-8 left-8">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white mb-4 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Users size={28} />
               </div>
               <h2 className="text-3xl font-medium text-white mb-2">Community</h2>
               <p className="text-gray-400 font-light max-w-xs">Build a thriving space with tiered access, live events, and real-time chat.</p>
            </div>

            <div className="absolute bottom-8 right-8">
               <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                  <ArrowRight size={20} />
               </button>
            </div>
         </div>

         {/* Secondary Options Grid */}
         <div className="grid grid-cols-2 gap-6">
            {/* COURSE CARD - Primary secondary Option */}
            <div 
              onClick={() => handleStartCreation('course')}
              className="group relative rounded-[32px] bg-gradient-to-br from-[#151515] to-black border border-white/5 p-6 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between shadow-lg"
            >
               <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <BookOpen size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Course</h3>
                  <p className="text-xs text-gray-500 mt-1">Video modules & quizzes</p>
               </div>
               <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                  <ArrowRight size={16} className="text-white -rotate-45" />
               </div>
            </div>

            {[
              { title: 'Coaching', icon: Mic, color: 'text-pink-400', desc: '1:1 & Group sessions', bg: 'bg-pink-900/20' },
              { title: 'Product', icon: Package, color: 'text-emerald-400', desc: 'Digital assets & files', bg: 'bg-emerald-900/20' },
              { title: 'Bundle', icon: Layout, color: 'text-orange-400', desc: 'Mix & Match value', bg: 'bg-orange-900/20' }
            ].map((item, i) => (
               <div key={i} className="group relative rounded-[32px] bg-white/[0.03] border border-white/5 p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between">
                  <div>
                     <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <item.icon size={24} className={item.color} />
                     </div>
                     <h3 className="text-lg font-medium text-white">{item.title}</h3>
                     <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                     <ArrowRight size={16} className="text-white -rotate-45" />
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderAIInput = () => (
     <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden animate-slide-left-fade">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl">
           <div className="text-center mb-10">
              <Sparkles size={48} className="mx-auto text-purple-400 mb-6 animate-pulse" />
              <h2 className="text-4xl font-medium text-white mb-4">What are you building?</h2>
              <p className="text-lg text-gray-400 font-light">Describe your community idea, audience, and goals.</p>
           </div>

           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl opacity-30 blur group-focus-within:opacity-70 transition-opacity duration-700" />
              <div className="relative bg-[#0F0F0F] rounded-2xl border border-white/10 p-2">
                 <textarea 
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   className="w-full bg-transparent p-6 text-xl text-white placeholder-gray-600 focus:outline-none resize-none h-40 font-light"
                   placeholder="e.g. A premium mastermind for SaaS founders focusing on scaling to $1M ARR..."
                   autoFocus
                 />
                 <div className="flex justify-between items-center px-4 pb-2">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">WIZUP Intelligence</span>
                    <button 
                      onClick={handleAIBuildCommunity}
                      disabled={isProcessing || !aiPrompt.trim()}
                      className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                       {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                       {isProcessing ? 'Generating Blueprint...' : 'Generate Magic'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
     </div>
  );

  const renderModeSelect = () => (
     <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <button 
           onClick={() => setMode('hub')}
           className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
           <ArrowRight className="rotate-180" size={16} /> Back
        </button>

        <h2 className="text-4xl md:text-5xl font-medium text-white mb-12 text-center">Choose your path.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
           {/* AI Mode */}
           <div 
             onClick={() => setMode('ai-input')}
             className="group relative p-1 rounded-[40px] bg-gradient-to-b from-purple-500/20 to-blue-500/20 cursor-pointer hover:scale-[1.01] transition-transform duration-500"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative h-full bg-[#0A0A0A] rounded-[36px] p-10 flex flex-col items-center text-center border border-white/10 group-hover:border-white/20 overflow-hidden">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-700">
                    <Sparkles size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Instant AI Build</h3>
                 <p className="text-gray-400 font-light mb-8">Describe your vision. WIZUP AI generates structure, branding, and copy.</p>
                 <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-purple-300 uppercase tracking-widest">Premium</span>
              </div>
           </div>

           {/* Manual Mode */}
           <div 
             onClick={() => { setMode('wizard'); setStep('identity'); }}
             className="group relative rounded-[40px] bg-white/[0.02] border border-white/5 p-10 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
           >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                 <Layout size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Manual Control</h3>
              <p className="text-gray-400 font-light mb-8">Build from scratch with our precision tools.</p>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Advanced</span>
           </div>
        </div>
     </div>
  );

  const renderCourseWizard = () => (
    <div className="h-full flex flex-col md:flex-row bg-[#050505] animate-fade-in-up">
        
        {/* LEFT PANEL: CONTROLS */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative z-10 bg-[#050505]">
           
           {/* Wizard Header */}
           <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20">
              <button onClick={() => setMode('hub')} className="text-gray-500 hover:text-white transition-colors">
                 <X size={24} />
              </button>
              <ProgressBar step={step} type="course" />
              <button 
                 onClick={() => {
                   if (step === 'identity') setStep('branding');
                   else if (step === 'branding') setStep('curriculum');
                   else if (step === 'curriculum') setStep('monetization');
                   else if (step === 'monetization') setStep('publish');
                 }}
                 className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                 {step === 'publish' ? '' : 'Next'}
              </button>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 pb-32">
              
              {/* --- STEP 1: IDENTITY --- */}
              {step === 'identity' && (
                 <div className="space-y-10 max-w-2xl mx-auto animate-slide-up-fade">
                    <div className="mb-8">
                       <h2 className="text-4xl font-medium text-white mb-2">Create Your Course</h2>
                       <p className="text-gray-400 font-light">Build transformative learning experiences powered by ZAPs.</p>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Course Title</label>
                          <button className="text-[10px] text-purple-400 flex items-center gap-1 hover:text-purple-300 transition-colors">
                             <Sparkles size={10} /> Generate with AI
                          </button>
                       </div>
                       <input 
                         type="text" 
                         value={courseData.title}
                         onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                         className="w-full bg-transparent text-5xl font-medium text-white placeholder-white/20 border-b border-white/10 pb-4 focus:outline-none focus:border-blue-500/50 transition-colors"
                         placeholder="Masterclass Title"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                       <div className="relative group">
                          <textarea 
                             value={courseData.description}
                             onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none h-32 transition-all group-hover:bg-white/[0.07]"
                             placeholder="What will students learn?"
                          />
                       </div>
                       <div className="flex gap-2">
                          {['Summarize', 'Make Premium', 'Simplify'].map(action => (
                             <button key={action} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                <Wand2 size={10} /> {action}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Difficulty Level</label>
                       <div className="flex gap-3">
                          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                             <button
                               key={level}
                               onClick={() => setCourseData({...courseData, difficulty: level as any})}
                               className={`px-6 py-3 rounded-full text-sm font-medium border transition-all duration-300 ${
                                  courseData.difficulty === level 
                                     ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                     : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                               }`}
                             >
                                {level}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {/* --- STEP 2: BRANDING --- */}
              {step === 'branding' && (
                 <div className="space-y-10 max-w-2xl mx-auto animate-slide-up-fade">
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#121212] to-black border border-white/10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                       
                       <div className="flex items-center justify-between mb-6 relative z-10">
                          <h3 className="text-lg font-medium text-white">Course Cover Art</h3>
                          <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                          >
                             Upload Custom
                          </button>
                       </div>
                       
                       <div className="flex gap-4 mb-6 relative z-10">
                          <input 
                             type="text" 
                             value={imgPrompt}
                             onChange={(e) => setImgPrompt(e.target.value)}
                             placeholder="e.g. Abstract 3D glass shapes in blue void"
                             className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                          />
                          <button 
                             onClick={handleImageGen}
                             disabled={isGenImage || !imgPrompt}
                             className="px-6 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                             {isGenImage ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                             Dream
                          </button>
                       </div>

                       <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center group z-10">
                          {courseData.coverImage ? (
                             <img src={courseData.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                          ) : (
                             <ImageIcon size={32} className="text-gray-700" />
                          )}
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Theme Accent</label>
                       <div className="flex gap-4">
                          {[
                             { id: 'purple', bg: 'bg-purple-500', glow: 'shadow-purple-500/50' },
                             { id: 'blue', bg: 'bg-blue-500', glow: 'shadow-blue-500/50' },
                             { id: 'gold', bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50' },
                             { id: 'rose', bg: 'bg-rose-500', glow: 'shadow-rose-500/50' }
                          ].map(theme => (
                             <button
                                key={theme.id}
                                onClick={() => setCourseData({...courseData, theme: theme.id as any})}
                                className={`w-12 h-12 rounded-full ${theme.bg} transition-all duration-300 hover:scale-110 ${
                                   courseData.theme === theme.id ? `ring-4 ring-white/20 scale-110 shadow-lg ${theme.glow}` : 'opacity-70 hover:opacity-100'
                                }`}
                             />
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {/* --- STEP 3: CURRICULUM --- */}
              {step === 'curriculum' && (
                 <div className="space-y-8 max-w-3xl mx-auto animate-slide-up-fade">
                    <div className="flex justify-between items-center">
                       <h2 className="text-3xl font-medium text-white">Curriculum Builder 4.0</h2>
                    </div>

                    {courseData.modules.length === 0 ? (
                        /* Empty State with AI Generator Prominence */
                        <div className="py-16 px-10 text-center border border-white/10 rounded-[40px] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           
                           <div className="relative z-10">
                              <Sparkles size={48} className="mx-auto text-blue-400 mb-6 animate-pulse" />
                              <h3 className="text-2xl font-bold text-white mb-2">Start with AI Magic</h3>
                              <p className="text-gray-400 font-light mb-8 max-w-md mx-auto">Let our AI draft a complete module structure based on your title and description.</p>
                              
                              <div className="flex gap-4 justify-center">
                                 <button 
                                    onClick={handleAICurriculum}
                                    disabled={isProcessing}
                                    className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                                 >
                                    {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                    Generate Full Curriculum
                                 </button>
                                 <button className="px-8 py-4 rounded-full bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                                    Build Manually
                                 </button>
                              </div>
                           </div>
                        </div>
                    ) : (
                        /* Manual Builder */
                        <div className="space-y-4">
                          {courseData.modules.map((mod, i) => (
                             <div key={i} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                                <div className="p-4 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
                                   <div className="flex items-center gap-3">
                                      <GripVertical size={16} className="text-gray-600 cursor-grab hover:text-white transition-colors" />
                                      <h4 className="font-medium text-white">{mod.title}</h4>
                                   </div>
                                   <span className="text-xs text-gray-500 px-2 py-1 rounded bg-white/5">{mod.lessons.length} Lessons</span>
                                </div>
                                <div className="p-2 space-y-1">
                                   {mod.lessons.map((lesson, j) => (
                                      <div key={j} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                         <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors border border-white/5">
                                            {lesson.type === 'video' ? <PlayCircle size={14} /> : <FileText size={14} />}
                                         </div>
                                         <div className="flex-1">
                                            <div className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors">{lesson.title}</div>
                                            <div className="text-[10px] text-gray-600">{lesson.duration}</div>
                                         </div>
                                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={14} className="text-gray-500" />
                                         </div>
                                      </div>
                                   ))}
                                   <button className="w-full py-3 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-xl hover:bg-white/5">
                                      <Plus size={12} /> Add Lesson
                                   </button>
                                </div>
                             </div>
                          ))}
                          <button 
                             onClick={() => setCourseData(prev => ({...prev, modules: [...prev.modules, { title: `Module ${prev.modules.length + 1}`, lessons: [] }] }))}
                             className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                          >
                             <Plus size={16} /> Add Module
                          </button>
                        </div>
                    )}
                 </div>
              )}

              {/* --- STEP 4: MONETIZATION & PUBLISH --- */}
              {(step === 'monetization' || step === 'publish') && (
                 <div className="space-y-10 max-w-3xl mx-auto animate-slide-up-fade">
                    {/* Reuse Pricing Grid from Community Flow */}
                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 ${courseData.isWaitlist ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
                       {[
                          { id: 'usd', title: 'Standard', icon: DollarSign, desc: 'One-time payment' },
                          { id: 'zap', title: 'ZAPs Only', icon: Zap, desc: 'Token gated' },
                          { id: 'crypto', title: 'Crypto', icon: Wallet, desc: 'ETH / USDC' }
                       ].map((opt: any) => (
                          <div 
                             key={opt.id}
                             onClick={() => setCourseData({...courseData, pricingType: opt.id})}
                             className={`relative p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between h-40 ${
                                courseData.pricingType === opt.id 
                                   ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                   : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                             }`}
                          >
                             <opt.icon size={24} className={courseData.pricingType === opt.id ? 'text-black' : 'text-gray-500'} />
                             <div>
                                <h4 className="font-bold text-lg">{opt.title}</h4>
                                <p className="text-xs opacity-70">{opt.desc}</p>
                             </div>
                             {courseData.pricingType === opt.id && (
                                <div className="absolute top-4 right-4 text-black"><Check size={16} /></div>
                             )}
                          </div>
                       ))}
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-white">Price</h4>
                          <p className="text-xs text-gray-500">Set your course price</p>
                       </div>
                       <input 
                          type="number" 
                          value={courseData.price} 
                          onChange={(e) => setCourseData({...courseData, price: parseInt(e.target.value)})}
                          className="w-24 bg-black border border-white/10 rounded-lg px-3 py-2 text-right text-white focus:outline-none"
                       />
                    </div>

                    {step === 'publish' && (
                       <div className="pt-8 text-center">
                          <button 
                            onClick={handleLaunch}
                            className="w-full py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
                          >
                             <Rocket size={20} /> Publish Course
                          </button>
                       </div>
                    )}
                 </div>
              )}

           </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW (Course Card Style) */}
        <div className="hidden xl:flex w-[480px] bg-[#0A0A0A] border-l border-white/5 flex-col items-center justify-center relative p-8">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-blue-900/5 pointer-events-none" />
           <h3 className="absolute top-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Live Preview</h3>

           <div className="w-full max-w-sm bg-[#121212] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group transition-all duration-500 hover:-translate-y-2">
              {/* Cover */}
              <div className="relative aspect-video overflow-hidden">
                 {courseData.coverImage ? (
                    <img src={courseData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                 ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-${courseData.theme}-900 to-black`} />
                 )}
                 <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                       {courseData.difficulty}
                    </span>
                 </div>
              </div>

              <div className="p-6">
                 <h2 className="text-xl font-bold text-white mb-2 leading-tight">{courseData.title || "Course Title"}</h2>
                 <p className="text-xs text-gray-400 line-clamp-2 mb-6">{courseData.description || "Course description..."}</p>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-700" />
                       <span className="text-xs font-medium text-gray-300">Sarah J.</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                       {courseData.pricingType === 'zap' ? `${courseData.price} ZAPs` : `$${courseData.price}`}
                    </div>
                 </div>
              </div>
           </div>
        </div>

    </div>
  );

  // --- MAIN RENDER LOGIC ---

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Render Active View */}
      <div className="relative z-10 h-[calc(100vh-5rem)]">
        {mode === 'hub' && renderHub()}
        {mode === 'select-mode' && renderModeSelect()}
        {mode === 'ai-input' && renderAIInput()}
        {mode === 'wizard' && (
           creationType === 'community' ? (
              <div className="h-full flex flex-col md:flex-row bg-[#050505] animate-fade-in-up">
                 {/* Community Wizard Implementation (Re-use from previous Step or keep embedded logic) */}
                 <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative z-10 bg-[#050505]">
                    {/* ... Header ... */}
                    <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20">
                       <button onClick={() => setMode('select-mode')} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                       <ProgressBar step={step} type="community" />
                       <button onClick={() => {
                          if (step === 'identity') setStep('structure');
                          else if (step === 'structure') setStep('monetization');
                          else if (step === 'monetization') setStep('publish');
                       }} className="text-sm font-bold text-white hover:text-purple-400 transition-colors">{step === 'publish' ? '' : 'Next'}</button>
                    </div>
                    {/* Body: Re-using Community Steps Logic embedded above for simplicity in this unified view */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 pb-32">
                        {/* Identity Step */}
                        {step === 'identity' && (
                           <div className="space-y-12 max-w-2xl mx-auto">
                              {/* ... (Community Identity UI Code) ... */}
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Community Name</label>
                                 <input type="text" value={commData.title} onChange={(e) => setCommData({...commData, title: e.target.value})} className="w-full bg-transparent text-5xl font-medium text-white placeholder-white/20 border-b border-white/10 pb-4 focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="Name your space" />
                              </div>
                              {/* ... Category Selects ... */}
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                                    <div className="relative group">
                                       <select value={commData.category} onChange={(e) => setCommData({...commData, category: e.target.value, subcategory: ''})} className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer">
                                          <option value="">Select Category</option>
                                          {CATEGORIES.map(cat => <option key={cat.name} value={cat.name} className="bg-black">{cat.name}</option>)}
                                       </select>
                                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                    </div>
                                 </div>
                                 <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Sub-Category</label>
                                    <div className="relative">
                                       <select value={commData.subcategory} onChange={(e) => setCommData({...commData, subcategory: e.target.value})} disabled={!commData.category} className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50 cursor-pointer">
                                          <option value="">Select Niche</option>
                                          {CATEGORIES.find(c => c.name === commData.category)?.subs.map(sub => <option key={sub} value={sub} className="bg-black">{sub}</option>)}
                                       </select>
                                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Tagline</label>
                                 <textarea value={commData.tagline} onChange={(e) => setCommData({...commData, tagline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-32" placeholder="What is your community about in one sentence?" />
                              </div>
                              {/* Cover Art */}
                              <div className="pt-8 border-t border-white/5">
                                 <div className="flex items-center justify-between mb-4"><label className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} /> AI Cover Studio</label></div>
                                 <div className="flex gap-2 mb-4"><input type="text" value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} placeholder="Describe aesthetic..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" /><button onClick={handleImageGen} disabled={isGenImage || !imgPrompt} className="px-6 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2">{isGenImage ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />} Generate</button></div>
                                 <div className="flex gap-4 h-32">
                                    <div onClick={() => fileInputRef.current?.click()} className="w-32 rounded-xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"><input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" /><ImagePlus size={20} className="text-gray-500" /><span className="text-[10px] text-gray-500 uppercase font-bold">Upload Ref</span></div>
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden relative group">{commData.coverImage ? <><img src={commData.coverImage} className="w-full h-full object-cover" alt="Cover" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => setCommData({...commData, coverImage: ''})} className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500/50 transition-colors"><X size={16} /></button></div></> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image Generated</div>}</div>
                                 </div>
                              </div>
                           </div>
                        )}
                        {/* Structure Step */}
                        {step === 'structure' && (
                           <div className="space-y-10 max-w-2xl mx-auto animate-slide-left-fade">
                              <div><h2 className="text-3xl font-medium text-white mb-6">Structure your Space</h2><div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">{['Announcements', 'General Chat', 'Intros', 'Resources', 'Q&A', 'Showcase'].map((navItem) => (<button key={navItem} onClick={() => toggleChannel(navItem)} className={`px-5 py-2.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${commData.channels.includes(navItem) ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}>{navItem}</button>))}</div></div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{['Announcements', 'General Chat', 'Intros', 'Resources', 'Events', 'Q&A', 'Courses', 'Showcase'].map(ch => (<div key={ch} onClick={() => toggleChannel(ch)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${commData.channels.includes(ch) ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${commData.channels.includes(ch) ? 'bg-white text-black' : 'bg-black/40 text-gray-500'}`}><Hash size={14} /></div><span className={commData.channels.includes(ch) ? 'text-white font-medium' : 'text-gray-400'}>{ch}</span></div>{commData.channels.includes(ch) && <CheckCircle2 size={16} className="text-green-400" />}</div>))}</div>
                           </div>
                        )}
                        {/* Monetization Step */}
                        {step === 'monetization' && (
                           <div className="space-y-10 max-w-3xl mx-auto animate-slide-left-fade">
                              <div className="flex justify-between items-center"><h2 className="text-3xl font-medium text-white">Monetization</h2><div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waitlist Mode</span><button onClick={() => setCommData({...commData, isWaitlist: !commData.isWaitlist})} className={`w-10 h-6 rounded-full p-1 transition-colors ${commData.isWaitlist ? 'bg-purple-500' : 'bg-gray-600'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${commData.isWaitlist ? 'translate-x-4' : ''}`} /></button></div></div>
                              <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 ${commData.isWaitlist ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>{[ { id: 'free', title: 'Free', icon: Globe, desc: 'Open to all' }, { id: 'free_zap', title: 'Free + Rewards', icon: Sparkles, desc: 'Limited spots' }, { id: 'zap', title: 'ZAPs Only', icon: Zap, desc: 'Token gated' }, { id: 'usd', title: 'USD', icon: DollarSign, desc: 'Stripe payments' }, { id: 'mixed', title: 'Mixed', icon: CreditCard, desc: 'ZAPs + USD' }, { id: 'crypto', title: 'Crypto', icon: Wallet, desc: 'USDC / ETH' } ].map((opt: any) => (<div key={opt.id} onClick={() => setCommData({...commData, pricingType: opt.id})} className={`relative p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between h-40 ${commData.pricingType === opt.id ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}><opt.icon size={24} className={commData.pricingType === opt.id ? 'text-black' : 'text-gray-500'} /><div><h4 className="font-bold text-lg">{opt.title}</h4><p className="text-xs opacity-70">{opt.desc}</p></div>{commData.pricingType === opt.id && (<div className="absolute top-4 right-4 text-black"><Check size={16} /></div>)}</div>))}</div>
                           </div>
                        )}
                        {/* Publish Step */}
                        {step === 'publish' && (
                           <div className="max-w-xl mx-auto text-center pt-10 animate-fade-in-up">
                              <div className="relative w-32 h-32 mx-auto mb-8"><div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full animate-pulse" /><div className="relative w-full h-full rounded-[32px] overflow-hidden border-2 border-white/20 shadow-2xl">{commData.coverImage ? <img src={commData.coverImage} className="w-full h-full object-cover" alt="Cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />}</div></div>
                              <h2 className="text-4xl font-medium text-white mb-2">{commData.title}</h2><p className="text-gray-400 mb-10">{commData.category} • {commData.channels.length} Channels</p>
                              <div className="space-y-3 mb-10"><div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"><span className="text-sm text-gray-400">Identity & Branding</span><CheckCircle2 size={16} className="text-green-400" /></div><div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"><span className="text-sm text-gray-400">Channel Structure</span><CheckCircle2 size={16} className="text-green-400" /></div><div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"><span className="text-sm text-gray-400">Monetization: {commData.isWaitlist ? 'Waitlist' : commData.pricingType.toUpperCase()}</span><CheckCircle2 size={16} className="text-green-400" /></div></div>
                              <button onClick={handleLaunch} className="w-full py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"><Rocket size={20} /> Launch Community</button>
                           </div>
                        )}
                    </div>
                 </div>
                 {/* RIGHT PANEL: LIVE PREVIEW */}
                 <div className="hidden xl:flex w-[480px] bg-[#0A0A0A] border-l border-white/5 flex-col items-center justify-center relative p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-blue-900/5 pointer-events-none" /><h3 className="absolute top-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Live Mobile Preview</h3>
                    <div className="relative w-[340px] h-[700px] bg-black rounded-[50px] border-[8px] border-[#1f1f1f] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden scale-90 transition-all duration-500">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl z-30" />
                       <div className="h-full overflow-y-auto no-scrollbar bg-black text-white"><div className="h-56 relative">{commData.coverImage ? <img src={commData.coverImage} className="w-full h-full object-cover" alt="Cover" /> : <div className={`w-full h-full bg-gradient-to-br from-purple-900 to-black`} />}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" /><div className="absolute bottom-4 left-4 right-4"><span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white mb-2 inline-block border border-white/10">{commData.category || 'Category'}</span><h2 className="text-2xl font-bold leading-tight">{commData.title || "Community Name"}</h2></div></div><div className="p-5 space-y-6"><p className="text-xs text-gray-400 leading-relaxed font-light">{commData.tagline || commData.description || "Your community description will appear here..."}</p>{commData.isWaitlist ? <div className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold text-center flex items-center justify-center gap-2"><Hourglass size={14} /> Join Waitlist</div> : <div className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold text-center shadow-lg">Join Now {commData.pricingType !== 'free' && '• Paid'}</div>}<div><h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Channels</h4><div className="space-y-1.5">{commData.channels.map(ch => (<div key={ch} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5"><Hash size={12} className="text-gray-500" /><span className="text-xs text-gray-300">{ch}</span>{['Announcements', 'Events'].includes(ch) && <span className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full" />}</div>))}</div></div></div></div>
                       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
                    </div>
                 </div>
              </div>
           ) : renderCourseWizard()
        )}
      </div>

    </div>
  );
};

export default CreatorStudioView;