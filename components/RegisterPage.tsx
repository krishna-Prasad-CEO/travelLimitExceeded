
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Loader2, Compass, X, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
  onClose?: () => void;
}

const SubtleGlow = ({ color, delay, size, position }: { color: string, delay: number, size: string, position: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.03, 0.06, 0.03],
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: 15, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className={`absolute ${position} ${size} ${color} blur-[140px] rounded-full pointer-events-none z-0`}
  />
);

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onLoginClick, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 'Intermediate',
    bikeType: 'Adventure',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name, // Changed from full_name to name
            phone_number: formData.phone,
            riding_experience: formData.experience,
            bike_type: formData.bikeType,
          },
        },
      });

      if (error) throw error;

      setStatus("success");
      setTimeout(onRegisterSuccess, 4000);

    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Enrollment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#020617]" />
        <SubtleGlow color="bg-slate-800" size="w-[800px] h-[800px]" position="-bottom-48 -right-48" delay={1} />
        <SubtleGlow color="bg-indigo-950" size="w-[600px] h-[600px]" position="top-0 left-0" delay={4} />
      </div>

      <div className="absolute top-12 left-12 z-20 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
          <Compass className="text-white/30" size={18} />
        </div>
        <span className="text-sm font-display font-bold text-white/70 tracking-[0.4em] uppercase">
          TLE
        </span>
      </div>

      {onClose && (
        <button onClick={onClose} className="absolute top-12 right-12 z-50 p-3 rounded-full bg-slate-900 border border-slate-800 text-white/30 transition-all">
          <X size={20} />
        </button>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[540px] px-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-10 md:p-14 space-y-10 shadow-2xl">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-display font-bold text-white uppercase">New Manifest</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">Enroll in Global Discovery</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" required value={formData.name} onChange={handleInputChange} placeholder="FULL NAME" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase" />
              <input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="EMAIL@DOMAIN" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase" />
            </div>
            <input name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="CONTACT NUMBER" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="experience" value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase">
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <select name="bikeType" value={formData.bikeType} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase">
                <option value="Adventure">Adventure</option>
                <option value="Sport">Sport</option>
                <option value="Off-Road">Off-Road</option>
              </select>
            </div>

            <input name="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="PASS-KEY (MIN 6 CHAR)" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white text-[10px] font-bold tracking-widest uppercase" />

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400 text-[9px] font-bold uppercase tracking-widest">
                  <ShieldAlert size={14} className="inline mr-2" /> {errorMessage}
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                  <CheckCircle2 size={14} className="inline mr-2" /> Verify your email to activate manifest.
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={isLoading || status === 'success'} className="w-full h-12 bg-white text-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-[0.4em] transition-all disabled:opacity-20 flex items-center justify-center gap-3">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Initialize Enrollment <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              Already enrolled? <button onClick={onLoginClick} className="text-white/60 hover:text-white transition-colors">Sign In</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
