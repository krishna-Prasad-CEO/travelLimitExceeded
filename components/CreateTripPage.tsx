
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Calendar, Gauge, Users, 
  FileText, Send, Loader2, Sparkles, 
  ArrowLeft, Globe
} from 'lucide-react';
import { supabase } from '../supabaseClient';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check to prevent empty strings for dates
    if (!formData.startDate || !formData.endDate) {
      setNotification({ type: "error", message: "Temporal bounds are required." });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated traveler found.");

      const { error } = await supabase
        .from('trips')
        .insert([{
          creator_id: user.id,
          start_location: formData.startLocation,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          speed: formData.speed,
          total_seats: formData.seats,
          seats_left: formData.seats,
          description: formData.description,
          status: 'active'
        }]);

      if (error) throw error;

      setNotification({ type: "success", message: "Odyssey Initialized." });
      setTimeout(onClose, 2000);

    } catch (error: any) {
      setNotification({ type: "error", message: error.message || "Sync failed." });
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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <button onClick={onClose} className="flex items-center gap-2 text-white/40 hover:text-white uppercase tracking-[0.4em] text-[10px] font-bold">
            <ArrowLeft size={16} /> Abandon Plan
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-teal-400" />
            <h1 className="text-xl font-display font-bold text-white uppercase">New Odyssey</h1>
          </div>
        </div>

        <div className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-16 shadow-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Departure Node</label>
                <input name="startLocation" required value={formData.startLocation} onChange={handleInputChange} placeholder="ENTER LOCATION" className="w-full bg-transparent border-b border-white/10 py-4 text-white uppercase focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Destination Target</label>
                <input name="destination" required value={formData.destination} onChange={handleInputChange} placeholder="ENTER TARGET" className="w-full bg-transparent border-b border-white/10 py-4 text-white uppercase focus:outline-none focus:border-teal-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Temporal Start</label>
                <input name="startDate" type="date" required value={formData.startDate} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 py-4 text-white uppercase focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Temporal End</label>
                <input name="endDate" type="date" required value={formData.endDate} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 py-4 text-white uppercase focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Capacity</label>
                <input name="seats" type="number" min="1" max="100" required value={formData.seats} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 py-4 text-white uppercase focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>

            <textarea name="description" maxLength={500} value={formData.description} onChange={handleInputChange} placeholder="JOURNEY NARRATIVE..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white min-h-[160px] uppercase focus:outline-none focus:border-indigo-500" />

            <button type="submit" disabled={isSubmitting} className="w-full h-20 bg-white text-slate-950 rounded-2xl font-bold uppercase tracking-[0.6em] shadow-xl hover:bg-slate-100 transition-all disabled:opacity-20 flex items-center justify-center gap-6">
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <>Initialize Odyssey <Send size={18} /></>}
            </button>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-4 ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateTripPage;
