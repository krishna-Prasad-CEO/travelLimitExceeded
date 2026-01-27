
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Calendar, Gauge, Users, 
  FileText, Send, Loader2, Sparkles, 
  ChevronRight, ArrowLeft, Globe
} from 'lucide-react';

interface CreateTripPageProps {
  onClose: () => void;
}

const CreateTripPage: React.FC<CreateTripPageProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    startDate: '',
    endDate: '',
    speed: 1,
    seats: 1,
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // API integration: POST /api/trips
      // In a real app, you'd use fetch or axios here.
      // const response = await fetch('/api/trips', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotification({ type: 'success', message: 'Trip odyssey initialized successfully!' });
      setTimeout(onClose, 2000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Manifest synchronization failed. Please retry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <motion.path
              d="M100 500 Q 500 100 900 500"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.02]" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl px-6 py-12 max-h-screen overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-[0.4em]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Abandone Plan
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-official font-bold text-indigo-400 uppercase tracking-[0.6em]">System: Ready</span>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-teal-400" />
              <h1 className="text-xl font-display font-bold text-white uppercase tracking-widest">New Odyssey</h1>
            </div>
          </div>
        </div>

        <div className="relative group">
          {/* Subtle Glow Border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 via-teal-500/10 to-purple-500/20 rounded-[2.5rem] blur-sm pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="mb-12 text-center">
              <p className="text-teal-400 text-[10px] font-bold uppercase tracking-[0.8em] mb-3">Odyssey Configuration</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tighter uppercase leading-none">
                Design your journey <br /> before it begins
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Row 1: Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/30 ml-1">
                    <MapPin size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Departure Node</label>
                  </div>
                  <input
                    name="startLocation"
                    required
                    value={formData.startLocation}
                    onChange={handleInputChange}
                    placeholder="ENTER LOCATION"
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 text-white font-official text-lg focus:outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-white/5"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/30 ml-1">
                    <Globe size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Target Destination</label>
                  </div>
                  <input
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="ENTER TARGET"
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 text-white font-official text-lg focus:outline-none focus:border-teal-500 transition-all uppercase placeholder:text-white/5"
                  />
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/30 ml-1">
                    <Calendar size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Temporal Start</label>
                  </div>
                  <input
                    name="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 text-white font-official text-lg focus:outline-none focus:border-indigo-500 transition-all uppercase appearance-none"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/30 ml-1">
                    <Calendar size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Temporal End</label>
                  </div>
                  <input
                    name="endDate"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border-b border-white/10 py-4 px-2 text-white font-official text-lg focus:outline-none focus:border-indigo-500 transition-all uppercase appearance-none"
                  />
                </div>
              </div>

              {/* Row 3: Speed & Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-3 text-white/30">
                      <Gauge size={14} />
                      <label className="text-[10px] font-bold uppercase tracking-widest">Odyssey Velocity</label>
                    </div>
                    <span className="text-xs font-official text-indigo-400 font-bold">{formData.speed}x Normal</span>
                  </div>
                  <div className="relative pt-2">
                    <input
                      name="speed"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.speed}
                      onChange={handleInputChange}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-3 text-white/30">
                      <Users size={14} />
                      <label className="text-[10px] font-bold uppercase tracking-widest">Occupant Capacity</label>
                    </div>
                    <span className="text-xs font-official text-teal-400 font-bold">{formData.seats} Seats</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-2">
                    <button 
                      type="button" 
                      onClick={() => setFormData(p => ({...p, seats: Math.max(1, p.seats - 1)}))}
                      className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-official font-bold text-white">{formData.seats}</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData(p => ({...p, seats: Math.min(12, p.seats + 1)}))}
                      className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <div className="flex items-center gap-3 text-white/30">
                    <FileText size={14} />
                    <label className="text-[10px] font-bold uppercase tracking-widest">Journey Narrative</label>
                  </div>
                  <span className="text-[9px] font-official text-white/10 tracking-widest">{formData.description.length} / 500</span>
                </div>
                <textarea
                  name="description"
                  maxLength={500}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="DESCRIBE THE ESSENCE OF YOUR JOURNEY..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white font-official text-sm focus:outline-none focus:border-indigo-500 transition-all min-h-[160px] resize-none uppercase placeholder:text-white/5 leading-relaxed tracking-wider"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full h-20 bg-white text-slate-950 rounded-2xl font-official font-bold text-xs uppercase tracking-[0.6em] overflow-hidden shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-20"
              >
                <div className="flex items-center justify-center gap-6 relative z-10">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      Initialize Odyssey
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-4 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <Sparkles size={18} /> : <X size={18} />}
            <span className="text-[10px] font-official font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
          transition: all 0.3s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.8);
        }
      `}</style>
    </div>
  );
};

export default CreateTripPage;
