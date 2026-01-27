
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Hotel, Car, RefreshCcw, X, 
  Navigation, ChevronRight, 
  Plane, ArrowDown, MapPin,
  Map as MapIcon,
  CheckCircle2
} from 'lucide-react';
import { TripPlan, TripAlternative } from '../types';
import { getAlternatives, recalculateItinerary } from '../geminiService';

gsap.registerPlugin(ScrollTrigger);

interface ItineraryViewProps {
  plan: TripPlan;
  onBook: () => void;
}

const PALETTES = {
  relaxed: { bg: '#f8fafc', accent: '#0f172a', track: '#e2e8f0', node: '#ffffff' },
  adventure: { bg: '#f1f5f9', accent: '#1e293b', track: '#cbd5e1', node: '#ffffff' },
  family: { bg: '#fdfcf8', accent: '#0f172a', track: '#e2e8f0', node: '#ffffff' },
  default: { bg: '#f8fafc', accent: '#0f172a', track: '#e2e8f0', node: '#ffffff' }
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ plan: initialPlan, onBook }) => {
  const [currentPlan, setCurrentPlan] = useState<TripPlan>(initialPlan);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingItem, setEditingItem] = useState<{ dayIndex: number, type: 'hotel' | 'activity' | 'transport' } | null>(null);
  const [alternatives, setAlternatives] = useState<TripAlternative[]>([]);
  const [isLoadingAlts, setIsLoadingAlts] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const palette = PALETTES[currentPlan.vibe.toLowerCase() as keyof typeof PALETTES] || PALETTES.default;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Station Track Animation
      gsap.from(".station-track-fill", {
        height: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".journey-grid",
          start: "top 70%",
          end: "bottom 80%",
          scrub: 0.5
        }
      });

      // Synchronized Column Entrance
      gsap.utils.toArray(".station-row").forEach((row: any) => {
        const leftCol = row.querySelector(".left-column");
        const rightCol = row.querySelector(".right-column");

        gsap.from(leftCol, {
          opacity: 0,
          x: -30,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });

        gsap.from(rightCol, {
          opacity: 0,
          x: 30,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [currentPlan]);

  const handleEditRequest = async (dayIndex: number, type: 'hotel' | 'activity' | 'transport') => {
    setEditingItem({ dayIndex, type });
    setIsLoadingAlts(true);
    try {
      const alts = await getAlternatives(type, currentPlan, dayIndex);
      setAlternatives(alts);
    } catch (err) { console.error(err); } 
    finally { setIsLoadingAlts(false); }
  };

  const applyChange = async (newValue: string) => {
    if (!editingItem) return;
    setEditingItem(null);
    setIsUpdating(true);
    try {
      const updatedPlan = await recalculateItinerary(currentPlan, {
        dayIndex: editingItem.dayIndex,
        type: editingItem.type,
        newValue
      });
      setCurrentPlan(updatedPlan);
    } catch (err) { console.error(err); } 
    finally { setIsUpdating(false); }
  };

  return (
    <div ref={containerRef} style={{ backgroundColor: palette.bg }} className="relative w-full text-slate-900 pb-48 overflow-hidden no-jump">
      
      {/* Header Summary */}
      <section className="pt-32 pb-24 px-6 text-center max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <Plane size={14} className="text-slate-400" />
            <span className="text-[10px] font-official font-bold uppercase tracking-[0.2em] text-slate-500">Intelligent Manifest</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-display font-bold text-slate-950 uppercase tracking-tighter">
            {currentPlan.destination}
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 pt-8 text-slate-400 font-official text-[11px] uppercase tracking-widest">
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-900 text-lg font-display font-bold">{currentPlan.duration} Days</span>
              <span>Duration</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden md:block" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-900 text-lg font-display font-bold">{currentPlan.vibe}</span>
              <span>Vibe</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden md:block" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-900 text-lg font-display font-bold">{currentPlan.bestSeason}</span>
              <span>Best Time</span>
            </div>
          </div>
        </div>
        <div className="pt-20 opacity-20 animate-bounce">
          <ArrowDown size={24} className="mx-auto" />
        </div>
      </section>

      {/* Journey Grid */}
      <div className="journey-grid max-w-7xl mx-auto px-6 relative">
        
        {/* Visual Progress Track (Visible on all, anchored left) */}
        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-200/50 -translate-x-1/2 z-0 hidden md:block">
          <div className="station-track-fill absolute top-0 left-0 w-full bg-slate-950 origin-top" />
        </div>

        <div className="space-y-24 md:space-y-32 relative z-10">
          {currentPlan.itinerary.map((day, idx) => (
            <div key={idx} className="station-row grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start relative">
              
              {/* Central Node for Desktop */}
              <div className="hidden md:flex absolute left-1/2 top-4 -translate-x-1/2 items-center justify-center z-20">
                <div 
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-display font-bold bg-white shadow-md text-slate-950"
                  style={{ borderColor: palette.accent }}
                >
                  {idx + 1}
                </div>
              </div>

              {/* LEFT COLUMN: Journey Flow */}
              <div className="left-column space-y-6">
                <div className="md:hidden flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-official font-bold text-slate-400 uppercase tracking-widest">Day Segment</span>
                  <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-950 leading-tight uppercase tracking-tight">
                    {day.title}
                  </h3>
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-base font-handwritten text-slate-500 italic leading-relaxed">
                      "{day.logic}"
                    </p>
                  </div>
                </div>

                {/* Progress Indicators (Simple bullet points for flow) */}
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center gap-3 text-[10px] font-official font-bold text-slate-300 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Station Active</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-official font-bold text-slate-300 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span>Next Node Locked</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Details & Actions */}
              <div className="right-column space-y-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-official font-bold text-slate-400 uppercase tracking-widest">Daily Activities</h4>
                  <div className="grid gap-4">
                    {day.activities.map((act, i) => (
                      <div key={i} className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight">{act.name}</p>
                          <p className="text-sm font-handwritten text-slate-400 italic">"{act.reasoning}"</p>
                        </div>
                        <CheckCircle2 size={18} className="text-slate-100 group-hover:text-emerald-500 transition-colors mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-official font-bold text-slate-400 uppercase tracking-widest">Base & Transit</h4>
                  <div className="p-8 bg-slate-950 text-white rounded-[2rem] space-y-8 shadow-xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/30">
                          <Hotel size={16} />
                          <span className="text-[9px] font-official font-bold uppercase">Stay</span>
                        </div>
                        <button 
                          onClick={() => handleEditRequest(idx, 'hotel')}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                        >
                          <RefreshCcw size={14} />
                        </button>
                      </div>
                      <div>
                        <p className="text-xl font-display font-bold uppercase tracking-tight">{day.hotel.name}</p>
                        <p className="text-[10px] text-white/30 font-official uppercase tracking-widest">{day.hotel.category}</p>
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/10" />

                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-white/30">
                          <Car size={16} />
                          <span className="text-[9px] font-official font-bold uppercase">Transit</span>
                        </div>
                        <p className="text-lg font-display font-bold uppercase">{day.transport.mode}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-display font-bold">{day.transport.duration}</span>
                        <span className="block text-[8px] font-official text-white/20 uppercase tracking-tighter">Est. Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="max-w-7xl mx-auto px-6 pt-32 text-center space-y-16">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <MapPin size={24} />
          </div>
          <h3 className="text-3xl font-display font-bold uppercase tracking-tighter">Trajectory Complete</h3>
          <p className="text-xl font-handwritten text-slate-400 italic">"All nodes identified. Ready for deployment."</p>
        </div>

        <motion.button 
          // Use any cast to fix motion prop type errors in this environment
          {...({
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.98 }
          } as any)}
          onClick={onBook}
          className="px-16 py-6 bg-slate-950 text-white rounded-full font-official font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all inline-flex items-center gap-8"
        >
          Confirm Manifest
          <Navigation size={20} />
        </motion.button>
      </div>

      {/* Editing Sidebar */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[300] flex justify-end">
            <motion.div 
              // Use any cast to fix motion prop type errors in this environment
              {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
              } as any)}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              // Use any cast to fix motion prop type errors in this environment
              {...({
                initial: { x: '100%' },
                animate: { x: 0 },
                exit: { x: '100%' },
                transition: { type: 'spring', damping: 25, stiffness: 200 }
              } as any)}
              className="relative w-full max-w-lg h-full bg-white p-12 overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <div>
                  <span className="text-[10px] font-official font-bold text-slate-400 uppercase tracking-widest">Modification</span>
                  <h4 className="text-4xl font-display font-bold text-slate-950 uppercase">Update Path</h4>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 text-slate-300 hover:text-slate-950">
                  <X size={32} strokeWidth={1} />
                </button>
              </div>

              <div className="space-y-8">
                {isLoadingAlts ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-50 animate-pulse" />
                  ))
                ) : (
                  alternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => applyChange(alt.name)}
                      className="w-full text-left p-8 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-950 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="px-3 py-1 bg-white rounded-full text-[9px] font-official font-bold text-slate-400 border border-slate-100 uppercase">{alt.impact}</span>
                        <ChevronRight className="text-slate-200 group-hover:text-slate-950 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                      <h5 className="text-2xl font-display font-bold text-slate-900 uppercase mb-2">{alt.name}</h5>
                      <p className="text-sm font-handwritten text-slate-500 italic">"{alt.description}"</p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUpdating && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[310] px-10 py-4 bg-slate-950 text-white rounded-full font-official font-bold text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-4">
            <RefreshCcw className="animate-spin text-indigo-400" size={16} />
            Recalculating Trajectory
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryView;
