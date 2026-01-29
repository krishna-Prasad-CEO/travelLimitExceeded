
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, Plane, Signal, UserX, Loader2, CheckCircle2, Clock, Ban, Radio, Mail, RefreshCw, Send, ChevronRight, AlertCircle, Database, Shield
} from 'lucide-react';
import { TripSummary, JoinRequest } from '../types';
import { supabase } from '../supabaseClient';

interface MyTripsPageProps {
  onTripClick: (id: string) => void;
  onParticipantsClick: (id: string) => void;
  onClose: () => void;
}

const MyTripsPage: React.FC<MyTripsPageProps> = ({ onTripClick, onParticipantsClick, onClose }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<JoinRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<JoinRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'incoming' | 'sent'>('trips');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unidentified traveler.");

      console.log("LOG: Initiating Resilient Manifest Hub Sync for Node:", user.id);

      // 1. Fetch User's Created Trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;

      const mappedTrips: TripSummary[] = (tripsData || []).map(t => ({
        id: t.id,
        creatorId: t.creator_id,
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

      // 2. Fetch Incoming Signals (Multi-step process to avoid PGRST200 error)
      const hostedTripIds = mappedTrips.map(t => t.id);
      
      if (hostedTripIds.length > 0) {
        // Step A: Fetch raw requests and trip data (trips join is usually safe)
        const { data: rawRequests, error: reqError } = await supabase
          .from('join_requests')
          .select(`
            *,
            trips (id, destination, start_location)
          `)
          .in('trip_id', hostedTripIds)
          .order('created_at', { ascending: false });

        if (reqError) throw reqError;

        if (rawRequests && rawRequests.length > 0) {
          // Step B: Fetch Profiles separately for all involved users
          const userIds = Array.from(new Set(rawRequests.map(r => r.user_id)));
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);

          const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

          // Step C: Synthesize final data
          setIncomingRequests(rawRequests.map(r => {
            // Fix: Cast profile as any to access 'name' and 'email' properties which were reported as errors due to unknown type
            const profile = profileMap.get(r.user_id) as any;
            const tripInfo = Array.isArray(r.trips) ? r.trips[0] : r.trips;
            
            return {
              id: r.id,
              tripId: r.trip_id,
              tripRoute: tripInfo ? `${tripInfo.start_location} → ${tripInfo.destination}` : "Remote Sector",
              user: {
                name: profile?.name || `Traveler ${r.user_id.substring(0, 5)}`,
                email: profile?.email || "Identity Secured",
                avatar: `https://i.pravatar.cc/150?u=${r.user_id}`
              },
              status: r.status,
              timestamp: r.created_at
            };
          }));
        } else {
          setIncomingRequests([]);
        }
      }

      // 3. Fetch Sent Signals (Requests YOU sent)
      const { data: sentData, error: sentError } = await supabase
        .from('join_requests')
        .select(`
          *,
          trips (destination, start_location, creator_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!sentError && sentData) {
        setSentRequests(sentData.map(r => {
          const tripInfo = Array.isArray(r.trips) ? r.trips[0] : r.trips;
          return {
            id: r.id,
            tripId: r.trip_id,
            tripRoute: tripInfo ? `${tripInfo.start_location} → ${tripInfo.destination}` : "Target Odyssey",
            user: {
              name: "External Host",
              email: "Encrypted",
              avatar: `https://i.pravatar.cc/150?u=${tripInfo?.creator_id || r.trip_id}`
            },
            status: r.status,
            timestamp: r.created_at
          };
        }));
      }

    } catch (error) {
      console.error("LOG: Critical Sync failure:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setIsProcessing(requestId);
    try {
      const request = incomingRequests.find(r => r.id === requestId);
      if (!request) return;

      const { error: reqError } = await supabase
        .from('join_requests')
        .update({ status: action })
        .eq('id', requestId);
      
      if (reqError) throw reqError;

      if (action === 'approved') {
        const trip = trips.find(t => t.id === request.tripId);
        if (trip && trip.availableSeats > 0) {
          await supabase
            .from('trips')
            .update({ seats_left: trip.availableSeats - 1 })
            .eq('id', request.tripId);
          
          setTrips(prev => prev.map(t => 
            t.id === request.tripId ? { ...t, availableSeats: t.availableSeats - 1 } : t
          ));
        }
      }

      setIncomingRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: action } : req
      ));

    } catch (error) { 
      console.error("Authorization protocol failed:", error); 
    } finally {
      setIsProcessing(null);
    }
  };

  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 p-8 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <Briefcase size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-display font-bold text-white uppercase tracking-[0.2em]">Manifest Hub</h1>
        </div>
        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="relative z-10 px-8 md:px-12 pt-8 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('trips')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'trips' ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
            }`}
          >
            Your Odysseys ({trips.length})
          </button>
          <button 
            onClick={() => setActiveTab('incoming')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === 'incoming' ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
            }`}
          >
            Incoming Signals ({incomingRequests.length})
            {pendingIncomingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('sent')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'sent' ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'
            }`}
          >
            Sent Signals ({sentRequests.length})
          </button>
        </div>

        <button 
          onClick={() => fetchData(true)}
          className="hidden md:flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[9px] font-bold uppercase tracking-widest"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          Hard Re-Sync
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-8 md:px-12 mt-10 custom-scrollbar pb-32">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 opacity-30">
                <Loader2 className="animate-spin mb-6" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Stabilizing Signal Link...</p>
              </motion.div>
            ) : activeTab === 'trips' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
                {trips.length === 0 ? (
                  <div className="py-32 text-center opacity-20 uppercase tracking-widest text-xs font-bold">No host odysseys detected.</div>
                ) : trips.map(trip => (
                  <div key={trip.id} className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                    <div className="space-y-2 flex-1 cursor-pointer" onClick={() => onTripClick(trip.id)}>
                      <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{trip.destination}</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.1em]">{trip.startLocation} &rarr; {trip.startDate}</p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right flex-1 md:flex-none">
                        <span className={`text-sm font-bold uppercase ${trip.availableSeats > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {trip.availableSeats} / {trip.seats}
                        </span>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest">Nodes Open</p>
                      </div>
                      <button onClick={() => onParticipantsClick(trip.id)} className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-all text-[9px] font-bold uppercase tracking-widest">
                         <Radio size={14} className="animate-pulse" /> Command Center
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : activeTab === 'incoming' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {incomingRequests.length === 0 ? (
                  <div className="py-32 text-center space-y-6 opacity-30 flex flex-col items-center">
                    <Signal size={48} className="animate-pulse text-indigo-400" />
                    <p className="uppercase tracking-widest text-xs font-bold">No traveler signals intercepted.</p>
                    <div className="flex gap-4">
                       <button onClick={() => fetchData(true)} className="px-10 py-3 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-3">
                        <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} /> Manual Intercept
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-6 mb-4">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                        <Database size={10} /> Authorized Signal Ingress
                      </p>
                    </div>
                    {incomingRequests.map(req => (
                      <div key={req.id} className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <img src={req.user.avatar} className="w-16 h-16 rounded-2xl border border-white/10 shadow-xl group-hover:scale-105 transition-transform" />
                          <div className="space-y-1">
                            <p className="text-lg font-display font-bold text-white uppercase tracking-tight">{req.user.name}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">{req.tripRoute}</p>
                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>
                                {req.status === 'pending' ? 'INCOMING' : req.status === 'approved' ? 'AUTHORIZED' : 'DENIED'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          {req.status === 'pending' ? (
                            <>
                              <button disabled={!!isProcessing} onClick={() => handleAction(req.id, 'rejected')} className="p-4 rounded-2xl bg-white/5 text-red-400 border border-white/5 hover:bg-red-500/10 transition-all"><Ban size={18} /></button>
                              <button disabled={!!isProcessing} onClick={() => handleAction(req.id, 'approved')} className="flex-1 md:flex-none px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-4">
                                {isProcessing === req.id ? <Loader2 size={16} className="animate-spin" /> : <>Authorize <CheckCircle2 size={16} /></>}
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 text-white/20 uppercase font-bold text-[9px] tracking-widest">
                              {req.status === 'approved' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Ban size={16} className="text-red-500" />} Logged
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {sentRequests.length === 0 ? (
                  <div className="py-32 text-center space-y-6 opacity-30 flex flex-col items-center">
                    <Send size={48} className="opacity-30" />
                    <p className="uppercase tracking-widest text-xs font-bold">You haven't transmitted any join signals.</p>
                  </div>
                ) : sentRequests.map(req => (
                  <div key={req.id} onClick={() => onTripClick(req.tripId)} className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-8">
                      <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-white transition-colors">
                        <Plane size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-display font-bold text-white uppercase tracking-tight">{req.tripRoute}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {req.status === 'pending' ? 'TRANSMITTED' : req.status === 'approved' ? 'AUTHORIZED' : 'REFUSED'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
