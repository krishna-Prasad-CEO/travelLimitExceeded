
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  X, Search, SlidersHorizontal, MapPin, 
  Calendar, Gauge, Users, ArrowRight, 
  Loader2, Sparkles, Globe, Plane,
  TrendingUp, Compass
} from 'lucide-react';
import { TripSummary } from '../types';

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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        // Mocking API call: GET /api/trips
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
            speed: 1.2,
            seats: 4,
            availableSeats: 2,
            status: 'active'
          },
          {
            id: 'trip-3',
            startLocation: 'Berlin',
            destination: 'Mars Habitat Alpha',
            startDate: '2026-03-20',
            endDate: '2026-09-10',
            speed: 8.5,
            seats: 12,
            availableSeats: 1,
            status: 'full'
          },
          {
            id: 'trip-4',
            startLocation: 'Paris',
            destination: 'Santorini',
            startDate: '2025-07-05',
            endDate: '2025-07-12',
            speed: 0.8,
            seats: 2,
            availableSeats: 1,
            status: 'active'
          },
          {
            id: 'trip-5',
            startLocation: 'New York',
            destination: 'The Moon (Base II)',
            startDate: '2025-11-11',
            endDate: '2025-11-20',
            speed: 5.0,
            seats: 6,
            availableSeats: 0,
            status: 'full'
          },
          {
            id: 'trip-6',
            startLocation: 'Singapore',
            destination: 'Kyoto',
            startDate: '2025-10-01',
            endDate: '2025-10-05',
            speed: 2.0,
            seats: 10,
            availableSeats: 7,
            status: 'active'
          }
        ];
        setTrips(mockTrips);
        setFilteredTrips(mockTrips);
      } catch (error) {
        console.error('Failed to sync global manifest', error);
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

    if (activeFilter === 'available') {
      result = result.filter(t => t.availableSeats > 0);
    } else if (activeFilter === 'high-speed') {
      result = result.filter(t => t.speed >= 3.0);
    }

    setFilteredTrips(result);
  }, [searchQuery, activeFilter, trips]);

  // GSAP Entrance
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".explore-header", { y: -30, opacity: 0, duration: 1, ease: "expo.out" });
        gsap.from(".filter-bar", { y: 20, opacity: 0, duration: 0.8, delay: 0.3, ease: "power2.out" });
        gsap.from(".explore-card", {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.5,
          ease: "back.out(1.2)"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[500] bg-[#020617] flex flex-col overflow-hidden">
      {/* Background stardust grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)]" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      {/* Header */}
      <div className="explore-header relative z-10 p-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Globe size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest leading-none">Global Odyssey</h1>
            <p className="text-[10px] text-white/30 font-official font-bold uppercase tracking-[0.4em] mt-1">Discover journeys waiting for you</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-white/5"
        >
          <X size={24} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar relative z-10 px-8 md:px-12 py-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors" />
          <input 
            type="text" 
            placeholder="LOCATE TARGET NODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm font-official text-white uppercase tracking-widest focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-white/5"
          />
        </div>

        <div className="flex items-center gap-3 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
          {[
            { id: 'all', label: 'All Signals' },
            { id: 'available', label: 'Vacancies' },
            { id: 'high-speed', label: 'Velocity+' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.3em] transition-all ${
                activeFilter === f.id 
                  ? 'bg-white text-slate-950 shadow-xl' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 pb-32 no-jump">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}
            </motion.div>
          ) : filteredTrips.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 opacity-20 gap-8"
            >
              <Plane size={64} className="animate-bounce" />
              <div className="text-center">
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest">No Signals Captured</h3>
                <p className="text-[10px] font-official uppercase tracking-[0.4em] mt-2">Adjust your frequency filters</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredTrips.map((trip) => (
                <ExploreCard key={trip.id} trip={trip} onClick={() => onTripClick(trip.id)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

// Fix: Use React.FC to properly handle React-specific props like 'key' and provide better type safety
const ExploreCard: React.FC<{ trip: TripSummary, onClick: () => void }> = ({ trip, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="explore-card group relative bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer hover:border-teal-500/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] transition-all overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">Node Connection</span>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter leading-none">{trip.destination}</h3>
              {trip.speed > 5 && <TrendingUp size={14} className="text-teal-400" />}
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${
            trip.status === 'full' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
          }`}>
            {trip.status}
          </div>
        </div>

        {/* Mini Route Preview */}
        <div className="relative h-16 w-full flex items-center justify-center">
          <svg className="w-full h-full opacity-40" viewBox="0 0 300 60">
            <path 
              d="M20 30 Q 150 -10 280 30" 
              fill="none" 
              stroke={isHovered ? "#2dd4bf" : "#ffffff"} 
              strokeWidth="1" 
              strokeDasharray="4,4"
              className="transition-colors duration-500"
            />
            <circle cx="20" cy="30" r="3" fill="#6366f1" />
            <motion.circle 
              cx="280" cy="30" r="3" fill="#2dd4bf"
              animate={isHovered ? { r: [3, 6, 3], opacity: [1, 0.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-[8px] font-official text-white/10 uppercase tracking-[0.8em]">{trip.startLocation}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
               <Calendar size={12} />
               <span className="text-[8px] font-bold uppercase tracking-widest">Time Node</span>
            </div>
            <p className="text-[10px] font-official text-white/60 tracking-wider">{trip.startDate}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/30">
               <Gauge size={12} />
               <span className="text-[8px] font-bold uppercase tracking-widest">Velocity</span>
            </div>
            <p className="text-[10px] font-official text-teal-400 font-bold tracking-wider">{trip.speed}x SCALE</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-8 mt-auto">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2 text-white/20">
             <Users size={14} />
             <span className="text-[9px] font-bold uppercase tracking-widest">{trip.availableSeats} of {trip.seats} Vacant</span>
           </div>
           {/* Mini progress bar */}
           <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(trip.seats - trip.availableSeats) / trip.seats * 100}%` }}
                className="h-full bg-teal-500"
              />
           </div>
        </div>
        
        <button 
          className="group/btn w-full h-14 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white hover:bg-white hover:text-slate-950 transition-all duration-500 shadow-2xl"
        >
          Inspect Manifest
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ExploreTripsPage;
