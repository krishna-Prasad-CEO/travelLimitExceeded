
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Sparkles, ArrowRight, MessageSquareText, Terminal as TerminalIcon } from 'lucide-react';
import { TripPlan } from '../types';
import { generateTripPlan } from '../geminiService';

interface TripPlannerProps {
  setPlan: (plan: TripPlan) => void;
  setLoading: (loading: boolean) => void;
}

const TouristGuide = ({ isListening, isFocused, isNodding }: { isListening: boolean, isFocused: boolean, isNodding: boolean }) => {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center flex-shrink-0">
      <div className="absolute inset-0 bg-yellow-400/5 blur-[40px] rounded-full pointer-events-none" />
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible relative z-10">
        <motion.path 
          d="M50 185 Q100 145 150 185 L150 200 L50 200 Z" 
          fill="#1e293b" 
          animate={{ y: isFocused ? -2 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <path d="M85 160 Q100 150 115 160 L110 175 Q100 168 90 175 Z" fill="#334155" />
        <motion.g
          animate={{ 
            rotate: isNodding ? [0, 8, 0, 8, 0] : isFocused ? -3 : isListening ? [0, -1, 1, 0] : [0, 1, -1, 0],
            y: [0, -1, 0]
          }}
          transition={{ 
            rotate: { duration: isNodding ? 0.4 : isListening ? 2 : 5, repeat: isNodding ? 0 : Infinity, ease: "easeInOut" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ transformOrigin: '100px 160px' }}
        >
          <circle cx="100" cy="100" r="48" fill="#f8fafc" />
          <path d="M52 100 Q52 55 100 55 Q148 55 148 100" fill="#334155" />
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 6, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          >
            <circle cx="82" cy="108" r="3" fill="#0f172a" />
            <circle cx="118" cy="108" r="3" fill="#0f172a" />
          </motion.g>
          <motion.path 
            d={isListening ? "M94 125 Q100 128 106 125" : "M92 125 Q100 132 108 125"} 
            stroke="#0f172a" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            transition={{ duration: 0.3 }}
          />
        </motion.g>
      </svg>
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg z-20"
          >
            <div className="flex gap-0.5 items-end h-3">
               {[1,2,3].map(i => (
                 <motion.div 
                   key={i} 
                   animate={{ height: [3, 10, 3] }}
                   transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                   className="w-0.5 bg-white rounded-full" 
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TripPlanner: React.FC<TripPlannerProps> = ({ setPlan, setLoading }) => {
  const [intent, setIntent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%",
        }
      });
      tl.from(".guide-section", { x: -20, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".terminal-section", { x: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntent(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
  };

  const handleGenerate = async () => {
    if (!intent.trim()) return;
    setIsNodding(true);
    setLoading(true);
    try {
      const plan = await generateTripPlan('', '', '', intent);
      setPlan(plan);
      setTimeout(() => {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsNodding(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center py-12 md:py-24 no-jump">
      <div className="w-full max-w-5xl bg-slate-900/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-10 md:gap-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] z-0" />

        <div className="guide-section flex flex-row md:flex-col items-center gap-8 md:gap-6 flex-shrink-0 w-full md:w-1/4 relative z-10">
          <TouristGuide isListening={isTyping} isFocused={isFocused} isNodding={isNodding} />
          <div className="flex flex-col md:items-start text-left">
            <div className="flex items-center gap-2 text-yellow-500/40 mb-1">
              <MessageSquareText size={12} />
              <span className="text-[8px] font-official font-bold uppercase tracking-[0.2em]">Travel Pro</span>
            </div>
            <p className="text-lg md:text-xl font-display text-white/90 leading-tight">
              {isNodding ? "Thinking..." : "Share your intent."}
              <span className="block text-[10px] text-slate-500 font-official uppercase tracking-widest mt-1.5 opacity-60">I'll handle the rest</span>
            </p>
          </div>
        </div>

        <div className="terminal-section flex-1 w-full relative z-10">
          <div className={`relative transition-all duration-700 rounded-3xl border p-8 md:p-10 bg-black/50 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] ${
            isFocused ? 'border-indigo-500/40 ring-1 ring-indigo-500/10' : 'border-white/5'
          }`}>
            <div className="absolute top-5 right-8 flex gap-2.5 opacity-30">
              <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className={`w-1.5 h-1.5 rounded-full ${isNodding ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4">
                <span className="text-[11px] font-official font-bold text-indigo-400/70 whitespace-nowrap mt-2 tracking-wider">ATH-SYS ›</span>
                <textarea 
                  value={intent}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={handleTextChange}
                  placeholder="I want a 4-day quiet escape to the mountains."
                  className="w-full min-h-[120px] bg-transparent text-lg md:text-xl font-official text-white placeholder:text-white/5 focus:outline-none resize-none leading-relaxed caret-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 text-white/10 group-hover:text-white/20 transition-all">
                  <TerminalIcon size={14} className={isNodding ? "animate-pulse text-indigo-400" : "text-slate-600"} />
                  <span className="text-[9px] font-official uppercase tracking-[0.4em] font-bold">system: {isNodding ? "processing" : "standby"}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!intent.trim() || isNodding}
                  className="w-full sm:w-auto px-12 py-5 bg-white text-slate-950 rounded-xl font-official font-bold text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-6 disabled:opacity-20"
                >
                  Generate Path
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
