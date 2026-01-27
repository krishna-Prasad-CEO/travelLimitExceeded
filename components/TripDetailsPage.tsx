
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  X, MapPin, Calendar, Gauge, Users, 
  ArrowLeft, Sparkles, Navigation, 
  User, CheckCircle2, ShieldAlert, 
  Loader2, Share2, Heart, Clock, Check
} from 'lucide-react';
import { TripDetails } from '../types';
import { supabase } from '../supabaseClient';

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
  const [userRequestStatus, setUserRequestStatus] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const routeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Trip Details
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

        // 2. Fetch current user and check for existing requests
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: reqData } = await supabase
            .from('join_requests')
            .select('status')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (reqData) {
            setUserRequestStatus(reqData.status);
          }
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

  const handleJoinTrip = async () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (trip?.creatorId === currentUserId) {
      setNotification({ type: 'error', message: "You are the primary navigator of this odyssey." });
      return;
    }

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
        if (error.code === '23505') {
          throw new Error("Signal already in transit.");
        }
        throw error;
      }

      setUserRequestStatus('pending');
      setNotification({
        type: "success",
        message: "Signal transmitted to host."
      });

    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || "Link stabilization failed."
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
        <p className="text-[10px] font-official font-bold text-white/30 uppercase tracking-[0.6em]">Syncing manifest...</p>
      </div>
    );
  }

  if (!trip) return null;

  const isOwner = trip.creatorId === currentUserId;
  const buttonDisabled = isJoining || trip.availableSeats === 0 || !!userRequestStatus || isOwner;

  const getButtonContent = () => {
    if (isJoining) return <Loader2 className="animate-spin" />;
    if (isOwner) return "YOUR ODYSSEY";
    if (userRequestStatus === 'pending') return <span className="flex items-center gap-3"><Clock size={18}/> SIGNAL PENDING</span>;
    if (userRequestStatus === 'approved') return <span className="flex items-center gap-3"><Check size={18}/> AUTHORIZED</span>;
    if (userRequestStatus === 'rejected') return "SIGNAL DENIED";
    if (trip.availableSeats === 0) return "MANIFEST FULL";
    return <span className="flex items-center gap-4">REQUEST TO JOIN ODYSSEY <Navigation size={20}/></span>;
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full max-w-4xl h-[400px]" viewBox="0 0 1000 400">
            <path ref={routeRef} d="M150 200 Q 500 50 850 200" fill="none" stroke="url(#routeGradient)" strokeWidth="3" strokeLinecap="round" />
            <defs><linearGradient id="routeGradient"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient></defs>
          </svg>
        </div>
      </div>

      <div className="relative z-20 p-8 flex justify-between items-center">
        <button onClick={onClose} className="flex items-center gap-3 text-white/40 hover:text-white uppercase tracking-[0.4em] text-xs font-bold">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto custom-scrollbar">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl pb-32">
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-16 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h1 className="text-6xl md:text-7xl font-display font-bold text-white uppercase tracking-tighter">{trip.destination}</h1>
              <p className="text-white/40 uppercase tracking-widest font-official text-[10px]">{trip.startLocation} &rarr; {trip.startDate}</p>
            </div>
            <div className="flex flex-col items-end gap-6">
              <div className="flex items-center gap-4">
                 <img src={trip.creator.avatar} className="w-14 h-14 rounded-2xl border border-white/10" />
                 <p className="text-white font-bold uppercase text-[10px] tracking-widest">{isOwner ? "YOU (HOST)" : trip.creator.name}</p>
              </div>
              <span className={`px-5 py-2 rounded-xl border uppercase font-bold text-xs ${trip.availableSeats > 0 ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {trip.availableSeats} VACANT NODES
              </span>
            </div>
          </div>
          <div className="mt-8 p-12 bg-white/[0.02] border border-white/5 rounded-[2rem]">
            <p className="text-xl text-white/70 leading-relaxed font-light italic">"{trip.description || 'No narrative provided for this journey.'}"</p>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={handleJoinTrip} 
            disabled={buttonDisabled} 
            className="w-full h-20 bg-white text-slate-950 rounded-2xl font-bold uppercase tracking-[0.6em] hover:bg-slate-100 transition-all flex items-center justify-center gap-6 shadow-2xl disabled:opacity-20"
          >
            {getButtonContent()}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl flex items-center gap-4 ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            <span className="text-[10px] font-official font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetailsPage;
