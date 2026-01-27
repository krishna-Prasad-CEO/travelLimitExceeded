
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero';
import TripPlanner from './components/TripPlanner';
import PhotoToTrip from './components/PhotoToTrip';
import Navbar from './components/Navbar';
import ItineraryView from './components/ItineraryView';
import BookingFlow from './components/BookingFlow';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CreateTripPage from './components/CreateTripPage';
import TripDetailsPage from './components/TripDetailsPage';
import MyTripsPage from './components/MyTripsPage';
import ExploreTripsPage from './components/ExploreTripsPage';
import { TripPlan } from './types';
import { supabase } from './supabaseClient';

gsap.registerPlugin(ScrollTrigger);

const LOADING_MESSAGES = [
  "Planning your journey...",
  "Charting the optimal route...",
  "Securing your destinations...",
  "Aligning with your travel intent...",
  "Finalizing your manifest...",
  "Preparing for departure...",
  "Almost there..."
];

const Airplane = ({ progress }: { progress: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  const curve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 2, -5),
      new THREE.Vector3(-5, 3, 0),
      new THREE.Vector3(0, 2.5, 2),
      new THREE.Vector3(5, 3, 0),
      new THREE.Vector3(10, 2, -5),
    ]);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.elapsedTime * 0.05) % 1;
    const pos = curve.getPointAt(t);
    const lookAt = curve.getPointAt((t + 0.01) % 1);
    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(lookAt);
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <group ref={meshRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.03, 0.6, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.8, 0.01, 0.2]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.1, -0.25]}>
        <boxGeometry args={[0.01, 0.15, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};

const Continents = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.z += 0.01;
      if (groupRef.current.position.z > 10) groupRef.current.position.z = -10;
    }
  });

  return (
    <group ref={groupRef} position={[0, -5, 0]}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 40
          ]}>
            <sphereGeometry args={[Math.random() * 3 + 1, 16, 16]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? "#111827" : "#0f172a"} 
              transparent 
              opacity={0.3} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const FlightLoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="fixed inset-0 z-[300] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <Canvas dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={35} />
              <color attach="background" args={['#020617']} />
              <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
              <Airplane progress={0} />
              <Line
                points={[
                  [-10, 2, -5],
                  [-5, 3, 0],
                  [0, 2.5, 2],
                  [5, 3, 0],
                  [10, 2, -5]
                ]}
                color="#4f46e5"
                lineWidth={1}
                transparent
                opacity={0.2}
              />
              <Continents />
              <ambientLight intensity={0.2} />
            </Canvas>
          </div>

          <div className="relative z-10 mt-auto pb-32 flex flex-col items-center gap-8 pointer-events-none">
            <div className="h-12 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="text-sm md:text-base font-official font-bold text-slate-400 tracking-[0.4em] uppercase text-center"
                >
                  {LOADING_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="w-64 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Persist session and listen for auth changes
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setShowMyTrips(false);
    setShowCreateTrip(false);
  };

  const handleMyTripsClick = () => {
    if (isAuthenticated) {
      setShowMyTrips(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleCreateTripClick = () => {
    if (isAuthenticated) {
      setShowCreateTrip(true);
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div ref={scrollRef} className="relative w-full min-h-screen selection:bg-indigo-500/30 bg-[#020617] overflow-x-hidden antialiased">
      
      <Navbar 
        onLoginClick={() => setShowLogin(true)} 
        isAuthenticated={isAuthenticated} 
        onLogout={handleLogout}
        onCreateTripClick={handleCreateTripClick}
        onMyTripsClick={handleMyTripsClick}
        onExploreClick={() => setShowExplore(true)}
      />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[110] origin-left shadow-[0_0_15px_rgba(79,70,229,0.4)]"
        style={{ scaleX }}
      />

      <main className="relative z-10">
        <Hero onStart={() => document.getElementById('discovery-hub')?.scrollIntoView({ behavior: 'smooth' })} />
        
        <section id="discovery-hub" className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-48 md:space-y-64 pb-48">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="space-y-48 md:space-y-64"
          >
            <div id="planner" className="scroll-mt-32">
              <TripPlanner 
                setPlan={setActivePlan} 
                setLoading={setIsLoading} 
              />
            </div>

            <div className="flex items-center justify-center gap-12 opacity-10">
              <div className="h-px flex-1 bg-white" />
              <span className="text-[10px] font-official font-bold uppercase tracking-[0.8em] text-white select-none">OR VISUAL INQUIRY</span>
              <div className="h-px flex-1 bg-white" />
            </div>

            <div id="photo-trip" className="scroll-mt-32">
              <PhotoToTrip 
                setPlan={setActivePlan} 
                setLoading={setIsLoading} 
              />
            </div>
          </motion.div>
        </section>

        <AnimatePresence>
          {activePlan && (
            <motion.div 
              key="itinerary-results"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              id="results" 
              className="scroll-mt-24"
            >
              <ItineraryView 
                plan={activePlan} 
                onBook={() => setIsBooking(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-48 px-12 border-t border-white/5 text-center bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col items-center gap-8">
             <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white font-bold border border-white/10 shadow-xl">
                <span className="text-2xl">T</span>
             </div>
             <span className="text-3xl font-display font-bold tracking-[0.3em] uppercase">TLE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[11px] font-official font-bold tracking-[0.4em] uppercase text-white/20">
            <a href="#" className="hover:text-white transition-colors">Safety Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Neural Assets</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Lexicon</a>
          </div>
          <p className="text-[10px] text-white/5 uppercase tracking-[0.6em] font-official font-bold pt-8">
            Engine v2.5.0-Final • Integrated Future Experience • © 2025
          </p>
        </div>
      </footer>

      <FlightLoadingOverlay isLoading={isLoading} />

      <AnimatePresence>
        {isBooking && activePlan && (
          <BookingFlow 
            plan={activePlan} 
            onClose={() => setIsBooking(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
          >
            <LoginPage 
              onLoginSuccess={() => setShowLogin(false)} 
              onRegisterClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
              onClose={() => setShowLogin(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
          >
            <RegisterPage 
              onRegisterSuccess={() => setShowRegister(false)}
              onLoginClick={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
              onClose={() => setShowRegister(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
          >
            <CreateTripPage 
              onClose={() => setShowCreateTrip(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMyTrips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
          >
            <MyTripsPage 
              onTripClick={(id) => {
                setShowMyTrips(false);
                setSelectedTripId(id);
              }}
              onClose={() => setShowMyTrips(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExplore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400]"
          >
            <ExploreTripsPage 
              onTripClick={(id) => {
                setShowExplore(false);
                setSelectedTripId(id);
              }}
              onClose={() => setShowExplore(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTripId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600]"
          >
            <TripDetailsPage 
              tripId={selectedTripId}
              isAuthenticated={isAuthenticated}
              onLoginRequired={() => {
                setSelectedTripId(null);
                setShowLogin(true);
              }}
              onClose={() => setSelectedTripId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
