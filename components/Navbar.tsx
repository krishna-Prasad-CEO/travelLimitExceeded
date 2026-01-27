
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, Map, Camera, Layout, Menu, X, User, Plus, Briefcase, Search } from 'lucide-react';
import { gsap } from 'gsap';

interface NavbarProps {
  onLoginClick: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onCreateTripClick: () => void;
  onMyTripsClick: () => void;
  onExploreClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onLoginClick, 
  isAuthenticated, 
  onLogout, 
  onCreateTripClick, 
  onMyTripsClick,
  onExploreClick
}) => {
  const [activeSection, setActiveSection] = useState<'plan' | 'discover' | 'trip'>('plan');
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'planner', key: 'plan', label: 'Plan', icon: Layout },
    { id: 'photo-trip', key: 'discover', label: 'Discover', icon: Camera },
    { id: 'results', key: 'trip', label: 'Trip', icon: Map },
  ] as const;

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.5, ease: "power4.out" }
      );
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      const resultsEl = document.getElementById('results');
      setHasPlan(!!resultsEl);
      const planner = document.getElementById('planner');
      const discover = document.getElementById('photo-trip');
      const trip = document.getElementById('results');
      const triggerPoint = window.innerHeight / 2;
      if (trip && scrollY + triggerPoint >= trip.offsetTop) {
        setActiveSection('trip');
      } else if (discover && scrollY + triggerPoint >= discover.offsetTop) {
        setActiveSection('discover');
      } else {
        setActiveSection('plan');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const activeButton = navRef.current?.querySelector(`[data-key="${activeSection}"]`) as HTMLElement;
    if (activeButton && pillRef.current) {
      gsap.to(pillRef.current, {
        x: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        duration: 0.7,
        ease: "expo.out",
        opacity: 1
      });
    }
  }, [activeSection, hasPlan, isScrolled]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      window.scrollTo({
        top: el.offsetTop - offset,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    } else if (id === 'results' && !hasPlan) {
      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav 
        ref={containerRef}
        className="fixed top-0 left-0 right-0 z-[120] hidden md:flex h-32 justify-center transition-all duration-700 pointer-events-none"
        aria-label="Main Navigation"
      >
        <div 
          ref={navRef}
          className={`relative flex items-center p-1.5 rounded-full transition-all duration-700 ease-in-out pointer-events-auto h-16 my-auto ${
            isScrolled 
              ? 'bg-slate-950/40 backdrop-blur-2xl border border-white/5 shadow-2xl' 
              : 'bg-transparent border-transparent'
          }`}
        >
          <div 
            ref={pillRef}
            className={`absolute h-[calc(100%-0.75rem)] bg-white/10 rounded-full z-0 pointer-events-none transition-opacity duration-500 ${
              isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md animate-pulse" />
          </div>

          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-3 px-6 h-full cursor-pointer group z-10 mr-4 transition-all ${
              isScrolled ? 'border-r border-white/5' : ''
            }`}
          >
            <Compass 
              size={18} 
              className={`transition-all duration-700 ${
                isScrolled ? 'text-white' : 'text-white/60 group-hover:text-white'
              } group-hover:rotate-12`} 
            />
            <span className={`text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-700 ${
              isScrolled ? 'text-white' : 'text-white/40 group-hover:text-white'
            }`}>
              Aetheria
            </span>
          </button>

          <div className="flex items-center h-full">
            <button
              onClick={onExploreClick}
              className="relative px-8 h-full rounded-full text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-500 z-10 text-white/40 hover:text-white flex items-center gap-2"
            >
              <Search size={14} />
              Explore
            </button>
            {sections.map((section) => {
              const isActive = activeSection === section.key;
              const isDisabled = section.key === 'trip' && !hasPlan;

              return (
                <button
                  key={section.key}
                  data-key={section.key}
                  onClick={() => scrollTo(section.id)}
                  disabled={isDisabled}
                  className={`relative px-8 h-full rounded-full text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-500 z-10 ${
                    isActive 
                      ? 'text-white' 
                      : isDisabled 
                        ? 'text-white/10 cursor-not-allowed' 
                        : 'text-white/40 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {section.label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-dot"
                        className="w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center h-full ml-2 border-l border-white/5">
            {isAuthenticated && (
              <button
                onClick={onMyTripsClick}
                className="flex items-center gap-2 px-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors z-10"
              >
                <Briefcase size={14} />
                My Trips
              </button>
            )}
            <button
              onClick={onCreateTripClick}
              className="flex items-center gap-2 px-6 text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-400 hover:text-indigo-300 transition-colors z-10"
            >
              <Plus size={14} />
              Create
            </button>
            <button
              onClick={isAuthenticated ? onLogout : onLoginClick}
              className="flex items-center gap-3 px-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors z-10"
            >
              <User size={16} className={isAuthenticated ? "text-teal-400" : ""} />
              {isAuthenticated ? "Logout" : "Sign In"}
            </button>
          </div>
        </div>
      </nav>

      <nav className="fixed top-0 left-0 right-0 z-[120] md:hidden h-24 p-6 flex justify-between items-center transition-all duration-700 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Compass size={20} className="text-white" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">Aetheria</span>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={onExploreClick}
            className="p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/40"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={onCreateTripClick}
            className="p-3 rounded-full bg-indigo-500/20 border border-indigo-500/20 text-indigo-400"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[130] pointer-events-auto"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-[3rem] z-[140] p-12 space-y-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4" />
                <div className="space-y-4">
                  <button
                    onClick={() => { onExploreClick(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl text-white/40"
                  >
                    <Search size={24} />
                    <span className="text-sm font-bold tracking-[0.2em] uppercase">Explore</span>
                  </button>
                  {sections.map((section) => {
                    const isActive = activeSection === section.key;
                    const isDisabled = section.key === 'trip' && !hasPlan;
                    return (
                      <button
                        key={section.key}
                        onClick={() => scrollTo(section.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all ${
                          isActive 
                            ? 'bg-white/5 text-white' 
                            : isDisabled ? 'opacity-20' : 'text-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <section.icon size={24} className={isActive ? 'text-indigo-400' : ''} />
                          <span className="text-sm font-bold tracking-[0.2em] uppercase">{section.label}</span>
                        </div>
                        {isActive && <Sparkles size={16} className="text-indigo-400" />}
                      </button>
                    );
                  })}
                  {isAuthenticated && (
                    <button
                      onClick={() => { onMyTripsClick(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-6 p-6 rounded-3xl text-white/40"
                    >
                      <Briefcase size={24} />
                      <span className="text-sm font-bold tracking-[0.2em] uppercase">My Odysseys</span>
                    </button>
                  )}
                  <button
                    onClick={onCreateTripClick}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl text-indigo-400 bg-indigo-500/10"
                  >
                    <Plus size={24} />
                    <span className="text-sm font-bold tracking-[0.2em] uppercase">Create Odyssey</span>
                  </button>
                  <button
                    onClick={isAuthenticated ? onLogout : onLoginClick}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl text-white/40 hover:text-white transition-all"
                  >
                    <User size={24} className={isAuthenticated ? "text-teal-400" : ""} />
                    <span className="text-sm font-bold tracking-[0.2em] uppercase">{isAuthenticated ? "Logout" : "Sign In"}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
