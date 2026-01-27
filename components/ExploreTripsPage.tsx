
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Globe, Plane, ArrowRight, Loader2, Calendar, Gauge, Users, TrendingUp,
  Navigation, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { TripSummary } from '../types';
import { supabase } from '../supabaseClient';

interface ExploreTripsPageProps {
  onTripClick: (id: string) => void;
  onClose: () => void;
}

const ExploreTripsPage: React.FC<ExploreTripsPageProps> = ({ onTripClick, onClose }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'high-speed'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const tripsData: TripSummary[] = (data || []).map(t => ({
          id: t.id,
          startLocation: t.start_location,
          destination: t.destination,
          startDate: t.start_date,
          endDate: t.end_date,
          speed: t.speed,
          seats: t.total_seats,
          availableSeats: t.seats_left,
          status: t.status as any
        }));

        setTrips(tripsData);
        setFilteredTrips(tripsData);

      } catch (error) {
        console.error("Failed to sync global manifest", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  useEffect(() => {
    let result = trips;
    if (searchQuery) {
      result = result.filter(t => 
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.startLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilter === 'available') result = result.filter(t => t.availableSeats > 0);
    else if (activeFilter === 'high-speed') result = result.filter(t => t.speed >= 3.0);
    setFilteredTrips(result);
  }, [searchQuery, activeFilter, trips]);

  const handleJoinRequest = async (e: React.MouseEvent, trip: TripSummary) => {
    e.stopPropagation(); // Prevent card click
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setNotification({ type: 'error', message: "Identity verification required. Sign in first." });
      return;
    }

    setJoiningId(trip.id);
    try {
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          trip_id: trip.id,
          user_id: user.id,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Signal already in transit for this node.");
        throw error;
      }

      setNotification({ type: 'success', message: "Join request transmitted successfully." });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || "Link stabilization failed." });
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 p-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-4">
          <Globe size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Global Odyssey</h1>
        </div>
        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="relative z-10 px-8 md:px-12 py-6 flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
          <input 
            type="text" 
            placeholder="LOCATE TARGET NODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm text-white uppercase focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-8 md:px-12 pb-32 custom-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />)}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <Plane size={64} className="animate-bounce" />
              <h3 className="text-2xl font-display font-bold text-white mt-8 uppercase">No Signals</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <ExploreCard 
                  key={trip.id} 
                  trip={trip} 
                  onInspect={() => onTripClick(trip.id)} 
                  onJoin={(e) => handleJoinRequest(e, trip)}
                  isJoining={joiningId === trip.id}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-4 ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExploreCard: React.FC<{ 
  trip: TripSummary, 
  onInspect: () => void, 
  onJoin: (e: React.MouseEvent) => void,
  isJoining: boolean
}> = ({ trip, onInspect, onJoin, isJoining }) => (
  <motion.div
    whileHover={{ y: -5 }}
    onClick={onInspect}
    className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer shadow-xl transition-all group"
  >
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-display font-bold text-white uppercase leading-tight">{trip.destination}</h3>
        <span className={`px-4 py-1.5 rounded-full text-[8px] font-bold border ${trip.status === 'full' ? 'border-red-500/20 text-red-400' : 'border-teal-500/20 text-teal-400'}`}>
          {trip.status}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] text-white/30 uppercase tracking-widest">{trip.startLocation} &rarr; {trip.startDate}</p>
        <p className="text-xs text-teal-400 font-bold uppercase">{trip.availableSeats} VACANT NODES</p>
      </div>
    </div>
    <div className="mt-8 flex flex-col gap-3">
      <button 
        onClick={onJoin}
        disabled={isJoining || trip.availableSeats === 0}
        className="w-full h-14 bg-white text-slate-950 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-lg disabled:opacity-20"
      >
        {isJoining ? <Loader2 size={16} className="animate-spin" /> : <>Request to Join <Navigation size={14} /></>}
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onInspect(); }}
        className="w-full h-14 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-bold uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        Inspect Manifest <ArrowRight size={14} />
      </button>
    </div>
  </motion.div>
);

export default ExploreTripsPage;
