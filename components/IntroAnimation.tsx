
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface IntroAnimationProps {
  onComplete: () => void;
}

const MistAtmosphere = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#2dd4bf"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.15}
      />
    </Points>
  );
};

const EnergyStreak = ({ streakRef }: { streakRef: React.RefObject<THREE.Mesh> }) => {
  return (
    // @ts-ignore
    <mesh ref={streakRef} position={[-20, 0, 0]} scale={[1, 1, 1]}>
      <planeGeometry args={[10, 0.02]} />
      <meshBasicMaterial 
        color="#5eead4" 
        transparent 
        opacity={0} 
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const MasterSequence = ({ onSequenceEnd, onLettersStart }: { onSequenceEnd: () => void; onLettersStart: () => void }) => {
  const { camera } = useThree();
  const streakRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!streakRef.current) return;

    const tl = gsap.timeline({
      repeat: 0,
      onComplete: onSequenceEnd
    });

    gsap.set(camera.position, { z: 5 });

    tl.to(streakRef.current.material, {
      opacity: 0.8,
      duration: 0.2,
    }, 0.8);

    tl.to(streakRef.current.position, {
      x: 20,
      duration: 0.7,
      ease: "power2.inOut",
      onStart: () => {
        setTimeout(onLettersStart, 200);
      }
    }, 0.8);

    tl.to(streakRef.current.material, {
      opacity: 0,
      duration: 0.3,
    }, 1.4);

    return () => { tl.kill(); };
  }, [camera, onSequenceEnd, onLettersStart]);

  return (
    // @ts-ignore
    <group>
      <ambientLight intensity={0.5} />
      <MistAtmosphere />
      <EnergyStreak streakRef={streakRef} />
    </group>
  );
};

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'air' | 'igniting' | 'assembling' | 'settling'>('air');
  const letters = "TLE".split("");

  const handleSequenceEnd = () => {
    setPhase('settling');
    setTimeout(onComplete, 800);
  };

  const handleLettersStart = () => {
    setPhase('assembling');
  };

  return (
    <motion.div
      {...({
        initial: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 1, ease: "easeInOut" }
      } as any)}
      className="fixed inset-0 z-[500] bg-[#020617] overflow-hidden select-none pointer-events-none"
    >
      <div className="absolute inset-0 bg-[#020617]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.02)_0%,transparent_80%)]" />

      <div className="absolute inset-0 z-10">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
          <MasterSequence 
            onLettersStart={handleLettersStart}
            onSequenceEnd={handleSequenceEnd} 
          />
        </Canvas>
      </div>

      <div className="relative z-20 w-full h-full flex items-center justify-center">
        <div className="flex gap-[0.2em] md:gap-[0.4em]">
          <AnimatePresence>
            {(phase === 'assembling' || phase === 'settling') && letters.map((letter, i) => (
              <motion.span
                key={i}
                {...({
                  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
                  animate: { 
                    opacity: phase === 'settling' ? 0.9 : 1, 
                    y: 0, 
                    filter: 'blur(0px)',
                    textShadow: phase === 'settling' ? '0 0 20px rgba(45,212,191,0)' : '0 0 20px rgba(45,212,191,0.5)'
                  },
                  transition: { 
                    duration: 0.8, 
                    delay: i * 0.08,
                    ease: "power2.out"
                  }
                } as any)}
                className="text-white text-4xl md:text-7xl font-display font-bold tracking-widest uppercase italic"
              >
                {letter}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {phase === 'settling' && (
          <motion.div
            {...({
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 1 }
            } as any)}
            className="absolute inset-0 bg-white/[0.01] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntroAnimation;
