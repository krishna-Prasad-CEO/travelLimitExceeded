
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, 
  Loader2, Compass, ShieldAlert, CheckCircle2, 
  X, Globe, Plane, Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
  onClose?: () => void;
}

const SubtleGlow = ({ color, delay, size, position }: { color: string, delay: number, size: string, position: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.03, 0.08, 0.03],
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: 12, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className={`absolute ${position} ${size} ${color} blur-[120px] rounded-full pointer-events-none z-0`}
  />
);

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onRegisterClick, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
  setIsLoading(true);

  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Login failed");
  }

  const data = await response.json();

  // Example: store JWT token
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  setStatus("success");
  setTimeout(onLoginSuccess, 1000);

} catch (err: any) {
  setStatus("error");
  setErrorMessage(
    err.message || "Unable to connect to authentication servers."
  );
} finally {
  setIsLoading(false);
}

  };

  return (
    <div className="relative w-full h-screen bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* Background with minimal glows */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#020617]" />
        <SubtleGlow color="bg-indigo-900" size="w-[800px] h-[800px]" position="-top-96 -left-96" delay={0} />
        <SubtleGlow color="bg-slate-800" size="w-[600px] h-[600px]" position="bottom-0 right-0" delay={2} />
      </div>

      {/* Branded Elements */}
      <div className="absolute top-12 left-12 z-20 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-2xl">
          <Compass className="text-white/40" size={18} />
        </div>
        <span className="text-sm font-display font-bold text-white/80 tracking-[0.4em] uppercase">
          TLE
        </span>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-12 right-12 z-50 p-3 rounded-full bg-slate-900 border border-slate-800 text-white/30 hover:text-white transition-all group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {/* Solid Matte Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        <div className="relative bg-slate-900 border border-slate-800 rounded-[1.5rem] p-10 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] space-y-8">
          
          <div className="space-y-1.5">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Passport Access</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em]">Verify digital manifest</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manifest ID</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-white/40 transition-colors" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL@TLE.TRAVEL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 pl-12 pr-6 text-white text-xs placeholder:text-slate-700 focus:outline-none focus:border-slate-700 transition-all uppercase tracking-widest font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Phrase</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-white/40 transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 pl-12 pr-12 text-white text-xs placeholder:text-slate-700 focus:outline-none focus:border-slate-700 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400 text-[9px] font-bold uppercase tracking-widest"
                >
                  <ShieldAlert size={14} />
                  {errorMessage}
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400 text-[9px] font-bold uppercase tracking-widest"
                >
                  <CheckCircle2 size={14} />
                  Access Granted
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || status === 'success'}
              className="group relative w-full h-12 bg-white text-slate-950 rounded-lg font-bold text-[10px] uppercase tracking-[0.4em] overflow-hidden hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-20"
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Authorize Entry <ArrowRight size={14} /></>}
              </div>
            </button>
          </form>

          <div className="space-y-6 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold">
                <span className="bg-slate-900 px-3 text-slate-600">Unified Auth</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center py-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 transition-colors text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Google
              </button>
              <button className="flex items-center justify-center py-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 transition-colors text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Apple
              </button>
            </div>
          </div>

          <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            No manifest?{' '}
            <button 
              onClick={onRegisterClick}
              className="text-white/60 hover:text-white transition-colors"
            >
              Enroll Traveler
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
