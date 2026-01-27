
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  X, MapPin, Calendar, Gauge, Users, 
  ArrowLeft, Sparkles, Navigation, 
  User, CheckCircle2, ShieldAlert, 
  Loader2, Info, Share2, Heart
} from 'lucide-react';
import { TripDetails } from '../types';

interface TripDetailsPageProps {
  tripId: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onClose: () => void;
}

const TripDetailsPage: React.FC<TripDetailsPageProps> = ({ 
  tripId, 
  isAuthenticated, 
  onLoginRequired, 
  onClose 
}) => {
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const routeRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      setIsLoading(true);
      try {
  setIsLoading(true);

  const response = await fetch(
    `http://localhost:8080/api/trips/${tripId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // If JWT secured:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trip details");
  }

  const tripData: TripDetails = await response.json();
  setTrip(tripData);

} catch (error) {
  console.error("Failed to fetch trip details", error);
} finally {
  setIsLoading(false);
}

    };

    fetchTripDetails();
  }, [tripId]);

  useEffect(() => {
    if (trip && routeRef.current) {
      gsap.fromTo(routeRef.current, 
        { strokeDashoffset: 1000, strokeDasharray: 1000 },
        { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 }
      );
    }
  }, [trip]);

  const handleJoinTrip = async () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    setIsJoining(true);
    try {
  setIsJoining(true);

  const response = await fetch(
    `http://localhost:8080/api/trips/${tripId}/join`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If secured with JWT:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send join request");
  }

  setNotification({
    type: "success",
    message: "Join request transmitted to the host."
  });

} catch (error: any) {
  setNotification({
    type: "error",
    message: error.message || "Link stabilization failed. Please retry."
  });
} finally {
  setIsJoining(false);
}

  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-indigo-500 animate-spin mb-6" />
        <p className="text-[10px] font-official font-bold text-white/30 uppercase tracking-[0.6em]">Syncing Odyssey Data...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#020617] overflow-hidden flex flex-col">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950" />
        
        {/* Animated World Map Simplified */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
           <svg className="w-[120%] h-[120%] text-white/5" viewBox="0 0 1000 600">
             <path d="M100 300 Q 500 50 900 300" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
             <path d="M100 300 Q 500 550 900 300" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
           </svg>
        </div>

        {/* Dynamic Route Line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full max-w-4xl h-[400px]" viewBox="0 0 1000 400">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path 
              ref={routeRef}
              d="M150 200 Q 500 50 850 200" 
              fill="none" 
              stroke="url(#routeGradient)" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            {/* Start Pulse Pin */}
            <motion.circle 
              cx="150" cy="200" r="6" fill="#6366f1" 
              animate={{ r: [6, 12, 6], opacity: [1, 0.4, 1] }} 
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* End Pulse Pin */}
            <motion.circle 
              cx="850" cy="200" r="6" fill="#2dd4bf" 
              animate={{ r: [6, 12, 6], opacity: [1, 0.4, 1] }} 
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </svg>
        </div>
      </div>

      {/* Header Overlay */}
      <div className="relative z-20 p-8 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <button 
          onClick={onClose}
          className="group flex items-center gap-3 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-[0.4em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Grid
        </button>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/5">
            <Share2 size={16} />
          </button>
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/5">
            <Heart size={16} />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto custom-scrollbar pt-12 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          {/* Glass Hero Info */}
          <div className="relative group mb-12">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 to-teal-500/20 rounded-[3rem] blur-sm opacity-50" />
            <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
              
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  Verified Odyssey
                </div>
                <h1 className="text-4xl md:text-7xl font-display font-bold text-white uppercase tracking-tighter leading-none">
                  {trip.destination}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/40 text-sm font-official tracking-wider">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-400" />
                    <span>FROM: {trip.startLocation}</span>
                  </div>
                </div>
              </div>

              <div className="w-px h-32 bg-white/10 hidden md:block" />

              <div className="flex flex-col items-center md:items-end gap-6">
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Organized By</p>
                       <p className="text-white font-display font-bold">{trip.creator.name}</p>
                    </div>
                    <img src={trip.creator.avatar} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="Host" />
                 </div>
                 <div className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border shadow-xl ${
                   trip.availableSeats > 0 ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                 }`}>
                   {trip.availableSeats} Seats Available
                 </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Info */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 space-y-6">
                <h3 className="text-[10px] font-official font-bold text-white/30 uppercase tracking-[0.4em]">Odyssey Narrative</h3>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light">
                  {trip.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Trajectory Dates</p>
                    <p className="text-white font-official font-bold">{trip.startDate} — {trip.endDate}</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Velocity Scale</p>
                    <p className="text-white font-official font-bold">{trip.speed}x Expansion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-8">
               <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-10 space-y-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <span>Manifest Status</span>
                      <CheckCircle2 size={14} className="text-teal-400" />
                    </div>
                    <div className="flex items-end justify-between">
                       <div>
                          <p className="text-4xl font-display font-bold text-white">{trip.seats}</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-1">Total Capacity</p>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-display font-bold text-teal-400">{trip.availableSeats}</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-1">Vacancies</p>
                       </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-white/50">
                      <Users size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Cohort</span>
                    </div>
                    <div className="flex -space-x-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-white/5 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                        +2
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/20 font-handwritten italic text-center">
                    "Every journey starts with a single decision"
                  </p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile / Fixed Bottom for Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-[510] p-6 md:p-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleJoinTrip}
            disabled={isJoining || trip.availableSeats === 0}
            className="group relative w-full h-20 bg-white text-slate-950 rounded-2xl font-official font-bold text-xs uppercase tracking-[0.6em] overflow-hidden shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-20"
          >
            <div className="flex items-center justify-center gap-6 relative z-10">
              {isJoining ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Requesting Sync...
                </>
              ) : (
                <>
                  {trip.availableSeats === 0 ? 'Trajectory Full' : 'Request to Join Odyssey'}
                  <Navigation size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-4 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
            <span className="text-[10px] font-official font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TripDetailsPage;
