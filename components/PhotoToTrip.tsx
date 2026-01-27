
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, RefreshCcw, Scan, Zap } from 'lucide-react';
import { analyzePhotoForTrip, generateTripPlan } from '../geminiService';
import { TripPlan } from '../types';

interface PhotoToTripProps {
  setPlan: (plan: TripPlan) => void;
  setLoading: (loading: boolean) => void;
}

const PhotoToTrip: React.FC<PhotoToTripProps> = ({ setPlan, setLoading }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer?.files?.[0];
    } else if (e.target && 'files' in e.target) {
      file = (e.target as HTMLInputElement).files?.[0];
    }
    
    if (!file) return;

    setIsShutterOpen(true);
    setTimeout(() => setIsShutterOpen(false), 500);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setIsAnalyzing(true);
      
      try {
        const analysis = await analyzePhotoForTrip(base64.split(',')[1]);
        const plan = await generateTripPlan('', '', '', '', 
          `Create a journey inspired by the visual soul of ${analysis.location}, ${analysis.country}. Vibe: ${analysis.vibe}. Season: ${analysis.bestSeason}.`
        );
        setPlan(plan);
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      } catch (error) { console.error(error); } 
      finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full pt-16 md:pt-32 space-y-32">
      <div className="text-center space-y-10">
        <div className="inline-block px-6 py-2 rounded-full border border-white/5 bg-white/5 text-white/20 text-[10px] font-official font-bold tracking-[0.8em] uppercase mb-4">
          Visual Reflection
        </div>
        <h3 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter leading-[0.9] uppercase">
          Upload Image. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-white to-purple-400 italic opacity-80 font-medium">Extract Essence.</span>
        </h3>
        <p className="text-slate-500 text-lg md:text-2xl font-display tracking-tight max-w-2xl mx-auto leading-relaxed opacity-50">
          Transform frozen moments into living trajectories.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <label 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileUpload}
          className={`group relative block w-full aspect-[16/9] md:aspect-[21/8] rounded-[3rem] md:rounded-[5rem] transition-all duration-1000 overflow-hidden shadow-2xl cursor-pointer bg-white/[0.01] border-2 border-dashed ${
            image ? 'border-transparent' : 'border-white/5 hover:border-fuchsia-500/20'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {/* Shutter Animation Overlay */}
          <AnimatePresence>
            {isShutterOpen && (
              <motion.div 
                // Use any cast to fix motion prop type errors in this environment
                {...({
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 }
                } as any)}
                className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center"
              >
                <div className="relative w-32 h-32 border-2 border-white rounded-full flex items-center justify-center opacity-20">
                  <div className="w-full h-px bg-white absolute rotate-45" />
                  <div className="w-full h-px bg-white absolute -rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {image ? (
              <motion.div 
                key="preview" 
                // Use any cast to fix motion prop type errors in this environment
                {...({
                  initial: { opacity: 0 },
                  animate: { opacity: 1 }
                } as any)}
                className="absolute inset-0"
              >
                <img src={image} className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-xl bg-black/40 z-20 overflow-hidden">
                    <motion.div 
                      // Use any cast to fix motion prop type errors in this environment
                      {...({
                        initial: { top: '-10%' },
                        animate: { top: '110%' },
                        transition: { duration: 2.5, repeat: Infinity, ease: "linear" }
                      } as any)}
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_40px_rgba(232,121,249,1)] z-30"
                    />
                    <div className="relative p-12 flex flex-col items-center gap-10">
                      <Scan size={56} className="text-fuchsia-400 animate-pulse" />
                      <p className="text-[10px] font-official uppercase tracking-[0.8em] text-white/50 font-bold animate-pulse">Analysing Visual Tokens</p>
                    </div>
                  </div>
                )}

                {!isAnalyzing && (
                  <button 
                    onClick={(e) => { e.preventDefault(); setImage(null); }}
                    className="absolute top-12 right-12 p-8 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 text-white/20 hover:text-white transition-all hover:rotate-90 z-40"
                  >
                    <RefreshCcw size={20} />
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
                <div className="w-32 h-32 rounded-[3rem] bg-white/[0.02] flex items-center justify-center text-slate-800 group-hover:text-fuchsia-400 group-hover:bg-fuchsia-500/10 transition-all duration-1000 border border-white/5">
                  <ImageIcon size={48} strokeWidth={1} />
                </div>
                <div className="text-center space-y-4">
                  <p className="text-white/20 font-official text-[11px] tracking-[0.8em] uppercase font-bold group-hover:text-white/60 transition-colors">Visual Resonance</p>
                  <div className="flex items-center justify-center gap-6 text-slate-900 text-[10px] font-official font-bold uppercase tracking-[0.4em]">
                    <Zap size={14} className="text-fuchsia-400/20" />
                    Drop metadata image
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </label>
        
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-24 text-center opacity-20">
          {[
            { label: 'Detection', desc: 'Identifies geographic nodes' },
            { label: 'Extraction', desc: 'Filters chromatic intent' },
            { label: 'Synthesis', desc: 'Realizes full experience' }
          ].map((item, i) => (
            <div key={i} className="space-y-6">
              <span className="text-[11px] font-official font-bold text-white uppercase tracking-[0.6em]">{item.label}</span>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoToTrip;
