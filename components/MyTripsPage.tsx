
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  X, Briefcase, MapPin, Calendar, 
  Users, Check, ArrowRight, Loader2, 
  Sparkles, Globe, Compass, Bell,
  ChevronDown, ChevronUp, UserCheck, UserX,
  Plane, Signal, Activity
} from 'lucide-react';
import { TripSummary, JoinRequest } from '../types';

interface MyTripsPageProps {
  onTripClick: (id: string) => void;
  onClose: () => void;
}

// Added interfaces to fix prop type assignment errors
interface RequestGroupProps {
  tripName: string;
  requests: JoinRequest[];
  onAction: (id: string, a: 'approved' | 'rejected') => void | Promise<void>;
}

interface RequestCardProps {
  request: JoinRequest;
  onAction: (id: string, a: 'approved' | 'rejected') => void | Promise<void>;
}

const MyTripsPage: React.FC<MyTripsPageProps> = ({ onTripClick, onClose }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'requests'>('trips');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockTrips: TripSummary[] = [
          {
            id: 'trip-1',
            startLocation: 'San Francisco',
            destination: 'Tokyo',
            startDate: '2025-06-15',
            endDate: '2025-06-25',
            speed: 2.5,
            seats: 8,
            availableSeats: 3,
            status: 'active'
          },
          {
            id: 'trip-2',
            startLocation: 'London',
            destination: 'Reykjavik',
            startDate: '2025-12-01',
            endDate: '2025-12-08',
            speed: 1.0,
            seats: 4,
            availableSeats: 0,
            status: 'full'
          }
        ];

        const mockRequests: JoinRequest[] = [
          {
            id: 'req-1',
            tripId: 'trip-1',
            tripRoute: 'Tokyo Odyssey',
            user: {
              name: 'Aris Thorne',
              email: 'aris@nexus.com',
              avatar: 'https://i.pravatar.cc/150?u=aris'
            },
            status: 'pending',
            timestamp: '2 hours ago'
          },
          {
            id: 'req-2',
            tripId: 'trip-1',
            tripRoute: 'Tokyo Odyssey',
            user: {
              name: 'Luna Vane',
              email: 'luna@orbit.travel',
              avatar: 'https://i.pravatar.cc/150?u=luna'
            },
            status: 'pending',
            timestamp: '5 hours ago'
          }
        ];

        setTrips(mockTrips);
        setRequests(mockRequests);
      } catch (error) {
        console.error('Failed to sync manifests', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cinematic GSAP Entrance
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".dashboard-header", {
          y: -50,
          opacity: 0,
          duration: 1,
          ease: "expo.out"
        });
        gsap.from(".dashboard-tabs", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out"
        });
        gsap.from(".trip-card-item", {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.4,
          ease: "back.out(1.2)"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, activeTab]);

  // Parallax Background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bgRef.current) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        gsap.to(bgRef.current, { x, y, duration: 2, ease: "power2.out" });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Real-time Update Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.8) {
        const newReq: JoinRequest = {
          id: `req-${Date.now()}`,
          tripId: 'trip-1',
          tripRoute: 'Tokyo Odyssey',
          user: {
            name: 'Kaelen Vance',
            email: 'kaelen@echo.io',
            avatar: 'https://i.pravatar.cc/150?u=kaelen'
          },
          status: 'pending',
          timestamp: 'just now'
        };
        setRequests(prev => [newReq, ...prev]);
        setNotification({ type: 'info', message: 'New join signal detected: Tokyo Odyssey' });
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: action } : req));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setNotification({ type: 'success', message: `Manifest ${action === 'approved' ? 'authorized' : 'revoked'}.` });
    } catch (error) {
      setNotification({ type: 'error', message: 'Sync error. Reverting change.' });
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      {/* Background with Ambient Motion */}
      <div ref={bgRef} className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      {/* Header */}
      <div className="dashboard-header relative z-10 p-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group overflow-hidden relative">
            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
            <Briefcase size={24} className="text-white/80 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest leading-none mb-1">My Odysseys</h1>
            <p className="text-[10px] text-white/30 font-official font-bold uppercase tracking-[0.5em]">Manage your journeys, one decision at a time</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <Bell size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white/30 hover:text-white transition-all border border-white/10 shadow-xl"
          >
            <X size={28} />
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs relative z-10 px-8 md:px-12 pt-6 flex gap-6">
        <button 
          onClick={() => setActiveTab('trips')}
          className={`group flex items-center gap-4 px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] transition-all border relative overflow-hidden ${
            activeTab === 'trips' 
              ? 'bg-white text-slate-950 border-white shadow-[0_20px_40px_rgba(0,0,0,0.4)]' 
              : 'bg-slate-900/40 text-white/30 border-white/5 hover:border-white/20'
          }`}
        >
          <Compass size={16} />
          Created ({trips.length})
          {activeTab === 'trips' && <motion.div layoutId="tab-highlight" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`group flex items-center gap-4 px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] transition-all border relative overflow-hidden ${
            activeTab === 'requests' 
              ? 'bg-white text-slate-950 border-white shadow-[0_20px_40px_rgba(0,0,0,0.4)]' 
              : 'bg-slate-900/40 text-white/30 border-white/5 hover:border-white/20'
          }`}
        >
          <Signal size={16} />
          Signals ({requests.filter(r => r.status === 'pending').length})
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
          )}
          {activeTab === 'requests' && <motion.div layoutId="tab-highlight" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />}
        </button>
      </div>

      {/* List Area */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col items-center px-6 mt-10">
        <div className="w-full max-w-6xl flex-1 overflow-y-auto custom-scrollbar pr-2 pb-32">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-44 bg-slate-900/40 rounded-3xl animate-pulse border border-white/5" />
                ))}
              </motion.div>
            ) : activeTab === 'trips' ? (
              <motion.div 
                key="trips-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {trips.length === 0 ? (
                  <EmptyState icon={<Plane size={56} />} title="Silence in the Void" desc="You have not initialized any trajectories yet." />
                ) : (
                  trips.map((trip) => (
                    <div key={trip.id} className="trip-card-item">
                      <TripCard trip={trip} onClick={() => onTripClick(trip.id)} />
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="requests-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {requests.length === 0 ? (
                  <EmptyState icon={<Signal size={56} />} title="Zero Activity" desc="No incoming signals detected from fellow travelers." />
                ) : (
                  // Group requests by trip for a better UX
                  Array.from(new Set(requests.map(r => r.tripId))).map(tripId => {
                    const tripRequests = requests.filter(r => r.tripId === tripId);
                    const trip = trips.find(t => t.id === tripId) || { destination: 'Unknown Odyssey', startLocation: 'Earth' };
                    return (
                      <RequestGroup 
                        key={tripId}
                        tripName={`${trip.startLocation} → ${trip.destination}`}
                        requests={tripRequests}
                        onAction={handleAction}
                      />
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-3xl border shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex items-center gap-6 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : notification.type === 'info'
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              {notification.type === 'success' ? <Check size={20} /> : notification.type === 'info' ? <Bell size={20} /> : <X size={20} />}
            </div>
            <div>
              <p className="text-[11px] font-official font-bold uppercase tracking-[0.4em]">{notification.message}</p>
              <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] mt-1">System Manifest Updated</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

const TripCard = ({ trip, onClick }: { trip: TripSummary, onClick: () => void }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 cursor-pointer hover:border-white/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] transition-all overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <Globe size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
            <Activity size={12} className="animate-pulse" />
            Trajectory Node
          </span>
          <div className="flex items-center gap-6">
             <h3 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter leading-none">{trip.destination}</h3>
             <ArrowRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all" />
          </div>
          <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-3 font-official">Departs: {trip.startLocation}</p>
        </div>

        <div className="h-16 w-px bg-white/5 hidden md:block" />

        <div className="grid grid-cols-2 gap-12 text-center md:text-left">
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-2 font-bold">Temporal Window</p>
            <p className="text-sm font-official text-white/60 tracking-wider">{trip.startDate} — {trip.endDate}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-2 font-bold">Occupancy</p>
            <p className={`text-sm font-official font-bold tracking-widest ${trip.availableSeats > 0 ? 'text-teal-400' : 'text-red-400'}`}>
              {trip.availableSeats} / {trip.seats} Vacant
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border shadow-2xl transition-all ${
          trip.status === 'active' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
          trip.status === 'full' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          'bg-slate-800/80 border-white/10 text-white/40'
        }`}>
          {trip.status}
        </div>
      </div>
    </motion.div>
  );
};

// Using React.FC to handle special props like 'key' correctly in TypeScript
const RequestGroup: React.FC<RequestGroupProps> = ({ tripName, requests, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: isExpanded ? 'auto' : 0,
        opacity: isExpanded ? 1 : 0,
        duration: 0.6,
        ease: "power3.inOut"
      });
    }
  }, [isExpanded]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Signal size={20} className={requests.some(r => r.status === 'pending') ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-xl font-display font-bold text-white uppercase tracking-tight">{tripName}</h4>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-official">{requests.length} Total Requests</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-widest">
            {requests.filter(r => r.status === 'pending').length} Pending
          </div>
          {isExpanded ? <ChevronUp size={24} className="text-white/20" /> : <ChevronDown size={24} className="text-white/20" />}
        </div>
      </div>
      
      <div ref={contentRef} className="overflow-hidden">
        <div className="p-8 space-y-6">
          {requests.map(req => (
            <RequestCard key={req.id} request={req} onAction={onAction} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Using React.FC to handle special props like 'key' correctly in TypeScript
const RequestCard: React.FC<RequestCardProps> = ({ request, onAction }) => {
  return (
    <motion.div 
      layout
      className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-center gap-8">
        <div className="relative">
          <img src={request.user.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover border border-white/10" alt="Requester" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <UserCheck size={10} className="text-white" />
          </div>
        </div>
        <div>
          <h4 className="text-xl font-display font-bold text-white uppercase tracking-tighter leading-none mb-2">{request.user.name}</h4>
          <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-official">{request.user.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10">Signal Active</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-4">
        <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold font-official">{request.timestamp}</span>
        
        <AnimatePresence mode="wait">
          {request.status === 'pending' ? (
            <motion.div key="actions" className="flex gap-4">
              <button 
                onClick={() => onAction(request.id, 'rejected')}
                className="w-14 h-14 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center group"
                title="Revoke Signal"
              >
                <UserX size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={() => onAction(request.id, 'approved')}
                className="h-14 px-10 rounded-2xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all flex items-center gap-4 group shadow-[0_10px_30px_rgba(45,212,191,0.2)]"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Authorize</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-10 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] border shadow-2xl ${
                request.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              Manifest {request.status}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 opacity-40">
    <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-white/40 animate-pulse">
      {icon}
    </div>
    <div className="space-y-3">
      <h3 className="text-2xl font-display font-bold text-white uppercase tracking-[0.3em] leading-none">{title}</h3>
      <p className="text-[11px] font-official uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default MyTripsPage;
