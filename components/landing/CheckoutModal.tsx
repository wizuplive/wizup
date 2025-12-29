import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Zap, ArrowRight, Loader2, Plus, Sparkles, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  plan: any;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'plan' | 'payment' | 'confirm' | 'success';
type PaymentMethod = 'card' | 'zaps';

export default function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('plan');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zapBalance, setZapBalance] = useState(2450);
  const [showTopUp, setShowTopUp] = useState(false);

  const price = billing === 'monthly' ? plan.price : Math.floor((plan.price as number) * 0.8 * 12);
  const zapRequired = plan.id === 'free' ? 0 : plan.id === 'pro' ? 1500 : 5000;

  const handleAction = async () => {
    if (step === 'plan') setStep('payment');
    else if (step === 'payment') {
      if (payMethod === 'zaps' && zapBalance < zapRequired) {
        setShowTopUp(true);
        return;
      }
      setStep('confirm');
    }
    else if (step === 'confirm') {
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 1500));
      setIsProcessing(false);
      setStep('success');
    }
  };

  const handleTopUp = (amt: number) => {
    setZapBalance(prev => prev + amt);
    setShowTopUp(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0A0A0A] md:rounded-[32px] rounded-t-[32px] border-t md:border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    (step === 'plan' && i === 1) || (step === 'payment' && i <= 2) || (step === 'confirm' && i <= 3) || step === 'success' ? 'bg-purple-500' : 'bg-white/10'
                  }`} />
                ))}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {step.toUpperCase()}
             </span>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Review your plan</h3>
                  <p className="text-sm text-white/40">Choose your billing cycle.</p>
                </div>
                
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">{plan.title}</span>
                    <span className="text-sm font-medium text-gray-400">{plan.id === 'enterprise' ? 'Custom' : `$${price}`}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{plan.desc}</p>
                </div>

                {typeof plan.price === 'number' && plan.price > 0 && (
                  <div className="p-1 rounded-xl bg-white/5 flex gap-1">
                    <button 
                      onClick={() => setBilling('monthly')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${billing === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Monthly
                    </button>
                    <button 
                      onClick={() => setBilling('yearly')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${billing === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Yearly
                      <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-md bg-purple-600 text-[8px] text-white">20% OFF</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Payment Method</h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Demo Environment</p>
                </div>

                <div className="flex gap-2">
                   <button onClick={() => setPayMethod('card')} className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${payMethod === 'card' ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-40'}`}>
                      <CreditCard size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Card</span>
                   </button>
                   <button onClick={() => setPayMethod('zaps')} className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${payMethod === 'zaps' ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-40'}`}>
                      <Zap size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">ZAPs</span>
                   </button>
                </div>

                {payMethod === 'card' ? (
                  <div className="space-y-4">
                     <input disabled placeholder="Card Number" defaultValue="•••• •••• •••• 4242" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60" />
                     <div className="grid grid-cols-2 gap-4">
                        <input disabled placeholder="MM/YY" defaultValue="12/28" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60" />
                        <input disabled placeholder="CVC" defaultValue="•••" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60" />
                     </div>
                     <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">Standard Demo Credentials Applied</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Your Balance</p>
                          <p className="text-xl font-bold text-white">{zapBalance.toLocaleString()} ZAPs</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Required</p>
                          <p className={`text-xl font-bold ${zapBalance < zapRequired ? 'text-red-400' : 'text-green-400'}`}>{zapRequired.toLocaleString()} ZAPs</p>
                       </div>
                    </div>
                    {zapBalance < zapRequired && (
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-4">
                         <div className="flex items-center gap-2 text-purple-200 text-xs font-medium">
                            <Sparkles size={14} /> Need more energy?
                         </div>
                         <div className="flex gap-2">
                            {[1000, 5000].map(amt => (
                              <button key={amt} onClick={() => handleTopUp(amt)} className="flex-1 py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-transform">+{amt}</button>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Confirm Order</h3>
                  <p className="text-sm text-white/40">Activation is permanent.</p>
                </div>

                <div className="space-y-1">
                   {[
                     { label: 'Plan', val: plan.title },
                     { label: 'Cycle', val: billing.charAt(0).toUpperCase() + billing.slice(1) },
                     { label: 'Payment', val: payMethod === 'card' ? 'Visa •••• 4242' : 'ZAPs Energy' },
                     { label: 'Total', val: plan.id === 'free' ? 'Free' : `$${price}` }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between py-3 border-b border-white/5 text-sm">
                        <span className="text-white/30 font-medium">{item.label}</span>
                        <span className="text-white font-bold">{item.val}</span>
                     </div>
                   ))}
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                      {/* Added ShieldCheck import to fix error */}
                      <ShieldCheck size={20} />
                   </div>
                   <p className="text-[11px] text-white/40 leading-relaxed">
                      WIZUP is decentralized by design. Your plan is logged on the protocol once confirmed.
                   </p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Check size={40} className="text-green-500" strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">You’re in.</h3>
                  <p className="text-base text-white/40">Your plan is active in demo mode.</p>
                </div>
                <div className="pt-8 w-full space-y-3">
                  <button onClick={onSuccess} className="w-full py-5 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-[0.4em] shadow-2xl">Go to Spaces</button>
                  <button onClick={onClose} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">Back to pricing</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step !== 'success' && (
          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <button 
              onClick={handleAction}
              disabled={isProcessing || (payMethod === 'zaps' && zapBalance < zapRequired && step === 'payment')}
              className="w-full py-5 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  {step === 'confirm' ? (plan.id === 'free' ? 'Create Space' : 'Activate Plan') : 'Continue'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
