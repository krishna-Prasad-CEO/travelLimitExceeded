
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, ShieldCheck, ArrowLeft, 
  Loader2, Mail, User, Radio, 
  Target, Globe, Navigation, MessageSquare, AlertCircle, Database
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { TripDetails } from '../types';

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface TripParticipantsPageProps {
  tripId: string;
  onClose: () => void;
}

const TripParticipantsPage: React.FC<TripParticipantsPageProps> = ({ tripId, onClose }) => {
  const [trip, setTrip] = useState<any | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<'none' | 'denied' | 'error'>('none');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorStatus('none');
      try {
        // 1. Get current authenticated user session for identity fallback
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setErrorStatus('denied');
          return;
        }
        setCurrentUser(authUser);

        // 2. Fetch Trip Details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (tripError || !tripData) {
          console.error("LOG: Manifest lookup failure:", tripError);
          setErrorStatus('error');
          return;
        }

        // 3. Verify Access (Host or Approved)
        const isHost = String(tripData.creator_id) === String(authUser.id);
        let isApproved = false;

        if (!isHost) {
          const { data: reqData } = await supabase
            .from('join_requests')
            .select('status')
            .eq('trip_id', tripId)
            .eq('user_id', authUser.id)
            .eq('status', 'approved')
            .maybeSingle();
          
          if (reqData && reqData.status === 'approved') isApproved = true;
        }

        if (!isHost && !isApproved) {
          setErrorStatus('denied');
          return;
        }

        // 4. Fetch Host Profile for full Identity (Name + Email)
        const { data: hostProfile } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', tripData.creator_id)
          .single();

        // If the current user is the host, we can also use their session metadata
        const hostName = (isHost ? (authUser.user_metadata?.name || hostProfile?.name) : hostProfile?.name) || "Lead Navigator";
        const hostEmail = (isHost ? authUser.email : hostProfile?.email) || "Identity Secured";

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
            name: hostName,
            email: hostEmail,
            avatar: `https://i.pravatar.cc/150?u=${tripData.creator_id}`
          }
        });

        setIsLoading(false); 

        // 5. Fetch Approved Participants
        setIsParticipantsLoading(true);
        
        const { data: requests, error: requestsError } = await supabase
          .from('join_requests')
          .select('user_id, status')
          .eq('trip_id', tripId)
          .eq('status', 'approved');

        if (requestsError) throw requestsError;

        if (requests && requests.length > 0) {
          const userIds = requests.map(r => r.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);

          const profileMap = new Map((profiles || []).map(p => [p.id, p]));

          const filteredParticipants = requests
            .filter(r => String(r.user_id) !== String(tripData.creator_id))
            .map(r => {
              const profile = profileMap.get(r.user_id) as any;
              const isMe = String(r.user_id) === String(authUser.id);
              
              // Resilience: If profile table is empty/missing (due to RLS or sync delay), 
              // and it's the current user, use the auth session data.
              const pName = (isMe ? (authUser.user_metadata?.name || profile?.name) : profile?.name) || `Traveler ${r.user_id.substring(0, 5)}`;
              const pEmail = (isMe ? authUser.email : profile?.email) || "Identity Secured";

              return {
                id: r.user_id,
                name: pName,
                email: pEmail,
                avatar: `https://i.pravatar.cc/150?u=${r.user_id}`
              };
            });
          
          setParticipants(filteredParticipants);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        console.error("LOG: Critical link room error:", err);
        setErrorStatus('error');
      } finally {
        setIsParticipantsLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[600] bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-teal-500 animate-spin mb-6" />
        <p className="text-[10px] font-official font-bold text-white/30 uppercase tracking-[0.6em]">Establishing Link...</p>
      </div>
    );
  }

  if (errorStatus === 'denied') {
    return (
      <div className="fixed inset-0 z-[600] bg-[#020617] flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-8">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-4">Access Denied</h2>
        <p className="text-white/30 text-sm font-official uppercase text-center max-w-sm">Approved entry status required for this manifest.</p>
        <button onClick={onClose} className="mt-12 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[0.4em] transition-all">Return</button>
      </div>
    );
  }

  const activeNodeCount = 1 + participants.length;

  return (
    <div className="fixed inset-0 z-[600] bg-[#020617] flex flex-col overflow-hidden">
      <div className="relative z-10 p-8 flex justify-between items-center bg-slate-950/80 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-white uppercase tracking-[0.1em]">
              {trip?.destination} Manifest
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Radio size={12} className="text-teal-400 animate-pulse" />
              <span className="text-[9px] font-official font-bold text-teal-400 uppercase tracking-widest">Secure Link Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 bg-slate-900/40 border-r border-white/5 p-8 space-y-12 overflow-y-auto custom-scrollbar">
          <section className="space-y-6">
            <h2 className="text-[10px] font-official font-bold text-white/20 uppercase tracking-[0.4em]">Odyssey Telemetry</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Departure</p>
                <p className="text-sm font-bold text-white uppercase">{trip?.startLocation}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Window</p>
                <p className="text-sm font-bold text-white uppercase">{trip?.startDate}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-slate-950/50">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Confirmed Nodes</h2>
              <div className="px-6 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                {isParticipantsLoading && <Loader2 size={12} className="animate-spin" />}
                {activeNodeCount} ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lead Navigator Card (Host) */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] p-8 flex items-center justify-between transition-all hover:bg-indigo-500/20">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <img src={trip?.creator.avatar} className="w-16 h-16 rounded-2xl border border-indigo-500/30 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {trip?.creator.name} {String(trip?.creatorId) === String(currentUser?.id) && '(YOU)'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-indigo-400 font-official uppercase tracking-widest">Primary Host</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-white/60">
                        <Mail size={12} className="flex-shrink-0" />
                        <p className="text-[10px] font-official uppercase tracking-widest break-all">{trip?.creator.email}</p>
                      </div>
                    </div>
                  </div>
                  <Target size={20} className="text-indigo-400 flex-shrink-0 ml-4" />
                </div>
              </div>

              {/* Participant Cards */}
              {participants.map((p) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p.id}
                  className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center gap-6 overflow-hidden">
                    <img src={p.avatar} className="w-14 h-14 rounded-2xl border border-white/10 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-white uppercase group-hover:text-teal-400 transition-colors">
                        {p.name} {String(p.id) === String(currentUser?.id) && '(YOU)'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-white/50">
                        <Mail size={12} className="flex-shrink-0" />
                        <p className="text-[9px] font-official uppercase tracking-widest break-all">{p.email}</p>
                      </div>
                    </div>
                  </div>
                  <MessageSquare size={16} className="text-white/20 group-hover:text-white transition-all flex-shrink-0 ml-2" />
                </motion.div>
              ))}

              {/* Empty Nodes */}
              {!isParticipantsLoading && Array.from({ length: trip?.availableSeats || 0 }).map((_, i) => (
                <div key={i} className="bg-white/[0.01] border border-dashed border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center opacity-20">
                  <span className="text-[9px] font-official uppercase tracking-[0.4em] font-bold">Node Vacant</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripParticipantsPage;
