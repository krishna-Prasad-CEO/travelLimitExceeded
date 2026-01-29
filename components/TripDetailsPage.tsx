
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  X, MapPin, Calendar, Gauge, Users, 
  ArrowLeft, Sparkles, Navigation, 
  User, CheckCircle2, ShieldAlert, 
  Loader2, Share2, Heart, Clock, Check,
  Zap, Compass, Target, Globe, Radio
} from 'lucide-react';
import { TripDetails } from '../types';
import { supabase } from '../supabaseClient';

interface TripDetailsPageProps {
  tripId: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onOpenCommandCenter: (id: string) => void;
  onClose: () => void;
}

const TripDetailsPage: React.FC<TripDetailsPageProps> = ({ 
  tripId, 
  isAuthenticated, 
  onLoginRequired, 
  onOpenCommandCenter,
  onClose 
}) => {
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [userRequestStatus, setUserRequestStatus] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const routeRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (tripError) throw tripError;

        setTrip({
          id: tripData.id,
          creatorId: tripData.creator_id,
          startLocation: tripData.start_location,
          destination: tripData.destination,
          startDate: tripData.start_date,
          endDate: tripData.end_date,
          speed: tripData.speed,
          seats: tripData.total_seats,
          availableSeats: tripData.seats_left,
          description: tripData.description,
          creator: {
            name: "Trajectory Host",
            avatar: `https://i.pravatar.cc/150?u=${tripData.creator_id}`
          }
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: reqData } = await supabase
            .from('join_requests')
            .select('status')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (reqData) setUserRequestStatus(reqData.status);
        }

      } catch (error) {
        console.error("Failed to sync odyssey manifest", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [tripId]);

  useEffect(() => {
    if (trip && routeRef.current) {
      gsap.fromTo(routeRef.current, 
        { strokeDashoffset: 1000, strokeDasharray: 1000 },
        { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 }
      );
    }
  }, [trip]);

  const handleAction = async () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (isOwner || userRequestStatus === 'approved') {
      onOpenCommandCenter(tripId);
      return;
    }

    if (userRequestStatus === 'pending') return;

    setIsJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Manifest authorization required.");

      const { error } = await supabase
        .from('join_requests')
        .insert([{
          trip_id: tripId,
          user_id: user.id,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Signal already in transit.");
        throw error;
      }

      setUserRequestStatus('pending');
      setNotification({ type: "success", message: "Signal transmitted to host." });
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || "Link stabilization failed." });
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
        <p className="text-[10px] font-official font-bold text-white/30 uppercase tracking-[0.6em]">Syncing manifest...</p>
      </div>
    );
  }

  if (!trip) return null;

  const isOwner = trip.creatorId === currentUserId;
  const isApproved = userRequestStatus === 'approved';
  const buttonDisabled = isJoining || (trip.availableSeats === 0 && !isOwner && !isApproved) || userRequestStatus === 'rejected';

  const getButtonContent = () => {
    if (isJoining) return <Loader2 className="animate-spin" />;
    if (isOwner) return <span className="flex items-center gap-4">OPEN COMMAND CENTER <Radio size={18} className="animate-pulse" /></span>;
    if (isApproved) return <span className="flex items-center gap-4">ENTER COMMAND CENTER <Radio size={18} className="animate-pulse" /></span>;
    if (userRequestStatus === 'pending') return <span className="flex items-center gap-3"><Clock size={18}/> SIGNAL PENDING</span>;
    if (userRequestStatus === 'rejected') return "SIGNAL REFUSED";
    if (trip.availableSeats === 0) return "MANIFEST FULL";
    return <span className="flex items-center gap-4">REQUEST ODYSSEY JOIN <Navigation size={20}/></span>;
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#020617] overflow-hidden flex flex-col">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <svg className="w-full max-w-6xl h-[500px]" viewBox="0 0 1000 400">
            <path ref={routeRef} d="M100 250 Q 500 80 900 250" fill="none" stroke="url(#routeGradient)" strokeWidth="1" strokeLinecap="round" strokeDasharray="5,10" />
            <defs>
                <linearGradient id="routeGradient"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Header Actions */}
      <div className="relative z-20 p-8 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-white/5">
        <button onClick={onClose} className="flex items-center gap-4 text-white/40 hover:text-white transition-all group">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="uppercase tracking-[0.4em] text-[9px] font-bold">Return to Manifest</span>
        </button>
        <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)] animate-pulse" />
             <span className="text-[9px] font-official font-bold text-white/30 uppercase tracking-[0.2em]">Link Stabilized</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 overflow-y-auto custom-scrollbar pt-12">
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-6xl space-y-12 pb-48"
        >
          {/* Main Hero Card */}
          <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 md:p-20 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
                <Globe size={300} />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
              <div className="space-y-8 flex-1">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Sparkles size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Active Odyssey</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-display font-bold text-white uppercase tracking-tighter leading-none">
                        {trip.destination}
                    </h1>
                    <div className="flex items-center gap-6">
                        <p className="text-teal-400 font-official font-bold text-xs uppercase tracking-[0.3em]">
                            {trip.startLocation} &bull; <span className="text-white/40">{trip.startDate}</span>
                        </p>
                    </div>
                </div>

                {/* Description Narrative */}
                <div className="relative max-w-2xl">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent opacity-30 rounded-full" />
                    <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light font-handwritten italic">
                        "{trip.description || 'Our trajectory remains undefined. The narrative of this odyssey is yet to be inscribed.'}"
                    </p>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="w-full lg:w-[320px] space-y-6">
                <div className="bg-slate-950/50 rounded-3xl p-8 border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-official font-bold text-white/30 uppercase tracking-[0.3em]">{isOwner ? "YOUR PROFILE" : "Trajectory Host"}</span>
                        <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${isOwner ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                    </div>
                    <div className="flex items-center gap-4">
                        <img src={trip.creator.avatar} className="w-16 h-16 rounded-2xl border border-white/10 shadow-2xl" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{isOwner ? "YOU (HOST)" : trip.creator.name}</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest font-official">Lead Navigator</p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-official font-bold text-white/40 uppercase">Vessel Occupancy</span>
                            <span className="text-xs font-bold text-teal-400">{trip.availableSeats} LEFT</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(trip.availableSeats / trip.seats) * 100}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                            />
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Time Horizon', value: `${trip.seats} Cycles`, icon: Clock, color: 'text-indigo-400' },
              { label: 'Signal Range', value: 'Level 04', icon: Target, color: 'text-teal-400' },
              { label: 'Vessel Node', value: trip.seats, icon: Users, color: 'text-fuchsia-400' },
              { label: 'Speed Index', value: '3.4 G/s', icon: Zap, color: 'text-yellow-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all group">
                <stat.icon className={`${stat.color} mb-6 group-hover:scale-110 transition-transform`} size={20} />
                <p className="text-[9px] font-official font-bold text-white/20 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                <p className="text-xl font-display font-bold text-white uppercase tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-30">
        <div className="max-w-6xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAction} 
            disabled={buttonDisabled} 
            className={`w-full h-24 rounded-3xl font-bold uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-6 shadow-2xl text-[11px] border ${
                isOwner || isApproved
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_50px_rgba(79,70,229,0.3)]'
                : 'bg-white text-slate-950 hover:bg-indigo-50 disabled:opacity-20 disabled:cursor-not-allowed'
            }`}
          >
            {getButtonContent()}
          </motion.button>
        </div>
      </div>

      {/* Notification System */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed bottom-40 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-4 ${
                notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16}/> : <ShieldAlert size={16}/>}
            <span className="text-[10px] font-official font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetailsPage;
