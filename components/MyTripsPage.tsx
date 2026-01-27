
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, Plane, Signal, UserX, Loader2
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unidentified traveler.");

        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .eq('creator_id', user.id);

        if (tripsError) throw tripsError;

        setTrips((tripsData || []).map(t => ({
          id: t.id,
          startLocation: t.start_location,
          destination: t.destination,
          startDate: t.start_date,
          endDate: t.end_date,
          speed: t.speed,
          seats: t.total_seats,
          availableSeats: t.seats_left,
          status: t.status as any
        })));

        const tripIds = tripsData?.map(t => t.id) || [];
        if (tripIds.length > 0) {
          const { data: requestsData, error: requestsError } = await supabase
            .from('join_requests')
            .select(`*, trips (destination, start_location)`)
            .in('trip_id', tripIds);

          if (requestsError) throw requestsError;

          setRequests((requestsData || []).map(r => ({
            id: r.id,
            tripId: r.trip_id,
            tripRoute: `${r.trips.start_location} → ${r.trips.destination}`,
            user: {
              name: "Traveler",
              email: "Encrypted",
              avatar: `https://i.pravatar.cc/150?u=${r.user_id}`
            },
            status: r.status,
            timestamp: r.created_at
          })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: action })
        .eq('id', requestId);
      if (error) throw error;
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: action } : req));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      <div className="p-8 md:px-12 flex justify-between items-center bg-slate-950/80">
        <div className="flex items-center gap-6">
          <Briefcase size={24} className="text-white/80" />
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest">My Odysseys</h1>
        </div>
        <button onClick={onClose} className="p-3 text-white/30 hover:text-white"><X size={28} /></button>
      </div>

      <div className="px-8 md:px-12 pt-6 flex gap-6">
        <button onClick={() => setActiveTab('trips')} className={`px-10 py-4 rounded-2xl text-[11px] font-bold uppercase transition-all ${activeTab === 'trips' ? 'bg-white text-slate-950' : 'bg-slate-900/40 text-white/30'}`}>Created ({trips.length})</button>
        <button onClick={() => setActiveTab('requests')} className={`px-10 py-4 rounded-2xl text-[11px] font-bold uppercase transition-all ${activeTab === 'requests' ? 'bg-white text-slate-950' : 'bg-slate-900/40 text-white/30'}`}>Signals ({requests.filter(r => r.status === 'pending').length})</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 mt-10">
        <div className="max-w-6xl mx-auto pb-32">
          {isLoading ? <Loader2 className="animate-spin mx-auto mt-20" /> : 
            activeTab === 'trips' ? (
              <div className="space-y-6">
                {trips.map(trip => <div key={trip.id} onClick={() => onTripClick(trip.id)} className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 cursor-pointer hover:border-indigo-500/50 transition-all flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white uppercase">{trip.destination}</h3>
                    <p className="text-[10px] text-white/30 uppercase mt-1">{trip.startLocation} &rarr; {trip.startDate}</p>
                  </div>
                  <span className="text-teal-400 text-xs font-bold">{trip.availableSeats} VACANT</span>
                </div>)}
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map(req => <div key={req.id} className="bg-white/5 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <img src={req.user.avatar} className="w-12 h-12 rounded-xl" />
                    <div>
                      <p className="text-white font-bold uppercase">{req.tripRoute}</p>
                      <p className="text-[10px] text-white/30 uppercase">Status: {req.status}</p>
                    </div>
                  </div>
                  {req.status === 'pending' && <div className="flex gap-4">
                    <button onClick={() => handleAction(req.id, 'rejected')} className="p-3 text-red-400"><UserX size={18} /></button>
                    <button onClick={() => handleAction(req.id, 'approved')} className="px-6 py-2 bg-teal-500 text-slate-950 rounded-xl font-bold uppercase text-[10px]">Authorize</button>
                  </div>}
                </div>)}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage;
