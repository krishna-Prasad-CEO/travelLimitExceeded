
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, Plane, Signal, UserX, Loader2, CheckCircle2, Clock, Ban
} from 'lucide-react';
import { TripSummary, JoinRequest } from '../types';
import { supabase } from '../supabaseClient';

interface MyTripsPageProps {
  onTripClick: (id: string) => void;
  onClose: () => void;
}

const MyTripsPage: React.FC<MyTripsPageProps> = ({ onTripClick, onClose }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'requests'>('trips');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unidentified traveler.");

      // 1. Fetch User's Created Trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;

      const mappedTrips: TripSummary[] = (tripsData || []).map(t => ({
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

      setTrips(mappedTrips);

      // 2. Fetch Join Requests for these trips
      const tripIds = mappedTrips.map(t => t.id);
      if (tripIds.length > 0) {
        const { data: requestsData, error: requestsError } = await supabase
          .from('join_requests')
          .select(`*, trips (destination, start_location)`)
          .in('trip_id', tripIds)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        setRequests((requestsData || []).map(r => ({
          id: r.id,
          tripId: r.trip_id,
          tripRoute: `${r.trips.start_location} → ${r.trips.destination}`,
          user: {
            name: "Traveler Node",
            email: "Secure ID",
            avatar: `https://i.pravatar.cc/150?u=${r.user_id}`
          },
          status: r.status,
          timestamp: r.created_at
        })));
      }
    } catch (error) {
      console.error("Data sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setIsProcessing(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // 1. Update Join Request Status
      const { error: reqError } = await supabase
        .from('join_requests')
        .update({ status: action })
        .eq('id', requestId);
      
      if (reqError) throw reqError;

      // 2. If approved, decrement seats_left in the trips table
      if (action === 'approved') {
        const trip = trips.find(t => t.id === request.tripId);
        if (trip && trip.availableSeats > 0) {
          const { error: tripError } = await supabase
            .from('trips')
            .update({ seats_left: trip.availableSeats - 1 })
            .eq('id', request.tripId);
          
          if (tripError) throw tripError;

          // Update local trips state for immediate visual feedback
          setTrips(prev => prev.map(t => 
            t.id === request.tripId ? { ...t, availableSeats: t.availableSeats - 1 } : t
          ));
        }
      }

      // 3. Update local requests state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: action } : req
      ));

    } catch (error) { 
      console.error("Action failed:", error); 
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 p-8 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <Briefcase size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-display font-bold text-white uppercase tracking-[0.2em]">Manifest Control</h1>
        </div>
        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="relative z-10 px-8 md:px-12 pt-8 flex gap-4">
        <button 
          onClick={() => setActiveTab('trips')} 
          className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'trips' ? 'bg-white text-slate-950' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
          }`}
        >
          Your Odysseys ({trips.length})
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'requests' ? 'bg-white text-slate-950' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
          }`}
        >
          Incoming Signals ({requests.filter(r => r.status === 'pending').length})
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-8 md:px-12 mt-10 custom-scrollbar pb-32">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 opacity-30">
                <Loader2 className="animate-spin mb-6" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Syncing Neural Hub...</p>
              </motion.div>
            ) : activeTab === 'trips' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
                {trips.length === 0 ? (
                  <div className="py-32 text-center opacity-20 uppercase tracking-widest text-xs font-bold">No active odysseys registered.</div>
                ) : trips.map(trip => (
                  <div 
                    key={trip.id} 
                    onClick={() => onTripClick(trip.id)} 
                    className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{trip.destination}</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.1em]">{trip.startLocation} &rarr; {trip.startDate}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className={`text-sm font-bold uppercase ${trip.availableSeats > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {trip.availableSeats} / {trip.seats}
                        </span>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Nodes Vacant</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-950 transition-all">
                        <Signal size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {requests.length === 0 ? (
                  <div className="py-32 text-center opacity-20 uppercase tracking-widest text-xs font-bold">No incoming signals detected.</div>
                ) : requests.map(req => (
                  <div key={req.id} className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="relative">
                        <img src={req.user.avatar} className="w-16 h-16 rounded-2xl border border-white/10 shadow-xl" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                          req.status === 'approved' ? 'bg-emerald-500' : req.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-display font-bold text-white uppercase tracking-tight">{req.tripRoute}</p>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                            req.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : req.status === 'rejected' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {req.status === 'pending' ? 'INCOMING SIGNAL' : req.status === 'approved' ? 'AUTHORIZED' : 'ACCESS DENIED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {req.status === 'pending' ? (
                        <>
                          <button 
                            disabled={!!isProcessing}
                            onClick={() => handleAction(req.id, 'rejected')} 
                            className="p-4 rounded-2xl bg-white/5 text-red-400 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center gap-2"
                          >
                            <Ban size={18} />
                            <span className="md:hidden text-[10px] font-bold uppercase">Deny</span>
                          </button>
                          <button 
                            disabled={!!isProcessing}
                            onClick={() => handleAction(req.id, 'approved')} 
                            className="flex-1 md:flex-none px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-4 shadow-xl"
                          >
                            {isProcessing === req.id ? <Loader2 size={16} className="animate-spin" /> : <>Authorize <CheckCircle2 size={16} /></>}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 text-white/20 uppercase font-bold text-[9px] tracking-widest">
                          {req.status === 'approved' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Ban size={16} className="text-red-500" />}
                          Signal Logged
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage;
