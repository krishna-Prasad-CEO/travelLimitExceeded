
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const TrajectoryNodes = ({ count = 12 }: { count?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0005;
  });
  return (
    // @ts-ignore
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const pos = new THREE.Vector3().setFromSphericalCoords(
          12,
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2
        );
        // Fix: Added key prop to correctly handle mapped components in React
        return <FloatingPoint key={i} position={pos} delay={i * 0.5} />;
      })}
    </group>
  );
};

// Fix: Use React.FC to define component and handle 'key' prop implicitly, and fix THREE.Vector3 type mapping
const FloatingPoint: React.FC<{ position: THREE.Vector3, delay: number }> = ({ position, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const scale = 0.8 + Math.sin(state.clock.elapsedTime * 1.5 + delay) * 0.2;
    meshRef.current.scale.set(scale, scale, scale);
    // @ts-ignore
    meshRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.1;
  });
  return (
    // @ts-ignore
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color="#5eead4" transparent opacity={0.3} />
    </mesh>
  );
};

const MORPH_TEXTS = [
  "You don’t plan trips. Trips plan themselves.",
  "See a place. Upload a photo. You’re already there.",
  "Travel is the only thing you buy that makes you richer.",
  "Experience the future of discovery."
];

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [isReady, setIsReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % MORPH_TEXTS.length);
    }, 5000);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Updated to a much more cinematic and high-resolution futuristic landscape
  const heroImage = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop";

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 no-jump">
      <motion.div 
        {...({
          initial: { scale: 1.1, opacity: 0 },
          animate: { 
            scale: 1, 
            opacity: 1,
            x: mousePos.x * -0.5,
            y: mousePos.y * -0.5
          },
          transition: { 
            opacity: { duration: 2, ease: "easeOut" },
            scale: { duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }
          }
        } as any)}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <img src={heroImage} alt="Aetheria Cinematic Landscape" className="w-full h-full object-cover brightness-[0.7]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)] pointer-events-none" />
      </motion.div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />
          <TrajectoryNodes />
          <Stars radius={100} depth={50} count={1200} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-20 text-center px-6 max-w-6xl">
        <AnimatePresence>
          {isReady && (
            <motion.div
              {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 1.5 }
              } as any)}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/70 text-[10px] font-bold tracking-[0.4em] uppercase shadow-2xl">
                <Sparkles size={14} className="text-teal-400" />
                Aetheria Trajectory
              </div>
              
              {/* Stable height container to prevent layout jumping during morphing */}
              <div className="h-[180px] md:h-[240px] lg:h-[300px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={textIndex}
                    {...({
                      initial: { opacity: 0, filter: 'blur(20px)', y: 20 },
                      animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
                      exit: { opacity: 0, filter: 'blur(20px)', y: -20 },
                      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
                    } as any)}
                    className="text-4xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight text-white leading-tight drop-shadow-2xl px-4"
                  >
                    {MORPH_TEXTS[textIndex].split('. ').map((line, i) => (
                      <span key={i} className="block">
                        {i === 1 ? (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-indigo-300">
                            {line}
                          </span>
                        ) : line}
                      </span>
                    ))}
                  </motion.h1>
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                <button
                  onClick={onStart}
                  className="group relative px-12 py-5 bg-white text-slate-950 rounded-full font-bold text-sm tracking-[0.2em] overflow-hidden transition-all hover:pr-16 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] uppercase"
                >
                  <span className="relative z-10">Start Your Story</span>
                  <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={20} />
                </button>
                
                <button 
                  onClick={() => document.getElementById('discovery-hub')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 text-white/60 hover:text-white text-xs font-bold tracking-[0.3em] uppercase transition-all flex items-center gap-3"
                >
                  <span>Our Process</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        {...({
          initial: { opacity: 0 },
          animate: { opacity: 0.6 },
          transition: { delay: 2.5 }
        } as any)}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-bold">Scroll to Plan</span>
        <motion.div 
          {...({
            animate: { y: [0, 8, 0] },
            transition: { duration: 2.5, repeat: Infinity }
          } as any)}
        >
          <ChevronDown size={24} className="text-white/40" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
