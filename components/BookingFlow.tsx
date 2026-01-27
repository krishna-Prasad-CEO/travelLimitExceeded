
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { X, CreditCard, ArrowRight, Plane, Loader2, Map, Download } from 'lucide-react';
import { TripPlan } from '../types';

interface BookingFlowProps { plan: TripPlan; onClose: () => void; }

type BookingStep = 'confirm' | 'payment' | 'processing' | 'success';

const BookingFlow: React.FC<BookingFlowProps> = ({ plan, onClose }) => {
  const [step, setStep] = useState<BookingStep>('confirm');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [processMsg, setProcessMsg] = useState('Verifying application metadata...');
  
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 'processing') {
      const messages = ["Analyzing travel funds...", "Confirming trajectory availability...", "Generating official manifest..."];
      let i = 0;
      const interval = setInterval(() => {
        setProcessMsg(messages[i % messages.length]);
        i++;
      }, 1200);
      const timer = setTimeout(() => { setStep('success'); }, 4000);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }
    
    if (step === 'success') {
      gsap.fromTo(stampRef.current, 
        { scale: 5, opacity: 0, rotate: -30 },
        { scale: 1, opacity: 1, rotate: 8, duration: 0.5, ease: "bounce.out", delay: 0.6 }
      );
    }
  }, [step]);

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-xl overflow-hidden">
      <motion.div 
        {...({
          initial: { opacity: 0, scale: 0.98, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.98, y: 10 },
          transition: { duration: 0.4, ease: "circOut" }
        } as any)}
        className="visa-paper relative z-10 w-full max-w-2xl min-h-[600px] md:min-h-[750px] bg-white rounded-2xl shadow-[0_80px_150px_-30px_rgba(0,0,0,0.9)] border border-slate-300 flex flex-col no-jump"
      >
        <div className="relative p-8 md:p-12 pb-0 flex items-center justify-between flex-shrink-0">
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-950 uppercase tracking-tighter leading-none">
              Authorization <br className="hidden md:block"/>& Confirmation
            </h3>
            <p className="text-[9px] font-official text-slate-500 uppercase tracking-[0.4em] pt-1">
              Protocol Phase: Final Validation
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 -mr-3 text-slate-300 hover:text-slate-950 transition-all focus:outline-none"
          >
            <X size={32} strokeWidth={1} />
          </button>
        </div>

        <div className="relative p-8 md:p-12 flex-1 flex flex-col overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'confirm' && (
              <motion.div 
                key="confirm" 
                {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)}
                className="space-y-8 flex-1 flex flex-col h-full"
              >
                <div className="flex-1 space-y-8">
                  <div className="p-8 bg-slate-100/30 border border-slate-200 rounded-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                      <Plane size={160} />
                    </div>
                    <div className="space-y-4">
                      <span className="text-[8px] font-official font-bold uppercase tracking-widest text-slate-400">Target Manifest</span>
                      <h4 className="text-4xl md:text-5xl font-display font-bold text-slate-950 uppercase tracking-tighter leading-none">
                        {plan.destination}
                      </h4>
                      <div className="flex gap-10 pt-4">
                        <div className="space-y-1">
                          <span className="text-[7px] font-official text-slate-400 uppercase tracking-widest">Stay Period</span>
                          <p className="text-xl font-handwritten text-slate-900">{plan.duration} Days</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[7px] font-official text-slate-400 uppercase tracking-widest">Class</span>
                          <p className="text-xl font-handwritten text-slate-900 uppercase tracking-tight">{plan.vibe}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                      <span className="text-[9px] font-official font-bold text-slate-500 uppercase tracking-[0.2em]">Funds Declared</span>
                      <span className="text-3xl font-handwritten text-slate-950">{plan.budgetRange}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep('payment')}
                  className="w-full h-16 md:h-20 bg-slate-950 text-white font-official font-bold text-[10px] md:text-[11px] uppercase tracking-[0.5em] rounded-sm shadow-xl flex items-center justify-center gap-6 group"
                >
                  Confirm Metadata <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment" 
                {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)}
                className="space-y-10 flex-1 flex flex-col h-full max-w-[480px] mx-auto w-full"
              >
                <div className="flex-1 space-y-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-official font-bold text-slate-900 uppercase tracking-[0.3em] ml-1">Holder Name</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value)} 
                      placeholder="FULL NAME ON PASSPORT"
                      className="w-full py-4 font-handwritten text-3xl md:text-4xl bg-transparent border-b border-slate-200 focus:outline-none focus:border-slate-950 transition-colors uppercase text-slate-950 placeholder:text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-official font-bold text-slate-900 uppercase tracking-[0.3em] ml-1">Identity Token</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={handleCardInput} 
                        placeholder="0000 0000 0000 0000"
                        className="w-full py-4 font-handwritten text-3xl md:text-4xl bg-transparent border-b border-slate-200 focus:outline-none focus:border-slate-950 text-slate-950 placeholder:text-slate-100"
                      />
                      <CreditCard className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-200" size={24} />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep('processing')}
                  disabled={!cardName || cardNumber.length < 19}
                  className="w-full h-16 md:h-20 bg-indigo-900 text-white font-official font-bold text-[10px] md:text-[11px] uppercase tracking-[0.5em] rounded-sm shadow-xl disabled:opacity-20"
                >
                  Authorize synthesis
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing" 
                {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)}
                className="flex flex-col items-center justify-center py-20 space-y-12 flex-1"
              >
                <div className="relative w-full max-w-sm h-1 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                    {...({
                      initial: { x: '-100%' },
                      animate: { x: '100%' },
                      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    } as any)}
                    className="absolute inset-0 w-1/3 bg-slate-950 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                   />
                </div>
                <div className="text-center space-y-4">
                  <h4 className="text-2xl md:text-3xl font-display font-bold text-slate-950 uppercase tracking-tighter">Validating Trajectory</h4>
                  <div className="flex items-center justify-center gap-4 text-[10px] font-official text-slate-400 uppercase tracking-[0.4em]">
                    <Loader2 size={12} className="animate-spin" />
                    {processMsg}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success" 
                {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
                className="flex flex-col items-center justify-center py-8 space-y-12 flex-1 w-full"
              >
                <div ref={stampRef} className="visa-stamp-ink border-[6px] border-emerald-900 text-emerald-900 p-8 rounded-xl font-official font-bold text-5xl md:text-7xl uppercase tracking-[0.1em] rotate-[8deg] shadow-lg select-none">
                  VISA APPROVED
                </div>

                <div className="text-center space-y-6">
                  <h4 className="text-4xl md:text-6xl font-display font-bold text-slate-950 tracking-tighter leading-none">Manifest Confirmed</h4>
                  <p className="text-xl md:text-2xl font-handwritten text-slate-500 italic max-w-sm mx-auto leading-tight">
                    "Your odyssey is aligned. Proceed to discovery."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full">
                  <button onClick={onClose} className="p-10 border border-slate-100 flex flex-col items-center gap-4 hover:bg-slate-50 transition-all group rounded-xl">
                    <Map size={32} className="text-slate-200 group-hover:text-slate-950 transition-colors" />
                    <span className="text-[9px] font-official font-bold text-slate-500 uppercase tracking-widest">Plan View</span>
                  </button>
                  <button className="p-10 border border-slate-100 flex flex-col items-center gap-4 hover:bg-slate-50 transition-all group rounded-xl">
                    <Download size={32} className="text-slate-200 group-hover:text-slate-950 transition-colors" />
                    <span className="text-[9px] font-official font-bold text-slate-500 uppercase tracking-widest">Manifest</span>
                  </button>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full h-16 md:h-20 bg-slate-950 text-white font-official font-bold text-[10px] md:text-[11px] uppercase tracking-[0.6em] rounded-sm shadow-2xl mt-8"
                >
                  Initiate Travel Phase
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
